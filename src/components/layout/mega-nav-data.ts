import {
  Coins,
  DollarSign,
  Landmark,
  Fuel,
  Newspaper,
  TrendingUp,
} from "lucide-react";

export type MegaLink = { label: string; href: string };

export type MegaNavItem = {
  href: string;
  label: string;
  icon: typeof Coins;
  /** Path prefixes that mark this top-level item active (SEO landings). */
  match?: string[];
  groups?: { title: string; links: MegaLink[] }[];
};

export const MEGA_NAV: MegaNavItem[] = [
  {
    href: "/gia-vang",
    label: "Giá vàng",
    icon: Coins,
    match: ["/gia-vang"],
    groups: [
      {
        title: "Trong nước",
        links: [
          { label: "Tất cả giá vàng", href: "/gia-vang" },
          { label: "SJC", href: "/gia-vang-sjc-hom-nay" },
          { label: "DOJI", href: "/gia-vang-doji-hom-nay" },
          { label: "PNJ", href: "/gia-vang-pnj-hom-nay" },
          { label: "Bảo Tín Minh Châu", href: "/gia-vang-bao-tin-hom-nay" },
        ],
      },
      {
        title: "Quốc tế",
        links: [
          { label: "Giá vàng thế giới", href: "/gia-vang-the-gioi-hom-nay" },
        ],
      },
    ],
  },
  {
    href: "/ty-gia",
    label: "Tỷ giá",
    icon: DollarSign,
    match: ["/ty-gia"],
    groups: [
      {
        title: "Ngoại tệ",
        links: [
          { label: "Tất cả tỷ giá", href: "/ty-gia" },
          { label: "USD", href: "/ty-gia-usd-hom-nay" },
          { label: "EUR", href: "/ty-gia-eur-hom-nay" },
          { label: "GBP", href: "/ty-gia-gbp-hom-nay" },
          { label: "JPY", href: "/ty-gia-jpy-hom-nay" },
          { label: "CNY", href: "/ty-gia-cny-hom-nay" },
        ],
      },
    ],
  },
  {
    href: "/lai-suat",
    label: "Lãi suất",
    icon: Landmark,
    match: ["/lai-suat"],
    groups: [
      {
        title: "Ngân hàng",
        links: [
          { label: "So sánh lãi suất", href: "/lai-suat" },
          { label: "Vietcombank", href: "/lai-suat-vietcombank" },
          { label: "BIDV", href: "/lai-suat-bidv" },
          { label: "Techcombank", href: "/lai-suat-techcombank" },
          { label: "VPBank", href: "/lai-suat-vpbank" },
        ],
      },
    ],
  },
  {
    href: "/gia-xang",
    label: "Xăng dầu",
    icon: Fuel,
    match: ["/gia-xang"],
    groups: [
      {
        title: "Giá xăng dầu",
        links: [
          { label: "Tất cả", href: "/gia-xang" },
          { label: "RON95", href: "/gia-xang-ron95-hom-nay" },
          { label: "E5", href: "/gia-xang-e5-hom-nay" },
          { label: "Diesel", href: "/gia-xang-diesel-hom-nay" },
        ],
      },
    ],
  },
  {
    href: "/chung-khoan",
    label: "Chứng khoán",
    icon: TrendingUp,
    match: ["/chung-khoan"],
    groups: [
      {
        title: "Chỉ số",
        links: [
          { label: "Thị trường", href: "/chung-khoan" },
          { label: "VN-Index", href: "/chung-khoan-vnindex" },
          { label: "HNX-Index", href: "/chung-khoan-hnxindex" },
          { label: "UPCOM", href: "/chung-khoan-upcom" },
        ],
      },
    ],
  },
  {
    href: "/tin-tuc",
    label: "Tin tức",
    icon: Newspaper,
    match: ["/tin-tuc"],
    groups: [
      {
        title: "Chuyên mục",
        links: [{ label: "Tất cả tin tức", href: "/tin-tuc" }],
      },
    ],
  },
];

export function isMegaItemActive(pathname: string, item: MegaNavItem): boolean {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
  if (item.match?.some((p) => pathname === p || pathname.startsWith(`${p}-`) || pathname.startsWith(`${p}/`))) {
    return true;
  }
  return (
    item.groups?.some((g) =>
      g.links.some((l) => {
        const path = l.href.split("?")[0];
        return pathname === path || pathname.startsWith(`${path}/`);
      })
    ) ?? false
  );
}

export function isMegaLinkActive(pathname: string, href: string): boolean {
  const path = href.split("?")[0];
  return pathname === path;
}
