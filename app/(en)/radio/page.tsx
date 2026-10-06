import RadioApp from "@/components/radio-app";
import { JsonLd } from "@/components/guide/guide";
import { RadioGuide } from "@/components/guide/page-guides";
import { content } from "@/lib/content";
import { pageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("en", "radio");

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd("en", "radio", content.en.radio.faq)} />
      <RadioApp about={<RadioGuide locale="en" />} />
    </>
  );
}
