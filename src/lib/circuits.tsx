import type { ReactNode } from "react";

// Language-neutral circuit data (SPEC §1). Prose (mechanism, statLabel) is
// translated via next-intl under the `circuits.items.<id>` namespace; names are
// shown in BOTH languages always (main = active locale, secondary = the other).
export type CircuitStatus = "live" | "building" | "urgent" | "research";

export type Circuit = {
  id: string;
  num: string;
  code: string;
  nameEn: string;
  nameEs: string;
  status: CircuitStatus;
  stat: string;
  featured?: boolean;
  icon: ReactNode;
};

const iconProps = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
} as const;

export const circuits: Circuit[] = [
  {
    id: "pensiones",
    num: "00",
    code: "Pensiones",
    nameEn: "The pension raid",
    nameEs: "El asalto de pensiones",
    status: "live",
    stat: "$1.2B+",
    featured: true,
    icon: (
      <svg {...iconProps}>
        <circle cx="16" cy="16" r="13" />
        <path d="M16 8v16M20 11h-5a2 2 0 000 4h2a2 2 0 010 4h-5" />
      </svg>
    ),
  },
  {
    id: "coloniaFiscal",
    num: "01",
    code: "Colonia Fiscal",
    nameEn: "Act 60 settlers",
    nameEs: "Los colonos de la Ley 60",
    status: "building",
    stat: "5,000+",
    icon: (
      <svg {...iconProps}>
        <path d="M6 26h20M9 26V14l7-6 7 6v12M13 26v-7h6v7" />
      </svg>
    ),
  },
  {
    id: "luma",
    num: "02",
    code: "LUMA",
    nameEn: "The grid privatization",
    nameEs: "La privatización eléctrica",
    status: "urgent",
    stat: "15yr",
    icon: (
      <svg {...iconProps}>
        <path d="M18 4l-10 15h7l-2 9 10-15h-7l2-9z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "laJunta",
    num: "03",
    code: "La Junta",
    nameEn: "PROMESA & the debt",
    nameEs: "PROMESA y la deuda",
    status: "building",
    stat: "$22B+",
    icon: (
      <svg {...iconProps}>
        <path d="M16 4v8M10 12h12l-2 8h-8l-2-8zM12 24h8M16 20v4" />
      </svg>
    ),
  },
  {
    id: "contratos",
    num: "04",
    code: "Contratos",
    nameEn: "Disaster contractors",
    nameEs: "Los contratistas del desastre",
    status: "research",
    stat: "$80B+",
    icon: (
      <svg {...iconProps}>
        <path d="M6 14v12h20V14M4 14l12-8 12 8M16 26V18" />
      </svg>
    ),
  },
  {
    id: "farma",
    num: "05",
    code: "Farma",
    nameEn: "Pharma extraction",
    nameEs: "La extracción farmacéutica",
    status: "research",
    stat: "~13",
    icon: (
      <svg {...iconProps}>
        <rect x="6" y="12" width="20" height="8" rx="4" />
        <path d="M16 12v8M11 16h10" transform="rotate(45 16 16)" />
      </svg>
    ),
  },
  {
    id: "desalojo",
    num: "06",
    code: "El Desalojo",
    nameEn: "Land & displacement",
    nameEs: "Tierra y desplazamiento",
    status: "building",
    stat: "25k+",
    icon: (
      <svg {...iconProps}>
        <circle cx="14" cy="12" r="4" />
        <path d="M14 16v10M10 21l4 4M22 8l-4 4M24 22l-2-2 4-4 2 2-4 4z" />
      </svg>
    ),
  },
];
