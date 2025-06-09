// src/middleware.js
import { NextResponse } from 'next/server';
import { getAuth } from '../lib/firebase';
// filepath: /src/middleware.js
// import { getFirebaseApp } from '../lib/firebase_admin'; // We'll need a Firebase Admin SDK setup for secure server-side auth checking

// NOTE: For client-side auth (like in your AuthTest component),
// you use `onAuthStateChanged` and `signInWithPopup`.
// For server-side (middleware) authentication checks, you need to use the Firebase Admin SDK
// to verify tokens securely without client-side interaction.
// This example below is a conceptual outline. A full implementation of server-side
// auth verification (e.g., verifying ID tokens) would be more complex and
// require a Firebase Admin SDK setup (e.g., getting the ID token from cookies).

// This is a placeholder for actual authentication check.
// In a real app, you'd verify a user's session cookie or ID token here.
async function isAuthenticated(request) {
  // --- CONCEPTUAL PLACEHOLDER ---

  // A robust authentication check in middleware typically involves:
  // 1. Reading an ID token from a cookie or header.
  // 2. Verifying that ID token using Firebase Admin SDK.
  //    Example: admin.auth().verifyIdToken(idToken)
  // 3. Returning true if valid, false otherwise.

  // For now, let's simulate a simple check (which you'll replace)
  // For testing, you might temporarily just return true/false based on a dev flag
  // or a very simple (insecure) cookie if not using full Admin SDK setup yet.

  // For local development with emulators, this can be tricky.
  // You might need to set up a dummy cookie for testing protected routes,
  // or focus on client-side redirection for now if server-side auth is too complex at this stage.

  // *** FOR LOCAL DEVELOPMENT, YOU MAY TEMPORARILY USE A SIMPLISTIC (INSECURE) CHECK ***
  // e.g., if a specific cookie exists:
  // const myAuthCookie = request.cookies.get('my_auth_token');
  // return !!myAuthCookie; // Return true if cookie exists, false otherwise.
  // *** DO NOT USE THIS IN PRODUCTION ***

  // For now, let's assume `true` for authenticated for demonstration,
  // or you can implement a basic client-side redirect from the main page directly
  // if server-side middleware auth is too much for immediate testing.

  // For a real scenario:
  // const idToken = request.cookies.get('__session')?.value;
  // if (!idToken) return false;
  // try {
  //   await admin.auth().verifyIdToken(idToken);
  //   return true;
  // } catch (error) {
  //   return false;
  // }

  // Temporarily return false to force redirection to auth page for testing
  // You'll adjust this based on your actual auth state tracking.
  return false; // Replace with your actual auth logic
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/', '/navigation', '/navigation/challenges', '/navigation/gallery', '/navigation/modules', '/navigation/progress', '/navigation/prompts'];
  const authRoutes = ['/auth']; // Your dedicated authentication page

  const isAuth = await isAuthenticated(request); // Check authentication status

  // If the user is NOT authenticated
  if (!isAuth) {
    // If they are trying to access a protected route, redirect to auth page
    if (protectedRoutes.includes(pathname) || pathname.startsWith('/navigation/')) {
      // Allow API routes to be accessed even if not authenticated, as they are server-side
      // and their own logic should handle auth if needed.
      if (pathname.startsWith('/api/')) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  } else {
    // If the user IS authenticated
    // If they are trying to access the auth page, redirect them to the main app page
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/navigation', request.url));
    }
  }

  // Allow the request to proceed if no redirection is needed
  return NextResponse.next();
}

// Configures which paths the middleware runs on.
// This is important to avoid running it on static assets, etc.
export const config = {
  matcher: ['/', '/auth', '/navigation/:path*', '/api/:path*'], // Run middleware on root, auth, all navigation paths, and all API paths
};