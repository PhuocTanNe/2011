/*
 * Hiệu ứng: cánh hoa rơi (nền), pháo hoa + hoa giấy (lớp trên cùng), tim bay (DOM).
 * Dùng canvas chứ không dùng hàng trăm thẻ <div>: điện thoại tầm trung vẽ 200 hạt bằng canvas
 * vẫn mượt, còn 200 phần tử DOM cùng animate thì giật và nóng máy.
 * Vòng lặp requestAnimationFrame chỉ chạy khi còn hạt trên màn — hết hạt là dừng hẳn, không ăn pin.
 */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Giới hạn 2x: màn 3x của iPhone làm canvas to gấp 9 lần mà mắt không thấy khác biệt.
  const getDpr = () => Math.min(window.devicePixelRatio || 1, 2);

  function fitCanvas(cv, ctx) {
    const dpr = getDpr();
    const w = window.innerWidth, h = window.innerHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  /* ---------------- Cánh hoa rơi ---------------- */
  const Petals = (function () {
    const COLORS = ['#F9C5D1', '#F7A8B8', '#FFFFFF', '#FBD3A5', '#F27A93'];
    let cv, ctx, size = { w: 0, h: 0 }, list = [], raf = 0, on = false;

    function make(anywhere) {
      return {
        x: Math.random() * size.w,
        y: anywhere ? Math.random() * size.h : -20,
        s: 5 + Math.random() * 6,
        vy: 0.35 + Math.random() * 0.65,
        sw: Math.random() * Math.PI * 2,
        swS: 0.008 + Math.random() * 0.018,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.03,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      };
    }

    function frame() {
      ctx.clearRect(0, 0, size.w, size.h);
      for (const p of list) {
        p.y += p.vy;
        p.sw += p.swS;
        p.x += Math.sin(p.sw) * 0.6;
        p.rot += p.vr;
        if (p.y > size.h + 20) Object.assign(p, make(false));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.moveTo(0, -p.s);
        ctx.quadraticCurveTo(p.s * 0.9, -p.s * 0.2, 0, p.s);
        ctx.quadraticCurveTo(-p.s * 0.9, -p.s * 0.2, 0, -p.s);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (on || reduceMotion) return;
      cv = document.getElementById('fx-petals');
      if (!cv) return;
      ctx = cv.getContext('2d');
      size = fitCanvas(cv, ctx);
      const n = size.w < 520 ? 14 : 24;
      list = Array.from({ length: n }, () => make(true));
      on = true;
      frame();
      window.addEventListener('resize', () => { size = fitCanvas(cv, ctx); });
      document.addEventListener('visibilitychange', () => {
        cancelAnimationFrame(raf);
        if (!document.hidden && on) frame();
      });
    }

    return { start };
  })();

  /* ---------------- Pháo hoa & hoa giấy ---------------- */
  const FX = (function () {
    const COLORS = ['#FF5A7A', '#FFD45C', '#7ED957', '#5CC8FF', '#FF9F43', '#FFFFFF', '#C77DFF'];
    const G = 0.12;
    let cv, ctx, size = { w: 0, h: 0 }, parts = [], rockets = [], running = false, launchUntil = 0, launchTimer = 0;

    function ensure() {
      if (cv) return true;
      cv = document.getElementById('fx-top');
      if (!cv) return false;
      ctx = cv.getContext('2d');
      size = fitCanvas(cv, ctx);
      window.addEventListener('resize', () => { size = fitCanvas(cv, ctx); });
      return true;
    }

    const pick = () => COLORS[(Math.random() * COLORS.length) | 0];

    function sparks(x, y, color, n, power) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = power * (0.35 + Math.random() * 0.65);
        parts.push({ k: 's', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.011 + Math.random() * 0.012, r: 1.4 + Math.random() * 1.6, c: color });
      }
    }

    function confetti(x, y, n) {
      if (!ensure()) return;
      n = reduceMotion ? Math.min(n || 80, 24) : (n || 80);
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
        const sp = 4 + Math.random() * 7;
        parts.push({ k: 'c', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.006 + Math.random() * 0.006, w: 6 + Math.random() * 5, h: 3 + Math.random() * 4, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, c: pick() });
      }
      run();
    }

    function launch() {
      const x = size.w * (0.15 + Math.random() * 0.7);
      const targetY = size.h * (0.12 + Math.random() * 0.3);
      // Vận tốc đầu tính theo quãng đường cần bay → pháo luôn nổ ở nửa trên màn hình,
      // dù màn điện thoại thấp hay máy tính bảng cao.
      const vy = -Math.sqrt(2 * G * (size.h - targetY));
      rockets.push({ x, y: size.h + 6, vx: (Math.random() - 0.5) * 1.2, vy, c: pick() });
    }

    function fireworks(ms) {
      if (!ensure()) return;
      ms = ms || 4500;
      if (reduceMotion) {
        // Người dùng tắt chuyển động: chỉ vài chùm nổ tại chỗ, không có tên lửa bay vụt.
        [0.3, 0.7, 0.5].forEach((fx, i) => setTimeout(() => { sparks(size.w * fx, size.h * 0.3, pick(), 40, 3); run(); }, i * 500));
        return;
      }
      launchUntil = performance.now() + ms;
      clearInterval(launchTimer);
      launch();
      launchTimer = setInterval(() => {
        if (performance.now() > launchUntil) { clearInterval(launchTimer); launchTimer = 0; return; }
        launch();
        if (Math.random() < 0.45) launch();
      }, 420);
      run();
    }

    function run() {
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }

    function frame() {
      ctx.clearRect(0, 0, size.w, size.h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.vy += G;
        r.x += r.vx;
        r.y += r.vy;
        ctx.strokeStyle = r.c;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - r.vx * 3, r.y - r.vy * 3);
        ctx.stroke();
        if (r.vy > -0.6) {
          sparks(r.x, r.y, r.c, 64, 4.4);
          sparks(r.x, r.y, pick(), 26, 2.4);
          rockets.splice(i, 1);
        }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= p.decay;
        if (p.life <= 0 || p.y > size.h + 30) { parts.splice(i, 1); continue; }
        if (p.k === 's') {
          p.vx *= 0.985;
          p.vy = p.vy * 0.985 + 0.05;
          p.x += p.vx;
          p.y += p.vy;
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          p.vx *= 0.985;
          p.vy = Math.min(p.vy + 0.14, 3.2);
          p.rot += p.vr;
          p.x += p.vx + Math.sin(p.rot) * 0.6;
          p.y += p.vy;
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = Math.min(1, p.life * 2);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (!parts.length && !rockets.length && !launchTimer) {
        running = false;
        ctx.clearRect(0, 0, size.w, size.h);
        return;
      }
      requestAnimationFrame(frame);
    }

    return { confetti, fireworks };
  })();

  /* ---------------- Tim bay ---------------- */
  const HEART_COLORS = ['#C92F52', '#E8577A', '#F27A93', '#F2B705', '#D7261E'];
  function spawnHearts(x, y, n) {
    n = n || 6;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('span');
      el.className = 'float-heart';
      el.innerHTML = window.ART.ICON.heart;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.color = HEART_COLORS[(Math.random() * HEART_COLORS.length) | 0];
      el.style.setProperty('--dx', ((Math.random() - 0.5) * 140).toFixed(0) + 'px');
      el.style.setProperty('--dy', (90 + Math.random() * 130).toFixed(0) + 'px');
      el.style.setProperty('--s', (0.8 + Math.random() * 0.7).toFixed(2));
      el.style.setProperty('--r', ((Math.random() - 0.5) * 50).toFixed(0) + 'deg');
      el.style.animationDelay = i * 60 + 'ms';
      el.addEventListener('animationend', () => el.remove());
      document.body.appendChild(el);
    }
  }

  window.Petals = Petals;
  window.FX = FX;
  window.spawnHearts = spawnHearts;
})();
