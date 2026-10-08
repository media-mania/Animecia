/* Animecia: 新しいサイト訪問の開始時だけログアウト状態へ初期化 */
(function(){
  var KEY="animecia_visit_initialized_v1";
  function init(){
    try{
      if(sessionStorage.getItem(KEY)==="1") return;
      sessionStorage.setItem(KEY,"1");
      if(!window.supabase || !window.supabase.createClient) return;
      var client=window.__animeciaAuthClient;
      if(!client){
        client=window.supabase.createClient(
          "https://bhgdjuwlxvbaeraaivmh.supabase.co",
          "sb_publishable_-rZ4HusVezs5IlZQnUQ-Kw_SLUd8R0c"
        );
        window.__animeciaAuthClient=client;
      }
      client.auth.signOut({scope:"local"}).catch(function(e){
        console.error("Animeciaログイン状態の初期化に失敗しました",e);
      });
    }catch(e){
      console.error("Animecia認証初期化に失敗しました",e);
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();