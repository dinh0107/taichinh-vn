import type { Metadata } from "next";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildFinancialServiceSchema,
  type JsonLd,
} from "@/lib/seo/schema";
import { canonicalUrl, canonicalUrlSync } from "@/lib/seo/site-url";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
};

export function buildPageMetadataSync({
  title,
  description,
  path,
  ogType = "website",
}: PageMetaInput): Metadata {
  const url = canonicalUrlSync(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: ogType,
      locale: "vi_VN",
      url,
    },
  };
}

export async function buildPageMetadata({
  title,
  description,
  path,
  ogType = "website",
}: PageMetaInput): Promise<Metadata> {
  const url = await canonicalUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: ogType,
      locale: "vi_VN",
      url,
    },
  };
}

export function buildModulePageJsonLd(input: {
  serviceName: string;
  serviceDescription: string;
  path: string;
  breadcrumbLabel: string;
  faqs?: { question: string; answer: string }[];
}): JsonLd[] {
  const pageUrl = canonicalUrlSync(input.path);
  const schemas: JsonLd[] = [
    buildFinancialServiceSchema(input.serviceName, input.serviceDescription),
  ];
  if (input.path !== "/") {
    schemas.unshift(
      buildBreadcrumbSchema([
        { name: "Trang chủ", url: canonicalUrlSync("/") },
        { name: input.breadcrumbLabel, url: pageUrl },
      ])
    );
  }
  if (input.faqs?.length) {
    schemas.push(buildFaqSchema(input.faqs));
  }
  return schemas;
}

export const MODULE_FAQS = {
  home: [
    {
      question: "TaiChinh.vn cung cấp dữ liệu gì?",
      answer:
        "Giá vàng SJC/DOJI/PNJ, tỷ giá ngoại tệ, lãi suất ngân hàng, chỉ số chứng khoán và giá xăng dầu — cập nhật liên tục, miễn phí.",
    },
    {
      question: "Dữ liệu cập nhật bao lâu một lần?",
      answer: "Giá vàng và tỷ giá cập nhật mỗi 5 phút. Các chỉ số khác theo chu kỳ đồng bộ từng module.",
    },
  ],
  forex: [
    {
      question: "Tỷ giá USD/VND hôm nay bao nhiêu?",
      answer:
        "Xem bảng tỷ giá mua/bán tại các ngân hàng lớn trên trang Tỷ giá — cập nhật theo từng phiên.",
    },
    {
      question: "Tỷ giá nào dùng để quy đổi?",
      answer:
        "Tỷ giá bán (sell) thường áp dụng khi mua ngoại tệ; tỷ giá mua (buy) khi bán ngoại tệ về VND.",
    },
  ],
  interest: [
    {
      question: "Lãi suất tiết kiệm 12 tháng cao nhất là bao nhiêu?",
      answer:
        "So sánh trực tiếp trên bảng lãi suất 7 ngân hàng lớn — kỳ hạn 12 tháng được đánh dấu cao nhất.",
    },
    {
      question: "Gửi tiết kiệm có tính thuế không?",
      answer:
        "Tiền lãi tiết kiệm cá nhân hiện được miễn thuế thu nhập cá nhân theo quy định Việt Nam.",
    },
  ],
  stocks: [
    {
      question: "VN-Index là gì?",
      answer:
        "VN-Index là chỉ số chính của sàn HOSE, phản ánh xu hướng thị trường cổ phiếu vốn hóa lớn.",
    },
    {
      question: "Dữ liệu chứng khoán cập nhật khi nào?",
      answer: "Trong giờ giao dịch, chỉ số được cập nhật định kỳ theo phiên.",
    },
  ],
  fuel: [
    {
      question: "Giá xăng RON95 hôm nay?",
      answer: "Xem mức giá niêm yết mới nhất tại bảng Giá xăng dầu trên TaiChinh.vn.",
    },
    {
      question: "Giá xăng điều chỉnh bao lâu một lần?",
      answer: "Theo chu kỳ điều hành của liên Bộ Tài chính — Công Thương, thường 15 ngày/lần.",
    },
  ],
  news: [
    {
      question: "Tin tức trên TaiChinh.vn có đáng tin không?",
      answer:
        "Nội dung tổng hợp từ nguồn công khai, mang tính tham khảo — không phải khuyến nghị đầu tư.",
    },
  ],
} as const;
