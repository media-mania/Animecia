/* Animecia 共通認証ナビゲーション */
(function(){
  var URL="https://bhgdjuwlxvbaeraaivmh.supabase.co";
  var KEY="sb_publishable_-rZ4HusVezs5IlZQnUQ-Kw_SLUd8R0c";
  function setup(){
    var links=document.querySelectorAll("#auth-link, #footer-login-link");
    if(!links.length || !window.supabase || !window.supabase.createClient) return;
    var client=window.__animeciaAuthClient||(window.__animeciaAuthClient=window.supabase.createClient(URL,KEY));
    client.auth.getUser().then(function(res){
      var loggedIn=!!(res.data&&res.data.user&&!res.data.user.is_anonymous);
      links.forEach(function(link){
        link.textContent=loggedIn?"ログアウト":"ログイン";
        link.href=loggedIn?"#":"login.html";
        link.onclick=loggedIn?function(e){
          e.preventDefault();
          client.auth.signOut({scope:"local"}).then(function(){location.reload();});
        }:null;
        link.style.display="";
      });
    }).catch(function(){
      links.forEach(function(link){
        link.textContent="ログイン";
        link.href="login.html";
        link.onclick=null;
        link.style.display="";
      });
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",setup,{once:true});
  else setup();
})();