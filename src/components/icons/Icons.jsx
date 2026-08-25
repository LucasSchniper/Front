const base = {
  fill: "none",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ children, size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={`icon ${className}`}
      aria-hidden="true"
      {...base}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p) => (
  <Svg {...p}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
  </Svg>
);

export const IconUsers = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M15.5 14.2c2.6.4 4.5 2.6 4.5 5.8" />
  </Svg>
);

export const IconPatient = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
  </Svg>
);

export const IconEcgUpload = (p) => (
  <Svg {...p}>
    <path d="M3 13h4l2-5 3 9 2-6 1.5 2H21" />
    <path d="M12 3v6M9 6h6" />
  </Svg>
);

export const IconChat = (p) => (
  <Svg {...p}>
    <path d="M4 5h16v10H9l-4 4V15H4Z" />
    <path d="M8 9h8M8 12h5" />
  </Svg>
);

export const IconUserCircle = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6 19c1.2-2.4 3.4-3.8 6-3.8s4.8 1.4 6 3.8" />
  </Svg>
);

export const IconBell = (p) => (
  <Svg {...p}>
    <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Svg>
);

export const IconLogout = (p) => (
  <Svg {...p}>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="M14 8l4 4-4 4M18 12H9" />
  </Svg>
);

export const IconShield = (p) => (
  <Svg {...p}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

export const IconTrash = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </Svg>
);

export const IconPlus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconSend = (p) => (
  <Svg {...p}>
    <path d="M4 12 20 4l-6 16-3-7-7-3Z" />
  </Svg>
);

export const IconEye = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.6" />
  </Svg>
);

export const IconMenu = (p) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

export const IconClose = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="M4 12.5 9.5 18 20 6" />
  </Svg>
);

export const IconArrowLeft = (p) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const IconSettings = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.1 5.9l-1.55 1.55M7.45 16.55 5.9 18.1M18.1 18.1l-1.55-1.55M7.45 7.45 5.9 5.9" />
  </Svg>
);

export const IconUpload = (p) => (
  <Svg {...p}>
    <path d="M7 17.5a4 4 0 0 1-.9-7.9 5 5 0 0 1 9.6-2 4.5 4.5 0 0 1 1.3 8.9" />
    <path d="M12 20v-8M9 14.5 12 11.5 15 14.5" />
  </Svg>
);

export const IconClipboard = (p) => (
  <Svg {...p}>
    <path d="M9 4.5h6v2.8H9z" />
    <path d="M9 6H7a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2" />
    <path d="M9 11.5h6M9 15h4" />
  </Svg>
);

export const IconCalendar = (p) => (
  <Svg {...p}>
    <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
    <path d="M4 10h16M8.5 3.5v3M15.5 3.5v3" />
  </Svg>
);

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Svg>
);

export const IconSummary = (p) => (
  <Svg {...p}>
    <path d="M4 8.5h13l-3.5-3.5M20 15.5H7l3.5 3.5" />
  </Svg>
);

export const IconPulse = (p) => (
  <Svg {...p}>
    <path d="M3 12h3.5L9 6l3.5 12L15 12h6" />
  </Svg>
);

export const IconHeartCheck = (p) => (
  <Svg {...p}>
    <path d="M12 20S4 15.2 4 9.8A3.8 3.8 0 0 1 12 7.6a3.8 3.8 0 0 1 8 2.2c0 5.4-8 10.2-8 10.2Z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

export const IconAlert = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v5.2M12 16.2h.01" />
  </Svg>
);

export const IconNews = (p) => (
  <Svg {...p}>
    <path d="M5 5h11a1 1 0 0 1 1 1v13H6a1 1 0 0 1-1-1Z" />
    <path d="M17 9.5h2v8.5a1 1 0 0 1-1 1" />
    <path d="M8 9h5M8 12h5M8 15h3" />
  </Svg>
);

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);

export const IconDoctor = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="7.5" r="3.2" />
    <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M9 13.4v2.1a3 3 0 0 0 6 0v-2.1" />
    <circle cx="17.6" cy="16.4" r="1.6" />
  </Svg>
);

export const IconTrendUp = (p) => (
  <Svg {...p}>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M7.5 15.5 11 11l3 2.5 4.5-5.5" />
    <path d="M15 8h3.5v3.5" />
  </Svg>
);

export const IconBolt = (p) => (
  <Svg {...p}>
    <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12L13 3Z" />
  </Svg>
);

export const IconChevronRight = (p) => (
  <Svg {...p}>
    <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
  </Svg>
);
