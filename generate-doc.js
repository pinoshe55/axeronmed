const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat
} = require("docx");
const fs = require("fs");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cm = (val) => Math.round(val * 567); // cm to DXA

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, font: "Arial", size: 32 })],
    spacing: { before: 400, after: 200 },
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26 })],
    spacing: { before: 300, after: 160 },
  });
}
function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, font: "Arial", size: 24 })],
    spacing: { before: 240, after: 120 },
  });
}
function p(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22 })],
    spacing: { after: 160 },
  });
}
function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "2E4057" })],
    spacing: { after: 80 },
    shading: { fill: "F0F0F0", type: ShadingType.CLEAR },
    indent: { left: 360 },
  });
}
function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text: "• " + text, font: "Arial", size: 22 })],
    spacing: { after: 100 },
    indent: { left: 360 },
  });
}
function note(text) {
  return new Paragraph({
    children: [new TextRun({ text: "ℹ  " + text, font: "Arial", size: 20, color: "555555", italics: true })],
    spacing: { after: 160 },
    indent: { left: 360 },
  });
}
function spacer() {
  return new Paragraph({ children: [new TextRun("")], spacing: { after: 120 } });
}

function twoColTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3500, 5860],
    rows: rows.map(([left, right]) =>
      new TableRow({
        children: [
          new TableCell({
            borders, width: { size: 3500, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: left, font: "Arial", size: 20, bold: true })] })],
          }),
          new TableCell({
            borders, width: { size: 5860, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: right, font: "Arial", size: 20 })] })],
          }),
        ],
      })
    ),
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "CC0000" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "1A1A2E" },
        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children: [
      // ── COVER ──────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 2000, after: 200 },
        children: [new TextRun({ text: "AXERON MEDICAL", font: "Arial", size: 64, bold: true, color: "CC0000" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "Site Düzenleme Kılavuzu", font: "Arial", size: 36, color: "333333" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "camera-landing projesi — Next.js 14 + React Three Fiber", font: "Arial", size: 22, color: "666666", italics: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 2000 },
        children: [new TextRun({ text: "Sürüm 1.0 — Haziran 2026", font: "Arial", size: 20, color: "888888" })],
      }),
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CC0000", space: 1 } },
        children: [],
        spacing: { after: 400 },
      }),

      // ── 1. YÜKLEME EKRANI ──────────────────────────────
      h1("1. Yükleme Ekranı (Loading Screen)"),
      p("Kullanıcı sayfayı açtığında 3D model yüklenene kadar görüntülenen tam ekran kaplama."),
      h2("Dosya"),
      code("components/LoadingScreen.tsx"),
      h2("Değiştirilebilecek Alanlar"),
      twoColTable([
        ["Logo yazısı", '"AXERON" — satır 41\'deki <div className="loading-screen__logo"> içindeki metin'],
        ["Alt yazı", '"Medical yükleniyor" — satır 42\'deki <div className="loading-screen__caption"> içindeki metin'],
        ["Bekleme süresi", "Satır 29: 280ms (yükleme tamamlandıktan sonra kaç ms ekranda kalacak)"],
        ["Geçiş süresi", "Satır 28: 520ms (soldurma animasyonu CSS ile senkronize)"],
      ]),
      spacer(),
      note("drei veya three.js import ETME — ilk bundle boyutunu bozar."),
      spacer(),

      // ── 2. HEADER ──────────────────────────────────────
      h1("2. Header (Üst Menü)"),
      p("Sayfanın en üstünde sabit duran logo + navigasyon çubuğu."),
      h2("Dosya"),
      code("components/Header.tsx"),
      h2("Değiştirilebilecek Alanlar"),
      twoColTable([
        ["Logo metni", 'Satır 7: <a href="#hero">AXERON</a>'],
        ["Nav — Anasayfa", 'Satır 10: href="#hero" ve görünen metin'],
        ["Nav — Hakkımızda", 'Satır 11: href="#hakkimizda" ve görünen metin'],
        ["Nav — İletişim", 'Satır 12: href="#iletisim" ve görünen metin'],
        ["Yeni nav linki eklemek", "Satır 12\'den sonra aynı <a> formatıyla yeni satır ekle"],
      ]),
      spacer(),

      // ── 3. KAYDIRMA BÖLÜMLERI ──────────────────────────
      h1("3. Kaydırma Bölümleri (Scroll Sections — 3D Animasyonlu)"),
      p("Sayfa yukarıdan aşağıya kaydırıldıkça 3D model hareket eder. Her bölüm bir kamera pozisyonuna karşılık gelir."),
      h2("Dosya"),
      code("components/ScrollSections.tsx"),
      h2("Bölümler ve İçerikleri"),
      twoColTable([
        ["Bölüm 1 — Hero", 'id="hero" | data-section="hero" — Büyük başlık ve kısa tanıtım paragrafı'],
        ["Bölüm 2 — Özellikler", 'id="features" | data-section="closeup" — Depolama koşulları metni'],
        ["Bölüm 3 — Performans", 'id="performance" | data-section="front" — Delikli/deliksiz + 4 FeatureStat kutusu'],
        ["Bölüm 4 — Tasarım", 'id="design" | data-section="top" — Koruma kapağı metni'],
        ["Bölüm 5 — Görüntü", 'id="display" | data-section="back" — Filtre metni'],
        ["Bölüm 6 — Final", 'id="experience" | data-section="final" — Boş / CTA alanı'],
      ]),
      h2("FeatureStat Kutuları (Bölüm 3)"),
      p("Bölüm 3'te 4 adet FeatureStat kutusu bulunur. Her biri components/FeatureStat.tsx dosyasından gelir ve sadece label prop'u alır."),
      code('<FeatureStat label="Buraya metin yaz" />'),
      h2("Hero Metni Nasıl Değiştirilir"),
      code('// components/ScrollSections.tsx satır ~11-16'),
      code('<p data-hero-text>Axeron</p>   // Küçük üst başlık'),
      code('<h1 className="final-title text-ink" data-hero-text>Medical</h1>   // Büyük başlık'),
      code('<p data-hero-text>Açıklama metni buraya gelir...</p>'),
      spacer(),

      // ── 4. 3D MODEL POZİSYONLARI ──────────────────────
      h1("4. 3D Model Pozisyonları"),
      p("Her kaydırma bölümü için 3D modelin ekrandaki konumu, açısı ve boyutu ayrı ayrı tanımlanmıştır."),
      h2("Dosya"),
      code("components/scrollStates.ts"),
      h2("Mevcut Pozisyonlar"),
      twoColTable([
        ["hero (Bölüm 1)", "position [0.75, 0.08, 0.08] | scale 2.2 | Sağ taraf, güçlü 3/4 açı"],
        ["closeup (Bölüm 2)", "position [-0.75, 0.05, 0.75] | scale 1.65 | Sol-ileri, büyük"],
        ["front (Bölüm 3)", "position [-0.3, -0.05, 0.2] | scale 1.42 | Ortalanmış, lens viewer'a dönük"],
        ["top (Bölüm 4)", "position [0.0, 0.05, 0.4] | scale 1.38 | Üstten görünüm"],
        ["back (Bölüm 5)", "position [0.6, -0.05, 0.0] | scale 1.27 | Diyagonal arka görünüm"],
        ["final (Bölüm 6)", "position [-0.95, -0.05, 0.2] | scale 1.46 | Sol, lens viewer'a dönük"],
      ]),
      h2("Scale (Boyut) Değiştirme"),
      p("Modeli büyütmek için scale değerini artır, küçültmek için azalt. Örnek:"),
      code("{ id: 'hero', ..., scale: 2.2 }  // 2.2 → 2.5 yaparak büyütebilirsin"),
      h2("Mobil Faktörler"),
      code("MOBILE_SCALE_FACTOR = 1.1   // Mobilde boyut çarpanı"),
      code("MOBILE_POSITION_FACTOR = 0.1  // Mobilde pozisyon sıkıştırması"),
      spacer(),

      // ── 5. GÖRSEL KOLAJ ───────────────────────────────
      h1("5. Görsel Kolaj (Yüzen Resimler)"),
      p("Hero ile Hakkımızda bölümü arasındaki dekoratif resim alanı. 6 ürün fotoğrafı CSS transform ile döndürülmüş şekilde yerleştirilmiştir."),
      h2("Dosya"),
      code("components/StaticSections.tsx — satır ~1-80 (collage bölümü)"),
      h2("Resimleri Değiştirme"),
      p("Resimler public/ klasöründe durur. Değiştirmek için:"),
      bullet("Yeni resmi public/ klasörüne koy"),
      bullet('StaticSections.tsx\'te ilgili <Image src="/hero-X.jpg" ... /> satırını bul'),
      bullet("src değerini yeni dosya adıyla güncelle"),
      h2("Mevcut Resimler"),
      twoColTable([
        ["/hero-1.jpg", "Kolaj resim 1"],
        ["/hero-2.jpg", "Kolaj resim 2"],
        ["/hero-3.jpg", "Kolaj resim 3"],
        ["/hero-4.jpg", "Kolaj resim 4"],
      ]),
      spacer(),

      // ── 6. HAKKIMIZDA ─────────────────────────────────
      h1("6. Hakkımızda Bölümü"),
      h2("Dosya"),
      code("components/StaticSections.tsx — Hakkımizda bölümü"),
      h2("İstatistik Kartları (4 Adet)"),
      twoColTable([
        ["15+", "Yıl Deneyim"],
        ["200+", "Aktif Müşteri"],
        ["180+", "Ürün Çeşidi"],
        ["48s", "Ortalama Teslimat"],
      ]),
      p("Bu değerleri değiştirmek için StaticSections.tsx içindeki ilgili satırları bul:"),
      code('<p className="stat-number">15+</p>'),
      code('<p className="stat-label">Yıl Deneyim</p>'),
      h2("Metin Blokları"),
      p("Hakkımızda bölümünde 3 metin bloğu bulunur: şirket tanıtımı, üretim kalitesi ve hizmet taahhüdü. Her biri ayrı bir <div> içinde düzenlenebilir."),
      spacer(),

      // ── 7. İLETİŞİM ──────────────────────────────────
      h1("7. İletişim Bölümü"),
      h2("Dosya"),
      code("components/StaticSections.tsx — iletisim bölümü"),
      h2("İletişim Bilgileri"),
      twoColTable([
        ["Adres", "1. Organize Sanayi Bölgesi, 85022 Nolu Cadde, No:3 — Karatay / Konya"],
        ["Telefon", "+90 332 345 22 55"],
        ["E-posta", "satis@axeronmed.com"],
      ]),
      h2("İletişim Formu"),
      p("Form şu an statiktir (backend bağlantısı yok). Form action'ı eklemek için:"),
      code('<form onSubmit={handleSubmit} ...>'),
      p("Next.js API route veya harici form servisi (Formspree, EmailJS vb.) ile entegre edilebilir."),
      h2("SSS (FAQ) Akordeonu"),
      p("StaticSections.tsx içinde faqItems dizisi bulunur. Yeni soru eklemek için:"),
      code("const faqItems = ["),
      code('  { q: "Soru metni?", a: "Cevap metni." },'),
      code("  // Yeni soru buraya ekle"),
      code("];"),
      spacer(),

      // ── 8. FOOTER CTA ─────────────────────────────────
      h1("8. Footer CTA Bandı"),
      p("Sayfanın en altında koyu arka planlı 'Birlikte çalışalım' alanı."),
      h2("Dosya"),
      code("components/StaticSections.tsx — footer-cta bölümü"),
      h2("Değiştirilebilecek Alanlar"),
      twoColTable([
        ["Başlık", '"Birlikte çalışalım"'],
        ["Alt yazı", "Kısa açıklama metni"],
        ["E-posta butonu", '"satis@axeronmed.com" — mailto: linki'],
      ]),
      spacer(),

      // ── 9. META / SEO ─────────────────────────────────
      h1("9. Meta Bilgileri (SEO & Sosyal Medya)"),
      h2("Dosya"),
      code("app/layout.tsx"),
      h2("Değiştirilebilecek Alanlar"),
      twoColTable([
        ["title", "Sekme başlığı ve Google sonucu başlığı"],
        ["description", "Google önizleme metni (155 karakter önerilir)"],
        ["og:title / og:description", "Sosyal medya paylaşım kartı metni"],
        ["og:image", "Sosyal medya paylaşım görseli (public/ klasörüne ekle)"],
      ]),
      spacer(),

      // ── 10. RENKLER ───────────────────────────────────
      h1("10. Renkler ve Tipografi"),
      h2("Dosya"),
      code("app/globals.css"),
      h2("Renk Değişkenleri"),
      twoColTable([
        ["--bg", "#f3f3f3 — Sayfa arka plan rengi"],
        ["--ink", "#0a0a0a — Yazı rengi"],
        ["--accent", "#ff3b30 — Vurgu rengi (AXERON logosu, butonlar)"],
      ]),
      h2("Tipografi Sınıfları"),
      twoColTable([
        [".final-title", "Ana hero başlığı (Medical)"],
        [".headline", "Büyük bölüm başlıkları"],
        [".headline-md", "Orta boy başlıklar"],
        [".eyebrow", "Küçük üst etiketler"],
        [".cta", "Buton stili"],
      ]),
      spacer(),

      // ── 11. 3D SAHNE AYARLARI ─────────────────────────
      h1("11. 3D Sahne Ayarları"),
      h2("Aydınlatma — Dosya: components/Scene.tsx"),
      twoColTable([
        ["toneMappingExposure (masaüstü)", "0.42 — Sahne parlaklığı"],
        ["toneMappingExposure (mobil)", "0.38"],
        ["environmentIntensity (masaüstü)", "1.35"],
        ["environmentIntensity (mobil)", "1.0"],
        ["fov (kamera açısı)", "32"],
        ["Kamera uzaklığı", "[0, 0, 4.5]"],
      ]),
      h2("Malzeme — Dosya: components/CameraModel.tsx"),
      twoColTable([
        ["roughness", "0.18 — Düşük = parlak yüzey"],
        ["metalness", "0.82 — Yüksek = metalik görünüm"],
        ["color.multiplyScalar", "0.28 — Renk koyuluğu (düşük = koyu)"],
      ]),
      note("Rengi açmak için multiplyScalar değerini artır (0.28 → 0.40). Rengi koyultmak için azalt."),
      h2("3D Model Dosyası"),
      code("public/models/camera.glb"),
      p("Modeli değiştirmek için yeni .glb dosyasını bu konuma kaydet. Dosya adı aynı kalmalı ya da CameraModel.tsx'teki path güncellenmeli."),
      spacer(),

      // ── 12. DOSYA YAPISI ──────────────────────────────
      h1("12. Dosya Yapısı Özeti"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4200, 5160],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders, width: { size: 4200, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                shading: { fill: "CC0000", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Dosya Yolu", font: "Arial", size: 20, bold: true, color: "FFFFFF" })] })],
              }),
              new TableCell({
                borders, width: { size: 5160, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                shading: { fill: "CC0000", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "İşlev", font: "Arial", size: 20, bold: true, color: "FFFFFF" })] })],
              }),
            ],
          }),
          ...([
            ["app/layout.tsx", "Meta/SEO bilgileri"],
            ["app/globals.css", "Renkler, tipografi, CSS değişkenleri"],
            ["app/page.tsx", "Ana sayfa bileşimi"],
            ["components/Header.tsx", "Üst menü"],
            ["components/LoadingScreen.tsx", "Yükleme ekranı"],
            ["components/ScrollSections.tsx", "3D animasyonlu kaydırma bölümleri"],
            ["components/StaticSections.tsx", "Kolaj, Hakkımızda, İletişim, Footer"],
            ["components/scrollStates.ts", "3D model pozisyon/rotasyon/scale değerleri"],
            ["components/Scene.tsx", "Three.js sahne kurulumu (ışık, kamera)"],
            ["components/CameraModel.tsx", "GLB yükleyici + malzeme ayarları"],
            ["components/FeatureStat.tsx", "Özellik kutusu bileşeni"],
            ["public/models/camera.glb", "3D model dosyası"],
            ["public/hero-1.jpg ... hero-4.jpg", "Kolaj görselleri"],
          ]).map(([file, desc]) =>
            new TableRow({
              children: [
                new TableCell({
                  borders, width: { size: 4200, type: WidthType.DXA },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  shading: { fill: "F8F8F8", type: ShadingType.CLEAR },
                  children: [new Paragraph({ children: [new TextRun({ text: file, font: "Courier New", size: 18 })] })],
                }),
                new TableCell({
                  borders, width: { size: 5160, type: WidthType.DXA },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: desc, font: "Arial", size: 20 })] })],
                }),
              ],
            })
          ),
        ],
      }),
      spacer(),
      spacer(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 1 } },
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text: "Axeron Medical — camera-landing v1.0", font: "Arial", size: 18, color: "888888" })],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Axeron-Site-Kilavuzu.docx", buffer);
  console.log("OK: Axeron-Site-Kilavuzu.docx created");
});
