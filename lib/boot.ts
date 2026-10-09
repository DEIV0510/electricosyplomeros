/**
 * Script en línea del <head>. Corre antes del primer pintado y fija clases en <html>:
 *
 *  js            → hay JavaScript (activa los revelados al hacer scroll).
 *  rm            → el usuario pidió movimiento reducido.
 *  lite          → ahorro de datos / red 2G / equipo muy limitado: sin bucles decorativos.
 *  is-booting    → se muestra la pantalla de carga (#boot). Bloquea el scroll. Además se
 *                  inyecta un <link rel="preload"> del logo de la carga (mismos srcset/sizes
 *                  que LoadingScreen): el <img> es lazy y no se descarga cuando no se muestra.
 *  boot-done     → la pantalla de carga empieza a salir (≈0,95 s después del PRIMER
 *                  FOTOGRAMA, no del arranque del script: así su secuencia de ~650 ms se ve
 *                  completa y "SISTEMA LISTO" queda en pantalla antes de salir). Tope de
 *                  1,7 s desde el script por si requestAnimationFrame no corre (pestaña oculta).
 *  boot-end      → la pantalla de carga ya salió (≈0,42 s después de boot-done).
 *  boot-skip     → no se muestra la pantalla de carga (visita repetida en la sesión,
 *                  movimiento reducido, modo lite, enlace con #ancla, otra ruta como la
 *                  404, o error).
 *  motion-paused → el visitante pausó las animaciones (botón del footer; se recuerda en
 *                  localStorage 'ep-motion' = 'paused').
 *  reveal-fallback → red de seguridad: si el JS principal no llega en 7 s, todo se muestra.
 *                  RevealController cancela este temporizador al montar.
 *
 * El reloj arranca en el primer requestAnimationFrame, pero la salida la disparan
 * setTimeout (y el tope de 1,7 s), así que nunca depende de que se pinte.
 */
export const BOOT_SCRIPT = `(function(){var d=document.documentElement,c=d.classList;c.add('js');
try{var n=navigator,k=n.connection||{},rm=matchMedia('(prefers-reduced-motion: reduce)').matches,
lite=!!(k.saveData||/(^|-)2g$/.test(k.effectiveType||'')||(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2));
if(lite)c.add('lite');if(rm)c.add('rm');
try{if(localStorage.getItem('ep-motion')==='paused')c.add('motion-paused')}catch(e){}
var seen=false;try{seen=!!sessionStorage.getItem('ep-boot')}catch(e){}
if(rm||lite||seen||location.hash||location.pathname.length>1){c.add('boot-skip')}else{
try{sessionStorage.setItem('ep-boot','1')}catch(e){}
c.add('is-booting');
try{var pl=document.createElement('link');pl.rel='preload';pl.as='image';pl.type='image/avif';
pl.setAttribute('imagesrcset','/brand/logo-320.avif 320w, /brand/logo-640.avif 640w, /brand/logo-960.avif 960w, /brand/logo-1440.avif 1440w');
pl.setAttribute('imagesizes','(min-width: 540px) 420px, 78vw');pl.setAttribute('fetchpriority','high');document.head.appendChild(pl)}catch(e){}
var t1=0,dcl=document.readyState!=='loading',done=false;
var fin=function(){if(done)return;done=true;c.add('boot-done');setTimeout(function(){c.remove('is-booting');c.add('boot-end')},420)};
var ready=function(){if(t1&&dcl)setTimeout(fin,Math.max(0,950-(Date.now()-t1)))};
requestAnimationFrame(function(){t1=Date.now();ready()});
if(!dcl)document.addEventListener('DOMContentLoaded',function(){dcl=true;ready()});
setTimeout(fin,1700)}}catch(e){c.remove('is-booting');c.add('boot-skip')}
window.__epRevealFallback=setTimeout(function(){c.add('reveal-fallback')},7000)})();`;
