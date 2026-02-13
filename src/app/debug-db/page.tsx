"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function DebugDBPage() {
  const [logs, setLogs] = useState<string[]>([]);
  // Memoize client to prevent recreation on re-renders, which might cause race conditions
  const supabase = useMemo(() => createClient(), []);

  const log = (msg: string) => setLogs((prev) => [...prev, msg]);

  const runDiagnostics = async () => {
    setLogs([]);
    log("Starting Diagnostics v2...");
    
    // 0. Env Var Check
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    log(`Environment Check: URL=${hasUrl}, Key=${hasKey}`);
    
    if (!hasUrl || !hasKey) {
        log("❌ CRITICAL: Missing Environment Variables. Check .env.local file.");
        return;
    }

    try {
      // 1. Network/Public Check
      log("Testing Public Connection (SDK)...");
      
      try {
          // Determine if we can fetch data. 5s timeout using Promise.race just in case it hangs
          const sdkPromise = supabase
            .from("products")
            .select('*', { count: 'exact', head: true });
            
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout (5s)")), 5000));
          
          const result: any = await Promise.race([sdkPromise, timeoutPromise]);
          const { count, error: pubError } = result;

          if (pubError) {
            log(`❌ SDK Connection Failed: ${pubError.message} (${pubError.code})`);
            throw new Error("SDK Failed");
          }
          log(`✅ SDK Connection OK. Product Count: ${count}`);
      } catch (err: any) {
          log(`⚠️ SDK Error: ${err.message}`);
          
          // Fallback: Try Raw Fetch
          log("Attempts Raw REST Fetch...");
          try {
             const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*&limit=1`;
             const res = await fetch(url, {
                headers: {
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
                }
             });
             
             if (res.ok) {
                 log("✅ Raw REST Fetch OK! (SDK might be slow but working)");
             } else {
                 log(`❌ Raw REST Fetch Failed: ${res.status} ${res.statusText}`);
             }
          } catch (fetchErr: any) {
             log(`❌ Raw Fetch Error: ${fetchErr.message}`);
          }
          log("⚠️ Proceeding with checks despite SDK warning...");
          // Do NOT return, try Auth anyway
      }

      // 2. Check Auth
      log("Testing Authentication...");
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
          log(`❌ Auth Check Failed: ${authError.message}`);
          return;
      }
      
      if (!session) {
        log("⚠️ No active session using getSession(). Trying getUser()...");
        // Fallback check
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            log("❌ No active session. Please log in.");
            return;
        }
        log(`✅ Authenticated via getUser() as: ${user.id}`);
      } else {
        log(`✅ Authenticated via getSession() as: ${session.user.id}`);
      }
      
      const userId = session?.user.id || (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      // 3. Test 'orders' Table Permissions (Insert)
      log("Testing 'orders' table INSERT...");
      const dummyOrder = {
        client_id: userId,
        total_amount: 1,
        status: "pending",
        shipping_address: "Debug Test Address",
        payment_method: "cod"
      };
      
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(dummyOrder)
        .select()
        .single();

      if (orderError) {
        log(`❌ 'orders' INSERT Failed: ${orderError.message} (Code: ${orderError.code})`);
        if (orderError.code === "42703") log("   ➥ Suggestion: 'orders' table missing columns (payment_method?). Run Schema Update.");
        if (orderError.code === "42501") log("   ➥ Suggestion: RLS Policy blocking INSERT. Run RLS Fix.");
        return;
      }
      log(`✅ 'orders' INSERT Success. ID: ${order.id}`);

      // 4. Test RPC 'place_order' existence
      log("Testing 'place_order' RPC...");
      const { error: rpcError } = await supabase.rpc("place_order", {
        p_client_id: userId,
        p_total_amount: 1,
        p_items: [],
        p_shipping_address: "Debug RPC",
        p_payment_method: "cod"
      });

      if (rpcError) {
         log(`❌ RPC Attempt Failed: ${rpcError.message} (Code: ${rpcError.code})`);
         if (rpcError.code === "PGRST202") log("   ➥ Suggestion: Function 'place_order' not found. Run SQL Script.");
      } else {
         log("✅ RPC Call Success (Logic executed).");
      }

      // Cleanup (Delete dummy order)
      log("Cleaning up dummy order...");
      await supabase.from("orders").delete().eq("id", order.id);
      log("Diagnostics Complete.");

    } catch (e: any) {
      log(`❌ Unexpected Diagnostics Error: ${e.message}`);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Database Diagnostics v2</h1>
      <p className="text-gray-500">Run this to identify why orders aren't saving.</p>
      
      <Button onClick={runDiagnostics}>Run Diagnostics</Button>

      <div className="bg-gray-100 p-4 rounded-md font-mono text-sm min-h-[200px] whitespace-pre-wrap border border-gray-300">
        {logs.length === 0 ? "Logs will appear here..." : logs.join("\n")}
      </div>
    </div>
  );
}
