# Live PropNexus deployment findings

Inspection of https://propnexus-delta.vercel.app/ on 2026-08-17 found that the React homepage renders and exposes the expected navigation, search controls, catalogue links, and Contact Agent entry points. The visible page is not the raw server bundle.

The screenshot shows the hero background and logo imagery are missing or not resolving in the live deployment, while the text/layout loads. The extracted HTML references `/manus-storage/propnexus-logo-clean_2e81583e.png` and `/manus-storage/hillside-house_152b67cb.png`. Browser console inspection returned no console errors. This suggests an asset-hosting/path issue rather than a JavaScript runtime exception. Further checks should verify asset HTTP status and whether the Vercel deployment is serving the expected latest commit.

## Latest live verification

The live homepage now references the corrected uploaded paths `/manus-storage/propnexus-logo_660454fb.webp` and `/manus-storage/hillside-house_12efa2e1.png`, confirming the latest frontend commit is deployed. However, the direct logo URL still returns Vercel `404: NOT_FOUND`, and the screenshot still shows missing logo/hero imagery. The storage rewrite or API route is therefore not active in the current Vercel deployment and requires another routing fix or redeployment verification.
