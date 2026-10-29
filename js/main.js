(function(){
  var d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // nav
  var pill=$('.pill'),bb=$('.burger');
  if(bb){bb.addEventListener('click',function(){var o=pill.classList.toggle('open');bb.setAttribute('aria-expanded',o)});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'){pill.classList.remove('open');bb.setAttribute('aria-expanded','false')}});}
  // spotlight
  $$('.card,.feat').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')})});
  // reveal (resting state visible, hidden only for items below the fold)
  var io=null;
  if('IntersectionObserver' in window&&!reduce){
    io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.remove('pre');io.unobserve(x.target)}})},{threshold:.08});
  }
  window.EDArm=function(root){if(!io)return;$$('.rv',root||d).forEach(function(e){e.classList.remove('pre');if(e.offsetParent!==null&&e.getBoundingClientRect().top>innerHeight*.92)e.classList.add('pre');io.observe(e)})};
  window.EDArm();
  // lightbox
  var lb=$('#lb');
  if(lb){
    var li=$('img',lb),lc=$('p',lb);
    var open=function(src,alt,cap){li.src=src;li.alt=alt||'';lc.textContent=cap||'';lb.showModal()};
    $$('.mos figure').forEach(function(f){f.tabIndex=0;f.setAttribute('role','button');
      var go=function(){var im=$('img',f),c=$('figcaption',f);open(im.src,im.alt,c?c.textContent:'')};
      f.addEventListener('click',go);f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
    var vs=$('.vstage');if(vs)vs.addEventListener('click',function(e){if(e.target.closest('.vnav'))return;if(vs.dataset.sw){vs.dataset.sw='';return}var im=$('img.on',vs);if(im)open(im.src,im.alt,$('.vcap span',vs.parentNode).textContent)});
    lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});
    $('button',lb).addEventListener('click',function(){lb.close()});
  }
  // sheet viewer
  var vw=$('.viewer');
  if(vw){
    var tabs=$$('.vtabs button',vw),imgs=$$('.vstage img',vw),cap=$('.vcap span',vw),cnt=$('.vcount',vw),tl=$('.vtabs',vw),cur=0,timer=null;
    var go=function(i,user){
      cur=(i+tabs.length)%tabs.length;
      tabs.forEach(function(x,j){x.setAttribute('aria-selected',j===cur)});
      imgs.forEach(function(m,j){m.classList.toggle('on',j===cur)});
      cap.textContent=tabs[cur].dataset.cap;cnt.textContent=(cur+1)+' / '+tabs.length;
      var t=tabs[cur];tl.scrollTo({left:t.offsetLeft-tl.clientWidth/2+t.offsetWidth/2,behavior:reduce?'auto':'smooth'});
      if(user&&timer){clearInterval(timer);timer=null}
    };
    tabs.forEach(function(b,i){b.addEventListener('click',function(){go(i,true)})});
    $('.vnav.prev',vw).addEventListener('click',function(e){e.stopPropagation();go(cur-1,true)});
    $('.vnav.next',vw).addEventListener('click',function(e){e.stopPropagation();go(cur+1,true)});
    vw.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){go(cur+1,true)}else if(e.key==='ArrowLeft'){go(cur-1,true)}});
    var sx=null,vs=$('.vstage',vw);
    vs.addEventListener('pointerdown',function(e){sx=e.clientX});
    vs.addEventListener('pointerup',function(e){if(sx!==null&&Math.abs(e.clientX-sx)>40){go(cur+(e.clientX<sx?1:-1),true);vs.dataset.sw='1'}sx=null});
    if(!reduce){timer=setInterval(function(){if(!d.hidden&&vw.offsetParent!==null)go(cur+1,false)},6000)}
  }
  // calculators: each form works on its own, no layout-dependent text
  var NAMES={499:'Базовый',899:'Подробный',1999:'Индивидуальный'};
  var fmt=function(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')};
  $$('.calc-wrap').forEach(function(form){
    var ar=$('.ar',form),av=$('.av',form),tot=$('.tot',form),ln=$('.ln',form).children,radios=$$('input[type=radio]',form);
    var st=function(){var p=+radios.filter(function(r){return r.checked})[0].value,a=+ar.value;return {a:a,p:p,t:NAMES[p],s:a*p}};
    var upd=function(){var s=st();av.textContent=s.a;tot.textContent='от\u00a0'+fmt(s.s)+'\u00a0₽';
      ln[0].textContent=s.t+': '+fmt(s.p)+'\u00a0₽/м²';ln[1].textContent='Площадь: '+s.a+'\u00a0м²';ln[2].textContent='Срок: от двух недель';};
    ar.addEventListener('input',upd);radios.forEach(function(r){r.addEventListener('change',upd)});
    form.getState=st;form.setTariff=function(i){radios[i].checked=true;upd()};
    upd();
  });
  var presetIdx={base:0,detail:1,indiv:2};
  window.EDSetTariff=function(i){var f=$('.calc-wrap:not([hidden]):not(.view[hidden] *)');var all=$$('.calc-wrap').filter(function(x){return x.offsetParent!==null||!x.closest('.view')});if(all.length)all[all.length-1].setTariff(i)};
  var h0=location.hash.replace('#','');if(h0 in presetIdx){var f0=$$('.calc-wrap');if(f0.length)f0[f0.length-1].setTariff(presetIdx[h0])}
  // lead form (no backend: mail or Telegram)
  var lf=$('#lead');
  if(lf){
    var toast=$('#toast'),cw=$('.calc-wrap',lf.closest('.view')||d);
    var text=function(){var g=function(n){var e=lf.elements[n];return e?e.value.trim():''},c=cw?cw.getState():null;
      return ['Заявка с сайта Elevate Design','Имя: '+g('name'),'Контакт: '+g('contact'),'Площадь: '+(c?c.a:'?')+' м²','Комплект: '+(c?c.t:'не выбран'),'Комментарий: '+g('msg')].join('\n')};
    var ok=function(){if(lf.checkValidity())return true;lf.reportValidity();return false};
    $('#send-mail').addEventListener('click',function(){if(!ok())return;location.href='mailto:arsenybartenev@yandex.ru?subject='+encodeURIComponent('Заявка на проект')+'&body='+encodeURIComponent(text())});
    $('#send-tg').addEventListener('click',function(){if(!ok())return;
      var go=function(){window.open('https://t.me/elevatedesign?direct','_blank','noopener')};
      if(navigator.clipboard){navigator.clipboard.writeText(text()).then(function(){toast.textContent='Текст заявки скопирован. Вставьте его в чат Telegram.';toast.classList.add('show');go()},function(){toast.textContent='Не удалось скопировать. Напишите в Telegram вручную.';toast.classList.add('show');go()})}else go()});
  }
})();
