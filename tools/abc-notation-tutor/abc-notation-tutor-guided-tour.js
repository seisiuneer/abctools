(function(){
"use strict";
var overlay=null,card=null,arrowLayer=null,highlighted=null,layoutHandler=null,running=false;

function clearUI(){
  if(layoutHandler){window.removeEventListener("resize",layoutHandler);window.removeEventListener("scroll",layoutHandler,true);layoutHandler=null;}
  if(highlighted){highlighted.classList.remove("tour-highlight");highlighted=null;}
  if(overlay){overlay.remove();overlay=null;}
  if(card){card.remove();card=null;}
  if(arrowLayer){arrowLayer.remove();arrowLayer=null;}
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function targetFor(selector){try{return selector?document.querySelector(selector):null;}catch(e){return null;}}
function makeArrow(target){
  if(!target||!card)return;
  var ns="http://www.w3.org/2000/svg";
  arrowLayer=document.createElementNS(ns,"svg"); arrowLayer.classList.add("tour-arrow-layer");
  var defs=document.createElementNS(ns,"defs"),marker=document.createElementNS(ns,"marker");
  marker.setAttribute("id","tutor-arrow");marker.setAttribute("markerWidth","10");marker.setAttribute("markerHeight","10");marker.setAttribute("refX","8");marker.setAttribute("refY","3");marker.setAttribute("orient","auto");marker.setAttribute("markerUnits","strokeWidth");
  var p=document.createElementNS(ns,"path");p.setAttribute("d","M0,0 L0,6 L9,3 z");p.setAttribute("fill","#d32f2f");marker.appendChild(p);defs.appendChild(marker);arrowLayer.appendChild(defs);
  var path=document.createElementNS(ns,"path");path.classList.add("tour-arrow-path");path.setAttribute("marker-end","url(#tutor-arrow)");arrowLayer.appendChild(path);document.body.appendChild(arrowLayer);
  var cr=card.getBoundingClientRect(),tr=target.getBoundingClientRect();
  var sx=clamp(tr.left+tr.width/2,cr.left+18,cr.right-18), sy=tr.top>cr.bottom?cr.bottom:cr.top;
  var ex=clamp(tr.left+tr.width/2,8,window.innerWidth-8), ey=tr.top>cr.bottom?tr.top:tr.bottom;
  var bend=(sy+ey)/2;
  path.setAttribute("d","M "+sx+" "+sy+" C "+sx+" "+bend+", "+ex+" "+bend+", "+ex+" "+ey);
}
function position(target){
  if(!card)return;
  card.style.left="12px";card.style.top="12px";
  var cr=card.getBoundingClientRect(),vw=window.innerWidth,vh=window.innerHeight;
  var left=(vw-cr.width)/2,top=(vh-cr.height)/2;
  if(target){
    var r=target.getBoundingClientRect(),gap=18;
    var below=r.bottom+gap,above=r.top-cr.height-gap;
    top=(below+cr.height<=vh-12)?below:(above>=12?above:clamp((vh-cr.height)/2,12,vh-cr.height-12));
    left=clamp(r.left+r.width/2-cr.width/2,12,vw-cr.width-12);
  }
  card.style.left=Math.round(left)+"px";card.style.top=Math.round(top)+"px";
  if(arrowLayer)arrowLayer.remove();arrowLayer=null; makeArrow(target);
}
function show(step,index,total){
 return new Promise(function(resolve){
  clearUI();
  var target=targetFor(step[0]);
  if(target){
    try{target.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"});}catch(e){target.scrollIntoView();}
  }
  setTimeout(function(){
    target=targetFor(step[0]);
    overlay=document.createElement("div");overlay.className="tour-overlay";document.body.appendChild(overlay);
    if(target){target.classList.add("tour-highlight");highlighted=target;}
    card=document.createElement("div");card.className="tour-card";
    card.innerHTML="<h2>"+step[1]+"</h2><p>"+step[2]+"</p>"+
      '<div class="tour-footer"><div class="tour-count">'+(index+1)+" of "+total+'</div><div class="tour-buttons">'+
      '<button type="button" data-a="close">Close Tour</button>'+
      (index>0?'<button type="button" data-a="back">Previous</button>':"")+
      '<button type="button" data-a="next">'+(index===total-1?"Finish Lesson":"Next")+"</button></div></div>";
    document.body.appendChild(card);position(target);
    layoutHandler=function(){position(target);};window.addEventListener("resize",layoutHandler);window.addEventListener("scroll",layoutHandler,true);
    card.querySelector('[data-a="close"]').onclick=function(){resolve("close");};
    var back=card.querySelector('[data-a="back"]');if(back)back.onclick=function(){resolve("back");};
    card.querySelector('[data-a="next"]').onclick=function(){resolve(index===total-1?"done":"next");};
  },170);
 });
}
async function start(lessonIndex){
 if(running)return;
 var api=window.ABCNotationTutorAPI;if(!api)return;
 var idx=Number(lessonIndex);if(!Number.isFinite(idx))idx=api.getCurrentLessonIndex();
 if(idx!==api.getCurrentLessonIndex())api.selectLesson(idx);
 var lesson=api.lessons[idx],steps=lesson.tour||[];if(!steps.length)return;
 running=true;
 try{
  var i=0;
  while(i<steps.length){
   var action=await show(steps[i],i,steps.length);
   if(action==="next"){i++;continue;}
   if(action==="back"){i=Math.max(0,i-1);continue;}
   if(action==="done"){api.markCurrentCompleted(true);break;}
   break;
  }
 }finally{clearUI();running=false;}
}
window.ABCNotationTutorTour={start:start,close:clearUI};
})();