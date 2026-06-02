"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const TR = {
  badge: "6698 Sayılı KVKK",
  title: "Aydınlatma Metni",
  subtitle: "Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır.",
  updated: "Son güncelleme: Haziran 2026",
  backLabel: "Anasayfaya dön",
  logoLabel: "AXERON",

  sections: [
    {
      num: "01",
      heading: "Veri Sorumlusu",
      body: `Axeron Surgical Technologies Medikal San. ve Tic. A.Ş. ("Axeron Medical" veya "Şirket") olarak, 6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla hareket etmekteyiz.`,
      info: [
        { label: "Adres", value: "Maslak Mah. AOS 55. Sokak, Plaza No:2, Kat:7, 34398 Sarıyer / İstanbul" },
        { label: "E-posta", value: "info@axeronmed.com" },
        { label: "Telefon", value: "+90 212 555 08 72" },
      ],
    },
    {
      num: "02",
      heading: "İşlenen Kişisel Veriler",
      body: "Web sitemizde yer alan iletişim formu aracılığıyla aşağıdaki kişisel verileriniz işlenmektedir.",
      bullets: [
        "Kimlik bilgileri: Ad, soyad",
        "İletişim bilgileri: E-posta adresi, telefon numarası",
        "Kurum bilgileri: Çalıştığınız firma veya kurum adı",
        "İletişim içeriği: Konu seçimi ve mesaj metni",
      ],
    },
    {
      num: "03",
      heading: "İşlenme Amaçları",
      body: "Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir.",
      bullets: [
        "Satış öncesi ve satış sonrası destek hizmetlerinin yürütülmesi",
        "Ürün ve hizmetlerimize ilişkin bilgi talepleri ile teknik destek başvurularının karşılanması",
        "İhale ve tedarik süreçlerine ilişkin yazışmaların yürütülmesi",
        "Yasal yükümlülüklerin yerine getirilmesi",
        "Yetkili kamu kurum ve kuruluşlarına yasal zorunluluk kapsamında bilgi verilmesi",
      ],
    },
    {
      num: "04",
      heading: "Hukuki Dayanak",
      body: "Kişisel verileriniz, KVKK'nın 5. maddesi kapsamında aşağıdaki hukuki dayanaklar çerçevesinde işlenmektedir.",
      bullets: [
        "Açık rızanız (KVKK m. 5/1): İletişim formu onay kutucuğunu işaretleyerek vermiş olduğunuz rıza",
        "Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (KVKK m. 5/2-c): Talep ettiğiniz ürün veya hizmetin sağlanabilmesi için zorunlu olan işlemler",
        "Veri sorumlusunun meşru menfaati (KVKK m. 5/2-f): Müşteri ilişkilerinin yönetimi ve ticari faaliyetlerin sürdürülmesi",
      ],
    },
    {
      num: "05",
      heading: "Veri Aktarımı",
      body: "Kişisel verileriniz; yurt içinde yasal zorunluluklar çerçevesinde yetkili kamu kurum ve kuruluşlarıyla paylaşılabilir. Bunun dışında üçüncü kişi, kurum veya kuruluşlarla açık rızanız olmaksızın paylaşılmamaktadır. Verileriniz, KVKK'nın 9. maddesi kapsamındaki koşullar sağlanmadıkça yurt dışına aktarılmamaktadır.",
    },
    {
      num: "06",
      heading: "Saklama Süreleri",
      body: "Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca saklanmaktadır.",
      info: [
        { label: "İletişim formu verileri", value: "Son iletişim tarihinden itibaren 3 yıl" },
        { label: "Sözleşme ilişkisi doğmuşsa", value: "İlgili mevzuatta öngörülen süreler (genel olarak 10 yıl)" },
      ],
      footer: "Saklama süresinin sona ermesi veya işleme amacının ortadan kalkması halinde verileriniz silinmekte, yok edilmekte veya anonim hale getirilmektedir.",
    },
    {
      num: "07",
      heading: "Haklarınız",
      body: "KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz.",
      bullets: [
        "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
        "İşlenmişse buna ilişkin bilgi talep etme",
        "İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme",
        "Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme",
        "Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme",
        "KVKK'nın 7. maddesi kapsamında silinmesini veya yok edilmesini isteme",
        "Düzeltme, silme ve yok etme işlemlerinin üçüncü kişilere bildirilmesini isteme",
        "Otomatik sistemler vasıtasıyla aleyhinize sonuç doğuran analizlere itiraz etme",
        "Kişisel verilerin kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme",
      ],
    },
    {
      num: "08",
      heading: "Başvuru Yöntemi",
      body: "Yukarıdaki haklarınızı kullanmak için aşağıdaki kanallardan bize ulaşabilirsiniz. Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.",
      info: [
        { label: "E-posta", value: "info@axeronmed.com — konu: \"KVKK Başvurusu\"" },
        { label: "Posta", value: "Maslak Mah. AOS 55. Sokak, Plaza No:2, Kat:7, 34398 Sarıyer / İstanbul" },
      ],
    },
  ],

  footerNote: "Bu aydınlatma metni Axeron Surgical Technologies Medikal San. ve Tic. A.Ş. tarafından hazırlanmıştır ve değiştirilebilir.",
};

const EN = {
  badge: "Privacy Notice",
  title: "Privacy Notice",
  subtitle: "Prepared under Turkish Law No. 6698 on the Protection of Personal Data (KVKK).",
  updated: "Last updated: June 2026",
  backLabel: "Back to homepage",
  logoLabel: "AXERON",

  sections: [
    {
      num: "01",
      heading: "Data Controller",
      body: `Axeron Surgical Technologies Medical Inc. ("Axeron Medical" or the "Company") acts as the data controller within the scope of Turkish Law No. 6698 on the Protection of Personal Data and applicable data protection regulations.`,
      info: [
        { label: "Address", value: "Maslak Mah. AOS 55. Sokak, Plaza No:2, Floor 7, 34398 Sarıyer / Istanbul" },
        { label: "Email", value: "info@axeronmed.com" },
        { label: "Phone", value: "+90 212 555 08 72" },
      ],
    },
    {
      num: "02",
      heading: "Personal Data Collected",
      body: "Through the contact form on our website, the following personal data is collected.",
      bullets: [
        "Identity information: First name, last name",
        "Contact information: Email address, phone number",
        "Organisation information: Company or institution name",
        "Communication content: Subject selection and message text",
      ],
    },
    {
      num: "03",
      heading: "Purposes of Processing",
      body: "Your personal data is processed for the following purposes.",
      bullets: [
        "Providing pre-sales and after-sales support services",
        "Responding to product and service information requests and technical support enquiries",
        "Managing correspondence related to tender and procurement processes",
        "Fulfilling legal obligations",
        "Providing information to authorised public authorities as required by law",
      ],
    },
    {
      num: "04",
      heading: "Legal Basis for Processing",
      body: "Your personal data is processed on the following legal grounds under Article 5 of KVKK.",
      bullets: [
        "Explicit consent (Art. 5/1): Consent given by ticking the checkbox on the contact form",
        "Necessary for the establishment or performance of a contract (Art. 5/2-c): Operations required to provide the product or service you requested",
        "Legitimate interest of the data controller (Art. 5/2-f): Management of customer relations and continuation of commercial activities",
      ],
    },
    {
      num: "05",
      heading: "Transfer of Personal Data",
      body: "Your personal data may be shared with authorised public authorities within Turkey as required by law. It is not shared with third parties, institutions or organisations without your explicit consent. Your data is not transferred abroad unless the conditions set out in Article 9 of KVKK are met.",
    },
    {
      num: "06",
      heading: "Retention Period",
      body: "Your personal data is retained for as long as necessary for the processing purpose.",
      info: [
        { label: "Contact form data", value: "3 years from the date of last contact" },
        { label: "Where a contract arises", value: "Periods prescribed by applicable legislation (generally 10 years)" },
      ],
      footer: "Upon expiry of the retention period or cessation of the processing purpose, your data is deleted, destroyed or anonymised.",
    },
    {
      num: "07",
      heading: "Your Rights",
      body: "Under Article 11 of KVKK, you have the following rights.",
      bullets: [
        "To learn whether your personal data is being processed",
        "To request information about the processing if it has taken place",
        "To learn the purpose of processing and whether data is used in accordance with that purpose",
        "To know the third parties to whom personal data has been transferred domestically or abroad",
        "To request correction of incomplete or inaccurate personal data",
        "To request deletion or destruction of personal data under Article 7 of KVKK",
        "To request that correction, deletion and destruction operations be notified to third parties",
        "To object to a result arising from analysis of processed data exclusively through automated systems",
        "To claim compensation for damages suffered due to unlawful processing of personal data",
      ],
    },
    {
      num: "08",
      heading: "How to Apply",
      body: "To exercise the above rights, you may contact us via the channels below. Your requests will be concluded free of charge within 30 days.",
      info: [
        { label: "Email", value: "info@axeronmed.com — subject: \"Data Subject Request\"" },
        { label: "Post", value: "Maslak Mah. AOS 55. Sokak, Plaza No:2, Floor 7, 34398 Sarıyer / Istanbul" },
      ],
    },
  ],

  footerNote: "This privacy notice has been prepared by Axeron Surgical Technologies Medical Inc. and is subject to change.",
};

export default function KvkkClient() {
  const { lang } = useLanguage();
  const c = lang === "tr" ? TR : EN;

  return (
    <div style={{ backgroundColor: "var(--bg)" }} className="min-h-screen flex flex-col">

      {/* ── Sticky header ─────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-ink/8 bg-[var(--bg)]/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" unoptimized alt="Axeron Medical" width={120} height={32} className="h-7 w-auto object-contain" />
          </Link>
          <Link
            href="/"
            className="text-xs text-ink/40 hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-50">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {c.backLabel}
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────── */}
      <div className="w-full border-b border-ink/8">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ink/12 text-[11px] font-semibold tracking-widest uppercase text-ink/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            {c.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink leading-tight mb-4">
            {c.title}
          </h1>
          <p className="text-sm text-ink/45 max-w-lg leading-relaxed">{c.subtitle}</p>
          <p className="mt-4 text-xs text-ink/30 tracking-wide">{c.updated}</p>
        </div>
      </div>

      {/* ── Bölümler ──────────────────────────────────── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-10 py-14">
        <div className="flex flex-col divide-y divide-ink/8">
          {c.sections.map((sec) => (
            <div key={sec.num} className="py-10 md:py-12 grid grid-cols-1 md:grid-cols-[5rem_1fr] gap-4 md:gap-10">

              {/* Sol: numara */}
              <div className="flex-shrink-0">
                <span className="text-xs font-semibold tracking-[0.2em] text-accent/70">{sec.num}</span>
              </div>

              {/* Sağ: içerik */}
              <div>
                <h2 className="text-base font-semibold text-ink mb-3">{sec.heading}</h2>
                <p className="text-sm text-ink/55 leading-relaxed mb-4">{sec.body}</p>

                {/* Madde listesi */}
                {"bullets" in sec && sec.bullets && (
                  <ul className="flex flex-col gap-2 mt-4">
                    {sec.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-ink/55 leading-relaxed">
                        <span className="mt-[6px] w-1 h-1 rounded-full bg-accent/60 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Bilgi tablosu */}
                {"info" in sec && sec.info && (
                  <div className="mt-4 rounded-xl border border-ink/8 overflow-hidden">
                    {sec.info.map((row, i) => (
                      <div
                        key={i}
                        className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 px-5 py-3.5 text-sm ${
                          i < sec.info!.length - 1 ? "border-b border-ink/8" : ""
                        }`}
                      >
                        <span className="w-44 flex-shrink-0 text-xs font-semibold tracking-wider uppercase text-ink/35">{row.label}</span>
                        <span className="text-ink/60 leading-relaxed">{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer notu */}
                {"footer" in sec && sec.footer && (
                  <p className="mt-4 text-sm text-ink/40 leading-relaxed italic">{sec.footer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-ink/8">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-ink/30 leading-relaxed max-w-lg">{c.footerNote}</p>
          <Link href="/">
            <Image src="/logo.png" unoptimized alt="Axeron Medical" width={90} height={24} className="h-5 w-auto object-contain opacity-50" />
          </Link>
        </div>
      </footer>

    </div>
  );
}
