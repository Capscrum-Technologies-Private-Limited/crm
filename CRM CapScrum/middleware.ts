import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based route protection
    if (path.startsWith("/dashboard") && (token?.role !== "ADMIN" && token?.role !== "TEAM")) {
      return NextResponse.redirect(new URL("/auth/login?error=Unauthorized", req.url));
    }

    if (path.startsWith("/portal") && token?.role !== "CLIENT") {
      return NextResponse.redirect(new URL("/auth/login?error=Unauthorized", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*", "/chat/:path*"],
};
