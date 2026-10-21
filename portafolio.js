// VIXEN — portafolio público de un artista (lo aprobado por el equipo de VIXEN). Sin dependencias.
// Lee los datos públicos del servidor con la clave publicable (los permisos los aplica el servidor).
(() => {
  const SB = 'https://qxslrzydmgocjcbvjvgw.supabase.co', KEY = 'sb_publishable_cakblXaw9MIuymC-BxxJ5Q_TXNTE_Fd';
  const es = /^es/i.test(navigator.language || 'es'); // en español; en cualquier otro idioma, en inglés
  const T = es ? {
    loading: 'Cargando…', none: 'Este portafolio no existe o ya no está disponible.', error: 'No se pudo cargar el portafolio. Inténtalo de nuevo.',
    verified: 'Artista verificado', commissions: 'Comisiones', open: 'Abiertas', closed: 'Cerradas', from: 'desde', days: '~{0} días', slots: '{0} cupos libres',
    note: 'VIXEN no participa en los pagos. Acuerda el trabajo, el precio y el pago directamente con el artista por sus redes.',
    get: 'Descarga VIXEN', app: 'Este portafolio está hecho con VIXEN, la app de dibujo, cómic y animación.', title: 'Portafolio de {0} · VIXEN',
  } : {
    loading: 'Loading…', none: 'This portfolio does not exist or is no longer available.', error: 'The portfolio could not be loaded. Please try again.',
    verified: 'Verified artist', commissions: 'Commissions', open: 'Open', closed: 'Closed', from: 'from', days: '~{0} days', slots: '{0} slots left',
    note: 'VIXEN does not take part in payments. Agree on the work, price and payment directly with the artist through their social accounts.',
    get: 'Get VIXEN', app: 'This portfolio was made with VIXEN, the drawing, comic and animation app.', title: '{0}’s portfolio · VIXEN',
  };
  const f = (s, ...a) => s.replace(/\{(\d)\}/g, (_, i) => a[i]);
  if (!es) document.documentElement.lang = 'en';
  document.querySelectorAll('[data-t]').forEach(e => { if (T[e.dataset.t]) e.textContent = T[e.dataset.t]; });
  const SOC = { x: ['X (Twitter)', /^[A-Za-z0-9_]{1,15}$/, h => 'https://x.com/' + h], instagram: ['Instagram', /^[A-Za-z0-9._]{1,30}$/, h => 'https://www.instagram.com/' + h + '/'], tiktok: ['TikTok', /^[A-Za-z0-9._]{2,24}$/, h => 'https://www.tiktok.com/@' + h] };
  const box = document.getElementById('pf');
  const h = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) { if (v == null) continue; if (k === 'class') e.className = v; else if (k === 'style') e.style.cssText = v; else e.setAttribute(k, v); }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c);
    return e;
  };
  const money = c => 'US$' + (c % 100 ? (c / 100).toFixed(2) : String(c / 100));
  const pub = (bucket, path) => SB + '/storage/v1/object/public/' + bucket + '/' + path.split('/').map(encodeURIComponent).join('/');
  const api = async path => {
    const r = await fetch(SB + '/rest/v1/' + path, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, Accept: 'application/json' } });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  };
  const state = msg => box.replaceChildren(h('p', { class: 'pfw-state' }, msg));
  const viewer = document.getElementById('viewer');
  viewer.querySelector('.pfw-close').onclick = () => viewer.close();
  viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });

  async function load() {
    const user = (new URLSearchParams(location.search).get('u') || '').toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!user) { state(T.none); return; }
    let prof, pf;
    try {
      prof = (await api('profiles?select=id,username,display_name,avatar_path,seller_verified&username=eq.' + encodeURIComponent(user)))[0];
      if (prof) pf = (await api('portfolios?select=data,open&user_id=eq.' + prof.id))[0];
    } catch (e) { state(T.error); return; }
    if (!prof || !pf) { state(T.none); return; }
    const d = pf.data || {}, name = prof.display_name || prof.username;
    document.title = f(T.title, name);
    const av = h('div', { class: 'pfw-av' });
    if (prof.avatar_path) av.style.backgroundImage = `url("${pub('avatars', prof.avatar_path)}")`; else av.textContent = name.charAt(0).toUpperCase();
    const socials = Object.entries(d.socials || {}).filter(([k, v]) => SOC[k] && SOC[k][1].test(v));
    const coms = prof.seller_verified && Array.isArray(d.commissions) ? d.commissions : [];
    const works = (d.items || []).map(it => {
      const b = h('button', { class: 'pfw-work', type: 'button', 'aria-label': it.title || name }, h('img', { src: pub('showcase', it.path), alt: it.title || '', loading: 'lazy', decoding: 'async' }), it.title ? h('span', null, it.title) : null);
      b.onclick = () => { viewer.querySelector('img').src = pub('showcase', it.path); viewer.querySelector('img').alt = it.title || ''; viewer.querySelector('p').textContent = it.title || ''; viewer.showModal(); };
      return b;
    });
    box.replaceChildren(
      h('section', { class: 'pfw-hero' }, av, h('div', null,
        h('h1', { class: 'pfw-name', translate: 'no' }, name, prof.seller_verified ? h('span', { class: 'pfw-badge' }, '✓ ' + T.verified) : null),
        h('p', { class: 'pfw-handle', translate: 'no' }, '@' + prof.username))),
      d.headline ? h('p', { class: 'pfw-head', translate: 'no' }, d.headline) : null,
      d.about ? h('p', { class: 'pfw-about', translate: 'no' }, d.about) : null,
      socials.length ? h('div', { class: 'pfw-socials' }, socials.map(([k, v]) =>
        h('a', { class: 'pfw-soc', href: SOC[k][2](v), target: '_blank', rel: 'noopener noreferrer nofollow ugc' }, SOC[k][0], h('span', { translate: 'no' }, '@' + v)))) : null,
      coms.length ? h('section', { class: 'pfw-com' },
        h('h2', null, T.commissions, h('span', { class: 'pfw-pill' + (pf.open ? '' : ' off') }, pf.open ? T.open : T.closed),
          pf.open && d.slots != null ? h('small', { class: 'pfw-handle' }, f(T.slots, d.slots)) : null),
        coms.map(c => h('div', { class: 'pfw-row' },
          h('div', null, h('b', { translate: 'no' }, c.title), c.desc ? h('small', { translate: 'no' }, c.desc) : null),
          h('div', { class: 'pfw-price' }, h('small', null, T.from), h('b', null, money(c.from_cents)), h('small', null, f(T.days, c.days))))),
        h('p', { class: 'pfw-note' }, T.note)) : null,
      works.length ? h('section', { class: 'pfw-works' }, works) : null,
      h('p', { class: 'pfw-app' }, T.app, ' ', h('a', { href: 'index.html' }, T.get)));
  }
  load();
})();
