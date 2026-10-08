/**
 * Script en línea del <head>. Corre antes del primer pintado y fija clases en <html>:
 *
 *  js            → hay JavaScript (activa los revelados al hacer scroll).
 *  rm            → el usuario pidió movimiento reducido.
 *  lite          → ahorro de datos / red 2G / equipo muy limitado: sin bucles decorativos.
 *  is-booting    → se muestra la pantalla de carga (#boot). Bloquea el scroll.
 *  boot-done     → la pantalla de carga empieza a salir (≈0,95 s después del arranque).
 *  boot-end      → la pantalla de carga ya salió (≈0,42 s después de boot-done).
 *  boot-skip     → no se muestra la pantalla de carga (visita repetida en la sesión,
 *                  movimiento reducido, modo lite, enlace con #ancla o error).
 *  reveal-fallback → red de seguridad: si el JS principal no llega en 7 s, todo se muestra.
 *                  RevealController cancela este temporizador al montar.
 *
 * Usa setTimeout (no requestAnimationFrame) para que la salida no dependa del pintado.
 */
export const BOOT_SCRIPT = `(function(){var d=document.documentElement,c=d.classList;c.add('js');
try{var n=navigator,k=n.connection||{},rm=matchMedia('(prefers-reduced-motion: reduce)').matches,
lite=!!(k.saveData||/(^|-)2g$/.test(k.effectiveType||'')||(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2));
if(lite)c.add('lite');if(rm)c.add('rm');
var seen=false;try{seen=!!sessionStorage.getItem('ep-boot')}catch(e){}
if(rm||lite||seen||location.hash){c.add('boot-skip')}else{
try{sessionStorage.setItem('ep-boot','1')}catch(e){}
c.add('is-booting');var t0=Date.now(),done=false;
var fin=function(){if(done)return;done=true;c.add('boot-done');setTimeout(function(){c.remove('is-booting');c.add('boot-end')},420)};
var ready=function(){setTimeout(fin,Math.max(0,950-(Date.now()-t0)))};
if(document.readyState!=='loading')ready();else document.addEventListener('DOMContentLoaded',ready);
setTimeout(fin,1700)}}catch(e){c.remove('is-booting');c.add('boot-skip')}
window.__epRevealFallback=setTimeout(function(){c.add('reveal-fallback')},7000)})();`;
