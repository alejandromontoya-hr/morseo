import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Enlaces copiados de un texto con el punto, la coma o el paréntesis final pegados: /learn. → /learn. */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = url.pathname.replace(/[.,)]+$/, "") || "/";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*[.,\\)])"],
};
