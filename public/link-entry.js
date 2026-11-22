/* Runs before React. Tokens stay in memory and are never consumed on navigation. */
(function () {
  'use strict';
  var path = window.location.pathname.replace(/\/+$/, '');
  if (path !== '/auth/confirm' && path !== '/invitations/confirm') return;
  var query = new URLSearchParams(window.location.search);
  var token = query.get('token');
  window.__carlinkEntry = {
    kind: path === '/auth/confirm' ? 'login' : 'invitation',
    token: token && /^[a-fA-F0-9]{64}$/.test(token) ? token : null,
    signup: path === '/auth/confirm' && query.get('flow') === 'signup'
  };
  window.history.replaceState(null, '', window.location.pathname);
})();
