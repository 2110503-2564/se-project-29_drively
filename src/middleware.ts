import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth((req) => {
  const url = req.nextUrl.clone();

  // Check if user is authenticated and redirect to booking path after sign-in/sign-out
  if (!req.nextauth.token) {
    url.pathname = '/booking';  // Adjust this path as per your desired redirection
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/booking", "/mybooking", "/allbooking"], // add other paths if necessary
};
