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
  function reading(a){
    const raw=String(a?.title_kana||a?.title_romaji||a?.title_japanese||a?.title_native||a?.title||"").normalize("NFKC");
    const s=raw.replace(/\s|\u3000/g,"").replace(/^[^\p{Letter}\p{Number}\u3040-\u30ffー]+/u,"").replace(/[ァ-ヶ]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0x60)).toLowerCase();
    const m=s.match(/^(\d+)(.*)$/);
    if(!m)return s;
    const nums=["zero","ichi","ni","san","yon","go","roku","nana","hachi","kyuu"],n=Number(m[1]),rest=m[2];
    let r="",h=Math.floor(n/100),t=Math.floor(n%100/10),o=n%10;
    if(h)r+=(h===3?"sanbyaku":h===6?"roppyaku":h===8?"happyaku":nums[h]+"hyaku");
    if(t)r+=(t===1?"juu":nums[t]+"juu");
    if(o)r+=nums[o];
    return r+rest.replace(/^[.．\-–—ー]+/,"");
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
