import type { Locale } from "./i18n";

/*
  Every user-facing string on the site, in one place, in every language.

  The rule this file exists to enforce: no copy is written inline in a component.
  A string that lives in JSX is a string that has to be found again by hand the
  next time a language is added, and the ones that get missed are never the
  obvious ones — they are the aria-labels, the empty states and the error pages
  nobody looks at in the second language.

  Namespaces follow the surface, not the component tree, so a string moving
  between components does not move between namespaces.

  How to read it:
    server components  MESSAGES[locale].properties.title   (locale from params)
    client components  useMessages().properties.title      (locale from context)

  Both resolve to the same object; only the way they reach it differs, because a
  server component cannot read React context and a client component has no params.
*/

type Copy = {
  common: {
    skipToContent: string;
    clear: string;
    clearAll: string;
    search: string;
    close: string;
    previous: string;
    next: string;
    open: string;
    homeAria: string;
    pagination: string;
  };
  nav: Record<"properties" | "map" | "services" | "blog" | "about" | "contact", string>;
  home: {
    metaTitle: string;
    metaDescription: string;
    heroEyebrow: string;
    heroHeading: string;
    heroBody: string;
    heroRole: string;
    heroAlt: string;
    heroPortraitAlt: string;
    statsEyebrow: string;
    statsHeading: string;
    statYears: string;
    statLanguages: string;
    statGuidance: string;
    servicesEyebrow: string;
    servicesHeading: string;
    servicesMore: string;
    serviceListingsTitle: string;
    serviceListingsBody: string;
    serviceGuideTitle: string;
    serviceGuideBody: string;
    serviceRelocationTitle: string;
    serviceRelocationBody: string;
    r360Eyebrow: string;
    r360Heading: string;
    r360Body: string;
    aboutEyebrow: string;
    aboutHeading: string;
    aboutBody1: string;
    aboutBody2: string;
    aboutCta: string;
    aboutAlt: string;
    aboutStatYears: string;
    aboutStatLanguages: string;
    aboutStatService: string;
    areasEyebrow: string;
    areasHeading: string;
    areasIntro: string;
    boundariesNote: string;
  };
  contact: {
    eyebrow: string;
    heading: string;
    intro: string;
    interestedIn: string;
    message: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    nameLabel: string;
    emailLabel: string;
    /*
      Keyed rather than a plain array: the value posted to /api/contact stays
      the English id, so what lands in Gio's inbox does not change shape
      depending on which language the enquiry came from.
    */
    interests: {
      buying: string;
      investment: string;
      preConstruction: string;
      relocation: string;
      question: string;
    };
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    formHasErrors: string;
    sending: string;
    send: string;
    sent: string;
    sendFailed: string;
    sendUnavailable: string;
    whatsappAria: (number: string) => string;
  };
  properties: {
    /* <title> and <meta description> for /properties. Separate from `heading`
       and `indexIntro`: a SERP snippet is not a page headline, and the index
       used to serve its English title on the Spanish URL because these were a
       module-level constant rather than catalogue keys. */
    metaTitle: string;
    metaDescription: string;
    heading: string;
    intro: string;
    indexIntro: string;
    noMatch: string;
    noMatchFilters: string;
    clearFilters: string;
    nothingListed: string;
    askAvailable: string;
    searchPlaceholder: string;
    searchAria: string;
    noExactMatch: string;
    showingClosest: string;
    location: string;
    propertyType: string;
    bedrooms: string;
    maxPrice: string;
    allAreas: string;
    allTypes: string;
    anyBedrooms: string;
    noMaximum: string;
    /*
      The home search bar phrases its unset options as "Any …" while the
      /properties filters say "All areas". Same idea, different copy, and
      collapsing them would be a content change rather than a translation.
    */
    anyLocation: string;
    anyType: string;
    anyBedroomsOption: string;
    bedroomsPlus: (n: number) => string;
    resultCount: (n: number, filtered: boolean) => string;
    count: (from: number, to: number, total: number) => string;
    /** Facts table + detail page */
    bathrooms: string;
    bedroom: string;
    bedroomsShort: string;
    bathroom: string;
    bathroomsShort: string;
    perMonthShort: string;
    interiorArea: string;
    pricePerM2: string;
    hoa: string;
    walkToBeach: string;
    askAboutThis: string;
    askAboutProperty: string;
    fullDetails: string;
    brokerageListing: string;
    brokerageFull: string;
    repliesNote: string;
    allProperties: string;
    notFoundEyebrow: string;
    notFoundHeading: string;
    notFoundBody: string;
    keyFacts: string;
  };
  calculators: {
    hoaTitle: string;
    beachTitle: string;
    perMonth: string;
    perYear: string;
    monthly: string;
    yearly: string;
    period: string;
    perM2Month: string;
    tryAnotherSize: string;
    byFloorArea: string;
    flatFee: string;
    straightLine: string;
    aboutMinutes: (n: number, pace: string) => string;
    pace: string;
    onTheSand: string;
    tenMinAway: string;
    straightLineNote: (area: string | null) => string;
    gioTimes: (n: number) => string;
    minWalk: string;
    gioTiming: string;
    paceStroll: string;
    paceWalk: string;
    paceBrisk: string;
  };
  gallery: {
    viewPhoto: (i: number, total: number, title: string) => string;
    goToPhoto: (i: number) => string;
    previousPhoto: string;
    nextPhoto: string;
    closeViewer: string;
    photoOf: (i: number, total: number, title: string) => string;
  };
  map: {
    exploreMap: string;
    areasAround: (n: number) => string;
    openFullScreen: string;
    closeMap: string;
    mapAria: string;
    browseBy: string;
    viewProperty: string;
    quickLook: string;
    showAllInList: (n: number) => string;
    backToList: string;
    closeListing: (title: string) => string;
    approximate: string;
    listingsHere: (n: number, from: string) => string;
    tokenMissing: string;
  };
  blog: {
    metaTitle: string;
    metaDescription: string;
    indexEyebrow: string;
    indexHeading: string;
    indexIntro: string;
    indexEmpty: string;
    indexEmptyBody: string;
    getNotified: string;
    allGuides: string;
    inThisGuide: string;
    keepReading: string;
    ctaHeading: string;
    ctaBody: string;
    ctaWhatsApp: string;
    ctaEmail: string;
    emailSubject: string;
    minRead: (n: number) => string;
    notFoundHeading: string;
    notFoundBody: string;
    readOthers: string;
  };
  launcher: {
    greeting: string;
    prompt: string;
    chat: string;
    note: string;
    open: string;
    close: string;
  };
  footer: {
    eyebrow: string;
    heading: string;
    chat: string;
    rights: string;
  };
  switcher: {
    viewIn: (language: string) => string;
  };
};

export const MESSAGES: Record<Locale, Copy> = {
  en: {
    common: {
      skipToContent: "Skip to content",
      clear: "Clear",
      clearAll: "Clear all ✕",
      search: "Search",
      close: "Close",
      previous: "Previous",
      next: "Next",
      open: "Open",
      homeAria: "Gio In The DR — home",
      pagination: "Pagination",
    },
    nav: {
      properties: "Properties",
      map: "Map",
      services: "Services",
      blog: "Blog",
      about: "About",
      contact: "Contact",
    },
    home: {
      metaTitle: "Gio In The DR — Buy Property in Cabarete, Dominican Republic",
      metaDescription:
        "Trilingual agent in Cabarete helping foreigners buy homes, land & investment property on the DR's north coast — guidance in English, Spanish & Italian.",
      heroEyebrow: "Cabarete · Dominican Republic",
      heroHeading: "Buy property & build a life in the Dominican Republic.",
      heroBody:
        "I help you find your place on the north coast: homes, land & investments around Cabarete, guided from first viewing to closing, in your language.",
      heroRole: "Real estate agent · English · Español · Italiano",
      heroAlt: "Gio, real estate agent in Cabarete",
      heroPortraitAlt:
        "Gio, real estate agent, at a beachfront property in Cabarete, Dominican Republic",
      statsEyebrow: "Highlights",
      statsHeading:
        "A trilingual agent who moved here herself — helping foreigners buy with confidence.",
      statYears: "Years helping foreigners buy in the DR",
      statLanguages: "Languages spoken — English, Spanish, Italian",
      statGuidance: "Personal guidance from search to closing",
      servicesEyebrow: "Services",
      servicesHeading: "How I help you buy — and settle into — life in the DR.",
      servicesMore: "Explore more →",
      serviceListingsTitle: "Property Listings",
      serviceListingsBody:
        "Curated homes, land and commercial spaces around Cabarete and the north coast — vetted before you ever see them.",
      serviceGuideTitle: "Your Guide in Cabarete",
      serviceGuideBody:
        "Think of me as your local guide. I'll share honest advice, local insights, and help you navigate the market with confidence from day one.",
      serviceRelocationTitle: "Relocation Support",
      serviceRelocationBody:
        "Residency, the buying process, taxes and financing — explained clearly in your language so you can settle with ease.",
      r360Eyebrow: "Beyond the listing",
      r360Heading: "Real estate in 360°",
      r360Body:
        "Buying a property is more than choosing a condo. I help you understand the full picture before you commit — so you know exactly what you're getting into.",
      aboutEyebrow: "About Gio",
      aboutHeading: "An Italian who chose the Dominican Republic.",
      aboutBody1:
        "I moved to the Dominican Republic from Italy and made Cabarete home. For the past four years I've helped foreigners buy here.",
      aboutBody2:
        "Because I speak English, Spanish and Italian — and made the move myself — I understand exactly what you're weighing up.",
      aboutCta: "Work with Gio",
      aboutAlt: "Gio, real estate agent in Cabarete, Dominican Republic",
      aboutStatYears: "Years in DR real estate",
      aboutStatLanguages: "Languages — EN · ES · IT",
      aboutStatService: "Personal service, start to finish",
      areasEyebrow: "North coast",
      areasHeading: "Explore by area",
      areasIntro:
        "Take a closer look at Cabarete and Sosúa. Use the map to understand where each area is, how the neighborhoods connect, and what makes each one unique: from beaches and local life to restaurants, amenities and atmosphere. Especially if it's your first time here, the map gives you an easy feel for the area and helps you discover which neighborhood might be the right fit for you.",
      boundariesNote: "Boundaries approximate.",
    },
    contact: {
      eyebrow: "Get in touch",
      heading: "Tell me what you're looking for.",
      intro:
        "Share a few details and I'll get back to you — in English, Spanish or Italian. Prefer to chat now? Message me on WhatsApp any time.",
      interestedIn: "I'm interested in",
      message: "Message",
      namePlaceholder: "Your name…",
      emailPlaceholder: "you@email.com…",
      messagePlaceholder: "Budget, area, timeline — whatever helps…",
      nameLabel: "Name",
      emailLabel: "Email",
      interests: {
        buying: "Buying a home",
        investment: "Investment property",
        preConstruction: "Pre-construction",
        relocation: "Relocation & residency",
        question: "Just have a question",
      },
      nameRequired: "Add your name so Gio knows who's writing.",
      emailRequired: "Add an email address so Gio can reply.",
      emailInvalid: "That address looks incomplete — check for a typo.",
      formHasErrors: "The form has errors. Check the highlighted fields.",
      sending: "Sending…",
      send: "Send Message",
      sent: "Message sent — Gio will be in touch soon.",
      sendFailed: "Something went wrong. Please try again.",
      sendUnavailable: "Unable to send your message right now. Please try again later.",
      whatsappAria: (number) => `Message Gio on WhatsApp at ${number}`,
    },
    properties: {
      metaTitle: "Property for sale in Cabarete & Sosúa — Gio In The DR",
      metaDescription:
        "Every listing Gio has published: beachfront condos, villas, land and pre-construction around Cabarete, Sosúa and the Dominican north coast.",
      heading: "Find your property",
      intro:
        "Search beachfront condos, villas, investment and pre-construction across the north coast.",
      indexIntro:
        "Beachfront condos, villas, land and pre-construction across Cabarete, Sosúa and the north coast.",
      noMatch: "No properties match your search.",
      noMatchFilters: "Nothing matches those filters.",
      clearFilters: "Clear filters",
      nothingListed:
        "Nothing is listed publicly right now — a lot of what Gio sells never gets that far. Message her and she'll tell you what's actually available.",
      askAvailable: "Ask Gio what's available",
      searchPlaceholder: "Beachfront, penthouse, Kite Beach…",
      searchAria: "Search by name, area or keyword",
      noExactMatch: "No exact match for",
      showingClosest: "— showing the closest listings.",
      location: "Location",
      propertyType: "Property type",
      bedrooms: "Bedrooms",
      maxPrice: "Max price",
      allAreas: "All areas",
      allTypes: "All types",
      anyBedrooms: "Any",
      noMaximum: "No maximum",
      anyLocation: "Any location",
      anyType: "Any type",
      anyBedroomsOption: "Any bedrooms",
      bedroomsPlus: (n) => `${n}+ ${n === 1 ? "bedroom" : "bedrooms"}`,
      resultCount: (n, filtered) => {
        const noun = n === 1 ? "property" : "properties";
        if (!filtered) return `${n} ${noun}`;
        return `${n} ${noun} ${n === 1 ? "matches" : "match"} your search`;
      },
      count: (from, to, total) =>
        `${from}–${to} of ${total} ${total === 1 ? "property" : "properties"}`,
      bathrooms: "Bathrooms",
      bedroom: "bed",
      bedroomsShort: "beds",
      bathroom: "bath",
      bathroomsShort: "baths",
      perMonthShort: "/mo",
      interiorArea: "Interior area",
      pricePerM2: "Price per m²",
      hoa: "HOA",
      walkToBeach: "Walk to the beach",
      askAboutThis: "Ask Gio about this",
      askAboutProperty: "Ask Gio about this property",
      fullDetails: "Full details page",
      brokerageListing: "Listing on the brokerage site ↗",
      brokerageFull: "Full listing on the brokerage site ↗",
      repliesNote: "English, Spanish & Italian — usually replies the same day.",
      allProperties: "← All properties",
      notFoundEyebrow: "No longer listed",
      notFoundHeading: "This property isn't available.",
      notFoundBody:
        "It may have sold, or the link may be out of date. Gio usually has something comparable that never reaches the site.",
      keyFacts: "Key facts for",
    },
    calculators: {
      hoaTitle: "What the HOA costs",
      beachTitle: "How close the sand is",
      perMonth: "/ month",
      perYear: "/ year",
      monthly: "Monthly",
      yearly: "Yearly",
      period: "Period",
      perM2Month: "/ m² / month",
      tryAnotherSize: "Try another size",
      byFloorArea:
        "This building charges by floor area, so a bigger unit costs proportionally more to hold.",
      flatFee: "A flat fee — it does not change with the size of the unit.",
      straightLine: "in a straight line",
      aboutMinutes: (n, pace) => `About ${n} min ${pace}`,
      pace: "Walking pace",
      onTheSand: "On the sand",
      tenMinAway: "10 min away",
      straightLineNote: (area) =>
        `Straight line to the beach access${area ? ` for ${area}` : ""}, so the real walk is a little longer.`,
      gioTimes: (n) => ` Gio times it at ${n} min.`,
      minWalk: "walk",
      gioTiming: "Gio's own timing, walking the route people actually take.",
      paceStroll: "Strolling",
      paceWalk: "Walking",
      paceBrisk: "Brisk",
    },
    gallery: {
      viewPhoto: (i, total, title) => `View photo ${i} of ${total} of ${title} full screen`,
      goToPhoto: (i) => `Go to photo ${i}`,
      previousPhoto: "Previous photo",
      nextPhoto: "Next photo",
      closeViewer: "Close photo viewer",
      photoOf: (i, total, title) => `${title} — photo ${i} of ${total}`,
    },
    map: {
      exploreMap: "Explore the map",
      areasAround: (n) => `${n} areas on the north coast`,
      openFullScreen: "Open the full-screen map",
      closeMap: "Close the map",
      mapAria: "Map of Cabarete neighbourhoods",
      browseBy: "Browse by",
      viewProperty: "View property →",
      quickLook: "Quick look",
      showAllInList: (n) => `Show all ${n} in the list`,
      backToList: "← Back to list",
      closeListing: (title) => `Close ${title}`,
      approximate: "approximate location",
      listingsHere: (n, from) => `${n} listings here, from ${from}`,
      tokenMissing: "Map needs NEXT_PUBLIC_MAPBOX_TOKEN in .env.local. The area details below work without it.",
    },
    blog: {
      metaTitle: "Guides to buying & living on the DR's north coast — Gio In The DR",
      metaDescription:
        "Guides on buying property, residency, taxes and living on the Dominican Republic's north coast.",
      indexEyebrow: "Guides & stories",
      indexHeading: "Buying on the north coast.",
      indexIntro:
        "Real answers to the questions people ask before moving or buying: from neighborhoods and property taxes to the cost of living and what everyday life in Cabarete is really like.",
      indexEmpty: "The blog is on the way.",
      indexEmptyBody:
        "Soon: the 2026 Dominican Republic Buyer's Guide, area guides for Cabarete & Sosúa, and practical notes on residency, taxes and financing — all editable from the backend.",
      getNotified: "Get notified",
      allGuides: "← All guides",
      inThisGuide: "In this guide",
      keepReading: "Keep reading",
      ctaHeading: "Questions this didn't answer?",
      ctaBody: "Gio works in English, Spanish and Italian, and usually replies the same day.",
      ctaWhatsApp: "Message Gio on WhatsApp",
      ctaEmail: "Email Gio",
      emailSubject: "Question about",
      minRead: (n) => `${n} min read`,
      notFoundHeading: "That guide isn't here.",
      notFoundBody: "The link may be out of date, or the post may not be published yet.",
      readOthers: "Read the other guides",
    },
    launcher: {
      greeting: "Hi, I'm Gio 👋",
      prompt: "What brings you to the DR?",
      chat: "Chat on WhatsApp",
      note: "Replies in English · Español · Italiano. An AI assistant will answer common questions here soon.",
      open: "Open chat",
      close: "Close chat",
    },
    footer: {
      eyebrow: "Let's talk",
      heading: "Find your place in the Dominican Republic.",
      chat: "Chat on WhatsApp",
      rights: "© 2026 Gio In The DR. All rights reserved.",
    },
    switcher: { viewIn: (language) => `View this page in ${language}` },
  },

  es: {
    common: {
      skipToContent: "Saltar al contenido",
      clear: "Limpiar",
      clearAll: "Limpiar todo ✕",
      search: "Buscar",
      close: "Cerrar",
      previous: "Anterior",
      next: "Siguiente",
      open: "Abrir",
      homeAria: "Gio In The DR — inicio",
      pagination: "Paginación",
    },
    nav: {
      properties: "Propiedades",
      map: "Mapa",
      services: "Servicios",
      blog: "Blog",
      about: "Sobre mí",
      contact: "Contacto",
    },
    home: {
      metaTitle: "Gio In The DR — Compra propiedad en Cabarete, República Dominicana",
      metaDescription:
        "Agente trilingüe en Cabarete que ayuda a extranjeros a comprar casas, terrenos e inversión en la costa norte dominicana — en español, inglés e italiano.",
      heroEyebrow: "Cabarete · República Dominicana",
      heroHeading: "Compra tu propiedad y construye tu vida en República Dominicana.",
      heroBody:
        "Te ayudo a encontrar tu lugar en la costa norte: casas, terrenos e inversiones en la zona de Cabarete, acompañándote desde la primera visita hasta el cierre, en tu idioma.",
      heroRole: "Agente inmobiliaria · English · Español · Italiano",
      heroAlt: "Gio, agente inmobiliaria en Cabarete",
      heroPortraitAlt:
        "Gio, agente inmobiliaria, en una propiedad frente al mar en Cabarete, República Dominicana",
      statsEyebrow: "En resumen",
      statsHeading:
        "Una agente trilingüe que también se mudó aquí — para que compres con confianza.",
      statYears: "Años ayudando a extranjeros a comprar en RD",
      statLanguages: "Idiomas — inglés, español, italiano",
      statGuidance: "Acompañamiento personal, de la búsqueda al cierre",
      servicesEyebrow: "Servicios",
      servicesHeading: "Cómo te ayudo a comprar — y a instalarte — en República Dominicana.",
      servicesMore: "Ver más →",
      serviceListingsTitle: "Propiedades",
      serviceListingsBody:
        "Casas, terrenos y locales seleccionados en Cabarete y la costa norte, revisados antes de que los veas.",
      serviceGuideTitle: "Tu guía en Cabarete",
      serviceGuideBody:
        "Piensa en mí como tu guía local. Te doy consejos honestos, información de primera mano y te ayudo a moverte en el mercado con confianza desde el primer día.",
      serviceRelocationTitle: "Apoyo en la mudanza",
      serviceRelocationBody:
        "Residencia, el proceso de compra, impuestos y financiamiento — explicados con claridad en tu idioma para que te instales sin complicaciones.",
      r360Eyebrow: "Más allá del anuncio",
      r360Heading: "Bienes raíces en 360°",
      r360Body:
        "Comprar una propiedad es mucho más que elegir un apartamento. Te ayudo a entender el panorama completo antes de comprometerte, para que sepas exactamente en qué te estás metiendo.",
      aboutEyebrow: "Sobre Gio",
      aboutHeading: "Una italiana que eligió República Dominicana.",
      aboutBody1:
        "Me mudé a República Dominicana desde Italia y convertí Cabarete en mi casa. Durante los últimos cuatro años he ayudado a extranjeros a comprar aquí.",
      aboutBody2:
        "Como hablo inglés, español e italiano — y di el paso yo misma — entiendo exactamente lo que estás sopesando.",
      aboutCta: "Trabaja con Gio",
      aboutAlt: "Gio, agente inmobiliaria en Cabarete, República Dominicana",
      aboutStatYears: "Años en bienes raíces en RD",
      aboutStatLanguages: "Idiomas — EN · ES · IT",
      aboutStatService: "Trato personal, de principio a fin",
      areasEyebrow: "Costa norte",
      areasHeading: "Explora por zona",
      areasIntro:
        "Conoce Cabarete y Sosúa de cerca. Usa el mapa para entender dónde está cada zona, cómo se conectan los barrios y qué hace única a cada uno: desde las playas y la vida local hasta los restaurantes, los servicios y el ambiente. Sobre todo si es tu primera vez aquí, el mapa te da una idea rápida de la zona y te ayuda a descubrir qué barrio puede encajar contigo.",
      boundariesNote: "Los límites son aproximados.",
    },
    contact: {
      eyebrow: "Hablemos",
      heading: "Cuéntame qué estás buscando.",
      intro:
        "Déjame algunos datos y te respondo — en inglés, español o italiano. ¿Prefieres hablar ahora? Escríbeme por WhatsApp cuando quieras.",
      interestedIn: "Me interesa",
      message: "Mensaje",
      namePlaceholder: "Tu nombre…",
      emailPlaceholder: "tu@correo.com…",
      messagePlaceholder: "Presupuesto, zona, plazos — lo que ayude…",
      nameLabel: "Nombre",
      emailLabel: "Email",
      interests: {
        buying: "Comprar una casa",
        investment: "Propiedad de inversión",
        preConstruction: "Preconstrucción",
        relocation: "Mudanza y residencia",
        question: "Solo tengo una pregunta",
      },
      nameRequired: "Escribe tu nombre para que Gio sepa quién le escribe.",
      emailRequired: "Escribe un correo para que Gio pueda responderte.",
      emailInvalid: "Ese correo parece incompleto — revisa que no falte nada.",
      formHasErrors: "El formulario tiene errores. Revisa los campos marcados.",
      sending: "Enviando…",
      send: "Enviar mensaje",
      sent: "Mensaje enviado — Gio te escribirá pronto.",
      sendFailed: "Algo salió mal. Inténtalo de nuevo.",
      sendUnavailable: "No se puede enviar tu mensaje ahora mismo. Inténtalo más tarde.",
      whatsappAria: (number) => `Escríbele a Gio por WhatsApp al ${number}`,
    },
    properties: {
      metaTitle: "Propiedades en venta en Cabarete y Sosúa — Gio In The DR",
      metaDescription:
        "Todas las propiedades que Gio publica: apartamentos frente al mar, villas, terrenos y preconstrucción en Cabarete, Sosúa y la costa norte dominicana.",
      heading: "Encuentra tu propiedad",
      intro:
        "Busca apartamentos frente al mar, villas, inversión y preconstrucción en toda la costa norte.",
      indexIntro:
        "Apartamentos frente al mar, villas, terrenos y preconstrucción en Cabarete, Sosúa y la costa norte.",
      noMatch: "Ninguna propiedad coincide con tu búsqueda.",
      noMatchFilters: "Nada coincide con esos filtros.",
      clearFilters: "Limpiar filtros",
      nothingListed:
        "Ahora mismo no hay nada publicado — mucho de lo que Gio vende nunca llega a publicarse. Escríbele y te dice qué hay disponible de verdad.",
      askAvailable: "Pregúntale a Gio qué hay disponible",
      searchPlaceholder: "Frente al mar, penthouse, Kite Beach…",
      searchAria: "Buscar por nombre, zona o palabra clave",
      noExactMatch: "Sin coincidencia exacta para",
      showingClosest: "— mostrando las propiedades más parecidas.",
      location: "Zona",
      propertyType: "Tipo de propiedad",
      bedrooms: "Habitaciones",
      maxPrice: "Precio máximo",
      allAreas: "Todas las zonas",
      allTypes: "Todos los tipos",
      anyBedrooms: "Cualquiera",
      noMaximum: "Sin máximo",
      anyLocation: "Cualquier zona",
      anyType: "Cualquier tipo",
      anyBedroomsOption: "Cualquier número de habitaciones",
      bedroomsPlus: (n) => `${n}+ ${n === 1 ? "habitación" : "habitaciones"}`,
      /*
        Spanish agrees the verb with the count, same as English, but the noun
        is feminine — "1 propiedad coincide", "3 propiedades coinciden".
      */
      resultCount: (n, filtered) => {
        const noun = n === 1 ? "propiedad" : "propiedades";
        if (!filtered) return `${n} ${noun}`;
        return `${n} ${noun} ${n === 1 ? "coincide" : "coinciden"} con tu búsqueda`;
      },
      count: (from, to, total) =>
        `${from}–${to} de ${total} ${total === 1 ? "propiedad" : "propiedades"}`,
      bathrooms: "Baños",
      bedroom: "hab",
      bedroomsShort: "hab",
      bathroom: "baño",
      bathroomsShort: "baños",
      perMonthShort: "/mes",
      interiorArea: "Área interior",
      pricePerM2: "Precio por m²",
      hoa: "Mantenimiento",
      walkToBeach: "Caminata a la playa",
      askAboutThis: "Pregúntale a Gio",
      askAboutProperty: "Pregúntale a Gio por esta propiedad",
      fullDetails: "Ver ficha completa",
      brokerageListing: "Anuncio en el sitio de la agencia ↗",
      brokerageFull: "Anuncio completo en el sitio de la agencia ↗",
      repliesNote: "Inglés, español e italiano — normalmente responde el mismo día.",
      allProperties: "← Todas las propiedades",
      notFoundEyebrow: "Ya no está publicada",
      notFoundHeading: "Esta propiedad no está disponible.",
      notFoundBody:
        "Puede que se haya vendido o que el enlace esté desactualizado. Gio suele tener algo parecido que nunca llega al sitio.",
      keyFacts: "Datos clave de",
    },
    calculators: {
      hoaTitle: "Cuánto cuesta el mantenimiento",
      beachTitle: "Qué tan cerca está la arena",
      perMonth: "/ mes",
      perYear: "/ año",
      monthly: "Mensual",
      yearly: "Anual",
      period: "Periodo",
      perM2Month: "/ m² / mes",
      tryAnotherSize: "Prueba otro tamaño",
      byFloorArea:
        "Este edificio cobra por metro cuadrado, así que una unidad más grande cuesta proporcionalmente más de mantener.",
      flatFee: "Una cuota fija — no cambia con el tamaño de la unidad.",
      straightLine: "en línea recta",
      aboutMinutes: (n, pace) => `Unos ${n} min ${pace}`,
      pace: "Ritmo al caminar",
      onTheSand: "En la arena",
      tenMinAway: "A 10 min",
      straightLineNote: (area) =>
        `Línea recta hasta el acceso a la playa${area ? ` de ${area}` : ""}, así que la caminata real es un poco más larga.`,
      gioTimes: (n) => ` Gio la cronometra en ${n} min.`,
      minWalk: "caminando",
      gioTiming: "El tiempo de Gio, caminando la ruta que la gente toma de verdad.",
      paceStroll: "paseando",
      paceWalk: "caminando",
      paceBrisk: "a paso rápido",
    },
    gallery: {
      viewPhoto: (i, total, title) =>
        `Ver la foto ${i} de ${total} de ${title} en pantalla completa`,
      goToPhoto: (i) => `Ir a la foto ${i}`,
      previousPhoto: "Foto anterior",
      nextPhoto: "Foto siguiente",
      closeViewer: "Cerrar el visor de fotos",
      photoOf: (i, total, title) => `${title} — foto ${i} de ${total}`,
    },
    map: {
      exploreMap: "Explora el mapa",
      areasAround: (n) => `${n} zonas en la costa norte`,
      openFullScreen: "Abrir el mapa en pantalla completa",
      closeMap: "Cerrar el mapa",
      mapAria: "Mapa de los barrios de Cabarete",
      browseBy: "Ver por",
      viewProperty: "Ver propiedad →",
      quickLook: "Vista rápida",
      showAllInList: (n) => `Ver las ${n} en la lista`,
      backToList: "← Volver a la lista",
      closeListing: (title) => `Cerrar ${title}`,
      approximate: "ubicación aproximada",
      listingsHere: (n, from) => `${n} propiedades aquí, desde ${from}`,
      tokenMissing:
        "El mapa necesita NEXT_PUBLIC_MAPBOX_TOKEN en .env.local. Los detalles de las zonas funcionan sin él.",
    },
    blog: {
      metaTitle: "Guías para comprar y vivir en la costa norte — Gio In The DR",
      metaDescription:
        "Guías sobre comprar propiedad, residencia, impuestos y la vida en la costa norte de República Dominicana.",
      indexEyebrow: "Guías e historias",
      indexHeading: "Comprar en la costa norte.",
      indexIntro:
        "Respuestas reales a las preguntas que la gente hace antes de mudarse o comprar: desde los barrios y los impuestos hasta el costo de vida y cómo es de verdad el día a día en Cabarete.",
      indexEmpty: "El blog viene en camino.",
      indexEmptyBody:
        "Pronto: la Guía del Comprador 2026 para República Dominicana, guías de zona de Cabarete y Sosúa, y notas prácticas sobre residencia, impuestos y financiamiento.",
      getNotified: "Avísame",
      allGuides: "← Todas las guías",
      inThisGuide: "En esta guía",
      keepReading: "Sigue leyendo",
      ctaHeading: "¿Te quedaron preguntas?",
      ctaBody: "Gio habla inglés, español e italiano, y normalmente responde el mismo día.",
      ctaWhatsApp: "Escríbele a Gio por WhatsApp",
      ctaEmail: "Escríbele por correo",
      emailSubject: "Pregunta sobre",
      minRead: (n) => `${n} min de lectura`,
      notFoundHeading: "Esa guía no está aquí.",
      notFoundBody: "El enlace puede estar desactualizado, o la publicación aún no está publicada.",
      readOthers: "Ver las otras guías",
    },
    launcher: {
      greeting: "Hola, soy Gio 👋",
      prompt: "¿Qué te trae a República Dominicana?",
      chat: "Escríbeme por WhatsApp",
      note: "Respondo en inglés · español · italiano. Pronto un asistente de IA responderá aquí las preguntas frecuentes.",
      open: "Abrir el chat",
      close: "Cerrar el chat",
    },
    footer: {
      eyebrow: "Hablemos",
      heading: "Encuentra tu lugar en República Dominicana.",
      chat: "Escríbeme por WhatsApp",
      rights: "© 2026 Gio In The DR. Todos los derechos reservados.",
    },
    switcher: { viewIn: (language) => `Ver esta página en ${language}` },
  },
};
