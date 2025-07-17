
# SUMMARY

The primary cause of the failing job is the error “FATAL: role 'root' does not exist” from PostgreSQL, which prevents the backend from starting. This leads to the frontend and health checks failing, resulting in the entire job failing.

**Solution Steps:**

1. **Fix Database User Configuration**:
   - Your backend is trying to connect to PostgreSQL using the `root` user, but PostgreSQL does not have a role named `root` by default.
   - Update your database configuration to use a valid PostgreSQL user (e.g., `postgres`), or create the `root` role in your setup scripts.

   **Example: Update `.env` or config file**
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=your_db
   ```
   Or, if you need a `root` user, create it in your database init scripts:
   ```sql
   CREATE ROLE root WITH LOGIN PASSWORD 'your_password';
   ```

2. **Check Your Workflow Secrets/Environment Variables**:
   - Make sure the CI environment sets the correct database credentials and user.
   - If you use Docker Compose, update the service environment variables accordingly.

   **Example:**
   ```yaml
   environment:
     POSTGRES_USER: postgres
     POSTGRES_PASSWORD: your_password
     POSTGRES_DB: your_db
   ```

3. **Verify Connection String in Application Code**:
   - Make sure your backend uses the correct connection string, matching the credentials above.

   **Example:**
   ```python
   DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/your_db"
   ```

4. **Re-run the CI/CD Workflow**:
   - After correcting the configuration, commit the changes and re-run the workflow. The backend should start and respond to health checks, allowing the frontend to build and start properly.

---

**Summary of Code Changes:**
- Replace all instances of `root` database user with `postgres` or create `root` role in PostgreSQL setup.
- Ensure environment variables and secrets match the intended database user.
- Update Docker Compose or other orchestration configs if used.

---

**Reference:**  
- [Workflow file (.github/workflows/ci.yml)](https://github.com/AI2Phil/digame/blob/34392f712e1ef854b790d5a6a05df0b77664a3eb/.github/workflows/ci.yml)

Apply these fixes, and your job should pass. If you need guidance on a specific config file, let me know the file path or share its contents.


# DETAILED LOG
Run if [ "$VERBOSE" = "true" ]; then
⏳ Waiting for frontend server...

> digame-frontend@1.0.0 dev
> next dev --port 3000 --hostname 0.0.0.0

 ⚠ You are using a non-standard "NODE_ENV" value in your environment. This creates inconsistencies in the project and is strongly advised against. Read more: https://nextjs.org/docs/messages/non-standard-node-env
  ▲ Next.js 14.2.30
  - Local:        http://localhost:3000
  - Network:      http://0.0.0.0:3000
  - Environments: .env.development

 ✓ Starting...
> [PWA] PWA support is disabled
> [PWA] PWA support is disabled
 ⨯ API Routes cannot be used with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export
 ⨯ API Routes cannot be used with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export
 ✓ Ready in 1545ms
 ○ Compiling / ...
 ✓ Compiled / in 4.6s (439 modules)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
 ✓ Compiled /_error in 431ms (441 modules)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 6501ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 76ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 57ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 38ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 21ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 20ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 19ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 19ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 22ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 18ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 22ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 16ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 189ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 19ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 16ms
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ pages/_app.js (59:14) @ WebVitalsReporter
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at AppWithPerformance (webpack-internal:///./pages/_app.js:51:100)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209) {
  page: '/'
}
  57 |         <ToastProvider position="top-right">
  58 |           <div className="App">
> 59 |             <WebVitalsReporter />
     |              ^
  60 |             <Component {...pageProps} />
  61 |           </div>
  62 |         </ToastProvider>
TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 ⨯ TypeError: (0 , react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV) is not a function
    at Document (webpack-internal:///./pages/_document.js:17:96)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:74:209)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Uc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:84:218)
    at /home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:96:272
    at new Promise (<anonymous>)
    at exports.renderToReadableStream (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:95:53)
    at e0 (/home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:8:21476)
    at /home/runner/work/digame/digame/node_modules/next/dist/compiled/next-server/pages.runtime.dev.js:26:4814
    at NextTracerImpl.trace (/home/runner/work/digame/digame/node_modules/next/dist/server/lib/trace/tracer.js:105:20)
 GET / 500 in 17ms
❌ Frontend failed to start
🔧 Recovery in progress...
25h
❌ Recovery failed
Error: Process completed with exit code 1.