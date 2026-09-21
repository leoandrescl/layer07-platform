import type { Localized } from "./projects";

export type Offering = {
  id: string;
  title: Localized<string>;
  body: Localized<string>;
  includes: Localized<string[]>;
};

export const offerings: Offering[] = [
  {
    id: "web",
    title: { es: "Sitios web & presencia digital", en: "Websites & digital presence" },
    body: {
      es: "Sitios editoriales y corporativos que comunican con claridad y cargan rápido, pensados para posicionar y convertir.",
      en: "Editorial and corporate sites that communicate clearly and load fast, built to rank and convert.",
    },
    includes: {
      es: [
        "Dirección visual y de arte",
        "Desarrollo Next.js o WordPress",
        "SEO técnico y accesibilidad",
        "Despliegue y analítica",
      ],
      en: [
        "Visual and art direction",
        "Next.js or WordPress development",
        "Technical SEO and accessibility",
        "Deployment and analytics",
      ],
    },
  },
  {
    id: "commerce",
    title: { es: "E-commerce & storefronts", en: "E-commerce & storefronts" },
    body: {
      es: "Tiendas que venden: catálogo, checkout, pagos y logística integrados en una experiencia coherente.",
      en: "Stores that sell: catalog, checkout, payments and logistics integrated into one coherent experience.",
    },
    includes: {
      es: [
        "Shopify o WooCommerce a medida",
        "Storefront headless",
        "Pagos, envíos y facturación",
        "Optimización de conversión",
      ],
      en: [
        "Shopify or custom WooCommerce",
        "Headless storefront",
        "Payments, shipping and invoicing",
        "Conversion optimization",
      ],
    },
  },
  {
    id: "product",
    title: { es: "Aplicaciones & sistemas a medida", en: "Apps & custom systems" },
    body: {
      es: "Productos digitales y herramientas internas que ordenan la operación y reemplazan procesos manuales.",
      en: "Digital products and internal tools that organize the operation and replace manual processes.",
    },
    includes: {
      es: [
        "Modelado de datos y arquitectura",
        "Panel, cuentas y permisos",
        "Integraciones API",
        "Automatización de procesos",
      ],
      en: [
        "Data modeling and architecture",
        "Dashboard, accounts and permissions",
        "API integrations",
        "Process automation",
      ],
    },
  },
  {
    id: "webgl",
    title: { es: "Experiencias WebGL & interacción", en: "WebGL experiences & interaction" },
    body: {
      es: "Capa 3D y movimiento al servicio de la marca: memoria visual real, no un adorno que estorba.",
      en: "A 3D and motion layer in service of the brand: real visual memory, not decoration in the way.",
    },
    includes: {
      es: [
        "Dirección de movimiento",
        "Escenas WebGL optimizadas",
        "Interacción con cursor y scroll",
        "Degradación por dispositivo",
      ],
      en: [
        "Motion direction",
        "Optimized WebGL scenes",
        "Cursor and scroll interaction",
        "Per-device degradation",
      ],
    },
  },
];
