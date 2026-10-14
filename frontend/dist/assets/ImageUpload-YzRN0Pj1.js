import{c as m}from"./createLucideIcon-BNuzwfE4.js";import{q as V,d as z,c as o,n as b,i as h,j as k,y as C,a as i,r,l as L,o as n,m as F,g as q}from"./index-BxOh1Ngf.js";/**
 * @license lucide-vue-next v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=m("ArrowLeftIcon",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-vue-next v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=m("UploadIcon",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-vue-next v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=m("XIcon",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);async function B(c,u){const t=new FormData;t.append("file",c);const{data:l}=await V.post(`/upload/${u}`,t,{headers:{"Content-Type":"multipart/form-data"}});return l.url}const E={class:"image-upload"},N={key:0,class:"upload-text"},O={key:1,class:"upload-text"},R={key:1,class:"preview-container"},T=["src"],j=z({__name:"ImageUpload",props:{modelValue:{},userId:{}},emits:["update:modelValue","file-selected"],setup(c,{emit:u}){const t=c,l=u,s=r(!1),d=r(!1),f=r(null),p=r(null),v=L(()=>p.value||F(t.modelValue));function _(e){e.preventDefault(),s.value=!0}function I(){s.value=!1}async function w(e){var y;e.preventDefault(),s.value=!1;const a=(y=e.dataTransfer)==null?void 0:y.files;a&&a.length>0&&await g(a[0])}function x(e){const a=e.target;a.files&&a.files.length>0&&g(a.files[0])}async function g(e){if(!e.type.startsWith("image/")){alert("Selecione um arquivo de imagem válido.");return}if(!t.userId){p.value=URL.createObjectURL(e),l("file-selected",e);return}d.value=!0;try{const a=await B(e,t.userId);l("update:modelValue",a)}catch{alert("Erro ao fazer upload da imagem. Verifique se o MinIO está rodando.")}finally{d.value=!1}}function D(){p.value=null,l("update:modelValue",null)}function U(){var e;(e=f.value)==null||e.click()}return(e,a)=>(n(),o("div",E,[v.value?(n(),o("div",R,[i("img",{src:v.value,alt:"Preview",class:"preview-image"},null,8,T),i("button",{class:"remove-btn",onClick:D,"aria-label":"Remover imagem"},[h(k(M),{size:16})])])):(n(),o("div",{key:0,class:b(["upload-zone",{"upload-zone--dragging":s.value}]),onDragover:_,onDragleave:I,onDrop:w,onClick:U},[h(k(A),{size:32,color:"#9ca3af"}),d.value?(n(),o("p",O,"Enviando...")):(n(),o("p",N,[...a[0]||(a[0]=[C(" Arraste uma imagem ou ",-1),i("span",{class:"upload-link"},"clique para selecionar",-1)])]))],34)),i("input",{ref_key:"fileInput",ref:f,type:"file",accept:"image/*",class:"file-input-hidden",onChange:x},null,544)]))}}),X=q(j,[["__scopeId","data-v-31558264"]]);export{S as A,X as I,B as u};
