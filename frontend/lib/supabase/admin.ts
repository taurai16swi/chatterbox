import "server-only";

import { createClient } from "@supabase/supabase-js";

export class SupabaseConfigurationError extends Error {
  constructor(
    readonly missingVariables: string[],
  ) {
    super("Supabase server configuration is incomplete.");
    this.name = "SupabaseConfigurationError";
  }
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const missingVariables = [
      !supabaseUrl ? "SUPABASE_URL" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ].filter((variable): variable is string => variable !== null);
    throw new SupabaseConfigurationError(missingVariables);
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
