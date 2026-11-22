(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- Data ---------------- */
  var nutrition = [
    { en: 'Clinical Nutrition', ar: 'التغذية العلاجية السريرية', d: 'Nutrition assessment and planning built around your medical and personal needs.' },
    { en: 'Weight Loss & Obesity Management', ar: 'إنقاص الوزن وعلاج السمنة', d: 'Structured, sustainable programs with regular follow-up.' },
    { en: 'Weight Gain Programs', ar: 'برامج زيادة الوزن', d: 'Balanced plans to build weight in a healthy way.' },
    { en: 'Therapeutic Nutrition', ar: 'التغذية العلاجية', d: 'Dietary support designed to work alongside your treatment.' },
    { en: 'Sports Nutrition', ar: 'تغذية الرياضيين', d: 'Fueling and recovery plans matched to your training.' },
    { en: 'Nutrition for Diabetes', ar: 'التغذية لمرضى السكر', d: 'Practical meal planning to support everyday blood sugar management.' },
    { en: 'Nutrition for PCOS', ar: 'التغذية لتكيس المبايض', d: 'Nutrition guidance tailored to women living with PCOS.' },
    { en: 'Nutrition for Pregnancy & Breastfeeding', ar: 'التغذية للحمل والرضاعة', d: 'Nourishing plans for you and your baby through each stage.' },
    { en: 'Child Nutrition', ar: 'تغذية الأطفال', d: 'Age-appropriate guidance for healthy growth and eating habits.' },
    { en: 'Personalized Meal Plans', ar: 'خطط وجبات مخصصة', d: 'Meal plans that fit your taste, schedule and goals.' }
  ];
  var physio = [
    { en: 'Musculoskeletal Rehabilitation', ar: 'تأهيل العضلات والعظام', d: 'Assessment-led rehabilitation for muscles, joints and bones.' },
    { en: 'Back & Neck Pain Rehabilitation', ar: 'تأهيل آلام الظهر والرقبة', d: 'Targeted programs to ease strain and restore comfortable movement.' },
    { en: 'Sports Injury Rehabilitation', ar: 'تأهيل الإصابات الرياضية', d: 'Progressive rehab to help you return to activity with confidence.' },
    { en: 'Post-operative Rehabilitation', ar: 'التأهيل بعد العمليات', d: 'Guided recovery plans following surgery, coordinated with your doctor.' },
    { en: 'Posture Correction', ar: 'تصحيح القوام', d: 'Exercises and habits to improve alignment and daily posture.' },
    { en: 'Mobility & Flexibility Programs', ar: 'برامج الحركة والمرونة', d: 'Gentle, structured work to improve range of motion.' }
  ];

  /* ---------------- Helpers ---------------- */
  var uid = 0;
  function icon(i) {
    var cols = ['#C5A46D', '#789586', '#E8E5DB'];
    var a = cols[i % 3], b = cols[(i + 1) % 3];
    var sides = 3 + (i % 5), pts = [];
    for (var k = 0; k < sides; k++) {
      var t = k / sides * Math.PI * 2 - Math.PI / 2;
      pts.push((50 + 34 * Math.cos(t)).toFixed(1) + ',' + (50 + 34 * Math.sin(t)).toFixed(1));
    }
    var id = 'g' + (uid++);
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs>' +
      '<polygon points="' + pts.join(' ') + '" fill="none" stroke="url(#' + id + ')" stroke-width="2"/>' +
      '<circle cx="50" cy="50" r="' + (10 + (i % 4) * 5) + '" fill="url(#' + id + ')" opacity=".55"/>' +
      '<ellipse cx="50" cy="50" rx="40" ry="' + (12 + (i % 3) * 6) + '" fill="none" stroke="url(#' + id + ')" stroke-width="1.2" transform="rotate(' + (i * 23) + ' 50 50)"/></svg>';
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function renderServices() {
    var n = 0;
    function cards(list) {
      return list.map(function (s) {
        return '<article class="card tilt reveal">' +
          '<div class="card-visual">' + icon(n++) + '</div>' +
          '<h4>' + esc(s.en) + '</h4>' +
          '<p class="ar" lang="ar">' + s.ar + '</p>' +
          '<p class="d">' + s.d + '</p>' +
          '<a class="more" href="#contact" data-service="' + esc(s.en) + '">Explore More →</a></article>';
      }).join('');
    }
    $('#nutrition-grid').innerHTML = cards(nutrition);
    $('#physio-grid').innerHTML = cards(physio);

    // select options
    var sel = $('#f-service');
    var html = '<option value="">Select a service · اختر الخدمة</option>';
    html += '<optgroup label="Nutrition · التغذية">' + nutrition.map(function (s) { return '<option>' + esc(s.en) + '</option>'; }).join('') + '</optgroup>';
    html += '<optgroup label="Physiotherapy · العلاج الطبيعي">' + physio.map(function (s) { return '<option>' + esc(s.en) + '</option>'; }).join('') + '</optgroup>';
    html += '<option>Not sure yet · لسه مش متأكد</option>';
    sel.innerHTML = html;

    // footer lists
    $('#foot-nutrition').innerHTML = nutrition.slice(0, 5).map(function (s) { return '<a href="#services">' + esc(s.en) + '</a>'; }).join('');
    $('#foot-physio').innerHTML = physio.slice(0, 5).map(function (s) { return '<a href="#services">' + esc(s.en) + '</a>'; }).join('');
  }

  /* ---------------- Config wiring ---------------- */
  function waUrl(text) {
    return 'https://wa.me/' + String(cfg.whatsapp || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(text);
  }
  function wireConfig() {
    $$('[data-wa]').forEach(function (a) {
      a.href = waUrl('مرحباً دكتورة فاطمة، أود حجز استشارة.');
      a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-cfg="phone"]').forEach(function (a) {
      a.textContent = cfg.phoneDisplay || '—';
      if (a.hasAttribute('data-tel')) a.href = 'tel:' + String(cfg.phoneDisplay || '').replace(/[^\d+]/g, '');
    });
    $$('[data-cfg="hours"]').forEach(function (e) { e.textContent = cfg.hours || '—'; });
    if (cfg.mapEmbedUrl) {
      $('#map').innerHTML = '<iframe src="' + esc(cfg.mapEmbedUrl) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map — Obour City"></iframe>';
    }
    var soc = cfg.social || {}, box = $('#social');
    [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']].forEach(function (p) {
      var a = document.createElement('a');
      a.textContent = p[1];
      a.href = soc[p[0]] || '#';
      if (soc[p[0]]) { a.target = '_blank'; a.rel = 'noopener'; }
      box.appendChild(a);
    });
    $('#year').textContent = new Date().getFullYear();
  }

  /* ---------------- UI: header, menu, reveals, tilt ---------------- */
  function initUI() {
    var header = $('.site-header'), nav = $('#nav'), btn = $('.menu-btn');
    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 30); }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      header.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open);
    });
    $$('#nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open'); header.classList.remove('menu-open'); btn.setAttribute('aria-expanded', 'false');
      });
    });

    // reveals
    var els = $$('.reveal, .reveal-h');
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (el, i) {
        if (el.classList.contains('reveal-h')) el.style.transitionDelay = (i * 0.12) + 's';
        io.observe(el);
      });
    } else {
      els.forEach(function (el) { el.classList.add('in'); });
    }

    // tilt
    if (!coarse && !reduce) {
      $$('.tilt').forEach(function (card) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 14).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 14).toFixed(2) + 'deg) translateZ(6px)';
          card.style.setProperty('--mx', (x * 100) + '%');
          card.style.setProperty('--my', (y * 100) + '%');
        });
        card.addEventListener('pointerleave', function () { card.style.transform = ''; });
      });
    }

    // "Explore More" -> preselect service
    $$('.more').forEach(function (a) {
      a.addEventListener('click', function () { $('#f-service').value = a.getAttribute('data-service'); });
    });

    // GSAP hero intro (optional)
    if (window.gsap && !reduce) {
      window.gsap.from('.hero-copy', { y: 20, duration: 1.1, ease: 'power3.out' });
    }
  }

  /* ---------------- Booking form ---------------- */
  function initForm() {
    var form = $('#booking-form'), status = $('#form-status');
    function setErr(k, m) { $('[data-err="' + k + '"]').textContent = m || ''; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), phone = form.phone.value.trim(), service = form.service.value;
      var digits = phone.replace(/[\s\-+()]/g, '');
      var ok = true;
      setErr('name'); setErr('phone'); setErr('service'); status.textContent = '';
      if (name.length < 2) { setErr('name', 'Please enter your name · من فضلك اكتب اسمك'); ok = false; }
      if (!/^\d{8,15}$/.test(digits)) { setErr('phone', 'Enter a valid phone number · رقم هاتف غير صحيح'); ok = false; }
      if (!service) { setErr('service', 'Choose a service · اختر الخدمة'); ok = false; }
      if (!ok) return;
      var msg = 'مرحباً دكتورة فاطمة، أود حجز موعد.\nالاسم: ' + name + '\nالهاتف: ' + phone + '\nالخدمة: ' + service;
      window.open(waUrl(msg), '_blank', 'noopener');
      status.textContent = 'Opening WhatsApp to confirm your request… · جاري فتح واتساب لتأكيد طلبك';
      form.reset();
    });
  }

  /* ---------------- 3D ---------------- */
  function buildBody(T, wireColor) {
    var g = new T.Group();
    var solid = new T.MeshStandardMaterial({ color: 0x173D32, metalness: 0.5, roughness: 0.35, transparent: true, opacity: 0.88 });
    var wire = new T.MeshBasicMaterial({ color: wireColor, wireframe: true, transparent: true, opacity: 0.32 });
    function part(geo, x, y, z, rz, sx, sy, sz) {
      var m = new T.Mesh(geo, solid);
      m.position.set(x, y, z); m.rotation.z = rz || 0; m.scale.set(sx || 1, sy || 1, sz || 1);
      m.add(new T.Mesh(geo, wire));
      g.add(m);
    }
    part(new T.SphereGeometry(0.34, 24, 18), 0, 1.95, 0, 0, 0.9, 1.1, 0.95);
    part(new T.CylinderGeometry(0.12, 0.15, 0.3, 14), 0, 1.58, 0);
    part(new T.CylinderGeometry(0.56, 0.38, 1.35, 24), 0, 0.85, 0, 0, 1, 1, 0.62);
    part(new T.SphereGeometry(0.42, 20, 14), 0, 0.12, 0, 0, 1, 0.7, 0.7);
    [-1, 1].forEach(function (s) {
      part(new T.SphereGeometry(0.17, 14, 12), s * 0.62, 1.35, 0);
      part(new T.CylinderGeometry(0.1, 0.085, 0.85, 12), s * 0.8, 0.88, 0, s * 0.12);
      part(new T.CylinderGeometry(0.085, 0.06, 0.8, 12), s * 0.92, 0.12, 0, s * 0.07);
      part(new T.SphereGeometry(0.09, 10, 10), s * 0.96, -0.33, 0);
      part(new T.CylinderGeometry(0.2, 0.14, 1.15, 16), s * 0.22, -0.78, 0);
      part(new T.CylinderGeometry(0.13, 0.09, 1.05, 14), s * 0.22, -1.9, 0);
      part(new T.SphereGeometry(0.16, 12, 10), s * 0.22, -2.5, 0.08, 0, 1, 0.6, 1.5);
    });
    g.position.y = 0.1;
    return { group: g, wire: wire, solid: solid };
  }

  function makeRenderer(canvas, T) {
    var r;
    try { r = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return null; }
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    return r;
  }
  function fit(renderer, camera, canvas) {
    var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    return w;
  }
  function lights(T, scene) {
    scene.add(new T.AmbientLight(0xffffff, 0.45));
    var gold = new T.PointLight(0xC5A46D, 1.3, 30); gold.position.set(4, 4, 5); scene.add(gold);
    var green = new T.PointLight(0x3fd0a0, 1.1, 30); green.position.set(-5, 1, 4); scene.add(green);
  }
  function visibleFlag(el) {
    var state = { v: true };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { state.v = en[0].isIntersecting; }).observe(el);
    }
    return state;
  }

  function initHero() {
    var canvas = $('#hero-canvas');
    var T = window.THREE;
    if (!T) { document.body.classList.add('no-3d'); return; }
    var renderer = makeRenderer(canvas, T);
    if (!renderer) { document.body.classList.add('no-3d'); return; }

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.2, 8.5);
    lights(T, scene);

    var body = buildBody(T, 0x3fd0a0);
    scene.add(body.group);

    var floaters = [];
    var geos = [new T.IcosahedronGeometry(0.28, 1), new T.SphereGeometry(0.24, 18, 14), new T.TorusGeometry(0.26, 0.07, 12, 28), new T.OctahedronGeometry(0.28)];
    var mats = [
      new T.MeshStandardMaterial({ color: 0xC5A46D, metalness: 0.8, roughness: 0.25 }),
      new T.MeshStandardMaterial({ color: 0x789586, metalness: 0.3, roughness: 0.5 }),
      new T.MeshStandardMaterial({ color: 0x2f8f6b, metalness: 0.4, roughness: 0.35 })
    ];
    for (var i = 0; i < 16; i++) {
      var m = new T.Mesh(geos[i % 4], mats[i % 3]);
      var ang = (i / 16) * Math.PI * 2, rad = 3 + Math.random() * 2.2;
      m.position.set(Math.cos(ang) * rad, (Math.random() - 0.5) * 5, -1 + Math.sin(ang) * 2.5);
      m.userData = { base: m.position.clone(), sp: 0.4 + Math.random() * 0.8, ph: Math.random() * 6.28 };
      scene.add(m); floaters.push(m);
    }

    var pCount = 260, pPos = new Float32Array(pCount * 3);
    for (var p = 0; p < pCount; p++) { pPos[p * 3] = (Math.random() - 0.5) * 16; pPos[p * 3 + 1] = (Math.random() - 0.5) * 10; pPos[p * 3 + 2] = (Math.random() - 0.5) * 8; }
    var pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pPos, 3));
    var points = new T.Points(pg, new T.PointsMaterial({ color: 0xC5A46D, size: 0.035, transparent: true, opacity: 0.7 }));
    scene.add(points);

    var mx = 0, my = 0, tx = 0, ty = 0;
    if (!coarse) window.addEventListener('pointermove', function (e) { tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

    function layout() {
      var w = fit(renderer, camera, canvas);
      var desktop = w > 900;
      body.group.position.x = desktop ? 2.4 : 0;
      var s = desktop ? 0.95 : 0.7;
      body.group.scale.set(s, s, s);
    }
    layout(); window.addEventListener('resize', layout);

    var vis = visibleFlag(canvas), clock = new T.Clock();
    function loop() {
      requestAnimationFrame(loop);
      if (!vis.v) return;
      var t = reduce ? 0 : clock.getElapsedTime();
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      body.group.rotation.y = t * 0.3 + mx * 0.5;
      body.group.position.y = 0.1 + Math.sin(t * 0.9) * 0.1;
      camera.position.x = mx * 0.6; camera.position.y = 0.2 - my * 0.4; camera.lookAt(0, 0, 0);
      floaters.forEach(function (f) {
        var d = f.userData;
        f.position.y = d.base.y + Math.sin(t * d.sp + d.ph) * 0.35;
        f.position.x = d.base.x + mx * 0.4 * (d.base.z > 0 ? 1 : -1);
        f.rotation.x = t * d.sp; f.rotation.y = t * d.sp * 0.7;
      });
      points.rotation.y = t * 0.02;
      renderer.render(scene, camera);
    }
    loop();
  }

  function initJourney() {
    var canvas = $('#journey-canvas'), section = $('#experience');
    var T = window.THREE;
    if (!T || !canvas) return;
    var steps = $$('.exp-steps li');
    var colors = [0x6fcf97, 0xC5A46D, 0x3fd0a0, 0x9fb8aa, 0xE8E5DB];
    var started = false;

    function start() {
      if (started) return; started = true;
      var renderer = makeRenderer(canvas, T);
      if (!renderer) return;
      var scene = new T.Scene();
      var camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0.2, 9);
      lights(T, scene);

      var body = buildBody(T, colors[0]);
      scene.add(body.group);

      var orbit = new T.Group(); scene.add(orbit);
      var items = colors.map(function (c, i) {
        var m = new T.Mesh(new T.SphereGeometry(0.2, 20, 16), new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.35 }));
        var a = i / colors.length * Math.PI * 2;
        m.position.set(Math.cos(a) * 2.6, (i - 2) * 0.9, Math.sin(a) * 2.6);
        orbit.add(m); return m;
      });
      var ring = new T.Mesh(new T.TorusGeometry(2.6, 0.012, 8, 90), new T.MeshBasicMaterial({ color: 0xC5A46D, transparent: true, opacity: 0.4 }));
      ring.rotation.x = Math.PI / 2; scene.add(ring);

      function layout() {
        var w = fit(renderer, camera, canvas);
        var desktop = w > 820;
        body.group.position.x = desktop ? -2.6 : 0; ring.position.x = orbit.position.x = body.group.position.x;
        var s = desktop ? 0.8 : 0.6; body.group.scale.set(s, s, s);
        orbit.scale.set(s * 1.1, s * 1.1, s * 1.1); ring.scale.set(s * 1.1, s * 1.1, s * 1.1);
      }
      layout(); window.addEventListener('resize', layout);

      var target = new T.Color(colors[0]);
      var vis = visibleFlag(canvas), clock = new T.Clock(), prev = -1;
      function loop() {
        requestAnimationFrame(loop);
        if (!vis.v) return;
        var r = section.getBoundingClientRect();
        var p = Math.min(Math.max(-r.top / Math.max(r.height - innerHeight, 1), 0), 0.999);
        var idx = Math.floor(p * 5);
        if (idx !== prev) {
          prev = idx;
          steps.forEach(function (li, i) { li.classList.toggle('active', i === idx); });
          target.setHex(colors[idx]);
        }
        var t = reduce ? 0 : clock.getElapsedTime();
        body.group.rotation.y = p * Math.PI * 2 + t * 0.15;
        orbit.rotation.y = -p * Math.PI * 1.5 + t * 0.1;
        body.wire.color.lerp(target, 0.06);
        items.forEach(function (m, i) {
          var s = i === idx ? 1.9 : 1;
          m.scale.x += (s - m.scale.x) * 0.1; m.scale.y = m.scale.z = m.scale.x;
          m.material.emissiveIntensity = i === idx ? 1 : 0.3;
        });
        renderer.render(scene, camera);
      }
      loop();
    }

    // first step active before 3D loads
    if (steps[0]) steps[0].classList.add('active');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { start(); io.disconnect(); } }, { rootMargin: '300px' });
      io.observe(section);
    } else { start(); }
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    renderServices();
    wireConfig();
    initUI();
    initForm();
    initHero();
    initJourney();
  }
  // scripts are deferred, but make sure THREE has loaded
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
