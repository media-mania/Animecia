/* Animecia: 全ページ共通の認証ナビゲーション */
(function(){
  "use strict";
  function ready(){
    if(!window.AnimeciaAuth)return setTimeout(ready,50);
    AnimeciaAuth.init().then(render).catch(function(){render(null);});
    window.addEventListener("animecia-auth",function(e){render(e.detail&&e.detail.user);});
  }
  function render(user){
    var loggedIn=!!(user&&!user.is_anonymous&&user.email_confirmed_at);
    var link=document.getElementById("auth-link");
    if(!link){
      var host=document.querySelector(".site-header .nav-actions")||document.querySelector("header .nav-actions");
      if(!host){
        var nav=document.querySelector(".site-header .container.nav")||document.querySelector("header nav")||document.querySelector(".wrap.head");
        if(nav){
          host=document.createElement("div");host.className="nav-actions animecia-auth-actions";
          nav.appendChild(host);
        }
      }
      if(host){
        link=document.createElement("a");link.id="auth-link";link.className="nav-btn primary animecia-auth-link";host.appendChild(link);
      }
    }
    if(!link)return;
    link.textContent=loggedIn?"ログアウト":"ログイン";
    link.href=loggedIn?"#":"login.html";
    link.setAttribute("aria-label",loggedIn?"ログアウト":"ログイン");
    link.onclick=loggedIn?async function(e){
      e.preventDefault();link.setAttribute("aria-busy","true");link.textContent="ログアウト中…";
      try{await AnimeciaAuth.signOut();location.replace("index.html");}
      catch(err){console.error(err);link.removeAttribute("aria-busy");render(AnimeciaAuth.state.user);}
    }:null;
    link.style.display="";
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
})();