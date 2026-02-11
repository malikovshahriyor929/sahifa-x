import type { Author, Book, CurrentUser, DashboardStats, NavItem } from "./types";

export const CURRENT_USER: CurrentUser = {
  name: "YozuvchiAnon123",
  role: "Muallif",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuANqrl2TuWTjYzhOKNUF2a9P0DkkEciWKgw5Tsh0I36HGmufa4BUAOh-LF_7Fwhw5zM5Jf8-55MAh4HN4fiNuvrL33G4wJqLM6DnJZEUGzj_B7RvbczqnWJrfWw8PEgRkh7NPHgWtckDEQMQxRfXIQIibVD3l2JoN1_NRBnSFXPD8dBpyYoDrfubX9d7ckmZ63otEYnqtWzOYmCpFLaqm5URvmDmFFjQfMLx4dBOhsmzcaubkU0BIOQnsusR4-pMJTyRskD4RVu50A",
};

export const DASHBOARD_STATS: DashboardStats = {
  unreadChapters: 12,
  totalReads: "79k",
  booksInLibrary: 27,
};

export const TRENDING_BOOKS: Book[] = [
  {
    id: "1",
    title: "Soyalar O'yini: Qasos va Sevgi",
    author: "GhostWriter99",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAFwY09NxbRP5IWWStoPob_Acayy-d0wY22NckWElagHwb7trso4OFvFrr-Q-6h3-H1lz71DPEeIR853AnCq6Z0WcFf1GbWEcTA2ePW2Hv_VHsqpdua1PGJMIIyCE4dHupY81Q2eGffR6d9TLiC4ri5zcQGDihVPDkDEYu_fM0POPtFK8RE9AyWN5RQURM5Cwt-ORz7x47etdBiD_Ngl__Dg0xuibIFFW9-s3YTHK2HBKVJBQkCAEbnJ6jAbAX9yz2EtNNlsgd-Gqs",
    rating: 4.9,
    category: "Fantastika",
  },
  {
    id: "2",
    title: "Anonim 77: Yo'qolgan Sahifa",
    author: "Sherzod_X",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-cLIdRUGiZ_OVTBkOutYkxfHzaxYn-3gwJkvp5eo9G4RILrk8bSXIr8cvojnOedlT3m4CImcooRcnSwV5K-UWIpIileKcyftTR9pj2KGnmNMXbfoZ2BJ_VHZUQBnjQA2dLRrJN5Wg6nOzwTiqLgl9e7XE84DC2QcAfjkLnAEpHDe5Qnkh8FfIM7ArtWApjdGCFGgcanB6viTiGkMeZPBatgi8u89SdNz5pOpBMTLWdfqbkZaYYvnXZ-1Op31aVr7GbGCjwArhZrc",
    rating: 4.7,
    category: "Detektiv",
  },
  {
    id: "3",
    title: "Mars Koloniyasi: Ertangi Kun",
    author: "StarGazer",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC_qD3MHsqb1puSHyfIp2zNEYOfCOgzeUNNt502G2mn5DWorpg6wfrOV6yQWF-TYwB6bupqBnVwicBf6PE1n1kSgGl5VBQLCHmpP9TYiU5wnKIui4N88zXM6Qx8YB0uW66oDT63BZiOiKzf73Dmo_IoiA-1Zzng8CyiwwQS4pMPIXGF85JHJN0qLlOrLLiAYzRJpNfygNk7eWFrDfPWAbKvAlYBijZzmAY-x5wD2JMy3pCjz-xciM8h9YEUn8jfW0m9KJuETpBm1fA",
    rating: 4.8,
    category: "Sci-Fi",
  },
  {
    id: "4",
    title: "Yomg'ir Ostida",
    author: "RainDrop_22",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCj4xShxRRpQRm3SwlM21CI-I9AIQdKYyOHN3tZ_zha-u6o8iEfC44sdxey1oXse0pje0zwqcxAN1PFleEptJqbrEVX7zc3mVcSDtWcsKUOJqSOFH8ciVgByUe_ZZ_0ej17afzBGXQ-UEPzh_TVMX2xZiuMpiqn6zam8t88YRs5wcMQ57KIymGdsLO9wjwxjV_TIYvgdvNIo7rlbs-RUsxs38UuARGoNrTl8ylcbCHeZ_HREUkTKB-0eF5Nl-vU2VWZZZKCtOVS__E",
    rating: 4.5,
    category: "Drama",
  },
];

export const NEW_ARRIVALS: Book[] = [
  {
    id: "5",
    title: "Tungi Sharpalar",
    author: "Mystic_Author",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD8wRDDSLfB61LZkNXKPnzRUb8M9P1XrA4chwEHTwpmq-XbsyJhpvyx_iJX7Ly4Ty_Xhu7d7xLD4IyeV2vDoeSJjXb0qsJMJrp7TUy6dw6G0Tv2jhwd5UBLHRYSjJjaEgbOSr3NSf57DoaGP4sinDuauqe0J-49jkdnhTFlc7sP8PXZJDM6Rvw6jeoIoxt-aDA_nrb-TKScEFruP0Fn3_qPwnhplhGrL8KaITSNYarIZd-XW0AUqhqCvj1qCbwC9uvBEwP8ioAhFTY",
    category: "Triller",
    timestamp: "3 soat oldin",
    description: "Eski qasrda yuz bergan sirli voqealar zanjiri...",
    readCount: "1.2k",
    isNew: true,
  },
  {
    id: "6",
    title: "Buyuk Ipak Yo'li",
    author: "History_Buff",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCp6FFiXwluwbC-OJyrBNE4XItr5T5DhNogi5ZAb1ixhykJCAGDapewXwQQ8FCrVYgO1x0ytrdMgnt2q3tU_5RerdlQbN8fOySfEGdR4T3TBFl9QiuzNEVfS8l2yFJnry6sDbjnU_P_4yB6Z-FagQdbqs9VdhV2EtrmLL7K2uAgzmTeFTIGgTvOhqPNJuSNWimKcmAx2swTvgWwpbUJN5WToLzg3rjTggj-dKiNz7tB50lCM-4XE7Xy8782d10iu4x-B2cv_HpK6mw",
    category: "Tarixiy",
    timestamp: "5 soat oldin",
    description: "Qadimiy karvonlarning sirlari va sarguzashtlari.",
    readCount: "856",
    isNew: true,
  },
  {
    id: "7",
    title: "Inson Tabiati",
    author: "Dr_Mind",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBVEDaUOHe6QzINktPyyrn3t5WGvl_LqCiA9kO58x5cFSQ4MTL_3vb8PSJWkwc5W79ZXw6lkUBsB8ibuyRsiWEH3QvT1xOKQoE1c8UFjxt6dIgnRO33F3U3UUwulUjKajCHdWZFNrLXwjN_lmVvjhlMR5qt7j0L6uFXG5J0fWukNufrcBuRElVLjJpK4UdMeD8G4JUMPl9LInOLbENdLGEk3t0Zw5mGBYUr1AqQyNhnwa3EA9TCvtbK5cLZdblapSWX0QFCiMORlnI",
    category: "Psixologiya",
    timestamp: "6 soat oldin",
    description: "O'zligingizni anglash uchun qo'llanma.",
    readCount: "2.1k",
    isNew: true,
  },
  {
    id: "8",
    title: "Amazonka Sirrlari",
    author: "Jungleboy",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCRtLl5MueZ3RVMgw7tGlXjOj-6wZg7o5018yPa3YgwY-DR3DQzyr8eMeKQRjoYmi-RZJZH9BCEhcZ3v2d_hkByaSr-xVACCbk45Oc7RmbnY2IMfBS1WFFuocTa8CSzYg591CE-x7YUWC8YCY4tl5DxrsF2ukSkEbxdQf_LO7x5eBuuIYwioudn5riHsNg0vobkrn0D2V7pAfY0Z41VmhnZWbIAAAQz31ncZUJOj_3R4ZcEVkbR0lVPIfylx2SQEVZ8wjERyxaFxpI",
    category: "Sarguzasht",
    timestamp: "8 soat oldin",
    description: "Yovvoyi tabiat qo'ynida omon qolish.",
    readCount: "450",
    isNew: true,
  },
];

export const TOP_AUTHORS: Author[] = [
  {
    id: "a1",
    name: "Mystic_Author",
    booksCount: 14,
    readsCount: "45k",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCzqYHSNXSewgJnpwmpwgN79ul_ryIC1mbdYy7Bxj0abCHXMDlbZ8kVVqikkWuDI77SUZ_sjlTiGrTlmTWjuOXDlI7IUi4y88MFQLkn-XQCcYYLSD6DuDTarwnyfLTeHoHjAHWS3ozaA5SKC-H04StTqr5OviYdPJ8gdOtstzJuuy-VY1BI7sR8oDwn_kXl3YXnfhTYm8aZtmMIa9JdTaY5ft6TtRPXk0F5_sQiH2vz1C9_RPGh9NUwISnqqIvdGIqcYmAnzgNu6E4",
  },
  {
    id: "a2",
    name: "History_Buff",
    booksCount: 8,
    readsCount: "22k",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHJdx9aQCNbiANArCgALpREI5ucdFWcqYVBQGbOIiYTDImQvROEFUQlJxhVKG5BfJtFgBqCumZuiX4K4-hfnk6KbkO6KUPH3L_25h9Rpwbmse1VzD3VhdECOUlcmS3-z8gol-Ure_ZRGdynr4J5S2fK2yzwttlYtwnAxFavSDtMblOAXFrw6H-U30beCdNkViM_B3dXwWOe_rBfzj1HaoC2_KJVI8mU04cl5zJXM9HybF-izR2CscTMJBeGU4bKBYwcR1kAEVDpe4",
  },
  {
    id: "a3",
    name: "Poet_Soul",
    booksCount: 32,
    readsCount: "12k",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1OVcLwIXMJXoEPPe-wzzFf8uB5uKHxmQpBL8S1hOcxHohbd5nI1E-a9yapTHLZbLDsmLImMDFylY41691lnppZu0_JCpsJGlHydsHUyyjYYX4xlJKfO6vAiD7VKRk8c8Gvi8f5AymGDn-3zAFfStAy8uvoaA3E0UtfPrtbiHTFrSmjExtcgrfpHWFBkgIYINMPpGdgkyFQ-0sb2dv1SBObr7PhgLRxd6CCWdJPA5e_gVT9h5ebmxp48JZVhoFvXNOSRgdpjDSztQ",
  },
];

export const TOP_GENRES = [
  "Fantastika",
  "Detektiv",
  "Drama",
  "Romantika",
  "Triller",
  "Tarixiy",
  "Sarguzasht",
];

export const MAIN_NAV_ITEMS: NavItem[] = [
  { icon: "home", label: "Asosiy", active: true },
  { icon: "search", label: "Qidiruv" },
  { icon: "idea", label: "Idea Lab" },
  { icon: "bookmark", label: "Saqlanganlar" },
];

export const PERSONAL_NAV_ITEMS: NavItem[] = [
  { icon: "library", label: "Kutubxonam" },
  { icon: "draft", label: "Qoralamalar" },
  { icon: "settings", label: "Sozlamalar" },
];

export const DEFAULT_BOOK_COVER =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop";
