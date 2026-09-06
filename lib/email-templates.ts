import { EMAIL_RECIPIENT_LANGUAGE_IDS } from "./languages";
import type { DocumentDetails, FollowUpEmail } from "./types";

interface EmailPhrases {
  subject: string;
  greeting: string;
  intro: string;
  listLead: string;
  closing: string;
  regards: string;
  team: string;
}

const PHRASES: Record<string, EmailPhrases> = {
  en: {
    subject: "Action required: missing documents for shipment {ref}",
    greeting: "Dear {carrier} Operations Team,",
    intro:
      "Thank you for submitting {type} {ref} dated {date}. Our Dockify AI audit found items that must be completed before billing approval.",
    listLead: "Please provide:",
    closing:
      "Kindly reply within 2 business days with the corrected documents. Incomplete CMR, POD, and invoice packages cannot be released for payment.",
    regards: "Best regards,",
    team: "Fleet Operations Team",
  },
  de: {
    subject: "Handlungsbedarf: fehlende Unterlagen zur Sendung {ref}",
    greeting: "Sehr geehrtes Operations-Team von {carrier},",
    intro:
      "Vielen Dank für die Einreichung von {type} {ref} vom {date}. Unsere Dockify-KI-Prüfung hat Punkte gefunden, die vor der Rechnungsfreigabe zu klären sind.",
    listLead: "Bitte reichen Sie nach:",
    closing:
      "Bitte antworten Sie innerhalb von 2 Werktagen mit den korrigierten Dokumenten. Unvollständige CMR-, POD- und Rechnungspakete können nicht zur Zahlung freigegeben werden.",
    regards: "Mit freundlichen Grüßen",
    team: "Flottenbetrieb",
  },
  hu: {
    subject: "Intézkedés szükséges: hiányzó dokumentumok a {ref} fuvarhoz",
    greeting: "Tisztelt {carrier} operációs csapat!",
    intro:
      "Köszönjük a(z) {type} {ref} beküldését ({date}). A Dockify AI audit tételeket talált, amelyeket számlajóváhagyás előtt pótolni kell.",
    listLead: "Kérjük, küldjék el:",
    closing:
      "Kérjük, 2 munkanapon belül küldjék a javított dokumentumokat. Hiányos CMR, POD és számla csomagok nem engedélyezhetők kifizetésre.",
    regards: "Üdvözlettel,",
    team: "Flottaüzemeltetés",
  },
  pl: {
    subject: "Wymagane działanie: brakujące dokumenty dla przesyłki {ref}",
    greeting: "Szanowny Zespole Operacyjnym {carrier},",
    intro:
      "Dziękujemy za przesłanie {type} {ref} z dnia {date}. Audyt Dockify AI wykazał pozycje wymagane przed akceptacją faktury.",
    listLead: "Prosimy o dostarczenie:",
    closing:
      "Prosimy o odpowiedź w ciągu 2 dni roboczych z poprawionymi dokumentami. Niekompletne pakiety CMR, POD i faktur nie mogą zostać zwolnione do płatności.",
    regards: "Z poważaniem,",
    team: "Zespół floty",
  },
  ro: {
    subject: "Acțiune necesară: documente lipsă pentru transportul {ref}",
    greeting: "Stimați colegi din operațiuni {carrier},",
    intro:
      "Vă mulțumim pentru transmiterea {type} {ref} din {date}. Auditul AI Dockify a identificat elemente de completat înainte de aprobarea facturii.",
    listLead: "Vă rugăm să furnizați:",
    closing:
      "Răspundeți în 2 zile lucrătoare cu documentele corectate. Pachetele incomplete CMR, POD și factură nu pot fi eliberate la plată.",
    regards: "Cu stimă,",
    team: "Echipa de operațiuni flotă",
  },
  fr: {
    subject: "Action requise : documents manquants pour l’expédition {ref}",
    greeting: "Chère équipe opérations {carrier},",
    intro:
      "Merci d’avoir transmis {type} {ref} daté du {date}. L’audit IA Dockify a relevé des éléments à compléter avant validation de facturation.",
    listLead: "Merci de fournir :",
    closing:
      "Veuillez répondre sous 2 jours ouvrés avec les documents corrigés. Les dossiers CMR, POD et facture incomplets ne peuvent pas être mis en paiement.",
    regards: "Cordialement,",
    team: "Équipe opérations flotte",
  },
  it: {
    subject: "Azione richiesta: documenti mancanti per la spedizione {ref}",
    greeting: "Gentile team operations di {carrier},",
    intro:
      "Grazie per aver inviato {type} {ref} del {date}. L’audit AI Dockify ha individuato elementi da completare prima dell’approvazione della fattura.",
    listLead: "Si prega di fornire:",
    closing:
      "Rispondete entro 2 giorni lavorativi con i documenti corretti. Pacchetti CMR, POD e fattura incompleti non possono essere sbloccati per il pagamento.",
    regards: "Cordiali saluti,",
    team: "Team operazioni flotta",
  },
  nl: {
    subject: "Actie vereist: ontbrekende documenten voor zending {ref}",
    greeting: "Beste operations-team van {carrier},",
    intro:
      "Dank voor het indienen van {type} {ref} d.d. {date}. De Dockify AI-audit vond items die vóór factuurgoedkeuring moeten worden aangevuld.",
    listLead: "Gelieve te verstrekken:",
    closing:
      "Reageer binnen 2 werkdagen met de gecorrigeerde documenten. Onvolledige CMR-, POD- en factuurpakketten kunnen niet voor betaling worden vrijgegeven.",
    regards: "Met vriendelijke groet,",
    team: "Fleet operations",
  },
  es: {
    subject: "Acción requerida: documentos faltantes para el envío {ref}",
    greeting: "Estimado equipo de operaciones de {carrier}:",
    intro:
      "Gracias por enviar {type} {ref} con fecha {date}. La auditoría IA de Dockify detectó elementos que deben completarse antes de aprobar la facturación.",
    listLead: "Por favor, faciliten:",
    closing:
      "Respondan en 2 días laborables con los documentos corregidos. Los paquetes incompletos de CMR, POD y factura no pueden liberarse para pago.",
    regards: "Atentamente,",
    team: "Equipo de operaciones de flota",
  },
  cs: {
    subject: "Vyžadována akce: chybějící doklady k zásilce {ref}",
    greeting: "Vážený operační tým {carrier},",
    intro:
      "Děkujeme za zaslání {type} {ref} ze dne {date}. Audit Dockify AI našel položky, které je nutné doplnit před schválením fakturace.",
    listLead: "Prosím doložte:",
    closing:
      "Odpovězte do 2 pracovních dnů s opravenými dokumenty. Neúplné balíčky CMR, POD a faktur nelze uvolnit k platbě.",
    regards: "S pozdravem,",
    team: "Tým provozu flotily",
  },
  sk: {
    subject: "Vyžadovaná akcia: chýbajúce doklady k zásielke {ref}",
    greeting: "Vážený operačný tím {carrier},",
    intro:
      "Ďakujeme za predloženie {type} {ref} zo dňa {date}. Audit Dockify AI našiel položky, ktoré treba doplniť pred schválením fakturácie.",
    listLead: "Prosím, poskytnite:",
    closing:
      "Odpovedzte do 2 pracovných dní s opravenými dokumentmi. Neúplné balíky CMR, POD a faktúr nemožno uvoľniť na platbu.",
    regards: "S pozdravom,",
    team: "Tím prevádzky flotily",
  },
  bg: {
    subject: "Изисква се действие: липсващи документи за пратка {ref}",
    greeting: "Уважаеми екип операции на {carrier},",
    intro:
      "Благодарим за подаването на {type} {ref} от {date}. AI одитът на Dockify откри елементи, които трябва да се допълнят преди одобрение на фактурата.",
    listLead: "Моля, предоставете:",
    closing:
      "Отговорете в рамките на 2 работни дни с коригираните документи. Непълни пакети CMR, POD и фактура не могат да бъдат освободени за плащане.",
    regards: "С уважение,",
    team: "Екип флотни операции",
  },
  sr: {
    subject: "Potrebna akcija: nedostaju dokumenta za pošiljku {ref}",
    greeting: "Poštovani operations timu {carrier},",
    intro:
      "Hvala na dostavi {type} {ref} od {date}. Dockify AI revizija je pronašla stavke koje treba dopuniti pre odobrenja fakture.",
    listLead: "Molimo dostavite:",
    closing:
      "Odgovorite u roku od 2 radna dana sa ispravljenim dokumentima. Nepotpuni CMR, POD i faktura paketi ne mogu biti pušteni na plaćanje.",
    regards: "Srdačan pozdrav,",
    team: "Tim flote",
  },
  uk: {
    subject: "Потрібна дія: відсутні документи щодо відправлення {ref}",
    greeting: "Шановна команда операцій {carrier}!",
    intro:
      "Дякуємо за подання {type} {ref} від {date}. AI-аудит Dockify виявив пункти, які треба доповнити до затвердження рахунку.",
    listLead: "Будь ласка, надайте:",
    closing:
      "Відповідь протягом 2 робочих днів із виправленими документами. Неповні пакети CMR, POD та рахунку не можуть бути випущені до оплати.",
    regards: "З повагою,",
    team: "Команда флоту",
  },
  sv: {
    subject: "Åtgärd krävs: saknade dokument för sändning {ref}",
    greeting: "Bästa operations-team på {carrier},",
    intro:
      "Tack för att ni skickade in {type} {ref} daterad {date}. Dockify AI-granskning hittade poster som måste kompletteras före fakturagodkännande.",
    listLead: "Vänligen tillhandahåll:",
    closing:
      "Svara inom 2 arbetsdagar med de korrigerade dokumenten. Ofullständiga CMR-, POD- och fakturapaket kan inte släppas för betalning.",
    regards: "Vänliga hälsningar,",
    team: "Fleet operations",
  },
  da: {
    subject: "Handling påkrævet: manglende dokumenter for forsendelse {ref}",
    greeting: "Kære operations-team hos {carrier},",
    intro:
      "Tak for indsendelsen af {type} {ref} dateret {date}. Dockify AI-revisionen fandt punkter, der skal udfyldes før fakturagodkendelse.",
    listLead: "Send venligst:",
    closing:
      "Svar inden for 2 hverdage med de rettede dokumenter. Ufuldstændige CMR-, POD- og fakturapakker kan ikke frigives til betaling.",
    regards: "Med venlig hilsen,",
    team: "Flådeoperationer",
  },
  zh: {
    subject: "需处理：货件 {ref} 缺少文件",
    greeting: "尊敬的 {carrier} 运营团队：",
    intro:
      "感谢提交 {date} 的 {type} {ref}。Dockify AI 审核发现需在账单批准前补齐的事项。",
    listLead: "请提供：",
    closing: "请在 2 个工作日内回复更正后的文件。不完整的 CMR、POD 与发票资料无法放行付款。",
    regards: "此致",
    team: "车队运营团队",
  },
  ja: {
    subject: "対応依頼：貨物 {ref} の不足書類",
    greeting: "{carrier} オペレーションご担当者様",
    intro:
      "{date} 付の {type} {ref} をご提出いただきありがとうございます。Dockify AI監査で、請求承認前に補完が必要な項目が見つかりました。",
    listLead: "以下をご提出ください：",
    closing:
      "修正済み書類を2営業日以内にご返信ください。CMR・POD・請求書が揃っていない場合、支払いは保留となります。",
    regards: "敬具",
    team: "フリート運営チーム",
  },
  ko: {
    subject: "조치 필요: 화물 {ref} 누락 서류",
    greeting: "{carrier} 운영팀 귀중",
    intro:
      "{date} 자 {type} {ref} 제출에 감사드립니다. Dockify AI 감사에서 청구 승인 전 보완이 필요한 항목이 확인되었습니다.",
    listLead: "다음을 제공해 주십시오:",
    closing:
      "수정된 서류를 영업일 2일 이내에 회신해 주십시오. 불완전한 CMR, POD, 인보이스 패키지는 지급이 보류됩니다.",
    regards: "감사합니다.",
    team: "플릿 운영팀",
  },
  vi: {
    subject: "Cần xử lý: thiếu chứng từ cho lô hàng {ref}",
    greeting: "Kính gửi đội vận hành {carrier},",
    intro:
      "Cảm ơn quý vị đã gửi {type} {ref} ngày {date}. Kiểm toán AI Dockify phát hiện các hạng mục cần bổ sung trước khi duyệt thanh toán.",
    listLead: "Vui lòng cung cấp:",
    closing:
      "Xin phản hồi trong 2 ngày làm việc kèm chứng từ đã chỉnh. Bộ CMR, POD và hóa đơn chưa đủ không thể giải phóng thanh toán.",
    regards: "Trân trọng,",
    team: "Đội vận hành đội xe",
  },
  tr: {
    subject: "İşlem gerekli: {ref} sevkiyatı için eksik belgeler",
    greeting: "Sayın {carrier} operasyon ekibi,",
    intro:
      "{date} tarihli {type} {ref} gönderiminiz için teşekkürler. Dockify AI denetimi, fatura onayından önce tamamlanması gereken maddeler tespit etti.",
    listLead: "Lütfen iletin:",
    closing:
      "Düzeltilmiş belgelerle 2 iş günü içinde yanıt verin. Eksik CMR, POD ve fatura paketleri ödemeye çıkarılamaz.",
    regards: "Saygılarımızla,",
    team: "Filo operasyonları",
  },
  ar: {
    subject: "إجراء مطلوب: مستندات ناقصة للشحنة {ref}",
    greeting: "فريق عمليات {carrier} المحترم،",
    intro:
      "شكرًا لتقديم {type} {ref} بتاريخ {date}. كشف تدقيق Dockify بالذكاء الاصطناعي بنودًا يجب استكمالها قبل اعتماد الفوترة.",
    listLead: "يرجى توفير:",
    closing:
      "الرجاء الرد خلال يومي عمل بالمستندات المصححة. لا يمكن إطلاق حزم CMR وPOD والفاتورة غير المكتملة للدفع.",
    regards: "مع التحية،",
    team: "فريق عمليات الأسطول",
  },
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

export function composeFollowUpEmail(
  languageId: string,
  document: DocumentDetails,
  discrepancies: string[],
): FollowUpEmail {
  const phrases = PHRASES[languageId] ?? PHRASES.en;
  const vars = {
    ref: document.shipmentReference || "—",
    carrier: document.carrierName || "Carrier",
    type: document.documentType || "document",
    date: document.documentDate || "—",
  };

  const issues =
    discrepancies.length > 0
      ? discrepancies.map((item, index) => `${index + 1}. ${item}`).join("\n")
      : "—";

  const body = [
    fill(phrases.greeting, vars),
    "",
    fill(phrases.intro, vars),
    "",
    phrases.listLead,
    issues,
    "",
    phrases.closing,
    "",
    phrases.regards,
    phrases.team,
  ].join("\n");

  return {
    subject: fill(phrases.subject, vars),
    body,
  };
}

export function prefillEmailsForDocument(
  document: DocumentDetails,
  discrepancies: string[],
): Record<string, FollowUpEmail> {
  return Object.fromEntries(
    EMAIL_RECIPIENT_LANGUAGE_IDS.map((id) => [
      id,
      composeFollowUpEmail(id, document, discrepancies),
    ]),
  );
}
