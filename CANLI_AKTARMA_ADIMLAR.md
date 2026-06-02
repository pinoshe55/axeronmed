# 📋 CANLI AKTARMA - ADIM ADIM REHBER

Bu rehberi sırasıyla takip et. Her adımı tamamladıktan sonra alttaki adıma geç.

---

## **ADIM 1: Yerel Bilgisayarda Hazırlık**

### 1.1 - Environment Dosyasını Oluştur
```bash
cd C:\Users\Ercan Uzuner\Desktop\camera-landing
cp .env.example .env.local
```

### 1.2 - .env.local Dosyasını Doldur
`.env.local` dosyasını bir metin editörü ile aç ve şunları doldur:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=senin-email@gmail.com
SMTP_PASSWORD=google-uygulama-sifresi
FROM_EMAIL=noreply@axeronmed.com
NEXT_PUBLIC_BASE_URL=https://senin-domain.com
```

**Gmail SMTP Alma (Gerekli):**
1. Gmail hesabına giriş yap
2. https://myaccount.google.com/apppasswords açılır
3. "Uygulama parolaları" seç → "Uygulama parolaları" oluştur
4. Üretilen 16 karakterlik şifreyi kopyala → SMTP_PASSWORD olarak yapıştır

### 1.3 - Production Build Oluştur
```bash
npm run build
```

**Beklenen sonuç:**
```
✓ Compiled successfully
✓ Generating static pages (7/7)
```

Eğer hata alırsan, bu rehberi oku ve sorunu çöz. İlerleme yapmıyor isen durmadan.

---

## **ADIM 2: Admin Panel İlk Konfigürasyonu (Yerel)**

Dev server'ı başlat:
```bash
npm run dev
```

Tarayıcıda aç: `http://localhost:3000/admin`

### 2.1 - Admin Girişi
- Şifre gir: `axeron2024`
- "Giriş Yap" butonuna tıkla

### 2.2 - Şifreyi Değiştir
1. "Kullanıcılar" sekmesine git
2. "Parolanızı Değiştirin" bölümünde:
   - Mevcut parola: `axeron2024`
   - Yeni parola: Güçlü bir parola belirle
   - Tekrar: Aynı parolayı gir
   - "Parolayı Değiştir" butonuna tıkla

### 2.3 - Email Ayarlarını Test Et
1. "Mail Ayarları" sekmesine git
2. Tüm SMTP bilgilerini doldur (yukarıda aldığın Gmail bilgileri)
3. "Test Gönder" butonuna tıkla
4. Başarılı olursa devam et

**Test başarılı değilse:**
- SMTP bilgilerini kontrol et
- Gmail 2FA aktif mi kontrol et
- App password doğru mu kontrol et

### 2.4 - Galeri Resimlerini Ekle
1. "Galeri" sekmesine git
2. Resimler ekle (JPG, PNG)
3. Açıklama ekle (opsiyonel)
4. "Galeriyi Kaydet" butonuna tıkla

### 2.5 - İçeriği Doldur
**Türkçe:**
1. "Metinler (TR)" sekmesine git
2. Başlıklar, açıklamalar, vb. doldur
3. "Metinleri Kaydet" butonuna tıkla

**İngilizce:**
1. "Texts (EN)" sekmesine git
2. İngilizce metinleri doldur
3. "Kaydet" butonuna tıkla

### 2.6 - 3D Model Ayarı
1. "3D Model" sekmesine git
2. Model seç (camera.glb opsiyonel)
3. Ölçekleme ve ışık ayarlarını yap
4. "3D Model Ayarlarını Kaydet" butonuna tıkla

### 2.7 - SEO Ayarlarını Doldur
**Türkçe SEO:**
1. "SEO Ayarları" sekmesine git
2. "Türkçe SEO" bölümünde:
   - Sayfa Başlığı: `Axeron Medical - Sterilizasyon Konteyner Sistemleri`
   - Sayfa Açıklaması: Kısa açıklama (160 karakter max)
   - Anahtar Kelimeler: `sterilizasyon, konteyner, tıbbi, hastane`
3. OG (Open Graph) bilgilerini doldur (opsiyonel)
4. "Kaydet" butonuna tıkla

**İngilizce SEO:**
1. "English SEO" bölümünde aynısını yap
2. "Kaydet" butonuna tıkla

---

## **ADIM 3: Hosting Seç ve Hazırla**

### 3A - VERCEL'E DEPLOY (En Kolay - Tavsiye Edilen)

#### 3A.1 - GitHub'a Push Et
```bash
git add .
git commit -m "Production ready"
git push origin main
```

#### 3A.2 - Vercel'e Bağla
1. https://vercel.com adresine git
2. "Sign Up" yap (GitHub ile)
3. "Add New..." → "Project" seç
4. Repository seç ve import et
5. Environment Variables ekle:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=email@gmail.com
   SMTP_PASSWORD=parola
   FROM_EMAIL=noreply@axeronmed.com
   NEXT_PUBLIC_BASE_URL=https://domain.com
   ```
6. "Deploy" butonuna tıkla
7. Deployment bitene kadar bekle (~5-10 dakika)

#### 3A.3 - Domain Bağla (Eğer varsa)
1. Vercel dashboard'da "Settings" → "Domains"
2. Domain adını gir
3. DNS ayarlarını yap (Vercel'in söylediği gibi)

---

### 3B - VPS'E DEPLOY (Digital Ocean, Hetzner, vb.)

#### 3B.1 - Server Oluştur
1. Digital Ocean / Hetzner'e git
2. Ubuntu 22.04 LTS server oluştur
3. Root password al

#### 3B.2 - SSH ile Bağlan
```bash
ssh root@server-ip-adresi
```

#### 3B.3 - Node.js Kur
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

#### 3B.4 - Projeyi Klonla
```bash
cd /home
git clone https://github.com/senin-username/camera-landing.git
cd camera-landing
```

#### 3B.5 - .env.local Oluştur
```bash
nano .env.local
```

İçerisine şunları yapıştır:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASSWORD=parola
FROM_EMAIL=noreply@axeronmed.com
NEXT_PUBLIC_BASE_URL=https://domain.com
```

Kaydet: `CTRL + X` → `Y` → `ENTER`

#### 3B.6 - Dependencies ve Build
```bash
npm install
npm run build
```

#### 3B.7 - PM2 ile Çalıştır
```bash
npm install -g pm2
pm2 start npm --name "axeron" -- start
pm2 save
pm2 startup
```

#### 3B.8 - Nginx Setup (Opsiyonel - Tavsiye)
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

İçerisine şunları yapıştır:
```nginx
server {
    listen 80;
    server_name domain.com www.domain.com;
    
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

Kaydet: `CTRL + X` → `Y` → `ENTER`

Restart:
```bash
sudo systemctl restart nginx
```

#### 3B.9 - SSL Certificate (HTTPS)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d domain.com -d www.domain.com
```

---

## **ADIM 4: Canli Kontrolü**

Deployment yöntemi ne olursa olsun, şu kontrolleri yap:

### 4.1 - Website Erişilebilir mi?
```
https://domain.com
```
Tarayıcıda açıp sayfayı görebiliyor musun?

### 4.2 - Admin Panele Gir
```
https://domain.com/admin
```
- Yeni şifre ile giriş yap
- Giriş başarılı mı?

### 4.3 - Email Test Et
Admin panelinden "Mail Ayarları" → "Test Gönder" butonuna tıkla
- Email alıp almadığını kontrol et

### 4.4 - Contact Form Test Et
Ana sayfada contact form doldur ve gönder
- Admin e-mail alıyor mu?
- Sender confirmation email alıyor mu?

### 4.5 - 3D Model Render
Ana sayfa açılıyor ve 3D kamera model görünüyor mu?

### 4.6 - SSL/HTTPS
```
https://domain.com
```
Kilit ikonu görünüyor mu? (Güvenli bağlantı)

---

## **ADIM 5: Son Kontroller**

### 5.1 - Tüm Sayfalar
- [ ] Ana sayfa (https://domain.com)
- [ ] Admin paneli (https://domain.com/admin)
- [ ] KVKK sayfası (https://domain.com/kvkk)
- [ ] Email verification (https://domain.com/verify)

### 5.2 - Responsive Design
- [ ] Mobil telefonda açılıyor mu?
- [ ] Tablet'te görünüyor mu?
- [ ] Desktop normal görünüyor mu?

### 5.3 - Türkçe/İngilizce
- [ ] Türkçe sayfası çalışıyor mu?
- [ ] İngilizce sayfası çalışıyor mu?

### 5.4 - Browser Console
F12 açıp console'da hata var mı? (Hata olmamalı)

---

## **ADIM 6: Maintenance Kurulum (Opsiyonel)**

### 6.1 - Backups
VPS kullanuyor isen haftalık backup al:
```bash
crontab -e
```

Ekle:
```
0 2 * * 0 tar -czf /backups/camera-landing-$(date +\%Y-\%m-\%d).tar.gz /home/camera-landing
```

### 6.2 - Logs
```bash
pm2 logs axeron
```

---

## **ADIM 7: Tamamlandı!**

✅ Kontrol listesini tamamla:
- [ ] Build başarılı
- [ ] Admin girişi çalışıyor
- [ ] Email gönderiliyor
- [ ] 3D model render oluyor
- [ ] HTTPS aktif
- [ ] Tüm sayfalar açılıyor

**Tebrikler! Website canlıda! 🎉**

---

## **Hızlı Referans - Sık Yapılan İşler**

### Admin Şifresini Unuttum
```bash
# VPS'de
cd /home/camera-landing
node -e "
const { loadOverrides, saveOverrides } = require('./lib/siteOverrides');
const o = loadOverrides();
o.adminUsers = [];
saveOverrides(o);
console.log('Admin kullanıcıları sıfırlandı. Yerel ortamda yeniden başla.');
"
```

### Email Gönderemiyor
1. SMTP bilgilerini kontrol et
2. Gmail 2FA kontrol et
3. App password kontrol et
4. Test email gönder

### 3D Model Yükleme
3D model dosyasını `/public/models/` klasörüne koy

### Responsive Tasarım Sorunu
Mobile view'de test et: `F12 → Responsive Design Mode`

---

## **İletişim ve Yardım**

Herhangi bir sorun yaşarsan:
1. Browser console'a bak (F12)
2. Error mesajını oku
3. Bu rehberde arayarak çözümü bul

Vercel: https://vercel.com/support
Next.js: https://nextjs.org/docs

---

**Başarılar! 🚀**
