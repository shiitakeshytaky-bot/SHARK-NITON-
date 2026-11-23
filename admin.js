(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var state = { repo: '', token: '', branch: 'main', content: null, sha: null, portrait: null, dirty: false };

  /* ---------- small helpers ---------- */
  function store(k, v, remember) {
    try {
      if (v === undefined) return localStorage.getItem(k) || sessionStorage.getItem(k);
      if (v === null) { localStorage.removeItem(k); sessionStorage.removeItem(k); return; }
      (remember ? localStorage : sessionStorage).setItem(k, v);
    } catch (e) { return null; }
  }
  // build DOM safely (no innerHTML with user content)
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function getPath(o, path) { return path.split('.').reduce(function (a, k) { return a == null ? '' : a[k]; }, o); }
  function setPath(o, path, v) {
    var ks = path.split('.'), last = ks.pop();
    var t = ks.reduce(function (a, k) { if (!a[k] || typeof a[k] !== 'object') a[k] = {}; return a[k]; }, o);
    t[last] = v;
  }
  function toB64(str) {
    var b = new TextEncoder().encode(str), s = '';
    for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s);
  }
  function fromB64(b64) {
    var s = atob(String(b64).replace(/\s/g, '')), a = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return new TextDecoder().decode(a);
  }
  function waIntl(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.indexOf('00') === 0) d = d.slice(2);
    if (d.charAt(0) === '0') d = '20' + d.slice(1);
    return d;
  }
  function waLocal(intl) { var d = String(intl || ''); return d.indexOf('20') === 0 ? '0' + d.slice(2) : d; }
  function setStatus(msg, kind) { var el = $('#status'); el.textContent = msg || ''; el.className = 'status' + (kind ? ' ' + kind : ''); }
  function markDirty() { state.dirty = true; $('#dirty').hidden = false; }
  function clearDirty() { state.dirty = false; $('#dirty').hidden = true; }

  /* ---------- GitHub API ---------- */
  function gh(path, opts) {
    opts = opts || {};
    var method = opts.method || 'GET';
    var url = 'https://api.github.com/repos/' + state.repo + '/contents/' + path + (method === 'GET' ? '?ref=' + encodeURIComponent(state.branch) : '');
    return fetch(url, {
      method: method, cache: 'no-store',
      headers: { 'Authorization': 'Bearer ' + state.token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error((j && j.message) || ('HTTP ' + r.status)); e.status = r.status; throw e; }
        return j;
      });
    });
  }
  function explain(e) {
    if (e.status === 401) return 'التوكن غير صحيح أو منتهي. اعملي توكن جديد.';
    if (e.status === 403) return 'التوكن مالوش صلاحية Contents ← Read and write على الـ repo ده.';
    if (e.status === 404) return 'ماقدرتش ألاقي الـ repo أو الملف. تأكدي من الاسم ومن إن التوكن متاح على الـ repo.';
    if (e.status === 409 || e.status === 422) return 'الملف اتغيّر من مكان تاني. اعملي Refresh للصفحة وجرّبي تاني.';
    return 'حصل خطأ: ' + e.message;
  }

  /* ---------- content defaults ---------- */
  function normalize(c) {
    c = (c && typeof c === 'object') ? c : {};
    c.contact = c.contact || {}; c.contact.social = c.contact.social || {};
    c.about = c.about || {};
    ['qualifications', 'experience', 'bio', 'certifications'].forEach(function (k) {
      c.about[k] = c.about[k] || {}; c.about[k].ar = c.about[k].ar || ''; c.about[k].en = c.about[k].en || '';
    });
    c.services = c.services || {};
    c.services.nutrition = Array.isArray(c.services.nutrition) ? c.services.nutrition : [];
    c.services.physio = Array.isArray(c.services.physio) ? c.services.physio : [];
    c.testimonials = Array.isArray(c.testimonials) ? c.testimonials : [];
    c.booking = c.booking || {}; c.booking.endpoint = c.booking.endpoint || '';
    c.portraitVersion = c.portraitVersion || 1;
    return c;
  }

  /* ---------- login ---------- */
  function connect() {
    var repo = $('#l-repo').value.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/+$/, '');
    var token = $('#l-token').value.trim();
    var err = $('#l-err'); err.textContent = '';
    if (!/^[\w.\-]+\/[\w.\-]+$/.test(repo)) { err.textContent = 'اكتبي اسم الـ repo بالشكل: username/repo-name'; return; }
    if (token.length < 20) { err.textContent = 'التوكن قصير أوي، اتأكدي إنك نسختيه كامل.'; return; }
    state.repo = repo; state.token = token;
    var btn = $('#l-btn'); btn.disabled = true; btn.textContent = 'جاري الاتصال…';
    gh('content.json').then(function (j) {
      state.content = normalize(JSON.parse(fromB64(j.content)));
      state.sha = j.sha;
      var remember = $('#l-remember').checked;
      store('gh_repo', repo, true);
      store('gh_token', token, remember);
      openApp();
    }).catch(function (e) {
      err.textContent = e.status === 404 ? 'مالقيتش content.json في الـ repo. اتأكدي من الاسم ومن صلاحيات التوكن.' : explain(e);
    }).then(function () { btn.disabled = false; btn.textContent = 'دخول'; });
  }

  /* ---------- app ---------- */
  function openApp() {
    $('#login').hidden = true; $('#app').hidden = false;
    bindFields(); renderServices('nutrition'); renderServices('physio'); renderReviews(); renderPortrait();
    var key = store('sheet_key'); if (key) $('#bk-key').value = key;
    clearDirty(); setStatus('');
  }

  function bindFields() {
    $$('[data-path]').forEach(function (el) {
      el.value = getPath(state.content, el.getAttribute('data-path')) || '';
      el.addEventListener('input', function () { setPath(state.content, el.getAttribute('data-path'), el.value); markDirty(); });
    });
    var wa = $('#c-wa');
    function hint() {
      var i = waIntl(wa.value);
      $('#c-wa-hint').textContent = i ? 'هيتحفظ بالصيغة الدولية: ' + i : '';
    }
    wa.value = waLocal(state.content.contact.whatsapp); hint();
    wa.addEventListener('input', function () { state.content.contact.whatsapp = waIntl(wa.value); hint(); markDirty(); });
  }

  function field(label, value, onInput, opts) {
    opts = opts || {};
    var input = h(opts.area ? 'textarea' : 'input', { dir: opts.ltr ? 'ltr' : 'rtl' });
    if (opts.area) input.rows = opts.rows || 2;
    input.value = value || '';
    input.addEventListener('input', function () { onInput(input.value); markDirty(); });
    return h('label', {}, [label, input]);
  }

  /* services */
  function renderServices(key) {
    var box = $('#svc-' + key), list = state.content.services[key];
    box.textContent = '';
    list.forEach(function (s, i) {
      var head = h('div', { class: 'item-head' }, [
        h('b', { text: (i + 1) + '. ' + (s.ar || s.en || 'خدمة جديدة') }),
        h('button', { class: 'btn ghost sm', type: 'button', text: '↑', title: 'لفوق', onclick: function () { move(list, i, -1); renderServices(key); } }),
        h('button', { class: 'btn ghost sm', type: 'button', text: '↓', title: 'لتحت', onclick: function () { move(list, i, 1); renderServices(key); } }),
        h('button', { class: 'btn danger sm', type: 'button', text: 'حذف', onclick: function () {
          if (confirm('حذف الخدمة دي؟')) { list.splice(i, 1); markDirty(); renderServices(key); }
        } })
      ]);
      box.appendChild(h('div', { class: 'item' }, [head, h('div', { class: 'two' }, [
        field('الاسم (عربي)', s.ar, function (v) { s.ar = v; }),
        field('Name (English)', s.en, function (v) { s.en = v; }, { ltr: true }),
        field('الوصف (عربي)', s.arD, function (v) { s.arD = v; }, { area: true }),
        field('Description (English)', s.d, function (v) { s.d = v; }, { area: true, ltr: true })
      ])]));
    });
  }
  function move(list, i, d) {
    var j = i + d; if (j < 0 || j >= list.length) return;
    var t = list[i]; list[i] = list[j]; list[j] = t; markDirty();
  }

  /* reviews */
  function renderReviews() {
    var box = $('#rev-list'), list = state.content.testimonials;
    box.textContent = '';
    list.forEach(function (r, i) {
      box.appendChild(h('div', { class: 'item' }, [
        h('div', { class: 'item-head' }, [
          h('b', { text: 'رأي ' + (i + 1) }),
          h('button', { class: 'btn danger sm', type: 'button', text: 'حذف', onclick: function () {
            if (confirm('حذف الرأي ده؟')) { list.splice(i, 1); markDirty(); renderReviews(); }
          } })
        ]),
        h('div', { class: 'two' }, [
          field('الاسم (يفضّل اسم أول فقط)', r.name, function (v) { r.name = v; }),
          field('الخدمة (اختياري)', r.service, function (v) { r.service = v; })
        ]),
        field('نص الرأي', r.text, function (v) { r.text = v; }, { area: true, rows: 3 })
      ]));
    });
  }

  /* portrait */
  function renderPortrait() {
    $('#p-img').src = 'dr-fatma.jpg?v=' + encodeURIComponent(state.content.portraitVersion);
  }
  function onPortrait(file) {
    if (!file) return;
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      var W = 760, H = 950, c = document.createElement('canvas'); c.width = W; c.height = H;
      var ratio = W / H, sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (sw / sh > ratio) { var nw = sh * ratio; sx = (sw - nw) / 2; sw = nw; }
      else { var nh = sw / ratio; sy = (sh - nh) * 0.3; sh = nh; }
      var ctx = c.getContext('2d'); ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      c.toBlob(function (blob) {
        state.portrait = blob; markDirty();
        $('#p-img').src = URL.createObjectURL(blob);
        setStatus('الصورة جاهزة. اضغطي "حفظ ونشر" عشان تظهر على الموقع.', '');
      }, 'image/jpeg', 0.84);
      URL.revokeObjectURL(url);
    };
    img.onerror = function () { setStatus('الملف ده مش صورة صالحة.', 'bad'); };
    img.src = url;
  }
  function blobToB64(blob) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1]); };
      r.onerror = rej; r.readAsDataURL(blob);
    });
  }

  /* ---------- validate + save ---------- */
  function isUrl(u) { return /^https?:\/\//i.test(u); }
  function validate(c) {
    var errs = [];
    var wa = String(c.contact.whatsapp || '').replace(/\D/g, '');
    if (wa.length < 10 || wa.length > 15) errs.push('رقم الواتساب غير صحيح.');
    if (c.contact.mapEmbedUrl && !/^https:\/\/www\.google\.com\/maps\/embed/.test(c.contact.mapEmbedUrl)) errs.push('رابط الخريطة لازم يبدأ بـ https://www.google.com/maps/embed');
    ['facebook', 'instagram', 'tiktok'].forEach(function (k) {
      var v = c.contact.social[k]; if (v && !isUrl(v)) errs.push('رابط ' + k + ' لازم يبدأ بـ https://');
    });
    if (c.booking.endpoint && !/^https:\/\/script\.google\.com\/macros\/s\/[\w\-]+\/exec$/.test(c.booking.endpoint)) errs.push('رابط Google Sheet لازم يكون بالشكل: https://script.google.com/macros/s/.../exec');
    ['nutrition', 'physio'].forEach(function (k) {
      c.services[k].forEach(function (s, i) {
        if (!(s.ar || '').trim() || !(s.en || '').trim()) errs.push('خدمة رقم ' + (i + 1) + ' في ' + (k === 'nutrition' ? 'التغذية' : 'العلاج الطبيعي') + ': لازم الاسم بالعربي والإنجليزي.');
      });
      if (!c.services[k].length) errs.push('لازم تفضل خدمة واحدة على الأقل في ' + (k === 'nutrition' ? 'التغذية' : 'العلاج الطبيعي') + '.');
    });
    return errs;
  }
  function clean(c) {
    var o = JSON.parse(JSON.stringify(c));
    ['nutrition', 'physio'].forEach(function (k) {
      o.services[k] = o.services[k].map(function (s) { return { en: s.en.trim(), ar: s.ar.trim(), d: (s.d || '').trim(), arD: (s.arD || '').trim() }; });
    });
    o.testimonials = o.testimonials.filter(function (r) { return (r.text || '').trim(); })
      .map(function (r) { return { name: (r.name || '').trim(), text: r.text.trim(), service: (r.service || '').trim() }; });
    o.contact.phoneDisplay = (o.contact.phoneDisplay || '').trim();
    o.contact.hours = (o.contact.hours || '').trim();
    o.contact.mapEmbedUrl = (o.contact.mapEmbedUrl || '').trim();
    o.booking.endpoint = (o.booking.endpoint || '').trim();
    return o;
  }
  function save() {
    var errs = validate(state.content);
    if (errs.length) { setStatus(errs.join('  •  '), 'bad'); window.scrollTo(0, 0); return; }
    var btn = $('#save'); btn.disabled = true; setStatus('جاري الحفظ على GitHub…');
    var out = clean(state.content);
    var chain = Promise.resolve();
    if (state.portrait) {
      chain = chain.then(function () {
        return gh('dr-fatma.jpg').then(function (j) { return j.sha; }, function (e) { if (e.status === 404) return null; throw e; });
      }).then(function (sha) {
        return blobToB64(state.portrait).then(function (b64) {
          var body = { message: 'Update portrait from dashboard', content: b64, branch: state.branch };
          if (sha) body.sha = sha;
          return gh('dr-fatma.jpg', { method: 'PUT', body: body });
        });
      }).then(function () { out.portraitVersion = Date.now(); state.portrait = null; });
    }
    chain.then(function () {
      return gh('content.json', { method: 'PUT', body: {
        message: 'Update site content from dashboard', branch: state.branch,
        content: toB64(JSON.stringify(out, null, 2) + '\n'), sha: state.sha
      } });
    }).then(function (res) {
      state.sha = res.content.sha; state.content = normalize(out);
      clearDirty(); renderPortrait();
      setStatus('تم الحفظ ✔ الموقع هيتحدّث خلال دقيقة أو اتنين (اعملي Refresh للموقع).', 'ok');
    }).catch(function (e) { setStatus(explain(e), 'bad'); })
      .then(function () { btn.disabled = false; });
  }

  /* ---------- Google Sheet (bookings + applications) ---------- */
  var STATUS = { 'new': 'جديد', contacted: 'تم التواصل', done: 'تم', cancelled: 'ملغي' };
  function sheetCall(params) {
    var url = (state.content.booking.endpoint || '').trim(), key = $('#bk-key').value.trim();
    if (!url) return Promise.reject(new Error('ضيفي رابط الـ Web App الأول.'));
    if (!key) return Promise.reject(new Error('اكتبي كلمة السر (ADMIN_KEY).'));
    var remembered = false; try { remembered = !!localStorage.getItem('gh_token'); } catch (e) {}
    store('sheet_key', key, remembered);
    params.key = key;
    return fetch(url + '?' + new URLSearchParams(params).toString(), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) throw new Error(j.error === 'unauthorized' ? 'كلمة السر غير صحيحة.' : 'حصل خطأ من Google Sheet (' + (j.error || '؟') + ').');
      return j;
    });
  }
  function fmtTime(iso) { var d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }); }
  function loadSheet(type) {
    var msg = $(type === 'job' ? '#jb-msg' : '#bk-msg'), box = $(type === 'job' ? '#jb-list' : '#bk-list');
    msg.textContent = 'جاري التحميل…';
    sheetCall({ action: 'list', sheet: type }).then(function (j) {
      var rows = j.rows.slice().reverse();
      msg.textContent = rows.length ? 'العدد: ' + rows.length : 'لسه مفيش بيانات.';
      box.textContent = '';
      rows.forEach(function (r) { box.appendChild(sheetRow(type, r)); });
    }).catch(function (e) { msg.textContent = e.message; });
  }
  function sheetRow(type, r) {
    var wa = 'https://wa.me/' + waIntl(r.phone);
    function kv(k, v) { return h('span', {}, [h('b', { text: k }), v || '—']); }
    var lines = type === 'job'
      ? [kv('السن:', r.age), kv('الكلية:', r.faculty), kv('دبلومة تغذية:', r.diploma === 'yes' ? 'نعم' : 'لا'), kv('من الفرع:', r.branch === 'yes' ? 'نعم' : 'لا')]
      : [kv('الخدمة:', r.service), kv('اللغة:', r.lang)];
    var sel = h('select', { onchange: function () {
      sheetCall({ action: 'status', sheet: type, row: String(r.row), status: sel.value }).then(function () { loadSheet(type); }).catch(function (e) { alert(e.message); });
    } }, Object.keys(STATUS).map(function (k) { var o = h('option', { value: k, text: STATUS[k] }); if (k === (r.status || 'new')) o.selected = true; return o; }));
    var kids = [
      h('div', { class: 'item-head' }, [h('b', { text: r.name }), h('span', { class: 'muted', text: fmtTime(r.time) })]),
      h('div', { class: 'row-line' }, [h('span', {}, [h('b', { text: 'الهاتف:' }), h('a', { href: wa, target: '_blank', rel: 'noopener', text: r.phone, dir: 'ltr' })])].concat(lines))
    ];
    if (type === 'job') kids.push(h('p', { class: 'row-line', text: 'الخبرات: ' + (r.experience || '—') }));
    kids.push(h('div', { class: 'row-actions' }, [sel,
      h('button', { class: 'btn danger sm', type: 'button', text: 'حذف', onclick: function () {
        if (confirm('حذف السطر ده نهائيًا من الشيت؟')) sheetCall({ action: 'delete', sheet: type, row: String(r.row) }).then(function () { loadSheet(type); }).catch(function (e) { alert(e.message); });
      } })]));
    return h('div', { class: 'item' }, kids);
  }

  /* ---------- wire up ---------- */
  function init() {
    $('#l-btn').addEventListener('click', connect);
    $('#l-token').addEventListener('keydown', function (e) { if (e.key === 'Enter') connect(); });
    $('#save').addEventListener('click', save);
    $('#logout').addEventListener('click', function () {
      if (state.dirty && !confirm('فيه تغييرات ماتحفظتش. تخرجي برضه؟')) return;
      store('gh_token', null); store('sheet_key', null); state.dirty = false; location.reload();
    });
    $$('.tab').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.tab').forEach(function (x) { x.classList.toggle('on', x === b); });
        $$('[data-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== b.getAttribute('data-tab'); });
      });
    });
    $$('[data-add]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-add');
        state.content.services[k].push({ en: '', ar: '', d: '', arD: '' }); markDirty(); renderServices(k);
      });
    });
    $('#rev-add').addEventListener('click', function () { state.content.testimonials.push({ name: '', text: '', service: '' }); markDirty(); renderReviews(); });
    $('#p-file').addEventListener('change', function (e) { onPortrait(e.target.files && e.target.files[0]); });
    $('#bk-load').addEventListener('click', function () { loadSheet('booking'); });
    $('#jb-load').addEventListener('click', function () { loadSheet('job'); });
    window.addEventListener('beforeunload', function (e) { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });

    var repo = store('gh_repo'); if (repo) $('#l-repo').value = repo;
    var tok = store('gh_token');
    if (tok) { $('#l-token').value = tok; $('#l-remember').checked = !!localStorage.getItem('gh_token'); connect(); }
  }
  init();
})();
