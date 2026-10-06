import { ogImage, ogSize } from "@/components/og-image";
import { content } from "@/lib/content";

export const alt = content.en.og.radio.alt;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage("en", "radio");
}
