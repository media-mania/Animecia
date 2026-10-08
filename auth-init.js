/* Animecia: 新しいサイト訪問ではログイン状態を持ち越さない */
(function(){
  "use strict";
  var KEY="animecia_visit_initialized_v3";
  try{
    if(sessionStorage.getItem(KEY)==="1") return;
    sessionStorage.setItem(KEY,"1");
    var prefixes=["sb-bhgdjuwlxvbaeraaivmh-"];
    for(var i=localStorage.length-1;i>=0;i--){
      var k=localStorage.key(i);
      if(k && prefixes.some(function(p){return k.indexOf(p)===0;})) localStorage.removeItem(k);
    }
  }catch(e){console.error("Animecia認証初期化に失敗しました",e);}
})();