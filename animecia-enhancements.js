(function(){
"use strict";
const BASE="./";
const SUPABASE_URL="https://bhgdjuwlxvbaeraaivmh.supabase.co";
const SUPABASE_KEY="sb_publishable_-rZ4HusVezs5IlZQnUQ-Kw_SLUd8R0c";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function theme(){
  const saved=localStorage.getItem("animecia-theme")||"system";
  document.documentElement.dataset.theme=saved;
  const b=document.getElementById("theme-toggle");
  if(b)b.textContent=saved==="dark"?"ライト":saved==="light"?"ダーク":"テーマ";
}
function addTheme(){
  if(document.getElementById("theme-toggle"))return;
  const host=document.querySelector(".nav-actions")||document.querySelector(".header-actions");
  if(!host)return;
  const b=document.createElement("button");b.id="theme-toggle";b.type="button";b.className="ac-theme-toggle";b.setAttribute("aria-label","テーマ切替");
  host.insertBefore(b,host.firstChild);
  b.onclick=()=>{const cur=document.documentElement.dataset.theme||"system";const next=cur==="dark"?"light":cur==="light"?"system":"dark";localStorage.setItem("animecia-theme",next);theme()};
  theme();
}
function hideAdmin(){
  document.querySelectorAll('a[href$="admin.html"],a[href*="/admin.html"],a[href$="admin-dashboard.html"],a[href*="/admin-dashboard.html"],a[href$="admin-candidates.html"],a[href*="/admin-candidates.html"]').forEach(a=>{if(a.closest("footer"))return;a.classList.add("ac-admin-link");});
}
function autocomplete(){
  const input=document.querySelector('.hero-search input[name="search"],.header-search input[name="search"]');
  if(!input||input.dataset.acAutocomplete)return;
  input.dataset.acAutocomplete="1";
  const wrap=input.closest("form")||input.parentElement; if(!wrap)return;
  wrap.classList.add("ac-search-wrap");
  const box=document.createElement("div");box.className="ac-suggestions";box.hidden=true;wrap.appendChild(box);
  let timer=0,seq=0;
  async function run(){
    const q=input.value.trim();const n=++seq;if(q.length<1){box.hidden=true;box.innerHTML="";return}
    try{
      const c=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);if(!c)return;
      const {data,error}=await c.rpc("search_anime_catalog",{p_query:q,p_genre_id:null,p_studio_id:null,p_year:null,p_season:null,p_status:null,p_format:null,p_sort:"default",p_limit:6,p_offset:0});
      if(n!==seq)return;
      if(error||!data?.length){box.innerHTML='<div class="ac-suggestion-empty">候補が見つかりません</div>';box.hidden=false;return}
      box.innerHTML=data.slice(0,6).map(a=>'<a class="ac-suggestion" href="anime-detail.html?id='+encodeURIComponent(a.id)+'"><span class="ac-suggestion-title">'+esc(a.title_japanese||a.title_native||a.title_user_preferred||a.title||"タイトル未設定")+'</span><span class="ac-suggestion-meta">'+esc(a.start_date||"")+'</span></a>').join("");
      box.hidden=false;
    }catch(e){box.hidden=true}
  }
  input.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(run,180)});
  input.addEventListener("focus",()=>{if(input.value.trim())run()});
  document.addEventListener("click",e=>{if(!wrap.contains(e.target))box.hidden=true});
}
function retryStates(){
  document.querySelectorAll(".error,.loading,.empty").forEach(el=>{
    const t=(el.textContent||"").trim();
    if(!t||el.dataset.acEnhanced)return;
    if(/読み込めませんでした|エラー|失敗|通信/i.test(t)&&!el.querySelector("button")){
      el.dataset.acEnhanced="1";
      const b=document.createElement("button");b.type="button";b.className="ac-retry";b.textContent="再読み込み";
      b.onclick=()=>location.reload();el.appendChild(b);
    }
  });
}
function pwa(){
  if("serviceWorker" in navigator)navigator.serviceWorker.register(BASE+"service-worker.js").catch(()=>{});
}
function init(){addTheme();hideAdmin();autocomplete();retryStates();pwa()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.addEventListener("load",retryStates);
})();