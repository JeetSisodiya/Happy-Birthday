/**************************************************************
     * 1. APPLICATION STATE & URL CUSTOMIZATION
     **************************************************************/
    const appState = {
      recipient: 'ROBIN',
      sender: 'JERRY',
      author: 'luffy',
      candlesLit: [true, true, true],
      windPower: 0,
      holdingCloudPuffer: false,
      micListening: false,
      cinemaActive: false,
      cinemaPaused: false,
      cinemaMuted: false,
      currentSceneIdx: 0,
      compassAngle: 0
    };

    const params = new URLSearchParams(window.location.search);
    if (params.get('to')) appState.recipient = params.get('to').slice(0, 14).toUpperCase();
    if (params.get('from')) appState.sender = params.get('from').slice(0, 16).toUpperCase();
    if (params.get('by')) appState.author = params.get('by').slice(0, 16);

    function showStickerToast(msg, icon = '✨') {
      const el = document.getElementById('stickerToast');
      document.getElementById('stickerToastMsg').textContent = msg;
      document.getElementById('stickerToastIcon').textContent = icon;
      el.classList.remove('opacity-0', 'translate-y-4');
      el.classList.add('opacity-100', 'translate-y-0');
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => {
        el.classList.add('opacity-0', 'translate-y-4');
        el.classList.remove('opacity-100', 'translate-y-0');
      }, 3000);
    }

    /**************************************************************
     * 2. WEB AUDIO SYNTHESIZER (CELESTA MUSIC BOX & EMOTIONAL PAD)
     *    Generates warm, resonant acoustic-like music box chimes
     *    and a tender F-Major / D-Minor emotional cinema score.
     **************************************************************/
    let audioCtx = null;
    let emotionalLoopInterval = null;

    function ensureAudio() {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    // Play a soft, resonant celesta / music-box note with warm harmonics
    function playCelestaNote(freq = 523.25, duration = 1.6, vol = 0.16) {
      if (appState.cinemaMuted) return;
      try {
        const ctx = ensureAudio();
        const now = ctx.currentTime;

        const mainOsc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const bellOsc = ctx.createOscillator();

        const masterGain = ctx.createGain();
        const bellGain = ctx.createGain();

        mainOsc.type = 'sine';
        mainOsc.frequency.setValueAtTime(freq, now);

        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(freq * 0.5, now);

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(freq * 3, now);

        bellGain.gain.setValueAtTime(0.025, now);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(vol, now + 0.025);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

        mainOsc.connect(masterGain);
        subOsc.connect(masterGain);
        bellOsc.connect(bellGain);
        bellGain.connect(masterGain);
        masterGain.connect(ctx.destination);

        mainOsc.start(now);
        subOsc.start(now);
        bellOsc.start(now);

        mainOsc.stop(now + duration);
        subOsc.stop(now + duration);
        bellOsc.stop(now + duration);
      } catch (e) {}
    }

    // Play a warm, swelling ambient synth pad chord underneath the emotional story
    function playWarmPadChord(freqs = [174.61, 220.00, 261.63, 349.23], duration = 4.2) {
      if (appState.cinemaMuted) return;
      try {
        const ctx = ensureAudio();
        const now = ctx.currentTime;

        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.032, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + duration);
        });
      } catch (e) {}
    }

    // Tender emotional music-box arpeggio progression (Fmaj7 -> Dm9 -> Bbmaj7 -> C6)
    const EMOTIONAL_ARPEGGIOS = [
      { pad: [174.61, 261.63, 349.23, 440.00], notes: [523.25, 659.25, 698.46, 880.00, 698.46, 659.25] },
      { pad: [146.83, 220.00, 293.66, 349.23], notes: [587.33, 659.25, 698.46, 880.00, 1046.50, 880.00] },
      { pad: [116.54, 233.08, 293.66, 349.23], notes: [466.16, 587.33, 698.46, 880.00, 698.46, 587.33] },
      { pad: [130.81, 196.00, 261.63, 329.63], notes: [523.25, 587.33, 659.25, 783.99, 659.25, 523.25] }
    ];

    let arpBarIndex = 0;

    function startEmotionalSoundtrack() {
      stopEmotionalSoundtrack();
      arpBarIndex = 0;

      function playBar() {
        if (!appState.cinemaActive || appState.cinemaMuted) return;
        const bar = EMOTIONAL_ARPEGGIOS[arpBarIndex % EMOTIONAL_ARPEGGIOS.length];
        playWarmPadChord(bar.pad, 4.4);
        bar.notes.forEach((n, idx) => {
          setTimeout(() => {
            if (appState.cinemaActive && !appState.cinemaMuted) {
              playCelestaNote(n, 1.9, 0.12);
            }
          }, idx * 650);
        });
        arpBarIndex++;
      }

      playBar();
      emotionalLoopInterval = setInterval(playBar, 4000);
    }

    function stopEmotionalSoundtrack() {
      if (emotionalLoopInterval) {
        clearInterval(emotionalLoopInterval);
        emotionalLoopInterval = null;
      }
    }

    // Header Music Box Button (plays a sweet Happy Birthday chime phrase)
    document.getElementById('ambientMusicBtn').addEventListener('click', () => {
      const melody = [392.00, 392.00, 440.00, 392.00, 523.25, 493.88, 392.00, 392.00, 440.00, 392.00, 587.33, 523.25];
      melody.forEach((freq, idx) => {
        setTimeout(() => playCelestaNote(freq, 0.9, 0.16), idx * 340);
      });
      showStickerToast('Playing Music Box chime for ' + appState.recipient + ' 🎶', '🎵');
    });

    /**************************************************************
     * 3. RENDER SQUISHY 3D PILLOW LETTERS ("R-O-B-I-N")
     **************************************************************/
    const CHIME_SCALE = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];

    function formatDisplayCase(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    function syncNamesToDOM() {
      const displayRecipient = formatDisplayCase(appState.recipient);
      document.title = `Happy Birthday, ${displayRecipient}! ✨`;
      document.getElementById('footerAuthorText').textContent = appState.author;

      document.querySelectorAll('.recipient-inline').forEach(el => {
        el.textContent = appState.recipient;
      });
      document.querySelectorAll('.sender-inline').forEach(el => {
        el.textContent = appState.sender;
      });

      const container = document.getElementById('pillowNameContainer');
      container.innerHTML = '';

      appState.recipient.split('').forEach((char, i) => {
        if (char === ' ') {
          const gap = document.createElement('span');
          gap.className = 'w-4 inline-block';
          container.appendChild(gap);
          return;
        }
        const btn = document.createElement('button');
        btn.className = 'pillow-letter text-3xl sm:text-5xl select-none focus:outline-none';
        btn.textContent = char;
        btn.title = `Tap ${char} to squish!`;

        btn.addEventListener('click', () => {
          playCelestaNote(CHIME_SCALE[i % CHIME_SCALE.length], 1.1, 0.2);
          btn.classList.remove('pillow-pop');
          void btn.offsetWidth;
          btn.classList.add('pillow-pop');
          const r = btn.getBoundingClientRect();
          spawnRoomBurst(r.left + r.width / 2, r.top + r.height / 2, 'hearts', 12);
        });

        container.appendChild(btn);
      });
    }

    syncNamesToDOM();

    /**************************************************************
     * 4. 3D KAWAII CAKE PHYSICS, BREATH DETECTION & CANDLE BLOWING
     **************************************************************/
    const cakeSpringBody = document.getElementById('cakeSpringBody');
    const cakeMascotFace = document.getElementById('cakeMascotFace');
    const cakeMascotMouth = document.getElementById('cakeMascotMouth');
    const leftSquintSvg = document.getElementById('leftSquintSvg');
    const rightSquintSvg = document.getElementById('rightSquintSvg');
    const windRibbonsSvg = document.getElementById('windRibbonsSvg');
    const airflowBarFill = document.getElementById('airflowBarFill');
    const airflowPercentBadge = document.getElementById('airflowPercentBadge');
    const candlesRemainingText = document.getElementById('candlesRemainingText');
    const relightCandlesBtn = document.getElementById('relightCandlesBtn');

    function setCakeFaceExpression(mode) {
      if (mode === 'blowing') {
        cakeSpringBody.classList.add('wind-jiggle');
        cakeMascotFace.classList.add('face-blowing');
        cakeMascotFace.classList.remove('face-happy-arcs');
        leftSquintSvg.classList.remove('hidden');
        rightSquintSvg.classList.remove('hidden');
        windRibbonsSvg.classList.remove('opacity-0');
        windRibbonsSvg.classList.add('opacity-100');
        // Puffed 'o' mouth
        cakeMascotMouth.className = 'w-3.5 h-3.5 rounded-full bg-[#FB6F92] border-2 border-[#3B2330] mt-0.5 transition-all';
      } else if (mode === 'happy') {
        cakeSpringBody.classList.remove('wind-jiggle');
        cakeMascotFace.classList.remove('face-blowing');
        cakeMascotFace.classList.add('face-happy-arcs');
        leftSquintSvg.classList.add('hidden');
        rightSquintSvg.classList.add('hidden');
        windRibbonsSvg.classList.add('opacity-0');
        windRibbonsSvg.classList.remove('opacity-100');
        // Joyful open smile
        cakeMascotMouth.className = 'w-6 h-3.5 rounded-b-full bg-[#FB6F92] border-2 border-[#3B2330] mt-1 transition-all';
      } else {
        // Idle cute state
        cakeSpringBody.classList.remove('wind-jiggle');
        cakeMascotFace.classList.remove('face-blowing', 'face-happy-arcs');
        leftSquintSvg.classList.add('hidden');
        rightSquintSvg.classList.add('hidden');
        windRibbonsSvg.classList.add('opacity-0');
        windRibbonsSvg.classList.remove('opacity-100');
        cakeMascotMouth.className = 'w-4 h-2.5 border-b-[3px] border-[#3B2330] rounded-b-full mt-0.5 transition-all';
      }
    }

    // Allow tapping any individual candle to blow it out directly
    document.querySelectorAll('.wish-candle').forEach(el => {
      el.addEventListener('click', () => {
        const idx = Number(el.getAttribute('data-candle-idx'));
        blowOutSingleCandle(idx);
      });
    });

    function blowOutSingleCandle(idx) {
      if (!appState.candlesLit[idx]) return;
      appState.candlesLit[idx] = false;

      const flame = document.getElementById(`candleFlame${idx}`);
      flame.classList.add('extinguished');

      // Spawn rising pastel smoke hearts from wick
      const candleParent = flame.parentElement;
      ['🤍', '🩷', '✨'].forEach((symbol, sIdx) => {
        setTimeout(() => {
          const smoke = document.createElement('span');
          smoke.className = 'heart-smoke';
          smoke.textContent = symbol;
          candleParent.appendChild(smoke);
          setTimeout(() => smoke.remove(), 1800);
        }, sIdx * 160);
      });

      playCelestaNote(523.25 + idx * 130, 1.2, 0.18);
      checkAllCandlesStatus();
    }

    function checkAllCandlesStatus() {
      const litCount = appState.candlesLit.filter(Boolean).length;
      if (litCount > 0) {
        candlesRemainingText.textContent = `${litCount} Wish Candle${litCount > 1 ? 's' : ''} Glowing`;
      } else {
        candlesRemainingText.textContent = '✨ All 3 Wishes Released! ✨';
        relightCandlesBtn.classList.remove('hidden');
        setCakeFaceExpression('happy');

        // Celebrate with soft rose & gold petals, then smoothly dim & blur into the Emotional Story Sequence!
        spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'petals', 45);
        setTimeout(() => {
          launchEmotionalCinema(0);
        }, 1150);
      }
    }

    function relightAllCandles() {
      appState.candlesLit = [true, true, true];
      appState.windPower = 0;
      airflowBarFill.style.width = '0%';
      airflowPercentBadge.textContent = '0% Wind';
      [0, 1, 2].forEach(i => {
        const f = document.getElementById(`candleFlame${i}`);
        f.classList.remove('extinguished');
        f.style.transform = 'translateX(-50%)';
      });
      relightCandlesBtn.classList.add('hidden');
      candlesRemainingText.textContent = '3 Wish Candles Glowing';
      setCakeFaceExpression('idle');
      playCelestaNote(783.99, 1.0, 0.16);
    }

    relightCandlesBtn.addEventListener('click', relightAllCandles);

    // Cloud Bellows Hold / Tap Button
    const cloudPufferBtn = document.getElementById('cloudPufferBtn');
    function startCloudBlow(e) {
      if (e.cancelable) e.preventDefault();
      ensureAudio();
      appState.holdingCloudPuffer = true;
    }
    function stopCloudBlow() {
      appState.holdingCloudPuffer = false;
    }
    cloudPufferBtn.addEventListener('mousedown', startCloudBlow);
    cloudPufferBtn.addEventListener('touchstart', startCloudBlow, { passive: false });
    window.addEventListener('mouseup', stopCloudBlow);
    window.addEventListener('touchend', stopCloudBlow);

    // Real Microphone Breath Detector (Web Audio API)
    let micStream = null;
    let micAnalyser = null;
    let micFreqData = null;

    document.getElementById('realMicBlowBtn').addEventListener('click', async () => {
      const label = document.getElementById('micLabelSpan');
      const icon = document.getElementById('micIconSpan');

      if (appState.micListening) {
        if (micStream) micStream.getTracks().forEach(t => t.stop());
        appState.micListening = false;
        label.textContent = 'Use Real Mic to Blow';
        icon.textContent = '🎙️';
        showStickerToast('Microphone paused', '🎙️');
        return;
      }

      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = ensureAudio();
        const src = ctx.createMediaStreamSource(micStream);
        micAnalyser = ctx.createAnalyser();
        micAnalyser.fftSize = 256;
        src.connect(micAnalyser);
        micFreqData = new Uint8Array(micAnalyser.frequencyBinCount);

        appState.micListening = true;
        label.textContent = 'Listening... Blow Gently!';
        icon.textContent = '🌬️';
        showStickerToast('Blow onto your screen/mic to put out the candles!', '🌬️');
      } catch (err) {
        showStickerToast('Mic blocked in preview — press & hold "Hold to Blow Air Bellows" instead!', '💨');
      }
    });

    // Continuous Wind & Flame Physics Loop
    function windPhysicsTick() {
      const anyLit = appState.candlesLit.some(Boolean);
      if (anyLit) {
        let inputWind = 0;

        if (appState.holdingCloudPuffer) {
          inputWind = 72;
        } else if (appState.micListening && micAnalyser && micFreqData) {
          micAnalyser.getByteFrequencyData(micFreqData);
          let sum = 0;
          for (let i = 2; i < 18; i++) sum += micFreqData[i];
          const avg = sum / 16;
          if (avg > 26) inputWind = Math.min(100, (avg - 24) * 1.75);
        }

        if (inputWind > 10) {
          appState.windPower = Math.min(100, appState.windPower + inputWind * 0.045);
          setCakeFaceExpression('blowing');
        } else {
          appState.windPower = Math.max(0, appState.windPower - 1.1);
          if (appState.windPower < 5) setCakeFaceExpression('idle');
        }

        const pct = Math.round(appState.windPower);
        airflowBarFill.style.width = `${pct}%`;
        airflowPercentBadge.textContent = `${pct}% Wind`;

        // Bend lit flames horizontally with wind turbulence
        [0, 1, 2].forEach(i => {
          if (!appState.candlesLit[i]) return;
          const fl = document.getElementById(`candleFlame${i}`);
          const bendDeg = (inputWind / 100) * 42 + (Math.random() - 0.5) * 10;
          const squashY = Math.max(0.45, 1 - inputWind / 165);
          fl.style.transform = `translateX(-50%) rotate(${bendDeg}deg) scaleY(${squashY})`;
        });

        // Extinguish candles sequentially at 34%, 68%, and 96%
        if (appState.windPower >= 34 && appState.candlesLit[0]) blowOutSingleCandle(0);
        if (appState.windPower >= 68 && appState.candlesLit[1]) blowOutSingleCandle(1);
        if (appState.windPower >= 96 && appState.candlesLit[2]) blowOutSingleCandle(2);
      }

      requestAnimationFrame(windPhysicsTick);
    }
    windPhysicsTick();

    /**************************************************************
     * 5. THE 8-SCENE DARK-BLUR EMOTIONAL STORY SEQUENCE
     *    Designed to make Robin tear up with happiness!
     **************************************************************/
    function getEmotionalScenes() {
      const R = appState.recipient.charAt(0) + appState.recipient.slice(1).toLowerCase();
      const S = appState.sender.charAt(0) + appState.sender.slice(1).toLowerCase();

      return [
        {
          whisper: 'Close your eyes for a moment...',
          text: `Make a secret wish — today is all about celebrating *${R}.*`,
          svg: `<svg viewBox="0 0 200 120" class="w-40 h-28">
            <circle cx="100" cy="60" r="34" fill="none" stroke="#FDE68A" stroke-width="2" stroke-dasharray="6 6" class="animate-spin" style="animation-duration: 18s;"/>
            <circle cx="100" cy="60" r="16" fill="rgba(253, 230, 138, 0.25)"/>
            <path d="M100 32 C104 50 110 56 128 60 C110 64 104 70 100 88 C96 70 90 64 72 60 C90 56 96 50 100 32 Z" fill="#FFF8F3"/>
          </svg>`
        },
        {
          whisper: 'A brand new chapter...',
          text: `Another year of *laughter,* unforgettable memories, and watching you grow into an even more *wonderful* person.`,
          svg: `<svg viewBox="0 0 200 120" class="w-40 h-28">
            <path d="M40 85 Q100 20 160 55" fill="none" stroke="rgba(255,182,210,0.5)" stroke-width="2.5" stroke-dasharray="5 5"/>
            <path d="M160 35 L165 50 L180 55 L165 60 L160 75 L155 60 L140 55 L155 50 Z" fill="#FDE68A"/>
            <circle cx="75" cy="58" r="4" fill="#FF8FAB"/>
          </svg>`
        },
        {
          whisper: 'Just wanted to remind you...',
          text: `You have this natural way of making everyone around you feel *happy,* welcome, and *at* *ease.*`,
          svg: `<svg viewBox="0 0 200 120" class="w-40 h-28">
            <path d="M100 95 C100 95 60 72 60 46 C60 32 72 24 84 24 C92 24 100 30 100 38 C100 30 108 24 116 24 C128 24 140 32 140 46 C140 72 100 95 100 95 Z" fill="rgba(251, 113, 133, 0.28)" stroke="#FDA4AF" stroke-width="2.5"/>
            <circle cx="100" cy="54" r="6" fill="#FDE68A"/>
          </svg>`
        },
        {
          whisper: 'Through every busy day...',
          text: `Your kindness, your genuine heart, and your humor never go *unnoticed.*`,
          svg: `<svg viewBox="0 0 200 120" class="w-40 h-28">
            <path d="M35 90 H165" stroke="rgba(255,255,255,0.35)" stroke-width="2" stroke-linecap="round"/>
            <path d="M60 90 A40 40 0 0 1 140 90" fill="rgba(253, 230, 138, 0.28)" stroke="#FDE68A" stroke-width="2.5"/>
            <line x1="100" y1="22" x2="100" y2="38" stroke="#FDE68A" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="58" y1="42" x2="70" y2="52" stroke="#FDE68A" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="142" y1="42" x2="130" y2="52" stroke="#FDE68A" stroke-width="2.5" stroke-linecap="round"/>
          </svg>`
        },
        {
          whisper: 'For the road ahead...',
          text: `May this year bring you *exciting* *adventures,* quiet peace of mind, and reasons to smile every single day.`,
          svg: `<svg viewBox="0 0 200 120" class="w-40 h-28">
            <path d="M30 65 Q65 30 100 65 T170 65" fill="none" stroke="#A7F3D0" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="65" cy="48" r="5" fill="#FDE68A"/>
            <circle cx="135" cy="48" r="5" fill="#FDA4AF"/>
          </svg>`
        },
        {
          whisper: 'Big dreams...',
          text: `Go after everything you desire this year. Always remember that you have people who *believe* in you *completely.*`,
          svg: `<svg viewBox="0 0 200 120" class="w-40 h-28">
            <polyline points="20,65 65,65 78,40 94,90 110,28 124,78 136,65 180,65" fill="none" stroke="#FB7185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="110" cy="28" r="5" fill="#FDE68A"/>
          </svg>`
        },
        {
          whisper: 'From the heart...',
          text: `Thank you for being such an extraordinary friend. Having you in my life is a *true* *gift.*`,
          svg: `<svg viewBox="0 0 200 120" class="w-40 h-28">
            <line x1="55" y1="75" x2="95" y2="38" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-dasharray="4 4"/>
            <line x1="95" y1="38" x2="145" y2="62" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-dasharray="4 4"/>
            <circle cx="55" cy="75" r="6" fill="#FDE68A"/>
            <circle cx="95" cy="38" r="8" fill="#FDA4AF"/>
            <circle cx="145" cy="62" r="7" fill="#A7F3D0"/>
          </svg>`
        },
        {
          whisper: `Happy Birthday, dearest ${R} 🌸`,
          text: `Wishing you the sweetest, most memorable birthday yet. *With* *all* *my* *love,* *${S}* ❤️`,
          svg: `<svg viewBox="0 0 200 135" class="w-44 h-32">
            <g class="lily-petal">
              <path d="M100 115 C75 85 52 52 72 26 C88 42 96 76 100 115 Z" fill="rgba(255, 182, 203, 0.75)" stroke="#FFF" stroke-width="2"/>
              <path d="M100 115 C125 85 148 52 128 26 C112 42 104 76 100 115 Z" fill="rgba(255, 182, 203, 0.75)" stroke="#FFF" stroke-width="2"/>
              <path d="M100 115 C60 98 34 74 44 48 C68 58 86 84 100 115 Z" fill="rgba(251, 113, 133, 0.65)" stroke="#FFF" stroke-width="2"/>
              <path d="M100 115 C140 98 166 74 156 48 C132 58 114 84 100 115 Z" fill="rgba(251, 113, 133, 0.65)" stroke="#FFF" stroke-width="2"/>
              <path d="M100 115 C82 72 82 32 100 12 C118 32 118 72 100 115 Z" fill="#FFF0F5" stroke="#FDA4AF" stroke-width="2.5"/>
              <line x1="100" y1="95" x2="92" y2="52" stroke="#FDE047" stroke-width="2" stroke-linecap="round"/>
              <line x1="100" y1="95" x2="108" y2="52" stroke="#FDE047" stroke-width="2" stroke-linecap="round"/>
              <circle cx="92" cy="50" r="3.5" fill="#FDE047"/>
              <circle cx="108" cy="50" r="3.5" fill="#FDE047"/>
            </g>
          </svg>`
        }
      ];
    }

    let sceneAutoTimer = null;
    const cinemaOverlay = document.getElementById('emotionalCinemaOverlay');
    const cinemaMainLine = document.getElementById('cinemaMainLine');
    const cinemaWhisperTop = document.getElementById('cinemaWhisperTop');
    const cinemaSvgFlourish = document.getElementById('cinemaSvgFlourish');
    const cinemaSceneIndicator = document.getElementById('cinemaSceneIndicator');
    const cinemaDotsRow = document.getElementById('cinemaDotsRow');
    const cinemaFinaleActions = document.getElementById('cinemaFinaleActions');
    const cinemaTapHint = document.getElementById('cinemaTapHint');

    function launchEmotionalCinema(startIdx = 0) {
      ensureAudio();
      appState.cinemaActive = true;
      appState.cinemaPaused = false;
      document.getElementById('cinemaPauseBtn').textContent = '⏸ Pause';

      cinemaOverlay.classList.add('active');
      document.body.classList.add('twilight-afterglow');
      startEmotionalSoundtrack();
      renderCinemaScene(startIdx);
    }

    function closeEmotionalCinema() {
      appState.cinemaActive = false;
      clearTimeout(sceneAutoTimer);
      stopEmotionalSoundtrack();
      cinemaOverlay.classList.remove('active');
    }

    function renderCinemaScene(idx) {
      clearTimeout(sceneAutoTimer);
      const scenes = getEmotionalScenes();
      appState.currentSceneIdx = Math.max(0, Math.min(scenes.length - 1, idx));
      const scene = scenes[appState.currentSceneIdx];

      cinemaSceneIndicator.textContent = `Moment ${appState.currentSceneIdx + 1} of ${scenes.length}`;
      cinemaSvgFlourish.innerHTML = scene.svg;

      // Whisper subtitle
      cinemaWhisperTop.className = 'font-hand text-2xl sm:text-3xl text-amber-200/90 mb-3 min-h-[2rem] whisper-subtitle';
      cinemaWhisperTop.textContent = scene.whisper;

      // Word-by-word glowing choreography
      cinemaMainLine.innerHTML = '';
      const rawWords = scene.text.split(' ');
      rawWords.forEach((w, wIdx) => {
        const span = document.createElement('span');
        const isHighlighted = w.startsWith('*') && w.endsWith('*');
        const cleanWord = w.replace(/\*/g, '');
        span.className = `story-word ${isHighlighted ? 'highlight-word' : ''}`;
        span.style.animationDelay = `${wIdx * 0.14}s`;
        span.textContent = cleanWord;
        cinemaMainLine.appendChild(span);
      });

      // Render progress dots
      cinemaDotsRow.innerHTML = '';
      scenes.forEach((_, dIdx) => {
        const dot = document.createElement('button');
        dot.className = `h-2 rounded-full transition-all ${
          dIdx === appState.currentSceneIdx ? 'w-8 bg-amber-300' : 'w-2 bg-white/30 hover:bg-white/50'
        }`;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          renderCinemaScene(dIdx);
        });
        cinemaDotsRow.appendChild(dot);
      });

      // Check if Final Scene (Scene 8)
      if (appState.currentSceneIdx === scenes.length - 1) {
        cinemaFinaleActions.classList.remove('hidden');
        cinemaFinaleActions.classList.add('flex');
        cinemaTapHint.textContent = '💖 Happy Birthday, ' + appState.recipient + '! Always loved. 💖';
      } else {
        cinemaFinaleActions.classList.add('hidden');
        cinemaFinaleActions.classList.remove('flex');
        cinemaTapHint.textContent = '✨ Tap anywhere for the next moment, or let it play... ✨';

        if (!appState.cinemaPaused) {
          const readDuration = Math.max(4600, rawWords.length * 160 + 3000);
          sceneAutoTimer = setTimeout(() => {
            if (appState.cinemaActive && !appState.cinemaPaused) {
              renderCinemaScene(appState.currentSceneIdx + 1);
            }
          }, readDuration);
        }
      }
    }

    // Advance on clicking the center stage
    document.getElementById('cinemaClickArea').addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const scenes = getEmotionalScenes();
      if (appState.currentSceneIdx < scenes.length - 1) {
        playCelestaNote(659.25, 1.1, 0.12);
        renderCinemaScene(appState.currentSceneIdx + 1);
      }
    });

    document.getElementById('cinemaPauseBtn').addEventListener('click', () => {
      appState.cinemaPaused = !appState.cinemaPaused;
      document.getElementById('cinemaPauseBtn').textContent = appState.cinemaPaused ? '▶ Resume' : '⏸ Pause';
      if (appState.cinemaPaused) {
        clearTimeout(sceneAutoTimer);
      } else {
        renderCinemaScene(appState.currentSceneIdx);
      }
    });

    document.getElementById('cinemaMuteBtn').addEventListener('click', () => {
      appState.cinemaMuted = !appState.cinemaMuted;
      document.getElementById('cinemaMuteBtn').textContent = appState.cinemaMuted ? '🔇 Muted' : '🔊 Music On';
    });

    document.getElementById('cinemaSkipBtn').addEventListener('click', closeEmotionalCinema);

    document.getElementById('cinemaOpenKeepsakesBtn').addEventListener('click', () => {
      closeEmotionalCinema();
      const adv = document.getElementById('adventureSection');
      if (adv) adv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 'petals', 40);
    });

    document.getElementById('cinemaReplayBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      renderCinemaScene(0);
    });

    document.getElementById('replayStoryHeaderBtn').addEventListener('click', () => {
      launchEmotionalCinema(0);
    });

    
    /**************************************************************
     * 6. THREE BIRTHDAY KEEPSAKES (ADVENTURE, GRANTING, HAPPINESS)
     **************************************************************/
    // Close modal helper (close button, backdrop click, Escape key)
    function closeModalById(id) {
      if (id === 'arcadeVictoryOverlay') {
        if (typeof closeVictoryGiftModal === 'function') {
          closeVictoryGiftModal();
          return;
        }
      }
      const m = document.getElementById(id);
      if (m) {
        m.classList.add('hidden');
        m.classList.remove('flex');
      }
    }

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-close-modal');
        closeModalById(id);
      });
    });

    // Backdrop click-to-close on modals
    ['customNamesModal', 'arcadeVictoryOverlay'].forEach(id => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeModalById(id);
          }
        });
      }
    });

    // Escape key closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ['customNamesModal', 'arcadeVictoryOverlay'].forEach(closeModalById);
        if (appState.cinemaActive) {
          closeEmotionalCinema();
        }
      }
    });

    // ==========================================
    // 1. ADVENTURE BOTTLE & SPINNING COMPASS
    // ==========================================
    const ADVENTURE_DESTINATIONS = [
      {
        title: '✈️ GATE 0.00 KM • ZERO-KM AIRPORT REUNION',
        details: 'The moment distance becomes 0 km: Luggage carried 100% by Jerry, giant running squeeze hug, and endless real-life laughs!',
        route: "JERRY'S CITY ✈️ ➔ ROBIN'S CITY",
        seat: 'VIP 01-A',
        stamp: '★ STAMP: ZERO-KM PASS APPROVED ✈️ ★',
        badge: '0.00 KM REUNION'
      },
      {
        title: '🌸 TOKYO SAKURA & KAWAII CAFÉ TRAIL',
        details: 'Walking hand-in-hand under cherry blossom trees, sweet strawberry matcha soft-serve, and studio photo booths!',
        route: 'TOKYO // SHINJUKU & MEIJI',
        seat: 'SUITE 02-B',
        stamp: '★ STAMP: TOKYO SAKURA APPROVED 🌸 ★',
        badge: 'CHERRY BLOSSOM'
      },
      {
        title: '🏖️ TROPICAL SUNSET COAST & OCEAN BREEZE',
        details: 'Warm ocean breeze, barefoot beach walks, iced mango boba, seashell hunting, and a starry midnight bonfire!',
        route: 'PACIFIC COASTLINE // PIER 7',
        seat: 'BEACH 03-A',
        stamp: '★ STAMP: COASTAL GETAWAY 🌊 ★',
        badge: 'SUNSET & SEASHELLS'
      },
      {
        title: '📚 RAINY-DAY OLD TOWN BOOKSHOP & BAKERY',
        details: 'Cozy armchairs by rainy windowpanes, warm cinnamon rolls, hot cocoa, and discovering secret paperbacks together!',
        route: 'OLD TOWN // BOOK LANE 12',
        seat: 'COZY 04-C',
        stamp: '★ STAMP: COZY BOOKSTORE 📚 ★',
        badge: 'HOT CHOCOLATE'
      },
      {
        title: '🌌 HILLTOP STARGAZING & MIDNIGHT CAMPFIRE',
        details: 'Warm blankets under millions of sparkling stars, roasting marshmallows, pointing out constellations, and quiet smiles!',
        route: 'STARLIGHT PEAK // SUMMIT 9',
        seat: 'OBSERVATORY 05',
        stamp: '★ STAMP: STARGAZING HILL 🌌 ★',
        badge: 'SHOOTING STARS'
      },
      {
        title: '🎡 TWILIGHT THEME PARK & COTTON CANDY',
        details: 'Breathtaking golden-hour sunset from the top of the Ferris wheel, winning Robin giant plushies, and carnival churros!',
        route: 'WONDERLAND // WHEEL TOP',
        seat: 'CARRIAGE 07',
        stamp: '★ STAMP: THEME PARK PASS 🎡 ★',
        badge: 'FERRIS WHEEL'
      }
    ];

    function playCompassClick(step = 0) {
      if (appState.cinemaMuted) return;
      try {
        const ctx = ensureAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520 + (step % 5) * 85, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.04);
      } catch (e) {}
    }

    function openAdventureModal() {
      const adv = document.getElementById('adventureSection');
      if (adv) adv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      playCelestaNote(587.33, 1.1, 0.18);
      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'stars', 20);
    }

    let compassSpinning = false;
    function spinAdventureCompass() {
      if (compassSpinning) return;
      compassSpinning = true;
      ensureAudio();

      const needle = document.getElementById('compassNeedleEl');
      const pickIdx = Math.floor(Math.random() * ADVENTURE_DESTINATIONS.length);
      const targetDeg = pickIdx * 60 + (Math.random() * 20 - 10);
      appState.compassAngle += 1080 + targetDeg;

      if (needle) {
        needle.style.transform = `rotate(${appState.compassAngle}deg)`;
      }

      // Play mechanical clicks
      for (let c = 0; c < 12; c++) {
        setTimeout(() => {
          playCompassClick(c);
        }, c * 60);
      }

      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'stars', 25);

      setTimeout(() => {
        const dest = ADVENTURE_DESTINATIONS[pickIdx];
        const titleEl = document.getElementById('compassDestTitle');
        const detailsEl = document.getElementById('compassDestDetails');
        const routeEl = document.getElementById('compassDestRoute');
        const seatEl = document.getElementById('compassDestSeat');
        const stampEl = document.getElementById('compassPassportStamp');
        const destText = document.getElementById('compassDestinationText');

        if (titleEl) titleEl.textContent = dest.title;
        if (detailsEl) detailsEl.textContent = dest.details;
        if (routeEl) routeEl.textContent = dest.route;
        if (seatEl) seatEl.textContent = dest.seat;
        if (stampEl) stampEl.textContent = dest.stamp;
        if (destText) destText.textContent = `✨ Destination: ${dest.title} ✨`;

        // Fanfare & celebration burst
        [659.25, 783.99, 1046.50].forEach((n, i) => setTimeout(() => playCelestaNote(n, 1.2, 0.2), i * 110));
        spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'petals', 30);
        showStickerToast(`Adventure Stamped: ${dest.badge}! 🗺️✈️`, '🧭');
        compassSpinning = false;
      }, 1050);
    }

    const spinCompassTargetEl = document.getElementById('spinCompassTarget');
    if (spinCompassTargetEl) spinCompassTargetEl.addEventListener('click', spinAdventureCompass);
    const spinCompassBtnEl = document.getElementById('spinCompassBtn');
    if (spinCompassBtnEl) spinCompassBtnEl.addEventListener('click', spinAdventureCompass);

    // Interactive Roadtrip Packing Checklist Taps
    document.querySelectorAll('.checklist-item-row').forEach(row => {
      row.addEventListener('click', () => {
        ensureAudio();
        row.classList.toggle('is-checked');
        const checked = row.classList.contains('is-checked');
        playCelestaNote(checked ? 880 : 587.33, 0.4, 0.12);
        if (checked) {
          const rect = row.getBoundingClientRect();
          spawnRoomBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 'stars', 10);
        }
      });
    });

    // ==========================================
    // 2. GRANTING STAR JAR & GOLD SCRATCH CARD
    // ==========================================
    const scratchCanvas = document.getElementById('goldFoilScratchCanvas');
    const sCtx = scratchCanvas ? scratchCanvas.getContext('2d') : null;
    let isScratchingFoil = false;
    let foilRevealed = false;

    function initGoldFoilLayer() {
      if (!scratchCanvas || !sCtx) return;
      foilRevealed = false;
      scratchCanvas.style.pointerEvents = 'auto';

      const container = scratchCanvas.parentElement;
      scratchCanvas.width = (container && container.offsetWidth > 0) ? container.offsetWidth : 440;
      scratchCanvas.height = (container && container.offsetHeight > 0) ? container.offsetHeight : 128;

      sCtx.globalCompositeOperation = 'source-over';
      sCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);

      // Festive gold gradient
      const grad = sCtx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
      grad.addColorStop(0, '#D97706');
      grad.addColorStop(0.3, '#F59E0B');
      grad.addColorStop(0.7, '#FDE68A');
      grad.addColorStop(1, '#D97706');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

      // Prompt text
      sCtx.fillStyle = '#451A03';
      sCtx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      sCtx.textAlign = 'center';
      sCtx.textBaseline = 'middle';
      sCtx.fillText('✨ Rub or Click to Reveal Birthday Note ✨', scratchCanvas.width / 2, scratchCanvas.height / 2);
    }

    function scratchAtPoint(clientX, clientY) {
      if (!scratchCanvas || !sCtx || foilRevealed) return;
      const rect = scratchCanvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      sCtx.globalCompositeOperation = 'destination-out';
      sCtx.beginPath();
      sCtx.arc(x, y, 26, 0, Math.PI * 2);
      sCtx.fill();

      checkFoilProgress();
    }

    function checkFoilProgress() {
      if (foilRevealed || !sCtx || !scratchCanvas) return;
      try {
        const imgData = sCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
        let clearPixels = 0;
        const totalSampled = imgData.data.length / 16;
        for (let i = 3; i < imgData.data.length; i += 16) {
          if (imgData.data[i] === 0) clearPixels++;
        }
        if (clearPixels / totalSampled > 0.35) {
          revealFoilNote();
        }
      } catch (e) {}
    }

    function revealFoilNote() {
      if (!scratchCanvas || !sCtx) return;
      foilRevealed = true;
      sCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
      scratchCanvas.style.pointerEvents = 'none';
      playCelestaNote(880.0, 1.2, 0.22);
      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 'stars', 30);
      showStickerToast('Secret birthday note revealed! 💖', '✨');
    }

    if (scratchCanvas) {
      scratchCanvas.addEventListener('pointerdown', (e) => {
        isScratchingFoil = true;
        scratchAtPoint(e.clientX, e.clientY);
      });
      scratchCanvas.addEventListener('pointermove', (e) => {
        if (isScratchingFoil) {
          scratchAtPoint(e.clientX, e.clientY);
        }
      });
      window.addEventListener('pointerup', () => { isScratchingFoil = false; });
      window.addEventListener('pointercancel', () => { isScratchingFoil = false; });
    }

    const revealFoilBtnEl = document.getElementById('revealFoilBtn');
    if (revealFoilBtnEl) revealFoilBtnEl.addEventListener('click', revealFoilNote);

    // Auto-init gold foil scratch card on load and resize
    setTimeout(initGoldFoilLayer, 120);
    window.addEventListener('load', () => setTimeout(initGoldFoilLayer, 100));
    window.addEventListener('resize', () => {
      if (!foilRevealed) initGoldFoilLayer();
    });

    function openGrantingModal() {
      const g = document.getElementById('grantingSection');
      if (g) g.scrollIntoView({ behavior: 'smooth', block: 'center' });
      playCelestaNote(659.25, 1.1, 0.18);
      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'stars', 20);
    }

    function launchOrigamiStar() {
      const input = document.getElementById('secretWishInput');
      if (input) input.value = '';
      const fb = document.getElementById('origamiLaunchFeedback');
      if (fb) fb.classList.remove('hidden');

      playCelestaNote(880, 1.2, 0.2);
      setTimeout(() => playCelestaNote(1046.50, 1.2, 0.2), 120);
      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'stars', 35);
      showStickerToast('Origami Wish Star folded & released into the sky! 🌟', '🌟');
    }

    const foldOrigamiStarBtnEl = document.getElementById('foldOrigamiStarBtn');
    if (foldOrigamiStarBtnEl) foldOrigamiStarBtnEl.addEventListener('click', launchOrigamiStar);
    const secretWishInputEl = document.getElementById('secretWishInput');
    if (secretWishInputEl) {
      secretWishInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          launchOrigamiStar();
        }
      });
    }

    // ==========================================
    // 3. HAPPINESS SUNSHINE TURNTABLE & VINYL
    // ==========================================
    const VINYL_TRACKS = [
      {
        name: "Robin's Birthday Melody 🌸",
        bpm: 230,
        notes: [523.25, 659.25, 783.99, 1046.50, 880.00, 783.99, 659.25, 587.33, 523.25, 659.25, 783.99, 1046.50, 1174.66, 1046.50, 880.00, 783.99]
      },
      {
        name: "Golden Hour Sunshine ☀️",
        bpm: 250,
        notes: [392.00, 493.88, 587.33, 783.99, 659.25, 587.33, 493.88, 440.00, 392.00, 587.33, 783.99, 880.00, 783.99, 659.25, 587.33, 493.88]
      },
      {
        name: "Miles Apart, Closest at Heart ✈️",
        bpm: 270,
        notes: [523.25, 659.25, 783.99, 698.46, 659.25, 587.33, 523.25, 440.00, 523.25, 587.33, 659.25, 783.99, 1046.50, 880.00, 783.99, 659.25]
      }
    ];

    let activeVinylTrackIdx = 0;
    let isVinylPlaying = false;
    let vinylMelodyInterval = null;
    let vinylNoteIdx = 0;

    function startVinylPlayback(trackIndex = null) {
      ensureAudio();
      if (trackIndex !== null) {
        activeVinylTrackIdx = trackIndex;
        vinylNoteIdx = 0;
      }
      isVinylPlaying = true;

      const disc = document.getElementById('vinylRecordDisc');
      const tonearm = document.getElementById('tonearmAssembly');
      const statusLed = document.getElementById('vinylStatusLed');
      const playLabel = document.getElementById('vinylPlayLabel');
      const playIcon = document.getElementById('vinylPlayIcon');
      const eq = document.getElementById('equalizerVisualizer');
      const nameDisp = document.getElementById('vinylTrackNameDisplay');

      // Update button states on deck
      document.querySelectorAll('.vinyl-track-btn').forEach((btn, idx) => {
        if (idx === activeVinylTrackIdx) {
          btn.classList.add('bg-[#FF477E]', 'text-white');
          btn.classList.remove('bg-[#25172C]', 'text-[#FFA8BA]');
        } else {
          btn.classList.remove('bg-[#FF477E]', 'text-white');
          btn.classList.add('bg-[#25172C]', 'text-[#FFA8BA]');
        }
      });

      // Swing tonearm over record
      if (tonearm) tonearm.classList.add('tonearm-playing');
      // Spin record
      if (disc) disc.classList.add('vinyl-is-spinning');
      // Status LED
      if (statusLed) {
        statusLed.classList.remove('bg-gray-500');
        statusLed.classList.add('bg-[#52B788]', 'shadow-[0_0_10px_#52B788]');
      }
      // Equalizer bars
      if (eq) eq.classList.add('is-playing-eq');
      if (playLabel) playLabel.textContent = 'Pause Turntable';
      if (playIcon) playIcon.textContent = '⏸';
      if (nameDisp) nameDisp.textContent = `PLAYING: ${VINYL_TRACKS[activeVinylTrackIdx].name}`;

      // Needle drop chord
      playCelestaNote(261.63, 0.4, 0.08);

      // Start looping track melody
      clearInterval(vinylMelodyInterval);
      const track = VINYL_TRACKS[activeVinylTrackIdx];
      vinylMelodyInterval = setInterval(() => {
        if (!isVinylPlaying) return;
        const note = track.notes[vinylNoteIdx];
        playCelestaNote(note, 0.7, 0.15);
        vinylNoteIdx = (vinylNoteIdx + 1) % track.notes.length;
      }, track.bpm);

      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'petals', 25);
      showStickerToast(`Now spinning: ${track.name}! 🎶`, '🌻');
    }

    function pauseVinylPlayback() {
      isVinylPlaying = false;
      clearInterval(vinylMelodyInterval);

      const disc = document.getElementById('vinylRecordDisc');
      const tonearm = document.getElementById('tonearmAssembly');
      const statusLed = document.getElementById('vinylStatusLed');
      const playLabel = document.getElementById('vinylPlayLabel');
      const playIcon = document.getElementById('vinylPlayIcon');
      const eq = document.getElementById('equalizerVisualizer');
      const nameDisp = document.getElementById('vinylTrackNameDisplay');

      if (tonearm) tonearm.classList.remove('tonearm-playing');
      if (disc) disc.classList.remove('vinyl-is-spinning');
      if (statusLed) {
        statusLed.classList.remove('bg-[#52B788]', 'shadow-[0_0_10px_#52B788]');
        statusLed.classList.add('bg-gray-500');
      }
      if (eq) eq.classList.remove('is-playing-eq');
      if (playLabel) playLabel.textContent = 'Spin & Play Melody';
      if (playIcon) playIcon.textContent = '▶';
      if (nameDisp) nameDisp.textContent = 'TURNTABLE PAUSED';
      playCelestaNote(440, 0.3, 0.06);
    }

    function toggleVinylPlayback() {
      if (isVinylPlaying) {
        pauseVinylPlayback();
      } else {
        startVinylPlayback();
      }
    }

    function triggerSunnyVinylShower() {
      ensureAudio();
      toggleVinylPlayback();
    }

    function openHappinessModal() {
      const h = document.getElementById('happinessSection');
      if (h) h.scrollIntoView({ behavior: 'smooth', block: 'center' });
      triggerSunnyVinylShower();
    }

    const vinylRecordDiscEl = document.getElementById('vinylRecordDisc');
    if (vinylRecordDiscEl) vinylRecordDiscEl.addEventListener('click', toggleVinylPlayback);

    const playSunnyChimeBtnEl = document.getElementById('playSunnyChimeBtn');
    if (playSunnyChimeBtnEl) playSunnyChimeBtnEl.addEventListener('click', toggleVinylPlayback);

    // Track switcher buttons on deck
    document.querySelectorAll('.vinyl-track-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const trackIdx = parseInt(btn.getAttribute('data-track'), 10) || 0;
        startVinylPlayback(trackIdx);
      });
    });

    // Preview track buttons on Side B
    document.querySelectorAll('.preview-track-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const trackIdx = parseInt(btn.getAttribute('data-track'), 10) || 0;
        startVinylPlayback(trackIdx);
      });
    });

    // Petal shower buttons
    const showerPetalsBtns = [
      document.getElementById('showerSunnyPetalsBtn'),
      document.getElementById('showerPetalsFooterBtn')
    ];
    showerPetalsBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          ensureAudio();
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((n, i) => setTimeout(() => playCelestaNote(n, 1.1, 0.18), i * 120));
          spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'petals', 45);
          showStickerToast('Showering sweet flower petals for Robin! 🌸', '🌻');
        });
      }
    });

    /**************************************************************
     * 6B2. ROBIN'S BIRTHDAY GARDEN OF BLOSSOMS 🌸🌿
     * Interactive Floral Bouquet & Chime Blessing Showcase
     **************************************************************/
    const FLOWERS_DATA = [
      {
        id: 'blossom',
        name: 'Cherry Blossom',
        icon: '🌸',
        color: '#FFF0F3',
        note: 523.25,
        title: 'Blessing of Gentle Peace & Serenity',
        blessing: 'May this year wrap you in effortless peace, quiet mornings with favorite teas, soft breezes that take all stress away, and peaceful sleep every single night.'
      },
      {
        id: 'sunflower',
        name: 'Sunshine Sunflower',
        icon: '🌻',
        color: '#FEF9C3',
        note: 587.33,
        title: 'Blessing of Radiant Warmth & Joy',
        blessing: 'Like a sunflower that always turns toward the light, may your natural warmth and radiant smile continue to light up every room you walk into, Robin!'
      },
      {
        id: 'peony',
        name: 'Sweet Pink Peony',
        icon: '🌷',
        color: '#FFF0F3',
        note: 659.25,
        title: 'Blessing of Big Belly Laughs & Pure Fun',
        blessing: 'Here is to laughing so hard your eyes water, spontaneous fun roadtrips, delicious sweet treats, and days filled with pure, unfiltered happiness.'
      },
      {
        id: 'clover',
        name: 'Sage Lucky Clover',
        icon: '🌿',
        color: '#EFF6F1',
        note: 783.99,
        title: 'Blessing of Serendipity & Good Luck',
        blessing: 'May lucky opportunities, kind strangers, smooth green lights on road trips, and pleasant surprises find you wherever your footsteps lead this year.'
      },
      {
        id: 'rose',
        name: 'Ruby Velvet Rose',
        icon: '🌹',
        color: '#FFF0F3',
        note: 880.00,
        title: 'Blessing of Deep Love & Lifetime Cheering',
        blessing: 'You are so genuinely valued, appreciated, and loved, Robin. No matter where life takes you, Jerry is always in your corner cheering you on 1000%!'
      },
      {
        id: 'daisy',
        name: 'Starlight White Daisy',
        icon: '🌼',
        color: '#FFFBEB',
        note: 1046.50,
        title: 'Blessing of Bright Dreams Coming True',
        blessing: 'To every dream you carry quietly in your heart: believe in your talent and patience. This is your year to see them blossom into reality.'
      }
    ];

    const bouquetState = {
      inVase: new Set(),
      activeFlower: null
    };

    function renderFlowerButtons() {
      const grid = document.getElementById('flowersButtonsGrid');
      if (!grid) return;
      grid.innerHTML = '';

      FLOWERS_DATA.forEach(flower => {
        const inVase = bouquetState.inVase.has(flower.id);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'flower-card-btn' + (inVase ? ' in-vase' : '');
        btn.innerHTML = `
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style="background: ${flower.color}">
            <span>${flower.icon}</span>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-bold text-xs text-[#FFF5F8] truncate">${flower.name}</h4>
            <span class="text-[10px] font-semibold ${inVase ? 'text-[#52B788]' : 'text-[#FF5C8A]'} block mt-0.5">
              ${inVase ? '✓ In Vase' : '+ Pluck Flower'}
            </span>
          </div>
        `;
        btn.addEventListener('click', () => pickFlower(flower));
        grid.appendChild(btn);
      });
    }

    function renderVaseFlowers() {
      const container = document.getElementById('vaseFlowersContainer');
      const badge = document.getElementById('bouquetCountBadge');
      if (!container) return;

      if (bouquetState.inVase.size === 0) {
        container.innerHTML = `
          <p id="emptyVaseHint" class="font-hand text-lg text-[#FFA8BA] mb-4 animate-pulse text-center">
            🌷 Tap the flowers below to arrange Robin’s bouquet...
          </p>
        `;
      } else {
        container.innerHTML = '';
        const stems = Array.from(bouquetState.inVase).map(id => FLOWERS_DATA.find(f => f.id === id)).filter(Boolean);
        stems.forEach((f, idx) => {
          const stemEl = document.createElement('div');
          stemEl.className = 'flower-stem-blossom cursor-pointer';
          stemEl.style.animationDelay = `${idx * -0.6}s`;
          stemEl.title = `${f.name} (Tap to hear chime & read blessing)`;
          stemEl.innerHTML = `
            <span class="text-3xl sm:text-4xl filter drop-shadow-sm transition-transform hover:scale-125">${f.icon}</span>
            <div class="w-1 h-14 bg-[#52B788] rounded-full -mt-1 opacity-90"></div>
          `;
          stemEl.addEventListener('click', () => {
            playCelestaNote(f.note, 1.1, 0.2);
            spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'petals', 18);
            displayBlessingCard(f);
          });
          container.appendChild(stemEl);
        });
      }

      if (badge) {
        badge.textContent = `${bouquetState.inVase.size} of ${FLOWERS_DATA.length} Flowers in Vase 💐`;
      }
    }

    function displayBlessingCard(flower) {
      const icon = document.getElementById('blessingFlowerIcon');
      const name = document.getElementById('blessingFlowerName');
      const title = document.getElementById('blessingFlowerTitle');
      const text = document.getElementById('blessingFlowerText');

      if (icon) icon.textContent = flower.icon;
      if (name) name.textContent = flower.name;
      if (title) title.textContent = flower.title;
      if (text) text.textContent = `“${flower.blessing}”`;
    }

    function pickFlower(flower) {
      ensureAudio();
      playCelestaNote(flower.note, 1.0, 0.2);
      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'petals', 20);

      const wasInVase = bouquetState.inVase.has(flower.id);
      if (!wasInVase) {
        bouquetState.inVase.add(flower.id);
        showStickerToast(`Added ${flower.icon} ${flower.name} to Robin's vase! 🌸`, '💐');
      }

      displayBlessingCard(flower);
      renderFlowerButtons();
      renderVaseFlowers();

      if (bouquetState.inVase.size === FLOWERS_DATA.length) {
        setTimeout(() => {
          spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'petals', 35);
          showStickerToast(`Full Birthday Bouquet assembled for ${appState.recipient}! 🌸💐`, '🎉');
        }, 300);
      }
    }

    function bloomAllBouquet() {
      ensureAudio();
      FLOWERS_DATA.forEach(f => bouquetState.inVase.add(f.id));

      // Musical chime arpeggio through all 6 flowers
      FLOWERS_DATA.forEach((f, idx) => {
        setTimeout(() => playCelestaNote(f.note, 1.0, 0.18), idx * 110);
      });

      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.4, 'petals', 45);
      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'stars', 25);

      displayBlessingCard(FLOWERS_DATA[0]);
      renderFlowerButtons();
      renderVaseFlowers();
      showStickerToast(`All 6 Birthday Flowers bloomed in Robin's vase! 💐✨`, '🌸');
    }

    const bloomAllBtn = document.getElementById('bloomAllBouquetBtn');
    if (bloomAllBtn) bloomAllBtn.addEventListener('click', bloomAllBouquet);

    // Initial render of flower buttons and vase
    renderFlowerButtons();
    renderVaseFlowers();

    /**************************************************************
     * 6C. SECTION 4: ROBIN'S MAGICAL BIRTHDAY CAPSULE MACHINE 🪙✨
     * Interactive Kawaii Gashapon Toy & Collectible Charm Shelf
     **************************************************************/
    const CAPSULES_POOL = [
      {
        id: 'charm-strawberry',
        icon: '🍓',
        name: 'Strawberry Sunshine',
        tag: 'REASON YOU ARE LOVED #01',
        title: 'Your Smile is Pure Sunshine',
        text: 'No matter how chaotic or long the day has been, Robin, your genuine smile and laugh always make everything feel lighter and warmer.'
      },
      {
        id: 'charm-roadtrip',
        icon: '🚗',
        name: 'Roadtrip Co-Pilot',
        tag: 'LUCKY BIRTHDAY FORTUNE 🍀',
        title: '100% Green Lights & Roadtrip Tunes',
        text: 'The universe predicts seamless road trips, zero traffic jams, perfect aux cord playlists, and delicious travel snacks all year long.'
      },
      {
        id: 'charm-comfort',
        icon: '🧸',
        name: 'Comfort Queen',
        tag: 'REASON YOU ARE LOVED #02',
        title: 'The Most Comforting Presence',
        text: 'You have that rare gift of making people feel completely safe and heard just by being in the room. Thank you for being such a wonderful human.'
      },
      {
        id: 'charm-star',
        icon: '🌟',
        name: 'Dream Chaser',
        tag: 'DREAM MANIFESTATION ✨',
        title: 'That Secret Dream is Coming True',
        text: 'That special ambition you quietly hope for? Keep taking small steps. This is your year to see it blossom into reality!'
      },
      {
        id: 'charm-cafe',
        icon: '☕',
        name: 'Cozy Café Vibe',
        tag: 'REASON YOU ARE LOVED #03',
        title: 'Master of Cozy Little Moments',
        text: 'From favorite hot drinks to quiet chats and spontaneous giggles, you make everyday ordinary moments feel like special memories.'
      },
      {
        id: 'charm-crown',
        icon: '👑',
        name: 'Pure Royalty',
        tag: 'ROYAL VIBE CHECK 🌸',
        title: 'Unapologetically Yourself',
        text: 'You are fiercely kind, honest, loyal, and real. Never dim your shine for anyone — you are absolute birthday royalty!'
      },
      {
        id: 'charm-movie',
        icon: '🎬',
        name: 'Midnight Popcorn',
        tag: 'VIP REDEEMABLE PASS 🎟️',
        title: 'Midnight Snack & Movie Ticket',
        text: 'Officially redeemable with Jerry for one cozy movie night: you choose the movie, zero skips, popcorn and treats included!'
      },
      {
        id: 'charm-cheer',
        icon: '🫂',
        name: 'Infinite Cheerleader',
        tag: 'LIFETIME PROMISE 💖',
        title: 'Always in Your Corner',
        text: 'Whenever you need a reminder of how capable, strong, and talented you are — Jerry is always in the front row cheering for you 1000%.'
      }
    ];

    const capsuleState = {
      unlockedCharms: new Set(),
      isRolling: false,
      activePrize: null,
      crankAngle: 0
    };

    function playMechanicalTick(freq = 620) {
      try {
        const ctx = ensureAudio();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } catch (e) {}
    }

    function renderCharmsShelf() {
      const grid = document.getElementById('charmsPedestalsGrid');
      const progressText = document.getElementById('charmsProgressText');
      if (!grid) return;

      grid.innerHTML = '';
      CAPSULES_POOL.forEach((item, idx) => {
        const isUnlocked = capsuleState.unlockedCharms.has(item.id);
        const slot = document.createElement('div');
        slot.className = 'capsule-slot' + (isUnlocked ? ' unlocked' : '');
        slot.title = isUnlocked ? `${item.icon} ${item.name} (Unlocked!)` : `Slot #${idx + 1} (Locked - turn crank to find!)`;

        if (isUnlocked) {
          slot.innerHTML = `
            <span class="text-xl sm:text-2xl">${item.icon}</span>
            <span class="text-[9px] font-bold text-[#FF5C8A] truncate max-w-[50px] leading-none mt-0.5">${item.name}</span>
          `;
        } else {
          slot.innerHTML = `
            <span class="text-sm font-bold text-[#F3CAD6]/60">?</span>
            <span class="text-[9px] font-semibold text-[#F3CAD6]/70 leading-none mt-0.5">#0${idx + 1}</span>
          `;
        }
        grid.appendChild(slot);
      });

      if (progressText) {
        progressText.textContent = `${capsuleState.unlockedCharms.size} / ${CAPSULES_POOL.length} Charms Collected`;
      }
    }

    function turnCapsuleCrank() {
      if (capsuleState.isRolling) return;
      ensureAudio();
      capsuleState.isRolling = true;

      const crankHandle = document.getElementById('capsuleCrankHandle');
      const globeGroup = document.getElementById('globeCapsulesGroup');
      const idlePrompt = document.getElementById('capsuleIdlePrompt');
      const droppedStage = document.getElementById('capsuleDroppedStage');
      const revealedPrize = document.getElementById('capsuleRevealedPrize');

      // Spin Crank 360 degrees
      capsuleState.crankAngle += 360;
      if (crankHandle) {
        crankHandle.style.transform = `rotate(${capsuleState.crankAngle}deg)`;
      }

      // Play mechanical ratchet ticks
      playMechanicalTick(540);
      setTimeout(() => playMechanicalTick(680), 80);
      setTimeout(() => playMechanicalTick(820), 160);

      // Jiggle capsules in glass globe
      if (globeGroup) {
        globeGroup.style.transform = `rotate(${Math.random() > 0.5 ? 14 : -14}deg) scale(1.08)`;
        setTimeout(() => {
          globeGroup.style.transform = 'none';
        }, 400);
      }

      // Roll down chute sound
      setTimeout(() => {
        [987.77, 880.00, 783.99, 659.25, 523.25].forEach((f, idx) => {
          setTimeout(() => playCelestaNote(f, 0.35, 0.12), idx * 55);
        });
      }, 180);

      // Select prize (prioritizing uncollected charms)
      const uncollected = CAPSULES_POOL.filter(c => !capsuleState.unlockedCharms.has(c.id));
      const pick = uncollected.length > 0 
        ? uncollected[Math.floor(Math.random() * uncollected.length)] 
        : CAPSULES_POOL[Math.floor(Math.random() * CAPSULES_POOL.length)];
      capsuleState.activePrize = pick;

      // Show dropped capsule after roll
      setTimeout(() => {
        if (idlePrompt) idlePrompt.classList.add('hidden');
        if (revealedPrize) revealedPrize.classList.add('hidden');
        if (droppedStage) {
          droppedStage.classList.remove('hidden');
          droppedStage.classList.add('flex');
        }
        capsuleState.isRolling = false;
        playCelestaNote(783.99, 0.6, 0.15);
      }, 420);
    }

    function openDroppedCapsule() {
      if (!capsuleState.activePrize) return;
      ensureAudio();

      const droppedStage = document.getElementById('capsuleDroppedStage');
      const revealedPrize = document.getElementById('capsuleRevealedPrize');
      const prize = capsuleState.activePrize;

      // Sparkling pop fanfare
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, idx) => {
        setTimeout(() => playCelestaNote(f, 0.7, 0.18), idx * 75);
      });

      // Celebration star burst right at the capsule
      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.55, 'stars', 30);

      // Populate prize card
      const prizeTag = document.getElementById('prizeCardTag');
      const prizeIcon = document.getElementById('prizeCardIcon');
      const prizeTitle = document.getElementById('prizeCardTitle');
      const prizeText = document.getElementById('prizeCardText');

      if (prizeTag) prizeTag.textContent = prize.tag;
      if (prizeIcon) prizeIcon.textContent = prize.icon;
      if (prizeTitle) prizeTitle.textContent = prize.title;
      if (prizeText) prizeText.textContent = prize.text;

      // Add to unlocked collection
      const wasNew = !capsuleState.unlockedCharms.has(prize.id);
      capsuleState.unlockedCharms.add(prize.id);

      // Switch stage views
      if (droppedStage) droppedStage.classList.add('hidden');
      if (revealedPrize) {
        revealedPrize.classList.remove('hidden');
        revealedPrize.classList.add('flex');
      }

      // Update shelf
      renderCharmsShelf();

      if (wasNew) {
        showStickerToast(`Unlocked Birthday Charm: ${prize.icon} ${prize.name}! 🎀`, '✨');
        // Check if all 8 are collected
        if (capsuleState.unlockedCharms.size === CAPSULES_POOL.length) {
          setTimeout(() => {
            spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 'hearts', 45);
            spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 'stars', 45);
            showStickerToast(`🎉 All 8 Lucky Birthday Charms collected by ${appState.recipient}! 👑🌸`, '🏆');
          }, 600);
        }
      }
    }

    // Attach Capsule Machine Event Listeners
    const turnCrankBtn = document.getElementById('turnCapsuleCrankBtn');
    if (turnCrankBtn) turnCrankBtn.addEventListener('click', turnCapsuleCrank);

    const crankHandle = document.getElementById('capsuleCrankHandle');
    if (crankHandle) crankHandle.addEventListener('click', turnCapsuleCrank);

    const interactiveCapsule = document.getElementById('interactiveDroppedCapsule');
    if (interactiveCapsule) interactiveCapsule.addEventListener('click', openDroppedCapsule);

    const openCapsuleBtn = document.getElementById('openDroppedCapsuleBtn');
    if (openCapsuleBtn) openCapsuleBtn.addEventListener('click', openDroppedCapsule);

    const rollAnotherBtn = document.getElementById('rollAnotherCapsuleBtn');
    if (rollAnotherBtn) rollAnotherBtn.addEventListener('click', turnCapsuleCrank);

    // Initial render of charms shelf
    renderCharmsShelf();

/**************************************************************
     * 6B. KAWAII PLUSHIE COMPANIONS & SQUISHY HUG PILLOW INTERACTIONS
     **************************************************************/
    function getSquidQuotes() {
      return [
        `Happy Birthday ${appState.recipient}! 🐙✨`,
        `Make the biggest wish ever! 🎂`,
        `Eat extra slices of cake today! 🍰`,
        `You are the absolute sweetest! 🌸`
      ];
    }
    function getBunnyQuotes() {
      return [
        `Wishing you the best day, ${appState.recipient}! 🐰🌷`,
        `Sending you a thousand birthday smiles! 🎈`,
        `So proud of you always! ✨`,
        `Today is all about celebrating you! 🌟`
      ];
    }
    let squidQuoteIdx = 0;
    let bunnyQuoteIdx = 0;

    document.getElementById('petSquidCompanion').addEventListener('click', (e) => {
      const bubble = document.getElementById('squidSpeechBubble');
      const quotes = getSquidQuotes();
      squidQuoteIdx = (squidQuoteIdx + 1) % quotes.length;
      bubble.textContent = quotes[squidQuoteIdx];
      playCelestaNote(880.0, 0.9, 0.18);
      setTimeout(() => playCelestaNote(1046.5, 1.1, 0.18), 110);
      spawnRoomBurst(e.clientX || window.innerWidth * 0.35, e.clientY || window.innerHeight * 0.5, 'hearts', 18);
    });

    document.getElementById('petBunnyCompanion').addEventListener('click', (e) => {
      const bubble = document.getElementById('bunnySpeechBubble');
      const quotes = getBunnyQuotes();
      bunnyQuoteIdx = (bunnyQuoteIdx + 1) % quotes.length;
      bubble.textContent = quotes[bunnyQuoteIdx];
      playCelestaNote(783.99, 0.9, 0.18);
      setTimeout(() => playCelestaNote(987.77, 1.1, 0.18), 110);
      spawnRoomBurst(e.clientX || window.innerWidth * 0.65, e.clientY || window.innerHeight * 0.5, 'stars', 18);
    });

    // Interactive Squishy Hug Cushion (Hold or Click for Heartbeat Chime & Burst)
    let totalHugsSent = 0;
    let hugHoldInterval = null;
    const squishyHugCard = document.getElementById('squishyHugCard');
    const hugCountBadge = document.getElementById('hugCountBadge');
    const hugCounterSubtext = document.getElementById('hugCounterSubtext');

    function triggerSingleHugPulse(clientX, clientY) {
      totalHugsSent++;
      hugCountBadge.textContent = `Hug Sent (${totalHugsSent} ♡)`;
      hugCounterSubtext.innerHTML = `✨ Wrapped <span class="font-bold text-pink-600">${appState.recipient}</span> in ${totalHugsSent} warm birthday hug${totalHugsSent > 1 ? 's' : ''} from <span class="font-bold text-pink-600">${appState.sender}</span>! ✨`;
      // Warm two-note heartbeat thump-thump chime
      playCelestaNote(349.23, 0.7, 0.2);
      setTimeout(() => playCelestaNote(523.25, 1.2, 0.22), 140);
      const rect = squishyHugCard.getBoundingClientRect();
      const bx = clientX || (rect.left + rect.width / 2);
      const by = clientY || (rect.top + rect.height / 2);
      spawnRoomBurst(bx, by, 'petals', 22);
    }

    function startHugSqueeze(e) {
      squishyHugCard.classList.add('hugging-active');
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      triggerSingleHugPulse(cx, cy);
      clearInterval(hugHoldInterval);
      hugHoldInterval = setInterval(() => {
        triggerSingleHugPulse(cx, cy);
      }, 650);
    }

    function stopHugSqueeze() {
      squishyHugCard.classList.remove('hugging-active');
      clearInterval(hugHoldInterval);
    }

    squishyHugCard.addEventListener('mousedown', startHugSqueeze);
    squishyHugCard.addEventListener('touchstart', startHugSqueeze, { passive: true });
    window.addEventListener('mouseup', stopHugSqueeze);
    window.addEventListener('touchend', stopHugSqueeze);

    /**************************************************************
     * 6C. "ROBIN'S SWEET TREAT CATCHER" 3D CLAY POCKET ARCADE
     *     100% Procedural Canvas Kawaii Graphics & Web Audio SFX
     **************************************************************/
    const arcadeCanvas = document.getElementById('treatCatcherCanvas');
    const aCtx = arcadeCanvas.getContext('2d');
    const arcadeScoreText = document.getElementById('arcadeScoreText');
    const arcadeHighScoreText = document.getElementById('arcadeHighScoreText');
    const arcadeComboBadge = document.getElementById('arcadeComboBadge');
    const arcadeFeverBadge = document.getElementById('arcadeFeverBadge');
    const arcadeLoveMeterFill = document.getElementById('arcadeLoveMeterFill');
    const arcadeStartOverlay = document.getElementById('arcadeStartOverlay');
    const arcadeVictoryOverlay = document.getElementById('arcadeVictoryOverlay');
    const arcadeConsoleShell = document.getElementById('arcadeConsoleShell');
    const arcadeToggleIcon = document.getElementById('arcadeToggleIcon');
    const arcadeToggleLabel = document.getElementById('arcadeToggleLabel');

    const LOVE_NOTES_POOL = [
      'Cutest Smile! 💖',
      'My Favorite Human! 🌸',
      '100% Pure Magic! ✨',
      'So Proud of You! 👑',
      'Happy Birthday Queen! 🎂',
      'Pure Sunshine! 🌻',
      'Best Laugh Ever! 😊'
    ];

    const arcadeState = {
      running: false,
      victoryShown: false,
      score: 0,
      highScore: 0,
      combo: 0,
      feverTime: 0,
      playerX: 340,
      targetX: 340,
      moveLeft: false,
      moveRight: false,
      squashX: 1,
      squashY: 1,
      dizzyTimer: 0,
      tentaclePhase: 0,
      spawnTimer: 0,
      items: [],
      popups: [],
      bgClouds: [
        { x: 110, y: 65, scale: 0.85, speed: 0.25 },
        { x: 360, y: 48, scale: 1.05, speed: 0.18 },
        { x: 560, y: 82, scale: 0.75, speed: 0.3 }
      ]
    };

    // Quick-jump header button scrolls smoothly to the mini-game
    document.getElementById('jumpToGameHeaderBtn').addEventListener('click', () => {
      document.getElementById('sweetTreatArcadeSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
      playCelestaNote(659.25, 0.7, 0.16);
      setTimeout(() => playCelestaNote(783.99, 0.9, 0.18), 110);
    });

    function updateArcadeHUD() {
      arcadeScoreText.textContent = arcadeState.score;
      if (arcadeState.score > arcadeState.highScore) {
        arcadeState.highScore = arcadeState.score;
        arcadeHighScoreText.textContent = arcadeState.highScore;
      }
      arcadeComboBadge.textContent = `🔥 ${arcadeState.combo}x Combo`;
      const pct = Math.min(100, Math.round((arcadeState.score / 150) * 100));
      arcadeLoveMeterFill.style.width = `${pct}%`;

      if (arcadeState.feverTime > 0) {
        arcadeFeverBadge.classList.remove('hidden');
        arcadeConsoleShell.classList.add('fever-glow');
      } else {
        arcadeFeverBadge.classList.add('hidden');
        arcadeConsoleShell.classList.remove('fever-glow');
      }
    }

    // ==========================================================
    // DEDICATED VICTORY CELEBRATION SOUNDTRACK (Web Audio API)
    // Upbeat, joyful, sparkling music-box song for 150pt victory!
    // ==========================================================
    let victorySoundtrackInterval = null;
    let victorySongMuted = false;
    let victorySoundtrackStep = 0;

    // Upbeat 32-step celebratory phrase (130 BPM, C-Major & G-Major loop)
    const VICTORY_PHRASE = [
      // Measure 1: C Major (Bright, playful start)
      { chord: [130.81, 196.00, 261.63, 329.63], note: 523.25 },
      { note: 659.25 },
      { note: 783.99 },
      { note: 1046.50 },
      // Measure 2: G Major (Bouncy response)
      { chord: [98.00, 146.83, 196.00, 246.94], note: 987.77 },
      { note: 783.99 },
      { note: 587.33 },
      { note: 783.99 },
      // Measure 3: A Minor (Heartwarming lift)
      { chord: [110.00, 164.81, 220.00, 261.63], note: 659.25 },
      { note: 880.00 },
      { note: 1046.50 },
      { note: 1318.51 },
      // Measure 4: F Major (Sweet cadence)
      { chord: [87.31, 130.81, 174.61, 220.00], note: 1174.66 },
      { note: 1046.50 },
      { note: 880.00 },
      { note: 783.99 },
      // Measure 5: C Major (Second phrase build)
      { chord: [130.81, 196.00, 261.63, 329.63], note: 523.25 },
      { note: 659.25 },
      { note: 783.99 },
      { note: 1046.50 },
      // Measure 6: G Major (High melody leap)
      { chord: [98.00, 146.83, 196.00, 246.94], note: 1174.66 },
      { note: 1046.50 },
      { note: 987.77 },
      { note: 783.99 },
      // Measure 7: F Major (Triumphant ascent)
      { chord: [87.31, 130.81, 174.61, 220.00], note: 880.00 },
      { note: 1046.50 },
      { note: 1174.66 },
      { note: 1318.51 },
      // Measure 8: G Major Cadence (Celebratory finish)
      { chord: [98.00, 146.83, 196.00, 246.94], note: 1567.98 },
      { note: 1318.51 },
      { note: 1174.66 },
      { note: 1046.50 }
    ];

    function playVictoryStepNote(freq, dur = 0.55, vol = 0.17) {
      if (victorySongMuted) return;
      try {
        const ctx = ensureAudio();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const sub = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        sub.type = 'triangle';
        sub.frequency.setValueAtTime(freq * 0.5, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);

        osc.connect(gain);
        sub.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        sub.start(now);
        osc.stop(now + dur);
        sub.stop(now + dur);
      } catch (e) {}
    }

    function playVictoryStepChord(freqs, dur = 0.88, vol = 0.055) {
      if (victorySongMuted) return;
      try {
        const ctx = ensureAudio();
        const now = ctx.currentTime;
        freqs.forEach(f => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(vol, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + dur);
        });
      } catch (e) {}
    }

    function startVictorySoundtrack() {
      stopVictorySoundtrack();
      victorySoundtrackStep = 0;
      ensureAudio();

      function tick() {
        const stepData = VICTORY_PHRASE[victorySoundtrackStep % VICTORY_PHRASE.length];
        if (stepData.chord) {
          playVictoryStepChord(stepData.chord, 0.85, 0.055);
        }
        if (stepData.note) {
          playVictoryStepNote(stepData.note, 0.52, 0.16);
        }
        victorySoundtrackStep++;
      }

      tick();
      victorySoundtrackInterval = setInterval(tick, 230); // ~130 BPM upbeat celebration
    }

    function stopVictorySoundtrack() {
      if (victorySoundtrackInterval) {
        clearInterval(victorySoundtrackInterval);
        victorySoundtrackInterval = null;
      }
    }

    // ==========================================================
    // VICTORY MODAL & WORLD'S CUTEST VISUAL GIFT LOGIC
    // ==========================================================
    function openVictoryGiftModal() {
      arcadeState.victoryShown = true;
      arcadeState.running = false;
      arcadeToggleIcon.textContent = '▶';
      arcadeToggleLabel.textContent = 'Start Game';

      // Deep background blur on stage and lock background scroll
      const stage = document.getElementById('parallaxStage');
      if (stage) stage.classList.add('gift-backdrop-blur');
      document.body.classList.add('overflow-hidden');

      // Display the full-screen modal
      arcadeVictoryOverlay.classList.remove('hidden');
      arcadeVictoryOverlay.classList.add('flex');

      // Reset to wrapped gift box stage
      const giftBoxStage = document.getElementById('giftBoxStage');
      const unwrappedStage = document.getElementById('unwrappedGiftStage');
      const lidGroup = document.getElementById('giftBoxLidGroup');
      if (giftBoxStage) giftBoxStage.classList.remove('hidden');
      if (unwrappedStage) unwrappedStage.classList.add('hidden');
      if (lidGroup) lidGroup.classList.remove('lid-pop-animation');

      // Start victory soundtrack
      startVictorySoundtrack();

      // Joyful chime fanfare & confetti burst
      const fanfare = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
      fanfare.forEach((f, idx) => {
        setTimeout(() => playCelestaNote(f, 0.9, 0.18), idx * 110);
      });
      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'stars', 40);
    }

    function closeVictoryGiftModal() {
      arcadeVictoryOverlay.classList.add('hidden');
      arcadeVictoryOverlay.classList.remove('flex');

      // Remove deep background blur and body scroll lock
      const stage = document.getElementById('parallaxStage');
      if (stage) stage.classList.remove('gift-backdrop-blur');
      document.body.classList.remove('overflow-hidden');

      // Stop victory soundtrack
      stopVictorySoundtrack();
    }

    function unboxBirthdayGift() {
      ensureAudio();
      const giftBoxStage = document.getElementById('giftBoxStage');
      const unwrappedStage = document.getElementById('unwrappedGiftStage');
      const lidGroup = document.getElementById('giftBoxLidGroup');

      if (lidGroup) {
        lidGroup.classList.add('lid-pop-animation');
      }

      // Sparkling chime run
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((n, i) => {
        setTimeout(() => playCelestaNote(n, 1.2, 0.22), i * 85);
      });

      // Celebration bursts on top of the modal
      spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'stars', 45);
      setTimeout(() => {
        spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'hearts', 35);
      }, 150);

      setTimeout(() => {
        if (giftBoxStage) giftBoxStage.classList.add('hidden');
        if (unwrappedStage) {
          unwrappedStage.classList.remove('hidden');
          unwrappedStage.classList.add('flex');
        }
        showStickerToast(`Long-distance birthday gift unboxed for ${appState.recipient}! ✈️🌸👑`, '🎁');
      }, 450);
    }

    // Attach Gift Box and Action Button Listeners
    const unboxBtn = document.getElementById('unboxGiftBtn');
    if (unboxBtn) unboxBtn.addEventListener('click', unboxBirthdayGift);

    const interactiveBox = document.getElementById('interactiveGiftBox');
    if (interactiveBox) interactiveBox.addEventListener('click', unboxBirthdayGift);

    const replayBtn = document.getElementById('replayUnboxingBtn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        const giftBoxStage = document.getElementById('giftBoxStage');
        const unwrappedStage = document.getElementById('unwrappedGiftStage');
        const lidGroup = document.getElementById('giftBoxLidGroup');
        if (lidGroup) lidGroup.classList.remove('lid-pop-animation');
        if (unwrappedStage) unwrappedStage.classList.add('hidden');
        if (giftBoxStage) giftBoxStage.classList.remove('hidden');
        playCelestaNote(659.25, 0.6, 0.16);
      });
    }

    const playAgainBtn = document.getElementById('playAgainArcadeBtn');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        closeVictoryGiftModal();
        arcadeState.score = 0;
        arcadeState.combo = 0;
        arcadeState.feverTime = 0;
        arcadeState.victoryShown = false;
        arcadeState.items = [];
        arcadeState.popups = [];
        updateArcadeHUD();
        startOrResumeArcade();
        showStickerToast('Starting fresh game for ' + appState.recipient + '! Catch those sweet treats! 🍓', '🎮');
      });
    }

    const victoryCloseBtn = document.getElementById('closeVictoryGiftBtn');
    if (victoryCloseBtn) {
      victoryCloseBtn.addEventListener('click', closeVictoryGiftModal);
    }

    const victoryConfettiBtn = document.getElementById('victoryConfettiBtn');
    if (victoryConfettiBtn) {
      victoryConfettiBtn.addEventListener('click', () => {
        spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.4, 'stars', 35);
        spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'hearts', 25);
        [659.25, 783.99, 1046.50].forEach((n, i) => setTimeout(() => playCelestaNote(n, 0.8, 0.18), i * 110));
      });
    }

    const victoryMusicBtn = document.getElementById('victoryMusicToggleBtn');
    if (victoryMusicBtn) {
      victoryMusicBtn.addEventListener('click', () => {
        victorySongMuted = !victorySongMuted;
        const label = document.getElementById('victoryMusicLabel');
        const icon = document.getElementById('victoryMusicNoteIcon');
        if (victorySongMuted) {
          if (label) label.textContent = 'Celebration Tune: OFF 🔇';
          if (icon) icon.classList.remove('animate-bounce');
        } else {
          if (label) label.textContent = 'Celebration Tune: ON 🔊';
          if (icon) icon.classList.add('animate-bounce');
        }
      });
    }

    // Interactive Long-Distance Perk Coupon Taps
    document.querySelectorAll('.long-distance-coupon').forEach(coupon => {
      coupon.addEventListener('click', () => {
        ensureAudio();
        playCelestaNote(880, 0.8, 0.18);
        const rect = coupon.getBoundingClientRect();
        spawnRoomBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 'hearts', 22);
        const titleEl = coupon.querySelector('h4');
        const title = titleEl ? titleEl.textContent : 'Long-distance pass';
        showStickerToast(`✈️ ${title} activated! Jerry is on duty! 💖`, '💌');
      });
    });

    function startOrResumeArcade() {
      ensureAudio();
      arcadeStartOverlay.classList.add('opacity-0', 'pointer-events-none');
      closeVictoryGiftModal();
      arcadeState.running = true;
      arcadeToggleIcon.textContent = '⏸';
      arcadeToggleLabel.textContent = 'Pause Game';
      playCelestaNote(523.25, 0.6, 0.16);
      setTimeout(() => playCelestaNote(659.25, 0.6, 0.16), 90);
      setTimeout(() => playCelestaNote(783.99, 0.9, 0.18), 180);
    }

    function pauseArcade() {
      arcadeState.running = false;
      arcadeToggleIcon.textContent = '▶';
      arcadeToggleLabel.textContent = 'Resume Game';
    }

    document.getElementById('startArcadeGameBtn').addEventListener('click', () => {
      arcadeState.score = 0;
      arcadeState.combo = 0;
      arcadeState.feverTime = 0;
      arcadeState.victoryShown = false;
      arcadeState.items = [];
      arcadeState.popups = [];
      updateArcadeHUD();
      startOrResumeArcade();
    });

    document.getElementById('arcadeTogglePauseBtn').addEventListener('click', () => {
      if (!arcadeStartOverlay.classList.contains('pointer-events-none')) {
        document.getElementById('startArcadeGameBtn').click();
        return;
      }
      if (arcadeState.running) {
        pauseArcade();
      } else {
        startOrResumeArcade();
      }
    });

    // Left / Right Tactile Arcade Buttons & Keyboard Controls
    const arcadeLeftBtn = document.getElementById('arcadeLeftBtn');
    const arcadeRightBtn = document.getElementById('arcadeRightBtn');

    function setMoveDir(dir, isDown) {
      if (dir === 'left') {
        arcadeState.moveLeft = isDown;
        arcadeLeftBtn.classList.toggle('pressed', isDown);
      } else {
        arcadeState.moveRight = isDown;
        arcadeRightBtn.classList.toggle('pressed', isDown);
      }
    }

    ['mousedown', 'touchstart'].forEach(evt => {
      arcadeLeftBtn.addEventListener(evt, (e) => {
        if (e.cancelable) e.preventDefault();
        setMoveDir('left', true);
      }, { passive: false });
      arcadeRightBtn.addEventListener(evt, (e) => {
        if (e.cancelable) e.preventDefault();
        setMoveDir('right', true);
      }, { passive: false });
    });

    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => {
      arcadeLeftBtn.addEventListener(evt, () => setMoveDir('left', false));
      arcadeRightBtn.addEventListener(evt, () => setMoveDir('right', false));
    });

    window.addEventListener('keydown', (e) => {
      if (!arcadeState.running) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setMoveDir('left', true);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setMoveDir('right', true);
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setMoveDir('left', false);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setMoveDir('right', false);
    });

    // Pointer / Touch Drag Directly on Canvas
    function handleCanvasPointer(clientX) {
      const rect = arcadeCanvas.getBoundingClientRect();
      const relX = ((clientX - rect.left) / rect.width) * arcadeCanvas.width;
      arcadeState.targetX = Math.max(58, Math.min(arcadeCanvas.width - 58, relX));
    }

    arcadeCanvas.addEventListener('mousemove', (e) => {
      if (arcadeState.running) handleCanvasPointer(e.clientX);
    });
    arcadeCanvas.addEventListener('touchmove', (e) => {
      if (!arcadeState.running) return;
      if (e.cancelable) e.preventDefault();
      handleCanvasPointer(e.touches[0].clientX);
    }, { passive: false });
    arcadeCanvas.addEventListener('touchstart', (e) => {
      if (!arcadeState.running) return;
      handleCanvasPointer(e.touches[0].clientX);
    }, { passive: true });

    // Spawn Hand-Crafted Procedural Treats
    function spawnArcadeTreat() {
      const roll = Math.random();
      let type = 'berry';
      let pts = 10;
      let radius = 20;
      let speed = 2.2 + Math.random() * 1.1;

      if (arcadeState.feverTime > 0 && Math.random() < 0.35) {
        type = 'star';
        pts = 20;
        radius = 22;
        speed = 2.8 + Math.random() * 1.2;
      } else if (roll < 0.34) {
        type = 'berry';
        pts = 10;
      } else if (roll < 0.62) {
        type = 'cupcake';
        pts = 15;
        radius = 22;
      } else if (roll < 0.80) {
        type = 'star';
        pts = 20;
        radius = 22;
        speed = 2.6 + Math.random() * 1.1;
      } else if (roll < 0.90) {
        type = 'letter';
        pts = 30;
        radius = 24;
        speed = 2.4 + Math.random() * 0.9;
      } else {
        type = 'cloud';
        pts = 0;
        radius = 24;
        speed = 2.1 + Math.random() * 0.9;
      }

      arcadeState.items.push({
        x: 55 + Math.random() * (arcadeCanvas.width - 110),
        y: -30,
        vy: speed,
        swayAmp: 0.6 + Math.random() * 1.1,
        swayPhase: Math.random() * Math.PI * 2,
        rot: (Math.random() - 0.5) * 0.25,
        type,
        pts,
        radius
      });
    }

    // Procedural Kawaii Treat Drawing Helpers (Zero External Images)
    function drawProceduralTreat(ctx, item) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(Math.sin(item.swayPhase) * 0.14);

      if (item.type === 'berry') {
        // 3D Sugar Strawberry
        const g = ctx.createRadialGradient(-5, -6, 3, 0, 0, 22);
        g.addColorStop(0, '#FF9EBB');
        g.addColorStop(0.45, '#FB6F92');
        g.addColorStop(1, '#E11D48');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.bezierCurveTo(18, -16, 20, 6, 0, 20);
        ctx.bezierCurveTo(-20, 6, -18, -16, 0, -16);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#FFFDF9';
        ctx.stroke();

        // Leaf Crown
        ctx.fillStyle = '#34D399';
        ctx.beginPath();
        ctx.ellipse(-6, -16, 6, 3.5, -0.3, 0, Math.PI * 2);
        ctx.ellipse(6, -16, 6, 3.5, 0.3, 0, Math.PI * 2);
        ctx.ellipse(0, -17, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute Seeds & Highlight
        ctx.fillStyle = '#FEF08A';
        [[-6, -3], [6, -3], [0, 3], [-5, 8], [5, 8]].forEach(([sx, sy]) => {
          ctx.beginPath();
          ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (item.type === 'cupcake') {
        // Pastel Cupcake Wrapper
        ctx.fillStyle = '#A7F3D0';
        ctx.strokeStyle = '#FFFDF9';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-14, 2);
        ctx.lineTo(14, 2);
        ctx.lineTo(10, 18);
        ctx.lineTo(-10, 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Swirled Pink Frosting Dome
        ctx.fillStyle = '#FFACC5';
        ctx.beginPath();
        ctx.arc(0, -2, 15, Math.PI, 0, false);
        ctx.bezierCurveTo(16, 4, -16, 4, -15, -2);
        ctx.fill();
        ctx.stroke();

        // Cherry on Top
        ctx.fillStyle = '#F43F5E';
        ctx.beginPath();
        ctx.arc(0, -16, 5.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'star') {
        // Glowing 5-Point Chubby Wish Star
        ctx.fillStyle = '#FDE047';
        ctx.strokeStyle = '#FFFDF9';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        for (let s = 0; s < 5; s++) {
          const outerX = Math.cos((18 + s * 72) * Math.PI / 180) * 19;
          const outerY = -Math.sin((18 + s * 72) * Math.PI / 180) * 19;
          const innerX = Math.cos((54 + s * 72) * Math.PI / 180) * 9.5;
          const innerY = -Math.sin((54 + s * 72) * Math.PI / 180) * 9.5;
          if (s === 0) ctx.moveTo(outerX, outerY);
          else ctx.lineTo(outerX, outerY);
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Cute Star Eyes
        ctx.fillStyle = '#432C39';
        ctx.beginPath();
        ctx.arc(-4.5, -1, 2, 0, Math.PI * 2);
        ctx.arc(4.5, -1, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'letter') {
        // Love Letter from Jerry with Heart Wax Seal
        ctx.fillStyle = '#FFFDF9';
        ctx.strokeStyle = '#F472B6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-19, -13, 38, 26, 6);
        ctx.fill();
        ctx.stroke();

        // Envelope Flap
        ctx.beginPath();
        ctx.moveTo(-18, -12);
        ctx.lineTo(0, 3);
        ctx.lineTo(18, -12);
        ctx.stroke();

        // Red Heart Seal
        ctx.fillStyle = '#FB7185';
        ctx.beginPath();
        ctx.arc(0, 2, 5.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'cloud') {
        // Puffy Grumpy Tickle Cloud
        ctx.fillStyle = '#CBD5E1';
        ctx.strokeStyle = '#FFFDF9';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-10, 2, 12, 0, Math.PI * 2);
        ctx.arc(10, 2, 12, 0, Math.PI * 2);
        ctx.arc(0, -6, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cute Pouty Brows
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.lineTo(-3, -1);
        ctx.moveTo(8, -4);
        ctx.lineTo(3, -1);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw Player: Baby Robin's Squid in Royal Crown Holding Woven Basket
    function drawPlayerCalalamari(ctx, x, y) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(arcadeState.squashX, arcadeState.squashY);

      // Find nearest falling treat so Calalamari's glossy eyes track it!
      let lookDX = 0;
      let lookDY = -2;
      if (arcadeState.items.length > 0) {
        const nearest = arcadeState.items[0];
        const dx = nearest.x - x;
        const dy = nearest.y - y;
        const dist = Math.hypot(dx, dy) || 1;
        lookDX = (dx / dist) * 2.8;
        lookDY = (dy / dist) * 2.2;
      }

      // 1. Wiggly Clay Tentacles at Bottom
      ctx.fillStyle = '#FF8FAB';
      ctx.strokeStyle = '#FFFDF9';
      ctx.lineWidth = 2.5;
      for (let t = -2; t <= 2; t++) {
        const tx = t * 11;
        const sway = Math.sin(arcadeState.tentaclePhase + t) * 4.5;
        ctx.beginPath();
        ctx.ellipse(tx + sway * 0.4, 24, 5.5, 11, sway * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 2. Plump 3D Clay Squid Body
      const bodyGrad = ctx.createRadialGradient(-10, -14, 6, 0, 0, 38);
      bodyGrad.addColorStop(0, '#FFF0F5');
      bodyGrad.addColorStop(0.5, '#FF9EBB');
      bodyGrad.addColorStop(1, '#FB6F92');
      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = '#FFFDF9';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, -2, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. Golden Birthday Queen Crown on Top
      ctx.fillStyle = '#FDE047';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-15, -28);
      ctx.lineTo(-18, -44);
      ctx.lineTo(-6, -35);
      ctx.lineTo(0, -47);
      ctx.lineTo(6, -35);
      ctx.lineTo(18, -44);
      ctx.lineTo(15, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Expressive Kawaii Eyes & Rosy Cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.beginPath();
      ctx.ellipse(-16, -2, 5.5, 3.2, 0, 0, Math.PI * 2);
      ctx.ellipse(16, -2, 5.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      if (arcadeState.dizzyTimer > 0) {
        // Funny Dizzy Squint (>﹏<)
        ctx.strokeStyle = '#3B2330';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-14, -10);
        ctx.lineTo(-7, -6);
        ctx.lineTo(-14, -2);
        ctx.moveTo(14, -10);
        ctx.lineTo(7, -6);
        ctx.lineTo(14, -2);
        ctx.stroke();
      } else {
        // Glossy Tracking Eyes
        ctx.fillStyle = '#3B2330';
        ctx.beginPath();
        ctx.arc(-10 + lookDX, -7 + lookDY, 4.8, 0, Math.PI * 2);
        ctx.arc(10 + lookDX, -7 + lookDY, 4.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-11.5 + lookDX, -8.8 + lookDY, 2, 0, Math.PI * 2);
        ctx.arc(8.5 + lookDX, -8.8 + lookDY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Woven Pastel Picnic Basket Held in Front
      ctx.fillStyle = '#FDE68A';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-26, 6, 52, 16, 8);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    function triggerArcadeVictory() {
      openVictoryGiftModal();
    }

    // Main 60FPS Pocket Arcade Loop
    function arcadeGameLoop() {
      const W = arcadeCanvas.width;
      const H = arcadeCanvas.height;

      aCtx.clearRect(0, 0, W, H);

      // Rainbow Fever Aura Background Tint
      if (arcadeState.feverTime > 0) {
        const feverGrad = aCtx.createLinearGradient(0, 0, W, H);
        feverGrad.addColorStop(0, 'rgba(255, 182, 210, 0.25)');
        feverGrad.addColorStop(0.5, 'rgba(253, 230, 138, 0.3)');
        feverGrad.addColorStop(1, 'rgba(167, 243, 208, 0.25)');
        aCtx.fillStyle = feverGrad;
        aCtx.fillRect(0, 0, W, H);
      }

      // Soft Drifting Pastel Background Clouds
      arcadeState.bgClouds.forEach(c => {
        c.x += c.speed;
        if (c.x > W + 80) c.x = -80;
        aCtx.save();
        aCtx.translate(c.x, c.y);
        aCtx.scale(c.scale, c.scale);
        aCtx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        aCtx.beginPath();
        aCtx.arc(-18, 4, 16, 0, Math.PI * 2);
        aCtx.arc(18, 4, 16, 0, Math.PI * 2);
        aCtx.arc(0, -6, 22, 0, Math.PI * 2);
        aCtx.fill();
        aCtx.restore();
      });

      // Pastel Rolling Hills Floor
      aCtx.fillStyle = '#FBCFE8';
      aCtx.beginPath();
      aCtx.ellipse(W * 0.28, H + 18, 260, 52, 0, 0, Math.PI * 2);
      aCtx.ellipse(W * 0.75, H + 15, 280, 56, 0, 0, Math.PI * 2);
      aCtx.fill();

      if (arcadeState.running) {
        arcadeState.tentaclePhase += 0.14;
        if (arcadeState.dizzyTimer > 0) arcadeState.dizzyTimer--;
        if (arcadeState.feverTime > 0) {
          arcadeState.feverTime--;
          if (arcadeState.feverTime === 0) updateArcadeHUD();
        }

        // Smooth Keyboard / Button Movement
        if (arcadeState.moveLeft) arcadeState.targetX -= 7.2;
        if (arcadeState.moveRight) arcadeState.targetX += 7.2;
        arcadeState.targetX = Math.max(48, Math.min(W - 48, arcadeState.targetX));
        arcadeState.playerX += (arcadeState.targetX - arcadeState.playerX) * 0.24;

        // Relax Squash & Stretch back to 1.0
        arcadeState.squashX += (1 - arcadeState.squashX) * 0.18;
        arcadeState.squashY += (1 - arcadeState.squashY) * 0.18;

        // Spawn Falling Treats
        arcadeState.spawnTimer++;
        const spawnInterval = arcadeState.feverTime > 0 ? 34 : 48;
        if (arcadeState.spawnTimer >= spawnInterval) {
          arcadeState.spawnTimer = 0;
          spawnArcadeTreat();
        }

        const playerY = H - 48;

        // Update & Draw Falling Treats
        for (let i = arcadeState.items.length - 1; i >= 0; i--) {
          const it = arcadeState.items[i];
          it.swayPhase += 0.05;
          it.x += Math.sin(it.swayPhase) * it.swayAmp;
          it.y += it.vy;

          drawProceduralTreat(aCtx, it);

          // Check Catch Collision with Calalamari's Basket
          const dx = it.x - arcadeState.playerX;
          const dy = it.y - (playerY - 4);
          if (Math.abs(dx) < 44 && Math.abs(dy) < 32) {
            if (it.type === 'cloud') {
              // Tickle Cloud: cute dizzy squint, resets combo, never loses!
              arcadeState.dizzyTimer = 46;
              arcadeState.combo = 0;
              arcadeState.squashX = 1.28;
              arcadeState.squashY = 0.76;
              playCelestaNote(311.13, 0.5, 0.14);
              arcadeState.popups.push({
                x: it.x,
                y: it.y - 10,
                text: 'Tickle Cloud! ( >﹏< )',
                color: '#64748B',
                life: 1
              });
            } else {
              // Sweet Treat Caught!
              arcadeState.combo++;
              const mult = arcadeState.feverTime > 0 ? 2 : 1;
              const gained = it.pts * mult;
              arcadeState.score += gained;
              arcadeState.squashX = 1.24;
              arcadeState.squashY = 0.8;

              // Activate Rainbow Sugar Rush Fever at 5x Combo!
              if (arcadeState.combo >= 5 && arcadeState.feverTime === 0) {
                arcadeState.feverTime = 360; // 6 seconds of 2x fever
                arcadeState.popups.push({
                  x: W / 2,
                  y: H * 0.32,
                  text: '✨ SUGAR RUSH FEVER 2X! ✨',
                  color: '#EC4899',
                  life: 1.3
                });
              }

              const noteFreq = CHIME_SCALE[arcadeState.combo % CHIME_SCALE.length];
              playCelestaNote(noteFreq, 0.75, 0.16);

              let labelText = `+${gained} 💖`;
              if (it.type === 'letter') {
                const sweetNote = LOVE_NOTES_POOL[Math.floor(Math.random() * LOVE_NOTES_POOL.length)];
                labelText = `💌 "${sweetNote}" (+${gained})`;
              }
              arcadeState.popups.push({
                x: it.x,
                y: it.y - 12,
                text: labelText,
                color: it.type === 'letter' ? '#E11D48' : '#D97706',
                life: 1.15
              });

              if (arcadeState.score >= 150 && !arcadeState.victoryShown) {
                arcadeState.score = 150;
                updateArcadeHUD();
                arcadeState.items = [];
                triggerArcadeVictory();
                break;
              }
            }

            updateArcadeHUD();
            arcadeState.items.splice(i, 1);
            continue;
          }

          // Missed bottom edge
          if (it.y > H + 35) {
            if (it.type !== 'cloud') {
              arcadeState.combo = 0;
              updateArcadeHUD();
            }
            arcadeState.items.splice(i, 1);
          }
        }
      } else {
        // Draw existing treats while paused
        arcadeState.items.forEach(it => drawProceduralTreat(aCtx, it));
      }

      // Draw Player Character
      drawPlayerCalalamari(aCtx, arcadeState.playerX, H - 48);

      // Draw Floating Compliment & Score Popups
      for (let pIdx = arcadeState.popups.length - 1; pIdx >= 0; pIdx--) {
        const pop = arcadeState.popups[pIdx];
        pop.y -= 0.9;
        pop.life -= 0.02;
        if (pop.life <= 0) {
          arcadeState.popups.splice(pIdx, 1);
          continue;
        }
        aCtx.save();
        aCtx.globalAlpha = Math.min(1, pop.life);
        aCtx.font = 'bold 15px Quicksand, sans-serif';
        aCtx.textAlign = 'center';
        aCtx.fillStyle = '#FFFDF9';
        aCtx.strokeStyle = '#FFFDF9';
        aCtx.lineWidth = 4;
        aCtx.strokeText(pop.text, pop.x, pop.y);
        aCtx.fillStyle = pop.color;
        aCtx.fillText(pop.text, pop.x, pop.y);
        aCtx.restore();
      }

      requestAnimationFrame(arcadeGameLoop);
    }
    arcadeGameLoop();

    // Subtle Cursor / Touch Fairy-Dust Sparkle Trail
    let lastSparkleTime = 0;
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastSparkleTime > 55) {
        lastSparkleTime = now;
        spawnRoomBurst(e.clientX, e.clientY, Math.random() > 0.5 ? 'stars' : 'petals', 1);
      }
    });

    /**************************************************************
     * 7. CUSTOMIZE NAMES MODAL & SHAREABLE LINK
     **************************************************************/
    document.getElementById('openCustomBtn').addEventListener('click', () => {
      document.getElementById('customToInput').value = appState.recipient;
      document.getElementById('customFromInput').value = appState.sender;
      document.getElementById('customByInput').value = appState.author;
      const m = document.getElementById('customNamesModal');
      m.classList.remove('hidden');
      m.classList.add('flex');
    });

    // Quick-toggle buttons for "Robin" / "Robbie"
    document.querySelectorAll('[data-quick-name]').forEach(btn => {
      btn.addEventListener('click', () => {
        const picked = btn.getAttribute('data-quick-name');
        document.getElementById('customToInput').value = picked;
        appState.recipient = picked.toUpperCase();
        syncNamesToDOM();
        playCelestaNote(659.25, 0.9, 0.16);
      });
    });

    // Live-update as user types in the modal inputs
    ['customToInput', 'customFromInput', 'customByInput'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        const t = document.getElementById('customToInput').value.trim();
        const f = document.getElementById('customFromInput').value.trim();
        const b = document.getElementById('customByInput').value.trim();
        if (t) appState.recipient = t.toUpperCase();
        if (f) appState.sender = f.toUpperCase();
        if (b) appState.author = b;
        syncNamesToDOM();
      });
    });

    document.getElementById('saveCustomNamesBtn').addEventListener('click', () => {
      const t = document.getElementById('customToInput').value.trim();
      const f = document.getElementById('customFromInput').value.trim();
      const b = document.getElementById('customByInput').value.trim();
      if (t) appState.recipient = t.toUpperCase();
      if (f) appState.sender = f.toUpperCase();
      if (b) appState.author = b;
      syncNamesToDOM();
      document.getElementById('customNamesModal').classList.add('hidden');
      document.getElementById('customNamesModal').classList.remove('flex');
      showStickerToast(`Updated keepsake for ${appState.recipient}! ✨`);
    });

    document.getElementById('copyCustomUrlBtn').addEventListener('click', () => {
      const t = encodeURIComponent(document.getElementById('customToInput').value.trim() || appState.recipient);
      const f = encodeURIComponent(document.getElementById('customFromInput').value.trim() || appState.sender);
      const b = encodeURIComponent(document.getElementById('customByInput').value.trim() || appState.author);
      const shareUrl = `${window.location.origin}${window.location.pathname}?to=${t}&from=${f}&by=${b}`;
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showStickerToast('Shareable link copied to clipboard! 🔗', '💌');
    });

    /**************************************************************
     * 8. DUAL CANVAS PARTICLE ENGINE (ROOM PETALS & CINEMA FIREFLIES)
     **************************************************************/
    const roomCanvas = document.getElementById('roomParticlesCanvas');
    const rCtx = roomCanvas.getContext('2d');
    const cinemaCanvas = document.getElementById('cinemaFirefliesCanvas');
    const cCtx = cinemaCanvas.getContext('2d');
    const starfieldCanvas = document.getElementById('ambientStarfieldCanvas');
    const bgCtx = starfieldCanvas ? starfieldCanvas.getContext('2d') : null;

    let roomBursts = [];
    let fireflies = [];
    let ambientStars = [];

    function resizeCanvases() {
      roomCanvas.width = window.innerWidth;
      roomCanvas.height = window.innerHeight;
      cinemaCanvas.width = window.innerWidth;
      cinemaCanvas.height = window.innerHeight;
      if (starfieldCanvas) {
        starfieldCanvas.width = window.innerWidth;
        starfieldCanvas.height = window.innerHeight;
      }
    }
    window.addEventListener('resize', resizeCanvases);
    resizeCanvases();

    // Populate ambient gentle starlight & cosmic firefly dust for continuous background life
    for (let i = 0; i < 48; i++) {
      ambientStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: i % 4 === 0 ? 2 + Math.random() * 1.6 : 0.9 + Math.random() * 1.3,
        vy: -0.2 - Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.018 + Math.random() * 0.025,
        color: ['#FF85A2', '#FFD166', '#7CD4A6', '#FFF0F5', '#F8B4D9', '#E0A9FF'][i % 6]
      });
    }

    // Populate warm golden fireflies & soft bokeh orbs for the Dark-Blur Cinema
    for (let i = 0; i < 42; i++) {
      fireflies.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: i % 5 === 0 ? 12 + Math.random() * 18 : 2 + Math.random() * 3.5,
        isBokeh: i % 5 === 0,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -0.35 - Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        color: ['#FDE68A', '#F9A8D4', '#A7F3D0', '#DDD6FE'][i % 4]
      });
    }

    function spawnRoomBurst(x, y, kind = 'petals', count = 30) {
      const palette = ['#FF4D6D', '#68B080', '#FF758F', '#86EFAC', '#FFB3C1', '#FDE68A', '#FFF0F5'];
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2.5 + Math.random() * 8;
        roomBursts.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 3,
          size: 7 + Math.random() * 7,
          color: palette[i % palette.length],
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.15,
          life: 1,
          decay: 0.008 + Math.random() * 0.01,
          kind
        });
      }
    }

    /**************************************************************
     * 9. QUICK NAVIGATION & CELEBRATION GUIDE CONTROLS
     **************************************************************/
    /**************************************************************
     * 7. PAGE-WISE SECTION NAVIGATION CONTROLLER
     * Interactive Page-by-Page presentation of Robin's 9 Birthday Stages
     **************************************************************/
    const SECTION_PAGES = [
      { id: 'birthdayCakeSection', title: 'Birthday Cake & Candles', emoji: '🎂', short: 'Cake' },
      { id: 'birthdayHugSection', title: 'Warm Birthday Hug', emoji: '🤗', short: 'Hug' },
      { id: 'sweetTreatArcadeSection', title: 'Sweet Treat Arcade', emoji: '🎮', short: 'Arcade' },
      { id: 'flowerGardenSection', title: 'Bouquet Blossom Garden', emoji: '🌸', short: 'Garden' },
      { id: 'memoryBookSection', title: 'Robin’s Memory Storybook', emoji: '📖', short: 'Book' },
      { id: 'adventureSection', title: 'Adventure Compass', emoji: '🧭', short: 'Adventure' },
      { id: 'grantingSection', title: 'Star Wish & Scratch Card', emoji: '✨', short: 'Star Wish' },
      { id: 'happinessSection', title: 'Sunshine Vinyl Record', emoji: '🌻', short: 'Vinyl' },
      { id: 'birthdayCapsuleSection', title: 'Magical Capsule Machine', emoji: '🪙', short: 'Capsules' }
    ];

    let activeSectionIdx = 0;
    let isPageWiseMode = true; // Default is true (Page-wise mode as requested!)

    // Initialize View Mode preference
    try {
      const savedMode = localStorage.getItem('birthday_view_mode');
      if (savedMode === 'scroll') {
        isPageWiseMode = false;
      }
    } catch (e) {}

    function updateSectionDots() {
      document.querySelectorAll('.section-dots-container').forEach(container => {
        container.innerHTML = '';
        SECTION_PAGES.forEach((page, idx) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'section-nav-dot' + (idx === activeSectionIdx ? ' active-dot' : '');
          dot.title = `Go to Page ${idx + 1}: ${page.emoji} ${page.title}`;
          dot.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSectionPage(idx);
          });
          container.appendChild(dot);
        });
      });
    }

    function goToSectionPage(targetIdx, playSound = true, smoothScroll = true) {
      if (targetIdx < 0) targetIdx = 0;
      if (targetIdx >= SECTION_PAGES.length) targetIdx = SECTION_PAGES.length - 1;

      activeSectionIdx = targetIdx;
      const targetPage = SECTION_PAGES[targetIdx];
      const targetEl = document.getElementById(targetPage.id);

      if (isPageWiseMode) {
        // Hide other sections, show active section with animation
        SECTION_PAGES.forEach((p, idx) => {
          const el = document.getElementById(p.id);
          if (!el) return;
          if (idx === targetIdx) {
            el.classList.remove('hidden');
            el.classList.add('section-page-active');
          } else {
            el.classList.add('hidden');
            el.classList.remove('section-page-active');
          }
        });
      } else {
        // Continuous scroll mode - ensure all visible
        SECTION_PAGES.forEach(p => {
          const el = document.getElementById(p.id);
          if (el) el.classList.remove('hidden');
        });
      }

      // Update Nav Pills (the sticky pill bar in the user's screenshot)
      document.querySelectorAll('.nav-jump-btn').forEach(btn => {
        const tId = btn.getAttribute('data-target');
        if (tId === targetPage.id) {
          btn.classList.add('active-nav-pill');
          // Center the active pill smoothly if the horizontal bar overflows
          try {
            const navContainer = btn.parentElement;
            if (navContainer && navContainer.scrollWidth > navContainer.clientWidth) {
              btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
          } catch (err) {}
        } else {
          btn.classList.remove('active-nav-pill');
        }
      });

      // Update dots across all footers
      updateSectionDots();

      // Special canvas / state triggers
      if (targetPage.id === 'grantingSection') {
        setTimeout(initGoldFoilLayer, 100);
      }

      // Play soft celesta chime note
      if (playSound) {
        playCelestaNote(587.33 + targetIdx * 25, 0.7, 0.14);
      }

      // Smooth scroll to top of section stage
      if (smoothScroll) {
        const stage = document.getElementById('parallaxStage');
        if (stage) {
          const y = isPageWiseMode
            ? (targetEl ? targetEl.getBoundingClientRect().top + window.pageYOffset - 80 : 0)
            : (targetEl ? targetEl.getBoundingClientRect().top + window.pageYOffset - 75 : 0);
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }
      }

      // Visual highlight pulse
      if (targetEl) {
        targetEl.classList.remove('highlight-section-pulse');
        void targetEl.offsetWidth;
        targetEl.classList.add('highlight-section-pulse');
      }
    }

    function scrollToBirthdaySection(targetId) {
      const foundIdx = SECTION_PAGES.findIndex(p => p.id === targetId);
      if (foundIdx !== -1) {
        goToSectionPage(foundIdx);
      }
    }

    // Connect all Page Forward / Back buttons
    document.querySelectorAll('.page-step-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const gotoIdx = btn.getAttribute('data-goto-page');
        if (gotoIdx !== null && gotoIdx !== undefined) {
          goToSectionPage(parseInt(gotoIdx, 10));
        }
      });
    });

    // Attach click handlers to all nav jump buttons
    document.querySelectorAll('.nav-jump-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-target');
        if (targetId) scrollToBirthdaySection(targetId);
      });
    });

    // Attach click handlers to all guide item cards
    document.querySelectorAll('.guide-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = card.getAttribute('data-target');
        if (targetId) scrollToBirthdaySection(targetId);
      });
    });

    // View Mode Toggle (Page-wise vs Full Scroll)
    const viewModeToggleBtn = document.getElementById('viewModeToggleBtn');
    const viewModeToggleIcon = document.getElementById('viewModeToggleIcon');
    const viewModeToggleLabel = document.getElementById('viewModeToggleLabel');

    function updateViewModeUI() {
      if (viewModeToggleIcon && viewModeToggleLabel) {
        if (isPageWiseMode) {
          viewModeToggleIcon.textContent = '📑';
          viewModeToggleLabel.textContent = 'Page Mode';
        } else {
          viewModeToggleIcon.textContent = '📜';
          viewModeToggleLabel.textContent = 'Full Scroll';
        }
      }
    }

    if (viewModeToggleBtn) {
      viewModeToggleBtn.addEventListener('click', () => {
        isPageWiseMode = !isPageWiseMode;
        try {
          localStorage.setItem('birthday_view_mode', isPageWiseMode ? 'page' : 'scroll');
        } catch (e) {}
        updateViewModeUI();
        goToSectionPage(activeSectionIdx, true, true);
        showStickerToast(
          isPageWiseMode ? '📑 Switched to Page-by-Page View!' : '📜 Switched to Continuous Scroll View!',
          isPageWiseMode ? '📑' : '📜'
        );
      });
    }

    // Keyboard Arrow Keys (Left / Right to flip pages)
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (!isPageWiseMode) return;
      if (e.key === 'ArrowRight') {
        goToSectionPage((activeSectionIdx + 1) % SECTION_PAGES.length);
      } else if (e.key === 'ArrowLeft') {
        goToSectionPage((activeSectionIdx - 1 + SECTION_PAGES.length) % SECTION_PAGES.length);
      }
    });

    // Initial page load setup
    updateViewModeUI();
    goToSectionPage(0, false, false);

    // Guide section collapse / toggle
    const toggleGuideBtn = document.getElementById('toggleGuideSectionBtn');
    const collapseGuideBtn = document.getElementById('collapseGuideBtn');
    const guideSection = document.getElementById('celebrationGuideSection');
    const guideCardsGrid = document.getElementById('guideCardsGrid');
    const guideToggleText = document.getElementById('guideToggleText');

    let isGuideCollapsed = false;

    function toggleCelebrationGuide() {
      if (!guideCardsGrid || !collapseGuideBtn) return;
      isGuideCollapsed = !isGuideCollapsed;
      if (isGuideCollapsed) {
        guideCardsGrid.classList.add('hidden');
        collapseGuideBtn.textContent = 'Show Tips ▼';
        if (guideToggleText) guideToggleText.textContent = 'Show Guide';
      } else {
        guideCardsGrid.classList.remove('hidden');
        collapseGuideBtn.textContent = 'Hide Tips ▲';
        if (guideToggleText) guideToggleText.textContent = 'Quick Guide';
        if (guideSection) {
          guideSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
      playCelestaNote(587.33, 0.6, 0.12);
    }

    if (toggleGuideBtn) toggleGuideBtn.addEventListener('click', toggleCelebrationGuide);
    if (collapseGuideBtn) collapseGuideBtn.addEventListener('click', toggleCelebrationGuide);

    // Theme Switcher (Starlight Midnight <-> Strawberry Daylight)
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleIcon = document.getElementById('themeToggleIcon');
    const themeToggleLabel = document.getElementById('themeToggleLabel');

    function applyAppTheme(themeName) {
      if (themeName === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggleIcon) themeToggleIcon.textContent = '☀️';
        if (themeToggleLabel) themeToggleLabel.textContent = 'Daylight';
      } else {
        document.body.classList.remove('light-theme');
        if (themeToggleIcon) themeToggleIcon.textContent = '🌙';
        if (themeToggleLabel) themeToggleLabel.textContent = 'Starlight';
      }
      try {
        localStorage.setItem('birthday_theme_pref', themeName);
      } catch (err) {}
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        playCelestaNote(659.25, 0.7, 0.15);
        const isCurrentLight = document.body.classList.contains('light-theme');
        const nextTheme = isCurrentLight ? 'dark' : 'light';
        applyAppTheme(nextTheme);
        showStickerToast(
          nextTheme === 'light'
            ? '☀️ Switched to Strawberry Daylight theme!'
            : '🌙 Switched to Cozy Starlight theme!',
          nextTheme === 'light' ? '🍓' : '✨'
        );
      });
    }

    // Initialize saved theme (default is Starlight dark)
    try {
      const savedTheme = localStorage.getItem('birthday_theme_pref');
      if (savedTheme === 'light') {
        applyAppTheme('light');
      }
    } catch (e) {}

    // Also connect #squeezeHugBtn directly in case Robin clicks the button itself
    const squeezeHugBtnEl = document.getElementById('squeezeHugBtn');
    if (squeezeHugBtnEl) {
      squeezeHugBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerSingleHugPulse();
      });
    }

    // Connect top header "Mini-Game" button to jump to arcade section
    const jumpToGameHeaderBtnEl = document.getElementById('jumpToGameHeaderBtn');
    if (jumpToGameHeaderBtnEl) {
      jumpToGameHeaderBtnEl.addEventListener('click', () => {
        scrollToBirthdaySection('sweetTreatArcadeSection');
      });
    }

    // IntersectionObserver for Scroll Spy on the navigation bar
    const sectionIds = [
      'birthdayCakeSection',
      'birthdayHugSection',
      'sweetTreatArcadeSection',
      'flowerGardenSection',
      'memoryBookSection',
      'adventureSection',
      'grantingSection',
      'happinessSection',
      'birthdayCapsuleSection'
    ];

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const currentId = entry.target.id;
            document.querySelectorAll('.nav-jump-btn').forEach(btn => {
              if (btn.getAttribute('data-target') === currentId) {
                btn.classList.add('active-nav-pill');
              } else {
                btn.classList.remove('active-nav-pill');
              }
            });
          }
        });
      }, { threshold: 0.35 });

      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }

    /**************************************************************
     * 10. ROBIN'S STORYBOOK & SCRAPBOOK (6-PAGE SEQUENTIAL FORWARD & BACK)
     **************************************************************/
    let currentStorybookPage = 0; // 0 to 5 (6 pages total)

    const bookCardWrapper = document.getElementById('bookCardWrapper');
    const pageSideIndicator = document.getElementById('pageSideIndicator');
    const bookPageCountBadge = document.getElementById('bookPageCountBadge');
    const bookBackBtn = document.getElementById('bookBackBtn');
    const bookForwardBtn = document.getElementById('bookForwardBtn');
    const bookForwardBtnText = document.getElementById('bookForwardBtnText');
    const bookFlipQuickBtn = document.getElementById('bookFlipQuickBtn');
    const memoryBookSection = document.getElementById('memoryBookSection');
    const toggleBookFullscreenBtn = document.getElementById('toggleBookFullscreenBtn');
    const fullscreenBtnText = document.getElementById('fullscreenBtnText');

    const PAGE_TITLES = [
      '1. Star Profile (Front)',
      '2. Jerry\'s Letter (Back)',
      '3. Robin\'s Superpowers (Front)',
      '4. Birthday Vouchers (Back)',
      '5. Future Travel Map (Front)',
      '6. Golden Toast (Back)'
    ];

    const sheets = [
      { front: document.getElementById('sheet1Front'), back: document.getElementById('sheet1Back') },
      { front: document.getElementById('sheet2Front'), back: document.getElementById('sheet2Back') },
      { front: document.getElementById('sheet3Front'), back: document.getElementById('sheet3Back') }
    ];

    function goToStorybookPage(targetPageIndex, playAudio = true) {
      if (targetPageIndex < 0) targetPageIndex = 0;
      if (targetPageIndex > 5) targetPageIndex = 5;

      currentStorybookPage = targetPageIndex;

      const targetSheetIndex = Math.floor(currentStorybookPage / 2);
      const isFlipped = (currentStorybookPage % 2 === 1);

      // Hide all sheets
      sheets.forEach((s) => {
        if (s.front) s.front.classList.add('hidden');
        if (s.back) s.back.classList.add('hidden');
      });

      // Show current sheet
      const currentSheet = sheets[targetSheetIndex];
      if (currentSheet) {
        if (currentSheet.front) currentSheet.front.classList.remove('hidden');
        if (currentSheet.back) currentSheet.back.classList.remove('hidden');
      }

      // Flip card wrapper
      if (bookCardWrapper) {
        if (isFlipped) {
          bookCardWrapper.classList.add('is-flipped');
        } else {
          bookCardWrapper.classList.remove('is-flipped');
        }
      }

      // Update Indicators
      if (bookPageCountBadge) {
        bookPageCountBadge.textContent = `Page ${currentStorybookPage + 1} of 6`;
      }
      if (pageSideIndicator) {
        pageSideIndicator.textContent = `Page ${currentStorybookPage + 1} of 6 • ${isFlipped ? 'Back 💌' : 'Front 📄'}`;
      }

      // Update 6-page stepper chips
      document.querySelectorAll('.book-page-dot').forEach(dot => {
        const pNum = parseInt(dot.getAttribute('data-page'), 10);
        if (pNum === currentStorybookPage) {
          dot.classList.add('active-page-dot');
        } else {
          dot.classList.remove('active-page-dot');
        }
      });

      // Update Back Button state
      if (bookBackBtn) {
        if (currentStorybookPage === 0) {
          bookBackBtn.classList.add('opacity-50', 'pointer-events-none');
        } else {
          bookBackBtn.classList.remove('opacity-50', 'pointer-events-none');
        }
      }

      // Update Forward Button state & label
      if (bookForwardBtnText) {
        if (currentStorybookPage === 5) {
          bookForwardBtnText.textContent = '🎉 Restart';
        } else {
          bookForwardBtnText.textContent = 'Forward';
        }
      }

      if (playAudio) {
        // Musical note ascending with each page turn
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        playCelestaNote(notes[currentStorybookPage], 1.0, 0.18);
        spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 'petals', 16);
      }
    }

    // Forward button click
    if (bookForwardBtn) {
      bookForwardBtn.addEventListener('click', () => {
        if (currentStorybookPage >= 5) {
          // Celebrate & loop back to page 1
          spawnRoomBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 'stars', 40);
          showStickerToast('You unfolded all of Robin\'s story pages! 💖🎂', '🌸');
          goToStorybookPage(0);
        } else {
          goToStorybookPage(currentStorybookPage + 1);
        }
      });
    }

    // Back button click
    if (bookBackBtn) {
      bookBackBtn.addEventListener('click', () => {
        if (currentStorybookPage > 0) {
          goToStorybookPage(currentStorybookPage - 1);
        }
      });
    }

    // Quick Flip button
    if (bookFlipQuickBtn) {
      bookFlipQuickBtn.addEventListener('click', () => {
        const isFlipped = (currentStorybookPage % 2 === 1);
        const targetPage = isFlipped ? currentStorybookPage - 1 : currentStorybookPage + 1;
        goToStorybookPage(targetPage);
      });
    }

    // Flip triggers on individual page faces
    document.querySelectorAll('.flip-trigger-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isFlipped = (currentStorybookPage % 2 === 1);
        const targetPage = isFlipped ? currentStorybookPage - 1 : currentStorybookPage + 1;
        goToStorybookPage(targetPage);
      });
    });

    // 6-Page Stepper Chips click
    document.querySelectorAll('.book-page-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const targetPage = parseInt(dot.getAttribute('data-page'), 10);
        if (!isNaN(targetPage)) {
          goToStorybookPage(targetPage);
        }
      });
    });

    // Fullscreen / Unfold in Full toggle
    let isBookFullscreen = false;
    function toggleBookFullscreen() {
      if (!memoryBookSection) return;
      isBookFullscreen = !isBookFullscreen;
      if (isBookFullscreen) {
        memoryBookSection.classList.add('storybook-fullscreen-mode');
        if (fullscreenBtnText) fullscreenBtnText.textContent = '✕ Close Full';
        document.body.style.overflow = 'hidden';
        playCelestaNote(880.00, 0.8, 0.16);
      } else {
        memoryBookSection.classList.remove('storybook-fullscreen-mode');
        if (fullscreenBtnText) fullscreenBtnText.textContent = '⛶ Unfold';
        document.body.style.overflow = '';
        playCelestaNote(659.25, 0.8, 0.16);
      }
    }
    if (toggleBookFullscreenBtn) {
      toggleBookFullscreenBtn.addEventListener('click', toggleBookFullscreen);
    }

    // Keyboard navigation (Left = Back, Right = Forward) when viewing book
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') {
        if (bookForwardBtn) bookForwardBtn.click();
      } else if (e.key === 'ArrowLeft') {
        if (bookBackBtn && currentStorybookPage > 0) bookBackBtn.click();
      } else if (e.key === 'Escape' && isBookFullscreen) {
        toggleBookFullscreen();
      }
    });

    // Initialize book to Page 1 on startup
    goToStorybookPage(0, false);

    // Interactive Superpower Badges sound triggers
    document.querySelectorAll('.superpower-card').forEach((card, idx) => {
      card.addEventListener('click', () => {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        playCelestaNote(notes[idx % notes.length], 1.2, 0.22);
        const rect = card.getBoundingClientRect();
        spawnRoomBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 'stars', 18);
        showStickerToast('Superpower activated! ✨', '⚡');
      });
    });

    // Birthday Voucher Redeem logic
    document.querySelectorAll('.voucher-claim-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.voucher-card');
        if (card) {
          card.classList.add('is-claimed');
          btn.textContent = 'CLAIMED ★';
          btn.disabled = true;
          playCelestaNote(880.00, 1.2, 0.2);
          setTimeout(() => playCelestaNote(1046.50, 1.3, 0.24), 140);
          const rect = btn.getBoundingClientRect();
          spawnRoomBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 'petals', 25);
          showStickerToast('Birthday voucher claimed with love! 💖', '🎟️');
        }
      });
    });

    // Keepsake Cards Flip Handlers (Adventure, Granting, Happiness)
    document.querySelectorAll('.adventure-flip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inner = document.getElementById('adventureCardInner');
        if (inner) {
          inner.classList.toggle('is-flipped');
          playCelestaNote(659.25, 0.7, 0.14);
        }
      });
    });

    const flipGrantingCardBtn = document.getElementById('flipGrantingCardBtn');
    if (flipGrantingCardBtn) {
      flipGrantingCardBtn.addEventListener('click', () => {
        const inner = document.getElementById('grantingCardInner');
        if (inner) {
          inner.classList.add('is-flipped');
          playCelestaNote(783.99, 0.7, 0.14);
        }
      });
    }

    const flipGrantingCardBackBtn = document.getElementById('flipGrantingCardBackBtn');
    if (flipGrantingCardBackBtn) {
      flipGrantingCardBackBtn.addEventListener('click', () => {
        const inner = document.getElementById('grantingCardInner');
        if (inner) {
          inner.classList.remove('is-flipped');
          playCelestaNote(659.25, 0.7, 0.14);
        }
      });
    }

    document.querySelectorAll('.happiness-flip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inner = document.getElementById('happinessCardInner');
        if (inner) {
          inner.classList.toggle('is-flipped');
          playCelestaNote(880.00, 0.7, 0.14);
        }
      });
    });

    function animateCanvases() {
      // 0. Ambient Background Stardust & Firefly Canvas
      if (starfieldCanvas && bgCtx) {
        bgCtx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);
        const isLight = document.body.classList.contains('light-theme');
        for (let i = 0; i < ambientStars.length; i++) {
          const s = ambientStars[i];
          s.y += s.vy;
          s.x += s.vx;
          s.phase += s.pulseSpeed;
          if (s.y < -15) {
            s.y = starfieldCanvas.height + 15;
            s.x = Math.random() * starfieldCanvas.width;
          }
          if (s.x < -15) s.x = starfieldCanvas.width + 15;
          if (s.x > starfieldCanvas.width + 15) s.x = -15;

          const alpha = (0.35 + Math.sin(s.phase) * 0.28) * (isLight ? 0.6 : 1);
          bgCtx.save();
          bgCtx.globalAlpha = Math.max(0.06, alpha);
          bgCtx.beginPath();
          bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          bgCtx.fillStyle = s.color;
          if (!isLight) {
            bgCtx.shadowColor = s.color;
            bgCtx.shadowBlur = 8;
          }
          bgCtx.fill();
          bgCtx.restore();
        }
      }

      // 1. Room Particles
      rCtx.clearRect(0, 0, roomCanvas.width, roomCanvas.height);
      for (let i = roomBursts.length - 1; i >= 0; i--) {
        const p = roomBursts[i];
        p.vy += 0.14;
        p.vx *= 0.985;
        p.x += p.vx + Math.sin(p.life * 10) * 0.4;
        p.y += p.vy;
        p.rot += p.vRot;
        p.life -= p.decay;

        if (p.life <= 0) {
          roomBursts.splice(i, 1);
          continue;
        }

        rCtx.save();
        rCtx.globalAlpha = Math.max(0, p.life);
        rCtx.translate(p.x, p.y);
        rCtx.rotate(p.rot);
        rCtx.fillStyle = p.color;

        if (p.kind === 'stars') {
          rCtx.beginPath();
          for (let s = 0; s < 5; s++) {
            rCtx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * p.size, -Math.sin((18 + s * 72) * Math.PI / 180) * p.size);
            rCtx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * (p.size * 0.45), -Math.sin((54 + s * 72) * Math.PI / 180) * (p.size * 0.45));
          }
          rCtx.closePath();
          rCtx.fill();
        } else {
          // Organic flower petal / heart droplet
          rCtx.beginPath();
          rCtx.ellipse(0, 0, p.size * 0.8, p.size * 0.48, 0, 0, Math.PI * 2);
          rCtx.fill();
        }
        rCtx.restore();
      }

      // 2. Cinema Dark-Blur Fireflies & Bokeh
      if (appState.cinemaActive) {
        cCtx.clearRect(0, 0, cinemaCanvas.width, cinemaCanvas.height);
        fireflies.forEach(f => {
          f.x += f.vx;
          f.y += f.vy;
          f.phase += 0.035;
          if (f.y < -30) f.y = cinemaCanvas.height + 30;
          if (f.x < -30) f.x = cinemaCanvas.width + 30;
          if (f.x > cinemaCanvas.width + 30) f.x = -30;

          const alpha = f.isBokeh
            ? 0.07 + Math.sin(f.phase) * 0.04
            : 0.45 + Math.sin(f.phase) * 0.35;

          cCtx.save();
          cCtx.globalAlpha = Math.max(0.02, alpha);
          cCtx.beginPath();
          cCtx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          cCtx.fillStyle = f.color;
          if (!f.isBokeh) {
            cCtx.shadowColor = '#FDE68A';
            cCtx.shadowBlur = 14;
          }
          cCtx.fill();
          cCtx.restore();
        });
      }

      requestAnimationFrame(animateCanvases);
    }
    animateCanvases();