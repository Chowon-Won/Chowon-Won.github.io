// VixArt — inscripción a la beta. La persona escribe su correo y el servidor le envía por correo su cuenta de tester.
// La página nunca recibe la contraseña. Solo funciona mientras la beta está cerrada. Sin dependencias.
(() => {
  const SB = 'https://qxslrzydmgocjcbvjvgw.supabase.co', KEY = 'sb_publishable_cakblXaw9MIuymC-BxxJ5Q_TXNTE_Fd';
  const es = /^es/i.test(navigator.language || 'es');
  const T = es ? {
    loading: 'Cargando…', tag: 'Beta cerrada', title: 'Prueba VixArt antes que nadie',
    lead: 'Escribe tu correo y te enviamos al momento tu cuenta para entrar en la beta: dibuja, publica en la comunidad y cuéntanos qué mejorar.',
    s1: 'Recibe tus datos', s1d: 'Te llega un correo con tu usuario y tu contraseña de VixArt.',
    s2: 'Descarga la app', s2d: 'Únete a la prueba en Google Play con tu cuenta de Google.',
    s3: 'Entra y dibuja', s3d: 'En VixArt, ve a Perfil → Entrar y escribe tus datos.',
    formTitle: 'Únete a la beta', formSub: 'Usa el correo de tu cuenta de Google (Gmail), el mismo que usas en Google Play.',
    email: 'Tu correo', ph: 'tucorreo@gmail.com', accept: 'Acepto los {t} y la {p} de VixArt.', terms: 'Términos', privacy: 'Política de privacidad',
    send: 'Recibir mis datos', sending: 'Enviando…',
    fine: 'Solo usamos tu correo para enviarte el acceso a la beta. Puedes pedir que lo borremos en cualquier momento.',
    okTitle: '¡Revisa tu correo!', okText: 'Te enviamos tu usuario y tu contraseña a {e}. Si no lo ves en unos minutos, mira en spam o promociones.',
    okAgain: 'Ya te habíamos inscrito: te enviamos tus datos otra vez a {e}, con una contraseña nueva.',
    play: 'Descargar en Google Play', group: 'Unirme al grupo de testers', other: 'Usar otro correo',
    needEmail: 'Escribe tu correo', needAccept: 'Acepta los Términos y la Política de privacidad para continuar',
    ended: 'La beta ya terminó', endedText: 'VixArt ya está disponible para todos: descárgala y crea tu cuenta desde la app.', home: 'Ir a VixArt',
    closed: 'La inscripción está cerrada', closedText: 'Por ahora no estamos aceptando más testers. Vuelve a mirar en unos días.',
    full: 'Ya no quedan plazas', fullText: 'La beta está completa. ¡Gracias por tu interés!', fullAgain: '¿Ya estabas inscrito? Pide tus datos otra vez',
    error: 'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.',
    E: { CORREO_INVALIDO: 'Ese correo no es válido. Escribe tu correo personal.', ESPERA: null, LLENA: 'Ya no quedan plazas en la beta.',
      TERMINO: 'La beta ya terminó: descarga VixArt y crea tu cuenta desde la app.', INSCRIPCION_CERRADA: 'La inscripción a la beta está cerrada.',
      SIN_CORREO: 'El envío de correos aún no está listo. Inténtalo más tarde.', CORREO_FALLO: 'No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.' },
  } : {
    loading: 'Loading…', tag: 'Closed beta', title: 'Try VixArt before anyone else',
    lead: 'Enter your email and we will instantly send you an account to join the beta: draw, post in the community and tell us what to improve.',
    s1: 'Get your details', s1d: 'You will receive an email with your VixArt username and password.',
    s2: 'Download the app', s2d: 'Join the test on Google Play with your Google account.',
    s3: 'Sign in and draw', s3d: 'In VixArt, go to Profile → Sign in and enter your details.',
    formTitle: 'Join the beta', formSub: 'Use the email of your Google account (Gmail), the same one you use on Google Play.',
    email: 'Your email', ph: 'youremail@gmail.com', accept: 'I accept the VixArt {t} and {p}.', terms: 'Terms', privacy: 'Privacy Policy',
    send: 'Send me my details', sending: 'Sending…',
    fine: 'We only use your email to send you beta access. You can ask us to delete it at any time.',
    okTitle: 'Check your email!', okText: 'We sent your username and password to {e}. If you do not see it in a few minutes, check spam or promotions.',
    okAgain: 'You were already signed up: we sent your details again to {e}, with a new password.',
    play: 'Get it on Google Play', group: 'Join the testers group', other: 'Use another email',
    needEmail: 'Enter your email', needAccept: 'Accept the Terms and Privacy Policy to continue',
    ended: 'The beta is over', endedText: 'VixArt is now available to everyone: download it and create your account in the app.', home: 'Go to VixArt',
    closed: 'Sign-ups are closed', closedText: 'We are not accepting more testers right now. Check back in a few days.',
    full: 'No places left', fullText: 'The beta is full. Thank you for your interest!', fullAgain: 'Already signed up? Get your details again',
    error: 'Could not connect. Check your connection and try again.',
    E: { CORREO_INVALIDO: 'That email is not valid. Enter your personal email.', ESPERA: null, LLENA: 'There are no places left in the beta.',
      TERMINO: 'The beta is over: download VixArt and create your account in the app.', INSCRIPCION_CERRADA: 'Beta sign-ups are closed.',
      SIN_CORREO: 'Email sending is not ready yet. Please try again later.', CORREO_FALLO: 'We could not send the email. Please try again in a few minutes.' },
  };
  const EN_WAIT = { 'demasiadas solicitudes': 'Too many requests. Please try again in a while.', 'hace poco': 'We sent you the email recently. Check your spam folder too.', 'varias veces hoy': 'You requested your details several times today. Try again tomorrow.' };
  const f = (s, m) => s.replace(/\{(\w)\}/g, (_, k) => m[k] ?? '');
  if (!es) document.documentElement.lang = 'en';
  document.querySelectorAll('[data-t]').forEach(e => { if (T[e.dataset.t]) e.textContent = T[e.dataset.t]; });
  const box = document.getElementById('bt');
  const h = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c);
    return e;
  };
  const svg = d => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = d; return s; };
  const ICON = { mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', play: '<path d="M5 3.8v16.4a.8.8 0 0 0 1.2.7l14-8.2a.8.8 0 0 0 0-1.4l-14-8.2A.8.8 0 0 0 5 3.8z"/>', people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.6.1 4.4 1.6 5 4.3"/>' };
  const rpc = async (fn, body) => {
    const r = await fetch(SB + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body || {}) });
    const j = await r.json().catch(() => null);
    if (!r.ok) { const e = new Error((j && j.message) || String(r.status)); e.server = true; throw e; }
    return j;
  };
  const errText = e => {
    const m = /VIXART_BETA_([A-Z_]+):\s*(.*)$/.exec(e.message || '');
    if (!m) return e.server ? (es ? 'No se pudo completar. Inténtalo de nuevo.' : 'Something went wrong. Please try again.') : T.error;
    if (T.E[m[1]]) return T.E[m[1]];
    if (es) return m[2].charAt(0).toUpperCase() + m[2].slice(1) + '.';
    for (const [k, v] of Object.entries(EN_WAIT)) if (m[2].includes(k)) return v;
    return 'Please try again later.';
  };
  let st = null;
  const message = (title, text, withHome) => box.replaceChildren(h('div', { class: 'bt-ok' }, h('h2', null, title), h('p', null, text),
    withHome ? h('div', { class: 'bt-actions' }, h('a', { class: 'btn btn-main', href: es ? 'index.html' : 'en/index.html' }, T.home)) : null));
  const links = () => h('div', { class: 'bt-actions' },
    st && st.group_url ? h('a', { class: 'btn btn-ghost', href: st.group_url, target: '_blank', rel: 'noopener' }, svg(ICON.people), T.group) : null,
    st && st.play_url ? h('a', { class: 'btn btn-main', href: st.play_url, target: '_blank', rel: 'noopener' }, svg(ICON.play), T.play) : null);

  function form(prefill) {
    const inp = h('input', { type: 'email', name: 'email', id: 'bt-email', required: true, autocomplete: 'email', inputmode: 'email', placeholder: T.ph, maxlength: '254' });
    if (prefill) inp.value = prefill;
    const chk = h('input', { type: 'checkbox', id: 'bt-accept' });
    const legal = es ? '' : 'en/';
    const acc = h('label', { class: 'bt-check', for: 'bt-accept' }, chk, h('span', null));
    const [a, b] = T.accept.split('{t}'); const [c, d] = b.split('{p}');
    acc.lastChild.append(a, h('a', { href: legal + 'terminos.html', target: '_blank', rel: 'noopener' }, T.terms), c, h('a', { href: legal + 'privacidad.html', target: '_blank', rel: 'noopener' }, T.privacy), d);
    const err = h('p', { class: 'bt-err', role: 'alert' });
    const btn = h('button', { class: 'btn btn-main', type: 'submit' }, svg(ICON.mail), T.send);
    const fm = h('form', { class: 'bt-form', novalidate: true },
      h('label', { for: 'bt-email' }, T.email, inp), acc, err, btn, h('p', { class: 'bt-fine' }, T.fine));
    fm.addEventListener('submit', async ev => {
      ev.preventDefault();
      err.textContent = '';
      const email = inp.value.trim();
      if (!email) { err.textContent = T.needEmail; inp.focus(); return; }
      if (!chk.checked) { err.textContent = T.needAccept; return; }
      btn.disabled = true; btn.lastChild.textContent = T.sending;
      try {
        const r = await rpc('beta_signup', { p_email: email, p_lang: es ? 'es' : 'en' });
        done(email, r && r.status === 'reenviado');
      } catch (e) {
        err.textContent = errText(e);
        btn.disabled = false; btn.lastChild.textContent = T.send;
      }
    });
    box.replaceChildren(h('h2', null, T.formTitle), h('p', null, T.formSub), fm);
  }
  function done(email, again) {
    const p = h('p', null); const [a, b] = (again ? T.okAgain : T.okText).split('{e}'); p.append(a, h('b', null, email), b);
    box.replaceChildren(h('div', { class: 'bt-ok' }, h('div', { class: 'bt-icon' }, svg(ICON.check)), h('h2', null, T.okTitle), p, links(),
      h('button', { class: 'bt-again', type: 'button', onclick: () => form('') }, T.other)));
  }
  (async () => {
    try { st = await rpc('beta_signup_status'); }
    catch (e) { box.replaceChildren(h('p', { class: 'pfw-state' }, T.error)); return; }
    if (!st.beta) return message(T.ended, T.endedText, true);
    if (!st.active) return message(T.closed, T.closedText);
    if (st.full) { message(T.full, T.fullText); box.firstChild.append(h('button', { class: 'bt-again', type: 'button', onclick: () => form('') }, T.fullAgain)); return; }
    form(new URLSearchParams(location.search).get('email') || '');
  })();
})();
