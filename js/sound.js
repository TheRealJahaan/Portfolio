/*
 * Tiny synthesised sound effects (no audio files needed).
 * Everything is generated with the Web Audio API and is OFF by default;
 * the speaker button in the top bar turns it on.
 */
window.Sound = (function () {
  var ctx = null;
  var enabled = false;

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // White noise buffer, reused by the engine and the stamp
  function noise(ac, seconds) {
    var buf = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    var src = ac.createBufferSource();
    src.buffer = buf;
    return src;
  }

  // Airport chime: two soft bell tones
  function ding() {
    var ac = audio(); if (!ac) return;
    [659.25, 523.25].forEach(function (freq, i) {
      var t = ac.currentTime + i * 0.32;
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      osc.connect(gain).connect(ac.destination);
      osc.start(t); osc.stop(t + 1);
    });
  }

  // Rubber stamp: a short low thump
  function stamp() {
    var ac = audio(); if (!ac) return;
    var t = ac.currentTime;
    var src = noise(ac, 0.2);
    var filter = ac.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 600;
    var gain = ac.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start(t);
  }

  // Jet engine: filtered noise that swells, holds, and fades over `seconds`
  function engine(seconds) {
    var ac = audio(); if (!ac) return function () {};
    var t = ac.currentTime;
    var src = noise(ac, seconds + 0.5);
    var filter = ac.createBiquadFilter();
    filter.type = "bandpass"; filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(250, t);
    filter.frequency.linearRampToValueAtTime(900, t + seconds * 0.35);
    filter.frequency.linearRampToValueAtTime(400, t + seconds);
    var gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + seconds * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start(t);
    return function stop() {
      try { gain.gain.cancelScheduledValues(ac.currentTime); gain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); src.stop(ac.currentTime + 0.4); } catch (e) {}
    };
  }

  // Split-flap clack
  function flap() {
    var ac = audio(); if (!ac) return;
    var t = ac.currentTime;
    var src = noise(ac, 0.03);
    var filter = ac.createBiquadFilter();
    filter.type = "highpass"; filter.frequency.value = 2500;
    var gain = ac.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start(t);
  }

  function guard(fn) {
    return function () { if (enabled) return fn.apply(null, arguments); return function () {}; };
  }

  return {
    get enabled() { return enabled; },
    set: function (on) { enabled = !!on; if (on) audio(); },
    ding: guard(ding),
    stamp: guard(stamp),
    engine: guard(engine),
    flap: guard(flap)
  };
})();
