import type { Metadata } from "next";
import { buildInfoMetadata, renderInfoPage } from "@/modules/site/info-page-render";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildInfoMetadata("ngay-cap-nhat");
}

export default async function Page() {
  return renderInfoPage("ngay-cap-nhat");
}
