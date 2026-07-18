/**
 * Static info / legal pages for footer + EEAT.
 * `updatedAt` = editorial last-review date (ISO). Bump when content changes.
 */

export type InfoPageDef = {
  slug: string;
  title: string;
  description: string;
  /** Editorial author / desk shown on page */
  author: string;
  /** Last content review (YYYY-MM-DD) */
  updatedAt: string;
  /** HTML body sections (h2 + p allowed; no h1) */
  sections: { heading: string; html: string }[];
};

const AUTHOR_DESK = "Ban biên tập Giá Hôm Nay";
const UPDATED = "2026-07-18";

export const INFO_PAGES: InfoPageDef[] = [
  {
    slug: "gioi-thieu",
    title: "Giới thiệu",
    description:
      "Giá Hôm Nay — cổng tra cứu giá vàng, tỷ giá, lãi suất, chứng khoán và giá xăng dầu cập nhật liên tục tại Việt Nam.",
    author: AUTHOR_DESK,
    updatedAt: UPDATED,
    sections: [
      {
        heading: "Chúng tôi là ai",
        html: `<p><strong>Giá Hôm Nay</strong> là website cung cấp dữ liệu thị trường tài chính Việt Nam: giá vàng SJC/DOJI/PNJ, tỷ giá ngân hàng, lãi suất tiết kiệm, chỉ số chứng khoán và giá xăng dầu. Mục tiêu là giúp người dùng tra cứu nhanh, miễn phí, với dữ liệu được đồng bộ định kỳ từ các nguồn công khai.</p>`,
      },
      {
        heading: "Cam kết",
        html: `<p>Chúng tôi ưu tiên độ chính xác và tính cập nhật của số liệu, ghi rõ nguồn khi có thể, và không đưa khuyến nghị đầu tư. Nội dung mang tính tham khảo; người dùng tự chịu trách nhiệm khi quyết định giao dịch.</p>`,
      },
    ],
  },
  {
    slug: "lien-he",
    title: "Liên hệ",
    description:
      "Liên hệ Ban biên tập Giá Hôm Nay về hợp tác, báo lỗi dữ liệu hoặc góp ý nội dung.",
    author: AUTHOR_DESK,
    updatedAt: UPDATED,
    sections: [
      {
        heading: "Thông tin liên hệ",
        html: `<p>Email hỗ trợ: <a href="mailto:lienhe@giahomnay.site">lienhe@giahomnay.site</a></p><p>Website: <a href="https://giahomnay.site">https://giahomnay.site</a></p><p>Vui lòng mô tả rõ vấn đề (URL trang, thời điểm, ảnh chụp nếu có) để chúng tôi phản hồi nhanh hơn.</p>`,
      },
      {
        heading: "Hợp tác & quảng cáo",
        html: `<p>Đối tác muốn đặt banner, affiliate hoặc chia sẻ dữ liệu vui lòng gửi email với tiêu đề «Hợp tác» và thông tin liên hệ.</p>`,
      },
    ],
  },
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính sách bảo mật",
    description:
      "Chính sách bảo mật của Giá Hôm Nay — cách chúng tôi thu thập, sử dụng và bảo vệ thông tin người dùng.",
    author: AUTHOR_DESK,
    updatedAt: UPDATED,
    sections: [
      {
        heading: "Phạm vi",
        html: `<p>Chính sách này áp dụng khi bạn truy cập giahomnay.site. Chúng tôi tôn trọng quyền riêng tư và chỉ thu thập dữ liệu cần thiết để vận hành website.</p>`,
      },
      {
        heading: "Dữ liệu thu thập",
        html: `<p>Có thể gồm: nhật ký truy cập kỹ thuật (IP, trình duyệt), cookie/analytics (nếu bật), và thông tin bạn chủ động gửi qua form/email liên hệ. Tài khoản Admin chỉ dành cho biên tập viên nội bộ.</p>`,
      },
      {
        heading: "Mục đích sử dụng",
        html: `<p>Dùng để vận hành site, đo lường lưu lượng, cải thiện nội dung và phản hồi yêu cầu của bạn. Chúng tôi không bán thông tin cá nhân.</p>`,
      },
      {
        heading: "Bên thứ ba",
        html: `<p>Có thể dùng dịch vụ phân tích/quảng cáo (ví dụ Google Analytics, AdSense) theo chính sách của nhà cung cấp. Bạn có thể chặn cookie trên trình duyệt.</p>`,
      },
      {
        heading: "Liên hệ về quyền riêng tư",
        html: `<p>Gửi yêu cầu tới <a href="mailto:lienhe@giahomnay.site">lienhe@giahomnay.site</a>.</p>`,
      },
    ],
  },
  {
    slug: "dieu-khoan",
    title: "Điều khoản sử dụng",
    description:
      "Điều khoản sử dụng website Giá Hôm Nay — quyền, nghĩa vụ và giới hạn trách nhiệm.",
    author: AUTHOR_DESK,
    updatedAt: UPDATED,
    sections: [
      {
        heading: "Chấp nhận điều khoản",
        html: `<p>Khi sử dụng website, bạn đồng ý với các điều khoản này. Nếu không đồng ý, vui lòng ngừng truy cập.</p>`,
      },
      {
        heading: "Nội dung & dữ liệu",
        html: `<p>Giá cả, tỷ giá và bài viết mang tính tham khảo, có thể chậm hoặc sai lệch so với sàn giao dịch/ngân hàng. Không phải tư vấn đầu tư, thuế hay pháp lý.</p>`,
      },
      {
        heading: "Sở hữu trí tuệ",
        html: `<p>Giao diện, thương hiệu và nội dung gốc thuộc Giá Hôm Nay. Không sao chép hàng loạt vì mục đích thương mại khi chưa được phép.</p>`,
      },
      {
        heading: "Giới hạn trách nhiệm",
        html: `<p>Chúng tôi không chịu trách nhiệm về thiệt hại phát sinh từ việc sử dụng hoặc không sử dụng được dữ liệu trên website.</p>`,
      },
    ],
  },
  {
    slug: "chinh-sach-bien-tap",
    title: "Chính sách biên tập",
    description:
      "Chính sách biên tập Giá Hôm Nay — tiêu chuẩn xác minh nguồn, minh bạch và độc lập.",
    author: AUTHOR_DESK,
    updatedAt: UPDATED,
    sections: [
      {
        heading: "Nguyên tắc",
        html: `<p>Ưu tiên số liệu từ nguồn công khai có thể kiểm chứng. Phân biệt rõ dữ liệu thị trường và nội dung phân tích/tin tức. Không bịa số liệu.</p>`,
      },
      {
        heading: "Nội dung do AI hỗ trợ",
        html: `<p>Một số bài có thể được soạn thảo hoặc hỗ trợ bởi AI dựa trên số liệu đã đồng bộ, sau đó được rà soát theo quy trình biên tập. Bài AI được ghi nhận trong hệ thống khi áp dụng.</p>`,
      },
      {
        heading: "Sửa lỗi",
        html: `<p>Khi phát hiện sai sót, chúng tôi cập nhật nội dung và ghi nhận ngày cập nhật trên trang liên quan. Bạn có thể báo lỗi qua trang Liên hệ.</p>`,
      },
      {
        heading: "Độc lập",
        html: `<p>Quảng cáo/affiliate (nếu có) được tách biệt khỏi số liệu thị trường. Nội dung biên tập không bị chi phối bởi đối tác quảng cáo.</p>`,
      },
    ],
  },
  {
    slug: "nguon-du-lieu",
    title: "Thông tin nguồn dữ liệu",
    description:
      "Nguồn dữ liệu giá vàng, tỷ giá, lãi suất, chứng khoán và xăng dầu trên Giá Hôm Nay.",
    author: AUTHOR_DESK,
    updatedAt: UPDATED,
    sections: [
      {
        heading: "Tổng quan",
        html: `<p>Dữ liệu được đồng bộ định kỳ qua cron và lưu trên hệ thống của chúng tôi để hiển thị nhanh. Thời gian làm mới tùy module (vàng/tỷ giá thường xuyên hơn lãi suất hay xăng dầu).</p>`,
      },
      {
        heading: "Các nhóm nguồn",
        html: `<ul><li><strong>Giá vàng:</strong> API tổng hợp công khai (cấu hình tại Admin), tham chiếu các thương hiệu SJC, DOJI, PNJ, Bảo Tín…</li><li><strong>Tỷ giá:</strong> Adapter ngân hàng / nguồn công bố tỷ giá mua bán.</li><li><strong>Lãi suất:</strong> Tổng hợp lãi suất tiết kiệm các ngân hàng lớn.</li><li><strong>Chứng khoán:</strong> Chỉ số (VNINDEX, HNX, UPCOM) qua API thị trường khi khả dụng.</li><li><strong>Xăng dầu:</strong> Widget/API giá bán lẻ Petrolimex (vùng 1/vùng 2 khi có).</li><li><strong>Tin tức:</strong> Biên tập nội bộ, tổng hợp nguồn công khai hoặc ingest có ghi nguồn.</li></ul>`,
      },
      {
        heading: "Lưu ý",
        html: `<p>Nguồn bên thứ ba có thể gián đoạn; khi đó hệ thống có thể giữ giá trị gần nhất hoặc tạm thiếu dữ liệu. Luôn đối chiếu lại với niêm yết chính thức trước khi giao dịch.</p>`,
      },
    ],
  },
  {
    slug: "tac-gia",
    title: "Tác giả",
    description:
      "Thông tin Ban biên tập và trách nhiệm nội dung trên Giá Hôm Nay.",
    author: AUTHOR_DESK,
    updatedAt: UPDATED,
    sections: [
      {
        heading: "Ban biên tập",
        html: `<p>Nội dung website do <strong>Ban biên tập Giá Hôm Nay</strong> chịu trách nhiệm xuất bản. Bài viết tin tức ghi rõ nguồn khi trích dẫn; bài phân tích dựa trên dữ liệu đã đồng bộ trong ngày.</p>`,
      },
      {
        heading: "Trách nhiệm",
        html: `<p>Biên tập viên kiểm tra số liệu chính, tiêu đề SEO và disclaimer rủi ro. Mọi góp ý về độ chính xác gửi qua trang Liên hệ.</p>`,
      },
    ],
  },
  {
    slug: "ngay-cap-nhat",
    title: "Ngày cập nhật",
    description:
      "Ngày cập nhật nội dung thông tin và chính sách trên Giá Hôm Nay.",
    author: AUTHOR_DESK,
    updatedAt: UPDATED,
    sections: [
      {
        heading: "Cách chúng tôi ghi nhận",
        html: `<p>Mỗi trang giới thiệu/chính sách hiển thị <strong>Ngày cập nhật</strong> (lần rà soát nội dung gần nhất). Dữ liệu giá thị trường cập nhật theo lịch cron riêng và có thể khác với ngày trên trang pháp lý.</p>`,
      },
      {
        heading: "Lần rà soát gần nhất",
        html: `<p>Bộ trang thông tin hiện tại được rà soát ngày <strong>18/07/2026</strong>. Khi sửa chính sách hoặc giới thiệu, chúng tôi cập nhật trường ngày trên từng trang.</p>`,
      },
    ],
  },
];

export function getInfoPage(slug: string): InfoPageDef | undefined {
  return INFO_PAGES.find((p) => p.slug === slug);
}

export function infoPagePath(slug: string): string {
  return `/${slug}`;
}

export const INFO_PAGE_SLUGS = INFO_PAGES.map((p) => p.slug);
