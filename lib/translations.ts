export type Locale = "en" | "hu" | "de" | "ro";

const translations = {
  en: {
    app: {
      name: "Dockify",
      productName: "Dockify Fleet Compliance Scanner",
      tagline: "AI-powered CMR, POD & invoice verification for logistics teams",
      subtitle: "Upload freight documents to verify completeness and billing readiness in seconds.",
    },
    nav: {
      dashboard: "Dashboard",
      newAudit: "New Audit",
      product: "Product",
      features: "Features",
      pricing: "Pricing",
      tryAudit: "Try Instant Audit",
    },
    landing: {
      badge: "AI Vision for freight, forwarding & billing teams",
      headline: "Automate Logistics Document Compliance in Seconds",
      subtitle:
        "AI-powered Vision audit for CMRs, Invoices, and PODs. Instantly flag missing stamps, signatures, or weight mismatches.",
      ctaPrimary: "Try Instant Audit",
      ctaSecondary: "View Pricing",
      trust: "Trusted workflow for dispatch, billing, and compliance desks",
      statAudits: "Seconds per audit",
      statDocs: "CMR · POD · Invoice",
      statLang: "EN · HU · DE · RO emails",
    },
    value: {
      kicker: "Why Dockify",
      title: "Close the gap between paper freight docs and billable shipments",
      extractionTitle: "Instant Extraction",
      extractionBody:
        "Vision AI reads parties, plates, weights, dates, and references from scans and photos — no manual re-keying.",
      discrepancyTitle: "Automatic Discrepancy Detection",
      discrepancyBody:
        "Flag missing stamps, signatures, and weight mismatches before they stall dispatch approval or invoicing.",
      emailTitle: "Multi-language Follow-up Emails",
      emailBody:
        "Generate carrier-ready follow-ups the moment an audit fails — copy, send, and keep billing moving.",
    },
    pricing: {
      kicker: "Pricing",
      title: "Plans that scale with your audit volume",
      subtitle: "Start with a live audit today. Upgrade when your freight desk is ready for API and unlimited volume.",
      perMonth: "/mo",
      popular: "Most popular",
      starterName: "Starter",
      starterPrice: "$49",
      starterAudits: "100 audits / month",
      starterCta: "Get started",
      starterF1: "CMR, POD & invoice vision audit",
      starterF2: "Discrepancy flags & risk score",
      starterF3: "English follow-up email draft",
      starterF4: "Photo & PDF upload",
      proName: "Pro",
      proPrice: "$149",
      proAudits: "500 audits / month",
      proCta: "Start Pro",
      proF1: "Everything in Starter",
      proF2: "Multi-language follow-up emails",
      proF3: "Priority processing",
      proF4: "Shared workspace for ops & billing",
      enterpriseName: "Enterprise",
      enterprisePrice: "Custom",
      enterpriseAudits: "Unlimited audits & API access",
      enterpriseCta: "Talk to sales",
      enterpriseF1: "Unlimited document audits",
      enterpriseF2: "REST API & SSO",
      enterpriseF3: "Dedicated success manager",
      enterpriseF4: "Custom retention & DPA",
    },
    upload: {
      title: "Run an Instant Audit",
      kicker: "Live product",
      description: "Drag and drop your CMR, POD, or invoice here, or click to browse",
      acceptedFormats: "Accepted formats: PDF, DOCX, JPG, JPEG, PNG (max 10 MB)",
      browse: "Browse files",
      takePhoto: "Take photo",
      selectedFile: "Selected file",
      removeFile: "Remove",
      runAudit: "Run AI Audit",
      loadSample: "Load Sample Audit",
      auditing: "Running AI audit…",
      auditingDetail: "Verifying CMR, POD & invoice fields…",
      dropHere: "Drop file here",
    },
    audit: {
      completed: "Audit completed",
    },
    document: {
      title: "Document Details",
      carrierName: "Carrier / Haulier",
      shipper: "Shipper",
      consignee: "Consignee",
      vehiclePlate: "Vehicle Plate",
      cargoWeight: "Cargo Weight",
      signaturePresent: "Signature",
      stampPresent: "Stamp",
      present: "Present",
      notPresent: "Not present",
      documentDate: "Document Date",
      documentType: "Document Type",
      shipmentReference: "Shipment Reference",
      riskLevel: "Overall Risk Level",
    },
    documentCategory: {
      cmr: "CMR",
      pod: "POD",
      invoice: "Invoice",
      unknown: "Unknown",
    },
    risk: {
      compliant: "Compliant",
      actionNeeded: "Action Needed",
      highRisk: "High Risk",
    },
    checklist: {
      title: "Logistics Document Verification Checklist",
      columnItem: "Verification Item",
      columnCategory: "Category",
      columnStatus: "Status",
      columnExplanation: "AI Analysis",
      categoryCmr: "CMR",
      categoryPod: "POD",
      categoryInvoice: "Invoice",
      cmrConsignmentNote: "CMR Number & Consignment Note Format",
      cmrPartiesAndRoute: "Parties, Route & Loading/Unloading Points",
      cmrGoodsAndWeight: "Goods Description, Packages & Gross Weight",
      podDeliveryConfirmation: "Delivery Address & Consignee Confirmation",
      podSignatureAndTimestamp: "Recipient Signature, Stamp & Date/Time",
      podConditionNotes: "Delivery Condition & Exception Notes",
      invoiceHeaderDetails: "Invoice Number, Date & Billing References",
      invoiceLineItemsMatch: "Line Items Match Shipment / CMR Data",
      invoiceVatAndPayment: "VAT, Tax Breakdown & Payment Terms",
    },
    status: {
      compliant: "Compliant",
      missing: "Missing",
      unclear: "Unclear",
    },
    discrepancies: {
      title: "Discrepancies & Missing Fields",
      subtitle: "Issues identified that may block dispatch approval or invoicing",
      empty: "No critical discrepancies detected.",
      allClear: "All clear",
    },
    email: {
      title: "Auto-Generated Follow-Up Email",
      subtitle: "Copy and send to the carrier or client to request missing documents",
      copy: "Copy",
      copied: "Copied",
      send: "Send email",
      subject: "Subject",
      body: "Message",
    },
    empty: {
      title: "No audit results yet",
      description: "Upload a CMR, POD, or invoice — or load the sample audit — to view verification results.",
    },
    errors: {
      invalidFileType: "Please upload a PDF, DOCX, JPG, JPEG, or PNG file.",
      fileTooLarge: "File exceeds the 10 MB limit.",
      auditFailed: "Audit failed. Please try again.",
      noFile: "Please select a file before running the audit.",
      openaiFailed: "AI audit service is temporarily unavailable. Try again or load the sample audit.",
      openaiKeyMissing: "Server OpenAI configuration is missing. Contact your administrator.",
    },
    footer: {
      poweredBy: "Powered by Dockify AI · CMR, POD & invoice verification",
      product: "Product",
      legal: "Compliance automation for European freight operations.",
    },
  },
  hu: {},
  de: {},
  ro: {},
} as const;

export type Translations = typeof translations.en;

export function getTranslations(locale: Locale = "en"): Translations {
  const localeTranslations = translations[locale];
  if (locale === "en" || Object.keys(localeTranslations).length === 0) {
    return translations.en;
  }
  return { ...translations.en, ...localeTranslations } as Translations;
}

export { translations };
