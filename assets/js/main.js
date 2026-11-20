/*
 * Điều phối toàn trang: đọc nội dung từ config.js, dựng các khối tương tác và gắn sự kiện.
 * Mỗi khối là 1 hàm init riêng, chạy độc lập — một khối lỗi (vd thiếu dữ liệu) không kéo sập cả trang.
 */
(function () {
  'use strict';

  const CFG = window.LOI_CHUC || {};
  const ART = window.ART;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // localStorage có thể ném lỗi (chế độ ẩn danh Safari, bị chặn cookie) → luôn bọc try/catch,
  // mất dữ liệu đếm hoa/tim cũng không sao, miễn trang không chết.
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('2011:' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('2011:' + key, JSON.stringify(value)); } catch (e) { /* bỏ qua */ }
    }
  };

  function safe(name, fn) {
    try { fn(); } catch (err) { console.error('[' + name + ']', err); }
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------------- Thông báo nhỏ ---------------- */
  let toastTimer = 0;
  function toast(msg, ms) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-shown'), ms || 2800);
  }

  /* ---------------- Người nhận (link riêng ?ten=Lan) ---------------- */
  const params = new URLSearchParams(location.search);
  // Người gửi hay gõ luôn "cô Lan" vào link → bỏ chữ "cô" thừa để khỏi thành "cô giáo cô Lan".
  const ten = (params.get('ten') || '').trim().replace(/^c[ôo]\s+(gi[áa]o\s+)?/i, '').slice(0, 40);
  const recipient = ten ? 'cô giáo ' + ten : (CFG.nguoiNhanMacDinh || 'các cô giáo mầm non');
  const recipientShort = ten ? 'cô ' + ten : 'các cô';
  const signature = (CFG.kyTen || 'Các chú bộ đội') + (CFG.donVi ? ' — ' + CFG.donVi : '');

  function initText() {
    // textContent (không dùng innerHTML) vì tên lấy từ URL — ai cũng sửa được link.
    $$('[data-recipient]').forEach((el) => { el.textContent = recipient; });
    $$('[data-recipient-short]').forEach((el) => { el.textContent = recipientShort; });
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
    $$('[data-sign]').forEach((el) => { el.textContent = signature; });
    if (ten) document.title = 'Gửi cô ' + ten + ' — Các chú bộ đội chúc mừng 20/11';
  }

  function initArt() {
    $$('[data-icon]').forEach((el) => { el.outerHTML = ART.ICON[el.dataset.icon] || ''; });
    $('[data-art="bunting"]').innerHTML = ART.buntingSVG();
    $('[data-art="seal"]').innerHTML = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="${ART.starPath(20, 21, 11)}" fill="#F2B705"/></svg>`;
    $('[data-art="stamp"]').innerHTML = `<svg viewBox="0 0 64 76" aria-hidden="true">
      <rect x="2" y="2" width="60" height="72" rx="4" fill="#FFF" stroke="#E7D3BC" stroke-width="2" stroke-dasharray="4 3"/>
      <rect x="9" y="9" width="46" height="46" rx="3" fill="#D7261E"/>
      <path d="${ART.starPath(32, 33, 15)}" fill="#F2B705"/>
      <text x="32" y="68" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-weight="800" font-size="10" fill="#3E5E26">20·11</text></svg>`;
    $$('.soldier-btn').forEach((btn) => {
      btn.innerHTML = ART.soldierSVG({ skin: btn.dataset.skin, bouquet: !!btn.dataset.bouquet });
    });
    $('#finale-soldiers').innerHTML = ['#EDB98A', '#F5CBA7', '#E3A87C'].map((skin, i) =>
      `<div class="finale__soldier" style="--d:${i * 0.35}s">${ART.soldierSVG({ skin, loop: true })}</div>`).join('');
    $('#btn-dock-fw').innerHTML = ART.ICON.sparkles;
  }

  /* ---------------- Màn mở thư ---------------- */
  let opened = false;
  function revealPage(withMusic) {
    if (opened) return;
    opened = true;
    if (withMusic) Music.play(); // phải gọi ngay trong sự kiện chạm, xem ghi chú ở music.js
    const intro = $('#intro');
    $('#envelope').classList.add('is-open');
    setTimeout(() => {
      intro.classList.add('is-gone');
      $('#main').inert = false;
      document.body.classList.remove('is-locked');
      $('#dock').classList.add('is-shown');
      if (withMusic) {
        FX.confetti(window.innerWidth / 2, window.innerHeight * 0.4, 110);
        $('#hero-title').focus({ preventScroll: true });
        heroGreet();
      }
      Petals.start();
    }, withMusic && !reduceMotion ? 1150 : 0);
    setTimeout(() => { intro.hidden = true; }, withMusic ? 2000 : 0);
  }

  function initIntro() {
    $('#btn-open').addEventListener('click', () => revealPage(true));
    // Link trỏ thẳng tới 1 mục (vd ...#vuon-hoa) thì bỏ qua phong bì, cuộn luôn tới đó.
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target && $('#main').contains(target)) {
      revealPage(false);
      requestAnimationFrame(() => target.scrollIntoView());
    }
  }

  /* ---------------- Các chú chào ở trang đầu ---------------- */
  const greetings = (CFG.chaoHoi && CFG.chaoHoi.length) ? CFG.chaoHoi : ['Chào cô ạ!'];
  let greetIdx = 0;

  function salute(wrap) {
    const soldier = $('.soldier', wrap);
    const bubble = $('.bubble', wrap);
    soldier.classList.add('is-saluting');
    bubble.textContent = greetings[greetIdx++ % greetings.length];
    bubble.classList.add('is-shown');
    clearTimeout(wrap._t);
    wrap._t = setTimeout(() => {
      soldier.classList.remove('is-saluting');
      bubble.classList.remove('is-shown');
    }, 2400);
  }

  function heroGreet() {
    const wraps = $$('.soldier-wrap');
    setTimeout(() => salute(wraps[0]), 500);
    setTimeout(() => salute(wraps[1]), 1500);
  }

  function initHero() {
    $$('.soldier-wrap').forEach((wrap) => {
      $('.soldier-btn', wrap).addEventListener('click', (e) => {
        salute(wrap);
        const c = centerOf(e.currentTarget);
        spawnHearts(c.x, c.y - 30, 5);
      });
    });
  }

  /* ---------------- Lá thư gõ chữ ---------------- */
  function initLetter() {
    const paras = CFG.thu || [];
    const body = $('#letter-body');
    const sign = $('#letter-sign');
    const skipBtn = $('#letter-skip');
    // Bản đầy đủ cho trình đọc màn hình — bản đang gõ thì ẩn với nó, đọc từng chữ một rất khó nghe.
    $('#letter-full').textContent = paras.join(' ') + ' ' + signature;
    sign.textContent = signature;

    const nodes = paras.map(() => {
      const p = document.createElement('p');
      const t = document.createTextNode('');
      p.appendChild(t);
      body.appendChild(p);
      return t;
    });
    const caret = document.createElement('span');
    caret.className = 'caret';

    let done = false, started = false, pi = 0, ci = 0, timer = 0;

    function finish() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      nodes.forEach((n, i) => { n.data = paras[i]; });
      caret.remove();
      sign.classList.add('is-shown');
      skipBtn.hidden = true;
    }

    function step() {
      if (done) return;
      if (pi >= paras.length) { finish(); return; }
      const text = paras[pi];
      ci++;
      nodes[pi].data = text.slice(0, ci);
      nodes[pi].parentNode.appendChild(caret);
      const ch = text[ci - 1];
      let delay = 22;
      if (ch === '.' || ch === '!' || ch === '?' || ch === '—') delay = 320;
      else if (ch === ',' || ch === ':') delay = 140;
      if (ci >= text.length) { pi++; ci = 0; delay = 450; }
      timer = setTimeout(step, delay);
    }

    skipBtn.addEventListener('click', finish);

    if (reduceMotion || !('IntersectionObserver' in window)) { finish(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        io.disconnect();
        step();
      }
    }, { threshold: 0.35 });
    io.observe($('.letter'));
  }

  /* ---------------- Thước phim kiểu story ---------------- */
  function initStory() {
    const root = $('#story');
    const stage = $('.story__stage', root);
    const barsEl = $('.story__bars', root);
    const caption = $('.story__caption', root);
    const toggle = $('.story__toggle', root);
    const caps = CFG.phim || [];
    const DUR = 5600;

    const scenes = ART.scenes.map((fn) => {
      const div = document.createElement('div');
      div.className = 'scene';
      div.innerHTML = fn();
      stage.appendChild(div);
      return div;
    });
    const bars = scenes.map(() => {
      const b = document.createElement('span');
      b.className = 'story__bar';
      b.innerHTML = '<i></i>';
      barsEl.appendChild(b);
      return b.firstChild;
    });

    let idx = 0, playing = false, userPaused = false, elapsed = 0, t0 = 0, raf = 0;

    function show(i) {
      idx = (i + scenes.length) % scenes.length;
      scenes.forEach((s, k) => s.classList.toggle('is-active', k === idx));
      bars.forEach((b, k) => { b.style.transform = 'scaleX(' + (k < idx ? 1 : 0) + ')'; });
      caption.classList.remove('is-in');
      void caption.offsetWidth; // ép trình duyệt tính lại để animation phụ đề chạy lại từ đầu
      caption.textContent = caps[idx] || '';
      caption.classList.add('is-in');
      elapsed = 0;
      t0 = performance.now();
    }

    function tick(now) {
      if (!playing) return;
      elapsed = now - t0;
      const p = Math.min(elapsed / DUR, 1);
      bars[idx].style.transform = 'scaleX(' + p + ')';
      if (p >= 1) show(idx + 1);
      raf = requestAnimationFrame(tick);
    }

    function setToggle() {
      toggle.innerHTML = playing ? ART.ICON.pause : ART.ICON.play;
      toggle.setAttribute('aria-label', playing ? 'Tạm dừng phim' : 'Phát phim');
      root.classList.toggle('is-paused', !playing);
    }

    function play() {
      if (playing) return;
      playing = true;
      t0 = performance.now() - elapsed;
      raf = requestAnimationFrame(tick);
      setToggle();
    }

    function pause() {
      playing = false;
      cancelAnimationFrame(raf);
      setToggle();
    }

    $('.story__nav--prev', root).addEventListener('click', () => show(idx - 1));
    $('.story__nav--next', root).addEventListener('click', () => show(idx + 1));
    toggle.addEventListener('click', () => {
      userPaused = playing;
      playing ? pause() : play();
    });

    show(0);
    setToggle();

    // Chỉ chạy khi khung phim đang nằm trên màn hình: cuộn qua rồi quay lại vẫn xem tiếp đúng chỗ,
    // và không tốn pin vẽ hoạt hình ở chỗ không ai nhìn.
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !userPaused) play();
      else if (!visible) pause();
    }, { threshold: 0.55 }).observe(root);
  }

  /* ---------------- Video thật từ config ---------------- */
  function initVideos() {
    const list = CFG.video || [];
    const wrap = $('#videos');
    if (!list.length) { wrap.hidden = true; return; }
    const out = $('#video-list');
    let musicWasOn = false;

    list.forEach((v, i) => {
      const fig = document.createElement('figure');
      fig.className = 'video-card reveal';
      fig.style.setProperty('--i', i);
      const title = v.tieuDe || 'Video lời chúc ' + (i + 1);

      if (v.youtube) {
        const id = String(v.youtube).replace(/[^\w-]/g, '');
        // Chỉ tải iframe YouTube khi bấm: mỗi iframe nặng ~1MB, tải sẵn vài cái là trang ì hẳn trên 4G.
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'yt';
        btn.setAttribute('aria-label', 'Phát video: ' + title);
        btn.innerHTML = `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"><span class="yt__play">${ART.ICON.play}</span>`;
        btn.addEventListener('click', () => {
          if (Music.isPlaying()) { musicWasOn = true; Music.pause(); }
          const ifr = document.createElement('iframe');
          ifr.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
          ifr.title = title;
          ifr.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
          ifr.allowFullscreen = true;
          btn.replaceWith(ifr);
        }, { once: true });
        fig.appendChild(btn);
      } else if (v.file) {
        const video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        if (v.poster) video.poster = v.poster;
        video.src = v.file;
        // Đang có nhạc nền mà bấm xem video thì 2 tiếng chồng nhau → tạm tắt nhạc, xem xong bật lại.
        video.addEventListener('play', () => {
          if (Music.isPlaying()) { musicWasOn = true; Music.pause(); }
        });
        const resume = () => {
          if (musicWasOn && !$$('video').some((x) => !x.paused)) { musicWasOn = false; Music.play(); }
        };
        video.addEventListener('pause', resume);
        video.addEventListener('ended', resume);
        fig.appendChild(video);
      }
      const cap = document.createElement('figcaption');
      cap.textContent = title;
      fig.appendChild(cap);
      out.appendChild(fig);
    });
  }

  /* ---------------- Thẻ lật ---------------- */
  function initCards() {
    const list = CFG.cacChu || [];
    const wrap = $('#cards');
    const skins = ['#F5CBA7', '#EDB98A', '#F8D5B8', '#E3A87C'];
    list.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card reveal';
      btn.style.setProperty('--i', i % 2);
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `
        <span class="card__inner">
          <span class="card__face card__front">
            <span class="card__avatar">${ART.soldierAvatar(skins[i % skins.length])}</span>
            <span class="card__name"></span>
            <span class="card__tap">Chạm để đọc</span>
          </span>
          <span class="card__face card__back">
            <span class="card__from"></span>
            <span class="card__msg"></span>
          </span>
        </span>`;
      $('.card__name', btn).textContent = c.ten;
      $('.card__from', btn).textContent = c.ten + ' gửi cô';
      $('.card__msg', btn).textContent = c.loiChuc;
      btn.addEventListener('click', () => {
        const flipped = btn.classList.toggle('is-flipped');
        btn.setAttribute('aria-pressed', String(flipped));
        if (flipped) {
          const p = centerOf(btn);
          spawnHearts(p.x, p.y, 4);
        }
      });
      wrap.appendChild(btn);
    });
  }

  /* ---------------- Vườn hoa ---------------- */
  function initGarden() {
    const garden = $('#garden');
    const hint = $('#garden-hint');
    const countEl = $('#flower-count');
    const COLORS = ['#F27A93', '#E8577A', '#FF9F43', '#C77DFF', '#FFD45C', '#FF6B6B', '#5CC8FF', '#FFFFFF'];
    const MAX = 40;
    const MILESTONES = {
      1: 'Bông hoa đầu tiên dành tặng cô!',
      10: '10 bông rồi — vườn hoa bắt đầu rực rỡ!',
      25: '25 bông! Các chú vỗ tay khen cô chăm chỉ!',
      50: '50 bông hoa — cả thao trường thơm ngát!',
      100: '100 bông! Đúng là cô giáo mầm non kiên nhẫn nhất!'
    };
    let count = store.get('hoa', 0);
    countEl.textContent = count;

    function plant(x, y, silent) {
      const H = garden.clientHeight;
      const W = garden.clientWidth;
      const groundY = H - 54;
      x = Math.max(22, Math.min(W - 22, x));
      y = Math.max(46, Math.min(groundY - 26, y));
      const f = document.createElement('div');
      f.className = 'flower';
      f.style.left = x + 'px';
      f.style.top = (y - 19) + 'px';
      f.style.height = (groundY - y + 19 + 8) + 'px';
      f.style.setProperty('--tilt', ((Math.random() - 0.5) * 16).toFixed(1) + 'deg');
      f.innerHTML = `<span class="flower__stem"></span><span class="flower__head">${ART.flowerSVG(COLORS[(Math.random() * COLORS.length) | 0])}</span>`;
      if (silent) f.classList.add('is-static');
      garden.appendChild(f);
      const all = $$('.flower', garden);
      if (all.length > MAX) all[0].remove();
      hint.classList.add('is-hidden');
      if (silent) return;
      count++;
      countEl.textContent = count;
      store.set('hoa', count);
      if (MILESTONES[count]) {
        toast(MILESTONES[count]);
        const r = garden.getBoundingClientRect();
        FX.confetti(r.left + x, r.top + y, 50);
      }
    }

    garden.addEventListener('click', (e) => {
      const r = garden.getBoundingClientRect();
      plant(e.clientX - r.left, e.clientY - r.top);
    });
    $('#btn-plant').addEventListener('click', () => {
      plant(30 + Math.random() * (garden.clientWidth - 60), 60 + Math.random() * (garden.clientHeight - 150));
    });

    // Người xem quay lại trang thì vườn không trống trơn: vẽ lại vài bông tượng trưng cho số đã trồng.
    if (count > 0) {
      requestAnimationFrame(() => {
        const n = Math.min(count, 12);
        for (let i = 0; i < n; i++) {
          plant(30 + Math.random() * (garden.clientWidth - 60), 60 + Math.random() * (garden.clientHeight - 150), true);
        }
      });
    }
  }

  /* ---------------- Hộp quà ---------------- */
  function initGifts() {
    const pool = shuffle(CFG.quaBiMat || []).slice(0, 3);
    const wrap = $('#gifts');
    const dialog = $('#gift-dialog');
    const palette = [['#E8577A', '#FFD45C'], ['#5E8A3A', '#F2B705'], ['#5CA8E8', '#F27A93']];
    let openedCount = 0;

    $('#gift-art').innerHTML = ART.soldierSVG({ bouquet: true, salute: true });

    function showGift(g) {
      $('#gift-title').textContent = g.tieuDe;
      $('#gift-text').textContent = g.noiDung;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }

    pool.forEach((g, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gift reveal';
      btn.style.setProperty('--i', i);
      btn.innerHTML = ART.giftSVG(palette[i][0], palette[i][1]) + `<span class="gift__label">Hộp quà số ${i + 1}</span>`;
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-open')) { showGift(g); return; }
        if (btn.classList.contains('is-shaking')) return;
        btn.classList.add('is-shaking');
        setTimeout(() => {
          btn.classList.remove('is-shaking');
          btn.classList.add('is-open');
          $('.gift__label', btn).textContent = 'Xem lại quà';
          const c = centerOf(btn);
          FX.confetti(c.x, c.y - 20, 90);
          openedCount++;
          setTimeout(() => {
            showGift(g);
            if (openedCount === pool.length) {
              setTimeout(() => toast('Cô đã mở hết quà rồi! Các chú vui lắm.'), 600);
            }
          }, 450);
        }, reduceMotion ? 0 : 650);
      });
      wrap.appendChild(btn);
    });

    $('#gift-close').addEventListener('click', () => {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    });
    // Chạm ra ngoài khung (vùng nền mờ) cũng đóng — thói quen quen thuộc trên điện thoại.
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog && typeof dialog.close === 'function') dialog.close();
    });
  }

  /* ---------------- Lời đáp + thả tim ---------------- */
  function initReply() {
    const ta = $('#reply-text');
    const err = $('#reply-error');
    ta.value = store.get('nhap', '');
    ta.addEventListener('input', () => {
      store.set('nhap', ta.value);
      if (ta.value.trim()) err.textContent = '';
    });

    $$('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const add = chip.textContent.trim();
        ta.value = ta.value.trim() ? ta.value.trim() + ' ' + add : add;
        store.set('nhap', ta.value);
        err.textContent = '';
        chip.classList.add('is-used');
      });
    });

    async function copy(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        // Trình duyệt trong Zalo/Messenger hay chặn clipboard API → cách cũ vẫn chạy được.
        ta.select();
        try { return document.execCommand('copy'); } catch (e2) { return false; }
      }
    }

    $('#btn-send').addEventListener('click', async () => {
      const msg = ta.value.trim();
      if (!msg) {
        err.textContent = 'Cô viết vài dòng hoặc chọn một câu gợi ý ở trên trước nhé.';
        ta.focus();
        return;
      }
      const text = msg + '\n— ' + (ten ? 'Cô ' + ten : 'Cô giáo') + ' gửi các chú bộ đội nhân ngày 20/11';
      if (navigator.share) {
        try {
          await navigator.share({ text });
          toast('Cảm ơn cô! Các chú sẽ vui lắm đấy.');
          return;
        } catch (e) {
          if (e && e.name === 'AbortError') return; // người xem tự đóng bảng chia sẻ
        }
      }
      const ok = await copy(text);
      toast(ok ? 'Đã chép lời nhắn — cô dán vào Zalo/Messenger gửi các chú nhé!' : 'Cô bấm giữ vào ô chữ để chép lời nhắn nhé.', 3600);
    });

    const heartBtn = $('#btn-heart');
    const heartCount = $('#heart-count');
    let hearts = store.get('tim', 0);
    const render = () => {
      heartCount.textContent = hearts ? 'Cô đã thả ' + hearts + ' tim cho các chú' : 'Chạm để thả tim cho các chú';
    };
    render();
    heartBtn.addEventListener('click', () => {
      hearts++;
      store.set('tim', hearts);
      render();
      const c = centerOf(heartBtn);
      spawnHearts(c.x, c.y, 7);
      heartBtn.classList.remove('is-beat');
      void heartBtn.offsetWidth;
      heartBtn.classList.add('is-beat');
      if (hearts === 20) toast('20 tim! Cả đơn vị nhận được rồi ạ!');
    });
  }

  /* ---------------- Kết: pháo hoa + tạo link ---------------- */
  function initFinale() {
    const fire = () => {
      FX.fireworks(5000);
      toast('Chúc mừng Ngày Nhà giáo Việt Nam 20/11!');
    };
    $('#btn-fireworks').addEventListener('click', fire);
    $('#btn-dock-fw').addEventListener('click', fire);

    // Cuộn tới cuối trang lần đầu thì tự bắn một loạt pháo hoa ngắn làm "phần thưởng".
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { io.disconnect(); FX.fireworks(2600); }
      }, { threshold: 0.5 });
      io.observe($('.finale__title'));
    }

    const input = $('#maker-name');
    const out = $('#maker-out');
    const base = location.href.split('#')[0].split('?')[0];
    const linkFor = (name) => (name ? base + '?ten=' + encodeURIComponent(name) : base);
    input.addEventListener('input', () => { out.textContent = linkFor(input.value.trim()); });
    out.textContent = linkFor('');
    $('#maker-copy').addEventListener('click', async () => {
      const link = linkFor(input.value.trim());
      try {
        await navigator.clipboard.writeText(link);
        toast('Đã chép link — dán vào tin nhắn gửi cô nhé!');
      } catch (e) {
        toast('Không chép tự động được, bấm giữ vào link bên dưới để chép.', 3600);
      }
    });
  }

  /* ---------------- Nút nổi nhạc ---------------- */
  function initDock() {
    Music.init(CFG.nhacNen || '');
    const btn = $('#btn-music');
    const render = (on) => {
      btn.innerHTML = on ? ART.ICON.music : ART.ICON.mute;
      btn.classList.toggle('is-playing', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Tắt nhạc' : 'Bật nhạc');
    };
    render(false);
    Music.onChange(render);
    btn.addEventListener('click', () => Music.toggle());
  }

  /* ---------------- Hiện dần khi cuộn ---------------- */
  function initReveal() {
    const items = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  }

  safe('text', initText);
  safe('art', initArt);
  safe('dock', initDock);
  safe('hero', initHero);
  safe('letter', initLetter);
  safe('story', initStory);
  safe('videos', initVideos);
  safe('cards', initCards);
  safe('garden', initGarden);
  safe('gifts', initGifts);
  safe('reply', initReply);
  safe('finale', initFinale);
  safe('reveal', initReveal); // chạy sau cùng để bắt cả các khối vừa được dựng bằng JS
  safe('intro', initIntro);
})();
