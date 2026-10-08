/* Animecia: 新しいサイト訪問の開始時だけログアウト状態へ初期化 */
(function(){
  var KEY="animecia_visit_initialized_v2";
  function init(){
    try{
      if(sessionStorage.getItem(KEY)==="1") return;
      sessionStorage.setItem(KEY,"1");
      var prefix="sb-bhgdjuwlxvbaeraaivmh-";
      for(var i=localStorage.length-1;i>=0;i--){
        var k=localStorage.key(i);
        if(k && (k.indexOf(prefix)===0 || k==="supabase.auth.token")) localStorage.removeItem(k);
      }
    }catch(e){
      console.error("Animecia認証初期化に失敗しました",e);
    }
  }
  init();
})();