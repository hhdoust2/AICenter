# Groq Web

یک وب‌اپ ساده (Next.js) که به شما اجازه می‌دهد با کلید API شخصی خود از پنج قابلیت Groq استفاده کنید:
مدل عمومی (Base)، مترجم، خلاصه‌ساز، چت، و دسته‌بند متن.

## نکته مهم درباره نام مدل‌ها

نام‌هایی مثل `groq/base`، `groq/translator` و... **در API واقعی Groq وجود ندارند** —
این‌ها فقط برچسب داخلی همین اپ هستند. در پشت‌صحنه، هر «مدل» در واقع همان یک
API استاندارد Groq (`chat/completions`) است که با یک مدل واقعی و یک دستور سیستمی
(system prompt) متفاوت اجرا می‌شود. مدل‌های واقعی استفاده‌شده در `lib/models.js`:

| برچسب در اپ     | مدل واقعی Groq             |
|-----------------|-----------------------------|
| Base            | llama-3.3-70b-versatile     |
| Translator      | llama-3.3-70b-versatile     |
| Summarizer      | llama-3.1-8b-instant        |
| Chat            | llama-3.1-8b-instant        |
| Text Classifier | qwen/qwen3-32b              |

لیست مدل‌های فعال Groq ممکن است تغییر کند؛ در صورت نیاز فقط کافی است مقدار
`groqModel` را در `lib/models.js` عوض کنید — بدون نیاز به تغییر بقیه‌ی کد.

## اجرای محلی

```bash
npm install
npm run dev
```

سپس http://localhost:3000 را باز کنید.

## کلید API

کلید API را از https://console.groq.com دریافت کنید. کلید فقط در `localStorage`
مرورگر شما ذخیره می‌شود؛ سرور (route داخل `pages/api/groq.js`) فقط آن را
به‌عنوان یک پراکسی به Groq فوروارد می‌کند و در جایی ذخیره نمی‌کند.

## دیپلوی روی GitHub + Vercel

1. یک ریپازیتوری جدید در GitHub بسازید و این پروژه را push کنید:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
2. به https://vercel.com بروید → "Add New Project" → ریپازیتوری GitHub خود را
   انتخاب کنید. Vercel به‌طور خودکار Next.js را تشخیص می‌دهد؛ نیازی به تنظیم
   Environment Variable نیست چون کلید API از سمت کاربر (مرورگر) ارسال می‌شود.
3. روی Deploy کلیک کنید.

## ربات تلگرام (اختیاری)

این پروژه یک ربات تلگرام هم دارد که در همین ریپازیتوری و همین دیپلوی Vercel اجرا می‌شود.
هر کاربر تلگرام کلید API خودش را با دستور `/setkey` ثبت می‌کند؛ کلید در MongoDB Atlas
ذخیره می‌شود (نه در کد و نه در فایل ثابت).

### ۱. ساخت ربات
در تلگرام به [@BotFather](https://t.me/BotFather) پیام بده، `/newbot` بزن، و توکن ربات را بگیر.

### ۲. ساخت دیتابیس در MongoDB Atlas
1. در https://cloud.mongodb.com یک Cluster رایگان (M0) بساز.
2. از بخش **Database Access** یک کاربر با رمز عبور بساز.
3. از بخش **Network Access** آی‌پی `0.0.0.0/0` را اضافه کن (برای دسترسی از Vercel).
4. از دکمه **Connect → Drivers** رشته اتصال (Connection String) را کپی کن؛ چیزی شبیه:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### ۳. تنظیم متغیرهای محیطی در Vercel
در پنل پروژه روی Vercel → Settings → Environment Variables این‌ها را اضافه کن:

| نام | مقدار |
|---|---|
| `TELEGRAM_BOT_TOKEN` | توکنی که از BotFather گرفتی |
| `TELEGRAM_WEBHOOK_SECRET` | یک رشته تصادفی دلخواه (برای امنیت) |
| `MONGODB_URI` | رشته اتصال Atlas |
| `MONGODB_DB` | (اختیاری) مثلاً `groq_bot` |

بعد از افزودن، پروژه را دوباره Deploy کن تا متغیرها اعمال شوند.

### ۴. ثبت وب‌هوک تلگرام
بعد از دیپلوی، یک بار این دستور را (با مقادیر خودت) اجرا کن تا تلگرام بداند
آپدیت‌ها را به کجا بفرستد:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://<YOUR_VERCEL_DOMAIN>/api/telegram-webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

اگر جواب `"ok":true` گرفتی یعنی ربات فعال است. حالا برو توی تلگرام و به ربات `/start` بزن.

### دستورات ربات

- `/start` — راهنما
- `/setkey <کلید>` — ثبت کلید API (یا فقط `/setkey` بزن و در پیام بعدی کلید را بفرست)
- `/mykey` — نمایش کلید فعلی (پوشیده)
- `/deletekey` — حذف کلید
- `/model` — انتخاب ابزار فعال از بین ۵ گزینه (دکمه‌های شیشه‌ای Inline)
- `/translate` — انتخاب زبان مقصد و سپس ارسال متن/فایل برای ترجمه (نتیجه هم به‌صورت پیام و هم فایل قابل دانلود ارسال می‌شود)
- `/reset` — پاک‌کردن حافظه گفتگوی چت
- ارسال متن یا فایل `.txt` ساده — بر اساس ابزار فعال پردازش می‌شود (پیش‌فرض: Base)

### نکته درباره پاسخ سریع به تلگرام
تلگرام انتظار پاسخ سریع (۲۰۰ OK) از وب‌هوک را دارد. در `pages/api/telegram-webhook.js`
ابتدا فوراً `200 ok` برگردانده می‌شود و پردازش سنگین (فراخوانی Groq) در پس‌زمینه‌ی همان
اجرای تابع ادامه پیدا می‌کند — این روش استاندارد برای Vercel Node.js Functions است.


## ساختار پروژه

```
pages/
  index.js                 صفحه اصلی (هدر + تب‌ها + محتوا)
  api/groq.js                پراکسی سرورلس به Groq API (برای وب‌سایت)
  api/telegram-webhook.js     وب‌هوک ربات تلگرام
components/
  Header.js        مدیریت کلیدهای API (افزودن/انتخاب/حذف)
  TabBar.js         نوار تب‌ها
  Home.js           صفحه اصلی شبیه گوگل + ردیف انتخاب مدل
  Translate.js       تب ترجمه (فایل/متن، دانلود، نوار پیشرفت)
  GenericTool.js    تب‌های خلاصه‌سازی/دسته‌بندی
  ChatBox.js         تب چت (نوار پیام‌های اسکرول‌دار + باکس ورودی ثابت)
lib/
  models.js           تنظیمات ۵ مدل (مشترک بین وب‌سایت و ربات تلگرام)
  useApiKeys.js         هوک مدیریت کلیدها (وب - localStorage)
  callModel.js           فراخوانی API از سمت مرورگر + شبیه‌سازی نوار پیشرفت
  groq.js                 فراخوانی مستقیم Groq از سمت سرور (برای ربات تلگرام)
  telegram.js              توابع کمکی Telegram Bot API
  mongodb.js                اتصال کش‌شده به MongoDB Atlas (برای ربات تلگرام)
```
