/* ============================================================
   Genius Gems — Internal SEO & Performance Tracker
   ------------------------------------------------------------
   No backend. Runs entirely in the browser.
   - Auth: Google Identity Services (OAuth 2.0 token flow)
   - Data: Search Console API, Analytics Data API (GA4),
           PageSpeed Insights API
   Credentials (OAuth client ID / API key / GA4 property) are
   stored in this browser's localStorage only.
   ============================================================ */
(function () {
  'use strict';

  var SITE_URL = 'https://geniusgems.com.sg/';
  // Pages we care about for PageSpeed checks
  var KEY_PAGES = [
    { label: 'Home', url: SITE_URL },
    { label: 'Gallery', url: SITE_URL + 'gallery.html' },
    { label: 'Blog', url: SITE_URL + 'blog/' },
    { label: 'Location', url: SITE_URL + 'location/changi/' }
  ];
  var SCOPES = [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/analytics.readonly'
  ].join(' ');

  var LS = {
    clientId: 'gg_seo_client_id',
    apiKey: 'gg_seo_api_key',
    gaProp: 'gg_seo_ga_prop'
  };

  var state = {
    token: null,
    tokenClient: null,
    view: 'client'
  };

  // ---------- tiny DOM helpers ----------
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function cfg(k) { return localStorage.getItem(k) || ''; }
  function setCfg(k, v) { localStorage.setItem(k, v); }

  function fmt(n) {
    if (n == null || isNaN(n)) return '—';
    n = Number(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return Math.round(n).toLocaleString();
  }
  function pct(n) { return (n == null || isNaN(n)) ? '—' : (Number(n) * 100).toFixed(1) + '%'; }
  function pos(n) { return (n == null || isNaN(n)) ? '—' : Number(n).toFixed(1); }

  function alertBox(kind, html) {
    return '<div class="alert alert-' + kind + '">' + html + '</div>';
  }
  function showGlobal(kind, html) { $('globalAlert').innerHTML = html ? alertBox(kind, html) : ''; }

  function dateNDaysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  // ---------- config / setup panel ----------
  function haveConfig() { return cfg(LS.clientId); }

  function initSetup() {
    $('originHint').textContent = location.origin;
    $('clientIdInput').value = cfg(LS.clientId);
    $('apiKeyInput').value = cfg(LS.apiKey);
    $('gaPropInput').value = cfg(LS.gaProp);

    $('saveConfigBtn').addEventListener('click', function () {
      var id = $('clientIdInput').value.trim();
      if (!id) { alert('Please enter your OAuth Client ID.'); return; }
      setCfg(LS.clientId, id);
      setCfg(LS.apiKey, $('apiKeyInput').value.trim());
      setCfg(LS.gaProp, $('gaPropInput').value.trim());
      setupTokenClient();
      $('setupPanel').classList.add('hidden');
      showGlobal('info', 'Config saved. Click <b>Sign in with Google</b> to load your data.');
    });

    $('clearConfigBtn').addEventListener('click', function () {
      if (!confirm('Clear saved Client ID, API key and GA4 property from this browser?')) return;
      localStorage.removeItem(LS.clientId);
      localStorage.removeItem(LS.apiKey);
      localStorage.removeItem(LS.gaProp);
      location.reload();
    });

    if (haveConfig()) $('setupPanel').classList.add('hidden');
  }

  // ---------- OAuth (Google Identity Services) ----------
  function setupTokenClient() {
    if (!window.google || !google.accounts || !google.accounts.oauth2) return false;
    if (!haveConfig()) return false;
    state.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: cfg(LS.clientId),
      scope: SCOPES,
      callback: function (resp) {
        if (resp && resp.access_token) {
          state.token = resp.access_token;
          onSignedIn();
        } else if (resp && resp.error) {
          showGlobal('error', 'Sign-in failed: ' + resp.error + '. Check that this origin (<code>' +
            location.origin + '</code>) is an Authorised JavaScript origin on your OAuth client.');
        }
      }
    });
    return true;
  }

  function signIn() {
    if (!haveConfig()) {
      $('setupPanel').classList.remove('hidden');
      showGlobal('warn', 'Please complete the one-time setup first.');
      return;
    }
    if (!state.tokenClient && !setupTokenClient()) {
      showGlobal('error', 'Google sign-in library not ready yet — try again in a moment.');
      return;
    }
    state.tokenClient.requestAccessToken({ prompt: state.token ? '' : 'consent' });
  }

  function signOut() {
    if (state.token && window.google && google.accounts && google.accounts.oauth2) {
      google.accounts.oauth2.revoke(state.token, function () {});
    }
    state.token = null;
    $('authState').textContent = 'Not connected to Google';
    $('signInBtn').classList.remove('hidden');
    $('signOutBtn').classList.add('hidden');
    $('refreshBtn').classList.add('hidden');
  }

  function onSignedIn() {
    $('authState').innerHTML = 'Connected to Google ✓';
    $('signInBtn').classList.add('hidden');
    $('signOutBtn').classList.remove('hidden');
    $('refreshBtn').classList.remove('hidden');
    showGlobal('', '');
    loadAll();
  }

  // ---------- authorized fetch ----------
  function api(url, opts) {
    opts = opts || {};
    opts.headers = opts.headers || {};
    opts.headers.Authorization = 'Bearer ' + state.token;
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (body) {
        if (!r.ok) {
          var msg = (body && body.error && body.error.message) || ('HTTP ' + r.status);
          throw new Error(msg);
        }
        return body;
      });
    });
  }

  // ============================================================
  //  SEARCH CONSOLE
  // ============================================================
  function scQuery(dimensions, rowLimit) {
    var days = Number($('rangeSelect').value);
    var url = 'https://searchconsole.googleapis.com/webmasters/v3/sites/' +
      encodeURIComponent(SITE_URL) + '/searchAnalytics/query';
    return api(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: dateNDaysAgo(days + 2),
        endDate: dateNDaysAgo(2), // GSC data lags ~2 days
        dimensions: dimensions || [],
        rowLimit: rowLimit || 25
      })
    });
  }

  function loadSearchConsole() {
    // Totals (no dimension)
    scQuery([], 1).then(function (res) {
      var r = (res.rows && res.rows[0]) || {};
      var clicks = r.clicks || 0, impr = r.impressions || 0, ctr = r.ctr || 0, position = r.position || 0;

      // Admin KPIs
      renderKpis('scKpis', [
        { label: 'Clicks', value: fmt(clicks) },
        { label: 'Impressions', value: fmt(impr) },
        { label: 'Avg. CTR', value: pct(ctr) },
        { label: 'Avg. position', value: pos(position) }
      ]);
      // Client KPIs
      var c = $('clientSearchKpis');
      c.innerHTML = '';
      c.appendChild(kpiCard('Clicks from Google', fmt(clicks), 'Visits that came from a Google search result.'));
      c.appendChild(kpiCard('Times shown', fmt(impr), 'How many times we appeared in search results.'));
      c.appendChild(kpiCard('Average position', pos(position), 'Our typical ranking (1 = top of page).'));

      updateClientHeadline({ clicks: clicks, impr: impr });
    }).catch(scError);

    // Top queries
    scQuery(['query'], 25).then(function (res) {
      fillSearchTable('scQueries', res.rows, function (r) { return r.keys[0]; });
    }).catch(function (e) { scTableError('scQueries', e); });

    // Top pages
    scQuery(['page'], 25).then(function (res) {
      fillSearchTable('scPages', res.rows, function (r) {
        var p = r.keys[0].replace(SITE_URL, '/');
        return '<a href="' + r.keys[0] + '" target="_blank" rel="noopener">' + p + '</a>';
      });
    }).catch(function (e) { scTableError('scPages', e); });
  }

  function fillSearchTable(id, rows, keyFn) {
    var tb = $(id).querySelector('tbody');
    tb.innerHTML = '';
    if (!rows || !rows.length) { tb.innerHTML = '<tr><td colspan="5" class="muted">No data for this period.</td></tr>'; return; }
    rows.forEach(function (r) {
      var tr = el('tr');
      tr.innerHTML = '<td>' + keyFn(r) + '</td>' +
        '<td class="num">' + fmt(r.clicks) + '</td>' +
        '<td class="num">' + fmt(r.impressions) + '</td>' +
        '<td class="num">' + pct(r.ctr) + '</td>' +
        '<td class="num">' + pos(r.position) + '</td>';
      tb.appendChild(tr);
    });
  }

  function scError(e) {
    var hint = /permission|403/i.test(e.message)
      ? ' — the signed-in Google account must have access to the <code>' + SITE_URL + '</code> property in Search Console.'
      : '';
    showGlobal('error', 'Search Console: ' + e.message + hint);
  }
  function scTableError(id, e) {
    var tb = $(id).querySelector('tbody');
    tb.innerHTML = '<tr><td colspan="5" class="muted">' + e.message + '</td></tr>';
  }

  // ============================================================
  //  GA4 (Analytics Data API)
  // ============================================================
  function ga4Report(body) {
    var prop = cfg(LS.gaProp);
    if (!prop) return Promise.reject(new Error('No GA4 Property ID set (add it in setup).'));
    var url = 'https://analyticsdata.googleapis.com/v1beta/properties/' + prop + ':runReport';
    return api(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  function loadAnalytics() {
    var days = Number($('rangeSelect').value);
    var range = [{ startDate: days + 'daysAgo', endDate: 'today' }];
    $('gaPropLabel').textContent = cfg(LS.gaProp) ? '#' + cfg(LS.gaProp) : '(not set)';

    // Totals
    ga4Report({
      dateRanges: range,
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' }
      ]
    }).then(function (res) {
      var m = (res.rows && res.rows[0] && res.rows[0].metricValues) || [];
      var users = num(m[0]), sessions = num(m[1]), views = num(m[2]),
          dur = num(m[3]), conv = num(m[4]);

      renderKpis('gaKpis', [
        { label: 'Total users', value: fmt(users) },
        { label: 'Sessions', value: fmt(sessions) },
        { label: 'Page views', value: fmt(views) },
        { label: 'Avg. session', value: mmss(dur) },
        { label: 'Conversions', value: fmt(conv) }
      ]);

      var c = $('clientTrafficKpis');
      c.innerHTML = '';
      c.appendChild(kpiCard('Total visitors', fmt(users)));
      c.appendChild(kpiCard('Visits (sessions)', fmt(sessions)));
      c.appendChild(kpiCard('Enquiry actions', fmt(conv), 'Calls, WhatsApp & form clicks (conversions).'));
    }).catch(gaError);

    // Channels
    ga4Report({
      dateRanges: range,
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15
    }).then(function (res) {
      fillGaTable('gaChannels', res.rows, function (r) { return r.dimensionValues[0].value; });
    }).catch(function (e) { gaTableError('gaChannels', e); });

    // Top pages
    ga4Report({
      dateRanges: range,
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 20
    }).then(function (res) {
      fillGaTable('gaPages', res.rows, function (r) {
        var p = r.dimensionValues[0].value;
        return '<a href="' + SITE_URL.replace(/\/$/, '') + p + '" target="_blank" rel="noopener">' + p + '</a>';
      });
    }).catch(function (e) { gaTableError('gaPages', e); });
  }

  function num(mv) { return mv ? Number(mv.value) : 0; }
  function mmss(sec) {
    sec = Math.round(sec || 0);
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + 'm ' + (s < 10 ? '0' : '') + s + 's';
  }
  function fillGaTable(id, rows, keyFn) {
    var tb = $(id).querySelector('tbody');
    tb.innerHTML = '';
    if (!rows || !rows.length) { tb.innerHTML = '<tr><td colspan="3" class="muted">No data.</td></tr>'; return; }
    rows.forEach(function (r) {
      var tr = el('tr');
      tr.innerHTML = '<td>' + keyFn(r) + '</td>' +
        '<td class="num">' + fmt(num(r.metricValues[0])) + '</td>' +
        '<td class="num">' + fmt(num(r.metricValues[1])) + '</td>';
      tb.appendChild(tr);
    });
  }
  function gaError(e) {
    var hint = /permission|403|PERMISSION/i.test(e.message)
      ? ' — the account needs Viewer access to this GA4 property, and the Property ID must be the numeric ID.'
      : '';
    showGlobal('error', 'Analytics: ' + e.message + hint);
  }
  function gaTableError(id, e) {
    var tb = $(id).querySelector('tbody');
    tb.innerHTML = '<tr><td colspan="3" class="muted">' + e.message + '</td></tr>';
  }

  // ============================================================
  //  PAGESPEED INSIGHTS
  // ============================================================
  function scoreColor(v) { return v >= 90 ? 'var(--good)' : v >= 50 ? 'var(--warn)' : 'var(--bad)'; }
  function ring(v, label) {
    var color = scoreColor(v);
    var bg = 'conic-gradient(' + color + ' ' + (v * 3.6) + 'deg, var(--border) 0)';
    return '<div class="gauge"><div class="ring" style="background:' + bg + '">' +
      '<span style="background:#fff;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;">' + v + '</span>' +
      '</div><small>' + label + '</small></div>';
  }
  function cwvRow(label, value, rating) {
    var cls = rating === 'FAST' || rating === 'GOOD' ? 'good' : rating === 'AVERAGE' ? 'warn' : 'bad';
    return '<div><span>' + label + '</span><span class="pill ' + cls + '">' + value + '</span></div>';
  }

  function runPageSpeed(targetId, pages, strategy) {
    var key = cfg(LS.apiKey);
    var container = $(targetId);
    container.innerHTML = '';
    pages.forEach(function (p) {
      var card = el('div', 'ps-card');
      card.innerHTML = '<h4>' + p.label + '</h4><div class="muted"><span class="spinner"></span> Testing…</div>';
      container.appendChild(card);

      var url = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' +
        encodeURIComponent(p.url) + '&strategy=' + strategy +
        '&category=performance&category=seo&category=accessibility&category=best-practices' +
        (key ? '&key=' + key : '');

      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        if (data.error) throw new Error(data.error.message);
        var cats = data.lighthouseResult.categories;
        var audits = data.lighthouseResult.audits;
        var s = function (c) { return Math.round((cats[c] ? cats[c].score : 0) * 100); };

        var gauges = ring(s('performance'), 'Perf') + ring(s('accessibility'), 'A11y') +
          ring(s('best-practices'), 'Best') + ring(s('seo'), 'SEO');

        var lcp = audits['largest-contentful-paint'];
        var cls = audits['cumulative-layout-shift'];
        var tbt = audits['total-blocking-time'];
        var fcp = audits['first-contentful-paint'];
        var cwv = '<div class="cwv">' +
          cwvRow('LCP', lcp.displayValue, ratingFromScore(lcp.score)) +
          cwvRow('CLS', cls.displayValue, ratingFromScore(cls.score)) +
          cwvRow('TBT', tbt.displayValue, ratingFromScore(tbt.score)) +
          cwvRow('FCP', fcp.displayValue, ratingFromScore(fcp.score)) +
          '</div>';

        card.innerHTML = '<h4>' + p.label + '</h4><div class="gauges">' + gauges + '</div>' + cwv;
      }).catch(function (e) {
        card.innerHTML = '<h4>' + p.label + '</h4><div class="alert alert-error" style="margin:0">' + e.message +
          (/API key|keyInvalid|quota/i.test(e.message) ? ' — add a valid PageSpeed API key in setup.' : '') + '</div>';
      });
    });
  }
  function ratingFromScore(score) {
    if (score == null) return 'AVERAGE';
    return score >= 0.9 ? 'GOOD' : score >= 0.5 ? 'AVERAGE' : 'SLOW';
  }

  // ============================================================
  //  RENDER HELPERS
  // ============================================================
  function kpiCard(label, value, help, delta) {
    var c = el('div', 'kpi');
    var h = '<div class="kpi-label">' + label + '</div><div class="kpi-value">' + value + '</div>';
    if (delta) h += '<div class="kpi-delta ' + (delta.dir) + '">' + delta.text + '</div>';
    if (help) h += '<div class="kpi-help">' + help + '</div>';
    c.innerHTML = h;
    return c;
  }
  function renderKpis(containerId, items) {
    var c = $(containerId);
    c.innerHTML = '';
    items.forEach(function (it) { c.appendChild(kpiCard(it.label, it.value, it.help, it.delta)); });
  }

  function updateClientHeadline(d) {
    var label = $('rangeSelect').options[$('rangeSelect').selectedIndex].text.toLowerCase();
    $('clientPeriodLabel').textContent = '· ' + label;
    $('clientHeadline').innerHTML = 'In the ' + label + ', Genius Gems appeared in Google search <b>' +
      fmt(d.impr) + '</b> times and brought <b>' + fmt(d.clicks) + '</b> visits from search. Scroll down for visitor numbers and website health.';
  }

  // ============================================================
  //  ORCHESTRATION
  // ============================================================
  function loadAll() {
    if (!state.token) return;
    loadSearchConsole();
    loadAnalytics();
    // PageSpeed: client view auto-runs a light check on the homepage; admin is on-demand.
    if (state.view === 'client') {
      runPageSpeed('clientHealth', [KEY_PAGES[0]], 'mobile');
    }
  }

  // ---------- view toggle ----------
  function setView(v) {
    state.view = v;
    var isClient = v === 'client';
    $('clientView').classList.toggle('hidden', !isClient);
    $('adminView').classList.toggle('hidden', isClient);
    $('viewClient').classList.toggle('active', isClient);
    $('viewAdmin').classList.toggle('active', !isClient);
    $('viewClient').setAttribute('aria-selected', isClient);
    $('viewAdmin').setAttribute('aria-selected', !isClient);
    if (state.token && isClient && $('clientHealth').children.length <= 1) {
      runPageSpeed('clientHealth', [KEY_PAGES[0]], 'mobile');
    }
  }

  // ---------- init ----------
  function init() {
    initSetup();

    $('viewClient').addEventListener('click', function () { setView('client'); });
    $('viewAdmin').addEventListener('click', function () { setView('admin'); });
    $('signInBtn').addEventListener('click', signIn);
    $('signOutBtn').addEventListener('click', signOut);
    $('refreshBtn').addEventListener('click', loadAll);
    $('rangeSelect').addEventListener('change', function () { if (state.token) loadAll(); });
    $('runPsBtn').addEventListener('click', function () {
      runPageSpeed('psResults', KEY_PAGES, $('psStrategy').value);
    });

    // Try to wire up the token client once GIS is loaded.
    var tries = 0;
    var t = setInterval(function () {
      if (setupTokenClient() || ++tries > 40) clearInterval(t);
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
