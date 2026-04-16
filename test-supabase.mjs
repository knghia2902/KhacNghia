import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// If this is run via node, it needs dotenv
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log("Missing Supabase URL or Anon Key");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
    console.log("Testing Supabase connection...");
    
    // Test auth session or something? We can't act as a user without their token.
    // Let's just check the table exists
    const { data, error } = await supabase.from('world_config').select('*').limit(1);
    
    if (error) {
        console.error("Error reading world_config:", error);
    } else {
        console.log("Successfully read world_config", data);
    }
}

testSupabase();
