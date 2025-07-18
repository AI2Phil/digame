

Error occurred prerendering page "/en/workflow/prioritization". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at u (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12245)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at u (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12245)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
    at bd (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)

Error occurred prerendering page "/es/workflow/prioritization". Read more: https://nextjs.org/docs/messages/prerender-error

TypeError: Cannot read properties of null (reading 'useCallback')
    at exports.useCallback (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:24:52)
    at s (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:9017)
    at u (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:12245)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
	/workflow/optimization: /es/workflow/optimization
	/workflow/prioritization
	/workflow/prioritization: /ar/workflow/prioritization
	/workflow/prioritization: /en/workflow/prioritization
	/workflow/prioritization: /es/workflow/prioritization
	/workflow: /ar/workflow
	/workflow: /en/workflow
	/workflow: /es/workflow
 ✓ Generating static pages (578/578)
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
Mem:           7.8Gi       860Mi       3.1Gi        49Mi       4.2Gi       6.9Gi
Swap:          3.0Gi          0B       3.0Gi
Available disk space:
Filesystem      Size  Used Avail Use% Mounted on
/dev/root        72G   50G   22G  70% /
Node version: v22.17.0
NPM version: 10.9.2
Build output size:
652M	.
Error: Process completed with exit code 1.



--

Annotations
1 error and 10 warnings
frontend-build
Process completed with exit code 1.
frontend-build: frontend/src/components/integrations/IntegrationTestingSuite.jsx#L213
React Hook useCallback has missing dependencies: 'integrationProviders' and 'loadTestResults'. Either include them or remove the dependency array
frontend-build: frontend/src/components/integrations/IntegrationTestingSuite.jsx#L147
React Hook useEffect has a missing dependency: 'loadTestResults'. Either include it or remove the dependency array
frontend-build: frontend/src/components/integrations/IntegrationMarketplace.tsx#L232
React Hook useEffect has a missing dependency: 'fetchMarketplaceData'. Either include it or remove the dependency array
frontend-build: frontend/src/components/integrations/IntegrationManagementDashboard.tsx#L225
React Hook useEffect has a missing dependency: 'fetchManagementData'. Either include it or remove the dependency array
frontend-build: frontend/src/components/ai/PredictiveModeling.jsx#L287
React Hook useCallback has a missing dependency: 'loadFallbackData'. Either include it or remove the dependency array
frontend-build: frontend/src/components/ai/PredictiveModeling.jsx#L119
The 'fallbackPredictiveModels' array makes the dependencies of useCallback Hook (at line 476) change on every render. To fix this, wrap the initialization of 'fallbackPredictiveModels' in its own useMemo() Hook
frontend-build: frontend/src/components/ai/NLPEnhancement.jsx#L330
The 'textAnalysisResults' array makes the dependencies of useCallback Hook (at line 383) change on every render. Move it inside the useCallback callback. Alternatively, wrap the initialization of 'textAnalysisResults' in its own useMemo() Hook
frontend-build: frontend/src/components/ai/NLPEnhancement.jsx#L304
The 'sentimentTrends' array makes the dependencies of useCallback Hook (at line 383) change on every render. Move it inside the useCallback callback. Alternatively, wrap the initialization of 'sentimentTrends' in its own useMemo() Hook        
frontend-build: frontend/src/components/ai/NLPEnhancement.jsx#L241
The 'nlpModels' array makes the dependencies of useCallback Hook (at line 383) change on every render. Move it inside the useCallback callback. Alternatively, wrap the initialization of 'nlpModels' in its own useMemo() Hook                    
frontend-build: frontend/src/components/ai/NLPEnhancement.jsx#L162
The 'conversationData' array makes the dependencies of useCallback Hook (at line 383) change on every render. Move it inside the useCallback callback. Alternatively, wrap the initialization of 'conversationData' in its own useMemo() Hook