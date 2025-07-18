Run if [ "$VERBOSE" = "true" ]; then
🏗️ Starting optimized build process...
🔧 Starting CI-optimized build process...
🧹 Pre-build cleanup for multi-language optimization...
💾 Available disk space:
Filesystem      Size  Used Avail Use% Mounted on
/dev/root        72G   50G   23G  69% /

> digame-frontend@1.0.0 build
> next build

⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
  ▲ Next.js 14.2.30
  - Experiments (use with caution):
    · esmExternals

   Linting and checking validity of types ...
   Creating an optimized production build ...
> [PWA] Compile server
> [PWA] Compile server
> [PWA] Compile client (static)
> [PWA] Auto register service worker is disabled, please call following code in componentDidMount callback or useEffect hook
> [PWA]   window.workbox.register()
> [PWA] Service worker: /home/runner/work/digame/digame/frontend/public/sw.js
> [PWA]   url: /sw.js
> [PWA]   scope: /
> [PWA] Fallback to precache routes when fetch failed from cache or network:
> [PWA]   document (page): /offline.html
 ✓ Compiled successfully
   Collecting page data ...
   Generating static pages (0/433) ...
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/AboutUsPage". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/AuthPage". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/ComponentDemoPage". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/ComprehensiveDashboardPage". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/ComprehensiveNavigationDemo". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/DemoPage". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/HelpPage". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/NavigationTestPage". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/UserListPage". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/WorkflowAutomationPage". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/admin/config". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/admin/dashboard". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/admin". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/ai-tools/communication". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/ai-tools/documents". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/ai-tools/email". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)

Error occurred prerendering page "/ai-tools". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at /home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12281
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)


Missing a chunk on purpose


    	/team/dashboard: /es/team/dashboard
	/team/skills
	/team/skills: /en/team/skills
	/team/skills: /es/team/skills
	/team/social
	/team/social: /en/team/social
	/team/social: /es/team/social
	/team/teams
	/team/teams: /en/team/teams
	/team/teams: /es/team/teams
	/workflow
	/workflow/advanced
	/workflow/advanced: /en/workflow/advanced
	/workflow/advanced: /es/workflow/advanced
	/workflow/automation
	/workflow/automation: /en/workflow/automation
	/workflow/automation: /es/workflow/automation
	/workflow/calendar
	/workflow/calendar: /en/workflow/calendar
	/workflow/calendar: /es/workflow/calendar
	/workflow/marketplace
	/workflow/marketplace: /en/workflow/marketplace
	/workflow/marketplace: /es/workflow/marketplace
	/workflow/notes
	/workflow/notes: /en/workflow/notes
	/workflow/notes: /es/workflow/notes
	/workflow/optimization
	/workflow/optimization: /en/workflow/optimization
	/workflow/optimization: /es/workflow/optimization
	/workflow/prioritization
	/workflow/prioritization: /en/workflow/prioritization
	/workflow/prioritization: /es/workflow/prioritization
	/workflow: /en/workflow
	/workflow: /es/workflow
npm error Lifecycle script `build` failed with error:
npm error code 1
npm error path /home/runner/work/digame/digame/frontend
npm error workspace digame-frontend@1.0.0
npm error location /home/runner/work/digame/digame/frontend
npm error command failed
npm error command sh -c next build
❌ Build failed on both attempts
Available memory:
               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       920Mi       3.1Gi        49Mi       4.1Gi       6.9Gi
Swap:          3.0Gi          0B       3.0Gi
Available disk space:
Filesystem      Size  Used Avail Use% Mounted on
/dev/root        72G   50G   22G  70% /
Node version: v22.17.0
NPM version: 10.9.2
Build output size:
652M	.
Error: Process completed with exit code 1.


warnings 

Process completed with exit code 1.
frontend-build: frontend/src/components/notifications/AchievementNotification.jsx#L43
React Hook useEffect has a missing dependency: 'handleAutoClose'. Either include it or remove the dependency array
frontend-build: frontend/src/components/learning/CourseCatalog.tsx#L151
React Hook useEffect has a missing dependency: 'applyFilters'. Either include it or remove the dependency array
frontend-build: frontend/src/components/learning/CourseCatalog.tsx#L147
React Hook useEffect has a missing dependency: 'fetchCourses'. Either include it or remove the dependency array
frontend-build: frontend/src/components/intelligence/IntelligenceInsights.tsx#L70
React Hook useEffect has a missing dependency: 'fetchIntelligenceData'. Either include it or remove the dependency array
frontend-build: frontend/src/components/integrations/WebhookManager.jsx#L70
React Hook useEffect has a missing dependency: 'fetchWebhooks'. Either include it or remove the dependency array
frontend-build: frontend/src/components/integrations/IntegrationMarketplace.tsx#L232
React Hook useEffect has a missing dependency: 'fetchMarketplaceData'. Either include it or remove the dependency array
frontend-build: frontend/src/components/integrations/IntegrationManagementDashboard.tsx#L225
React Hook useEffect has a missing dependency: 'fetchManagementData'. Either include it or remove the dependency array
frontend-build: frontend/src/components/ai/PredictiveModeling.jsx#L402
The 'loadRecommendations' function makes the dependencies of useCallback Hook (at line 287) change on every render. Move it inside the useCallback callback. Alternatively, wrap the definition of 'loadRecommendations' in its own useCallback() Hook
frontend-build: frontend/src/components/ai/PredictiveModeling.jsx#L349
The 'loadPredictions' function makes the dependencies of useCallback Hook (at line 287) change on every render. Move it inside the useCallback callback. Alternatively, wrap the definition of 'loadPredictions' in its own useCallback() Hook        
frontend-build: frontend/src/components/ai/PredictiveModeling.jsx#L289
The 'loadModels' function makes the dependencies of useCallback Hook (at line 287) change on every render. Move it inside the useCallback callback. Alternatively, wrap the definition of 'loadModels' in its own useCallback() Hook                  