import LearnApp from "@/components/learn-app";
import { JsonLd } from "@/components/guide/guide";
import { LearnGuide } from "@/components/guide/page-guides";
import { content } from "@/lib/content";
import { pageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("en", "learn");

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd("en", "learn", content.en.learn.faq)} />
      <LearnApp about={<LearnGuide locale="en" />} />
    </>
  );
}
