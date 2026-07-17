import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildModulePageJsonLd } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { SETTING_DEFAULTS } from "@/modules/admin/settings-shared";
import { absoluteUrl } from "@/lib/utils";

export async function ModuleJsonLd({
  serviceName,
  serviceDescription,
  path,
  breadcrumbLabel,
  faqs,
}: {
  serviceName: string;
  serviceDescription: string;
  path: string;
  breadcrumbLabel: string;
  faqs?: { question: string; answer: string }[];
}) {
  const s = await getSiteSettings();
  const siteName = s.site_name || SETTING_DEFAULTS.site_name;
  const v = s.brand_asset_version || "0";
  const data = buildModulePageJsonLd({
    serviceName,
    serviceDescription,
    path,
    breadcrumbLabel,
    faqs,
    siteName,
    image: absoluteUrl(`/api/brand/logo?v=${v}`),
    telephone: s.site_phone?.trim() || undefined,
  });
  return <JsonLdScript data={data} />;
}
