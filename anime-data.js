/* Animecia canonical anime data contract — 2026-10-08 */
(function(global){
  "use strict";
  const seasonNames={WINTER:"冬",SPRING:"春",SUMMER:"夏",FALL:"秋"};
  const formatNames={TV:"TV",TV_SHORT:"TVショート",MOVIE:"劇場版",OVA:"OVA",ONA:"ONA",SPECIAL:"特別編",MUSIC:"Music"};
  const statusNames={FINISHED:"放送終了",RELEASING:"放送中",NOT_YET_RELEASED:"放送前",CANCELLED:"中止",HIATUS:"休止中"};
  function title(a){
    return a?.title_japanese||a?.title_native||a?._japanese_aliases?.[0]||
      (/[ぁ-んァ-ン一-龯々ー]/.test(String(a?.title||""))?a.title:"")||
      a?.title_user_preferred||a?.title_romaji||a?.title_english||a?.english_title||a?.title||"タイトル未設定";
  }
  function subtitle(a){
    const main=title(a);
    return [a?.title_english,a?.english_title,a?.title_romaji,a?.title_user_preferred,a?.title_native,a?.title_japanese,a?.title]
      .find(v=>v&&v!==main)||"";
  }
  function year(a){
    if(a?.season_year!==null&&a?.season_year!==undefined&&a?.season_year!=="") return String(a.season_year);
    const y=String(a?.start_date||"").slice(0,4);
    return /^\d{4}$/.test(y)?y:"";
  }
  function season(a){ return seasonNames[a?.season]||a?.season||"—"; }
  function seasonCode(a){ return a?.season||""; }
  function format(a){ return formatNames[a?.format]||a?.format||"—"; }
  function status(a){ return statusNames[a?.status]||a?.status||"—"; }
  function image(a){ return a?.cover_image||""; }
  function score(a){
    const v=a?._animecia_rating??a?.average_rating??a?.average_score;
    if(v===null||v===undefined||v==="") return null;
    const n=Number(v);
    return Number.isFinite(n)?(a?.average_rating!=null||a?._animecia_rating!=null?n:n/10):null;
  }
  // 五十音順の共通キー。
  // 1) title_kana があればその読みを優先
  // 2) なければ AniList 等の title_romaji を使用
  // 3) 数字・記号・英字も正規化して同じ比較方式にする
  function reading(a){
    const source=String(a?.title_kana||a?.title_romaji||a?.title_english||a?.english_title||a?.title_native||a?.title||"").normalize("NFKC");
    const kanaToRoma={
      "きゃ":"kya","きゅ":"kyu","きょ":"kyo","ぎゃ":"gya","ぎゅ":"gyu","ぎょ":"gyo",
      "しゃ":"sha","しゅ":"shu","しょ":"sho","じゃ":"ja","じゅ":"ju","じょ":"jo",
      "ちゃ":"cha","ちゅ":"chu","ちょ":"cho","ぢゃ":"ja","ぢゅ":"ju","ぢょ":"jo",
      "にゃ":"nya","にゅ":"nyu","にょ":"nyo","ひゃ":"hya","ひゅ":"hyu","ひょ":"hyo",
      "びゃ":"bya","びゅ":"byu","びょ":"byo","ぴゃ":"pya","ぴゅ":"pyu","ぴょ":"pyo",
      "みゃ":"mya","みゅ":"myu","みょ":"myo","りゃ":"rya","りゅ":"ryu","りょ":"ryo",
      "ふぁ":"fa","ふぃ":"fi","ふぇ":"fe","ふぉ":"fo","うぃ":"wi","うぇ":"we","うぉ":"wo",
      "しぇ":"she","じぇ":"je","ちぇ":"che","つぁ":"tsa","つぃ":"tsi","つぇ":"tse","つぉ":"tso",
      "てぃ":"ti","でぃ":"di","でゅ":"dyu","とぅ":"tu","どぅ":"du",
      "あ":"a","い":"i","う":"u","え":"e","お":"o","か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
      "が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go","さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
      "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo","た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
      "だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do","な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
      "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho","ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo",
      "ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po","ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
      "や":"ya","ゆ":"yu","よ":"yo","ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro","わ":"wa","を":"wo","ん":"n"
    };
    let s=source.toLowerCase().replace(/[ァ-ヶ]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0x60));
    let out="";
    for(let i=0;i<s.length;i++){
      const ch=s[i];
      if(ch==="っ"){
        const next=s.slice(i+1).match(/^(きゃ|きゅ|きょ|ぎゃ|ぎゅ|ぎょ|しゃ|しゅ|しょ|じゃ|じゅ|じょ|ちゃ|ちゅ|ちょ|にゃ|にゅ|にょ|ひゃ|ひゅ|ひょ|びゃ|びゅ|びょ|ぴゃ|ぴゅ|ぴょ|みゃ|みゅ|みょ|りゃ|りゅ|りょ|ふぁ|ふぃ|ふぇ|ふぉ|うぃ|うぇ|うぉ|しぇ|じぇ|ちぇ|つぁ|つぃ|つぇ|つぉ|てぃ|でぃ|でゅ|とぅ|どぅ|[あ-ん])/);
        if(next){ const r=kanaToRoma[next[0]]||""; if(r) out+=r[0]; }
        continue;
      }
      const pair=s.slice(i,i+2);
      if(kanaToRoma[pair]){out+=kanaToRoma[pair];i++;continue;}
      if(kanaToRoma[ch]){out+=kanaToRoma[ch];continue;}
      if(/\\d/.test(ch)){
        let j=i;while(j<s.length&&/\\d/.test(s[j]))j++;
        const n=Number(s.slice(i,j));
        out+=numberToRomaji(n);i=j-1;continue;
      }
      if(/[a-z]/.test(ch)){out+=ch;continue;}
      // 記号・空白・長音などは読みキーから除外
    }
    return out;
  }
  function numberToRomaji(n){
    if(!Number.isFinite(n))return "";
    if(n===0)return "zero";
    const ones=["","ichi","ni","san","yon","go","roku","nana","hachi","kyuu"];
    const under10000=(v)=>{
      let r="",th=Math.floor(v/1000),h=Math.floor(v%1000/100),t=Math.floor(v%100/10),o=v%10;
      if(th)r+=(th===3?"sanzen":th===8?"hassen":ones[th]+"sen");
      if(h)r+=(h===3?"sanbyaku":h===6?"roppyaku":h===8?"happyaku":ones[h]+"hyaku");
      if(t)r+=(t===1?"juu":ones[t]+"juu");
      if(o)r+=ones[o];
      return r;
    };
    if(n<10000)return under10000(n);
    if(n<100000000)return under10000(Math.floor(n/10000))+"man"+under10000(n%10000);
    return String(n);
  }
  function compare(a,b){
    const order=["a","i","u","e","o","ka","ki","ku","ke","ko","ga","gi","gu","ge","go","sa","shi","su","se","so","za","ji","zu","ze","zo","ta","chi","tsu","te","to","da","di","du","de","do","na","ni","nu","ne","no","ha","hi","fu","he","ho","ba","bi","bu","be","bo","pa","pi","pu","pe","po","ma","mi","mu","me","mo","ya","yu","yo","ra","ri","ru","re","ro","wa","wo","n"];
    const token=s=>order.find(x=>s.startsWith(x))||s.slice(0,1);
    let x=reading(a),y=reading(b);
    while(x&&y){
      const ax=token(x),by=token(y),ai=order.indexOf(ax),bi=order.indexOf(by);
      if(ai!==bi)return(ai<0?999:ai)-(bi<0?999:bi);
      if(ax!==by)return ax.localeCompare(by,"en");
      x=x.slice(ax.length);y=y.slice(by.length);
    }
    return x?1:y?-1:Number(a?.id||0)-Number(b?.id||0);
  }
  function genres(a){
    const out=[];
    (Array.isArray(a?.anime_genres)?a.anime_genres:[]).forEach(r=>{
      const g=r?.genres;if(g?.name&&!out.some(x=>String(x.name)===String(g.name)))out.push({id:g.id??null,name:g.name});
    });
    if(a?.genre)String(a.genre).split(/[,、/]/).map(x=>x.trim()).filter(Boolean).forEach(name=>{
      if(!out.some(x=>x.name===name))out.push({id:null,name});
    });
    return out;
  }
  async function withEngagement(client,rows){
    const ids=[...new Set((rows||[]).map(a=>Number(a?.id)).filter(Number.isInteger))];
    const map=new Map();
    for(let i=0;i<ids.length;i+=500){
      const {data,error}=await client.from("anime_engagement_summary")
        .select("anime_id,average_rating,rating_count,favorite_count,review_count")
        .in("anime_id",ids.slice(i,i+500));
      if(error) throw error;
      (data||[]).forEach(x=>map.set(String(x.anime_id),x));
    }
    return (rows||[]).map(a=>({...a,_animecia_rating:map.get(String(a.id))?.average_rating??null,_animecia_engagement:map.get(String(a.id))||null}));
  }
  function isPublic(a){
    return !!a && a.anime_verification_status==="verified" && a.is_japanese!==false &&
      a.is_adult!==true && a.is_kids!==true && a.is_sensitive_visual!==true;
  }
  global.AnimeciaData={title,subtitle,year,season,seasonCode,format,status,image,score,reading,compare,genres,withEngagement,isPublic,seasonNames,formatNames,statusNames};
})(window);
