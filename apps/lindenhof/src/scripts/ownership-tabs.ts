import { gsap } from 'gsap';
import { motion, prefersReducedMotion } from './motion';
import { onPageReady } from '../../../../packages/ui/page-lifecycle';

export function initOwnershipTabs() {
  onPageReady(() => {
    const events = new AbortController();
    const options = { signal: events.signal };
    const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role=tab]')];
    const tablist=document.querySelector<HTMLElement>('[role=tablist]')!;
    const indicator = document.createElement('span');
    indicator.className = 'tab-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    tablist.append(indicator);
    function moveIndicator(animate = false) {
      const active = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
      if (!active) return;
      gsap.to(indicator, {
        x: active.offsetLeft, width: active.offsetWidth,
        duration: animate && !prefersReducedMotion() ? motion.tabDuration : 0,
        ease: motion.ease, overwrite: true,
      });
    }
    function activateTab(button: HTMLButtonElement) {
      if (button.getAttribute('aria-selected') === 'true') return;
      tabs.forEach(tab => {
        const active = tab === button;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(tab.getAttribute('aria-controls')!)!;
        gsap.killTweensOf(panel);
        gsap.set(panel, { clearProps: 'opacity,transform' });
        panel.hidden = !active;
        if (active && !prefersReducedMotion()) gsap.fromTo(panel, { opacity: 0, y: 8 }, {
          opacity: 1, y: 0, duration: motion.tabDuration, ease: motion.ease,
          clearProps: 'opacity,transform', overwrite: true,
        });
      });
      moveIndicator(true);
    }
    const observer = new ResizeObserver(() => moveIndicator());
    observer.observe(tablist);
    document.fonts.ready.then(() => { if (!events.signal.aborted) moveIndicator(); });
    moveIndicator();
    tabs.forEach((button, index) => {
      button.addEventListener("click", () => activateTab(button), options);
      button.addEventListener("keydown", (event) => {
        let target = index;
        if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft")
          target = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") target = 0;
        else if (event.key === "End") target = tabs.length - 1;
        else return;
        event.preventDefault();
        activateTab(tabs[target]);
        tabs[target].focus();
      }, options);
    });
    return () => {
      events.abort();
      observer.disconnect();
      gsap.killTweensOf(indicator);
      document.querySelectorAll('[role=tabpanel]').forEach(panel => {
        gsap.killTweensOf(panel);
        gsap.set(panel, { clearProps: 'opacity,transform' });
      });
      indicator.remove();
    };
  });
}
