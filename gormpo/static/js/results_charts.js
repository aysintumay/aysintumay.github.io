// Interactive bar-panel charts: one button per panel; the selected panel grows (wider and taller) and shows
// values, error bars and labels, the others shrink and fade. Used for the medical results (Table 3) and the
// sparse D4RL results (Table 1, MOBILE row).
(function () {
  const GRAY = "#949494";
  const DENSITY = [  // same colours as the paper (seaborn "colorblind")
    {name: "KDE", color: "#d55e00"},
    {name: "VAE", color: "#0173b2"},
    {name: "RealNVP", color: "#ca9161"},
    {name: "DDPM", color: "#cc78bc"},
    {name: "NeuralODE", color: "#56b4e9"},
  ];

  const CHARTS = {
    // Table 3: medical dataset, mean ± std over 10 seeds and 1000 evaluation episodes
    "medical-metrics": {
      methods: [...["SPOT", "MBPO", "MOBILE", "GMB-TRPO", "CORMPO"].map(n => ({name: n, color: GRAY})),
                ...DENSITY.map(d => ({name: "GORMPO-" + d.name, short: d.name, color: d.color}))],
      groups: [["Baselines", 0, 5], ["GORMPO", 5, 10]],
      legend: [["Baselines", GRAY], ...DENSITY.map(d => ["GORMPO-" + d.name, d.color])],
      digits: 3,
      panels: [
        {label: "Reward", arrow: "↑", better: "higher",
         v: [[0.462, 0.124], [0.596, 0.121], [0.589, 0.115], [0.883, 0.119], [0.644, 0.127],
             [0.539, 0.120], [0.336, 0.123], [0.700, 0.115], [0.516, 0.129], [0.708, 0.124]]},
        {label: "Weaning score", arrow: "↑", better: "higher",
         v: [[0.196, 0.008], [0.117, 0.005], [-0.434, 0.009], [0.064, 0.011], [0.064, 0.005],
             [0.213, 0.006], [0.220, 0.010], [0.225, 0.009], [0.145, 0.008], [0.037, 0.005]]},
        {label: "Action change penalty", arrow: "↓", better: "lower",
         v: [[0.039, 0.013], [0.589, 0.057], [3.485, 0.065], [0.620, 0.028], [0.026, 0.008],
             [1.159, 0.060], [0.329, 0.032], [1.820, 0.081], [0.415, 0.037], [0.308, 0.042]]},
      ],
    },
    // Table 1: SPOT and MBPO baselines + the MOBILE row; sparse D4RL medium-expert, normalized return, mean ± std over 3 seeds
    "d4rl-results": {
      methods: [...["SPOT", "MBPO", "MOBILE"].map(n => ({name: n, color: GRAY})),
                ...DENSITY.map(d => ({name: "MOBILE + GORMPO-" + d.name, short: d.name, color: d.color}))],
      groups: [["Baselines", 0, 3], ["MOBILE + GORMPO", 3, 8]],
      legend: [["Baselines", GRAY], ...DENSITY.map(d => ["GORMPO-" + d.name, d.color])],
      digits: 1,
      panels: [
        {label: "HalfCheetah", better: "higher",
         v: [[76.4, 3.22], [63.7, 8.23], [104.0, 1.63], [103.7, 1.70], [106.0, 0.54], [104.6, 1.18], [103.0, 1.44], [104.8, 0.35]]},
        {label: "Hopper", better: "higher",
         v: [[83.8, 23.3], [4.81, 3.18], [95.2, 24.5], [95.2, 30.0], [113.0, 0.53], [95.5, 29.8], [113.0, 0.62], [112.9, 0.62]]},
        {label: "Walker2d", better: "higher",
         v: [[113.5, 0.54], [3.19, 1.21], [116.0, 2.44], [117.0, 1.32], [117.0, 4.34], [118.0, 2.66], [117.0, 4.45], [49.2, 40.72]]},
      ],
    },
  };

  const NS = "http://www.w3.org/2000/svg";
  const H_BIG = 450, H_SMALL = 230;  // expanded panel is taller as well as wider

  function el(tag, attrs, parent, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  function niceStep(span, n) {
    const raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw)));
    return [1, 2, 2.5, 5, 10].map(m => m * p).find(s => span / s <= n);
  }

  function splitLabel(s) {
    if (s === "GMB-TRPO") return ["GMB-", "TRPO"];
    if (s === "NeuralODE") return ["Neural", "ODE"];
    return [s, ""];
  }

  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);  // easeOutCubic
  const GROW = 520, STAGGER = 55;  // bar growth duration and per-bar delay (ms)

  // bar with rounded corners on the end away from the baseline
  function barPath(x, w, yBase, yEnd, r) {
    const up = yEnd <= yBase, h = Math.abs(yBase - yEnd);
    r = Math.min(r, w / 2, h);
    if (up) return `M${x} ${yBase}V${yEnd + r}Q${x} ${yEnd} ${x + r} ${yEnd}H${x + w - r}Q${x + w} ${yEnd} ${x + w} ${yEnd + r}V${yBase}Z`;
    return `M${x} ${yBase}V${yEnd - r}Q${x} ${yEnd} ${x + r} ${yEnd}H${x + w - r}Q${x + w} ${yEnd} ${x + w} ${yEnd - r}V${yBase}Z`;
  }

  function defs(svg) {
    const d = el("defs", {}, svg);
    // a white sheen laid over each bar (keeps the bar colour, adds depth)
    const g = el("linearGradient", {id: "bp-sheen", x1: 0, x2: 1, y1: 0, y2: 0}, d);
    el("stop", {offset: "0", "stop-color": "#fff", "stop-opacity": 0.28}, g);
    el("stop", {offset: "0.45", "stop-color": "#fff", "stop-opacity": 0.06}, g);
    el("stop", {offset: "1", "stop-color": "#000", "stop-opacity": 0.06}, g);
    const f = el("filter", {id: "bp-shadow", x: "-30%", y: "-10%", width: "160%", height: "130%"}, d);
    el("feDropShadow", {dx: 0, dy: 2, stdDeviation: 2.2, "flood-color": "#1d2230", "flood-opacity": 0.18}, f);
  }

  function draw(cfg, panel, m, big, t = 1e9) {
    const svg = panel.querySelector("svg");
    const W = Math.max(120, panel.clientWidth), H = big ? H_BIG : H_SMALL;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("height", H);
    svg.innerHTML = "";
    defs(svg);
    const n = cfg.methods.length;
    const M = {l: big ? 58 : 10, r: 10, t: big ? 40 : 14, b: big ? 88 : 14};
    const pw = W - M.l - M.r, ph = H - M.t - M.b;
    const hi = Math.max(0, ...m.v.map(([a, s]) => a + s)), lo = Math.min(0, ...m.v.map(([a, s]) => a - s));
    const pad = (hi - lo) * (big ? 0.1 : 0.04);
    const y0 = lo < 0 ? lo - pad : 0, y1 = hi + pad;
    const sy = v => M.t + ph - (v - y0) / (y1 - y0) * ph;
    const bw = pw / n;

    if (big) {  // grid + y ticks
      const step = niceStep(y1 - y0, 5);
      for (let v = Math.ceil(y0 / step) * step; v <= y1 + 1e-9; v += step) {
        if (Math.abs(v) > 1e-9) el("line", {x1: M.l, x2: W - M.r, y1: sy(v), y2: sy(v), class: "bp-grid"}, svg);
        el("text", {x: M.l - 8, y: sy(v) + 5, "text-anchor": "end", class: "bp-tick"}, svg, +v.toFixed(3));
      }
      // group brackets under the bar labels
      const y = M.t + ph + 52;
      cfg.groups.forEach(([name, a, b]) => {
        const x0 = M.l + bw * a + 6, x1 = M.l + bw * b - 6;
        el("path", {d: `M${x0} ${y - 5}V${y}H${x1}V${y - 5}`, class: "bp-bracket"}, svg);
        el("text", {x: (x0 + x1) / 2, y: y + 19, "text-anchor": "middle", class: "bp-group"}, svg, name);
      });
    }
    el("line", {x1: M.l, x2: W - M.r, y1: sy(0), y2: sy(0), class: "bp-zero"}, svg);

    const means = m.v.map(x => x[0]);
    const best = m.better === "higher" ? Math.max(...means) : Math.min(...means);

    cfg.methods.forEach((meth, i) => {
      const [mean, std] = m.v[i];
      const cx = M.l + bw * (i + 0.5), w = Math.min(bw * (big ? 0.62 : 0.7), big ? 64 : 40);
      const p = big ? ease((t - i * STAGGER) / GROW) : 1;   // growth progress of this bar
      const base = sy(0), end = base + (sy(mean) - base) * p;
      const g = el("g", {class: "bp-bar"}, svg);
      el("title", {}, g, `${meth.name}: ${mean.toFixed(cfg.digits)} ± ${std.toFixed(cfg.digits)}`);
      if (Math.abs(end - base) > 0.5) {
        const d = barPath(cx - w / 2, w, base, end, big ? 6 : 3);
        el("path", big ? {d, fill: meth.color, filter: "url(#bp-shadow)"} : {d, fill: meth.color}, g);
        el("path", {d, fill: "url(#bp-sheen)"}, g);
      }
      if (!big) return;
      const q = ease((t - i * STAGGER - GROW * 0.6) / 300);  // labels fade in as the bar lands
      g.setAttribute("style", `--q:${q}`);
      const ea = sy(mean + std), eb = sy(mean - std), cw = Math.min(8, w / 3);
      el("line", {x1: cx, x2: cx, y1: ea, y2: eb, class: "bp-err"}, g);  // ± std
      el("line", {x1: cx - cw, x2: cx + cw, y1: ea, y2: ea, class: "bp-err"}, g);
      el("line", {x1: cx - cw, x2: cx + cw, y1: eb, y2: eb, class: "bp-err"}, g);
      const vy = mean < 0 ? eb + 19 : ea - 8;
      el("text", {x: cx, y: vy, "text-anchor": "middle",
        class: "bp-val" + (mean === best ? " bp-best" : "")}, g, mean.toFixed(cfg.digits));
      if (mean === best)
        el("text", {x: cx, y: mean < 0 ? vy + 19 : vy - 19, "text-anchor": "middle", class: "bp-star",
          fill: meth.color}, g, "★");
      const [l1, l2] = splitLabel(meth.short || meth.name);
      const ly = M.t + ph + 21;
      el("text", {x: cx, y: ly, "text-anchor": "middle", class: "bp-lab"}, g, l1);
      if (l2) el("text", {x: cx, y: ly + 17, "text-anchor": "middle", class: "bp-lab"}, g, l2);
    });
  }

  function build(root, cfg) {
    const btns = root.querySelector(".bp-buttons"), wrap = root.querySelector(".bp-panels");
    const title = m => m.arrow ? `${m.label} ${m.arrow}` : m.label;
    let sel = 0;
    const panels = cfg.panels.map((m, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "bp-btn";
      b.textContent = title(m);
      b.addEventListener("click", () => { sel = i; update(); });
      btns.appendChild(b);
      const p = document.createElement("div");
      p.className = "bp-panel";
      const t = document.createElement("div");
      t.className = "bp-title";
      t.textContent = title(m);
      const st = document.createElement("div");
      st.className = "bp-sub";
      st.textContent = m.better === "lower" ? "lower is better" : "higher is better";
      p.append(t, st);
      p.appendChild(el("svg", {role: "img", "aria-label": `${m.label} per method`}));
      p.addEventListener("click", () => { if (sel !== i) { sel = i; update(); } });
      wrap.appendChild(p);
      return {b, p, m};
    });
    const lg = root.querySelector(".bp-legend");
    cfg.legend.forEach(([name, color]) => {
      const s = document.createElement("span");
      s.className = "bp-legend-item";
      const sw = document.createElement("i"); sw.style.background = color;
      s.append(sw, document.createTextNode(name));
      lg.appendChild(s);
    });

    let t0 = performance.now(), anim;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function redraw() {
      const t = still ? 1e9 : performance.now() - t0;
      panels.forEach((x, i) => draw(cfg, x.p, x.m, i === sel, t));
    }
    function animate() {  // redraw every frame while the panel widths change and the bars grow
      cancelAnimationFrame(anim);
      t0 = performance.now();
      const span = GROW + STAGGER * cfg.methods.length + 400;
      (function tick() { redraw(); if (performance.now() - t0 < span) anim = requestAnimationFrame(tick); })();
    }
    function update() {
      panels.forEach((x, i) => {
        x.b.classList.toggle("on", i === sel);
        x.b.setAttribute("aria-pressed", i === sel);
        x.p.classList.toggle("on", i === sel);
      });
      animate();
    }
    new ResizeObserver(redraw).observe(wrap);
    // first draw: animate when the chart scrolls into view
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); update(); } },
      {threshold: 0.3});
    io.observe(wrap);
    update();
  }

  function init() {
    for (const id in CHARTS) {
      const root = document.getElementById(id);
      if (root) build(root, CHARTS[id]);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
