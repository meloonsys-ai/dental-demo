// Renders the page from window.CLINIC (config.js). No build step, no backend.
(() => {
  const c = window.CLINIC;
  // ?theme= lets the seller demo other looks to a clinic without editing config.js
  const theme = new URLSearchParams(location.search).get('theme') || c.theme || 'blue';
  document.documentElement.dataset.theme = ['blue', 'dark', 'warm'].includes(theme) ? theme : 'blue';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // only an explicit 0 is free; null/undefined = no price known (e.g. not on 2GIS)
  const money = (n) => (n === 0 ? 'Бесплатно' : n == null ? '' : `${n.toLocaleString('ru-RU')} ₸`);
  const from = (n) => (n == null ? '' : `<span class="from">${n === 0 ? '' : 'от '}${money(n)}</span>`);

  // Glass-blue tooth, used until the clinic supplies its own 3D render (config.heroImage).
  const tooth = (id, flat) => `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${flat ? '#fff' : '#9fc0ff'}"/><stop offset=".45" stop-color="${flat ? '#fff' : '#2f63ff'}"/><stop offset="1" stop-color="${flat ? '#dfe7ff' : '#0b2a8f'}"/></linearGradient>
      <radialGradient id="h${id}" cx=".32" cy=".22" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <path fill="url(#g${id})" d="M100 28c-18-14-44-20-64-8C12 34 8 70 18 104c8 26 16 40 20 70 4 30 10 52 26 52 18 0 18-30 24-54 4-14 8-20 12-20s8 6 12 20c6 24 6 54 24 54 16 0 22-22 26-52 4-30 12-44 20-70 10-34 6-70-18-84-20-12-46-6-64 8z"/>
    ${flat ? '' : '<path fill="url(#h' + id + ')" d="M100 28c-18-14-44-20-64-8C12 34 8 70 18 104c8 26 16 40 20 70 4 30 10 52 26 52 18 0 18-30 24-54 4-14 8-20 12-20s8 6 12 20c6 24 6 54 24 54 16 0 22-22 26-52 4-30 12-44 20-70 10-34 6-70-18-84-20-12-46-6-64 8z"/><path d="M60 44c-14 4-24 18-24 36" stroke="#fff" stroke-opacity=".8" stroke-width="6" stroke-linecap="round" fill="none"/>'}
  </svg>`;

  document.title = `${c.name} — ${c.tagline.toLowerCase()} в г. ${c.city}`;
  $('meta[name=description]').content = `${c.name}: ${c.lead}`;
  // --len: the editorial wordmark shrinks to fit long names on one line
  $$('[data-name]').forEach((el) => (el.textContent = c.name, el.style.setProperty('--len', c.name.length)));
  $('[data-tooth]').innerHTML = tooth('l', true);
  $('[data-eyebrow]').textContent = c.branches[0] ? `${c.city}, ${c.branches[0].address}` : `${c.tagline} · ${c.city}`;
  const nb = (t) => String(t).replace(/(\d) (?=\d)/g, '$1 ').replace(/ ₸/g, ' ₸'); // keep «18 500 ₸» on one line
  $('[data-title1]').textContent = nb(c.title[0]);
  $('[data-title2]').textContent = nb(c.title[1]);
  $('[data-lead]').textContent = nb(c.lead);
  $('.hero-art').classList.toggle('has-ring', !!(c.heroImage && c.heroRing));
  $('[data-hero-art]').innerHTML =c.heroImage ? `<img src="${esc(c.heroImage)}" alt="" />` : tooth('h');
  $$('[data-chip]').forEach((el) => (el.innerHTML = c.chips[el.dataset.chip] ? `<span>${esc(c.chips[el.dataset.chip])}</span>` : ''));
  if (c.bandImage) $('[data-band]').style.backgroundImage = `url("${encodeURI(c.bandImage)}")`;

  $('[data-stats]').innerHTML = c.stats.map(([n, t]) => `<li><b>${esc(n)}</b><span>${esc(t)}</span></li>`).join('');
  $('[data-adv]').innerHTML = c.advantages.map(([h, t]) => `<li><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join('');
  $('[data-services]').innerHTML = c.services
    .map((s) => `<li${s.image ? ' class="has-img"' : ''}>${s.image ? `<img src="${esc(s.image)}" alt="" loading="lazy" />` : `<i class="ph ph-${esc(s.icon)}" aria-hidden="true"></i>`}<h3>${esc(s.name)}</h3><p>${esc(s.text)}</p>${from(s.from)}</li>`)
    .join('');

  if (c.about) {
    const a = c.about;
    $('#about').hidden = false;
    $('[data-about-text]').innerHTML = a.text.map((p) => `<p>${esc(p)}</p>`).join('');
    $('[data-about-points]').innerHTML = a.points.map((p) => `<li><i class="ph ph-check-circle" aria-hidden="true"></i><span>${esc(p)}</span></li>`).join('');
    if (a.quote) Object.assign($('[data-about-quote]'), { hidden: false, innerHTML: `<blockquote>«${esc(a.quote.text)}»</blockquote><figcaption><b>${esc(a.quote.name)}</b>${esc(a.quote.role)}</figcaption>` });
  }

  if (c.doctors?.length) {
    $('#doctors').hidden = false;
    $('[data-doctors]').innerHTML = c.doctors
      .map((d) => {
        const initials = d.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('');
        const photo = d.photo ? `<img src="${esc(d.photo)}" alt="" loading="lazy" />` : `<span class="doc-ph" aria-hidden="true">${esc(initials)}</span>`;
        return `<li>${photo}<div class="doc-foot"><a class="doc-book" href="#booking">Записаться</a><div class="doc-info"><b>${esc(d.name)}</b><span>${esc(d.role)}${d.exp ? ` · ${esc(d.exp)}` : ''}</span></div></div></li>`;
      })
      .join('');
  }

  // Demo fallback: clinics with no/almost no 2GIS price list get typical Astana prices, clearly labelled as approximate.
  const approx = Object.values(c.prices || {}).flat().length < 3;
  if (approx) c.prices = {
    'Консультация и диагностика': [['Консультация', 0], ['Прицельный снимок', 3000], ['3D-снимок (КТ)', 12000]],
    'Терапия': [['Лечение кариеса', 20000], ['Лечение пульпита', 45000]],
    'Гигиена': [['Профчистка (ультразвук + Air Flow)', 20000]],
    'Хирургия': [['Удаление зуба', 15000], ['Удаление зуба мудрости', 30000], ['Имплант под ключ', 180000]],
    'Ортопедия и ортодонтия': [['Металлокерамическая коронка', 45000], ['Циркониевая коронка', 90000], ['Брекеты (одна челюсть)', 150000]],
  };
  $('[data-prices]').innerHTML = Object.entries(c.prices)
    .map(([cat, rows], i) => `<details${i ? '' : ' open'}><summary>${esc(cat)}<i class="ph ph-plus" aria-hidden="true"></i></summary><ul>${rows.map(([n, p]) => `<li><span>${esc(n)}</span><b>${money(p)}</b></li>`).join('')}</ul></details>`)
    .join('');
  $('#prices').hidden = !Object.keys(c.prices || {}).length; // clinics without a 2GIS price list
  if (approx) $$('#prices .note, #prices .muted').forEach((n) => (n.textContent = 'Цены примерные, по Астане. Точную стоимость клиника назовёт после консультации.'));

  if (c.reviews?.length) {
    $('#reviews').hidden = false;
    $('[data-reviews]').innerHTML = c.reviews.map(([n, t]) => `<li><p>«${esc(t)}»</p><b>${esc(n)}</b></li>`).join('');
  }

  $('[data-branches]').innerHTML = c.branches
    .map((b) => `<li><b>${esc(b.address)}</b><a href="tel:${esc(b.phone.replace(/[^\d+]/g, ''))}">${esc(b.phone)}</a><span>${esc(b.hours)}</span>${b.map ? `<a href="${esc(b.map)}" target="_blank" rel="noopener">Открыть на карте</a>` : ''}</li>`)
    .join('');

  $('[data-branch-select]').innerHTML = c.branches.map((b) => `<option>${esc(b.address)}</option>`).join('');
  $('[data-branch-field]').hidden = c.branches.length < 2;

  // nav links to sections left hidden (no doctors, no reviews...) would jump nowhere
  $$('nav a[href^="#"]').forEach((a) => (a.hidden = !!document.getElementById(a.hash.slice(1))?.hidden));
  $('[data-copy]').textContent = `© ${new Date().getFullYear()} ${c.name}`;
  if (c.instagram) Object.assign($('[data-insta]'), { href: c.instagram, hidden: false });

  // Carousel: native scroll-snap track + dots/arrows, one dot per reachable scroll position.
  // "is-active" card follows hover/tap/focus and the scroll position (touch has no hover).
  const carousel = (root) => {
    const track = root.querySelector('.track');
    const dots = root.querySelector('.dots');
    const [prev, next] = root.querySelectorAll('.arrow');
    const cards = track.children;
    let cur = 0;
    const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
    const max = () => track.scrollWidth - track.clientWidth;
    const activate = (li) => li && [...cards].forEach((x) => x.classList.toggle('is-active', x === li));
    const go = (i) => track.scrollTo({ left: i * step(), behavior: calm() ? 'auto' : 'smooth' });
    const sync = () => {
      const n = max() > 2 ? Math.ceil(max() / step() - 0.05) + 1 : 1;
      if (dots.children.length !== n) dots.innerHTML = Array.from({ length: n }, (_, j) => `<button type="button" aria-label="Позиция ${j + 1} из ${n}"></button>`).join('');
      const i = track.scrollLeft >= max() - 2 ? n - 1 : Math.round(track.scrollLeft / step());
      root.querySelector('.car-ctrl').hidden = n < 2;
      prev.disabled = i === 0;
      next.disabled = i === n - 1;
      [...dots.children].forEach((d, j) => d.setAttribute('aria-current', j === i));
      if (i !== cur) activate(cards[i]);
      cur = i;
    };
    activate(cards[0]);
    for (const ev of ['pointerover', 'focusin']) track.addEventListener(ev, (e) => activate(e.target.closest('li')));
    track.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    dots.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) go([...dots.children].indexOf(b));
    });
    sync();
  };
  $$('[data-carousel]').forEach(carousel);

  // Works gallery (optional: c.works = [url], markup [data-works]); click opens a lightbox dialog built here.
  const worksEl = $('[data-works]');
  const works = c.works || [];
  if (worksEl && works.length) {
    worksEl.closest('section').hidden = false;
    worksEl.innerHTML = works
      .map((src, i) => `<li><button type="button" data-i="${i}" aria-label="Открыть фото ${i + 1} из ${works.length}"><img src="${esc(src.replace(/_1280x\.jpg$/, '_640x.jpg'))}" alt="${esc(c.name)} — работа ${i + 1}" loading="lazy" /></button></li>`)
      .join('');
    const box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Фото работ');
    box.innerHTML = `<img alt="" /><p class="lb-count" aria-live="polite"></p>
      <button class="lb-btn lb-close" type="button" aria-label="Закрыть"><i class="ph ph-x" aria-hidden="true"></i></button>
      <button class="lb-btn lb-prev" type="button" aria-label="Предыдущее фото"><i class="ph ph-arrow-left" aria-hidden="true"></i></button>
      <button class="lb-btn lb-next" type="button" aria-label="Следующее фото"><i class="ph ph-arrow-right" aria-hidden="true"></i></button>`;
    document.body.append(box);
    let at = 0;
    const show = (i) => {
      at = (i + works.length) % works.length;
      Object.assign(box.querySelector('img'), { src: works[at], alt: `${c.name} — работа ${at + 1}` });
      box.querySelector('.lb-count').textContent = `${at + 1} / ${works.length}`;
    };
    for (const b of box.querySelectorAll('.lb-prev, .lb-next')) b.hidden = works.length < 2;
    worksEl.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-i]');
      if (!b) return;
      show(+b.dataset.i);
      box.showModal();
    });
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target.closest('.lb-close')) box.close();
      else if (e.target.closest('.lb-prev')) show(at - 1);
      else if (e.target.closest('.lb-next')) show(at + 1);
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    }); // Esc closes natively
    box.addEventListener('close', () => worksEl.querySelector(`[data-i="${at}"]`)?.focus());
  }

  // Before/after (markup [data-ba]). {before, after} = slider, {image} = ready-made collage card.
  // Without real pairs we show an obviously drawn illustration (never fake results): flat SVG teeth, labelled as such.
  // Slider: pointer drag on the stage (works on iOS too, where range tracks ignore taps) + a range input for keyboard/AT.
  const baEl = $('main [data-ba]'); // scoped: body[data-ba] is the orientation flag
  const drawn = (tooth, stroke, extra) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e4e9ef"/><path d="M0 0h400v92c-40 18-80 18-120 4-40 14-80 14-120 0-40 14-80 14-120 0-20 8-30 10-40 10z" fill="#e7a3a6"/>${[30, 120, 210, 300].map((x) => `<path d="M${x} 78h70v92c0 34-14 58-35 58s-35-24-35-58z" fill="${tooth}" stroke="${stroke}" stroke-width="4"/>`).join('')}${extra}</svg>`)}`;
  const ba = c.beforeAfter?.length ? c.beforeAfter : [{
    before: drawn('#d9c27a', '#a68c45', '<circle cx="60" cy="150" r="7" fill="#9b7b3a"/><circle cx="250" cy="130" r="5" fill="#9b7b3a"/><circle cx="330" cy="170" r="6" fill="#9b7b3a"/>'),
    after: drawn('#ffffff', '#b9c4d0', '<path d="M352 214l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="#fff" stroke="#b9c4d0" stroke-width="3"/>'),
    label: 'Иллюстрация. Здесь будут ваши реальные фото до/после',
    drawn: true,
  }];
  if (baEl) {
    const sec = baEl.closest('section');
    sec.hidden = false;
    sec.toggleAttribute('data-placeholder', !!ba[0].drawn);
    const vertical = document.body.dataset.ba === 'y';
    baEl.innerHTML = ba
      .map((it) => {
        const cap = it.label ? `<figcaption>${esc(it.label)}</figcaption>` : '';
        if (!it.before || !it.after) return `<li><figure class="ba-card"><div class="ba-stage ba-static"><img src="${esc(it.image)}" alt="До и после${it.label ? `: ${esc(it.label)}` : ''}" loading="lazy" /></div>${cap}</figure></li>`;
        return `<li><figure class="ba-card"><div class="ba-stage" style="--pos:50%">
          <img class="ba-after" src="${esc(it.after)}" alt="После${it.label ? `: ${esc(it.label)}` : ''}" loading="lazy" />
          <img class="ba-before" src="${esc(it.before)}" alt="До${it.label ? `: ${esc(it.label)}` : ''}" loading="lazy" />
          <span class="ba-tag ba-tag-before" aria-hidden="true">До</span><span class="ba-tag ba-tag-after" aria-hidden="true">После</span>
          <span class="ba-handle" aria-hidden="true"></span>
          <input type="range" min="0" max="100" value="50" aria-label="До и после"${vertical ? ' aria-orientation="vertical"' : ''} />
        </div>${cap}</figure></li>`;
      })
      .join('');
    baEl.querySelectorAll('.ba-stage:not(.ba-static)').forEach((stage) => {
      const input = stage.querySelector('input');
      const set = (v) => {
        input.value = Math.round(Math.min(100, Math.max(0, v)));
        stage.style.setProperty('--pos', `${input.value}%`);
      };
      const fromPointer = (e) => {
        const r = stage.getBoundingClientRect();
        set(vertical ? ((e.clientY - r.top) / r.height) * 100 : ((e.clientX - r.left) / r.width) * 100);
      };
      input.addEventListener('input', () => set(+input.value));
      stage.addEventListener('pointerdown', (e) => {
        stage.setPointerCapture(e.pointerId);
        fromPointer(e);
        input.focus({ preventScroll: true });
      });
      stage.addEventListener('pointermove', (e) => stage.hasPointerCapture(e.pointerId) && fromPointer(e));
    });
  }

  // Booking popup: every "#booking" link opens it (delegated, so rendered links work too); closing plays the slide-out before close().
  const modal = $('[data-modal]');
  const open = (e) => {
    e.preventDefault();
    modal.classList.remove('closing');
    modal.showModal();
  };
  const close = () => {
    if (!modal.open || modal.classList.contains('closing')) return;
    if (calm()) return modal.close();
    modal.classList.add('closing');
    modal.addEventListener('animationend', () => { modal.classList.remove('closing'); modal.close(); }, { once: true });
  };
  document.addEventListener('click', (e) => e.target.closest('a[href="#booking"]') && open(e));
  $('[data-close]').addEventListener('click', close);
  modal.addEventListener('cancel', (e) => { e.preventDefault(); close(); }); // Esc
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); }); // backdrop

  // Booking request goes to the clinic's WhatsApp; nothing is stored or sent anywhere else.
  $('[data-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const ok = d.name.trim() && d.phone.replace(/\D/g, '').length >= 10;
    $('[data-error]').hidden = !!ok;
    if (!ok) return;
    const lines = [`Здравствуйте! Хочу записаться на консультацию в ${c.name}.`, `Имя: ${d.name.trim()}`, `Телефон: ${d.phone.trim()}`];
    if (c.branches.length > 1) lines.push(`Филиал: ${d.branch}`);
    window.open(`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    close();
  });
})();
