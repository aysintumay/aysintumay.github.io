// Interactive OOD-detection scatter for the GORMPO project page.
// Data: Figure 7 of the paper (sparse medium-expert D4RL), one row per OOD distance:
// [distance, ROC AUC, accuracy, TPR, TNR]. Positives are ID samples:
// TPR = share of real (ID) samples kept, TNR = share of OOD samples flagged.
(function () {
  const DATA = {"halfcheetah":{"VAE":[[0.4,0.576,0.51,0.265,0.754],[0.6,0.818,0.687,0.501,0.873],[0.8,0.942,0.86,0.83,0.891],[1.0,0.992,0.937,0.999,0.875]],"KDE":[[0.4,0.995,0.5,0.0,1.0],[0.6,1.0,0.5,0.0,1.0],[0.8,1.0,0.5,0.0,1.0],[1.0,1.0,0.5,0.0,1.0]],"RealNVP":[[0.4,0.821,0.509,1.0,0.018],[0.6,0.908,0.507,1.0,0.015],[0.8,0.985,0.523,1.0,0.046],[1.0,0.958,0.501,1.0,0.003]],"NeuralODE":[[0.4,0.805,0.723,0.59,0.99],[0.6,0.75,0.667,0.506,0.99],[0.8,0.793,0.669,0.508,0.99],[1.0,0.723,0.664,0.501,0.99]],"Diffusion":[[0.4,0.458,0.334,0.006,0.989],[0.6,0.529,0.338,0.011,0.99],[0.8,0.365,0.331,0.001,0.99],[1.0,0.585,0.339,0.014,0.99]]},"hopper":{"VAE":[[1.0,0.983,0.539,0.081,0.998],[1.2,1.0,0.567,0.133,1.0],[1.4,0.996,0.805,0.614,0.996],[1.6,0.998,0.983,0.97,0.996],[1.8,1.0,0.998,0.998,0.997]],"KDE":[[1.0,1.0,0.5,0.0,1.0],[1.2,1.0,0.5,0.0,1.0],[1.4,1.0,0.5,0.0,1.0],[1.6,1.0,0.5,0.0,1.0],[1.8,1.0,0.5,0.0,1.0]],"RealNVP":[[1.0,1.0,0.997,1.0,0.994],[1.2,1.0,1.0,1.0,1.0],[1.4,1.0,0.995,1.0,0.989],[1.6,1.0,0.997,1.0,0.994],[1.8,1.0,0.997,1.0,0.994]],"NeuralODE":[[1.0,0.736,0.728,0.503,0.99],[1.2,0.75,0.746,0.511,0.99],[1.4,0.765,0.716,0.507,0.99],[1.6,0.762,0.711,0.504,0.99],[1.8,0.742,0.696,0.503,0.99]],"Diffusion":[[1.0,0.568,0.464,0.012,0.99],[1.2,0.561,0.493,0.014,0.99],[1.4,0.625,0.444,0.024,0.993],[1.6,0.65,0.441,0.03,0.991],[1.8,0.663,0.418,0.041,0.991]]},"walker2d":{"VAE":[[0.4,0.886,0.58,0.178,0.982],[0.6,0.97,0.753,0.529,0.977],[0.8,0.993,0.973,0.979,0.968],[1.0,0.998,0.986,1.0,0.971]],"KDE":[[0.4,1.0,0.5,0.0,1.0],[0.6,1.0,0.5,0.0,1.0],[0.8,1.0,0.5,0.0,1.0],[1.0,1.0,0.5,0.0,1.0]],"RealNVP":[[0.4,0.999,0.934,1.0,0.867],[0.6,1.0,0.923,1.0,0.847],[0.8,1.0,0.915,1.0,0.831],[1.0,1.0,0.906,1.0,0.811]],"NeuralODE":[[0.4,0.762,0.675,0.501,0.99],[0.6,0.775,0.702,0.507,0.99],[0.8,0.825,0.685,0.507,0.99],[1.0,0.794,0.683,0.509,0.99]],"Diffusion":[[0.4,0.472,0.358,0.009,0.989],[0.6,0.504,0.409,0.017,0.99],[0.8,0.432,0.372,0.011,0.991],[1.0,0.511,0.372,0.022,0.988]]}};

  // Medical (Impella) dataset, Figure 4 of the paper: only ROC AUC and accuracy were measured.
  // Rows: [distance, ROC AUC, accuracy].
  DATA.medical = {"VAE":[[1.0,0.905,0.582],[2.0,0.998,0.923],[3.0,1.0,0.998],[4.0,1.0,0.997]],"KDE":[[1.0,0.987,0.649],[2.0,0.999,0.969],[3.0,1.0,0.998],[4.0,1.0,0.998]],"RealNVP":[[1.0,1.0,0.861],[2.0,1.0,0.852],[3.0,1.0,0.847],[4.0,1.0,0.838]],"Diffusion":[[1.0,0.755,0.558],[2.0,0.98,0.882],[3.0,1.0,0.994],[4.0,1.0,0.995]],"NeuralODE":[[1.0,0.998,0.915],[2.0,1.0,0.995],[3.0,1.0,1.0],[4.0,1.0,1.0]]};

  const MEDICAL = {key: "medical", title: "Medical (Impella)", best: "NeuralODE", policy: "NeuralODE",
    match: true, fixed: {x: "auc", y: "acc"},
    domain: {lo: 0.5, hi: 1.02, ticks: [0.5, 0.6, 0.7, 0.8, 0.9, 1], ideal: 0.9}};

  const DATASETS = [
    {key: "halfcheetah", title: "HalfCheetah", best: "VAE", policy: "VAE", match: true},
    {key: "hopper", title: "Hopper", best: "RealNVP", policy: "DDPM / VAE (tie)", match: false},
    {key: "walker2d", title: "Walker2d", best: "RealNVP", policy: "RealNVP", match: true},
  ];

  // Same colors and markers as Figure 7 of the paper (seaborn "colorblind").
  const MODELS = [
    {key: "KDE", color: "#d55e00", shape: "square"},
    {key: "VAE", color: "#0173b2", shape: "circle"},
    {key: "RealNVP", color: "#ca9161", shape: "up"},
    {key: "Diffusion", color: "#cc78bc", shape: "diamond"},
    {key: "NeuralODE", color: "#56b4e9", shape: "down"},
  ];

  const METRICS = [
    {idx: 4, key: "tnr", label: "OOD data caught (TNR)"},
    {idx: 3, key: "tpr", label: "Real data kept (TPR)"},
    {idx: 2, key: "acc", label: "Accuracy"},
    {idx: 1, key: "auc", label: "ROC AUC"},
  ];
  const metricByKey = Object.fromEntries(METRICS.map(m => [m.key, m]));

  const NS = "http://www.w3.org/2000/svg";
  const W = 300, H = 300, M = {l: 54, r: 14, t: 14, b: 40};
  const PW = W - M.l - M.r, PH = H - M.t - M.b;
  // default axis range; a panel can zoom in with ds.domain = {lo, hi, ticks, ideal}
  const DOMAIN = {lo: -0.05, hi: 1.05, ticks: [0, 0.25, 0.5, 0.75, 1], ideal: 0.8};

  // data view (appendix Figs. 12-13): action norm vs state norm of the ID and OOD test samples
  const DW = 300, DH = 190, DM = {l: 54, r: 14, t: 10, b: 36};
  const ID_COLOR = "#8a8a8a", OOD_COLOR = "#4b2fc9";

  function niceTicks(lo, hi, n) {
    const raw = (hi - lo) / n, p = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * p).find(v => (hi - lo) / v <= n);
    const out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6));
    return out;
  }

  // order points along the diagonal so the same index lands in a similar spot at every distance,
  // which makes the slider animation read as the cloud moving rather than points shuffling
  function makeDataView(key, card) {
    const P = (window.OOD_POINTS || {})[key];
    if (!P) return () => {};
    const {lim} = P;
    const pw = DW - DM.l - DM.r, ph = DH - DM.t - DM.b;
    const sx = v => DM.l + (Math.min(v, lim.x[1]) - lim.x[0]) / (lim.x[1] - lim.x[0]) * pw;
    const sy = v => DM.t + ph - (Math.min(v, lim.y[1]) - lim.y[0]) / (lim.y[1] - lim.y[0]) * ph;
    const svg = el("svg", {viewBox: `0 0 ${DW} ${DH}`, class: "ood-data", role: "img",
      "aria-label": "ID and OOD test samples: action norm vs. state norm"}, card);
    for (const v of niceTicks(lim.y[0], lim.y[1], 4)) {
      el("line", {x1: DM.l, x2: DW - DM.r, y1: sy(v), y2: sy(v), class: "ood-grid"}, svg);
      const t = el("text", {x: DM.l - 6, y: sy(v) + 4, "text-anchor": "end", class: "ood-tick"}, svg);
      t.textContent = v;
    }
    for (const v of niceTicks(lim.x[0], lim.x[1], 4)) {
      const t = el("text", {x: sx(v), y: DH - DM.b + 14, "text-anchor": "middle", class: "ood-tick"}, svg);
      t.textContent = v;
    }
    const xl = el("text", {x: DM.l + pw / 2, y: DH - 4, "text-anchor": "middle", class: "ood-axis"}, svg);
    xl.textContent = "Action norm";
    const yl = el("text", {x: 0, y: 0, "text-anchor": "middle", class: "ood-axis",
      transform: `translate(11 ${DM.t + ph / 2}) rotate(-90)`}, svg);
    yl.textContent = "State norm";
    // point i is the same sample at every distance (ID fixed, its OOD copy shifted further), so keep the order
    const sets = P.pts;
    const make = (n, color) => Array.from({length: n}, () =>
      el("circle", {r: 2.2, cx: 0, cy: 0, fill: color, class: "ood-dot"}, svg));
    const oodDots = make(Math.max(...sets.map(d => d.ood.length)), OOD_COLOR);
    const idDots = make(Math.max(...sets.map(d => d.id.length)), ID_COLOR);  // real data drawn on top
    const place = (dots, pts) => dots.forEach((c, i) => {
      const p = pts[i];
      c.style.opacity = p ? "" : 0;
      if (p) c.style.transform = `translate(${sx(p[0])}px, ${sy(p[1])}px)`;
    });
    return idx => { place(idDots, sets[idx].id); place(oodDots, sets[idx].ood); };
  }

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function symbolPath(shape, r) {
    switch (shape) {
      case "square": return `M${-r},${-r}H${r}V${r}H${-r}Z`;
      case "up": return `M0,${-r * 1.2}L${r * 1.1},${r * 0.8}H${-r * 1.1}Z`;
      case "down": return `M0,${r * 1.2}L${r * 1.1},${-r * 0.8}H${-r * 1.1}Z`;
      case "diamond": return `M0,${-r * 1.3}L${r * 1.1},0L0,${r * 1.3}L${-r * 1.1},0Z`;
      default: return `M${r},0A${r},${r} 0 1,1 ${-r},0A${r},${r} 0 1,1 ${r},0Z`;
    }
  }

  function init() {
    const root = document.getElementById("ood-scatter");
    if (!root) return;
    const state = {x: "tnr", y: "tpr"};

    // controls: axis pickers
    const controls = root.querySelector(".ood-controls");
    for (const axis of ["x", "y"]) {
      const lab = document.createElement("label");
      lab.appendChild(document.createTextNode(axis === "x" ? "Horizontal: " : "Vertical: "));
      const sel = document.createElement("select");
      for (const m of METRICS) {
        const o = document.createElement("option");
        o.value = m.key; o.textContent = m.label;
        if (m.key === state[axis]) o.selected = true;
        sel.appendChild(o);
      }
      sel.addEventListener("change", () => { state[axis] = sel.value; panels.forEach(p => p.draw()); });
      lab.appendChild(sel);
      controls.appendChild(lab);
    }

    // legend
    const legend = root.querySelector(".ood-legend");
    for (const m of MODELS) {
      const item = document.createElement("span");
      item.className = "ood-legend-item";
      const svg = el("svg", {width: 16, height: 16, viewBox: "-8 -8 16 16"}, item);
      el("path", {d: symbolPath(m.shape, 5), fill: m.color}, svg);
      item.appendChild(document.createTextNode(m.key === "Diffusion" ? "Diffusion (DDPM)" : m.key));
      legend.appendChild(item);
    }

    const dl = root.querySelector(".ood-data-legend");
    if (dl) for (const [c, txt] of [[ID_COLOR, "Real data (ID)"], [OOD_COLOR, "Shifted data (OOD)"]]) {
      const item = document.createElement("span");
      item.className = "ood-legend-item";
      const svg = el("svg", {width: 16, height: 16, viewBox: "-8 -8 16 16"}, item);
      el("circle", {r: 4, fill: c}, svg);
      item.appendChild(document.createTextNode(txt));
      dl.appendChild(item);
    }

    const grid = root.querySelector(".ood-panels");
    const panels = DATASETS.map(ds => makePanel(ds, grid, state));
    panels.push(makePanel(MEDICAL, grid, state));
    panels.forEach(p => p.draw());
  }

  function makePanel(ds, grid, state) {
    const data = DATA[ds.key];
    const dists = data.VAE.map(r => r[0]);
    const {lo: LO, hi: HI, ticks, ideal} = ds.domain || DOMAIN;
    const sx = v => M.l + (v - LO) / (HI - LO) * PW;
    const sy = v => M.t + PH - (v - LO) / (HI - LO) * PH;
    let idx = 0;

    const card = document.createElement("div");
    card.className = "ood-panel";
    const h = document.createElement("div");
    h.className = "ood-panel-title";
    h.textContent = ds.title;
    card.appendChild(h);
    const sub = document.createElement("div");
    sub.className = "ood-panel-sub";
    sub.textContent = ds.fixed ? "ROC AUC vs. accuracy only" : "\u00a0";
    const drawData = makeDataView(ds.key, card);
    card.appendChild(sub);

    const svg = el("svg", {viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": `${ds.title}: OOD detection of five density models`}, card);

    // ideal corner
    el("rect", {x: sx(ideal), y: sy(HI), width: sx(HI) - sx(ideal), height: sy(ideal) - sy(HI),
      class: "ood-ideal"}, svg);
    const idealTxt = el("text", {x: sx(HI) - 4, y: sy(ideal) - 5, "text-anchor": "end", class: "ood-ideal-label"}, svg);
    idealTxt.textContent = ds.domain ? "" : "ideal";

    // grid + ticks
    for (const v of ticks) {
      el("line", {x1: sx(LO), x2: sx(HI), y1: sy(v), y2: sy(v), class: "ood-grid"}, svg);
      el("line", {y1: sy(LO), y2: sy(HI), x1: sx(v), x2: sx(v), class: "ood-grid"}, svg);
      const tx = el("text", {x: sx(v), y: sy(LO) + 14, "text-anchor": "middle", class: "ood-tick"}, svg);
      tx.textContent = v;
      const ty = el("text", {x: sx(LO) - 6, y: sy(v) + 4, "text-anchor": "end", class: "ood-tick"}, svg);
      ty.textContent = v;
    }
    const xl = el("text", {x: M.l + PW / 2, y: H - 6, "text-anchor": "middle", class: "ood-axis"}, svg);
    const yl = el("text", {x: 0, y: 0, "text-anchor": "middle", class: "ood-axis",
      transform: `translate(11 ${M.t + PH / 2}) rotate(-90)`}, svg);

    // points
    const pts = MODELS.map(m => {
      const g = el("g", {class: "ood-pt"}, svg);
      if (m.key === ds.best) el("circle", {r: 11, class: "ood-best-ring"}, g);
      el("path", {d: symbolPath(m.shape, 6.5), fill: m.color, class: "ood-mark"}, g);
      const t = el("text", {x: 10, y: -9, class: "ood-label"}, g);
      t.textContent = m.key === "Diffusion" ? "DDPM" : m.key;
      return {m, g, t};
    });

    // draw the best detector on top
    pts.sort((p, q) => (p.m.key === ds.best) - (q.m.key === ds.best));
    pts.forEach(p => svg.appendChild(p.g));

    // slider
    const sl = document.createElement("div");
    sl.className = "ood-slider";
    const lab = document.createElement("span");
    const input = document.createElement("input");
    Object.assign(input, {type: "range", min: 0, max: dists.length - 1, step: 1, value: 0});
    input.setAttribute("aria-label", `${ds.title} OOD distance`);
    const ends = document.createElement("div");
    ends.className = "ood-slider-ends";
    const a = document.createElement("span"); a.textContent = "harder";
    const b = document.createElement("span"); b.textContent = "easier";
    ends.append(a, b);
    sl.append(lab, input, ends);
    card.appendChild(sl);

    const foot = document.createElement("div");
    foot.className = "ood-foot";
    const l1 = document.createElement("div");
    l1.appendChild(document.createTextNode("Best detector: "));
    const bd = document.createElement("b"); bd.textContent = ds.best; l1.appendChild(bd);
    const l2 = document.createElement("div");
    l2.appendChild(document.createTextNode("Best GORMPO policy: "));
    const bp = document.createElement("b"); bp.textContent = ds.policy; l2.appendChild(bp);
    const mk = document.createElement("span");
    mk.className = ds.match ? "ood-match" : "ood-miss";
    mk.textContent = ds.match ? " ✓" : " ✗";
    l2.appendChild(mk);
    foot.append(l1, l2);
    card.appendChild(foot);
    grid.appendChild(card);

    input.addEventListener("input", () => { idx = +input.value; draw(); });

    function draw() {
      const axes = ds.fixed || state;
      const X = metricByKey[axes.x], Y = metricByKey[axes.y];
      xl.textContent = X.label;
      yl.textContent = Y.label;
      lab.textContent = `OOD distance: ${dists[idx]}`;
      drawData(idx);
      const placed = [];
      for (const p of pts) {
        const r = data[p.m.key][idx];
        const px = sx(r[X.idx]), py = sy(r[Y.idx]);
        p.g.style.transform = `translate(${px}px, ${py}px)`;
        // simple label de-collision: shift down until it clears earlier labels
        const right = px < W - 70;
        let ly = -9;
        while (placed.some(q => Math.abs(q.x - px) < 70 && Math.abs(q.y - (py + ly)) < 14)) ly += 14;
        placed.push({x: px, y: py + ly});
        p.t.setAttribute("x", right ? 10 : -10);
        p.t.setAttribute("text-anchor", right ? "start" : "end");
        p.t.setAttribute("y", ly);
      }
    }
    return {draw};
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
