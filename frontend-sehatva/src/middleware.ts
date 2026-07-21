import { NextResponse, type NextRequest } from "next/server";

// Placeholder middleware. Wire up real session checks here once
// authentication is backed by a real API (see src/services/auth.service.ts).
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/recovery/:path*", "/medicines/:path*"],
};
