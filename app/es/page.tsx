import TranslateApp from "@/components/translate-app";
import { JsonLd } from "@/components/guide/guide";
import { TranslateGuide } from "@/components/guide/page-guides";
import { content } from "@/lib/content";
import { pageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("es", "translate");

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd("es", "translate", content.es.translate.faq)} />
      <TranslateApp about={<TranslateGuide locale="es" />} />
    </>
  );
}
