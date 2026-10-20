// VIXEN — web: menú, galería, visor, contacto y aviso de idioma. Sin dependencias.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cabecera opaca al bajar
  const top = $('.top');
  const onScroll = () => top && top.classList.toggle('solid', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Menú en móvil
  const burger = $('.burger'), menu = $('.menu');
  if (burger && menu) {
    const set = open => {
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? burger.dataset.close : burger.dataset.open);
      top.classList.toggle('solid', open || scrollY > 10);
    };
    burger.addEventListener('click', () => set(!menu.classList.contains('open')));
    $$('.menu > a').forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }
  // Cerrar el selector de idioma al tocar fuera
  document.addEventListener('click', e => $$('.langpick[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; }));

  // Luciérnagas
  const flies = $('.flies');
  if (flies && !reduce) {
    for (let i = 0; i < 16; i++) {
      const f = document.createElement('i');
      f.style.left = (Math.random() * 100) + '%';
      f.style.top = (30 + Math.random() * 65) + '%';
      f.style.animationDelay = (Math.random() * 9).toFixed(2) + 's';
      f.style.animationDuration = (7 + Math.random() * 6).toFixed(2) + 's';
      flies.appendChild(f);
    }
  }

  // Aparición de las capturas al llegar a ellas
  const rev = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); } }), { threshold: .25 });
    rev.forEach(r => io.observe(r));
  } else rev.forEach(r => r.classList.add('shown'));

  // Galería: pestañas y flechas
  const tabs = $$('.tabs [role=tab]');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(o => { const on = o === t; o.setAttribute('aria-selected', on); o.tabIndex = on ? 0 : -1; $('#' + o.getAttribute('aria-controls')).hidden = !on; });
  }));
  const activeRail = () => $$('.rail').find(r => !r.hidden);
  $$('.arrows button').forEach(b => b.addEventListener('click', () => {
    const r = activeRail(); if (!r) return;
    r.scrollBy({ left: (b.dataset.dir === 'next' ? 1 : -1) * r.clientWidth * .8, behavior: reduce ? 'auto' : 'smooth' });
  }));

  // Visor de imágenes
  const lb = $('.lb');
  if (lb && lb.showModal) {
    const img = $('img', lb); let list = [], idx = 0;
    const show = i => { idx = (i + list.length) % list.length; const b = list[idx]; img.src = b.dataset.full; img.alt = $('img', b).alt; };
    $$('.rail button').forEach(b => b.addEventListener('click', () => { list = $$('button', b.parentElement); show(list.indexOf(b)); lb.showModal(); }));
    $('.x', lb).addEventListener('click', () => lb.close());
    $('.pv', lb).addEventListener('click', () => show(idx - 1));
    $('.nx', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { if (sx == null) return; const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) show(idx + (d < 0 ? 1 : -1)); sx = null; });
  } else $$('.rail button').forEach(b => b.addEventListener('click', () => open(b.dataset.full, '_blank')));

  // Contacto: prepara el correo
  const form = $('#form');
  if (form) {
    const st = $('#form-status'), hint = st.textContent;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      if (!d.msg.trim()) { st.textContent = form.dataset.err; st.classList.add('bad'); $('#f-msg').focus(); return; }
      st.textContent = hint; st.classList.remove('bad');
      const body = d.msg.trim() + '\n\n— ' + [d.name, d.email].filter(Boolean).join(' · ');
      location.href = 'mailto:' + form.dataset.to + '?subject=' + encodeURIComponent('[VIXEN] ' + d.topic) + '&body=' + encodeURIComponent(body);
    });
  }
  const cp = $('.copy-mail');
  if (cp) cp.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(cp.dataset.mail); const t = cp.textContent; cp.textContent = cp.dataset.done; setTimeout(() => cp.textContent = t, 1800); } catch (_) { location.href = 'mailto:' + cp.dataset.mail; }
  });

  // Aviso: «esta página también está en tu idioma»
  const sug = window.VX_SUG, here = document.documentElement.lang;
  let seen = null; try { seen = localStorage.getItem('vx-lang'); } catch (_) {}
  $$('[data-lang-link]').forEach(a => a.addEventListener('click', () => { try { localStorage.setItem('vx-lang', a.dataset.langLink); } catch (_) {} }));
  if (sug && !seen) {
    const want = (navigator.languages || [navigator.language]).map(l => (l || '').slice(0, 2).toLowerCase()).find(l => sug[l]);
    if (want && want !== here) {
      const s = sug[want], box = document.createElement('div');
      box.className = 'suggest'; box.lang = want; box.setAttribute('role', 'region');
      box.innerHTML = `<span></span><a class="btn btn-main btn-sm"></a><button type="button"></button>`;
      box.children[0].textContent = s.text; box.children[1].textContent = s.go; box.children[1].href = s.href; box.children[2].textContent = s.no;
      box.children[1].addEventListener('click', () => { try { localStorage.setItem('vx-lang', want); } catch (_) {} });
      box.children[2].addEventListener('click', () => { try { localStorage.setItem('vx-lang', here); } catch (_) {} box.remove(); });
      setTimeout(() => document.body.appendChild(box), 900);
    }
  }
})();
