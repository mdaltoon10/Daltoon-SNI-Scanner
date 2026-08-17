# 🚀 Daltoon SNI Scanner & Native Xray-Core Engine

<div align="center">

![Daltoon Banner](https://img.shields.io/badge/Daltoon-SNI%20Scanner-blueviolet?style=for-the-badge&logo=shield)
![Node.js](https://img.shields.io/badge/Node.js-v20+-green?style=for-the-badge&logo=nodedotjs)
![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react)
![Xray-Core](https://img.shields.io/badge/Xray--Core-v1.8+-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**اسکنر حرفه‌ای و فوق‌سریع SNI و دامنه پاک همراه با موتور بومی Xray-core، بنچمارک واقعی سرعت و تشخیص هوشمند اپراتورهای شبکه ایران**

</div>

---

## 📖 درباره پروژه (About Daltoon SNI Scanner)

سامانه **Daltoon SNI Scanner** یک ابزار تحت وب پیشرفته، مدرن و جامع برای اسکن، تست تاخیر (Ping)، سنجش پهنای باند (Download & Upload) و شناسایی دامنه‌ها و SNIهای پاک روی شبکه‌های مختلف اینترنت در ایران است. این پروژه به همراه **موتور بومی Xray-Core** و قابلیت تشخیص دقیق اپراتور به سبک **Speedtest** طراحی شده است.

---

## ✨ ویژگی‌های برجسته (Key Features)

- ⚡ **اسکنر فوق سریع SNI با موتور بومی Xray-Core:** تست واقعی دست‌تکانی TLS و فرآیند اتصال از طریق هسته بومی Xray.
- 📡 **تشخیص هوشمند و خودکار اپراتور (Speedtest Auto-Detection):** شناسایی دقیق شبکه متصل (همراه اول، ایرانسل، رایتل، مخابرات، شاتل) بر اساس دیتابیس بومی IP Range.
- 📊 **تست سرعت واقعی دانلود و آپلود (Speed Test Benchmark):** محاسبه دقیق پهنای باند (Mbps)، پینگ واقعی و درصد اتلاف پکت.
- 🧩 **بهینه‌ساز فرگمنت و MTU (Fragment & MTU Optimizer):** محاسبه خودکار بهترین اندازه پکت برای دور زدن اختلالات و فیلترینگ منطقه‌ای.
- 📋 **تست‌کننده و پارسر کامل کانفیگ‌های VPN:** پشتیبانی از لینک‌های `vless://`, `vmess://`, `trojan://`, `shadowsocks://` با قابلیت اعمال دامنه پاک و دانلود کانفیگ بهینه‌شده.
- 📋 **دکمه چسباندن سریع (Fast Paste):** چسباندن خودکار کانفیگ و متن کپی شده تنها با یک کلیک.
- 🌙 **رابط کاربری مدرن و واکنش‌گرا:** پشتیبانی کامل از زبان فارسی و انگلیسی، حالت دارک چشم‌نواز و سازگار با تمامی گوشی‌ها و مرورگرها.

---

## 🚀 دستور نصب سریع روی سرور (One-Line Automated Install)

شما می‌توانید کل پروژه را با **یک دستور ساده** روی سرور لینوکس (Ubuntu / Debian / CentOS) نصب و اجراء کنید:

```bash
bash <(curl -sSL https://raw.githubusercontent.com/mdaltoon10/Daltoon-SNI-Scanner/main/install.sh)
```

> 💡 **تغییر پورت نصب:** پورت پیش‌فرض پروژه **8100** است. اگر می‌خواهید برنامه روی پورت دیگری (مثلاً 8080) اجرا شود، پورت را در انتهای دستور وارد کنید:
```bash
bash <(curl -sSL https://raw.githubusercontent.com/mdaltoon10/Daltoon-SNI-Scanner/main/install.sh) 8080
```

---

## 🔄 دستور آپدیت سریع داشبورد (One-Line Update)

برای آپدیت خودکار داشبورد به آخرین نسخه و اعمال تمام تغییرات جدید، کافیست دستور تک‌خطی زیر را روی سرور خود اجرا کنید:

```bash
bash <(curl -sSL https://raw.githubusercontent.com/mdaltoon10/Daltoon-SNI-Scanner/main/update.sh)
```

این دستور به صورت خودکار آخرین تغییرات را از گیت‌هاب دریافت کرده، وابستگی‌ها را بروزرسانی، نسخه جدید را بیلد و سرویس PM2 را مجدداً راه‌اندازی می‌کند.

---

## 🐳 نصب با داکر (Docker & Docker Compose)

اگر از داکر روی سرور استفاده می‌کنید، اجرای برنامه به سادگی زیر است:

```bash
# 1. کلون کردن ریپازیتوری
git clone https://github.com/mdaltoon10/Daltoon-SNI-Scanner.git
cd Daltoon-SNI-Scanner

# 2. اجرا با داکر کامپوز
docker-compose up -d --build
```

پس از اجرا، داشبورد روی پورت `8100` سرور در دسترس خواهد بود: `http://SERVER_IP:8100`

---

## 🛠 راهنمای نصب دستی روی سرور (Manual Server Setup)

### ۱. پیش‌نیازها
- Node.js نسخه 20 به بالا
- Git
- مدیریت پروسه PM2

```bash
# نصب Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# نصب PM2
npm install -g pm2
```

### ۲. دریافت و ساخت پروژه
```bash
# کلون ریپازیتوری
git clone https://github.com/mdaltoon10/Daltoon-SNI-Scanner.git
cd Daltoon-SNI-Scanner

# نصب پکیج‌ها
npm install

# ساخت نسخه پروداکشن
npm run build
```

### ۳. اجرا با PM2
```bash
# اجرای برنامه روی پورت 8100
PORT=8100 pm2 start dist/server.cjs --name "daltoon-sni-scanner" --env PORT=8100

# باز کردن پورت 8100 در فایروال
ufw allow 8100/tcp

# ذخیره تنظیمات برای اجرای خودکار هنگام ریبوت سرور
pm2 save
pm2 startup
```

---

## 📊 دستورات مدیریت PM2

| دستور | توضیحات |
| :--- | :--- |
| `pm2 status daltoon-sni-scanner` | مشاهده وضعیت اجرای برنامه |
| `pm2 logs daltoon-sni-scanner` | مشاهده لوگ‌ها و خطاهای زنده |
| `pm2 restart daltoon-sni-scanner` | ری‌استارت کردن سرویس |
| `pm2 stop daltoon-sni-scanner` | متوقف کردن سرویس |

---

## ⚙️ متغیرهای محیطی (.env)

یک فایل نمونه `.env.example` در پروژه قرار دارد:

```env
PORT=8100
NODE_ENV=production
```

---

## 🚨 عیب‌یابی خطای ERR_CONNECTION_REFUSED (عدم اتصال به داشبورد)

اگر پس از نصب، لینک `http://SERVER_IP:8100` باز نشد:

۱. **باز کردن پورت 8100 در فایروال سرور (Firewall):**
```bash
ufw allow 8100/tcp
iptables -I INPUT 1 -p tcp --dport 8100 -j ACCEPT
```
*(اگر از پنل‌های ابری مانند Hetzner, Arvan, GCP, DigitalOcean استفاده می‌کنید، حتماً پورت 8100 را در بخش Firewall پنل ابری سرور باز کنید).*

۲. **بررسی وضعیت برنامه با PM2:**
```bash
pm2 status daltoon-sni-scanner
pm2 logs daltoon-sni-scanner
```

---

## 📄 لایسنس (License)

این پروژه تحت لایسنس **MIT** منتشر شده است. استفاده و توسعه آن برای عموم آزاد است.

---

<div align="center">

Developed with ❤️ by **Daltoon Team**

</div>
