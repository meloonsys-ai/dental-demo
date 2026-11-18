// Shared runtime for generated sites: B/A slider, lightbox, mobile menu sheet, N2 nav, action bar, open status, WhatsApp form.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  for (const input of $$('.comparison input')) input.addEventListener('input', () => input.parentElement.style.setProperty('--split', input.value + '%'));

  // lightbox: native <dialog> gives Esc and the focus trap; always shows the original photo
  const box = $('.lightbox');
  for (const b of $$('.shot')) b.addEventListener('click', () => { $('img', box).src = b.dataset.full; box.showModal(); });
  box?.addEventListener('click', (e) => { if (e.target !== $('img', box)) box.close(); });

  // mobile menu sheet: the morphing menu button (aria-expanded) opens and closes it; it stays above the sheet.
  // Focus moves in; Esc or a link closes it; Tab cycles through the button and the sheet.
  const sheet = $('#menu'), opener = $('.menu-btn');
  const setMenu = (open) => {
    sheet.hidden = !open;
    opener.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? $('a', sheet) : opener).focus();
  };
  opener?.addEventListener('click', () => setMenu(sheet.hidden));
  sheet?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (!sheet || sheet.hidden) return;
    if (e.key === 'Escape') setMenu(false);
    if (e.key !== 'Tab') return;
    const f = [opener, ...$('a, button', sheet)], first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // N2: transparent over the full-bleed hero, solid after 80px
  const nav = $('[data-nav=N2] .nav');
  if (nav) { const on = () => nav.classList.toggle('solid', scrollY > 80); on(); addEventListener('scroll', on, { passive: true }); }

  // mobile action bar hides while Contacts is on screen
  const bar = $('.action-bar'), contacts = $('#contacts');
  if (bar && contacts && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => bar.classList.toggle('away', e.isIntersecting)).observe(contacts);

  // "Открыто сейчас" only from structured hoursSpec, evaluated in Asia/Almaty (UTC+5)
  for (const el of $$('.open-status')) {
    const spec = JSON.parse(el.dataset.hours);
    const now = new Date(Date.now() + (5 * 60 + new Date().getTimezoneOffset()) * 60000);
    const day = now.getDay() || 7, hm = now.toTimeString().slice(0, 5);
    const open = spec === '24/7' || [].concat(spec).some((r) => { const [a, b] = String(r.days).split('-').map(Number); return day >= a && day <= (b || a) && hm >= r.from && hm < r.to; });
    el.textContent = open ? 'Открыто сейчас' : 'Сейчас закрыто';
    el.classList.toggle('is-open', open);
    el.hidden = false;
  }

  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Heading text effect: per-word fade + blur + rise when the heading enters. The words stay in the HTML (SEO, no-JS);
  // we only wrap text nodes in spans, so <em> accents keep their style.
  if (!calm && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('fx-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    for (const h of $$('.fx')) {
      let i = 0;
      const walk = (node) => [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) return walk(n);
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        for (const part of n.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const w = document.createElement('span');
          w.className = 'fx-w'; w.style.setProperty('--i', i++); w.textContent = part;
          frag.append(w);
        }
        n.replaceWith(frag);
      });
      h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim()); // screen readers get the phrase, not word fragments
      walk(h);
      io.observe(h);
    }
    // Blocks reveal the same way: section children and grid items, staggered within their parent.
    for (const el of $$('.hero-art, .strip > li, .sec .wrap > :not(.sec-head):not(ul), .sec .wrap ul:not(.navlinks) > li')) {
      if (el.closest('.fx') || el.parentElement.closest('.rv')) continue;
      el.classList.add('rv');
      el.style.setProperty('--i', [...el.parentElement.children].indexOf(el) % 6);
      io.observe(el);
    }
  }

  // Smooth inertial wheel scroll (desktop mouse only): lerp window scroll toward a target in rAF.
  // Uses window.scrollTo, never transforms, so position:sticky/fixed, anchors and keyboard scrolling stay native.
  if (!calm && matchMedia('(pointer: fine)').matches) {
    let target = scrollY, y = scrollY, running = false;
    const max = () => document.documentElement.scrollHeight - innerHeight;
    const step = () => {
      if (!running) return;
      y +=(target - y) * 0.12;
      if (Math.abs(target - y) < 0.5) { y = target; running = false; }
      scrollTo({ top: y, behavior: 'instant' });
      if (running) requestAnimationFrame(step);
    };
    addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY) || document.body.style.overflow === 'hidden' || $('dialog[open]')) return;
      // let inner scrollers (horizontal gallery, menu sheet, selects) keep their own wheel
      for (let el = e.target; el && el !== document.body; el = el.parentElement) {
        if (el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return;
      }
      e.preventDefault();
      if (!running) target = y = scrollY;
      target = Math.max(0, Math.min(max(), target + e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1)));
      if (!running) { running = true; requestAnimationFrame(step); }
    }, { passive: false });
    // anchors, keyboard and scrollbar drags move the page natively: stop the lerp so it does not fight them
    for (const ev of ['keydown', 'mousedown']) addEventListener(ev, () => { running = false; });
    document.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) running = false; });
  }

  // Booking popup (as on All Dent): every "#booking" link opens it; Esc, backdrop and the close button close it.
  const bk = $('.booking');
  // A service card/row passes its name (data-service): it goes into the hidden field (and the WhatsApp text) and shows as a line.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#booking"]');
    if (!bk || !a) return;
    e.preventDefault();
    const svc = a.dataset.service || '';
    $('input[name=service]', bk).value = svc;
    $('.bk-service b', bk).textContent = svc;
    $('.bk-service', bk).hidden = !svc;
    bk.showModal();
  });
  bk?.addEventListener('click', (e) => { if (e.target === bk || e.target.closest('.bk-close')) bk.close(); });

  // No backend yet: a valid request opens the clinic's WhatsApp with a prefilled message; nothing is stored or logged here.
  for (const form of $$('form.lead-form')) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const name = String(f.get('name') || '').trim(), phone = String(f.get('phone') || '').trim();
    const ok = name && phone.replace(/\D/g, '').length >= 10;
    const err = $('.form-error', form);
    if (err) err.hidden = !!ok;
    if (!ok) return;
    const text = `Здравствуйте! Хочу записаться на консультацию.\nИмя: ${name}\nТелефон: ${phone}` + (f.get('service') ? `\nУслуга: ${f.get('service')}` : '');
    window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    form.closest('dialog')?.close();
  });
})();
