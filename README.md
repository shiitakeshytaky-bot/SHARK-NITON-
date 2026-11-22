# Dr. Fatma | Wellness & Rehabilitation — Website

موقع Premium 3D لمركز تغذية وعلاج طبيعي (د. فاطمة — مدينة العبور).
موقع static بالكامل (HTML / CSS / JavaScript) — **مش محتاج build ولا Node**، وبيشتغل مباشرة على GitHub Pages.

## الملفات

| الملف | وظيفته |
|---|---|
| `index.html` | هيكل الصفحة وكل الأقسام |
| `style.css` | التصميم والألوان والـ responsive |
| `main.js` | المجسمات 3D (Three.js) والحركات والفورم والخدمات |
| `config.js` | **الإعدادات اللي لازم تعدّلها** (رقم الواتساب، التليفون، المواعيد، الخريطة، السوشيال) |

## قبل ما تنشر — مهم ⚠️

1. افتح `config.js` وغيّر `whatsapp` للرقم الحقيقي بالصيغة الدولية بدون `+` (مثال: `201012345678`).
2. غيّر `phoneDisplay` و`hours`.
3. (اختياري) ضيف رابط Google Maps Embed في `mapEmbedUrl`، وروابط السوشيال.
4. في `index.html` ابحث عن `[ Add qualifications ]` و`[ Years of experience ]` و`[ Placeholder` واستبدلها ببيانات الدكتورة الحقيقية.
5. التقييمات الموجودة **تجريبية ومكتوب عليها Sample content** — استبدلها بآراء مرضى حقيقية قبل النشر.

## الرفع على GitHub Pages

1. ادخل على GitHub واعمل **New repository** (مثلًا `dr-fatma-website`)، خليه Public.
2. اضغط **Add file → Upload files** واسحب الملفات الخمسة (`index.html` و`style.css` و`main.js` و`config.js` و`README.md`) — لازم يكونوا في الصفحة الرئيسية للـ repo مش جوه فولدر.
3. اضغط **Commit changes**.
4. من **Settings → Pages**: اختار **Branch: main** و **Folder: / (root)** ثم **Save**.
5. بعد دقيقة تقريبًا هيظهر الرابط: `https://USERNAME.github.io/dr-fatma-website/`

## ملاحظات تقنية

- مكتبات Three.js وGSAP بتتحمل من CDN، فالموقع محتاج إنترنت وقت التشغيل.
- لو الجهاز مش بيدعم WebGL أو الـ CDN اتحجب، الموقع بيفضل شغال بخلفية بديلة.
- الحركات بتتقلل تلقائيًا لو المستخدم مفعّل "Reduce motion" في جهازه.
- فورم الحجز بيفتح واتساب برسالة جاهزة فيها الاسم والرقم والخدمة (مفيش سيرفر).
- لو عايز دومين خاص: Settings → Pages → Custom domain.
