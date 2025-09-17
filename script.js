// Screen navigation
function goToScreen(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen' + n).classList.add('active');

  if (n === 2) startTyping();
  if (n === 3) startTyping3();
  if (n === 4) startTyping4();
  if (n === 5) startTyping5();
  

  // 🔇 Pause background music when on cake screen (Screen 7)
  const audio = document.getElementById("music");
  if (n === 7) {
    audio.pause();  // stop music so mic can detect blowing
  }
}



// Typing effect
function typeText(id, text, speed, callback) {
  let i = 0;
  document.getElementById(id).textContent = '';
  function typing() {
    if (i < text.length) {
      document.getElementById(id).textContent += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    } else if (callback) callback();
  }
  typing();
}

function startTyping() {
  typeText("text1", "First select One song ....", 110, () => {
    typeText("text2", "Since I can't pick, I want you to have the best experience teeeheee hehehehe!!!!", 110);
  });
}

// 💕 Screen 3 typing
function startTyping3() {
   const el = document.getElementById("text3");
  if (el.textContent.trim().length > 0) return; // already typed, don’t redo
  typeText("text3",
    "You're officially a year hotter, funnier, and even more impossible not to like💕. I don't know how you do it, but somehow you've turned into my favorite person faster than a Sobolo bottle empties on a hot day 🍾😋. Here's to more laughter, more teasing, and more of whatever magic you've got going on. Happy birthday, Eric 💕🎁",
    50
  );
}

// 💕 Screen 4 typing
function startTyping4() {
   const el = document.getElementById("text4");
  if (el.textContent.trim().length > 0) return; // already typed, don’t redo
  typeText("text4",
    "I’m so grateful I get to celebrate you today, my partner in crime, my source of endless jokes, my personal hype man, and the reason I smile so much. I love how you never let life get too heavy, and how you remind me not to take things too seriously.",
    50
  );
}

// 💕 Screen 5 typing
function startTyping5() {
   const el = document.getElementById("text5");
  if (el.textContent.trim().length > 0) return; // already typed, don’t redo
  typeText("text5",
    "So here’s to another year of me spoiling you, laughing at your nonsense, and kissing that handsome, unserious face of yours. May this birthday bring you all the joy, love, and adventure that you bring into my life every day. Happy Birthday, baby. Now blow out your candles — and don’t worry, I already made a wish for us 💋🔥",
    50
  );
}

// Play and persist music
function playSong(songFile) {
  const audio = document.getElementById("music");
  audio.src = songFile;
  audio.play().catch(err => console.log("Playback prevented:", err));
  localStorage.setItem("currentSong", songFile);
}

// Remove autoplay on page load
window.onload = () => {
  const savedSong = localStorage.getItem("currentSong");
  if (savedSong) {
    const audio = document.getElementById("music");
    audio.src = savedSong;
    // ❌ No auto-play here, wait until user clicks
  }
};


// Bubble generator for Screen 6
const bubbleContainer = document.getElementById("bubbles");
function createBubble() {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  const size = Math.random() * 50 + 20;
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${Math.random() * 100}vw`;
  bubble.style.animationDuration = `${Math.random() * 10 + 10}s`;
  bubbleContainer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 15000);
}
setInterval(() => {
  if (document.getElementById("screen6").classList.contains("active")) {
    createBubble();
  }
}, 800);

/* ---------- Blowable Cake ---------- */
(() => {
  const screen7 = document.getElementById('screen7');
  const candlesWrap = document.getElementById('candles');

  let audioCtx = null, analyser = null, dataArray = null, mediaStream = null, rafId = null;
  let blowStart = 0, blowing = false, lastBlowTime = 0;

  function computeRMS(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      const v = (arr[i] - 128) / 128;
      sum += v * v;
    }
    return Math.sqrt(sum / arr.length);
  }

  function extinguishAll() {
    candlesWrap.querySelectorAll('.candle').forEach(c => {
      const flame = c.querySelector('.flame');
      const smoke = c.querySelector('.smoke');
      if (flame.classList.contains('lit')) {
        flame.classList.remove('lit');
        flame.classList.add('out');
        smoke.classList.add('show');
        setTimeout(() => smoke.classList.remove('show'), 1600);
      }
    });
  }

  function relightAll() {
    candlesWrap.querySelectorAll('.flame').forEach(f => {
      f.classList.remove('out');
      setTimeout(() => f.classList.add('lit'), 50);
    });
  }

  function handleSuccessfulBlow() {
    const now = Date.now();
    if (now - lastBlowTime < 1200) return;
    lastBlowTime = now;
    extinguishAll();
    document.getElementById("cheer").play(); // play sound
    launchConfetti();

    setTimeout(() => {
    document.getElementById("secret-message").style.display = "block";
  }, 1500);
  }

  async function startMic() {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      dataArray = new Uint8Array(analyser.fftSize);
      runAnalyserLoop();
    } catch (err) {
      console.log("Mic permission denied:", err);
    }
  }

  function stopMic() {
    if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
    if (audioCtx) audioCtx.close();
    cancelAnimationFrame(rafId);
  }

  function runAnalyserLoop() {
    analyser.getByteTimeDomainData(dataArray);
    const rms = computeRMS(dataArray);
    const now = Date.now();
    if (rms > 0.02) { // mic sensitivity fixed
      if (!blowing) {
        blowing = true;
        blowStart = now;
      } else if (now - blowStart >= 500) { // hold mic input 0.8s
        handleSuccessfulBlow();
        blowing = false;
      }
    } else {
      blowing = false;
    }
    rafId = requestAnimationFrame(runAnalyserLoop);
    
  }

  function initCake() {
    startMic(); // start mic automatically
  }

  const mo = new MutationObserver(() => {
    if (screen7.classList.contains('active')) {
      initCake();
    } else {
      stopMic();
    }
  });
  mo.observe(screen7, { attributes: true });
})();

function launchConfetti() {
  const duration = 8 * 1000; // 8 seconds
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 6,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2
      }
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

  


