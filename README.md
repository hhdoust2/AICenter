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

## ساختار پروژه

```
pages/
  index.js        صفحه اصلی (هدر + تب‌ها + محتوا)
  api/groq.js      پراکسی سرورلس به Groq API
components/
  Header.js        مدیریت کلیدهای API (افزودن/انتخاب/حذف)
  TabBar.js         نوار تب‌ها
  Home.js           صفحه اصلی شبیه گوگل + ردیف انتخاب مدل
  Translate.js       تب ترجمه (فایل/متن، دانلود، نوار پیشرفت)
  GenericTool.js    تب‌های خلاصه‌سازی/چت/دسته‌بندی
lib/
  models.js          تنظیمات ۵ مدل
  useApiKeys.js       هوک مدیریت کلیدها
  callModel.js        فراخوانی API + شبیه‌سازی نوار پیشرفت
```
