import { createClient } from "@supabase/supabase-js";
import { defineMiddleware } from "astro:middleware";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const onRequest = defineMiddleware((context, next) => {
  // Get authorization token from header
  const authHeader = context.request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  // Create Supabase client with user's token if available
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    },
  });

  context.locals.supabase = supabase;
  return next();
});
