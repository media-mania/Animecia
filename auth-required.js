/* Animecia: ログイン必須機能の共通UIガード */
(function(){
  var URL="https://bhgdjuwlxvbaeraaivmh.supabase.co";
  var KEY="sb_publishable_-rZ4HusVezs5IlZQnUQ-Kw_SLUd8R0c";
  var selectors={
    community:["#post-body","#post-image","#photo-button","#post-submit","#user-search","#user-search-btn"],
    memo:["#clear","#memo-search","#search-button"],
    detail:["#favorite-button","#memo-button","#review-title","#review-rating","#review-content","#review-spoiler","#review-submit-button","#review-cancel-edit","#watch-status","#watch-progress","#status-save","#user-rating","#rating-save","#follow-button","#notify-episode"]
  };
  function addStyle(){if(document.getElementById("animecia-auth-required-style"))return;var st=document.createElement("style");st.id="animecia-auth-required-style";st.textContent=".auth-required-disabled{opacity:.5!important;cursor:not-allowed!important}.auth-required-notice{margin:0 0 12px;padding:12px 14px;border:1px solid #f0c36d;border-radius:10px;background:#fff8e6;color:#5f4700;font-size:13px;line-height:1.6}.auth-required-notice a{font-weight:800;color:#b45309}";document.head.appendChild(st)}\n  function disable(el){
    if(!el)return;
    if("disabled" in el)el.disabled=true;
    el.setAttribute("aria-disabled","true");
    el.classList.add("auth-required-disabled");
  }
  function addNotice(parent,text){
    if(!parent||parent.querySelector(".auth-required-notice"))return;
    var n=document.createElement("div");
    n.className="auth-required-notice";
    n.innerHTML='<strong>ログインが必要です</strong><br><span>'+text+'</span> <a href="login.html?redirect='+encodeURIComponent(location.href)+'">ログインする</a>';
    parent.insertBefore(n,parent.firstChild);
  }
  function apply(){
    addStyle();\n    var path=location.pathname.split("/").pop()||"index.html";
    var key=path==="community.html"?"community":path==="memo.html"?"memo":path==="anime-detail.html"?"detail":null;
    if(!key)return;
    var s=window.supabase.createClient(URL,KEY);
    s.auth.getUser().then(function(r){
      var user=r.data&&r.data.user;
      if(user&&user.email_confirmed_at){window.__animeciaLoggedIn=true;return;}\n      window.__animeciaLoggedIn=false;
      (selectors[key]||[]).forEach(function(sel){document.querySelectorAll(sel).forEach(disable);});
      if(key==="community"){
        addNotice(document.querySelector(".composer"),"投稿・返信・いいね・リポスト・保存などの操作にはログインが必要です。");
      }else if(key==="memo"){
        addNotice(document.querySelector(".memo-panel"),"メモの保存・変更にはログインが必要です。");
      }else if(key==="detail"){
        ["#review-form","#status-form","#rating-area","#follow-area"].forEach(function(sel){
          var e=document.querySelector(sel);if(e)e.style.opacity=".55";
        });
        addNotice(document.querySelector(".action-area"),"お気に入り・評価・視聴状況・レビュー・フォローなどの機能にはログインが必要です。");
      }
    }).catch(function(){});
  }
  document.addEventListener("click",function(e){
    if(window.__animeciaLoggedIn!==false)return;
    var t=e.target.closest && e.target.closest('[data-act="like"],[data-act="repost"],[data-act="bookmark"],[data-act="reply"],[data-act="send-reply"],[data-act="delete"],[data-add],[data-remove]');
    if(t){e.preventDefault();e.stopImmediatePropagation();location.href="login.html?redirect="+encodeURIComponent(location.href);}
  },true);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
})();