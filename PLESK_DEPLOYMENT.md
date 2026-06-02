# 🚀 PLESK PANEL - FTP DEPLOYMENT REHBERI

Plesk panel'de Node.js uygulaması deploy etme adımları.

---

## **ADIM 1: FTP Bağlantısı Hazırla**

### 1.1 - FTP Bilgilerini Al
1. Plesk panel'e giriş yap
2. "Files" → "FTP Accounts" git
3. FTP hesabını bul (oluşturduğun)
4. Bilgileri kopyala:
   ```
   Host: ftp.domain.com
   Username: ftp_user
   Password: ****
   Port: 21
   ```

### 1.2 - FTP Client İndir ve Kur
**Filezilla (Ücretsiz):**
- https://filezilla-project.org/download.php adresinden indir
- Kur ve aç

---

## **ADIM 2: Filezilla ile Bağlan**

### 2.1 - Bağlantı Kur
1. Filezilla'da üstte şu alanları doldur:
   - Host: `ftp.domain.com`
   - Username: `ftp_user`
   - Password: `****` (FTP şifresi)
   - Port: `21`

2. "Quickconnect" butonuna tıkla

3. İlk kez bağlanıyorsan "Certificate" dialog çıkabilir → "OK"

### 2.2 - Bağlandığını Kontrol Et
Sağ tarafta klasör yapısını görebiliyorsan, bağlantı başarılı.

---

## **ADIM 3: Projeyi FTP'ye Yükle**

### 3.1 - Hazırlık (Yerel Bilgisayarda)
```bash
cd C:\Users\Ercan Uzuner\Desktop\camera-landing

# .next klasörünü oluştur (build sonucu)
npm run build

# Hiç Node modules yükleme (çok ağır)
# Plesk'te sunucu tarafından yüklenecek
```

### 3.2 - Dosyaları Yükle
Filezilla'da:

**Sol taraf (Bilgisayarında):**
```
C:\Users\Ercan Uzuner\Desktop\camera-landing
```

**Sağ taraf (Sunucuda):**
```
/httpdocs
veya
/public_html
```

**Şu klasörleri ve dosyaları yükle:**
- ✅ `.next/` (build sonucu)
- ✅ `public/` (resimler, 3D modeller)
- ✅ `app/` 
- ✅ `components/`
- ✅ `context/`
- ✅ `lib/`
- ✅ `node_modules/` (İLK BAKIŞTA ATLA)
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `next.config.js`
- ✅ `tsconfig.json`
- ✅ `.env.local` (şifreler içeriyor - manuel oluştur sunucuda)

**Atlanacaklar:**
- ❌ `node_modules/` (sunucuda npm install ile oluşacak)
- ❌ `.git/` (GitHub'dan kopyalayabilirsin)
- ❌ `CANLI_AKTARMA_ADIMLAR.md` (gerekli değil)

---

## **ADIM 4: Plesk Panel'de Node.js Ayarla**

### 4.1 - Node.js Versiyonunu Seç
1. Plesk panel'de giriş yap
2. "Domains" → Senin domain'ını seç
3. "Node.js" butonuna tıkla
4. "Enable Node.js Support" seç
5. Node.js Version: **18.x** (veya 20.x) seç
6. "Apply" butonuna tıkla

### 4.2 - Application Startup File
1. Aynı sayfada "Application startup file" alanını bul
2. Şunu gir:
   ```
   server.js
   veya
   node_modules/.bin/next start
   ```

---

## **ADIM 5: .env.local Oluştur (Sunucuda)**

### 5.1 - Plesk File Manager'da
1. Plesk panel → "Files" → "File Manager"
2. `/httpdocs` veya `/public_html` aç
3. "Create a new file" → `.env.local` oluştur

### 5.2 - İçeriğini Doldur
Aşağıdaki metni yapıştır:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=senin-email@gmail.com
SMTP_PASSWORD=google-uygulama-sifresi
FROM_EMAIL=noreply@domain.com
NEXT_PUBLIC_BASE_URL=https://domain.com
```

**Kaydet ve kapat**

---

## **ADIM 6: Dependencies Yükle (Sunucuda)**

### 6.1 - Terminal/SSH Aç (Plesk)
1. Plesk → "Tools & Settings" → "Terminal"
2. Komut gir:
   ```
   cd /var/www/vhosts/domain.com/httpdocs
   npm install
   npm run build
   ```

3. Bitmesini bekle (5-10 dakika)

### 6.2 - Hata Kontrol
Eğer hata görürsen:
- npm versiyonu kontrol et: `npm -v`
- Node versiyonu kontrol et: `node -v`
- .env.local dosyası var mı kontrol et

---

## **ADIM 7: Application Start (Plesk)**

### 7.1 - Node.js Application Başlat
1. Plesk → Senin domain → "Node.js"
2. "Enable Node.js Support" aktif mı kontrol et
3. "Start Application" butonuna tıkla
4. Status: **Running** olmalı

### 7.2 - Otomatik Başlatma
1. "Automatically start application when the server starts" ✓ işaretle
2. "Apply"

---

## **ADIM 8: Canlı Kontrolleri Yap**

### 8.1 - Website Erişimi
```
https://domain.com
```
Tarayıcıda açıp sayfanın yüklenip yüklenip yüklendiğini kontrol et.

**Hata alırsan:**
- Plesk Node.js loglarını kontrol et
- .env.local dosyasının doğru olup olmadığını kontrol et

### 8.2 - Admin Panele Giriş
```
https://domain.com/admin
```
- Şifre gir: `axeron2024` (İlk sefer) veya yeni şifre
- Giriş başarılı oldu mu?

### 8.3 - Email Test
Admin panelinde "Mail Ayarları" → "Test Gönder"
- Email başarılı gönderiliyor mu?

### 8.4 - 3D Model
Ana sayfada 3D kamera görünüyor mu?

### 8.5 - HTTPS (SSL)
```
https://domain.com
```
Kilit ikonu görünüyor mu? (Plesk otomatik sertifikat sağlıyor)

---

## **ADIM 9: Sorun Giderme**

### Sorun: Website Açılmıyor (503, 502)
**Çözüm:**
1. Plesk → "Node.js" → Logs
2. Hata mesajını oku
3. Genellikle nedeni:
   - `.env.local` dosyası eksik
   - npm install yapılmamış
   - Node.js sürümü uyumsuz

### Sorun: Admin Panele Giriş Yapamıyor
**Çözüm:**
1. Browser cache temizle (Ctrl+Shift+Delete)
2. localhost:3000 den deneme (yerel)
3. localStorage sorun olabilir

### Sorun: Email Göndermiyor
**Çözüm:**
1. SMTP bilgilerini kontrol et
2. Gmail 2FA aktif mı?
3. App password doğru mu?
4. Plesk firewall e-mail portunu bloke etmiyor mu?
   - Plesk → "Firewall" → Port 587 açık mı kontrol et

### Sorun: 3D Model Yüklemiyor
**Çözüm:**
1. `/public/models/` klasörü var mı?
2. Model dosyası (.glb) var mı?
3. Browser console hata var mı? (F12)

---

## **ADIM 10: Bakım ve Monitoring**

### 10.1 - Node.js Loglarını İzle
Plesk → Node.js → "View Logs"

Her gün kontrol et ve hataları gözlemle.

### 10.2 - Disk Alanı
Plesk → "Disk Space"
- Kullanılmış alan %90'dan fazla mı?
- Eğer öyleyse eski logları sil

### 10.3 - Automatic Restart
Plesk → Node.js → "Auto restart application"
- Etkinleştir (eğer crash olursa otomatik yeniden başlar)

### 10.4 - SSL Sertifikası Yenileme
Plesk otomatik yeniliyor, ama Plesk → "SSL Certificates" de kontrol et.

---

## **Hızlı Referans**

### Website Yeniden Başlatma
```bash
# Plesk Terminal'de:
cd /var/www/vhosts/domain.com/httpdocs
npm run build
# Node.js otomatik restart olur
```

### Logları Görme
Plesk → Node.js → "View Logs"

### FTP ile Dosya Güncelleme
Filezilla → `/httpdocs` → Dosya üzerine sürükle (üzerine yaz)

### Admin Şifresi Değiştirme
Admin panelinde ("Kullanıcılar" → "Parolanızı Değiştirin")

---

## **Kontrol Listesi - Başarı**

- [ ] FTP bağlantısı kuruldu
- [ ] Dosyalar sunucuya yüklendi
- [ ] `.env.local` oluşturuldu
- [ ] `npm install` tamamlandı
- [ ] `npm run build` başarılı
- [ ] Node.js uygulaması çalışıyor (Running)
- [ ] Website açılıyor (https://domain.com)
- [ ] Admin paneline giriş yapılıyor
- [ ] Email gönderiliyor
- [ ] 3D model görünüyor
- [ ] HTTPS aktif (kilit ikonu)
- [ ] SSL sertifikası yapılandırılmış

✅ **Tamamlandı! Website canlıda!**

---

## **Acil Yardım**

Eğer hata alırsan ve uygulamayı düzeltmen gerekirse:

### Seçenek 1: Plesk Node.js Durdur
1. Plesk → Node.js
2. "Stop Application"
3. Düzelt
4. `npm run build` yap
5. "Start Application"

### Seçenek 2: FTP ile Dosya Güncelle
1. Filezilla'da dosyayı düzenle
2. Sunucudaki dosyanın üzerine sürükle
3. Otomatik restart olur

### Seçenek 3: Terminal'de Hata Debug
```bash
cd /var/www/vhosts/domain.com/httpdocs
npm run dev
# Yerel sunucu 3000'de açılır (test için)
```

---

**Başarılar! Herhangi bir sorun olursa linuxta nasıl çözeceğini yazabilirim.** 💪
