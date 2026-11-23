(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var lang = 'en';
  var rendered = false;      // false until the first full render has finished
  var relayouts = [];        // 3D scenes register their layout() here

  /* ---------------- Translations ----------------
     English is read from the HTML itself (data-t elements).
     Arabic strings for every data-t key live here. */
  var AR = {
    skip: 'تخطَّ إلى المحتوى', logo_sub: 'العافية والتأهيل',
    nav_about: 'عن الدكتورة', nav_services: 'الخدمات', nav_workshops: 'ورش العمل', nav_exp: 'التجربة', nav_journey: 'الرحلة', nav_reviews: 'آراء العملاء', nav_book: 'احجز',
    h_eyebrow: 'مركز د. فاطمة للصحة والعافية',
    h_title: 'غيّر جسمك. <em>وأعد تعريف صحتك.</em>',
    h_lead: 'حلول متكاملة للتغذية والعلاج الطبيعي مصممة حولك أنت.',
    h_cta1: 'احجز استشارتك', h_cta2: 'اكتشف خدماتنا',
    a_q_l: 'المؤهلات', a_q_v: '[ أضف المؤهلات ]', a_e_l: 'الخبرة', a_e_v: '[ سنوات الخبرة ]',
    a_eyebrow: 'عن د. فاطمة', a_title: 'حيث يلتقي العلم بالرعاية المخصصة',
    a_bio_h: 'النبذة المهنية', a_bio_p: '[ مكان مخصص — أضف نبذة عن د. فاطمة هنا. ]',
    a_cert_h: 'الشهادات', a_cert_p: '[ مكان مخصص — أضف الشهادات الحقيقية هنا. ]',
    s_eyebrow: 'تخصصاتنا', s_title: 'التغذية والعلاج الطبيعي، <em>تحت سقف واحد</em>',
    cat_nut: 'التغذية العلاجية', cat_phy: 'العلاج الطبيعي',
    e_eyebrow: 'التجربة', e_title: 'جسمك. رحلتك. <em>تحولك.</em>',
    e1: 'التغذية', e1p: 'اختيارات غذائية تناسب جسمك وأهدافك وحياتك اليومية.',
    e2: 'الحركة', e2p: 'تمارين وحركة موجّهة، خطوة بخطوة.',
    e3: 'التعافي', e3p: 'تأهيل يحترم طريقة شفاء جسمك.',
    e4: 'التوازن', e4p: 'قوام واتزان وروتين تقدر تلتزم به.',
    e5: 'نمط الحياة', e5p: 'عادات تدعم صحتك على المدى الطويل.',
    w_eyebrow: 'لماذا مركز د. فاطمة؟', w_title: 'رعاية مبنية <em>حولك أنت</em>',
    w1: 'خطط علاج مخصصة', w2: 'تغذية قائمة على الأدلة العلمية', w3: 'متابعة فردية',
    w4: 'تغذية وعلاج طبيعي متكاملان', w5: 'رعاية تضع المريض أولاً', w6: 'دعم نمط حياة صحي على المدى الطويل',
    wk_eyebrow: 'ورش العمل والتدريب', wk_title: 'خارج العيادة: <em>نشارك العلم</em>',
    wk_cap: 'من ورشة التغذية العملية',
    wk1_h: 'ورش عمل في التغذية',
    wk1_p: 'ورش عملية تحوّل المعرفة في التغذية إلى نتائج حقيقية: بناء البرامج الغذائية، وقراءة التحاليل، والمكملات الغذائية، والأخطاء الشائعة.',
    wk2_h: 'فرص التدريب والتوظيف',
    wk2_p: 'ورشة تفتح الباب أمام طلاب وخريجي التغذية، بتدريب عملي وفرص عمل في المجال.',
    wk_cta: 'اسأل عن الورش القادمة',
    wk_apply: 'قدّم على التدريب والتوظيف',
    jb_h: 'قدّم على فرصة التدريب والتوظيف',
    jb_r1: 'العمل من مقر الفرع', jb_r2: 'مهارات بيع (Sales)', jb_r3: 'السرعة في تحضير الأنظمة الغذائية',
    jb_name: 'الاسم بالكامل', jb_phone: 'رقم الهاتف', jb_age: 'السن', jb_fac: 'الكلية المتخرج منها',
    jb_dip: 'هل حاصل على دبلومة تغذية؟', jb_branch: 'هل تستطيع العمل من مقر الفرع؟',
    jb_exp: 'الخبرات والمهارات (اذكر أي خبرة في المبيعات)',
    jb_choose: 'اختر', jb_yes: 'نعم', jb_no: 'لا', jb_submit: 'أرسل طلب التقديم',
    j_eyebrow: 'رحلة المريض', j_title: 'أربع خطوات إلى <em>خطة تناسبك</em>',
    j1: 'الاستشارة الأولى', j2: 'تقييم شخصي', j3: 'خطتك الخاصة', j4: 'المتابعة والتقدم',
    t_eyebrow: 'آراء العملاء', t_title: 'ماذا يقول <em>مرضانا</em>',
    t_note: 'محتوى تجريبي — سيتم استبداله بآراء حقيقية من المرضى.',
    t_cta: 'شاركنا تجربتك عبر واتساب',
    c_eyebrow: 'الحجز والتواصل', c_title: 'رحلتك الصحية <em>تبدأ من هنا.</em>',
    c_loc_l: 'الموقع', c_loc_v: 'مدينة العبور، مصر', c_phone_l: 'الهاتف', c_hours_l: 'المواعيد',
    c_wa: 'احجز عبر واتساب', c_map: 'مكان خريطة جوجل',
    f_h: 'طلب حجز موعد', f_name: 'الاسم', f_phone: 'رقم الهاتف', f_service: 'الخدمة', f_submit: 'احجز موعدك',
    ft_logo: 'مكان الشعار — استبدله بالشعار النهائي.', ft_nav: 'التنقل', ft_journey: 'رحلة المريض', ft_contact_link: 'تواصل معنا',
    ft_nut: 'التغذية', ft_phy: 'العلاج الطبيعي', ft_contact: 'تواصل', ft_wa: 'واتساب',
    ft_copy: '© <span id="year"></span> د. فاطمة للعافية والتأهيل. جميع الحقوق محفوظة.',
    wa_float: 'واتساب'
  };

  var UI = {
    en: {
      select: 'Select a service', notSure: 'Not sure yet', optNut: 'Nutrition', optPhy: 'Physiotherapy',
      more: 'Explore More →',
      errName: 'Please enter your name', errPhone: 'Enter a valid phone number', errService: 'Choose a service',
      sent: 'Almost done! WhatsApp is opening with your details — press Send there to complete your booking.',
      webFallback: "WhatsApp didn't open? Use WhatsApp Web",
      errReq: 'Please fill this in', errAge: 'Enter a valid age (16–70)', errChoose: 'Please choose an answer',
      errBranch: 'Working from the branch office is required for this role',
      sentJob: 'Almost done! WhatsApp is opening with your application — press Send there to submit it.',
      sample: 'Sample content', sampleQuote: 'Placeholder testimonial text. Replace with a real patient review.', sampleAuthor: 'Sample patient',
      title: 'Dr. Fatma | Wellness & Rehabilitation — Obour City, Egypt',
      metaDesc: 'Integrated clinical nutrition and physiotherapy in Obour City, Egypt. Personalized plans, evidence-based care and continuous follow-up with Dr. Fatma.',
      btn: 'العربية', btnAria: 'التبديل إلى العربية', mapTitle: 'Map — Obour City'
    },
    ar: {
      select: 'اختر الخدمة', notSure: 'لم أحدد بعد', optNut: 'التغذية', optPhy: 'العلاج الطبيعي',
      more: 'اعرف المزيد ←',
      errName: 'من فضلك اكتب اسمك', errPhone: 'رقم الهاتف غير صحيح', errService: 'اختر الخدمة',
      sent: 'خطوة أخيرة! جارٍ فتح واتساب ببياناتك — اضغطي «إرسال» هناك لإتمام الحجز.',
      webFallback: 'واتساب ماتفتحش؟ افتحي واتساب ويب',
      errReq: 'من فضلك املأ هذا الحقل', errAge: 'اكتب سنًا صحيحًا (16–70)', errChoose: 'من فضلك اختر إجابة',
      errBranch: 'العمل من مقر الفرع شرط أساسي لهذه الوظيفة',
      sentJob: 'خطوة أخيرة! جارٍ فتح واتساب بطلب التقديم — اضغط «إرسال» هناك لإرسال طلبك.',
      sample: 'محتوى تجريبي', sampleQuote: 'نص تجريبي لرأي أحد المرضى. استبدله برأي حقيقي.', sampleAuthor: 'مريض تجريبي',
      title: 'د. فاطمة | العافية والتأهيل — مدينة العبور، مصر',
      metaDesc: 'تغذية علاجية وعلاج طبيعي متكاملان في مدينة العبور، مصر. خطط مخصصة ورعاية قائمة على الأدلة العلمية ومتابعة مستمرة مع د. فاطمة.',
      btn: 'EN', btnAria: 'Switch to English', mapTitle: 'خريطة — مدينة العبور'
    }
  };
  function t(k) { return UI[lang][k]; }

  /* ---------------- Services data ---------------- */
  var nutrition = [
    { en: 'Clinical Nutrition', ar: 'التغذية العلاجية السريرية', d: 'Nutrition assessment and planning built around your medical and personal needs.', arD: 'تقييم غذائي وخطة تغذية مبنية على احتياجاتك الصحية والشخصية.' },
    { en: 'Weight Loss & Obesity Management', ar: 'إنقاص الوزن وعلاج السمنة', d: 'Structured, sustainable programs with regular follow-up.', arD: 'برامج منظمة ومستدامة مع متابعة منتظمة.' },
    { en: 'Weight Gain Programs', ar: 'برامج زيادة الوزن', d: 'Balanced plans to build weight in a healthy way.', arD: 'خطط متوازنة لزيادة الوزن بطريقة صحية.' },
    { en: 'Therapeutic Nutrition', ar: 'التغذية العلاجية', d: 'Dietary support designed to work alongside your treatment.', arD: 'دعم غذائي مصمم ليعمل جنبًا إلى جنب مع علاجك.' },
    { en: 'Sports Nutrition', ar: 'تغذية الرياضيين', d: 'Fueling and recovery plans matched to your training.', arD: 'خطط تغذية واستشفاء تناسب تدريبك.' },
    { en: 'Nutrition for Diabetes', ar: 'التغذية لمرضى السكر', d: 'Practical meal planning to support everyday blood sugar management.', arD: 'تخطيط وجبات عملي يدعم التحكم اليومي في سكر الدم.' },
    { en: 'Nutrition for PCOS', ar: 'التغذية لتكيس المبايض', d: 'Nutrition guidance tailored to women living with PCOS.', arD: 'إرشادات تغذية مخصصة للسيدات المصابات بتكيس المبايض.' },
    { en: 'Nutrition for Pregnancy & Breastfeeding', ar: 'التغذية للحمل والرضاعة', d: 'Nourishing plans for you and your baby through each stage.', arD: 'خطط مغذية لكِ ولطفلك في كل مرحلة.' },
    { en: 'Child Nutrition', ar: 'تغذية الأطفال', d: 'Age-appropriate guidance for healthy growth and eating habits.', arD: 'إرشادات مناسبة للعمر لنمو صحي وعادات أكل سليمة.' },
    { en: 'Personalized Meal Plans', ar: 'خطط وجبات مخصصة', d: 'Meal plans that fit your taste, schedule and goals.', arD: 'خطط وجبات تناسب ذوقك وجدولك وأهدافك.' }
  ];
  var physio = [
    { en: 'Musculoskeletal Rehabilitation', ar: 'تأهيل العضلات والعظام', d: 'Assessment-led rehabilitation for muscles, joints and bones.', arD: 'تأهيل قائم على التقييم للعضلات والمفاصل والعظام.' },
    { en: 'Back & Neck Pain Rehabilitation', ar: 'تأهيل آلام الظهر والرقبة', d: 'Targeted programs to ease strain and restore comfortable movement.', arD: 'برامج موجهة لتخفيف الشد واستعادة الحركة المريحة.' },
    { en: 'Sports Injury Rehabilitation', ar: 'تأهيل الإصابات الرياضية', d: 'Progressive rehab to help you return to activity with confidence.', arD: 'تأهيل تدريجي لمساعدتك على العودة للنشاط بثقة.' },
    { en: 'Post-operative Rehabilitation', ar: 'التأهيل بعد العمليات', d: 'Guided recovery plans following surgery, coordinated with your doctor.', arD: 'خطط تعافٍ موجهة بعد الجراحة بالتنسيق مع طبيبك.' },
    { en: 'Posture Correction', ar: 'تصحيح القوام', d: 'Exercises and habits to improve alignment and daily posture.', arD: 'تمارين وعادات لتحسين القوام والوضعية اليومية.' },
    { en: 'Mobility & Flexibility Programs', ar: 'برامج الحركة والمرونة', d: 'Gentle, structured work to improve range of motion.', arD: 'عمل لطيف ومنظم لتحسين مدى الحركة.' }
  ];

  /* ---------------- Helpers ---------------- */
  var uid = 0;
  function icon(i) {
    var cols = ['#C5A46D', '#789586', '#E8E5DB'];
    var a = cols[i % 3], b = cols[(i + 1) % 3];
    var sides = 3 + (i % 5), pts = [];
    for (var k = 0; k < sides; k++) {
      var ang = k / sides * Math.PI * 2 - Math.PI / 2;
      pts.push((50 + 34 * Math.cos(ang)).toFixed(1) + ',' + (50 + 34 * Math.sin(ang)).toFixed(1));
    }
    var id = 'g' + (uid++);
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs>' +
      '<polygon points="' + pts.join(' ') + '" fill="none" stroke="url(#' + id + ')" stroke-width="2"/>' +
      '<circle cx="50" cy="50" r="' + (10 + (i % 4) * 5) + '" fill="url(#' + id + ')" opacity=".55"/>' +
      '<ellipse cx="50" cy="50" rx="40" ry="' + (12 + (i % 3) * 6) + '" fill="none" stroke="url(#' + id + ')" stroke-width="1.2" transform="rotate(' + (i * 23) + ' 50 50)"/></svg>';
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function isRtl() { return document.documentElement.dir === 'rtl'; }
  function findService(en) {
    var all = nutrition.concat(physio);
    for (var i = 0; i < all.length; i++) if (all[i].en === en) return all[i];
    return null;
  }

  /* reveal-on-scroll (shared observer) */
  var io = null;
  function observe(el, delay) {
    if (reduce || !('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    if (delay) el.style.transitionDelay = delay + 's';
    io.observe(el);
  }

  /* ---------------- Dynamic rendering (re-runs on language change) ---------------- */
  function bindCard(card) {
    if (!coarse && !reduce) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 14).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 14).toFixed(2) + 'deg) translateZ(6px)';
        card.style.setProperty('--mx', (x * 100) + '%');
        card.style.setProperty('--my', (y * 100) + '%');
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    }
    var more = $('.more', card);
    if (more) more.addEventListener('click', function () { $('#f-service').value = more.getAttribute('data-service'); });
  }

  function renderServices() {
    var n = 0; uid = 0;
    function cards(list) {
      return list.map(function (s) {
        var name = lang === 'ar' ? s.ar : s.en;
        var sub = lang === 'ar' ? '' : '<p class="ar" lang="ar">' + s.ar + '</p>';
        var d = lang === 'ar' ? s.arD : s.d;
        return '<article class="card tilt reveal' + (rendered ? ' in' : '') + '">' +
          '<div class="card-visual">' + icon(n++) + '</div>' +
          '<h4>' + esc(name) + '</h4>' + sub +
          '<p class="d">' + d + '</p>' +
          '<a class="more" href="#contact" data-service="' + esc(s.en) + '">' + t('more') + '</a></article>';
      }).join('');
    }
    ['#nutrition-grid', '#physio-grid'].forEach(function (sel, gi) {
      var grid = $(sel);
      grid.innerHTML = cards(gi === 0 ? nutrition : physio);
      $$('.card', grid).forEach(function (c) { bindCard(c); if (!rendered) observe(c); });
    });

    // booking select (keeps the current choice)
    var select = $('#f-service'), cur = select.value;
    function opts(list) { return list.map(function (s) { return '<option value="' + esc(s.en) + '">' + esc(lang === 'ar' ? s.ar : s.en) + '</option>'; }).join(''); }
    select.innerHTML = '<option value="">' + t('select') + '</option>' +
      '<optgroup label="' + t('optNut') + '">' + opts(nutrition) + '</optgroup>' +
      '<optgroup label="' + t('optPhy') + '">' + opts(physio) + '</optgroup>' +
      '<option value="Not sure">' + t('notSure') + '</option>';
    select.value = cur;

    // footer lists
    function links(list) { return list.slice(0, 5).map(function (s) { return '<a href="#services">' + esc(lang === 'ar' ? s.ar : s.en) + '</a>'; }).join(''); }
    $('#foot-nutrition').innerHTML = links(nutrition);
    $('#foot-physio').innerHTML = links(physio);
  }

  function renderTestimonials() {
    var real = (cfg.testimonials || []).filter(function (x) { return x && x.text; });
    var grid = $('#t-grid'), note = $('#t-note'), html = '';
    if (real.length) {
      note.hidden = true;
      html = real.map(function (x) {
        return '<figure class="glass t-card reveal' + (rendered ? ' in' : '') + '"><blockquote>' + esc(x.text) + '</blockquote>' +
          '<figcaption>— ' + esc(x.name || '') + (x.service ? ' <small>· ' + esc(x.service) + '</small>' : '') + '</figcaption></figure>';
      }).join('');
    } else {
      note.hidden = false;
      for (var i = 0; i < 3; i++) {
        html += '<figure class="glass t-card reveal' + (rendered ? ' in' : '') + '"><span class="badge">' + t('sample') + '</span>' +
          '<blockquote>' + t('sampleQuote') + '</blockquote><figcaption>— ' + t('sampleAuthor') + '</figcaption></figure>';
      }
    }
    grid.innerHTML = html;
    if (!rendered) $$('.t-card', grid).forEach(function (c) { observe(c); });
  }

  /* ---------------- Language ---------------- */
  function applyLang(l) {
    lang = l;
    var root = document.documentElement;
    root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr';

    $$('[data-t]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = l === 'ar' ? (AR[el.dataset.t] !== undefined ? AR[el.dataset.t] : el.dataset.en) : el.dataset.en;
    });
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

    document.title = t('title');
    var md = $('meta[name="description"]'); if (md) md.setAttribute('content', t('metaDesc'));
    var btn = $('#lang-btn'); btn.textContent = t('btn'); btn.setAttribute('aria-label', t('btnAria'));
    var iframe = $('#map iframe'); if (iframe) iframe.title = t('mapTitle');

    renderServices();
    renderTestimonials();
    relayouts.forEach(function (fn) { fn(); });

    try { localStorage.setItem('lang', l); } catch (e) {}
  }

  /* ---------------- Config wiring ---------------- */
  var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') || coarse;
  function waNum() { return String(cfg.whatsapp || '').replace(/\D/g, ''); }
  function waUrl(text) {            // universal link: opens the app or WhatsApp Web
    return 'https://wa.me/' + waNum() + '?text=' + encodeURIComponent(text);
  }
  function waWebUrl(text) {
    return 'https://web.whatsapp.com/send?phone=' + waNum() + '&text=' + encodeURIComponent(text);
  }
  function openWa(url) {
    var w = null;
    try { w = window.open(url, '_blank'); } catch (e) {}
    if (w) { try { w.opener = null; } catch (e) {} } else { window.location.href = url; }  // popup blocked -> same tab
  }
  // computers: open the installed WhatsApp desktop app directly (skips the extra web page)
  function openWaDesktopApp(text) {
    var a = document.createElement('a');
    a.href = 'whatsapp://send?phone=' + waNum() + '&text=' + encodeURIComponent(text);
    a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
  }
  function wireConfig() {
    $$('[data-wa]').forEach(function (a) {
      a.href = waUrl('مرحباً دكتورة فاطمة، أود حجز استشارة.');
      a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-wa-workshop]').forEach(function (a) {
      a.href = waUrl('مرحباً، أود الاستفسار عن ورش العمل والتدريب وفرص التوظيف.');
      a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-wa-review]').forEach(function (a) {
      a.href = waUrl('مرحباً، أود مشاركة تجربتي مع مركز د. فاطمة:');
      a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-cfg="phone"]').forEach(function (a) {
      a.textContent = cfg.phoneDisplay || '—';
      if (a.hasAttribute('data-tel')) a.href = 'tel:' + String(cfg.phoneDisplay || '').replace(/[^\d+]/g, '');
    });
    $$('[data-cfg="hours"]').forEach(function (e) { e.textContent = cfg.hours || '—'; });
    if (cfg.mapEmbedUrl) {
      $('#map').innerHTML = '<iframe src="' + esc(cfg.mapEmbedUrl) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe>';
    }
    var soc = cfg.social || {}, box = $('#social');
    [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']].forEach(function (p) {
      var a = document.createElement('a');
      a.textContent = p[1];
      a.href = soc[p[0]] || '#';
      if (soc[p[0]]) { a.target = '_blank'; a.rel = 'noopener'; }
      box.appendChild(a);
    });
  }

  /* ---------------- UI: header, menu, static reveals ---------------- */
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

    $('#lang-btn').addEventListener('click', function () { applyLang(lang === 'ar' ? 'en' : 'ar'); });

    // static reveals (cards and testimonials are observed when rendered)
    $$('.reveal, .reveal-h').forEach(function (el, i) {
      observe(el, el.classList.contains('reveal-h') ? i * 0.12 : 0);
    });

    if (window.gsap && !reduce) {
      window.gsap.from('.hero-copy', { y: 20, duration: 1.1, ease: 'power3.out' });
    }
  }

  /* ---------------- Booking form ---------------- */
  // sends the prepared message to WhatsApp (app on computers / wa.me on phones) and tells the visitor what to do next
  function deliver(msg, status, sentText) {
    status.innerHTML = '';
    if (isMobile) {
      openWa(waUrl(msg));
      status.textContent = sentText;
    } else {
      openWaDesktopApp(msg);
      status.appendChild(document.createTextNode(sentText + ' '));
      var fb = document.createElement('a');
      fb.href = waWebUrl(msg); fb.target = '_blank'; fb.rel = 'noopener';
      fb.textContent = t('webFallback');
      fb.style.textDecoration = 'underline';
      status.appendChild(fb);
    }
  }

  function initForm() {
    var form = $('#booking-form'), status = $('#form-status');
    function setErr(k, m) { $('[data-err="' + k + '"]').textContent = m || ''; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), phone = form.phone.value.trim(), service = form.service.value;
      var digits = phone.replace(/[\s\-+()]/g, '');
      var ok = true;
      setErr('name'); setErr('phone'); setErr('service'); status.textContent = '';
      if (name.length < 2) { setErr('name', t('errName')); ok = false; }
      if (!/^\d{8,15}$/.test(digits)) { setErr('phone', t('errPhone')); ok = false; }
      if (!service) { setErr('service', t('errService')); ok = false; }
      if (!ok) return;
      var svc = findService(service);
      var svcName = svc ? svc.ar + ' (' + svc.en + ')' : 'لم أحدد بعد';
      var msg = 'مرحباً دكتورة فاطمة، أود حجز موعد.\nالاسم: ' + name + '\nالهاتف: ' + phone + '\nالخدمة: ' + svcName;
      deliver(msg, status, t('sent'));
      form.reset();
    });
  }

  function initJobForm() {
    var form = $('#job-form'), status = $('#job-status');
    if (!form) return;
    function setErr(k, m) { $('[data-err="' + k + '"]').textContent = m || ''; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), phone = form.phone.value.trim(), age = parseInt(form.age.value, 10);
      var faculty = form.faculty.value.trim(), exp = form.experience.value.trim();
      var dip = form.diploma.value, branch = form.branch.value;
      var digits = phone.replace(/[\s\-+()]/g, '');
      var ok = true;
      ['j_name', 'j_phone', 'j_age', 'j_fac', 'j_dip', 'j_branch', 'j_exp'].forEach(function (k) { setErr(k); });
      status.textContent = '';
      if (name.length < 2) { setErr('j_name', t('errName')); ok = false; }
      if (!/^\d{8,15}$/.test(digits)) { setErr('j_phone', t('errPhone')); ok = false; }
      if (!(age >= 16 && age <= 70)) { setErr('j_age', t('errAge')); ok = false; }
      if (faculty.length < 2) { setErr('j_fac', t('errReq')); ok = false; }
      if (!dip) { setErr('j_dip', t('errChoose')); ok = false; }
      if (!branch) { setErr('j_branch', t('errChoose')); ok = false; }
      else if (branch === 'no') { setErr('j_branch', t('errBranch')); ok = false; }
      if (exp.length < 3) { setErr('j_exp', t('errReq')); ok = false; }
      if (!ok) return;
      var msg = 'طلب تقديم على فرصة التدريب والتوظيف:\n' +
        'الاسم: ' + name + '\nالهاتف: ' + phone + '\nالسن: ' + age + '\nالكلية: ' + faculty + '\n' +
        'حاصل على دبلومة تغذية: ' + (dip === 'yes' ? 'نعم' : 'لا') + '\n' +
        'يستطيع العمل من مقر الفرع: نعم\n' +
        'الخبرات والمهارات: ' + exp;
      deliver(msg, status, t('sentJob'));
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
      // the text sits on the start side, so the body goes to the opposite side
      body.group.position.x = desktop ? (isRtl() ? -2.4 : 2.4) : 0;
      var s = desktop ? 0.95 : 0.7;
      body.group.scale.set(s, s, s);
    }
    layout(); window.addEventListener('resize', layout); relayouts.push(layout);

    var vis = visibleFlag(canvas), clock = new T.Clock();
    function loop() {
      requestAnimationFrame(loop);
      if (!vis.v) return;
      var tt = reduce ? 0 : clock.getElapsedTime();
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      body.group.rotation.y = tt * 0.3 + mx * 0.5;
      body.group.position.y = 0.1 + Math.sin(tt * 0.9) * 0.1;
      camera.position.x = mx * 0.6; camera.position.y = 0.2 - my * 0.4; camera.lookAt(0, 0, 0);
      floaters.forEach(function (f) {
        var d = f.userData;
        f.position.y = d.base.y + Math.sin(tt * d.sp + d.ph) * 0.35;
        f.position.x = d.base.x + mx * 0.4 * (d.base.z > 0 ? 1 : -1);
        f.rotation.x = tt * d.sp; f.rotation.y = tt * d.sp * 0.7;
      });
      points.rotation.y = tt * 0.02;
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
        // the text column is on the end side, so the body goes to the start side
        var x = desktop ? (isRtl() ? 2.6 : -2.6) : 0;
        body.group.position.x = x; ring.position.x = x; orbit.position.x = x;
        var s = desktop ? 0.8 : 0.6; body.group.scale.set(s, s, s);
        orbit.scale.set(s * 1.1, s * 1.1, s * 1.1); ring.scale.set(s * 1.1, s * 1.1, s * 1.1);
      }
      layout(); window.addEventListener('resize', layout); relayouts.push(layout);

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
        var tt = reduce ? 0 : clock.getElapsedTime();
        body.group.rotation.y = p * Math.PI * 2 + tt * 0.15;
        orbit.rotation.y = -p * Math.PI * 1.5 + tt * 0.1;
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

    if (steps[0]) steps[0].classList.add('active');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { start(); obs.disconnect(); } }, { rootMargin: '300px' });
      obs.observe(section);
    } else { start(); }
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    var saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) {}
    var initial = (saved === 'ar' || saved === 'en') ? saved : (cfg.defaultLang === 'en' ? 'en' : 'ar');

    wireConfig();
    initUI();
    applyLang(initial);   // renders cards/testimonials and sets direction
    rendered = true;
    initForm();
    initJobForm();
    initHero();
    initJourney();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
