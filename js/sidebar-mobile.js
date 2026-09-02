/* ============================= MOBILE SIDEBAR TOGGLE ============================= */
import { dom } from './dom.js';

export function openSidebarMobile(){
  dom.sidebar.classList.add('open');
  dom.scrim.classList.add('show');
}

export function closeSidebarMobile(){
  dom.sidebar.classList.remove('open');
  dom.scrim.classList.remove('show');
}

export function initSidebarMobile(){
  dom.menuToggle.addEventListener('click', openSidebarMobile);
  dom.scrim.addEventListener('click', closeSidebarMobile);
}
