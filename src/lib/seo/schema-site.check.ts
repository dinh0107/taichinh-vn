/**
 * ponytail: Organization + WebSite builders must emit required @types.
 * Run: npx tsx src/lib/seo/schema-site.check.ts
 */
import assert from "node:assert/strict";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "./schema";

const org = buildOrganizationSchema("Giá Hôm Nay", {
  image: "https://giahomnay.site/api/brand/logo",
  telephone: "0900000000",
});
assert.equal(org["@type"], "Organization");
assert.equal(org.name, "Giá Hôm Nay");
assert.ok((org.logo as { url: string }).url);

const web = buildWebSiteSchema("Giá Hôm Nay", {
  description: "Tra cứu giá",
});
assert.equal(web["@type"], "WebSite");
assert.equal(web.inLanguage, "vi");
assert.ok(web.potentialAction);

console.log("schema-site.check ok");
