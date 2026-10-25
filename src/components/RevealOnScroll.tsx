"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Kaydırma efektleri:
// - data-reveal işaretli öğeler ekrana girince görünür olur, aşağıdan tekrar girince yeniden oynar. İçerik JS
//   olmadan da görünür kalsın diye gizleme yalnızca <html> üzerine "reveal-on" sınıfı eklendikten sonra devreye girer.
// - Hero parallax'ı, üstteki ilerleme çubuğu ve üst menü gölgesi doğrudan stil yazılarak güncellenir
//   (kök öğede CSS değişkeni değiştirmek her karede bütün sayfanın stilini yeniden hesaplatırdı).
export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
          // Yalnızca ekranın altına çıkınca sıfırlanır; yukarıda kalanlar görünür durur, sayfa zıplamaz.
          else if (e.boundingClientRect.top > 0) e.target.classList.remove("is-visible");
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    els.forEach((el) => io.observe(el));
    document.documentElement.classList.add("reveal-on");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hero = document.querySelector<HTMLElement>(".hero-inner");
    const glow = document.querySelector<HTMLElement>(".hero-glow");
    const bar = document.querySelector<HTMLElement>(".scroll-progress");
    const header = document.querySelector<HTMLElement>(".site-header");
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      header?.classList.toggle("is-scrolled", y > 8);
      if (reduce || y > vh * 1.5) return;
      if (hero) {
        hero.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
        hero.style.opacity = String(Math.max(1 - y / (vh * 0.9), 0));
      }
      if (glow) glow.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
