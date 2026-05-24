import{r as a}from"./index._frMCB_H.js";function g(e,t,r){let o=new Set(t).add(void 0);return e.listen((n,s,i)=>{o.has(i)&&r(n,s,i)})}let d=(e,t)=>r=>{e.current!==r&&(e.current=r,t())};function R(e,{keys:t,deps:r=[e,t],ssr:o}={}){let n=a.useRef();n.current=e.get();let s=a.useCallback(l=>(d(n,l)(e.value),t?.length>0?g(e,t,d(n,l)):e.listen(d(n,l))),r),i=()=>n.current,c=i;return o&&"init"in e&&(c=o==="initial"?()=>e.init:o),a.useSyncExternalStore(s,i,c)}/**
 * @license lucide-react v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=(...e)=>e.filter((t,r,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===r).join(" ").trim();/**
 * @license lucide-react v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,o)=>o?o.toUpperCase():r.toLowerCase());/**
 * @license lucide-react v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=e=>{const t=L(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var f={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1},v=a.createContext({}),y=()=>a.useContext(v),E=a.forwardRef(({color:e,size:t,strokeWidth:r,absoluteStrokeWidth:o,className:n="",children:s,iconNode:i,...c},l)=>{const{size:u=24,strokeWidth:C=2,absoluteStrokeWidth:p=!1,color:x="currentColor",className:w=""}=y()??{},b=o??p?Number(r??C)*24/Number(t??u):r??C;return a.createElement("svg",{ref:l,...f,width:t??u??f.width,height:t??u??f.height,stroke:e??x,strokeWidth:b,className:m("lucide",w,n),...!s&&!W(c)&&{"aria-hidden":"true"},...c},[...i.map(([k,S])=>a.createElement(k,S)),...Array.isArray(s)?s:[s]])});/**
 * @license lucide-react v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=(e,t)=>{const r=a.forwardRef(({className:o,...n},s)=>a.createElement(E,{ref:s,iconNode:t,className:m(`lucide-${A(h(e))}`,`lucide-${e}`,o),...n}));return r.displayName=h(e),r};export{j as c,R as u};
