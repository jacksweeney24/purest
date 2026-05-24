import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_y9g6AbdJ.mjs';
import { manifest } from './manifest_ChyhopO7.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/affiliate.astro.mjs');
const _page3 = () => import('./pages/api/apply.astro.mjs');
const _page4 = () => import('./pages/athlete-council.astro.mjs');
const _page5 = () => import('./pages/contact.astro.mjs');
const _page6 = () => import('./pages/faq.astro.mjs');
const _page7 = () => import('./pages/lajolla.astro.mjs');
const _page8 = () => import('./pages/news.astro.mjs');
const _page9 = () => import('./pages/products/_handle_.astro.mjs');
const _page10 = () => import('./pages/products.astro.mjs');
const _page11 = () => import('./pages/real-ingredients.astro.mjs');
const _page12 = () => import('./pages/returns.astro.mjs');
const _page13 = () => import('./pages/science/_handle_.astro.mjs');
const _page14 = () => import('./pages/science.astro.mjs');
const _page15 = () => import('./pages/thank-you.astro.mjs');
const _page16 = () => import('./pages/why-french-gray-sea-salt.astro.mjs');
const _page17 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/affiliate.astro", _page2],
    ["src/pages/api/apply.ts", _page3],
    ["src/pages/athlete-council.astro", _page4],
    ["src/pages/contact.astro", _page5],
    ["src/pages/faq.astro", _page6],
    ["src/pages/lajolla.astro", _page7],
    ["src/pages/news.astro", _page8],
    ["src/pages/products/[handle].astro", _page9],
    ["src/pages/products/index.astro", _page10],
    ["src/pages/real-ingredients.astro", _page11],
    ["src/pages/returns.astro", _page12],
    ["src/pages/science/[handle].astro", _page13],
    ["src/pages/science/index.astro", _page14],
    ["src/pages/thank-you.astro", _page15],
    ["src/pages/why-french-gray-sea-salt.astro", _page16],
    ["src/pages/index.astro", _page17]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "d25c71f9-8a2e-4831-8f79-c3198da47cf7",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
