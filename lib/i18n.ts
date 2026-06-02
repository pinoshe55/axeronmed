export type Lang = "tr" | "en";

export const translations = {
  tr: {
    loading: "Medical yükleniyor",

    nav: {
      home: "Anasayfa",
      about: "Hakkımızda",
      contact: "İletişim",
    },

    scroll: {
      heroEyebrow: "Axeron",
      heroTitle: "Medical",
      heroParagraph:
        "Bakım maliyetini azaltmak ve kullanıcıya uzun ömürlü kullanım sağlamak amacıyla üretimde yüksek kalite alüminyum sac ve gelişmiş üretim teknikleri kullanır.",
      scrollHint: "Keşfetmek için kaydırın",

      closeupEyebrow: "Tüm Depolama Koşulları İçin",
      closeupH2:
        "Sterilizasyon Konteynerları kullanıcı isteklerini bütünüyle karşılamak amacıyla değişik tip ve ölçülerdedir.",
      closeupP:
        "Her türlü depolama/saklama şartlarına uygun olarak, farklı yükseklik, genişlik ve uzunluk seçenekleri mevcuttur. Buna ek olarak, konteynerlar üst üste istiflenebilmektedir.",

      frontEyebrow: "Delikli ve Deliksiz Konteyner Seçenekleri",
      frontH2: "Her Sterilizasyon Yöntemine Uyumlu",
      frontP:
        "Kullanıcılar, vakum sistemleri için uygun delikli kapak ve deliksiz kutu ya da buharlı sistemler için delikli kapak ve kutu modellerinden seçim yapabilirler.",
      frontStat1:
        "Dövme, pres, polisaj ve eloksal süreçlerinin ardından konteyner parçaları montaj hattına gönderilir.",
      frontStat2:
        "Yaklaşık 30 parça montaj hattında ara kontroller ile birleştirilir.",
      frontStat3:
        "Malzeme ve işçilik hatalarına karşı kontrol edilir ve sızdırmazlık testleri gerçekleştirilir.",
      frontStat4:
        "Herhangi bir fiziksel darbeye karşı konteynerlar güvenli bir şekilde paketlenir.",

      topEyebrow: "Koruma Sistemi",
      topHeading: "Darbeye Karşı Tam Güvence",
      topP:
        "Koruma kapağı darbelere karşı korunumu ve taşınma ve saklama/depolama sırasında olabilecek kontaminasyonu önlemeyi amaçlar.",

      backEyebrow: "Filtrasyon Teknolojisi",
      backHeading: "Tek Kullanımlık Kağıt Filtreler",
      backP:
        "Tek kullanımlık kağıt filtreler sterilizasyon sonrasında mikroorganizmaların konteyner içerisine girmesini önleyerek etkin koruma sağlar.\n\nFiltre tutucular ASIS / SAE 304 (1.4301) kalite paslanmaz çelikten üretilmektedir.",

      finalEyebrow: "Axeron Medical",
      finalHeading: "Güvenilir Tedarik\nOrtağınız",
      finalP: "15 yılı aşkın deneyim ve 180'den fazla referans kurumla, sterilizasyon konteyner sistemlerinde Türkiye'nin önde gelen tedarikçisiyiz. Kamu ihalelerinden özel kliniklere kadar tüm steril kap çözümleri için yanınızdayız.",
      finalCta: "İletişime Geçin",
    },

    static: {
      aboutEyebrow: "Neden Axeron",
      aboutTitle: "Rakamlarla",
      aboutTitleAccent: "Biz",
      aboutSubtitle:
        "Medikal tedarik sektöründe 15 yılı aşkın deneyim,\n180+ referans kurum, stoktan 48 saatlik teslimat.",

      stats: [
        { value: "15+", label: "Yıl Deneyim",     desc: "Medikal tedarik sektöründe" },
        { value: "200+", label: "Ürün Kodu",        desc: "5 kategoride tam kap yelpazesi" },
        { value: "180+", label: "Referans Kurum",   desc: "Hastane, klinik, CSSD merkezi" },
        { value: "48s",  label: "Teslimat",         desc: "Stoktan Türkiye geneline" },
      ],

      columns: [
        {
          title: "Misyonumuz",
          body: "Cerrahi operasyonlara yönelik prosedürlerde bilgi birikimi ve modern mühendislik metotlarını birleştirerek, işletme kültürünü sürekli araştıran akademik bir anlayış ile buluşturuyoruz.",
        },
        {
          title: "Üretim Kalitesi",
          body: "Bakım maliyetini azaltmak ve uzun ömürlü kullanım sağlamak amacıyla üretimde yüksek kalite alüminyum sac ile 316L paslanmaz çelik ve gelişmiş üretim teknikleri kullanılır.",
        },
        {
          title: "Sertifikasyon",
          body: "ISO 13485 sertifikalı kalite yönetim sistemimiz, Sağlık Bakanlığı uygunluk belgeleri ve CE işaretleme kapsamındaki ürün yelpazemiz kamu ihalelerinde tam uyumluluk sağlar.",
        },
      ],

      contactEyebrow: "Bize Ulaşın",
      contactTitle: "İletişime",
      contactTitleAccent: "Geçin",
      contactSubtitle:
        "Tüm steril kap çözümleri için satış ekibimiz\nmesai saatlerinde hizmetinizdedir.",

      contactBlocks: [
        {
          label: "Adres",
          lines: ["Maslak Mah. AOS 55. Sokak", "Plaza No:2, Kat:7", "34398 Sarıyer / İstanbul"],
        },
        {
          label: "Telefon",
          lines: ["Satış: +90 212 555 08 72", "Teknik Destek: +90 212 555 08 74", "Faks: +90 212 555 08 75"],
        },
        { label: "E-posta", lines: ["satis@axeronmed.com", "info@axeronmed.com"] },
      ],

      companyInfo:
        "Axeron Surgical Technologies Medikal San. ve Tic. A.Ş.\nVKN: 1234567890 · Vergi Dairesi: Maslak",

      faqEyebrow: "Sık Sorulan Sorular",
      faqs: [
        {
          q: "Minimum sipariş miktarı var mı?",
          a: "Alüminyum kaplar, paslanmaz çelik kasalar, tel örgü sepetler adet bazında satışa sunulmaktadır; minimum sipariş şartı yoktur. Silikon conta yedek setleri gibi sarf kalemlerde paket bazlı minimum miktar uygulanmaktadır.",
        },
        {
          q: "Kamu hastaneleri için ihale desteği veriyor musunuz?",
          a: "Evet. Tüm steril kap sistemlerimizin Sağlık Bakanlığı uygunluk belgesi, ÜRÜNAS kayıtları ve gerekli CE / ISO 13485 sertifikaları mevcuttur. Satış ekibimiz kamu hastanesi ihale dosyası hazırlamada destek sağlamaktadır.",
        },
        {
          q: "Ne kadar sürede geri dönüş alırım?",
          a: "Mesai saatleri içinde yapılan talepler aynı gün, mesai dışında yapılanlar takip eden iş günü sabahı cevaplanmaktadır.",
        },
        {
          q: "Ürünlerin garanti kapsamı nedir?",
          a: "Tüm steril kap sistemi ürünlerimiz 24 ay üretim hatasına karşı garantilidir. Silikon conta setleri gibi sarf kalemlerde bütünlük güvencesi kapsamındadır.",
        },
        {
          q: "Özel boyut ya da logo gravürü mümkün mü?",
          a: "Belirli hacimli siparişlerde özel boyutlandırma ve hastane/klinik logosu lazer gravür uygulaması mümkündür. Teslimat süresi standart siparişlere göre 3–4 hafta daha uzayabilir.",
        },
      ],

      formEyebrow: "İletişim Formu",
      formSubtitle: "En geç 1 iş günü içinde geri dönüş yapılır.",
      formCompany: "Firma / Kurum Adı",
      formCompanyPlaceholder: "ör. Kuzey Hastanesi",
      formPerson: "Yetkili Kişi",
      formPersonPlaceholder: "Ad Soyad",
      formEmail: "E-posta",
      formEmailPlaceholder: "eposta@kurum.com.tr",
      formPhone: "Telefon",
      formPhonePlaceholder: "+90 5XX XXX XX XX",
      formSubject: "Konu",
      formSubjectPlaceholder: "— Konu Seçin —",
      formSubjectOptions: [
        "Genel Bilgi",
        "Alüminyum Kap Sistemi",
        "Paslanmaz Çelik Kasa",
        "Silikon Contalı Kap",
        "Tel Örgü Sepet / Tepsi",
        "Büyük Taşıma Kasası",
        "Teknik Destek",
      ],
      formMessage: "Mesajınız",
      formMessagePlaceholder: "Talebinizi, ürün kodunu veya sorularınızı belirtin...",
      formKvkkLink: "KVKK Aydınlatma Metni",
      formKvkkSuffix: "'ni okudum ve kişisel verilerimin işlenmesine onay veriyorum.",
      formPrivacy: "Bilgileriniz 3. kişilerle paylaşılmaz.",
      formSubmit: "Gönder",

      ctaEyebrow: "Tedarike Açık",
      ctaTitle: "Birlikte çalışalım",

      footerCopy: "© Axeron Medical",
      footerLinks: "Gizlilik · Destek · İletişim",
    },
  },

  en: {
    loading: "Medical loading",

    nav: {
      home: "Home",
      about: "About Us",
      contact: "Contact",
    },

    scroll: {
      heroEyebrow: "Axeron",
      heroTitle: "Medical",
      heroParagraph:
        "High-quality aluminum sheet and advanced manufacturing techniques are used in production to reduce maintenance costs and provide users with long-lasting use.",
      scrollHint: "Start scrolling to explore",

      closeupEyebrow: "For All Storage Conditions",
      closeupH2:
        "Sterilization containers come in various types and sizes to fully meet user requirements.",
      closeupP:
        "Available in different height, width and length options to suit all storage conditions. In addition, the containers can be stacked on top of each other.",

      frontEyebrow: "Perforated and Non-Perforated Container Options",
      frontH2: "Compatible with Every\nSterilization Method",
      frontP:
        "Users can choose from perforated lid and non-perforated body models for vacuum systems, or perforated lid and body models for steam systems.",
      frontStat1:
        "After forging, pressing, polishing and anodizing processes, container parts are sent to the assembly line.",
      frontStat2:
        "Approximately 30 parts are assembled on the assembly line with intermediate checks.",
      frontStat3:
        "Checked for material and workmanship defects and leak tests are performed.",
      frontStat4:
        "Containers are safely packaged against any physical impact.",

      topEyebrow: "Protection System",
      topHeading: "Full Impact\nProtection",
      topP:
        "The protective cover aims to protect against impacts and prevent contamination that may occur during transport and storage.",

      backEyebrow: "Filtration Technology",
      backHeading: "Single-Use\nPaper Filters",
      backP:
        "Single-use paper filters provide effective protection by preventing microorganisms from entering the container after sterilization.\n\nFilter holders are manufactured from ASIS / SAE 304 (1.4301) grade stainless steel.",

      finalEyebrow: "Axeron Medical",
      finalHeading: "Your Trusted\nSupply Partner",
      finalP: "With over 15 years of experience and more than 180 reference institutions, we are Turkey's leading supplier of sterilization container systems — serving public tenders and private clinics alike.",
      finalCta: "Get in Touch",
    },

    static: {
      aboutEyebrow: "Why Axeron",
      aboutTitle: "By the",
      aboutTitleAccent: "Numbers",
      aboutSubtitle:
        "Over 15 years of experience in the medical supply sector,\n180+ reference institutions, 48-hour delivery from stock.",

      stats: [
        { value: "15+",  label: "Years Experience",         desc: "In medical supply sector" },
        { value: "200+", label: "Product Codes",            desc: "Full range across 5 categories" },
        { value: "180+", label: "Reference Institutions",   desc: "Hospitals, clinics, CSSD centers" },
        { value: "48h",  label: "Delivery",                 desc: "From stock across Turkey" },
      ],

      columns: [
        {
          title: "Our Mission",
          body: "We combine accumulated knowledge in surgical procedure protocols with modern engineering methods, meeting them with an academic mindset that continuously explores operational culture.",
        },
        {
          title: "Production Quality",
          body: "High-quality aluminum sheet, 316L stainless steel and advanced manufacturing techniques are used to reduce maintenance costs and provide long-lasting use.",
        },
        {
          title: "Certification",
          body: "Our ISO 13485 certified quality management system, Ministry of Health compliance documents and CE marked product range ensure full compliance in public tenders.",
        },
      ],

      contactEyebrow: "Reach Us",
      contactTitle: "Get in",
      contactTitleAccent: "Touch",
      contactSubtitle:
        "Our sales team is at your service during business hours\nfor all sterile container solutions.",

      contactBlocks: [
        {
          label: "Address",
          lines: ["Maslak Mah. AOS 55. Sokak", "Plaza No:2, Floor 7", "34398 Sarıyer / Istanbul"],
        },
        {
          label: "Phone",
          lines: ["Sales: +90 212 555 08 72", "Technical Support: +90 212 555 08 74", "Fax: +90 212 555 08 75"],
        },
        { label: "Email", lines: ["satis@axeronmed.com", "info@axeronmed.com"] },
      ],

      companyInfo:
        "Axeron Surgical Technologies Medical Inc.\nTax No: 1234567890 · Tax Office: Maslak",

      faqEyebrow: "Frequently Asked Questions",
      faqs: [
        {
          q: "Is there a minimum order quantity?",
          a: "Aluminum containers, stainless steel cases, and wire mesh baskets are sold per unit with no minimum order requirement. Consumable items such as silicone gasket replacement sets have a package-based minimum quantity.",
        },
        {
          q: "Do you provide tender support for public hospitals?",
          a: "Yes. All our sterile container systems have Ministry of Health compliance certificates, ÜRÜNAS registrations, and the required CE / ISO 13485 certifications. Our sales team provides support in preparing public hospital tender documents.",
        },
        {
          q: "How quickly will I receive a response?",
          a: "Requests made during business hours are answered the same day; those made outside business hours are answered the following business morning.",
        },
        {
          q: "What is the warranty coverage for products?",
          a: "All our sterile container system products are guaranteed against manufacturing defects for 24 months. Consumable items such as silicone gasket sets are covered under an integrity warranty.",
        },
        {
          q: "Is custom sizing or logo engraving possible?",
          a: "Custom sizing and hospital/clinic logo laser engraving are possible for orders above certain volumes. Delivery time may be extended by 3–4 weeks compared to standard orders.",
        },
      ],

      formEyebrow: "Contact Form",
      formSubtitle: "We will respond within 1 business day.",
      formCompany: "Company / Institution Name",
      formCompanyPlaceholder: "e.g. Northern Hospital",
      formPerson: "Authorized Person",
      formPersonPlaceholder: "Full Name",
      formEmail: "Email",
      formEmailPlaceholder: "email@institution.com",
      formPhone: "Phone",
      formPhonePlaceholder: "+90 5XX XXX XX XX",
      formSubject: "Subject",
      formSubjectPlaceholder: "— Select Subject —",
      formSubjectOptions: [
        "General Information",
        "Aluminum Container System",
        "Stainless Steel Case",
        "Silicone Gasket Container",
        "Wire Mesh Basket / Tray",
        "Large Transport Case",
        "Technical Support",
      ],
      formMessage: "Your Message",
      formMessagePlaceholder: "Specify your request, product code or questions...",
      formKvkkLink: "Privacy Notice",
      formKvkkSuffix: " — I have read it and consent to the processing of my personal data.",
      formPrivacy: "Your information will not be shared with third parties.",
      formSubmit: "Send",

      ctaEyebrow: "Open for Supply",
      ctaTitle: "Let's work together",

      footerCopy: "© Axeron Medical",
      footerLinks: "Privacy · Support · Contact",
    },
  },
};

export type Translations = (typeof translations)["tr"];
