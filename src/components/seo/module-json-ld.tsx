import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildModulePageJsonLd } from "@/lib/seo/metadata";

export function ModuleJsonLd({
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
  const data = buildModulePageJsonLd({
    serviceName,
    serviceDescription,
    path,
    breadcrumbLabel,
    faqs,
  });
  return <JsonLdScript data={data} />;
}
