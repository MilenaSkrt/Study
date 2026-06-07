import { useMemo, useState } from 'react';

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function scalePoints(points, width, height, padding) {
  const validPoints = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  if (validPoints.length === 0) {
    return [];
  }

  const xs = validPoints.map((point) => point.x);
  const ys = validPoints.map((point) => point.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 1);

  const safeWidth = Math.max(maxX - minX, 1);
  const safeHeight = Math.max(maxY - minY, 1);

  return validPoints.map((point) => ({
    ...point,
    sx: padding + ((point.x - minX) / safeWidth) * (width - padding * 2),
    sy: height - padding - ((point.y - minY) / safeHeight) * (height - padding * 2),
  }));
}

function polyline(points) {
  return points.map((point) => `${point.sx},${point.sy}`).join(' ');
}

function SliderControl({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <label className="visualization-control">
      <span>{label}</span>
      <div className="visualization-control-row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(toNumber(event.target.value, value))}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(toNumber(event.target.value, value))}
        />
        {unit && <b>{unit}</b>}
      </div>
    </label>
  );
}

function SelectControl({ label, value, options, onChange }) {
  return (
    <label className="visualization-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BulletPlateVisualization({ config }) {
  const defaultParams = useMemo(() => ({
    g: config.g ?? 9.81,
    v0: config.v0 ?? 58,
    angleDeg: config.angleDeg ?? 28,
    targetX0: config.targetX0 ?? 25,
    targetY: config.targetY ?? 8,
    targetV: config.targetV ?? 5,
  }), [config]);

  const [params, setParams] = useState(defaultParams);
  const setParam = (name, value) => setParams((current) => ({ ...current, [name]: value }));

  const width = 760;
  const height = 360;
  const padding = 46;
  const g = params.g;
  const v0 = params.v0;
  const angleRad = (params.angleDeg * Math.PI) / 180;
  const targetX0 = params.targetX0;
  const targetY = params.targetY;
  const targetV = params.targetV;

  const points = [];
  let best = { error: Infinity, x: 0, y: 0, targetX: targetX0, t: 0 };

  for (let i = 0; i <= 220; i += 1) {
    const t = i * 0.025;
    const x = v0 * Math.cos(angleRad) * t;
    const y = v0 * Math.sin(angleRad) * t - (g * t * t) / 2;

    if (y < -0.2) break;

    const currentTargetX = targetX0 + targetV * t;
    const error = Math.hypot(x - currentTargetX, y - targetY);
    if (error < best.error) {
      best = { error, x, y, targetX: currentTargetX, t };
    }

    points.push({ x, y });
  }

  const targetPoint = { x: best.targetX, y: targetY };
  const scaled = scalePoints([...points, targetPoint], width, height, padding);
  const trajectory = scaled.slice(0, points.length);
  const scaledTarget = scaled[scaled.length - 1];
  const scaledBest = trajectory.length > 0
    ? trajectory.reduce((currentBest, point) => {
        const dist = Math.hypot(point.x - best.x, point.y - best.y);
        const currentDist = Math.hypot(currentBest.x - best.x, currentBest.y - best.y);
        return dist < currentDist ? point : currentBest;
      }, trajectory[0])
    : { sx: padding, sy: height - padding };

  return (
    <div className="visualization-card">
      <div className="visualization-title-row">
        <div>
          <h4>Интерактивная траектория пули</h4>
          <p>Измени скорость, угол и положение тарелки. График сразу покажет, станет ли попадание ближе.</p>
        </div>
        <span className={best.error < 0.8 ? 'status-pill success' : 'status-pill warning'}>
          {best.error < 0.8 ? 'Попадание возможно' : 'Нужно уточнить параметры'}
        </span>
      </div>

      <div className="visualization-controls">
        <SliderControl label="Начальная скорость" value={params.v0} min={20} max={90} step={1} unit="м/с" onChange={(value) => setParam('v0', value)} />
        <SliderControl label="Угол выстрела" value={params.angleDeg} min={5} max={75} step={1} unit="°" onChange={(value) => setParam('angleDeg', value)} />
        <SliderControl label="Начальная x тарелки" value={params.targetX0} min={5} max={70} step={1} unit="м" onChange={(value) => setParam('targetX0', value)} />
        <SliderControl label="Высота тарелки" value={params.targetY} min={1} max={25} step={0.5} unit="м" onChange={(value) => setParam('targetY', value)} />
        <SliderControl label="Скорость тарелки" value={params.targetV} min={-10} max={15} step={0.5} unit="м/с" onChange={(value) => setParam('targetV', value)} />
        <button type="button" className="visualization-reset" onClick={() => setParams(defaultParams)}>Сбросить</button>
      </div>

      <svg className="trajectory-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График траектории пули">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="axis-line" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="axis-line" />
        <polyline points={polyline(trajectory)} className="trajectory-line" />
        {scaledTarget && <circle cx={scaledTarget.sx} cy={scaledTarget.sy} r="10" className="target-point" />}
        <circle cx={scaledBest.sx} cy={scaledBest.sy} r="6" className="hit-point" />
        {scaledTarget && <line x1={scaledBest.sx} y1={scaledBest.sy} x2={scaledTarget.sx} y2={scaledTarget.sy} className="error-line" />}
        {scaledTarget && <text x={scaledTarget.sx + 14} y={scaledTarget.sy - 8} className="svg-label">тарелка</text>}
        <text x={scaledBest.sx + 10} y={scaledBest.sy + 20} className="svg-label">пуля</text>
        <text x={width - padding - 20} y={height - 14} className="svg-label">x</text>
        <text x={18} y={padding + 10} className="svg-label">y</text>
      </svg>

      <div className="visualization-stats">
        <span>Угол: {params.angleDeg}°</span>
        <span>Скорость: {v0} м/с</span>
        <span>Минимальная ошибка: {best.error.toFixed(2)} м</span>
        <span>Момент сближения: {best.t.toFixed(2)} c</span>
      </div>

      <div className={best.error < 0.8 ? 'visualization-result success' : 'visualization-result warning'}>
        <strong>Результат моделирования:</strong>{' '}
        {best.error < 0.8
          ? `попадание считается успешным. Минимальное расстояние между пулей и тарелкой составляет ${best.error.toFixed(2)} м при t = ${best.t.toFixed(2)} c.`
          : `попадание не достигнуто. Ближайшая точка траектории находится на расстоянии ${best.error.toFixed(2)} м от тарелки, поэтому параметры выстрела нужно изменить.`}
      </div>
    </div>
  );
}

function BallBasketWallVisualization({ config }) {
  const defaultParams = useMemo(() => ({
    g: config.g ?? 9.81,
    h: config.h ?? 1.5,
    v0: config.v0 ?? 10,
    angleDeg: config.angleDeg ?? 48,
    wallX: config.wallX ?? 5,
    basketX: config.basketX ?? 4.2,
    basketY: config.basketY ?? 3.05,
  }), [config]);

  const [params, setParams] = useState(defaultParams);
  const setParam = (name, value) => setParams((current) => ({ ...current, [name]: value }));

  const width = 760;
  const height = 360;
  const padding = 46;
  const g = params.g;
  const h = params.h;
  const v0 = params.v0;
  const angleRad = (params.angleDeg * Math.PI) / 180;
  const wallX = params.wallX;
  const basketX = params.basketX;
  const basketY = params.basketY;

  const vx = Math.max(v0 * Math.cos(angleRad), 0.01);
  const vy = v0 * Math.sin(angleRad);
  const tWall = wallX / vx;
  const yWall = h + vy * tWall - (g * tWall * tWall) / 2;
  const vyWall = vy - g * tWall;
  const vxAfter = -vx;

  const before = [];
  const after = [];
  let best = { error: Infinity, x: wallX, y: yWall };

  for (let i = 0; i <= 80; i += 1) {
    const t = (tWall / 80) * i;
    before.push({ x: vx * t, y: h + vy * t - (g * t * t) / 2 });
  }

  for (let i = 0; i <= 180; i += 1) {
    const tau = i * 0.02;
    const x = wallX + vxAfter * tau;
    const y = yWall + vyWall * tau - (g * tau * tau) / 2;
    if (y < -0.2 || x < -0.2) break;
    const error = Math.hypot(x - basketX, y - basketY);
    if (error < best.error) best = { error, x, y };
    after.push({ x, y });
  }

  const basket = { x: basketX, y: basketY };
  const wallBottom = { x: wallX, y: 0 };
  const wallTop = { x: wallX, y: Math.max(yWall + 1, basketY + 1, 3) };
  const scaled = scalePoints([...before, ...after, basket, wallBottom, wallTop], width, height, padding);
  const beforeScaled = scaled.slice(0, before.length);
  const afterScaled = scaled.slice(before.length, before.length + after.length);
  const basketScaled = scaled[before.length + after.length];
  const wallBottomScaled = scaled[before.length + after.length + 1];
  const wallTopScaled = scaled[before.length + after.length + 2];
  const bestScaled = afterScaled.length > 0
    ? afterScaled.reduce((currentBest, point) => {
        const dist = Math.hypot(point.x - best.x, point.y - best.y);
        const currentDist = Math.hypot(currentBest.x - best.x, currentBest.y - best.y);
        return dist < currentDist ? point : currentBest;
      }, afterScaled[0])
    : beforeScaled[beforeScaled.length - 1] || { sx: padding, sy: height - padding };

  const wallIsReachable = yWall > 0;

  return (
    <div className="visualization-card">
      <div className="visualization-title-row">
        <div>
          <h4>Интерактивная схема «шарик — стена — корзина»</h4>
          <p>Меняй параметры броска и положение корзины, чтобы подобрать траекторию после отражения.</p>
        </div>
        <span className={wallIsReachable && best.error < 0.35 ? 'status-pill success' : 'status-pill warning'}>
          {!wallIsReachable ? 'До стены не долетает' : best.error < 0.35 ? 'Попадание в корзину' : 'Промах'}
        </span>
      </div>

      <div className="visualization-controls">
        <SliderControl label="Скорость броска" value={params.v0} min={3} max={22} step={0.5} unit="м/с" onChange={(value) => setParam('v0', value)} />
        <SliderControl label="Угол броска" value={params.angleDeg} min={15} max={80} step={1} unit="°" onChange={(value) => setParam('angleDeg', value)} />
        <SliderControl label="Начальная высота" value={params.h} min={0.2} max={4} step={0.1} unit="м" onChange={(value) => setParam('h', value)} />
        <SliderControl label="Положение стены" value={params.wallX} min={2} max={9} step={0.1} unit="м" onChange={(value) => setParam('wallX', value)} />
        <SliderControl label="Положение корзины X" value={params.basketX} min={0.5} max={8} step={0.1} unit="м" onChange={(value) => setParam('basketX', value)} />
        <SliderControl label="Высота корзины" value={params.basketY} min={0.3} max={6} step={0.1} unit="м" onChange={(value) => setParam('basketY', value)} />
        <button type="button" className="visualization-reset" onClick={() => setParams(defaultParams)}>Сбросить</button>
      </div>

      <svg className="trajectory-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График траектории шарика после отражения">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="axis-line" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="axis-line" />
        {wallBottomScaled && wallTopScaled && <line x1={wallBottomScaled.sx} y1={wallBottomScaled.sy} x2={wallTopScaled.sx} y2={wallTopScaled.sy} className="wall-line" />}
        <polyline points={polyline(beforeScaled)} className="trajectory-line" />
        <polyline points={polyline(afterScaled)} className="trajectory-line dashed" />
        {basketScaled && <rect x={basketScaled.sx - 17} y={basketScaled.sy - 10} width="34" height="20" rx="6" className="basket-shape" />}
        <circle cx={bestScaled.sx} cy={bestScaled.sy} r="6" className="hit-point" />
        {wallTopScaled && <text x={wallTopScaled.sx + 10} y={wallTopScaled.sy + 18} className="svg-label">стена</text>}
        {basketScaled && <text x={basketScaled.sx + 18} y={basketScaled.sy - 12} className="svg-label">корзина</text>}
      </svg>

      <div className="visualization-stats">
        <span>Высота удара: {yWall.toFixed(2)} м</span>
        <span>Ошибка: {best.error.toFixed(2)} м</span>
        <span>Стена: x = {wallX.toFixed(1)} м</span>
        <span>Корзина: ({basketX.toFixed(1)}; {basketY.toFixed(1)})</span>
      </div>

      <div className={wallIsReachable && best.error < 0.35 ? 'visualization-result success' : 'visualization-result warning'}>
        <strong>Результат моделирования:</strong>{' '}
        {!wallIsReachable
          ? `шарик не достигает стены: расчётная высота в точке x = ${wallX.toFixed(1)} м равна ${yWall.toFixed(2)} м.`
          : best.error < 0.35
            ? `попадание в корзину считается успешным. Минимальное отклонение от центра корзины составляет ${best.error.toFixed(2)} м.`
            : `попадание не достигнуто. После отражения шарик проходит ближе всего к корзине на расстоянии ${best.error.toFixed(2)} м.`}
      </div>
    </div>
  );
}

function Rk4Visualization({ config }) {
  const defaultParams = useMemo(() => ({
    equation: config.equation ?? 'x+y',
    x0: config.x0 ?? 0,
    y0: config.y0 ?? 1,
    h: config.h ?? 0.1,
    steps: config.steps ?? 20,
  }), [config]);

  const [params, setParams] = useState(defaultParams);
  const setParam = (name, value) => setParams((current) => ({ ...current, [name]: value }));

  const width = 760;
  const height = 360;
  const padding = 46;
  const h = params.h;
  const steps = Math.round(params.steps);
  let x = params.x0;
  let y = params.y0;

  function f(currentX, currentY) {
    if (params.equation === 'y-x') return currentY - currentX;
    if (params.equation === 'sin(x)-y') return Math.sin(currentX) - currentY;
    return currentX + currentY;
  }

  const equationLabel = {
    'x+y': "y' = x + y",
    'y-x': "y' = y - x",
    'sin(x)-y': "y' = sin(x) - y",
  }[params.equation] ?? "y' = x + y";

  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    points.push({ x, y });
    const k1 = f(x, y);
    const k2 = f(x + h / 2, y + (h * k1) / 2);
    const k3 = f(x + h / 2, y + (h * k2) / 2);
    const k4 = f(x + h, y + h * k3);
    y += (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
    x += h;
  }

  const scaled = scalePoints(points, width, height, padding);
  const lastPoint = points[points.length - 1];
  const yValues = points.map((point) => point.y);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  return (
    <div className="visualization-card">
      <div className="visualization-title-row">
        <div>
          <h4>Интерактивный график решения задачи Коши</h4>
          <p>Меняй уравнение, шаг и начальное условие, чтобы увидеть влияние параметров на численное решение.</p>
        </div>
        <span className="status-pill success">RK4</span>
      </div>

      <div className="visualization-controls">
        <SelectControl
          label="Уравнение"
          value={params.equation}
          onChange={(value) => setParam('equation', value)}
          options={[
            { value: 'x+y', label: "y' = x + y" },
            { value: 'y-x', label: "y' = y - x" },
            { value: 'sin(x)-y', label: "y' = sin(x) - y" },
          ]}
        />
        <SliderControl label="Начальное x₀" value={params.x0} min={-2} max={2} step={0.1} onChange={(value) => setParam('x0', value)} />
        <SliderControl label="Начальное y₀" value={params.y0} min={-3} max={5} step={0.1} onChange={(value) => setParam('y0', value)} />
        <SliderControl label="Шаг h" value={params.h} min={0.05} max={0.5} step={0.05} onChange={(value) => setParam('h', value)} />
        <SliderControl label="Количество шагов" value={steps} min={5} max={60} step={1} onChange={(value) => setParam('steps', value)} />
        <button type="button" className="visualization-reset" onClick={() => setParams(defaultParams)}>Сбросить</button>
      </div>

      <svg className="trajectory-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График решения задачи Коши методом Рунге-Кутта">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="axis-line" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="axis-line" />
        <polyline points={polyline(scaled)} className="trajectory-line" />
        {scaled.map((point, index) => (
          <circle key={`${point.x}-${index}`} cx={point.sx} cy={point.sy} r="3.5" className="sample-point" />
        ))}
        <text x={width - padding - 20} y={height - 14} className="svg-label">x</text>
        <text x={18} y={padding + 10} className="svg-label">y</text>
      </svg>

      <div className="visualization-stats">
        <span>Уравнение: {equationLabel}</span>
        <span>Шаг: {h}</span>
        <span>Точек: {steps + 1}</span>
        <span>y({lastPoint.x.toFixed(2)}) = {lastPoint.y.toFixed(3)}</span>
      </div>

      <div className="visualization-result success">
        <strong>Результат моделирования:</strong>{' '}
        {`метод Рунге–Кутты рассчитал ${steps + 1} точек. Последняя полученная точка: x = ${lastPoint.x.toFixed(2)}, y = ${lastPoint.y.toFixed(3)}. Диапазон значений y на графике: от ${yMin.toFixed(3)} до ${yMax.toFixed(3)}.`}
      </div>
    </div>
  );
}

export default function LearningVisualization({ visualization }) {
  if (!visualization) return null;

  if (visualization.type === 'bullet') {
    return <BulletPlateVisualization config={visualization.config} />;
  }

  if (visualization.type === 'wall-basket') {
    return <BallBasketWallVisualization config={visualization.config} />;
  }

  if (visualization.type === 'rk4') {
    return <Rk4Visualization config={visualization.config} />;
  }

  return null;
}
