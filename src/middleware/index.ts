import { createClient } from "@supabase/supabase-js";
import { defineMiddleware } from "astro:middleware";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/workouts", "/goals", "/progress", "/plans"];

// Auth routes that should redirect if already logged in
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;

  // Get tokens from cookies
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  // Create Supabase client with tokens from cookies
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  });

  // Attach supabase client to context
  context.locals.supabase = supabase;

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Get current user session
  let user = null;
  if (accessToken) {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      user = currentUser;

      // If access token is invalid but refresh token exists, try to refresh
      if (!user && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error && data.session) {
          user = data.user;
          // Update cookies with new tokens
          cookies.set("sb-access-token", data.session.access_token, {
            path: "/",
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });

          cookies.set("sb-refresh-token", data.session.refresh_token, {
            path: "/",
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
        }
      }
    } catch {
      // Invalid token, clear cookies
      cookies.delete("sb-access-token", { path: "/" });
      cookies.delete("sb-refresh-token", { path: "/" });
    }
  }

  // Redirect logic
  if (isProtectedRoute && !user) {
    // User trying to access protected route without authentication
    // Redirect to login with return URL
    return redirect(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
  }

  if (isAuthRoute && user) {
    // User already logged in trying to access auth pages
    // Redirect to dashboard
    return redirect("/dashboard");
  }

  return next();
});
