const modelSelect = document.getElementById("growthModel");
const baseInput = document.getElementById("baseSales");
const startInput = document.getElementById("startTime");
const endInput = document.getElementById("endTime");
const unitSelect = document.getElementById("timeUnit");

const functionBox = document.getElementById("functionBox");
const calcBtn = document.getElementById("calcBtn");
const resultBox = document.querySelector(".result");

const graphBox = document.getElementById("graph-box");
const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const particleLayer =
  document.getElementById("particleLayer");

let currentFunction = null;
let currentFunctionText = "";
let isAnimating = false;

/* =========================
   MODELOS
========================= */

function generateFunction(model, base) {

  switch (model) {

    case "slow":
      return (x) => base * (1 + 0.1 * x);

    case "medium":
      return (x) => base * (1 + 0.25 * x);

    case "fast":
      return (x) => base * Math.pow(1 + x, 2);

    case "expo":
      return (x) => base * Math.exp(0.2 * x);

    default:
      return null;
  }
}

/* =========================
   INTEGRAL NUMÉRICA
========================= */

function integrate(f, a, b, steps = 1000) {

  let h = (b - a) / steps;
  let sum = 0;

  for (let i = 0; i < steps; i++) {

    let x = a + i * h;

    sum += f(x) * h;
  }

  return sum;
}

/* =========================
   UPDATE MODEL
========================= */

function updateModel() {

  const model = modelSelect.value;
  const base = parseFloat(baseInput.value);

  if (!model || isNaN(base)) {

    functionBox.textContent =
      "Completa ventas iniciales y modelo...";

    functionBox.classList.remove("active");

    currentFunction = null;

    calcBtn.disabled = true;

    return;
  }

  currentFunction =
    generateFunction(model, base);

  const labels = {

    slow: (b) =>
      `V(x) = ${b}(1 + 0.1x)`,

    medium: (b) =>
      `V(x) = ${b}(1 + 0.25x)`,

    fast: (b) =>
      `V(x) = ${b}(1 + x)²`,

    expo: (b) =>
      `V(x) = ${b}e^(0.2x)`
  };

  currentFunctionText =
    labels[model](base);

  functionBox.textContent =
    currentFunctionText;

  functionBox.classList.add("active");

  validateInputs();
}

/* =========================
   VALIDAR
========================= */

function validateInputs() {

  const a =
    parseFloat(startInput.value);

  const b =
    parseFloat(endInput.value);

  calcBtn.disabled = !(
    currentFunction &&
    !isNaN(a) &&
    !isNaN(b) &&
    b > a
  );
}

/* =========================
   CALCULAR
========================= */

function calculate() {

  if (isAnimating) return;

  isAnimating = true;

  calcBtn.disabled = true;

  const a =
    parseFloat(startInput.value);

  const b =
    parseFloat(endInput.value);

  const unit =
    unitSelect.value;

  const result =
    integrate(currentFunction, a, b);

  const total =
    result.toFixed(2);

  const unitText = {

    days: "días",
    weeks: "semanas",
    months: "meses"

  }[unit];

  const interpretation =
    `Se acumularon aproximadamente ${total} ventas entre ${a} y ${b} ${unitText}.`;

  const integralText =
    `∫<sub>${a}</sub><sup>${b}</sup> ${currentFunctionText} dx = ${total}`;

  resultBox.innerHTML = `

    <h3>Resultado</h3>

    <p>
      <b>📦 Ventas acumuladas:</b>
      ${total}
    </p>

    <p style="margin-top:10px;">
      📊 ${interpretation}
    </p>

    <div
      style="
        margin-top:12px;
        padding:12px;
        border-radius:12px;
        background:rgba(255,255,255,0.55);
        border:1px solid rgba(168,85,247,0.15);
      "
    >
      <b>📈 Integral definida:</b><br><br>
      ${integralText}
    </div>
  `;

  plotFunction(currentFunction, a, b);
}

/* =========================
   RESIZE CANVAS
========================= */

function resizeCanvas() {

  const ratio =
    window.devicePixelRatio || 1;

  canvas.width =
    canvas.clientWidth * ratio;

  canvas.height =
    canvas.clientHeight * ratio;

  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );
}

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();

/* =========================
   PARTICULAS
========================= */

function finishAnimation() {

  graphBox.classList.add("pulse");

  setTimeout(() => {

    graphBox.classList.remove("pulse");

    isAnimating = false;

    validateInputs();

  }, 650);

  createEdgeParticles();
}

/* =========================
   GRAFICAR
========================= */

function plotFunction(f, a, b) {

  resizeCanvas();

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  const padding = 70;
  const steps = 240;

  const points = [];

  let maxY = -Infinity;
  let minY = Infinity;

  for (let i = 0; i <= steps; i++) {

    const x =
      a + (i / steps) * (b - a);

    const y = f(x);

    maxY = Math.max(maxY, y);
    minY = Math.min(minY, y);

    points.push({ x, y });
  }

  if (maxY === minY) {
    maxY += 1;
  }

  const xScale =
    (w - padding * 2) / (b - a);

  const yScale =
    (h - padding * 2) /
    (maxY - minY);

  ctx.clearRect(0, 0, w, h);

  /* =========================
     GRID
  ========================= */

  ctx.strokeStyle =
    "rgba(255,255,255,0.06)";

  ctx.lineWidth = 1;

  for (let i = 0; i < 8; i++) {

    let y =
      padding +
      i * ((h - padding * 2) / 7);

    ctx.beginPath();

    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);

    ctx.stroke();
  }

  for (let i = 0; i < 8; i++) {

    let x =
      padding +
      i * ((w - padding * 2) / 7);

    ctx.beginPath();

    ctx.moveTo(x, padding);
    ctx.lineTo(x, h - padding);

    ctx.stroke();
  }

  /* =========================
     EJES
  ========================= */

  ctx.strokeStyle =
    "rgba(76, 29, 149, 0.9)";

  ctx.lineWidth = 2;

  // eje x
  ctx.beginPath();

  ctx.moveTo(
    padding,
    h - padding
  );

  ctx.lineTo(
    w - padding,
    h - padding
  );

  ctx.stroke();

  // eje y
  ctx.beginPath();

  ctx.moveTo(
    padding,
    padding
  );

  ctx.lineTo(
    padding,
    h - padding
  );

  ctx.stroke();

  /* =========================
     NÚMEROS
  ========================= */

  ctx.fillStyle =
    "rgba(55, 48, 163, 0.95)";

  ctx.font = "12px Inter";

  // eje x

  for (let i = 0; i <= 5; i++) {

    const value =
      a + ((b - a) / 5) * i;

    const px =
      padding +
      (value - a) * xScale;

    ctx.fillText(
      value.toFixed(0),
      px - 6,
      h - padding + 22
    );
  }

  // eje y

  for (let i = 0; i <= 5; i++) {

    const value =
      minY + ((maxY - minY) / 5) * i;

    const py =
      h - padding -
      (value - minY) * yScale;

    ctx.fillText(
      value.toFixed(0),
      14,
      py + 4
    );
  }

  /* =========================
     ANIMACIÓN
  ========================= */

  let progress = 0;

  function animate() {

    progress += 6;

    // limpiar SOLO zona interna
    ctx.clearRect(
      padding + 2,
      padding + 2,
      w - padding * 2 - 4,
      h - padding * 2 - 4
    );

    // redraw grid
    ctx.strokeStyle =
      "rgba(255,255,255,0.06)";

    ctx.lineWidth = 1;

    for (let i = 0; i < 8; i++) {

      let y =
        padding +
        i * ((h - padding * 2) / 7);

      ctx.beginPath();

      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);

      ctx.stroke();
    }

    for (let i = 0; i < 8; i++) {

      let x =
        padding +
        i * ((w - padding * 2) / 7);

      ctx.beginPath();

      ctx.moveTo(x, padding);
      ctx.lineTo(x, h - padding);

      ctx.stroke();
    }

    // área

    ctx.save();

ctx.beginPath();

ctx.rect(
  padding,
  padding,
  w - padding * 2,
  h - padding * 2
);

ctx.clip();

ctx.beginPath();

ctx.moveTo(
  padding,
  h - padding
);

let lastPx = padding;

for (
  let i = 0;
  i < progress &&
  i < points.length;
  i++
) {

  const px =
    padding +
    (points[i].x - a) *
    xScale;

  const py =
    h - padding -
    (points[i].y - minY) *
    yScale;

  lastPx = px;

  ctx.lineTo(px, py);
}

ctx.lineTo(
  lastPx,
  h - padding
);

ctx.closePath();

ctx.fillStyle =
  "rgba(239, 68, 68, 0.14)";

ctx.fill();

ctx.restore();

    // glow

    ctx.beginPath();

    for (
      let i = 0;
      i < progress &&
      i < points.length;
      i++
    ) {

      const px =
        padding +
        (points[i].x - a) *
        xScale;

      const py =
        h - padding -
        (points[i].y - minY) *
        yScale;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.strokeStyle =
      "rgba(239, 68, 68, 0.18)";

    ctx.lineWidth = 10;

    ctx.stroke();

    // línea principal

    ctx.strokeStyle =
      "#dc2626";

    ctx.lineWidth = 3.5;

    ctx.stroke();

    // partículas

    if (progress < points.length) {

  requestAnimationFrame(animate);

} else {

  finishAnimation();

}
  }

  animate();
}

function createEdgeParticles() {

  const rect =
    graphBox.getBoundingClientRect();

  const colors = [
    "#a855f7",
    "#ec4899",
    "#f59e0b",
    "#ef4444"
  ];

  // MUCHAS MENOS PARTICULAS
  for (let i = 0; i < 20; i++) {

    const particle =
      document.createElement("div");

    particle.className =
      "energy-particle";

    const size =
      Math.random() * 6 + 3;

    particle.style.width =
      `${size}px`;

    particle.style.height =
      `${size}px`;

    particle.style.background =
      colors[
        Math.floor(
          Math.random() * colors.length
        )
      ];

    const side =
      Math.floor(Math.random() * 4);

    let x = 0;
    let y = 0;

    if (side === 0) {
      x = Math.random() * rect.width;
      y = 0;
    }

    if (side === 1) {
      x = rect.width;
      y = Math.random() * rect.height;
    }

    if (side === 2) {
      x = Math.random() * rect.width;
      y = rect.height;
    }

    if (side === 3) {
      x = 0;
      y = Math.random() * rect.height;
    }

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    const angle =
      Math.atan2(
        y - rect.height / 2,
        x - rect.width / 2
      );

    const distance =
      80 + Math.random() * 80;

    const tx =
      Math.cos(angle) * distance;

    const ty =
      Math.sin(angle) * distance;

    particle.style.setProperty(
      "--tx",
      `${tx}px`
    );

    particle.style.setProperty(
      "--ty",
      `${ty}px`
    );

    particleLayer.appendChild(
      particle
    );

    setTimeout(() => {

      particle.remove();

    }, 1200);
  }
}

/* =========================
   EVENTOS
========================= */

modelSelect.addEventListener(
  "change",
  updateModel
);

baseInput.addEventListener(
  "input",
  updateModel
);

startInput.addEventListener(
  "input",
  validateInputs
);

endInput.addEventListener(
  "input",
  validateInputs
);

calcBtn.addEventListener(
  "click",
  calculate
);