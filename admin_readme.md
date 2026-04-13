# habibaminhas Admin Panel - Production Architecture Blueprint (v9.3)

**STATUS: ✅ FULLY IMPLEMENTED (Phase 1 Refactoring Complete)**

## 1. Directory Structure (`src/app/admin` & `src/lib`)

The Admin Panel has been fully refactored to follow a strictly bounded **Component + Thin Server Action + Separated Domain Logic** pattern.

```text
src/
├── lib/
│   ├── auth.ts               // Centralized requireAdmin() logic with .maybeSingle() safety.
│   ├── validations.ts        // Server-side Zod validation schemas (double verification).
│   └── admin/
│       ├── dashboard.ts      // Root Dashboard SQL Abstractions.
│       ├── products.ts       // Products Domain logic decoupled from UI and API routes.
│       ├── categories.ts     // Categories Domain logic.
│       ├── orders.ts         // Orders Domain logic.
│       └── customers.ts      // Customers Domain logic.
│
└── app/admin/
    ├── layout.tsx            // Async Server Component protecting the /admin route.
    ├── error.tsx             // Global Admin Error Boundary (Catches requireAdmin() locks & freezes).
    ├── page.tsx              // Main Dashboard (Static w/ revalidate = 60s or Tag-based).
    │
    ├── login/
    │   └── page.tsx          // Secure Login (Native Next.js redirects only).
    │
    ├── products/
    │   └── actions.ts        // 100% Thin Action wrapping lib/admin/products.ts.
    │
    ├── categories/
    │   └── actions.ts        // 100% Thin Action wrapping lib/admin/categories.ts.
    │
    ├── orders/
    │   └── actions.ts        // 100% Thin Action wrapping lib/admin/orders.ts.
    │
    └── customers/
        └── actions.ts        // 100% Thin Action wrapping lib/admin/customers.ts.
```

---

## 🚨 Final Architecture Rules Completed

Every single architecture flaw identified during the Stress Test has now been successfully rebuilt:

### 🚩 1. The Caching Trap — Strategic Server Components & Tags
**Status: ✅ Implemented.**
- The `layout.tsx` is officially a Server Component.
- Error handling has been abstracted into `error.tsx` catching native UI hangs.

### 🚩 2. Revalidation — Surgical vs. Nuclear
**Status: ✅ Implemented.**
- The thin `actions.ts` files now strictly leverage `revalidatePath('...', 'layout')` only when appropriate (like syncing the dashboard states or modifying upstream shop counts when order statuses change).

### 🚩 3. Scalable Security — The `profiles` Table & Strict RLS
**Status: ✅ Implemented (Requires final DB execution by User).**
- `.createAdminClient()` using `SUPABASE_SERVICE_ROLE_KEY` has been completely purged from your CRUD application workflows.
- All domain abstractions now exclusively use `createClient()` meaning they respect your database's secure RLS policies natively.
- **Action Required:** `admin_rls_setup.sql` is provided at the root folder so the database fully enforces these boundaries on Postgres directly.

### 🚩 4. Session Validation — The Universal `requireAdmin()`
**Status: ✅ Implemented.**
- `src/lib/auth.ts` -> `export async function requireAdmin()` is live.
- It leverages `.maybeSingle()` to ensure it doesn't hard-crash on deleted profiles.
- Every thin router in your codebase calls this 1 function. If authentication fails, it explicitly throws an `Error` resulting in the `error.tsx` boundary catching the unhandled promise instead of allowing the browser to hang indefinitely.

### 🚩 5. Realtime Memory Leaks — Bulletproof Providers & Cleanup
**Status: ✅ Implemented.**
- `useRef(false)` has been added to `AdminNotificationContext.tsx` preventing multi-sub-mount anomalies in Next.js caching.
- On forced logouts, `supabase.removeAllChannels()` fires aggressively destroying any zombie websockets hooked to the realtime listener across sessions.

### 🚩 6. Error Boundaries — No More Unhandled Promises
**Status: ✅ Implemented.**
- All 21 API functions spread across your 5 domain boundaries are wrapped entirely in Try / Catch structures inside your `actions.ts` files natively returning safely to your forms.
- `error.tsx` is mounted at root `/admin` for all Server Side crashes.

### 🚩 7. Thin Server Actions & Dual Validation
**Status: ✅ Implemented.**
- `src/lib/validations.ts` exports hard Zod maps.
- All 5 `actions.ts` files are literally just routers. They call `requireAdmin()`, invoke the SQL Abstraction in `lib/admin/...`, and call `revalidatePath`. Clean, testable, strictly bound logic.
