/*
 * Toàn bộ hình minh họa vẽ bằng SVG sinh từ code thay vì dùng ảnh PNG/JPG:
 *  - trang không cần file ảnh nào → đẩy lên GitHub là chạy, mạng 3G ở đơn vị vẫn tải nhanh;
 *  - nét luôn sắc trên màn hình điện thoại độ phân giải cao;
 *  - từng bộ phận (cánh tay, mắt, nắp hộp quà) là phần tử riêng nên CSS làm động được.
 * Hình người dùng chung 1 hệ tọa độ cố định, đặt vào cảnh bằng <g transform="translate() scale()">.
 */
(function () {
  'use strict';

  function starPath(cx, cy, R, r) {
    r = r || R * 0.45;
    let d = '';
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r : R;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      d += (i ? 'L' : 'M') + (cx + rad * Math.cos(a)).toFixed(1) + ' ' + (cy + rad * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }

  // Trái tim trong khung 24×24 (cùng hình với icon heart), dùng lại cho cả icon lẫn cảnh phim.
  const HEART_D = 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z';

  // Ngẫu nhiên có hạt giống: sao/hoa giấy trong cảnh phim nằm cố định giữa các lần vẽ lại,
  // nếu dùng Math.random() thì mỗi lần vòng lặp phim quay về cảnh đầu, bầu trời lại "nhảy" chỗ.
  function seeded(seed) {
    let s = seed;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /*
   * Chú bộ đội — khung 0..200 × 0..262.
   * Cánh tay phải (phía trái người xem) gồm 2 khúc lồng nhau, mỗi khúc được bọc trong 1 <g translate>
   * đặt gốc tọa độ ngay tại khớp vai/khuỷu. Lý do: CSS transform trên phần tử SVG xoay quanh gốc
   * (0,0) của hệ tọa độ cục bộ; đặt gốc tại khớp thì chỉ cần rotate() là đủ, khỏi phụ thuộc
   * transform-origin/transform-box vốn xử lý khác nhau giữa Safari và Chrome khi lồng nhiều cấp.
   * Đầu chibi to hơn thân nên tay thẳng không với tới vành mũ — phải gập khuỷu mới ra dáng chào.
   */
  function soldierG(o) {
    o = o || {};
    const skin = o.skin || '#F5CBA7';
    const cls = ['soldier'];
    if (o.salute) cls.push('is-saluting');
    if (o.auto) cls.push('soldier--auto');
    if (o.loop) cls.push('soldier--loop');
    const bouquet = o.bouquet
      ? `<g class="bouquet">
          <path d="M136 196 L150 196 L160 168 L126 168 Z" fill="#FFF3D6" stroke="#E8C98F" stroke-width="2"/>
          <path d="M138 172 L134 150 M143 172 L143 146 M148 172 L154 150" stroke="#4F8A2B" stroke-width="3" stroke-linecap="round"/>
          <circle cx="133" cy="146" r="9" fill="#F27A93"/><circle cx="133" cy="146" r="3.5" fill="#F2B705"/>
          <circle cx="155" cy="146" r="9" fill="#FF9F43"/><circle cx="155" cy="146" r="3.5" fill="#FFF3D6"/>
          <circle cx="144" cy="137" r="10" fill="#E8577A"/><circle cx="144" cy="137" r="4" fill="#F2B705"/>
          <path d="M139 190 l-6 12 M147 190 l6 12" stroke="#D7261E" stroke-width="3" stroke-linecap="round"/>
        </g>`
      : '';
    return `
    <g class="${cls.join(' ')}">
      <rect x="74" y="200" width="22" height="48" rx="8" fill="#2F4A1E"/>
      <rect x="104" y="200" width="22" height="48" rx="8" fill="#2F4A1E"/>
      <rect x="64" y="240" width="34" height="18" rx="8" fill="#1F1D1B"/>
      <rect x="102" y="240" width="34" height="18" rx="8" fill="#1F1D1B"/>
      <rect x="132" y="126" width="20" height="62" rx="10" fill="#4F7330"/>
      <circle cx="142" cy="192" r="9.5" fill="${skin}"/>
      <rect x="90" y="104" width="20" height="18" fill="${skin}"/>
      <rect x="62" y="116" width="76" height="92" rx="22" fill="#5B8238"/>
      <path d="M84 116 L100 134 L92 142 L78 124 Z" fill="#D7261E"/>
      <path d="M116 116 L100 134 L108 142 L122 124 Z" fill="#D7261E"/>
      <rect x="72" y="146" width="20" height="15" rx="3" fill="#4F7330"/>
      <rect x="108" y="146" width="20" height="15" rx="3" fill="#4F7330"/>
      <circle cx="100" cy="152" r="2.6" fill="#F2B705"/>
      <circle cx="100" cy="168" r="2.6" fill="#F2B705"/>
      <rect x="62" y="184" width="76" height="10" fill="#6B4A2B"/>
      <rect x="93" y="182" width="14" height="14" rx="3" fill="#F2B705"/>
      ${bouquet}
      <circle cx="60" cy="78" r="8" fill="${skin}"/>
      <circle cx="140" cy="78" r="8" fill="${skin}"/>
      <circle cx="100" cy="74" r="40" fill="${skin}"/>
      <ellipse class="soldier__eye" cx="86" cy="80" rx="4.5" ry="5.5" fill="#2A2622"/>
      <ellipse class="soldier__eye" cx="114" cy="80" rx="4.5" ry="5.5" fill="#2A2622"/>
      <circle cx="87.5" cy="78" r="1.4" fill="#fff"/>
      <circle cx="115.5" cy="78" r="1.4" fill="#fff"/>
      <ellipse cx="77" cy="92" rx="7" ry="4" fill="#F28B9B" opacity=".55"/>
      <ellipse cx="123" cy="92" rx="7" ry="4" fill="#F28B9B" opacity=".55"/>
      <path d="M90 96 q10 9 20 0" stroke="#7A3B2E" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M58 66 Q60 26 100 24 Q140 26 142 66 Z" fill="#4F7330"/>
      <path d="M52 64 Q100 52 148 64 Q150 73 141 73 Q100 63 59 73 Q50 73 52 64 Z" fill="#3E5E26"/>
      <circle cx="100" cy="45" r="11" fill="#D7261E" stroke="#F2B705" stroke-width="2.5"/>
      <path d="${starPath(100, 45.5, 7)}" fill="#F2B705"/>
      <g transform="translate(66 130)">
        <g class="arm-upper">
          <rect x="-10" y="-4" width="20" height="42" rx="10" fill="#4F7330"/>
          <g transform="translate(0 34)">
            <g class="arm-fore">
              <rect x="-9" y="-4" width="18" height="38" rx="9" fill="#4F7330"/>
              <circle cx="0" cy="36" r="9.5" fill="${skin}"/>
            </g>
          </g>
        </g>
      </g>
    </g>`;
  }

  function soldierSVG(o) {
    return `<svg class="soldier-svg" viewBox="0 0 200 262" aria-hidden="true" focusable="false">${soldierG(o)}</svg>`;
  }

  // Cắt khung nhìn quanh phần đầu của chính hình chú bộ đội → avatar, khỏi vẽ thêm hình riêng.
  function soldierAvatar(skin) {
    return `<svg class="avatar-svg" viewBox="50 18 100 100" aria-hidden="true" focusable="false">${soldierG({ skin })}</svg>`;
  }

  // Cô giáo mặc áo dài — khung 0..160 × 0..262.
  function teacherG() {
    return `
    <g class="teacher">
      <path d="M46 70 Q44 26 80 22 Q116 26 114 70 L118 156 Q80 166 42 156 Z" fill="#2A1E1A"/>
      <rect x="60" y="176" width="16" height="70" rx="6" fill="#FFFFFF"/>
      <rect x="84" y="176" width="16" height="70" rx="6" fill="#FFFFFF"/>
      <ellipse cx="68" cy="250" rx="12" ry="7" fill="#C92F52"/>
      <ellipse cx="92" cy="250" rx="12" ry="7" fill="#C92F52"/>
      <path d="M62 170 L98 170 L104 238 Q80 244 56 238 Z" fill="#E8577A"/>
      <path d="M52 112 Q80 102 108 112 L114 184 Q80 192 46 184 Z" fill="#F27A93"/>
      <circle cx="68" cy="138" r="3" fill="#FFE3EA"/><circle cx="92" cy="156" r="3" fill="#FFE3EA"/>
      <circle cx="80" cy="200" r="3" fill="#FFE3EA"/><circle cx="72" cy="222" r="2.5" fill="#FFE3EA"/>
      <rect x="40" y="114" width="18" height="60" rx="9" fill="#F27A93"/>
      <rect x="102" y="114" width="18" height="60" rx="9" fill="#F27A93"/>
      <rect x="58" y="160" width="44" height="30" rx="4" fill="#3E7BC4" transform="rotate(-6 80 175)"/>
      <rect x="62" y="163" width="36" height="24" rx="2" fill="#FFFFFF" transform="rotate(-6 80 175)"/>
      <circle cx="56" cy="174" r="8" fill="#F8D5B8"/>
      <circle cx="104" cy="170" r="8" fill="#F8D5B8"/>
      <rect x="72" y="96" width="16" height="16" fill="#F8D5B8"/>
      <path d="M70 108 Q80 114 90 108 L90 114 Q80 119 70 114 Z" fill="#E8577A"/>
      <circle cx="80" cy="70" r="32" fill="#F8D5B8"/>
      <path d="M48 66 Q52 34 82 36 Q106 38 112 64 Q96 50 80 52 Q62 54 48 66 Z" fill="#2A1E1A"/>
      <path d="M66 74 q5 -5 10 0" stroke="#2A2622" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M84 74 q5 -5 10 0" stroke="#2A2622" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="62" cy="84" rx="6" ry="3.5" fill="#F28B9B" opacity=".6"/>
      <ellipse cx="98" cy="84" rx="6" ry="3.5" fill="#F28B9B" opacity=".6"/>
      <path d="M73 88 q7 7 14 0" stroke="#B8284A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="108" cy="50" r="6" fill="#F2B705"/><circle cx="108" cy="50" r="2.5" fill="#FFF3D6"/>
    </g>`;
  }

  function flowerSVG(color) {
    let petals = '';
    for (let a = 0; a < 360; a += 60) {
      petals += `<ellipse cx="20" cy="9.5" rx="6.5" ry="9.5" fill="${color}" transform="rotate(${a} 20 20)"/>`;
    }
    return `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">${petals}<circle cx="20" cy="20" r="6.5" fill="#F2B705"/><circle cx="18" cy="18" r="2" fill="#fff" opacity=".7"/></svg>`;
  }

  function giftSVG(color, ribbon) {
    return `<svg viewBox="0 0 120 124" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="116" rx="42" ry="6" fill="rgba(60,40,20,.12)"/>
      <g class="gift__sparkle">
        <path d="${starPath(60, 22, 14, 4)}" fill="#F2B705"/>
        <path d="${starPath(26, 34, 8, 2.5)}" fill="#F27A93"/>
        <path d="${starPath(96, 30, 9, 2.8)}" fill="#5CC8FF"/>
      </g>
      <rect x="18" y="54" width="84" height="58" rx="8" fill="${color}"/>
      <rect x="18" y="54" width="84" height="10" fill="rgba(0,0,0,.12)"/>
      <rect x="53" y="54" width="14" height="58" fill="${ribbon}"/>
      <g class="gift__lid">
        <rect x="12" y="40" width="96" height="20" rx="6" fill="${color}"/>
        <rect x="12" y="52" width="96" height="8" rx="3" fill="rgba(0,0,0,.08)"/>
        <rect x="53" y="40" width="14" height="20" fill="${ribbon}"/>
        <path d="M60 40 C46 16 28 28 42 40 Z" fill="${ribbon}"/>
        <path d="M60 40 C74 16 92 28 78 40 Z" fill="${ribbon}"/>
        <circle cx="60" cy="39" r="6" fill="${ribbon}"/>
      </g>
    </svg>`;
  }

  // Dây cờ đuôi nheo ở đầu trang: các lá cờ đặt dọc theo đường cong bậc 2 của sợi dây.
  function buntingSVG() {
    const colors = ['#D7261E', '#F2B705', '#5E8A3A', '#F27A93', '#5CC8FF'];
    const P0 = [0, 6], P1 = [200, 46], P2 = [400, 6];
    let flags = '';
    const n = 13;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0];
      const y = (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1];
      flags += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><path class="flag" style="--d:${(i * 0.17).toFixed(2)}s" d="M-11 0 H11 L0 26 Z" fill="${colors[i % colors.length]}"/></g>`;
    }
    return `<svg viewBox="0 0 400 80" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
      <path d="M0 6 Q200 46 400 6" stroke="#8A6A4A" stroke-width="2" fill="none"/>${flags}</svg>`;
  }

  function heartAt(x, y, s, color, delay, cls) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls || 'a-rise'}" style="--d:${delay}s"><path d="${HEART_D}" fill="${color}" transform="translate(-12 -12)"/></g></g>`;
  }

  /* ---------- 4 cảnh của thước phim (khung 400×500 = đúng tỉ lệ 4:5 của khung phim) ---------- */

  function scene1() {
    const rnd = seeded(11);
    let stars = '';
    for (let i = 0; i < 30; i++) {
      stars += `<circle class="a-twinkle" style="--d:${(rnd() * 2.4).toFixed(2)}s" cx="${(rnd() * 400).toFixed(0)}" cy="${(rnd() * 230).toFixed(0)}" r="${(0.8 + rnd() * 1.6).toFixed(1)}" fill="#FFFFFF"/>`;
    }
    return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc1-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D1836"/><stop offset=".6" stop-color="#26396A"/><stop offset="1" stop-color="#4E4C7E"/></linearGradient>
        <radialGradient id="sc1-moon"><stop offset="0" stop-color="#FFF6D5" stop-opacity=".85"/><stop offset="1" stop-color="#FFF6D5" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="400" height="500" fill="url(#sc1-sky)"/>
      ${stars}
      <circle cx="318" cy="92" r="72" fill="url(#sc1-moon)"/>
      <circle cx="318" cy="92" r="26" fill="#FFF3C4"/>
      <path d="M0 320 L70 240 L130 292 L200 214 L270 286 L330 236 L400 296 V500 H0 Z" fill="#1A2747"/>
      <path d="M0 362 L90 304 L160 346 L240 296 L320 344 L400 316 V500 H0 Z" fill="#22355B"/>
      <path d="M0 416 Q200 386 400 416 V500 H0 Z" fill="#1D3020"/>
      <rect x="300" y="250" width="4" height="170" fill="#C9C9C9"/>
      <g transform="translate(304 252)"><g class="a-wave">
        <path d="M0 0 H62 Q56 20 62 40 H0 Z" fill="#D7261E"/>
        <path d="${starPath(30, 20, 10)}" fill="#F2B705"/>
      </g></g>
      <g transform="translate(96 178) scale(0.98)"><g class="a-fade-up" style="--d:.2s">${soldierG({ skin: '#EDB98A' })}</g></g>
    </svg>`;
  }

  function scene2() {
    return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs><linearGradient id="sc2-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB38A"/><stop offset=".55" stop-color="#FFD9A8"/><stop offset="1" stop-color="#FFF1D6"/></linearGradient></defs>
      <rect width="400" height="500" fill="url(#sc2-sky)"/>
      <circle cx="300" cy="380" r="60" fill="#FFE08A" opacity=".9"/>
      <path d="M0 380 Q120 330 240 372 T400 360 V500 H0 Z" fill="#8DB255"/>
      <path d="M0 420 Q160 390 400 424 V500 H0 Z" fill="#6E9A3E"/>
      <g transform="translate(14 180) scale(0.95)">${soldierG({})}</g>
      <g transform="translate(190 190)"><g class="a-pop" style="--d:.3s"><circle r="7" fill="#FFFFFF"/></g></g>
      <g transform="translate(214 160)"><g class="a-pop" style="--d:.55s"><circle r="11" fill="#FFFFFF"/></g></g>
      <g transform="translate(244 126)"><g class="a-pop" style="--d:.8s"><circle r="15" fill="#FFFFFF"/></g></g>
      <g transform="translate(300 86)"><g class="a-pop" style="--d:1.05s">
        <path d="M-70 20 Q-84 -8 -58 -20 Q-56 -52 -22 -48 Q-6 -72 22 -56 Q52 -66 60 -36 Q88 -30 78 0 Q92 26 62 36 Q48 60 18 48 Q-4 66 -28 50 Q-62 58 -70 20 Z" fill="#FFFFFF"/>
        <rect x="-34" y="-12" width="68" height="40" rx="3" fill="#FFE9A8"/>
        <path d="M-42 -10 L0 -38 L42 -10 Z" fill="#D7261E"/>
        <rect x="-8" y="8" width="16" height="20" rx="2" fill="#8A5A3A"/>
        <rect x="-28" y="0" width="12" height="11" rx="2" fill="#5CC8FF"/>
        <rect x="16" y="0" width="12" height="11" rx="2" fill="#5CC8FF"/>
        <rect x="-1" y="-60" width="2" height="24" fill="#8A6A4A"/>
        <path d="M1 -60 H18 L14 -54 L18 -48 H1 Z" fill="#D7261E"/>
        <text x="0" y="44" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="12" fill="#3E5E26">Trường Mầm non</text>
      </g></g>
      ${heartAt(270, 40, 0.9, '#F27A93', 1.6)}${heartAt(330, 46, 0.7, '#E8577A', 2.3)}${heartAt(300, 30, 1.1, '#C92F52', 3)}
    </svg>`;
  }

  function scene3() {
    let rays = '';
    for (let a = 0; a < 360; a += 30) {
      rays += `<rect x="-3" y="-58" width="6" height="18" rx="3" fill="#F2B705" transform="rotate(${a})"/>`;
    }
    const colors = ['#F27A93', '#FF9F43', '#C77DFF', '#E8577A'];
    let sprouts = '';
    [196, 246, 296, 346].forEach((x, i) => {
      const d = 0.4 + i * 0.35;
      const h = 54 + (i % 2) * 14;
      sprouts += `<g transform="translate(${x} 424)"><g class="a-grow" style="--d:${d}s">
        <path d="M0 0 V-${h}" stroke="#4F8A2B" stroke-width="4" stroke-linecap="round"/>
        <path d="M0 -${h * 0.45} Q-20 -${h * 0.55} -22 -${h * 0.75} Q-4 -${h * 0.7} 0 -${h * 0.5} Z" fill="#7CB342"/>
        <path d="M0 -${h * 0.3} Q20 -${h * 0.4} 22 -${h * 0.6} Q4 -${h * 0.55} 0 -${h * 0.35} Z" fill="#7CB342"/>
        <g transform="translate(-16 -${h + 16}) scale(.8)"><g class="a-pop" style="--d:${(d + 0.8).toFixed(2)}s">${flowerSVG(colors[i]).replace('<svg', '<svg width="40" height="40"')}</g></g>
      </g></g>`;
    });
    return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs><linearGradient id="sc3-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BDE6FF"/><stop offset="1" stop-color="#EEF9FF"/></linearGradient></defs>
      <rect width="400" height="500" fill="url(#sc3-sky)"/>
      <g transform="translate(330 84)"><g class="a-spin">${rays}</g><circle r="30" fill="#FFD45C"/></g>
      <g transform="translate(60 70)"><path d="M0 20 Q0 0 22 2 Q34 -14 54 0 Q76 0 74 20 Z" fill="#FFFFFF" opacity=".9"/></g>
      <path d="M0 404 Q200 380 400 404 V500 H0 Z" fill="#9CCB5B"/>
      <path d="M0 440 Q200 420 400 444 V500 H0 Z" fill="#86B847"/>
      <g transform="translate(10 168) scale(1.02)"><g class="a-fade-up" style="--d:.1s">${teacherG()}</g></g>
      ${sprouts}
      ${heartAt(150, 150, 0.8, '#F27A93', 2)}${heartAt(250, 200, 0.6, '#E8577A', 2.8)}
    </svg>`;
  }

  function scene4() {
    const rnd = seeded(7);
    const colors = ['#F27A93', '#F2B705', '#5CC8FF', '#7ED957', '#C77DFF', '#FF9F43'];
    let confetti = '';
    for (let i = 0; i < 26; i++) {
      const x = (rnd() * 400).toFixed(0), y = (rnd() * 300).toFixed(0), r = (rnd() * 180).toFixed(0);
      confetti += `<rect class="a-twinkle" style="--d:${(rnd() * 2).toFixed(2)}s" x="${x}" y="${y}" width="8" height="4" rx="1.5" fill="${colors[i % colors.length]}" transform="rotate(${r} ${x} ${y})"/>`;
    }
    return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs><linearGradient id="sc4-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD0DC"/><stop offset="1" stop-color="#FFF2E2"/></linearGradient></defs>
      <rect width="400" height="500" fill="url(#sc4-sky)"/>
      ${confetti}
      <g transform="translate(200 76)"><g class="a-pop" style="--d:.2s">
        <path d="M-150 -30 H150 L136 0 L150 30 H-150 L-136 0 Z" fill="#C92F52"/>
        <text x="0" y="16" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="44" fill="#FFFFFF">20 · 11</text>
      </g></g>
      <text x="200" y="138" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="19" fill="#21351A">Ngày Nhà giáo Việt Nam</text>
      <ellipse cx="200" cy="452" rx="190" ry="26" fill="#F7C6D2"/>
      <g transform="translate(8 196) scale(0.96)">${soldierG({ bouquet: true, auto: true })}</g>
      <g transform="translate(232 190) scale(1)">${teacherG()}</g>
      ${heartAt(200, 250, 1, '#E8577A', 1)}${heartAt(214, 290, 0.7, '#F27A93', 1.8)}${heartAt(190, 270, 0.8, '#C92F52', 2.6)}
    </svg>`;
  }

  /* ---------- Icon nét (cùng phong cách Lucide, viết sẵn để khỏi tải thư viện icon) ---------- */
  const s = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
  const ICON = {
    heart: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${HEART_D}"/></svg>`,
    music: s('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
    mute: s('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>'),
    play: s('<polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/>'),
    pause: s('<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>'),
    sparkles: s('<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M3 5h4"/>')
  };

  window.ART = {
    starPath, soldierSVG, soldierAvatar, flowerSVG, giftSVG, buntingSVG, ICON, HEART_D,
    scenes: [scene1, scene2, scene3, scene4]
  };
})();
