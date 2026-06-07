import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function ProjectileAnimation() {
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(45);
  const [speed, setSpeed] = useState(32);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let raf;

    function resize() {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const a = angle * Math.PI / 180;
      const g = 9.8;
      const scale = 3.8;
      const tMax = 2 * speed * Math.sin(a) / g;
      const t = ((frame % 180) / 180) * tMax;

      ctx.strokeStyle = '#d7def8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(18, h - 24);
      ctx.lineTo(w - 18, h - 24);
      ctx.stroke();

      ctx.strokeStyle = '#5b4bdb';
      ctx.setLineDash([7, 6]);
      ctx.beginPath();

      for (let i = 0; i <= 100; i++) {
        const ti = i / 100 * tMax;
        const x = 20 + speed * Math.cos(a) * ti * scale;
        const y = h - 24 - (speed * Math.sin(a) * ti - g * ti * ti / 2) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.setLineDash([]);

      const x = 20 + speed * Math.cos(a) * t * scale;
      const y = h - 24 - (speed * Math.sin(a) * t - g * t * t / 2) * scale;

      ctx.fillStyle = '#ff7a59';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      frame++;
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [angle, speed]);

  return (
    <article className="home-anim-card">
      <h3>🎯 Движение тела под углом</h3>
      <canvas ref={canvasRef} />
      <div className="anim-stats">
        <span>Угол: {angle}°</span>
        <span>Скорость: {speed} м/с</span>
      </div>
      <div className="anim-controls">
        <input type="range" min="20" max="70" value={angle} onChange={(e) => setAngle(+e.target.value)} />
        <input type="range" min="15" max="45" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
      </div>
    </article>
  );
}

function SpringAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let raf;

    function resize() {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const y = h / 2;
      const offset = Math.sin(frame / 16) * 28;
      const start = 22;
      const end = w - 92 + offset;

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = '#5b4bdb';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(start, y);

      for (let i = 0; i <= 12; i++) {
        const x = start + ((end - start) / 12) * i;
        const yy = y + (i % 2 === 0 ? -18 : 18);
        ctx.lineTo(x, yy);
      }

      ctx.lineTo(end, y);
      ctx.stroke();

      ctx.fillStyle = '#21b6ff';
      ctx.roundRect(end, y - 28, 58, 58, 14);
      ctx.fill();

      frame++;
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <article className="home-anim-card">
      <h3>🔧 Колебания пружины</h3>
      <canvas ref={canvasRef} />
      <div className="anim-stats">
        <span>m = 0.8 кг</span>
        <span>k = 45 Н/м</span>
        <span>ζ = 0.33</span>
      </div>
    </article>
  );
}

function CannonAnimation() {
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(42);
  const [speed, setSpeed] = useState(35);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let raf;

    function resize() {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const a = angle * Math.PI / 180;
      const g = 9.8;
      const scale = 3.4;
      const tMax = 2 * speed * Math.sin(a) / g;
      const t = ((frame % 200) / 200) * tMax;

      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#172554';
      ctx.fillRect(24, h - 38, 56, 22);

      ctx.save();
      ctx.translate(62, h - 38);
      ctx.rotate(-a);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, -7, 52, 14);
      ctx.restore();

      ctx.strokeStyle = '#ff7a59';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();

      for (let i = 0; i <= 100; i++) {
        const ti = i / 100 * tMax;
        const x = 62 + speed * Math.cos(a) * ti * scale;
        const y = h - 38 - (speed * Math.sin(a) * ti - g * ti * ti / 2) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.setLineDash([]);

      const x = 62 + speed * Math.cos(a) * t * scale;
      const y = h - 38 - (speed * Math.sin(a) * t - g * t * t / 2) * scale;

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(Math.min(x, w - 18), y, 8, 0, Math.PI * 2);
      ctx.fill();

      frame++;
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [angle, speed]);

  return (
    <article className="home-anim-card">
      <h3>💥 Выстрел ядра из пушки</h3>
      <canvas ref={canvasRef} />
      <div className="anim-stats">
        <span>Угол: {angle}°</span>
        <span>Скорость: {speed} м/с</span>
      </div>
      <div className="anim-controls">
        <input type="range" min="25" max="60" value={angle} onChange={(e) => setAngle(+e.target.value)} />
        <input type="range" min="25" max="50" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main className="home-clean-page">
      <section className="home-clean-hero">
        <div className="home-clean-content">
          <p className="eyebrow">Интерактивная образовательная платформа</p>
          <h1>
            Добро пожаловать в систему обучения дисциплине
            <span> «Учебно-исследовательская работа»</span>
          </h1>
          <p>
            для бакалавров направления 15.03.03 «Прикладная механика».
            Система поможет научиться получать численное решение физических задач,
            поставленных в дифференциальной форме, с использованием языка программирования Python.
          </p>

          <nav className="home-menu">
            <Link to="/theory">Теория</Link>
            <Link to="/dashboard">Обучение</Link>
            <Link to="/compiler">Попробуй сам</Link>
          </nav>

          <Link className="btn" to="/login">Начать обучение</Link>
        </div>

        <div className="home-clean-animations">
          <ProjectileAnimation />
          <CannonAnimation />
        </div>
      </section>
    </main>
  );
}