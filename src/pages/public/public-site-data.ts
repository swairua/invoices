// Static company-profile content (derived from COMPANY PROFILE.pdf) +
// navigation/categories used by the public website.

export const PRODUCT_CATEGORIES: string[] = [
  'Water Testing and Water Quality Products',
  'Chromatography, Spectrometry and Mass Spectrometers',
  'Torque and Force Testing (Bottling)',
  'Material Testing',
  'Microbiology',
  'Moisture Measurement and Control',
  'Bioprocess',
  'Filtration',
  'Chemicals and Consumables',
  'Safety and Purification Cabinets',
  'Life Science/Molecular Biology',
  'Histo-Pathology',
  'Immunohistochemistry',
  'Laboratory Apparatus and Consumables',
];

export interface Brand {
  name: string;
  logo?: string;
}

// Manufacturer / agency partners (images live in /partner-logos).
export const MANUFACTURERS: Brand[] = [
  { name: 'Merck Millipore', logo: '/partner-logos/merck-millipore.png' },
  { name: 'Sigma', logo: '/partner-logos/sigma-aldrich.png' },
  { name: 'Hanna Instruments' },
  { name: 'Memmert', logo: '/partner-logos/memmert.png' },
  { name: 'Palintest', logo: '/partner-logos/palintest.png' },
  { name: 'Scion Instruments', logo: '/partner-logos/scion-instruments.png' },
  { name: 'Sartorius', logo: '/partner-logos/sartorius.png' },
  { name: 'Mecmesin Force and Testing' },
  { name: 'Biobase Instruments' },
  { name: 'Faithful Instruments' },
  { name: 'SLEE GmbH', logo: '/partner-logos/slee.png' },
  { name: 'HERMLE LaborTechnik', logo: '/partner-logos/hermle.png' },
  { name: 'Magbio Genomics' },
  { name: 'AHN - Germany' },
  { name: 'TRACE 2O', logo: '/partner-logos/trace2o.png' },
  { name: 'MOPEC', logo: '/partner-logos/mopec.png' },
  { name: 'MOIST TECH CORP', logo: '/partner-logos/moist-tech.png' },
];

export interface Client {
  name: string;
  logo?: string;
}

// Institutional clients (images live in /partner-logos).
export const CLIENT_LOGOS: Client[] = [
  { name: 'KEPHIS' },
  { name: 'KEMRI' },
  { name: 'National Quality' },
  { name: 'Kenya Nuts' },
  { name: 'Nairobi Bottlers', logo: '/partner-logos/nairobi-bottlers.png' },
  { name: 'KEFRI' },
  { name: 'KEMFRI' },
  { name: 'ICIPE' },
  { name: 'ILRI' },
  { name: 'KALRO' },
  { name: 'University of Nairobi' },
  { name: 'JKUAT' },
  { name: 'Kenyatta University', logo: '/partner-logos/kenyatta-university.png' },
  { name: 'The Nairobi Hospital' },
  { name: 'Remote Medical International', logo: '/partner-logos/remote-medical.png' },
  { name: 'Aga Khan University Hospital' },
  { name: 'KEBS' },
  { name: 'Concern Worldwide' },
  { name: 'World Vision', logo: '/partner-logos/world-vision.png' },
  { name: 'Caritas', logo: '/partner-logos/caritas.png' },
  { name: 'CHS', logo: '/partner-logos/chs.png' },
  { name: 'Bioinformatics Institute' },
  { name: 'Taita Taveta University', logo: '/partner-logos/taita-taveta.png' },
];

export interface ValueItem {
  icon: string;
  label: string;
  desc: string;
}

export const VALUES: ValueItem[] = [
  {
    icon: 'shield',
    label: 'SAFETY',
    desc: 'Compliance to health and safety for the protection of our staff, customers, suppliers and the community.',
  },
  { icon: 'sparkles', label: 'INNOVATION', desc: 'Understanding our business environment, utilization of imagination and creativity, striving for continuous improvement.' },
  { icon: 'heart', label: 'OUR CUSTOMERS', desc: 'Understand the needs of our customers and develop solutions. Promote mutually beneficial relationships and deliver high quality projects in time.' },
  { icon: 'users', label: 'OUR STAFF', desc: 'Respect and care for their well-being and development. We have qualified and experienced personnel and maintain an atmosphere of trust, empowerment and team spirit.' },
  { icon: 'megaphone', label: 'EFFECTIVE COMMUNICATIONS', desc: 'Consistent, true and concise communication to our clients and the community.' },
  { icon: 'leaf', label: 'ENVIRONMENTAL MANAGEMENT', desc: 'Our health and safety commitment goes far beyond regulatory compliance and good business practice; it is an integral element of our core values.' },
];

export interface TeamMember {
  name: string;
  title: string;
  desc: string;
}

export const TEAM: TeamMember[] = [
  {
    name: 'Peter Mandere',
    title: 'President and CEO',
    desc: 'Haemonetics East Africa Limited is a customer-oriented company, dedicated to providing excellent medical products of good quality and competitive price. Scientific quality control, reliable products, the best after-sales service and a strong market reputation are our guiding principles.',
  },
  {
    name: 'Vincent Orangi',
    title: 'Director of Sales',
    desc: 'Supervises and manages the sales efforts for all of Haemonetics operations in Kenya. Bridges relationships with distributors and hospitals and expands Haemonetics growing presence. His vast product knowledge allows him to serve as a liaison between manufacturers, distributors and hospitals.',
  },
  {
    name: 'Jane Kimani',
    title: 'Regional Sales Manager',
    desc: 'Oversees all sales activities and personnel for Haemonetics domestic operations. Her extensive knowledge of the medical device industry has allowed Haemonetics to quickly penetrate the Kenyan marketplace while strengthening existing relationships.',
  },
  {
    name: 'General Manager',
    title: 'General Manager',
    desc: 'Runs day-to-day operations with direct involvement in vendors, customers, freight forwarders and shipping lines. Certified Designated Representative for the wholesale of pharmaceuticals. Licensed by the State of Kenya for Wholesaling Pharmaceuticals (Chapter 499).',
  },
];

// ---------------------------------------------------------------------------
// Full COMPANY PROFILE content (About / Vision / Mission / Expertise / Why us)
// ---------------------------------------------------------------------------

export const ABOUT_TEXT: string[] = [
  'Haemonetics East Africa Limited is a company operating in the Medical, Research, Production, Food and Beverage, and QC Sectors. HEAL, which was founded in Kenya in 2013, is essentially a supplier of laboratory reagents and instrumentation to research institutes, hospitals, universities, technological institutes, veterinary practices, industrial and pharmaceutical companies throughout East Africa.',
  'Closer inspection of our agencies list will disclose the variety of products which make up our portfolio. Our ever increasing product range is regularly reviewed to ensure that we meet the changing needs of our customers.',
  'Our professional expertise enables us to provide quality advice and guidance, which effectively controls cost, eliminates waste and maximizes efficiency. HEAL believes that products should be augmented by first class support material, which is an integral part of the laboratory supply business in the present day. Therefore, we try to ensure that relevant articles, as well as promotional material, are readily available to all our customers.',
];

export const VISION: string[] = [
  'To deliver the best possible customer service, excellent quality and the most advanced products. Brandon Heal Medical\'s policy is simply to be "Brilliant by Design". We want to be the automatic supplier of first choice to our key customers by providing them with the best products and a personal service.',
  'To contribute our extensive knowledge of medical procedures to medical professionals in hospital and other medical institutions.',
  'To introduce and support the implementation of innovative medical treatments to replace out-dated traditional procedures and technologies.',
];

export const MISSION: string =
  'To enhance healthcare delivery through the provision of high and innovative laboratory and diagnostic products while providing the finest available technical services and support to every customer.';

export const EXPERTISE: string =
  'We maintain the highest levels of expertise to enable us to deliver on our values. Our medical technology skills span research, design, electronics, IT, lighting, engineering, software, AV, manufacturing and building services.';

export interface ServiceList {
  heading: string;
  intro: string;
  items: string[];
}

// "WHY HAEMONETICS" — services offered to partners and customer benefits.
export const SERVICES_TO_PARTNERS: ServiceList = {
  heading: 'Services to partners',
  intro:
    'Performance, expertise and trust are at the core of our business. Through combined years of experience, we have built valuable relationships with key opinion leaders, becoming experts in the field and extremely knowledgeable of the regulatory landscape. We are certified/licensed by the State of Kenya to distribute pharmaceuticals.',
  items: [
    'Providing a full-time advisory board comprised of industry leaders to assist in direction and strategic growth.',
    'Maintaining adequate quantities in stock to support customer needs.',
    'Validating our customer\'s compliance, which is held to our same high standards.',
    'Alleviating the hassles of supplies, maintaining numerous smaller customers through one solid relationship with Haemonetics.',
    'Restricting the sourcing/distributing of competitive products for customers.',
  ],
};

export const CUSTOMER_BENEFITS: ServiceList = {
  heading: 'Customer benefits',
  intro:
    'Small enough to sidestep red tape, big enough to provide world-class customer service and attention to detail. We are focused on continually growing our product base to support our customer\'s growth.',
  items: [
    'Serving as a conduit/liaison between manufacturers and distributors.',
    'Consolidating non-competitive merchandise.',
    'Loading and preparing containers for export.',
    'Acting as a master re-distributor; selling only to distribution partners and offering negotiated rates.',
    'Ability to offer credit terms to customers to allow for growth.',
    'Providing technical support and on-the-job training overseen by a full-time medical professional.',
    'Ability to act as a sourcing agent to satisfy customer needs.',
  ],
};

export function formatCurrency(amount: number) {
  if (amount == null || Number.isNaN(Number(amount))) return '-';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}