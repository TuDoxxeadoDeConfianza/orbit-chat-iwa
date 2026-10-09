import './style.css';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { createClient } from '@supabase/supabase-js';

const channels = [
  { id: 'general', name: 'general', type: 'text', description: 'El punto de encuentro de la comunidad.' },
  { id: 'presentaciones', name: 'presentaciones', type: 'text', description: 'Preséntate a la comunidad.' },
  { id: 'memes', name: 'memes', type: 'text', description: 'Memes, clips y momentos épicos.' },
  { id: 'ayuda', name: 'ayuda', type: 'text', description: 'Pide ayuda y ayuda a los demás.' },
];
const demoMessages = {
  general: [
    { name: 'Luna', avatar: 'L', color: '#df8ba7', time: '10:14', text: '¡Bienvenidos a Orbit! 🌙' },
    { name: 'Marcos', avatar: 'M', color: '#7a91e8', time: '10:16', text: 'El diseño tiene muy buena pinta 👀' },
    { name: 'Nora', avatar: 'N', color: '#d7a35b', time: '10:19', text: '¿Qué canal añadimos después?' },
  ],
  presentaciones: [
    { name: 'Luna', avatar: 'L', color: '#df8ba7', time: '09:41', text: '¡Hola! Soy Luna. Me encantan los juegos y la música.' },
  ],
  memes: [
    { name: 'Marcos', avatar: 'M', color: '#7a91e8', time: 'Ayer', text: 'Cuando por fin compila a la primera: 🧑‍🍳🤌' },
  ],
  ayuda: [
    { name: 'Nora', avatar: 'N', color: '#d7a35b', time: 'Ayer', text: 'Usa este canal para preguntar lo que necesites.' },
  ],
};

const state = {
  channel: 'general',
  messages: structuredClone(demoMessages),
  user: null,
  auth0: null,
  supabase: null,
  remoteReady: false,
  status: 'Modo de demostración',
  mobileMenu: false,
};

const icons = {
  orbit: '<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="orb" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9e8bff"/><stop offset="1" stop-color="#64c7fa"/></linearGradient></defs><circle cx="20" cy="20" r="9" fill="url(#orb)"/><ellipse cx="20" cy="20" rx="17" ry="7" fill="none" stroke="url(#orb)" stroke-width="2.8" transform="rotate(-32 20 20)"/><circle cx="33" cy="10" r="2.3" fill="#f8d884"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-5 4v-4.2a2.5 2.5 0 0 1-2-2.3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  hash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3 7 21M17 3l-2 18M4 9h17M3 16h17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-7.2 18-3.9-7.9L2 9.2 21 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M21 3 9.9 13.1" stroke="currentColor" stroke-width="1.8"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 20v-1.7a5.5 5.5 0 0 1 11 0V20M16 5a3 3 0 0 1 0 6m2 3a4.5 4.5 0 0 1 3 4.3V20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m19.4 15 .1.1 1.1 1.9-2 3.4-2.2-.5a7.6 7.6 0 0 1-1.8 1l-.7 2.1h-3.9l-.7-2.1a7.6 7.6 0 0 1-1.8-1l-2.2.5-2-3.4 1.1-1.9A7.5 7.5 0 0 1 4.4 13l-2-1 0-3.9 2.1-.7a7.6 7.6 0 0 1 1-1.8L5 3.4l3.4-2 1.9 1.1a7.5 7.5 0 0 1 2-.1l1-2 3.9 0 .7 2.1a7.6 7.6 0 0 1 1.8 1L21 3l2 3.4-1.1 1.9a7.5 7.5 0 0 1 .1 2l2 1v3.9l-2.1.7a7.6 7.6 0 0 1-1 1.8Z" transform="translate(1 1) scale(.9)" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  smile: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 14s1.3 2.2 4 2.2S16 14 16 14M9 9h.01M15 9h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function initials(name = 'Invitado') {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'I';
}
function currentChannel() {
  return channels.find(channel => channel.id === state.channel) || channels[0];
}
function render() {
  const active = currentChannel();
  const messages = state.messages[state.channel] || [];
  const name = state.user?.name || 'Invitado';
  const avatar = state.user?.picture
    ? `<img src="${escapeHtml(state.user.picture)}" alt="" referrerpolicy="no-referrer">`
    : escapeHtml(initials(name));
  document.querySelector('#app').innerHTML = `
    <div class="app-shell ${state.mobileMenu ? 'menu-open' : ''}">
      <aside class="server-rail">
        <button class="brand-orb" title="Orbit Chat" aria-label="Orbit Chat">${icons.orbit}</button>
        <div class="rail-separator"></div>
        <button class="server-icon selected" title="Orbit Community">O</button>
        <button class="server-add" title="Añadir comunidad" aria-label="Añadir comunidad">${icons.plus}</button>
        <div class="rail-bottom"><span class="rail-dot"></span></div>
      </aside>
      <aside class="channel-sidebar">
        <button class="workspace-name" id="workspace-button"><span class="workspace-glyph">✳</span><span>Orbit Community</span><span class="chevron">⌄</span></button>
        <div class="sidebar-scroll">
          <div class="sidebar-label">TU ESPACIO <button title="Añadir canal" class="tiny-add" id="add-channel">${icons.plus}</button></div>
          <div class="channel-list">
            ${channels.map(c => `<button class="channel-item ${c.id === state.channel ? 'active' : ''}" data-channel="${c.id}"><span class="channel-hash">${icons.hash}</span><span>${escapeHtml(c.name)}</span><span class="channel-unread">${c.id === 'general' ? '2' : ''}</span></button>`).join('')}
          </div>
          <div class="sidebar-label members-label">COMUNIDAD <span class="label-count">4</span></div>
          <div class="member-mini-list">
            <div class="member-mini"><span class="mini-avatar luna">L</span><span>Luna</span><i class="online"></i></div>
            <div class="member-mini"><span class="mini-avatar marcos">M</span><span>Marcos</span><i class="online"></i></div>
            <div class="member-mini"><span class="mini-avatar nora">N</span><span>Nora</span><i class="idle"></i></div>
            <div class="member-mini"><span class="mini-avatar you">${escapeHtml(initials(name))}</span><span>${escapeHtml(name)} ${state.user ? '' : '(tú)'}</span><i class="online"></i></div>
          </div>
          <div class="sidebar-promo"><span class="promo-star">✦</span><strong>Tu rincón de internet.</strong><p>Conecta con gente, comparte ideas y crea algo increíble.</p></div>
        </div>
        <div class="account-panel">
          <div class="account-avatar">${avatar}<i class="online"></i></div>
          <div class="account-copy"><strong>${escapeHtml(name)}</strong><span>${state.user ? 'En línea' : 'Vista previa'}</span></div>
          <button class="icon-button small" id="auth-button" title="${state.user ? 'Cerrar sesión' : 'Iniciar sesión'}">${state.user ? '↪' : '⇥'}</button>
          <button class="icon-button small" id="settings-button" title="Configuración">${icons.settings}</button>
        </div>
      </aside>
      <main class="chat-panel">
        <header class="topbar">
          <button class="mobile-menu" id="mobile-menu" aria-label="Abrir menú">☰</button>
          <span class="topbar-hash">${icons.hash}</span>
          <strong>${escapeHtml(active.name)}</strong>
          <span class="topbar-divider"></span>
          <span class="channel-topic">${escapeHtml(active.description)}</span>
          <div class="topbar-actions"><span class="connection-pill"><i></i>${escapeHtml(state.status)}</span><button class="icon-button" id="members-toggle" title="Miembros">${icons.users}</button><button class="icon-button" id="top-settings" title="Configuración">${icons.settings}</button></div>
        </header>
        <section class="message-area" id="message-area">
          <div class="channel-welcome"><div class="welcome-icon">${icons.hash}</div><span class="eyebrow">HAS LLEGADO A</span><h1># ${escapeHtml(active.name)}</h1><p>${escapeHtml(active.description)}<br>Este es el comienzo de este canal.</p></div>
          <div class="day-divider"><span>HOY</span></div>
          <div class="message-list">
            ${messages.map(message => `<article class="message"><div class="message-avatar" style="--avatar-color:${escapeHtml(message.color || '#8a86e8')}">${escapeHtml(message.avatar || initials(message.name))}</div><div class="message-body"><div class="message-meta"><strong>${escapeHtml(message.name)}</strong><span>${escapeHtml(message.time || '')}</span></div><p>${escapeHtml(message.text)}</p></div></article>`).join('')}
          </div>
        </section>
        <form class="composer" id="message-form"><div class="composer-row"><button type="button" class="composer-action" id="attach-button" title="Adjuntar (próximamente)">${icons.plus}</button><input id="message-input" name="message" autocomplete="off" maxlength="2000" placeholder="Enviar mensaje a #${escapeHtml(active.name)}" aria-label="Mensaje" required><button type="button" class="composer-emoji" id="emoji-button" title="Añadir emoji">${icons.smile}</button><button type="submit" class="send-button" aria-label="Enviar mensaje">${icons.send}</button></div><div class="composer-hint"><span><kbd>Enter</kbd> para enviar</span><span>Orbit Chat <b>·</b> hecho para tu comunidad</span></div></form>
      </main>
      <aside class="members-panel"><div class="members-heading">Miembros <span>4</span></div><div class="presence-label">EN LÍNEA — 3</div><div class="member-card"><span class="member-avatar luna">L<i class="online"></i></span><span><b>Luna</b><small>Siempre por aquí 🌙</small></span></div><div class="member-card"><span class="member-avatar marcos">M<i class="online"></i></span><span><b>Marcos</b><small>Jugando a algo</small></span></div><div class="member-card"><span class="member-avatar you">${escapeHtml(initials(name))}<i class="online"></i></span><span><b>${escapeHtml(name)}</b><small>${state.user ? 'En línea' : 'Vista previa'}</small></span></div><div class="presence-label offline-label">DESCONECTADA — 1</div><div class="member-card muted"><span class="member-avatar nora">N<i class="idle"></i></span><span><b>Nora</b><small>Vuelve pronto</small></span></div><div class="member-footer">Tu comunidad, a tu manera.</div></aside>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    </div>`;
  bindEvents();
  scrollToBottom();
}
function scrollToBottom() {
  const area = document.querySelector('#message-area');
  if (area) area.scrollTop = area.scrollHeight;
}
let toastTimer;
function toast(message) {
  const el = document.querySelector('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2600);
}
function bindEvents() {
  document.querySelectorAll('[data-channel]').forEach(button => button.addEventListener('click', () => {
    state.channel = button.dataset.channel;
    state.mobileMenu = false;
    render();
  }));
  document.querySelector('#message-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.querySelector('#message-input');
    const text = input.value.trim();
    if (!text) return;
    const item = {
      name: state.user?.name || 'Tú',
      avatar: initials(state.user?.name || 'Tú'),
      color: '#9386f4',
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      text,
    };
    state.messages[state.channel] ||= [];
    state.messages[state.channel].push(item);
    input.value = '';
    render();
    document.querySelector('#message-input')?.focus();
    if (state.remoteReady && state.supabase && state.user) {
      const { error } = await state.supabase.from('messages').insert({
        channel_slug: state.channel,
        author_sub: state.user.sub,
        author_name: state.user.name || 'Usuario',
        body: text,
      });
      if (error) toast('Mensaje mostrado localmente; revisa la configuración de Supabase.');
    } else {
      toast('Mensaje de demostración: configura Supabase para guardar mensajes.');
    }
  });
  document.querySelector('#auth-button')?.addEventListener('click', authAction);
  document.querySelector('#mobile-menu')?.addEventListener('click', () => { state.mobileMenu = !state.mobileMenu; render(); });
  document.querySelector('#members-toggle')?.addEventListener('click', () => document.querySelector('.members-panel')?.classList.toggle('show-mobile'));
  document.querySelector('#top-settings')?.addEventListener('click', showSettings);
  document.querySelector('#settings-button')?.addEventListener('click', showSettings);
  document.querySelector('#workspace-button')?.addEventListener('click', () => toast('La gestión de comunidades llegará en una próxima versión.'));
  document.querySelector('#add-channel')?.addEventListener('click', () => toast('Los canales nuevos se habilitarán al conectar el backend.'));
  document.querySelector('.server-add')?.addEventListener('click', () => toast('La creación de comunidades estará disponible próximamente.'));
  document.querySelector('#attach-button')?.addEventListener('click', () => toast('Los archivos adjuntos llegarán próximamente.'));
  document.querySelector('#emoji-button')?.addEventListener('click', () => {
    const input = document.querySelector('#message-input');
    input.value += ' ✨';
    input.focus();
  });
}
function showSettings() {
  toast(state.remoteReady ? 'Servicios conectados. Configuración ampliada próximamente.' : 'Demo local. Añade variables de entorno para activar Auth0 y Supabase.');
}
async function authAction() {
  if (!state.auth0) {
    toast('Configura VITE_AUTH0_DOMAIN y VITE_AUTH0_CLIENT_ID para iniciar sesión.');
    return;
  }
  if (state.user) {
    await state.auth0.logout({ logoutParams: { returnTo: window.location.origin } });
    return;
  }
  await state.auth0.loginWithRedirect();
}
async function initializeServices() {
  const env = import.meta.env;
  if (env.VITE_AUTH0_DOMAIN && env.VITE_AUTH0_CLIENT_ID) {
    try {
      state.auth0 = await createAuth0Client({
        domain: env.VITE_AUTH0_DOMAIN,
        clientId: env.VITE_AUTH0_CLIENT_ID,
        authorizationParams: { redirect_uri: window.location.origin },
        cacheLocation: 'memory',
      });
      const params = new URLSearchParams(window.location.search);
      if (params.has('code') && params.has('state')) {
        await state.auth0.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (await state.auth0.isAuthenticated()) {
        const user = await state.auth0.getUser();
        if (user) state.user = { sub: user.sub, name: user.name || user.nickname || user.email || 'Usuario', picture: user.picture, email: user.email };
      }
    } catch (error) {
      console.error('Auth0 initialization failed:', error);
      state.status = 'Auth0 sin configurar';
    }
  }
  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    try {
      state.supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
      // Do not write to the database until a verified identity-to-RLS bridge is configured.
      // Supabase Auth JWTs and Auth0 user IDs are not interchangeable by default.
      state.status = state.user ? 'Sesión Auth0' : 'Backend pendiente';
      state.remoteReady = false;
    } catch (error) {
      console.error('Supabase initialization failed:', error);
      state.status = 'Backend sin configurar';
    }
  } else if (state.auth0) {
    state.status = 'Supabase pendiente';
  }
  render();
}
render();
initializeServices();
