import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

// Ensure the tables exists
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPost() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*');
    
  if (error) {
    console.error("Error fetching blog_posts:", error.message);
    if (error.code === '42P01') {
      console.log("TABLE DOES NOT EXIST. Please run create_blog_table.sql!");
    }
  } else {
    console.log("Found blog posts:", data.length);
    console.log("Posts Data:", data.map(p => ({ title: p.title, slug: p.slug, status: p.status })));
  }
}

testPost();
