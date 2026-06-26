(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const overlay = document.querySelector(".page-transition");
  const pageElements = document.querySelectorAll(".site-nav, main, .site-footer");

  if (!overlay) {
    window.dispatchEvent(new CustomEvent("pageIntroComplete"));
    return;
  }

  const monogram = document.createElement("div");
  monogram.className = "transition-monogram";
  monogram.setAttribute("aria-hidden", "true");
  monogram.textContent = "OP.";
  overlay.append(monogram);

  if (reducedMotion || typeof gsap === "undefined") {
    overlay.hidden = true;
    pageElements.forEach((element) => { element.style.opacity = "1"; });
    requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("pageIntroComplete")));
  } else {
    gsap.set(pageElements, { opacity: 0 });
    gsap.set(overlay, { yPercent: 0 });
    gsap.set(monogram, { scale: 0.8, opacity: 0 });

    gsap.timeline({
      onComplete: () => {
        overlay.style.pointerEvents = "none";
        window.dispatchEvent(new CustomEvent("pageIntroComplete"));
      }
    })
      .to(monogram, { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" })
      .to({}, { duration: 0.1 })
      .to(overlay, { yPercent: -100, duration: 0.35, ease: "power3.inOut" })
      .to(pageElements, { opacity: 1, duration: 0.25, ease: "power1.out" }, "-=0.25");
  }

  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.hash) return;

      event.preventDefault();
      if (reducedMotion || typeof gsap === "undefined") {
        window.location.href = destination.href;
        return;
      }

      overlay.hidden = false;
      overlay.style.pointerEvents = "auto";
      gsap.set(monogram, { opacity: 0, scale: 0.9 });
      gsap.fromTo(
        overlay,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.3,
          ease: "power3.in",
          onComplete: () => { window.location.href = destination.href; }
        }
      );
    });
  });
})();
