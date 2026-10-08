/* Animecia: 認証状態は auth-core.js が sessionStorage にタブ単位で保持します。 */
(function(){
  "use strict";
  /* 旧版で localStorage に残った認証情報だけを一度だけ除去します。 */
  try{
    var KEY="animecia_legacy_auth_cleanup_v1";
    if(sessionStorage.getItem(KEY)==="1")return;
    sessionStorage.setItem(KEY,"1");
    var prefix="sb-bhgdjuwlxvbaeraaivmh-";
    for(var i=localStorage.length-1;i>=0;i--){
      var k=localStorage.key(i);
      if(k&&k.indexOf(prefix)===0)localStorage.removeItem(k);
    }
  }catch(e){console.error("Animecia認証初期化に失敗しました",e);}
})();