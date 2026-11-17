// Highlights, each opt-in via a token in body[data-x] (space-separated). Load with defer after app.js and icons.js.
// No dependencies. Motion-heavy ones are skipped under prefers-reduced-motion.
(() => {
  const on = new Set((document.body.dataset.x || '').split(/\s+/).filter(Boolean));
  if (!on.size) return;
  const c = window.CLINIC || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
  // same markup icons.js produces; icons.js has already run, so build SVG directly from window.ICONS
  const icon = (n) => `<svg class="icon icon-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.ICONS?.[n] || ''}</svg>`;
  const hero = $('main > [data-sec="hero"]');
  const seen = (els, fn, opts = { threshold: 0.35 }) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (io.unobserve(e.target), fn(e.target))), opts);
    els.forEach((el) => io.observe(el));
  };

  if (on.has('marquee') && hero && c.services?.length) {
    const items = c.services.map((s) => `<span>${esc(s.name)}</span>`).join('');
    hero.insertAdjacentHTML('afterend', `<div class="x-marquee" aria-hidden="true"><div class="x-marquee-track">${items}${items}</div></div>`);
  }

  if (on.has('counter') && !calm) {
    const els = $$('[data-stats] b').filter((b) => /^\d+([.,]\d+)?\D*$/.test(b.textContent.trim()) && !/\d\D+\d/.test(b.textContent));
    els.forEach((b) => {
      b.dataset.to = b.textContent.trim();
      b.style.minWidth = `${b.getBoundingClientRect().width}px`; // final width reserved: no shift while counting
      b.classList.add('x-count');
    });
    seen(els, (b) => {
      const [, num, frac, rest] = b.dataset.to.match(/^(\d+(?:[.,](\d+))?)(\D*)$/);
      const to = parseFloat(num.replace(',', '.'));
      const dp = frac?.length || 0;
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / 1400);
        b.textContent = (to * (1 - (1 - k) ** 3)).toFixed(dp).replace('.', num.includes(',') ? ',' : '.') + rest;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  if (on.has('reveal') && !calm) {
    const secs = $$('main > [data-sec]:not([data-sec="hero"])');
    secs.forEach((s) => s.classList.add('x-reveal'));
    seen(secs, (s) => s.classList.add('is-in'), { threshold: 0.08 });
  }

  if (on.has('flip')) {
    const docs = c.doctors || [];
    $$('[data-doctors] > li').forEach((li, i) => {
      const d = docs[i];
      if (!d) return;
      li.classList.add('x-flip');
      li.insertAdjacentHTML('beforeend', `<div class="x-back" aria-hidden="true"><b>${esc(d.name)}</b><span>${esc(d.role)}${d.exp ? ` · ${esc(d.exp)}` : ''}</span></div>`);
      li.addEventListener('click', (e) => !e.target.closest('a') && li.classList.toggle('is-flipped'));
    });
  }

  if (on.has('badge')) {
    const art = $('.hero-art', hero || document);
    if (art) {
      const txt = `Запись открыта · ${c.name || ''} · `;
      art.insertAdjacentHTML('beforeend', `<span class="x-badge" aria-hidden="true"><svg class="x-ring" viewBox="0 0 100 100"><path id="x-badge-path" fill="none" d="M50 50m-39 0a39 39 0 1 1 78 0a39 39 0 1 1-78 0"/><text><textPath href="#x-badge-path" textLength="243" lengthAdjust="spacingAndGlyphs">${esc(txt)}</textPath></text></svg>${icon('calendar-heart')}</span>`);
    }
  }

  if (on.has('progress')) {
    const bar = document.createElement('div');
    bar.className = 'x-progress';
    document.body.append(bar);
    let raf = 0;
    const upd = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    };
    addEventListener('scroll', () => (raf ||= requestAnimationFrame(upd)), { passive: true });
    upd();
  }

  if (on.has('glow') && fine && !calm) {
    const g = document.createElement('div');
    g.className = 'x-glow';
    g.setAttribute('aria-hidden', 'true');
    document.body.append(g);
    addEventListener('pointermove', (e) => {
      g.classList.add('is-on');
      g.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });
    document.addEventListener('pointerleave', () => g.classList.remove('is-on'));
  }

  if (on.has('grain')) document.body.insertAdjacentHTML('beforeend', '<div class="x-grain" aria-hidden="true"></div>');

  if (on.has('tilt') && fine && !calm) {
    $$('[data-services] > li').forEach((li) => {
      li.classList.add('x-tilt');
      li.addEventListener('pointermove', (e) => {
        const r = li.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        li.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      });
      li.addEventListener('pointerleave', () => (li.style.transform = ''));
    });
  }

  // opens the existing booking dialog via app.js's delegated a[href="#booking"] handler
  if (on.has('sticky-wa')) document.body.insertAdjacentHTML('beforeend', `<a class="x-wa" href="#booking" aria-label="Записаться через WhatsApp">${icon('chat-heart')}<span>Записаться</span></a>`);
})();
