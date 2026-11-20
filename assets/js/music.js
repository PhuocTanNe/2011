/*
 * Nhạc nền. Ưu tiên file mp3 trong config (nhacNen); không có file hoặc file lỗi thì tự chơi
 * một giai điệu hộp nhạc tổng hợp bằng Web Audio — trang vẫn có nhạc mà không cần tải file nào,
 * và giai điệu tự viết nên không vướng bản quyền khi đăng công khai trên GitHub.
 *
 * iOS Safari chỉ cho phát âm thanh nếu AudioContext được tạo/resume ĐỒNG BỘ ngay trong sự kiện
 * chạm của người dùng. Vì vậy play() luôn mở khóa context trước, rồi mới thử phát file: nếu file
 * hỏng thì lời hứa (promise) bị từ chối SAU khi đã thoát sự kiện chạm, lúc đó context đã sẵn sàng
 * để chuyển sang hộp nhạc mà không bị chặn.
 */
(function () {
  'use strict';

  const BPM = 92;
  const STEP = 60 / BPM / 2; // mỗi bước = 1 nốt móc đơn
  const _ = 0;
  // 8 ô nhịp × 8 bước, số là cao độ MIDI (72 = Đô 5), 0 = lặng.
  const MELODY = [
    76, _, 79, _, 84, _, 79, _,
    74, _, 79, _, 83, _, 79, _,
    72, _, 76, _, 81, _, 79, 76,
    77, _, 76, _, 74, _, _, _,
    76, _, 79, _, 84, _, 86, _,
    83, _, 81, _, 79, _, 76, _,
    77, _, 81, _, 79, _, 74, _,
    72, _, _, _, 76, 79, 84, _
  ];
  // Bè trầm: 1 nốt mỗi nửa ô nhịp (C – G – Am – F – C – G – F – C).
  const BASS = [48, 55, 43, 50, 45, 52, 41, 48, 48, 55, 43, 50, 41, 48, 48, 43];

  let ctx = null, master = null, audio = null, useSynth = true;
  let playing = false, timer = 0, nextTime = 0, step = 0;
  const listeners = [];

  function emit() { listeners.forEach((fn) => fn(playing)); }

  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3000;
      master.connect(lp);
      lp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(midi, t, dur, vol, type) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // Lên lịch trước ~0.3s theo đồng hồ của AudioContext: setInterval bị trình duyệt làm trễ thất
  // thường, nếu phát nốt ngay trong callback thì nhịp sẽ lệch nghe rõ.
  function schedule() {
    while (nextTime < ctx.currentTime + 0.3) {
      const m = MELODY[step % MELODY.length];
      if (m) {
        tone(m, nextTime, 1.2, 0.16, 'sine');
        tone(m + 12, nextTime, 0.45, 0.025, 'triangle');
      }
      if (step % 4 === 0) tone(BASS[(step / 4) % BASS.length], nextTime, 1.7, 0.07, 'sine');
      nextTime += STEP;
      step++;
    }
  }

  function startSynth() {
    if (!unlock()) return;
    clearInterval(timer);
    nextTime = ctx.currentTime + 0.08;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
    schedule();
    timer = setInterval(schedule, 90);
  }

  function stopSynth() {
    clearInterval(timer);
    timer = 0;
    if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
  }

  function init(src) {
    if (!src) return;
    useSynth = false;
    audio = new Audio();
    audio.loop = true;
    audio.preload = 'none';
    audio.src = src;
    audio.addEventListener('error', () => {
      useSynth = true;
      if (playing) startSynth();
    });
  }

  function play() {
    unlock();
    playing = true;
    if (!useSynth && audio) {
      audio.volume = 0.7;
      const p = audio.play();
      if (p && p.catch) {
        p.catch(() => {
          useSynth = true;
          if (playing) startSynth();
        });
      }
    } else {
      startSynth();
    }
    emit();
  }

  function pause() {
    playing = false;
    if (audio) audio.pause();
    stopSynth();
    emit();
  }

  // Ẩn tab / khóa màn hình thì tạm dừng, quay lại thì phát tiếp — tránh nhạc kêu khi
  // người xem đã chuyển sang Zalo mà không biết tắt ở đâu.
  let resumeOnShow = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeOnShow = playing;
      if (playing) pause();
    } else if (resumeOnShow) {
      resumeOnShow = false;
      play();
    }
  });

  window.Music = {
    init,
    play,
    pause,
    toggle() { playing ? pause() : play(); },
    isPlaying: () => playing,
    onChange(fn) { listeners.push(fn); }
  };
})();
