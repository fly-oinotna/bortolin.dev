/* bortolin.dev — JS minimo, caricato con "defer": nessun blocco del rendering */
(() => {
  /**
   * Elementi ancora sotto lo schermo, letti con IntersectionObserver (nessun calcolo forzato del layout
   * durante il caricamento, come succederebbe con getBoundingClientRect su centinaia di elementi).
   */
  const belowFold = (els, cb) => {
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      io.disconnect();
      cb(entries.filter((e) => !e.isIntersecting && e.boundingClientRect.top >= e.rootBounds.height).map((e) => e.target));
    });
    els.forEach((el) => io.observe(el));
  };
  /** lavoro non urgente: quando il browser è libero, dopo il primo disegno della pagina */
  const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
  // --- Mega menu desktop: hover via CSS, qui gestiamo click, tastiera ed Escape
  document.querySelectorAll('[data-mega]').forEach((item) => {
    const trigger = item.querySelector('[data-mega-trigger]');
    const setOpen = (open) => {
      item.toggleAttribute('data-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    };
    trigger.addEventListener('click', () => setOpen(!item.hasAttribute('data-open')));
    item.addEventListener('mouseleave', () => setOpen(false));
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && item.hasAttribute('data-open')) {
        setOpen(false);
        trigger.focus();
      }
    });
  });

  // --- Menu mobile
  const toggles = document.querySelectorAll('[data-mobile-toggle]');
  const panel = document.getElementById('mobile-menu');
  if (toggles.length && panel) {
    const opener = toggles[0];
    const setMobile = (open) => {
      panel.hidden = !open;
      opener.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('overflow-hidden', open);
      (open ? panel.querySelector('[data-mobile-toggle]') : opener)?.focus();
    };
    toggles.forEach((t) => t.addEventListener('click', () => setMobile(panel.hidden)));
    panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMobile(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) setMobile(false);
    });
  }

  // --- "Misura il tuo sito": apre PageSpeed Insights (Lighthouse) di Google
  document.querySelectorAll('[data-psi-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let url = form.querySelector('input').value.trim();
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      window.open('https://pagespeed.web.dev/analysis?url=' + encodeURIComponent(url), '_blank', 'noopener');
    });
  });

  // --- Icone animate: si disegnano una sola volta quando entrano nello schermo
  if ('IntersectionObserver' in window && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.draw = 'done';
        io.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    // solo ciò che è ancora fuori dallo schermo: niente "flash" per ciò che si vede già
    idle(() => belowFold([...document.querySelectorAll('[data-draw]')], (below) => below.forEach((el) => {
      el.dataset.draw = 'pending';
      io.observe(el);
    })));
  }

  // --- Contatori e punteggi Lighthouse animati (una volta sola, quando diventano visibili)
  const canAnimate = 'IntersectionObserver' in window && matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tween = (duration, delay, easing, step) => {
    let start;
    const frame = (now) => {
      if (start === undefined) start = now + delay;
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      step(easing(t));
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  const onceVisible = (el, cb) => {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); cb(); }
    }, { threshold: 0.3 });
    io.observe(el);
  };

  // Colori Lighthouse: rosso < 50, arancio < 90, verde da 90 a 100
  const gaugeColor = (v) => (v < 50 ? '#ff4e42' : v < 90 ? '#ffa400' : '#99ea48');
  const runGauge = (g, delay) => {
    const target = Number(g.dataset.gauge) || 0;
    const arc = g.querySelector('[data-gauge-arc]');
    const label = g.querySelector('[data-gauge-value]');
    const paint = (v) => {
      arc.style.strokeDashoffset = String(100 - v);
      arc.style.stroke = gaugeColor(v);
      label.textContent = Math.round(v);
    };
    paint(0);
    g.dataset.state = 'run';
    tween(1800, delay, easeInOut, (k) => paint(target * k));
  };
  const runCounter = (el) => {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || '';
    el.textContent = '0' + suffix;
    el.dataset.state = 'run';
    tween(1600, 0, easeOut, (k) => (el.textContent = Math.round(target * k) + suffix));
  };

  const groups = document.querySelectorAll('[data-gauge-group]');
  const counters = document.querySelectorAll('[data-count]');
  if (canAnimate) {
    groups.forEach((group) => onceVisible(group, () =>
      group.querySelectorAll('[data-gauge]').forEach((g, i) => runGauge(g, i * 350))));
    counters.forEach((el) => onceVisible(el, () => runCounter(el)));
  } else {
    document.querySelectorAll('[data-gauge], [data-count]').forEach((el) => (el.dataset.state = 'done'));
  }

  // --- Comparsa morbida degli elementi allo scroll (tutte le sezioni tranne la hero)
  if (canAnimate) {
    const targets = document.querySelectorAll([
      'main > section:not(:first-of-type) .eyebrow',
      'main > section:not(:first-of-type) h2',
      'main > section:not(:first-of-type) h2 + p',
      'main > section:not(:first-of-type) h2 ~ p.mt-4',
      'main > section > .container > p',
      'main > section:not(:first-of-type) img',
      'main > section:not(:first-of-type) [class*="rounded-3xl"]',
      'main > section:not(:first-of-type) [class*="rounded-2xl"]:not(a.btn, input, textarea, .draw-badge)',
      'main > section:not(:first-of-type) details',
    ].join(','));
    const seen = new Map();
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        reveal.unobserve(el);
        el.dataset.reveal = 'in';
        // a fine transizione restituisce all'elemento le sue transizioni (hover ecc.)
        const done = (e) => {
          if (e.target !== el) return;
          el.removeEventListener('transitionend', done);
          delete el.dataset.reveal;
          el.style.removeProperty('--rd');
        };
        el.addEventListener('transitionend', done);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    // solo ciò che è ancora sotto lo schermo (ciò che è già visibile non si tocca), a pagina disegnata
    idle(() => belowFold([...targets].filter((el) => !el.closest('[data-article], [data-toc]')), (below) => below.forEach((el) => {
      const i = seen.get(el.parentElement) || 0;
      seen.set(el.parentElement, i + 1);
      el.style.setProperty('--rd', Math.min(i * 90, 450) + 'ms');
      el.dataset.reveal = 'pending';
      reveal.observe(el);
    })));
  }

  // --- Conto alla rovescia delle offerte ("Mancano N giorni")
  document.querySelectorAll('[data-countdown]').forEach((el) => {
    const days = Math.ceil((new Date(el.dataset.countdown) - new Date()) / 864e5);
    // testi nella lingua della pagina (src/i18n/ui.ts → countdown)
    if (days > 1) el.textContent = (el.dataset.days || 'Mancano {n} giorni').replace('{n}', days);
    else if (days === 1) el.textContent = el.dataset.last || 'Ultimo giorno!';
    else (el.closest('[data-countdown-scope]') || el.closest('section'))?.setAttribute('hidden', ''); // offerta scaduta: sparisce
  });

  // --- Schede (tab) accessibili: senza JS i pannelli restano tutti visibili
  document.querySelectorAll('[data-tabs]').forEach((box) => {
    const tabs = [...box.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
    box.dataset.tabsReady = '';
    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  });

  // --- Testo che si "digita" da solo (una volta)
  document.querySelectorAll('[data-typing]').forEach((el) => {
    const text = el.textContent;
    if (!canAnimate) { el.dataset.state = 'done'; return; }
    el.textContent = '';
    el.dataset.state = 'run';
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 55 + Math.random() * 60);
      else el.dataset.state = 'done';
    };
    setTimeout(tick, 500);
  });

  // --- Autodiagnosi: conta i sintomi spuntati e mostra un consiglio
  document.querySelectorAll('[data-selfcheck]').forEach((box) => {
    const boxes = [...box.querySelectorAll('input[type="checkbox"]')];
    const out = box.querySelector('[data-selfcheck-result]');
    const bar = box.querySelector('[data-selfcheck-bar]');
    const update = () => {
      const n = boxes.filter((b) => b.checked).length;
      const msg = n === 0 ? out.dataset.msg0 : n <= 2 ? out.dataset.msg1 : out.dataset.msg2;
      out.textContent = msg.replace('{n}', n).replace('{tot}', boxes.length);
      if (bar) {
        bar.style.width = (n / boxes.length) * 100 + '%';
        bar.style.backgroundColor = n <= 2 ? (n === 0 ? '#99ea48' : '#ffa400') : '#ff4e42';
      }
    };
    boxes.forEach((b) => b.addEventListener('change', update));
    update();
  });

  // --- Demo AI: "Genera con AI" scrive titolo e meta description; ogni clic = un'attività diversa
  document.querySelectorAll('[data-ai-demo]').forEach((demo) => {
    const title = demo.querySelector('[data-ai-field="title"]');
    const desc = demo.querySelector('[data-ai-field="desc"]');
    const page = demo.querySelector('[data-ai-page]');
    const type = demo.querySelector('[data-ai-type]');
    const btn = demo.querySelector('[data-ai-btn]');
    const cursor = demo.querySelector('[data-ai-cursor]');
    const status = demo.querySelector('[data-ai-status]');
    const examples = JSON.parse(demo.querySelector('[data-ai-examples]').textContent);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let idx = 0, busy = false;
    const counter = (field, n) => {
      const c = demo.querySelector(`[data-ai-count="${field.dataset.aiField}"]`);
      const max = Number(c.dataset.max);
      c.textContent = `${n}/${max}`;
      c.classList.toggle('text-bd-green-dark', n >= max * 0.75 && n <= max);
    };
    const ring = (on) => [title, desc].forEach((f) => { f.parentElement.classList.toggle('ring-2', on); f.parentElement.classList.toggle('ring-bd-green', on); });
    const type_ = async (field, text, speed) => {
      for (let k = 1; k <= text.length; k++) { field.textContent = text.slice(0, k); counter(field, k); await sleep(speed); }
    };
    const run = async (ex, withCursor) => {
      busy = true;
      demo.dataset.state = 'run';
      btn.setAttribute('aria-busy', 'true');
      page.textContent = ex.page;
      type.textContent = ex.type;
      if (!canAnimate) {
        title.textContent = ex.title; desc.textContent = ex.desc;
        counter(title, ex.title.length); counter(desc, ex.desc.length);
        status.textContent = demo.dataset.msgDoneShort || 'Fatto. Rivedi e salva.';
        btn.removeAttribute('aria-busy'); demo.dataset.state = 'done'; busy = false; return;
      }
      title.textContent = ''; desc.textContent = ''; counter(title, 0); counter(desc, 0); ring(false);
      if (withCursor) {
        status.textContent = demo.dataset.msgReady || 'Il contenuto della pagina è pronto';
        const box = demo.getBoundingClientRect(), b = btn.getBoundingClientRect();
        cursor.style.transition = 'none';
        cursor.style.transform = `translate(${box.width - 40}px, ${box.height - 20}px)`;
        cursor.style.opacity = '1';
        await sleep(400);
        cursor.style.transition = 'transform 1s cubic-bezier(.4,0,.2,1)';
        cursor.style.transform = `translate(${b.left - box.left + b.width * 0.6}px, ${b.top - box.top + b.height * 0.55}px)`;
        await sleep(1100);
      }
      btn.classList.add('scale-95'); await sleep(160); btn.classList.remove('scale-95');
      status.textContent = demo.dataset.msgWorking || 'Analisi del contenuto…';
      await sleep(900);
      cursor.style.opacity = '0';
      ring(true);
      await type_(title, ex.title, 26);
      await sleep(200);
      await type_(desc, ex.desc, 12);
      btn.removeAttribute('aria-busy');
      status.textContent = demo.dataset.msgDone || 'Fatto in 2 secondi. Rivedi e salva.';
      demo.dataset.state = 'done';
      busy = false;
    };
    btn.addEventListener('click', () => {
      if (busy) return;
      idx = (idx + 1) % examples.length;
      run(examples[idx], false);
    });
    if (!canAnimate) { demo.dataset.state = 'done'; return; }
    onceVisible(demo, () => setTimeout(() => run(examples[0], true), 500));
  });

  // --- SERP con esempi di annunci che si alternano (solo mentre è visibile)
  document.querySelectorAll('[data-serp-demo]').forEach((demo) => {
    const slides = [...demo.querySelectorAll('[data-serp-slide]')];
    const tabs = [...demo.querySelectorAll('[data-serp-tab]')];
    const query = demo.querySelector('[data-serp-query]');
    let current = 0, timer = null, typing = null, visible = false;
    const show = (i, animate) => {
      current = i;
      slides.forEach((s, k) => s.toggleAttribute('data-active', k === i));
      tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === i)));
      const text = slides[i].dataset.query;
      clearTimeout(typing);
      if (!animate) { query.textContent = text; return; }
      query.textContent = '';
      let n = 0;
      const tick = () => { query.textContent = text.slice(0, ++n); if (n < text.length) typing = setTimeout(tick, 45 + Math.random() * 45); };
      tick();
    };
    const schedule = () => {
      clearTimeout(timer);
      if (canAnimate && visible) timer = setTimeout(() => { show((current + 1) % slides.length, true); schedule(); }, 6000);
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => { show(k, canAnimate); schedule(); }));
    show(0, false);
    if (!canAnimate) return;
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) schedule(); else clearTimeout(timer);
    }, { threshold: 0.3 }).observe(demo);
  });

  // --- Chat AI con annuncio sponsorizzato: domanda digitata, risposta in streaming, poi l'annuncio
  document.querySelectorAll('[data-chat-demo]').forEach((demo) => {
    const slides = [...demo.querySelectorAll('[data-chat-slide]')];
    const tabs = [...demo.querySelectorAll('[data-chat-tab]')];
    const input = demo.querySelector('[data-chat-input]');
    const placeholder = input.textContent; // testo del campo (Keystatic), nella lingua della pagina
    let current = 0, run = 0, timer = null, visible = false;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const full = slides.map((s) => s.querySelector('[data-chat-answer]').textContent.trim());
    const play = async (i, animate) => {
      const id = ++run;
      current = i;
      slides.forEach((s, k) => s.toggleAttribute('data-active', k === i));
      tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === i)));
      const s = slides[i];
      const q = s.querySelector('[data-chat-question]');
      const a = s.querySelector('[data-chat-answer]');
      const ad = s.querySelector('[data-chat-ad]');
      const dots = s.querySelector('[data-chat-thinking]');
      const prompt = s.dataset.prompt;
      if (!animate) { q.textContent = prompt; a.textContent = full[i]; ad.dataset.shown = ''; dots.hidden = true; input.textContent = placeholder; return; }
      q.textContent = ''; a.textContent = ''; delete ad.dataset.shown; dots.hidden = true;
      q.parentElement.hidden = true;
      input.textContent = '';
      for (let k = 1; k <= prompt.length; k++) { if (id !== run) return; input.textContent = prompt.slice(0, k); await sleep(32 + Math.random() * 30); }
      await sleep(350); if (id !== run) return;
      input.textContent = placeholder;
      q.textContent = prompt; q.parentElement.hidden = false;
      dots.hidden = false; await sleep(900); if (id !== run) return; dots.hidden = true;
      const words = full[i].split(' ');
      for (let k = 1; k <= words.length; k++) { if (id !== run) return; a.textContent = words.slice(0, k).join(' '); await sleep(45); }
      await sleep(300); if (id !== run) return;
      ad.dataset.shown = '';
    };
    const schedule = () => {
      clearTimeout(timer);
      if (canAnimate && visible) timer = setTimeout(() => { play((current + 1) % slides.length, true); schedule(); }, 11000);
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => { play(k, canAnimate); schedule(); }));
    play(0, false);
    if (!canAnimate) return;
    let started = false;
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !started) { started = true; play(0, true); }
      if (visible) schedule(); else clearTimeout(timer);
    }, { threshold: 0.3 }).observe(demo);
  });

  // --- Feed social con post sponsorizzati: entrata, "mi piace", carosello, tocco sul pulsante, modulo
  document.querySelectorAll('[data-feed-demo]').forEach((demo) => {
    const slides = [...demo.querySelectorAll('[data-feed-slide]')];
    const tabs = [...demo.querySelectorAll('[data-feed-tab]')];
    let current = 0, run = 0, timer = null, visible = false;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const reset = (s) => {
      ['data-in', 'data-liked', 'data-tap', 'data-open', 'data-sent'].forEach((a) => s.removeAttribute(a));
      const track = s.querySelector('[data-feed-track]');
      if (track) track.style.transform = '';
      const likes = s.querySelector('[data-feed-likes]');
      if (likes) likes.textContent = likes.dataset.base;
    };
    const finalState = (s) => {
      s.setAttribute('data-in', ''); s.setAttribute('data-liked', '');
      const likes = s.querySelector('[data-feed-likes]');
      if (likes) likes.textContent = String(Number(likes.dataset.base) + 1);
    };
    const play = async (i, animate) => {
      const id = ++run;
      current = i;
      slides.forEach((s, k) => { s.toggleAttribute('data-active', k === i); if (k !== i) reset(s); });
      tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === i)));
      const s = slides[i];
      if (!animate) { reset(s); finalState(s); return; }
      reset(s);
      await sleep(60); if (id !== run) return;
      s.setAttribute('data-in', '');
      await sleep(1100); if (id !== run) return;
      s.setAttribute('data-liked', '');
      const likes = s.querySelector('[data-feed-likes]');
      if (likes) likes.textContent = String(Number(likes.dataset.base) + 1);
      const track = s.querySelector('[data-feed-track]');
      if (track) {
        for (const step of [1, 2]) {
          await sleep(1200); if (id !== run) return;
          // passo 1: una scheda avanti; passo 2: ultima scheda allineata al bordo destro
          track.style.transform = step === 1 ? 'translateX(calc(-1 * (var(--card) + 0.5rem)))' : 'translateX(calc(100% - 3 * var(--card) - 1rem))';
        }
      }
      await sleep(1100); if (id !== run) return;
      s.setAttribute('data-tap', '');
      await sleep(500); if (id !== run) return;
      if (s.querySelector('[data-feed-form]')) {
        s.setAttribute('data-open', '');
        await sleep(1700); if (id !== run) return;
        s.setAttribute('data-sent', '');
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      if (canAnimate && visible) timer = setTimeout(() => { play((current + 1) % slides.length, true); schedule(); }, 8500);
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => { play(k, canAnimate); schedule(); }));
    play(0, false);
    if (!canAnimate) return;
    let started = false;
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !started) { started = true; play(0, true); }
      if (visible) schedule(); else clearTimeout(timer);
    }, { threshold: 0.3 }).observe(demo);
  });

  // --- Flusso "richiesta -> AI -> preventivo": fasi in sequenza, righe che compaiono, totale che sale
  document.querySelectorAll('[data-flow-demo]').forEach((demo) => {
    const parts = [...demo.querySelectorAll('[data-show-at]')];
    const items = [...demo.querySelectorAll('[data-flow-item]')];
    const total = demo.querySelector('[data-flow-total]');
    const status = demo.querySelector('[data-flow-status]');
    const fmt = (n) => { const [i, d] = n.toFixed(2).split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + d + ' €'; };
    const sum = items.reduce((t, i) => t + Number(i.dataset.flowItem), 0);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let run = 0, visible = false, looping = false;
    const stage = (n) => { demo.dataset.phase = n; parts.forEach((p) => p.toggleAttribute('data-on', Number(p.dataset.showAt) <= n)); };
    const finalState = () => { stage(9); items.forEach((i) => i.setAttribute('data-on', '')); total.textContent = fmt(sum); status.textContent = status.dataset.done; };
    const play = async () => {
      const id = ++run;
      stage(0); items.forEach((i) => i.removeAttribute('data-on')); total.textContent = fmt(0); status.textContent = status.dataset.start;
      const ok = () => id === run && visible;
      await sleep(400); if (!ok()) return; stage(1);
      await sleep(1300); if (!ok()) return; stage(2); status.textContent = status.dataset.reading;
      await sleep(1400); if (!ok()) return; stage(3); status.textContent = status.dataset.writing;
      let acc = 0;
      for (const it of items) {
        await sleep(650); if (!ok()) return;
        it.setAttribute('data-on', '');
        const from = acc; acc += Number(it.dataset.flowItem);
        const to = acc, t0 = performance.now();
        const step = (now) => { const k = Math.min(1, (now - t0) / 500); total.textContent = fmt(from + (to - from) * k); if (k < 1 && id === run) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }
      await sleep(900); if (!ok()) return; stage(4); status.textContent = status.dataset.done;
      await sleep(4500); if (!ok()) return;
      play();
    };
    finalState();
    if (!canAnimate) return;
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) play(); else { run++; finalState(); }
    }, { threshold: 0.3 }).observe(demo);
  });

  // --- Pannello progetti per le agenzie: ogni attività passa da "Da fare" a "In corso" a "Consegnato"
  document.querySelectorAll('[data-board-demo]').forEach((demo) => {
    const tasks = [...demo.querySelectorAll('[data-task]')];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let run = 0, visible = false;
    const set = (t, state, pct) => {
      t.dataset.task = state;
      t.querySelector('[data-task-status]').textContent = ({ todo: demo.dataset.todo || 'Da fare', doing: demo.dataset.doing || 'In corso', done: demo.dataset.done || 'Consegnato' })[state];
      t.querySelector('[data-task-bar]').style.width = pct + '%';
    };
    const finalState = () => tasks.forEach((t) => set(t, 'done', 100));
    const play = async () => {
      const id = ++run;
      const ok = () => id === run && visible;
      tasks.forEach((t) => set(t, 'todo', 0));
      await sleep(600);
      for (const t of tasks) {
        if (!ok()) return;
        set(t, 'doing', 0);
        await sleep(80);
        t.querySelector('[data-task-bar]').style.width = '100%';
        await sleep(1500); if (!ok()) return;
        set(t, 'done', 100);
        await sleep(350);
      }
      await sleep(4000); if (!ok()) return;
      play();
    };
    finalState();
    if (!canAnimate) return;
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) play(); else { run++; finalState(); }
    }, { threshold: 0.3 }).observe(demo);
  });

  // --- Filtri dell'archivio casi studio
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const buttons = [...group.querySelectorAll('[data-filter]')];
    const items = [...document.querySelectorAll('[data-tags]')];
    buttons.forEach((b) => b.addEventListener('click', () => {
      const f = b.dataset.filter;
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      items.forEach((it) => { it.hidden = f !== 'tutti' && !it.dataset.tags.split(' ').includes(f); });
    }));
  });

  // --- Blog: filtro per categoria + ricerca, con conteggio e stato vuoto
  document.querySelectorAll('[data-blog]').forEach((blog) => {
    const chips = [...blog.querySelectorAll('[data-cat-filter]')];
    const posts = [...blog.querySelectorAll('[data-post]')];
    const search = blog.querySelector('[data-blog-search]');
    const count = blog.querySelector('[data-blog-count]');
    const empty = blog.querySelector('[data-blog-empty]');
    const extras = [...blog.querySelectorAll('[data-blog-extra]')];
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    let cat = new URLSearchParams(location.search).get('categoria') || 'tutti';
    if (!chips.some((c) => c.dataset.catFilter === cat)) cat = 'tutti';
    const apply = () => {
      const q = norm(search ? search.value.trim() : '');
      let n = 0;
      const all = cat === 'tutti' && !q;
      posts.forEach((p) => {
        let ok = (cat === 'tutti' || p.dataset.cat === cat) && (!q || norm(p.dataset.text).includes(q));
        if (p.hasAttribute('data-only-filtered') && all) { ok = false; n++; } // l'articolo in evidenza è già nella hero
        p.hidden = !ok; if (ok) n++;
      });
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.catFilter === cat)));
      extras.forEach((e) => (e.hidden = cat !== 'tutti' || !!q));
      if (count) count.textContent = n === 1 ? (count.dataset.one || '1 articolo') : (count.dataset.many || '{n} articoli').replace('{n}', n);
      if (empty) empty.hidden = n > 0;
    };
    chips.forEach((c) => c.addEventListener('click', () => {
      cat = c.dataset.catFilter;
      const url = new URL(location.href);
      if (cat === 'tutti') url.searchParams.delete('categoria'); else url.searchParams.set('categoria', cat);
      history.replaceState(null, '', url);
      apply();
      // a ogni cambio di filtro porta all'inizio dell'elenco, così si vede subito il risultato
      const list = blog.querySelector('[data-blog-list]');
      if (list) {
        list.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }
    }));
    if (search) search.addEventListener('input', apply);
    blog.querySelector('[data-blog-reset]')?.addEventListener('click', () => { cat = 'tutti'; if (search) search.value = ''; history.replaceState(null, '', location.pathname); apply(); });
    apply();
  });

  // --- Siti web: demo del sito che si costruisce (struttura → design → testi → online), a ciclo quando è visibile
  document.querySelectorAll('[data-build-demo]').forEach((demo) => {
    const pills = [...demo.querySelectorAll('[data-build-step]')];
    const last = pills.length || 4;
    const set = (n) => {
      demo.dataset.step = String(n);
      pills.forEach((p) => p.setAttribute('aria-pressed', String(Number(p.dataset.buildStep) === n)));
    };
    if (!canAnimate) { set(last); pills.forEach((p) => p.addEventListener('click', () => set(Number(p.dataset.buildStep)))); return; } // animazioni ridotte: sito completo, i pulsanti cambiano solo il passaggio
    let n = 1, timer = null, visible = false;
    const tick = () => { n = n >= last ? 1 : n + 1; set(n); timer = setTimeout(tick, n === last ? 4600 : 1900); };
    const play = (delay) => { clearTimeout(timer); timer = setTimeout(tick, delay); };
    pills.forEach((p) => p.addEventListener('click', () => { n = Number(p.dataset.buildStep); set(n); if (visible) play(n === last ? 6000 : 4000); }));
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play(900); else { clearTimeout(timer); timer = null; }
    }, { threshold: 0.3 }).observe(demo);
  });

  // --- Articolo: barra di lettura e indice che segue la sezione visibile
  const progress = document.querySelector('[data-read-progress]');
  const article = document.querySelector('[data-article]');
  if (progress && article) {
    const update = () => {
      const r = article.getBoundingClientRect();
      const done = Math.min(1, Math.max(0, (innerHeight - r.top) / r.height));
      progress.style.transform = `scaleX(${done})`;
    };
    addEventListener('scroll', update, { passive: true }); update();
  }
  document.querySelectorAll('[data-toc]').forEach((toc) => {
    const links = [...toc.querySelectorAll('a[href^="#"]')];
    const heads = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    if (!heads.length || !('IntersectionObserver' in window)) return;
    const set = (id) => links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id)));
    const io = new IntersectionObserver(() => {
      let current = heads[0].id;
      heads.forEach((h) => { if (h.getBoundingClientRect().top < innerHeight * 0.35) current = h.id; });
      set(current);
    }, { rootMargin: '0px 0px -60% 0px', threshold: [0, 1] });
    heads.forEach((h) => io.observe(h));
    addEventListener('scroll', () => {
      let current = heads[0].id;
      heads.forEach((h) => { if (h.getBoundingClientRect().top < innerHeight * 0.35) current = h.id; });
      set(current);
    }, { passive: true });
  });

  // --- Anno corrente nel footer
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
