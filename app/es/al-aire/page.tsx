import RadioApp from "@/components/radio-app";
import { JsonLd } from "@/components/guide/guide";
import { RadioGuide } from "@/components/guide/page-guides";
import { content } from "@/lib/content";
import { pageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("es", "radio");

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd("es", "radio", content.es.radio.faq)} />
      <RadioApp about={<RadioGuide locale="es" />} />
    </>
  );
}
