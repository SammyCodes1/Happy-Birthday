(() => {
  const nav = document.querySelector(".site-nav");
  const sentinel = document.querySelector("[data-nav-sentinel]");
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");

  if (nav) {
    if (sentinel && "IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        nav.classList.toggle("scrolled", !entry.isIntersecting);
      }, { threshold: 0 }).observe(sentinel);
    } else {
      window.addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 20));
    }
  }

  const setMenu = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
})();
