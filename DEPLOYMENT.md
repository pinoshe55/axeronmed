# Canlı Deployment Rehberi

## 📋 Ön Gereksinimler

- Node.js 18+ ve npm
- Bir web hosting provider (Vercel, Netlify, Digital Ocean, AWS vb.)
- SMTP email servisi (Gmail, SendGrid, AWS SES vb.)
- Özel domain (isteğe bağlı)

---

## 🚀 Deployment Adımları

### 1. Environment Variables Ayarla

```bash
cp .env.example .env.local
```

`.env.local` dosyasını açıp aşağıdaki değerleri doldur:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=senin-email@gmail.com
SMTP_PASSWORD=uygulama-sifresi
FROM_EMAIL=noreply@axeronmed.com
NEXT_PUBLIC_BASE_URL=https://axeronmed.com
```

### 2. Gmail SMTP Ayarı (Tavsiye Edilen)

1. Gmail hesabında 2FA'yı etkinleştir
2. https://myaccount.google.com/apppasswords adresine git
3. "Uygulama parolaları" kısmından yeni bir parola oluştur
4. SMTP_PASSWORD olarak bunu kullan

### 3. Production Build Oluştur

```bash
npm run build
```

Başarılı bir build sonucu şu çıktıyı görmelisin:
```
✓ Compiled successfully
✓ Generating static pages
```

### 4. Vercel'e Deploy (Tavsiye Edilen)

#### Vercel CLI ile:
```bash
npm i -g vercel
vercel
```

#### Ya da GitHub üzerinden:
1. Repoyu GitHub'a push et
2. https://vercel.com adresine git
3. Repoyu import et
4. Environment variables ekle
5. Deploy et

### 5. Digital Ocean / VPS Deploy

```bash
# Server'a connect
ssh root@your-server-ip

# Node.js kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Projeyi clone et
git clone https://github.com/yourusername/camera-landing.git
cd camera-landing

# Dependencies kur
npm install

# Build et
npm run build

# PM2 ile start et
npm i -g pm2
pm2 start npm --name "axeron" -- start
pm2 save
```

### 6. Nginx Reverse Proxy (VPS için)

```nginx
server {
    listen 80;
    server_name axeronmed.com www.axeronmed.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. SSL Sertifikası (HTTPS)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d axeronmed.com -d www.axeronmed.com
```

---

## ✅ Deployment Kontrol Listesi

### Pre-Deployment
- [ ] `.env.local` oluşturdun ve doldurdun
- [ ] Production build başarılı (`npm run build`)
- [ ] Tüm bağımlılıklar yüklü (`npm install`)
- [ ] SMTP ayarları test ettdin
- [ ] Admin hesabı oluşturdun

### Post-Deployment
- [ ] Website erişilebilir (https://yourdomain.com)
- [ ] SSL sertifikası kurulu (HTTPS çalışıyor)
- [ ] Admin panele giriş yapabiliyor (/admin)
- [ ] Email gönderme test ettdin
- [ ] 3D model yüklüyor ve render oluyor
- [ ] Tüm sayfalar (TR/EN) açılıyor
- [ ] Contact formu email gönderiyor

### Maintenance
- [ ] Haftalık backups alıyorsun
- [ ] Error logs kontrol ediyorsun
- [ ] SSL sertifikası yenilenmesi otomatik (Let's Encrypt)
- [ ] Node.js güncellememelerini takip ediyorsun

---

## 🔧 Admin Panel İlk Kurulum

1. Admin panele giriş: `https://yourdomain.com/admin`
2. Varsayılan şifre: `axeron2024`
3. Şifreyi değiştir (Admin → Kullanıcılar → Parolanızı Değiştirin)
4. Email ayarlarını konfigüre et (Mail Ayarları → SMTP ayarlarını doldur)
5. Test email gönder

---

## 📊 Admin Panel Özellikleri

### Galeri
- Resim ekle/düzenle/sil
- Açıklama ve boyutlandırma
- Aktif/pasif toggle

### İçerik Yönetimi
- Türkçe ve İngilizce metinler
- İstatistik kartları
- SEO meta tagları

### Teknik Ayarlar
- 3D model seçimi ve ölçekleme
- Işık pozisyonu ve yoğunluğu
- Email/SMTP konfigürasyonu

### Kullanıcı Yönetimi
- Admin kullanıcı davet etme
- Rol yönetimi (admin/editor)
- Şifre sıfırlama

---

## 🐛 Troubleshooting

### SMTP Email Hata
```
Error: 535 5.7.8 Username and password not accepted
```
- Gmail 2FA'yı kontrol et
- App password kullandığını doğrula
- SMTP_HOST ve PORT'u kontrol et

### Build Başarısız
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Performance İssueleri
- 3D model dosya boyutunu kontrol et (50MB+ uyarısı alır)
- CDN kullan (Cloudflare, vercel.com edge)
- Image optimization kontrol et

---

## 📞 Support & Maintenance

- Log dosyaları: `/var/log/pm2/` (VPS) veya Vercel dashboard
- Email issues: SMTP ayarlarını kontrol et
- 3D model issues: Browser console'da hataları kontrol et

---

## 🎯 Recommended Services

- **Hosting**: Vercel (Easiest), Digital Ocean (Budget-friendly)
- **Email**: SendGrid, Mailgun (Better deliverability)
- **CDN**: Cloudflare (Free, improves performance)
- **Backups**: AWS S3, Backblaze

---

## 📝 Notlar

- Build işlemi ~2-3 dakika sürer
- First deployment daha uzun sürebilir
- Database değil, localStorage kullanılıyor (Serverless friendly)
- Admin paneli şifresi localStorage'da hash'lenerek saklanıyor
