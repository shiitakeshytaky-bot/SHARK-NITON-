/**
 * Backend لموقع د. فاطمة — Google Apps Script
 *
 * بيستقبل من الموقع: الحجوزات وطلبات التوظيف، ويسجّلهم في Google Sheet (ورقتين: Bookings و Applications).
 * والداشبورد بيقرأهم من هنا بكلمة سر.
 *
 * خطوات الإعداد كاملة في README.md (قسم "ربط Google Sheet").
 *
 * ⚠️ مهم: ضيفي Script Property باسم ADMIN_KEY وقيمتها كلمة سر طويلة من عندك
 *    (Project Settings ← Script properties ← Add script property).
 *    نفس الكلمة هتكتبيها في الداشبورد (تبويب الحجوزات). ماتحطيهاش في أي ملف على GitHub.
 */

var TYPES = {
  booking: { name: 'Bookings',     headers: ['Time', 'Name', 'Phone', 'Service', 'Lang', 'Status'] },
  job:     { name: 'Applications', headers: ['Time', 'Name', 'Phone', 'Age', 'Faculty', 'Diploma', 'Branch', 'Experience', 'Lang', 'Status'] }
};
var STATUSES = ['new', 'contacted', 'done', 'cancelled'];

function sheet_(type) {
  var cfg = TYPES[type];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(cfg.name);
  if (!sh) {
    sh = ss.insertSheet(cfg.name);
    sh.appendRow(cfg.headers);
    sh.getRange(1, 1, 1, cfg.headers.length).setFontWeight('bold');
    sh.getRange(2, 2, 999, cfg.headers.length - 1).setNumberFormat('@');   // نص عادي: الأرقام والعلامات ماتتحولش لمعادلات
    sh.setFrozenRows(1);
  }
  return sh;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// تنضيف النص: منع المعادلات (=,+,-,@) وتقصير الطول
function clean_(v, max) {
  v = String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(v)) v = ' ' + v;
  return v;
}
function phone_(v) { return String(v == null ? '' : v).replace(/[^0-9+]/g, '').slice(0, 20); }

// استقبال حجز / طلب توظيف جديد من الموقع
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var type = d.type === 'job' ? 'job' : 'booking';
    var name = clean_(d.name, 80);
    var phone = phone_(d.phone);
    if (name.length < 2 || phone.replace(/\D/g, '').length < 8) return out_({ ok: false });

    var row;
    if (type === 'job') {
      var age = parseInt(d.age, 10);
      if (!(age >= 14 && age <= 80)) return out_({ ok: false });
      row = [new Date(), name, phone, age, clean_(d.faculty, 100), d.diploma === 'yes' ? 'yes' : 'no',
             d.branch === 'yes' ? 'yes' : 'no', clean_(d.experience, 600), clean_(d.lang, 5), 'new'];
    } else {
      row = [new Date(), name, phone, clean_(d.service, 120), clean_(d.lang, 5), 'new'];
    }
    sheet_(type).appendRow(row);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

// الداشبورد بيستخدم GET مع كلمة السر: عرض / تغيير حالة / حذف
function doGet(e) {
  var p = (e && e.parameter) || {};
  var key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key || p.key !== key) return out_({ ok: false, error: 'unauthorized' });

  var type = p.sheet === 'job' ? 'job' : 'booking';
  var cfg = TYPES[type];
  var sh = sheet_(type);
  var action = p.action || 'list';

  if (action === 'list') {
    var values = sh.getDataRange().getValues();
    var rows = [];
    for (var i = 1; i < values.length; i++) {
      var o = { row: i + 1 };
      for (var c = 0; c < cfg.headers.length; c++) {
        var v = values[i][c];
        o[cfg.headers[c].toLowerCase()] = (v instanceof Date) ? v.toISOString() : String(v == null ? '' : v);
      }
      if (!o.status) o.status = 'new';
      rows.push(o);
    }
    return out_({ ok: true, rows: rows });
  }

  var row = parseInt(p.row, 10);
  if (!row || row < 2 || row > sh.getLastRow()) return out_({ ok: false, error: 'bad_row' });

  if (action === 'status') {
    if (STATUSES.indexOf(p.status) < 0) return out_({ ok: false, error: 'bad_status' });
    sh.getRange(row, cfg.headers.length).setValue(p.status);
    return out_({ ok: true });
  }
  if (action === 'delete') {
    sh.deleteRow(row);
    return out_({ ok: true });
  }
  return out_({ ok: false, error: 'unknown_action' });
}
