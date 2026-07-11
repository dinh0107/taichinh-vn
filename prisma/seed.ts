import { PrismaClient, BankCode } from "@prisma/client";
import bcrypt from "bcryptjs";
import { GOLD_API_CODES } from "../src/modules/gold/types";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user (bootstrap from env)
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@taichinh.vn")
    .toLowerCase()
    .trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123456";
  const adminName = process.env.ADMIN_NAME ?? "Quản trị viên";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: adminName,
      role: "ADMIN",
      passwordHash,
    },
    update: { role: "ADMIN", passwordHash, name: adminName },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  // Gold types
  for (const [code, meta] of Object.entries(GOLD_API_CODES)) {
    await prisma.goldType.upsert({
      where: { code },
      create: {
        code,
        name: meta.nameVi,
        nameVi: meta.nameVi,
        brand: meta.brand,
        purity: meta.purity,
        unit: code === "XAUUSD" ? "USD/oz" : "VND/lượng",
        currency: code === "XAUUSD" ? "USD" : "VND",
        externalId: code,
        sortOrder: code === "SJL1L10" ? 1 : 10,
      },
      update: {},
    });
  }

  // Banks
  const banks: { code: BankCode; name: string; nameVi: string }[] = [
    { code: "VIETCOMBANK", name: "Vietcombank", nameVi: "Ngân hàng TMCP Ngoại thương Việt Nam" },
    { code: "BIDV", name: "BIDV", nameVi: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam" },
    { code: "AGRIBANK", name: "Agribank", nameVi: "Ngân hàng Nông nghiệp và Phát triển Nông thôn" },
    { code: "TECHCOMBANK", name: "Techcombank", nameVi: "Ngân hàng TMCP Kỹ thương Việt Nam" },
    { code: "MB_BANK", name: "MB Bank", nameVi: "Ngân hàng TMCP Quân đội" },
    { code: "ACB", name: "ACB", nameVi: "Ngân hàng TMCP Á Châu" },
    { code: "VP_BANK", name: "VPBank", nameVi: "Ngân hàng TMCP Việt Nam Thịnh Vượng" },
  ];

  for (const bank of banks) {
    await prisma.bank.upsert({
      where: { code: bank.code },
      create: bank,
      update: {},
    });
  }

  // Stock indices
  const indices = [
    { code: "VNINDEX", name: "VN-Index", market: "HOSE" as const, value: 1285.42 },
    { code: "HNXINDEX", name: "HNX-Index", market: "HNX" as const, value: 248.67 },
    { code: "UPCOM", name: "UPCOM Index", market: "UPCOM" as const, value: 98.12 },
  ];

  for (const idx of indices) {
    await prisma.stockIndex.upsert({
      where: { code: idx.code },
      create: { ...idx, change: 0, changePct: 0 },
      update: {},
    });
  }

  // SEO pages
  const seoPages = [
    { slug: "gia-vang-hom-nay", title: "Giá vàng hôm nay", type: "GOLD_TODAY" as const },
    { slug: "gia-vang-sjc-hom-nay", title: "Giá vàng SJC hôm nay", type: "GOLD_BRAND" as const },
    { slug: "ty-gia-usd-hom-nay", title: "Tỷ giá USD hôm nay", type: "FX_CURRENCY" as const },
    { slug: "lai-suat-vietcombank", title: "Lãi suất Vietcombank", type: "INTEREST_BANK" as const },
  ];

  for (const page of seoPages) {
    await prisma.seoPage.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        pageType: page.type,
        title: page.title,
        metaDescription: `Cập nhật ${page.title.toLowerCase()} mới nhất. Dữ liệu realtime từ TaiChinh.vn`,
        h1: page.title,
      },
      update: {},
    });
  }

  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
