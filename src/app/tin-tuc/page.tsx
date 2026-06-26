import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ArrowRight, Newspaper, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Tin tức tài chính",
  description: "Tin tức giá vàng, chứng khoán, ngân hàng, bất động sản — tự động cập nhật.",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Giá vàng": "bg-amber-100 text-amber-700",
  "Chứng khoán": "bg-violet-100 text-violet-700",
  "Ngân hàng": "bg-sky-100 text-sky-700",
  "Bất động sản": "bg-emerald-100 text-emerald-700",
};

const MOCK_NEWS = [
  { slug: "vang-tang-manh-ngay-25-6", title: "Vàng SJC tăng mạnh phiên sáng 25/6, vượt mốc 146 triệu đồng", category: "Giá vàng", excerpt: "Giá vàng miếng SJC tiếp tục đà tăng theo giá vàng thế giới, hiện giao dịch quanh 146 triệu đồng/lượng.", time: "2 giờ trước" },
  { slug: "vnindex-vuot-nguong-1280", title: "VNINDEX vượt ngưỡng 1.280 điểm với thanh khoản cải thiện", category: "Chứng khoán", excerpt: "Dòng tiền quay lại nhóm cổ phiếu vốn hóa lớn giúp chỉ số duy trì sắc xanh.", time: "3 giờ trước" },
  { slug: "lai-suat-ngan-hang-on-dinh", title: "Lãi suất ngân hàng ổn định trong tháng 6", category: "Ngân hàng", excerpt: "Các ngân hàng lớn giữ nguyên biểu lãi suất huy động, kỳ hạn 12 tháng quanh 6%/năm.", time: "5 giờ trước" },
  { slug: "ty-gia-usd-hai-nhiet", title: "Tỷ giá USD/VND hạ nhiệt sau chuỗi ngày tăng nóng", category: "Ngân hàng", excerpt: "Áp lực tỷ giá giảm bớt khi nguồn cung ngoại tệ cải thiện cuối quý.", time: "8 giờ trước" },
  { slug: "bds-phia-nam-am-dan", title: "Bất động sản phía Nam ấm dần ở phân khúc căn hộ", category: "Bất động sản", excerpt: "Thanh khoản căn hộ tại TP.HCM và vùng ven tăng trở lại trong quý II.", time: "12 giờ trước" },
];

export default function NewsPage() {
  const [featured, ...rest] = MOCK_NEWS;

  return (
    <>
      <PageHeader
        title="Tin tức tài chính"
        description="Tổng hợp tin tức giá vàng, chứng khoán, ngân hàng và bất động sản — tự động cập nhật."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Tin tức" }]}
        icon={Newspaper}
        badge="Cập nhật liên tục"
      />
      <div className="container-page space-y-8 py-10">
        {/* Featured */}
        <Link
          href={`/tin-tuc/${featured.slug}`}
          className="card-hover group block overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-sm"
        >
          <span
            className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              CATEGORY_COLORS[featured.category] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {featured.category}
          </span>
          <h2 className="mt-3 max-w-3xl text-2xl font-extrabold leading-snug group-hover:text-amber-300 md:text-3xl">
            {featured.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">{featured.excerpt}</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {featured.time}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
              Đọc tiếp
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {rest.map((n) => (
            <Link
              key={n.slug}
              href={`/tin-tuc/${n.slug}`}
              className="card-hover group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    CATEGORY_COLORS[n.category] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {n.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {n.time}
                </span>
              </div>
              <h2 className="text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-amber-700">
                {n.title}
              </h2>
              <p className="text-sm text-slate-500">{n.excerpt}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                Đọc tiếp{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
