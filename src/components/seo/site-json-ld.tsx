import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/seo/schema";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { SETTING_DEFAULTS } from "@/modules/admin/settings-shared";
import { absoluteUrl } from "@/lib/utils";

/** Sitewide Organization + WebSite JSON-LD (once per page via root layout). */
export async function SiteJsonLd() {
  const s = await getSiteSettings().catch(() => SETTING_DEFAULTS);
  const siteName = s.site_name || SETTING_DEFAULTS.site_name;
  const description =
    s.site_description || SETTING_DEFAULTS.site_description;
  const v = s.brand_asset_version || "0";
  const image = absoluteUrl(`/api/brand/logo?v=${v}`);

  return (
    <JsonLdScript
      data={[
        buildOrganizationSchema(siteName, {
          image,
          telephone: s.site_phone?.trim() || undefined,
          description,
        }),
        buildWebSiteSchema(siteName, { description }),
      ]}
    />
  );
}
