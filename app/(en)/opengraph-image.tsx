import { ogImage, ogSize } from "@/components/og-image";
import { content } from "@/lib/content";

export const alt = content.en.og.translate.alt;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage("en", "translate");
}
