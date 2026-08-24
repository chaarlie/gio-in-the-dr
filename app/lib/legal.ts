import { EMAIL } from "./email";
import { WHATSAPP_DISPLAY } from "./whatsapp";
import type { Locale } from "./i18n";

/*
  The privacy and cookies policies, in both languages.

  Deliberately not in ./messages, which is a catalogue of UI chrome — labels,
  placeholders, aria text. These are documents: long prose with a structure of
  their own, and dropping four hundred lines of them into the middle of the
  catalogue would bury the strings people actually go there to edit.

  They are structured rather than written as HTML so both languages are forced
  into the same shape. A policy that grows a section in English and not in
  Spanish is the failure mode here, and it is invisible in free text; a typed
  section list makes it a compile error.

  Everything below describes what this site really does. Before changing the
  code, check the claim: "no analytics" is a promise the markup has to keep, and
  adding a tracking script silently turns this page into a false statement.
*/

export const LEGAL_SLUGS = ["privacy", "cookies"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

/*
  When these documents last changed, as one date for both.

  A per-document date would be more precise and would drift: the two policies
  cross-reference each other, so a change to one is usually a change to both,
  and the version that gets forgotten is the one nobody is looking at. Bump this
  when you edit either.
*/
export const LEGAL_UPDATED = "2026-08-24";

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; columns: string[]; rows: string[][] };

export type LegalSection = {
  /** Stable across languages — it is the anchor, so it stays English. */
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
};

type LegalCopy = {
  updatedLabel: (date: string) => string;
  docs: Record<LegalSlug, LegalDoc>;
};

export const LEGAL: Record<Locale, LegalCopy> = {
  en: {
    updatedLabel: (date) => `Last updated ${date}`,
    docs: {
      privacy: {
        metaTitle: "Privacy Policy — Gio In The DR",
        metaDescription:
          "What happens to your information when you use this site: what is collected, who processes it, how long it is kept, and how to have it deleted.",
        eyebrow: "Legal",
        title: "Privacy Policy",
        intro:
          "This site belongs to Gio — Giorgia Loglio — a real estate agent working in Cabarete, on the north coast of the Dominican Republic. This page explains what happens to your information when you use it, in plain language rather than the usual.",
        sections: [
          {
            id: "who",
            heading: "Who is responsible",
            blocks: [
              {
                kind: "p",
                text: "Giorgia Loglio, real estate agent, Cabarete, Puerto Plata province, Dominican Republic. She decides what happens to information collected here, and she is the person to contact about it.",
              },
              {
                kind: "p",
                text: `Email: ${EMAIL}. WhatsApp: ${WHATSAPP_DISPLAY}.`,
              },
            ],
          },
          {
            id: "collected",
            heading: "What this site collects",
            blocks: [
              {
                kind: "list",
                items: [
                  "The contact form: your name, your email address, the topic you pick from the list, and whatever you write in the message box.",
                  "WhatsApp and email: whatever you choose to send when you start a conversation — including your phone number, if you write on WhatsApp.",
                  "Ordinary server records: like every website, the servers delivering these pages keep short technical logs — IP address, browser and device type, which page was requested and when. They exist for security and troubleshooting, not to build a picture of you.",
                  "A language preference: one cookie remembering whether you chose English or Spanish. It is the only thing this site stores in your browser — see the Cookies Policy.",
                ],
              },
              {
                kind: "p",
                text: "There is no analytics, no advertising pixel and no tracking script anywhere on this site. Nobody is being followed from page to page.",
              },
            ],
          },
          {
            id: "why",
            heading: "What it is used for",
            blocks: [
              {
                kind: "list",
                items: [
                  "To answer you. A form submission is delivered straight to Gio's inbox as an email — it is not saved to a database here.",
                  "To show the site in the language you chose.",
                  "To keep the site working and secure.",
                ],
              },
              {
                kind: "p",
                text: "Your details are never sold, rented, or added to a marketing list. Asking a question about a property will not sign you up to anything.",
              },
            ],
          },
          {
            id: "processors",
            heading: "Who else sees it",
            blocks: [
              {
                kind: "p",
                text: "A few service providers handle data on Gio's behalf, each only as far as its job requires:",
              },
              {
                kind: "list",
                items: [
                  "Titan Mail — delivers and stores the email your enquiry becomes.",
                  "Vercel — hosts this site and serves these pages.",
                  "Sanity — stores the listings, photographs and articles you read here. It holds no visitor data.",
                  "Mapbox — draws the neighbourhood map. Your IP address reaches Mapbox when a map loads on your screen, the same way it would when loading an image from any other site.",
                ],
              },
              {
                kind: "p",
                text: "Anything shared later with a lawyer, notary, bank or developer happens as part of an actual transaction, with your knowledge, because the purchase requires it — never automatically from this website.",
              },
            ],
          },
          {
            id: "retention",
            heading: "How long it is kept",
            blocks: [
              {
                kind: "p",
                text: "Enquiry emails are kept while the conversation is still useful. A property search can run for a year, and it helps to remember what you were looking for. Ask for yours to be deleted and it will be, unless the law requires it to be kept.",
              },
              {
                kind: "p",
                text: "Server logs roll off after a short period set by the host. The language cookie expires a year after you set it.",
              },
            ],
          },
          {
            id: "rights",
            heading: "Your rights",
            blocks: [
              {
                kind: "p",
                text: `You can ask what is held about you, ask for it to be corrected, or ask for it to be erased. Write to ${EMAIL} and say what you want — there is no form to fill in.`,
              },
              {
                kind: "p",
                text: "The Dominican Republic protects personal data under Ley No. 172-13. If you are writing from the European Union or the United Kingdom, the rights you are used to under the GDPR — access, rectification, erasure, portability, objection — are honoured here too, and you remain free to complain to your national data protection authority.",
              },
            ],
          },
          {
            id: "children",
            heading: "Children",
            blocks: [
              {
                kind: "p",
                text: "This site is about buying real estate. It is not aimed at children and does not knowingly collect anything from them.",
              },
            ],
          },
          {
            id: "changes",
            heading: "Changes to this policy",
            blocks: [
              {
                kind: "p",
                text: "If this policy changes, the date at the top changes with it. Anything material will be visible on this page rather than buried in it.",
              },
            ],
          },
        ],
      },
      cookies: {
        metaTitle: "Cookies Policy — Gio In The DR",
        metaDescription:
          "This site sets one cookie, it remembers your language, and there is no tracking of any kind. The details, and how to turn it off.",
        eyebrow: "Legal",
        title: "Cookies Policy",
        intro:
          "The short version: this site sets one cookie, it remembers which language you chose, and there is no tracking of any kind. The longer version is below.",
        sections: [
          {
            id: "used",
            heading: "The one cookie",
            blocks: [
              {
                kind: "table",
                columns: ["Name", "What it does", "How long it lasts"],
                rows: [
                  [
                    "locale",
                    "Remembers whether you chose English or Español, so the site opens in your language next time instead of guessing again.",
                    "One year",
                  ],
                ],
              },
              {
                kind: "p",
                text: "It is set only when you use the language toggle. It contains nothing but the two letters en or es, and only this site can read it.",
              },
            ],
          },
          {
            id: "not-used",
            heading: "What is not here",
            blocks: [
              {
                kind: "list",
                items: [
                  "No analytics — no Google Analytics, no Plausible, no visitor counter of any kind.",
                  "No advertising or retargeting pixels. Looking at a listing here will not make it follow you around Instagram.",
                  "No social media trackers. The Instagram link is an ordinary link; nothing is embedded.",
                  "No fonts loaded from Google. The typefaces are served from this site's own domain, so opening a page sends no request to Google.",
                ],
              },
            ],
          },
          {
            id: "map",
            heading: "Storage the map uses",
            blocks: [
              {
                kind: "p",
                text: "The neighbourhood map is drawn by Mapbox. Opening a page that has a map on it lets the Mapbox library keep a small amount of data in your browser so it does not re-download the same map tiles, and Mapbox receives your IP address as those tiles are fetched. That is unavoidable for any map that is not a flat picture.",
              },
              {
                kind: "p",
                text: "This is Mapbox's own storage, governed by Mapbox's privacy policy, and it is not used by this site to identify you. Pages without a map do not load it at all.",
              },
            ],
          },
          {
            id: "no-banner",
            heading: "Why there is no cookie banner",
            blocks: [
              {
                kind: "p",
                text: "Consent banners exist because of tracking. A cookie that remembers a language you deliberately chose is what the law calls strictly necessary, and asking permission to remember a button you just pressed is theatre rather than protection.",
              },
              {
                kind: "p",
                text: "If tracking is ever added to this site, a banner will arrive with it — and it will let you say no.",
              },
            ],
          },
          {
            id: "control",
            heading: "Turning it off",
            blocks: [
              {
                kind: "p",
                text: "Every browser can block or clear cookies from its settings. Blocking this one costs you nothing except that the site will go back to guessing your language from your browser on each first visit.",
              },
            ],
          },
          {
            id: "changes",
            heading: "Changes to this policy",
            blocks: [
              {
                kind: "p",
                text: "If this policy changes, the date at the top changes with it.",
              },
            ],
          },
        ],
      },
    },
  },
  es: {
    updatedLabel: (date) => `Última actualización: ${date}`,
    docs: {
      privacy: {
        metaTitle: "Política de Privacidad — Gio In The DR",
        metaDescription:
          "Qué pasa con tu información cuando usas este sitio: qué se recoge, quién lo procesa, cuánto tiempo se guarda y cómo pedir que se elimine.",
        eyebrow: "Legal",
        title: "Política de Privacidad",
        intro:
          "Este sitio es de Gio — Giorgia Loglio — agente inmobiliaria en Cabarete, en la costa norte de la República Dominicana. Esta página explica qué pasa con tu información cuando usas el sitio, en lenguaje claro y no en el de siempre.",
        sections: [
          {
            id: "who",
            heading: "Quién es la responsable",
            blocks: [
              {
                kind: "p",
                text: "Giorgia Loglio, agente inmobiliaria, Cabarete, provincia de Puerto Plata, República Dominicana. Ella decide qué se hace con la información que se recoge aquí, y es la persona a quien escribirle al respecto.",
              },
              {
                kind: "p",
                text: `Correo: ${EMAIL}. WhatsApp: ${WHATSAPP_DISPLAY}.`,
              },
            ],
          },
          {
            id: "collected",
            heading: "Qué recoge este sitio",
            blocks: [
              {
                kind: "list",
                items: [
                  "El formulario de contacto: tu nombre, tu correo, el tema que eliges de la lista y lo que escribas en el mensaje.",
                  "WhatsApp y correo: lo que decidas enviar al iniciar una conversación, incluido tu número de teléfono si escribes por WhatsApp.",
                  "Registros normales del servidor: como en cualquier sitio web, los servidores que entregan estas páginas guardan registros técnicos breves — dirección IP, tipo de navegador y dispositivo, qué página se pidió y cuándo. Existen por seguridad y para resolver fallos, no para armar un perfil tuyo.",
                  "Tu preferencia de idioma: una cookie que recuerda si elegiste inglés o español. Es lo único que este sitio guarda en tu navegador — mira la Política de Cookies.",
                ],
              },
              {
                kind: "p",
                text: "No hay analítica, ni píxeles de publicidad, ni scripts de rastreo en ninguna parte de este sitio. A nadie se le sigue de página en página.",
              },
            ],
          },
          {
            id: "why",
            heading: "Para qué se usa",
            blocks: [
              {
                kind: "list",
                items: [
                  "Para responderte. Lo que envías por el formulario llega directo al correo de Gio; no se guarda en ninguna base de datos aquí.",
                  "Para mostrarte el sitio en el idioma que elegiste.",
                  "Para mantener el sitio funcionando y seguro.",
                ],
              },
              {
                kind: "p",
                text: "Tus datos nunca se venden, ni se alquilan, ni se agregan a una lista de marketing. Preguntar por una propiedad no te suscribe a nada.",
              },
            ],
          },
          {
            id: "processors",
            heading: "Quién más lo ve",
            blocks: [
              {
                kind: "p",
                text: "Algunos proveedores tratan datos por encargo de Gio, cada uno solo hasta donde su función lo exige:",
              },
              {
                kind: "list",
                items: [
                  "Titan Mail — entrega y almacena el correo en que se convierte tu consulta.",
                  "Vercel — aloja este sitio y sirve estas páginas.",
                  "Sanity — guarda las propiedades, fotos y artículos que lees aquí. No almacena datos de visitantes.",
                  "Mapbox — dibuja el mapa de los barrios. Tu dirección IP llega a Mapbox cuando se carga un mapa en tu pantalla, igual que al cargar una imagen desde cualquier otro sitio.",
                ],
              },
              {
                kind: "p",
                text: "Todo lo que más adelante se comparta con un abogado, un notario, un banco o un desarrollador ocurre dentro de una transacción real, con tu conocimiento y porque la compra lo exige — nunca de forma automática desde este sitio web.",
              },
            ],
          },
          {
            id: "retention",
            heading: "Cuánto tiempo se guarda",
            blocks: [
              {
                kind: "p",
                text: "Los correos de consulta se guardan mientras la conversación siga siendo útil. Buscar una propiedad puede tomar un año, y ayuda recordar qué estabas buscando. Si pides que se eliminen, se eliminan, salvo que la ley obligue a conservarlos.",
              },
              {
                kind: "p",
                text: "Los registros del servidor se borran tras el periodo breve que fija el proveedor de alojamiento. La cookie de idioma caduca un año después de haberla establecido.",
              },
            ],
          },
          {
            id: "rights",
            heading: "Tus derechos",
            blocks: [
              {
                kind: "p",
                text: `Puedes pedir qué información hay sobre ti, pedir que se corrija o pedir que se elimine. Escribe a ${EMAIL} y dilo — no hay ningún formulario que llenar.`,
              },
              {
                kind: "p",
                text: "La República Dominicana protege los datos personales mediante la Ley No. 172-13. Si escribes desde la Unión Europea o el Reino Unido, los derechos que conoces del RGPD — acceso, rectificación, supresión, portabilidad y oposición — también se respetan aquí, y conservas la libertad de reclamar ante la autoridad de protección de datos de tu país.",
              },
            ],
          },
          {
            id: "children",
            heading: "Menores de edad",
            blocks: [
              {
                kind: "p",
                text: "Este sitio trata sobre la compra de inmuebles. No está dirigido a menores y no recoge información de ellos a sabiendas.",
              },
            ],
          },
          {
            id: "changes",
            heading: "Cambios en esta política",
            blocks: [
              {
                kind: "p",
                text: "Si esta política cambia, cambia con ella la fecha de arriba. Lo importante se verá en esta página, no quedará enterrado en ella.",
              },
            ],
          },
        ],
      },
      cookies: {
        metaTitle: "Política de Cookies — Gio In The DR",
        metaDescription:
          "Este sitio usa una sola cookie, que recuerda tu idioma, y no hay rastreo de ningún tipo. Los detalles, y cómo desactivarla.",
        eyebrow: "Legal",
        title: "Política de Cookies",
        intro:
          "La versión corta: este sitio usa una sola cookie, recuerda qué idioma elegiste, y no hay rastreo de ningún tipo. La versión larga está abajo.",
        sections: [
          {
            id: "used",
            heading: "La única cookie",
            blocks: [
              {
                kind: "table",
                columns: ["Nombre", "Qué hace", "Cuánto dura"],
                rows: [
                  [
                    "locale",
                    "Recuerda si elegiste English o Español, para que la próxima vez el sitio abra en tu idioma en lugar de adivinarlo otra vez.",
                    "Un año",
                  ],
                ],
              },
              {
                kind: "p",
                text: "Solo se crea cuando usas el selector de idioma. No contiene más que las dos letras en o es, y únicamente este sitio puede leerla.",
              },
            ],
          },
          {
            id: "not-used",
            heading: "Lo que no hay aquí",
            blocks: [
              {
                kind: "list",
                items: [
                  "Nada de analítica: ni Google Analytics, ni Plausible, ni contador de visitas de ningún tipo.",
                  "Nada de píxeles de publicidad ni de remarketing. Mirar una propiedad aquí no hará que te persiga por Instagram.",
                  "Nada de rastreadores de redes sociales. El enlace a Instagram es un enlace normal; no hay nada incrustado.",
                  "Nada de tipografías cargadas desde Google. Las fuentes se sirven desde el dominio de este mismo sitio, así que abrir una página no envía ninguna petición a Google.",
                ],
              },
            ],
          },
          {
            id: "map",
            heading: "El almacenamiento que usa el mapa",
            blocks: [
              {
                kind: "p",
                text: "El mapa de los barrios lo dibuja Mapbox. Al abrir una página que tiene mapa, la librería de Mapbox guarda una pequeña cantidad de datos en tu navegador para no volver a descargar las mismas piezas del mapa, y Mapbox recibe tu dirección IP mientras esas piezas se descargan. Eso es inevitable en cualquier mapa que no sea una imagen fija.",
              },
              {
                kind: "p",
                text: "Ese almacenamiento es de Mapbox y se rige por su política de privacidad; este sitio no lo usa para identificarte. Las páginas sin mapa no lo cargan en absoluto.",
              },
            ],
          },
          {
            id: "no-banner",
            heading: "Por qué no hay banner de cookies",
            blocks: [
              {
                kind: "p",
                text: "Los banners de consentimiento existen por el rastreo. Una cookie que recuerda el idioma que elegiste a propósito es lo que la ley llama estrictamente necesaria, y pedir permiso para recordar un botón que acabas de pulsar es teatro, no protección.",
              },
              {
                kind: "p",
                text: "Si algún día se añade rastreo a este sitio, llegará con su banner — y ese banner te dejará decir que no.",
              },
            ],
          },
          {
            id: "control",
            heading: "Cómo desactivarla",
            blocks: [
              {
                kind: "p",
                text: "Cualquier navegador puede bloquear o borrar cookies desde su configuración. Bloquear esta no te cuesta nada, salvo que el sitio volverá a adivinar tu idioma a partir del navegador en cada primera visita.",
              },
            ],
          },
          {
            id: "changes",
            heading: "Cambios en esta política",
            blocks: [
              {
                kind: "p",
                text: "Si esta política cambia, cambia con ella la fecha de arriba.",
              },
            ],
          },
        ],
      },
    },
  },
};
