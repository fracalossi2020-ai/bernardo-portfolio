(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= LOADER ================= */
  (function loader() {
    var loaderEl = document.getElementById("loader");
    var canvas = document.getElementById("loaderCanvas");
    var ring = document.getElementById("loaderRing");
    var pctEl = document.getElementById("loaderPct");
    var seen = sessionStorage.getItem("bm_loader_seen");

    if (seen || reduceMotion) {
      loaderEl.classList.add("is-hidden");
      return;
    }

    var ctx = canvas.getContext("2d");
    var rings = [];
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawnRing() {
      rings.push({ r: 0, alpha: 0.5 });
    }
    var spawnTimer = setInterval(spawnRing, 480);
    spawnRing();

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var cx = canvas.width / 2;
      var cy = canvas.height / 2;
      rings.forEach(function (ring_) {
        ring_.r += 2.2;
        ring_.alpha -= 0.0045;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(94,234,212," + Math.max(ring_.alpha, 0) + ")";
        ctx.lineWidth = 1.2;
        ctx.arc(cx, cy, ring_.r, 0, Math.PI * 2);
        ctx.stroke();
      });
      rings = rings.filter(function (r) { return r.alpha > 0; });
      if (!loaderEl.classList.contains("is-hidden")) {
        requestAnimationFrame(draw);
      }
    }
    draw();

    var circumference = 339.3;
    var progress = 0;
    var interval = setInterval(function () {
      progress += Math.random() * 10 + 4;
      if (progress >= 100) progress = 100;
      pctEl.textContent = Math.round(progress) + "%";
      ring.style.strokeDashoffset = circumference - (circumference * progress) / 100;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(finish, 350);
      }
    }, 140);

    function finish() {
      clearInterval(spawnTimer);
      loaderEl.classList.add("is-hidden");
      sessionStorage.setItem("bm_loader_seen", "1");
    }

    loaderEl.addEventListener("click", finish);
    setTimeout(finish, 4500);
  })();

  /* ================= HEADER SCROLL STATE ================= */
  var header = document.getElementById("header");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ================= MOBILE NAV ================= */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  burger.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("is-open"); });
  });

  /* ================= SCROLL REVEAL ================= */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { obs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ================= MAGNETIC BUTTONS ================= */
  if (!reduceMotion) {
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + x * 0.25 + "px," + y * 0.4 + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "translate(0,0)";
      });
    });
  }

  /* ================= TILT CARDS (3D) ================= */
  if (!reduceMotion) {
    document.querySelectorAll(".tilt-card, #heroTilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var rx = ((y / rect.height) - 0.5) * -8;
        var ry = ((x / rect.width) - 0.5) * 8;
        card.style.transform = "perspective(700px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(700px) rotateX(0) rotateY(0)";
      });
    });
  }

  /* ================= FX DEMOS: cycling word showcase ================= */
  (function wordShowcase() {
    var wordEl = document.getElementById("fxWord");
    var labelEl = document.getElementById("fxWordLabel");
    var indexEl = document.getElementById("fxWordIndex");
    if (!wordEl) return;
    var items = [
      { word: "Brilho", label: "brilho no texto" },
      { word: "Embaralhar", label: "letras embaralhando" },
      { word: "Revelar", label: "revelar palavras" },
      { word: "Digitar", label: "máquina de escrever" },
      { word: "Magnético", label: "botão magnético" },
      { word: "Girar", label: "borda girando" },
      { word: "Cartão", label: "cartão com brilho" },
      { word: "Inclinar", label: "inclinar em 3D" },
      { word: "Aurora", label: "fundo aurora" },
      { word: "Revelar.scroll", label: "revelar no scroll" }
    ];
    var i = 0;
    function render() {
      var item = items[i];
      wordEl.textContent = item.word;
      labelEl.textContent = item.label;
      indexEl.textContent = String(i + 1).padStart(2, "0");
    }
    render();
    if (!reduceMotion) {
      setInterval(function () {
        i = (i + 1) % items.length;
        wordEl.style.opacity = 0;
        setTimeout(function () { render(); wordEl.style.opacity = 1; }, 220);
      }, 2600);
      wordEl.style.transition = "opacity .22s ease";
    }
  })();

  /* ================= FX DEMOS: letter scramble ================= */
  (function scramble() {
    var el = document.getElementById("fxScramble");
    if (!el || reduceMotion) return;
    var target = "BM";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    function run() {
      var frame = 0;
      var maxFrames = 14;
      var iv = setInterval(function () {
        el.textContent = target
          .split("")
          .map(function (ch, idx) {
            if (frame > maxFrames * (idx + 1) / target.length) return ch;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
        frame++;
        if (frame > maxFrames) { clearInterval(iv); el.textContent = target; }
      }, 40);
    }
    run();
    setInterval(run, 3400);
  })();

  /* ================= FX DEMOS: word reveal ================= */
  (function wordRise() {
    var el = document.getElementById("fxRise");
    if (!el) return;
    var words = ["cada", "palavra", "sobe", "na", "hora", "certa"];
    el.innerHTML = words.map(function (w) { return '<span class="word">' + w + "</span>"; }).join(" ");
    var spans = el.querySelectorAll(".word");

    function play() {
      spans.forEach(function (s) { s.classList.remove("is-up"); });
      spans.forEach(function (s, i) {
        setTimeout(function () { s.classList.add("is-up"); }, i * 160);
      });
    }
    var started = false;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          started = true;
          play();
          setInterval(play, 3600);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(el);
  })();

  /* ================= FX DEMOS: typewriter ================= */
  (function typewriter() {
    var el = document.getElementById("fxType");
    if (!el) return;
    var phrases = ["npm run deploy", "sistema online ✓", "bot respondendo..."];
    var pIndex = 0, cIndex = 0, deleting = false;

    function tick() {
      var phrase = phrases[pIndex];
      if (!deleting) {
        cIndex++;
        el.textContent = phrase.slice(0, cIndex);
        if (cIndex === phrase.length) {
          deleting = true;
          setTimeout(tick, 1100);
          return;
        }
      } else {
        cIndex--;
        el.textContent = phrase.slice(0, cIndex);
        if (cIndex === 0) {
          deleting = false;
          pIndex = (pIndex + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 70);
    }
    tick();
  })();

  /* ================= FX DEMOS: tilt3d card ================= */
  if (!reduceMotion) {
    var fxTilt = document.querySelector(".fx-tilt3d");
    if (fxTilt) {
      fxTilt.addEventListener("mousemove", function (e) {
        var rect = fxTilt.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var rx = ((y / rect.height) - 0.5) * -14;
        var ry = ((x / rect.width) - 0.5) * 14;
        fxTilt.style.transform = "perspective(500px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      });
      fxTilt.addEventListener("mouseleave", function () {
        fxTilt.style.transform = "perspective(500px) rotateX(0) rotateY(0)";
      });
    }
  }

  /* ================= YEAR ================= */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
