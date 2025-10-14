### 🧭 **TROUBLESHOOTING.md**

#### 🧩 1. Vercel Build Failing — `ERR_PNPM_UNSUPPORTED_ENGINE` (PNPM 6.35.1 vs 9.7.1)

**Date fixed:** Oct 2025
**Symptoms:**

* Vercel logs showed:

  ```
  ERR_PNPM_UNSUPPORTED_ENGINE Unsupported environment (bad pnpm and/or Node.js version)
  Expected version: 9.7.x
  Got: 6.35.1
  ```
* Even after updating `package.json` and local pnpm, Vercel kept using version 6.35.1.
* Local builds worked fine (`pnpm --filter web build` succeeded).

**Root Cause:**
Vercel uses a **preinstalled global pnpm (6.x)** unless explicitly overridden.
It ignored the local `packageManager` field and `pnpm-lock.yaml` version.

**Fix:**
Force Vercel to use the correct pnpm version manually via **Build Settings**.

**Solution:**

1. In Vercel → *Project Settings → Build & Development Settings*
2. Set:

   ```
   Install Command:
   npx -y pnpm@9.7.1 install --frozen-lockfile=false

   Build Command:
   npx -y pnpm@9.7.1 --filter web build
   ```
3. Save and redeploy.

✅ **Result:**
Vercel now correctly uses `pnpm 9.7.1` and `Node 20.x`, builds succeed consistently.

---

#### ⚛️ 2. React “useContext” Hook Error — Version Mismatch Across Dependencies

**Date fixed:** Sept 2025
**Symptoms:**

* Runtime error:

  ```
  Invalid hook call. Hooks can only be called inside of the body of a function component.
  ```
* Console showed multiple React instances (`react@18.2.0`, `react@18.3.1`).
* Occurred after adding third-party libraries like `@heroicons/react` and `react-hot-toast`.

**Root Cause:**
Different dependencies pulled **inconsistent React versions**, leading to multiple React copies in the bundle.

**Fix:**
Force a single consistent version across all packages.

**Solution:**

1. Check active React versions:

   ```
   npm ls react
   npm ls react-dom
   ```
2. Add these overrides to the **root `package.json`**:

   ```json
   "resolutions": {
     "react": "18.3.1",
     "react-dom": "18.3.1"
   }
   ```
3. Reinstall dependencies:

   ```
   pnpm install
   ```

✅ **Result:**
App rebuilt cleanly, no more hook conflicts.
All packages now share the same React context.

---

### 🧰 3. **New Issue Log Template (for future debugging)**

> Copy this section for each new issue you encounter.

**Title:**
*(Short description of the problem)*

**Date fixed:**
*(When you resolved it)*

**Symptoms:**

* *(What you saw, e.g. error messages, logs, UI behavior)*

**Root Cause:**
*(What actually caused it — version mismatch, missing import, config error, etc.)*

**Fix:**
*(What was changed, removed, or added)*

**Solution Steps:**

1. *(List step-by-step what worked)*
2. *(Include commands or code snippets as needed)*

✅ **Result:**
*(Summarize how you verified that the issue was resolved)*