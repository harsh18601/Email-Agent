import { auth } from "@/auth"
 
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboardPage && !isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl.origin));
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
