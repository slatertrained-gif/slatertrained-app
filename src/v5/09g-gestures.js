
/* =====================================================================
   09g (v5.7): gestures.
   - Swipe a pop-up (sheet) down to close it, like iOS. Works from the
     handle or header any time, and from anywhere once the pop-up is
     scrolled to the top. The X still works.
   - Swipe right from the left edge of a sub-screen to go back (same as
     the back arrow).
   Phones only (the desktop pop-up is a centred box).
   ===================================================================== */
{
  const NO_DRAG = 'input,textarea,select,video,iframe,[contenteditable=true],.scanbox,.board,.dbtwrap,.kbars';
  let D = null;
  const sheetEl = () => document.querySelector('#sheet .sheet'), scrimEl = () => document.querySelector('#sheet .scrim');
  const mobile = () => window.innerWidth < 700;
  document.addEventListener('touchstart', e => {
    if (!mobile() || e.touches.length !== 1) { D = null; return; }
    const t = e.touches[0], sh = sheetEl();
    if (sh && sh.contains(e.target)) {
      if (e.target.closest(NO_DRAG)) { D = null; return; }
      const head = e.target.closest('.grab') || (sh.firstElementChild && sh.children[1] && sh.children[1].contains(e.target));
      D = { k: 'sheet', y0: t.clientY, x0: t.clientX, t0: Date.now(), head: !!head, top: sh.scrollTop <= 0, dy: 0, on: false };
      return;
    }
    if (!sh && t.clientX < 28 && document.querySelector('#app [data-act=back]')) { D = { k: 'back', x0: t.clientX, y0: t.clientY, t0: Date.now(), dx: 0, on: false }; return; }
    D = null;
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (!D) return; const t = e.touches[0];
    if (D.k === 'sheet') {
      const sh = sheetEl(); if (!sh) { D = null; return; }
      const dy = t.clientY - D.y0, dx = t.clientX - D.x0;
      if (!D.on) { if (Math.abs(dx) > Math.abs(dy) || dy < 6) { if (dy < -6 || Math.abs(dx) > 12) D = null; return; } if (!D.head && !(D.top && sh.scrollTop <= 0)) { D = null; return; } D.on = true; sh.style.transition = 'none'; sh.style.animation = 'none'; }
      D.dy = Math.max(0, dy); sh.style.transform = `translateY(${D.dy}px)`; const s = scrimEl(); if (s) s.style.opacity = String(0.78 * Math.max(0.15, 1 - D.dy / 500));
      if (e.cancelable) e.preventDefault();
    } else if (D.k === 'back') {
      const dx = t.clientX - D.x0, dy = t.clientY - D.y0;
      if (!D.on) { if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { D = null; return; } if (dx < 8) return; D.on = true; }
      D.dx = Math.max(0, dx); const app = document.querySelector('#app .content') || document.querySelector('#app'); if (app) { app.style.transition = 'none'; app.style.transform = `translateX(${D.dx * 0.6}px)`; app.style.opacity = String(1 - Math.min(0.4, D.dx / 600)); }
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });
  const end = () => {
    if (!D || !D.on) { D = null; return; }
    const ms = Math.max(1, Date.now() - D.t0);
    if (D.k === 'sheet') {
      const sh = sheetEl(), s = scrimEl(), go = D.dy > 110 || (D.dy > 45 && D.dy / ms > 0.55);
      if (sh) { sh.style.transition = 'transform .2s ease-out'; sh.style.transform = go ? 'translateY(110%)' : ''; }
      if (s) { s.style.transition = 'opacity .2s'; s.style.opacity = go ? '0' : ''; }
      if (go) setTimeout(() => closeSheet(), 190); else setTimeout(() => { if (sh) sh.style.transition = ''; }, 220);
    } else {
      const app = document.querySelector('#app .content') || document.querySelector('#app'), go = D.dx > 90 || (D.dx > 40 && D.dx / ms > 0.5);
      if (app) { app.style.transition = 'transform .18s ease-out, opacity .18s'; app.style.transform = go ? 'translateX(40%)' : ''; app.style.opacity = go ? '0' : ''; }
      setTimeout(() => { if (app) { app.style.transition = ''; app.style.transform = ''; app.style.opacity = ''; } if (go) ACTS.back(); }, go ? 170 : 200);
    }
    D = null;
  };
  document.addEventListener('touchend', end); document.addEventListener('touchcancel', end);
  // Escape closes a pop-up on a keyboard.
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetEl() && !e.target.closest?.('[data-bt]')) closeSheet(); });
}
