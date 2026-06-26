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

  const scrollToHashTarget = () => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", (event) => {
    setMenu(false);

    const destination = new URL(link.href, window.location.href);
    const samePage = destination.origin === window.location.origin && destination.pathname === window.location.pathname;

    if (samePage && destination.hash) {
      event.preventDefault();
      history.pushState(null, "", destination.hash);
      scrollToHashTarget();
    }
  }));

  window.addEventListener("pageIntroComplete", scrollToHashTarget);
  window.addEventListener("load", scrollToHashTarget);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
})();
