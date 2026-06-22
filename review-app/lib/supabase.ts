// Re-exports the browser Supabase client for use in "use client" components.
// This keeps imports like `import { supabase } from "@/lib/supabase"` working.
import { createClient } from "@/utils/supabase/client";

export const supabase = createClient();
