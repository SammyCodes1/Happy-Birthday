(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger, TextPlugin);

  const withWillChange = (targets, animation) => {
    const elements = gsap.utils.toArray(targets);
    elements.forEach((element) => { element.style.willChange = "transform, opacity"; });
    return animation.eventCallback("onComplete", () => {
      elements.forEach((element) => { element.style.willChange = ""; });
    });
  };

  const setupParticles = () => {
    document.querySelectorAll("[data-particles]").forEach((canvas) => {
      if (reducedMotion) {
        canvas.style.display = "none";
        canvas.parentElement?.classList.add("particles-static");
        return;
      }

      const context = canvas.getContext("2d");
      const rain = canvas.dataset.particles === "rain";
      const count = rain ? 80 : Number(canvas.dataset.count || 120);
      let particles = [];
      let width = 0;
      let height = 0;
      let resizeFrame = 0;

      const resize = () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          const rect = canvas.getBoundingClientRect();
          const ratio = Math.min(devicePixelRatio || 1, 2);
          width = rect.width;
          height = rect.height;
          canvas.width = width * ratio;
          canvas.height = height * ratio;
          context.setTransform(ratio, 0, 0, ratio, 0, 0);
          particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: rain ? 2 + Math.random() * 3 : 1 + Math.random() * 3,
            speed: rain ? 2 + Math.random() * 4 : 0.15 + Math.random() * 0.55,
            drift: rain ? -0.3 + Math.random() * 0.6 : -0.15 + Math.random() * 0.3,
            alpha: rain ? 0.4 + Math.random() * 0.6 : 0.15 + Math.random() * 0.65,
            phase: Math.random() * Math.PI * 2,
            color: rain || Math.random() > 0.28 ? "201,168,76" : "232,160,191"
          }));
        });
      };

      const draw = (time) => {
        context.clearRect(0, 0, width, height);
        particles.forEach((particle) => {
          particle.y += particle.speed * (rain ? 1 : -1);
          particle.x += particle.drift;
          if (rain && particle.y > height + 8) {
            particle.y = -10;
            particle.x = Math.random() * width;
          }
          if (!rain && particle.y < -8) particle.y = height + 8;
          if (particle.x < -8) particle.x = width + 8;
          if (particle.x > width + 8) particle.x = -8;
          const fade = rain ? particle.alpha : particle.alpha * (0.55 + Math.sin(time * 0.001 + particle.phase) * 0.45);
          context.beginPath();
          context.fillStyle = `rgba(${particle.color},${Math.max(0.05, fade)})`;
          context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          context.fill();
        });
        requestAnimationFrame(draw);
      };

      resize();
      new ResizeObserver(resize).observe(canvas);
      requestAnimationFrame(draw);
    });
  };

  const setupTilt = () => {
    if (reducedMotion || !hasGSAP || window.matchMedia("(pointer: coarse)").matches) return;
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotateX: -y * 16,
          rotateY: x * 16,
          y: -12,
          transformPerspective: 900,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.8, ease: "power3.out", overwrite: true });
      });
    });
  };

  const setupLightbox = () => {
    const items = [...document.querySelectorAll("[data-lightbox-item]")];
    const modal = document.querySelector("#lightbox");
    if (!items.length || !modal) return;
    const figure = modal.querySelector(".lightbox__figure");
    const visual = modal.querySelector("[data-lightbox-visual]");
    let current = 0;
    let open = false;

    const render = () => {
      const item = items[current];
      const image = item.querySelector("img");
      if (image) {
        visual.src = image.currentSrc || image.src;
        visual.alt = image.alt;
      }
    };
    const show = (index) => {
      current = index;
      render();
      open = true;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (hasGSAP && !reducedMotion) {
        gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" });
        gsap.fromTo(figure, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
      }
    };
    const hide = () => {
      const finish = () => {
        open = false;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      };
      if (hasGSAP && !reducedMotion) {
        gsap.to(figure, { scale: 0.85, opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(modal, { opacity: 0, duration: 0.3, ease: "power1.in", onComplete: finish });
      } else finish();
    };
    const move = (step) => {
      current = (current + step + items.length) % items.length;
      if (hasGSAP && !reducedMotion) {
        gsap.to(figure, { opacity: 0, scale: 0.96, duration: 0.15, onComplete: () => {
          render();
          gsap.to(figure, { opacity: 1, scale: 1, duration: 0.2 });
        } });
      } else render();
    };

    items.forEach((item, index) => item.addEventListener("click", () => show(index)));
    modal.querySelector("[data-close]").addEventListener("click", hide);
    modal.querySelector("[data-prev]").addEventListener("click", () => move(-1));
    modal.querySelector("[data-next]").addEventListener("click", () => move(1));
    modal.addEventListener("click", (event) => { if (event.target === modal) hide(); });
    window.addEventListener("keydown", (event) => {
      if (!open) return;
      if (event.key === "Escape") hide();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    });
  };

  const setupForms = () => {
    document.querySelectorAll("[data-fake-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const success = document.querySelector(form.dataset.success);
        if (!success) return;
        if (!success.querySelector(".success-check")) {
          success.querySelector(".form-success__spark")?.remove();
          success.insertAdjacentHTML("afterbegin", '<svg class="success-check" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28"/><path d="m18 33 9 9 20-22"/></svg>');
        }
        if (hasGSAP && !reducedMotion) {
          gsap.to(form, {
            opacity: 0, y: -30, duration: 0.5, ease: "power2.in",
            onComplete: () => {
              form.hidden = true;
              success.classList.add("is-visible");
              gsap.fromTo(success, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: "power2.out" });
            }
          });
        } else {
          form.hidden = true;
          success.classList.add("is-visible");
        }
      });
    });

    document.querySelectorAll("[data-toggle-group]").forEach((group) => {
      const input = group.querySelector("input");
      group.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          group.querySelectorAll("button").forEach((item) => item.classList.remove("is-active"));
          button.classList.add("is-active");
          input.value = button.dataset.value;
        });
      });
    });

    document.querySelectorAll("[data-stepper]").forEach((stepper) => {
      const output = stepper.querySelector("output");
      let value = Number(output.value || output.textContent || 1);
      const update = (next) => {
        value = Math.min(10, Math.max(1, next));
        output.value = output.textContent = value;
        if (hasGSAP && !reducedMotion) gsap.fromTo(output, { scale: 1 }, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" });
      };
      stepper.querySelector("[data-minus]").addEventListener("click", () => update(value - 1));
      stepper.querySelector("[data-plus]").addEventListener("click", () => update(value + 1));
    });
  };

  const setupEventBorders = () => {
    document.querySelectorAll(".event-card").forEach((card) => {
      card.insertAdjacentHTML("afterbegin", '<svg class="event-card__trace" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="1" y="1" width="98" height="98" rx="3"/></svg>');
      if (!hasGSAP || reducedMotion) return;
      const rect = card.querySelector(".event-card__trace rect");
      card.addEventListener("mouseenter", () => {
        gsap.fromTo(rect, { strokeDashoffset: 400 }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(rect, { strokeDashoffset: 400, duration: 0.35, ease: "power2.in" });
      });
    });
  };

  const prepareAnimationStates = () => {
    if (!hasGSAP || reducedMotion) return;
    const homeName = document.querySelector(".home-hero h1");
    if (homeName) {
      const letters = homeName.textContent.trim().split("");
      homeName.innerHTML = letters.map((letter) =>
        letter === " "
          ? '<span class="hero-letter hero-letter--space" aria-hidden="true">&nbsp;</span>'
          : `<span class="hero-letter">${letter}</span>`
      ).join("");
      gsap.set(homeName.children, { y: -80, opacity: 0 });
      gsap.set([".home-hero__line", ".home-hero__date", ".home-hero .button", ".home-hero__scroll"], { opacity: 0 });
      gsap.set(".particle-canvas", { opacity: 0 });
      gsap.set(".countdown-landing__content > .eyebrow, .countdown-landing h1, .countdown-landing__timer > div, .countdown-landing__scroll", { opacity: 0 });
    }

    if (document.querySelector(".story-hero")) {
      gsap.set(".story-hero h1 span:first-child", { x: -60, opacity: 0 });
      gsap.set(".story-hero h1 span:last-child", { x: 60, opacity: 0 });
      gsap.set(".story-hero .eyebrow, .story-hero p", { y: 25, opacity: 0 });
    }

    if (document.querySelector(".gallery-hero")) {
      gsap.set(".gallery-hero h1, .gallery-hero p", { y: 35, opacity: 0 });
      gsap.set(".gallery-hero__rule", { scaleX: 0 });
    }

    if (document.querySelector(".event-hero")) gsap.set(".event-hero .particle-canvas", { opacity: 0 });

    document.querySelectorAll(".page-hero:not(.story-hero):not(.gallery-hero):not(.home-hero) [data-hero-reveal]").forEach((element) => {
      gsap.set(element, { y: 40, opacity: 0 });
    });
  };

  const runHeroSequence = () => {
    if (!hasGSAP || reducedMotion) return;
    if (document.querySelector(".home-hero")) {
      const timeline = gsap.timeline();
      timeline
        .fromTo(".countdown-landing__content > .eyebrow", { y: 20 }, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" })
        .fromTo(".countdown-landing h1", { y: 35 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "-=0.35")
        .fromTo(".countdown-landing__timer > div", { y: 35 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.1, ease: "power2.out" }, "-=0.45")
        .to(".countdown-landing__scroll", { opacity: 1, duration: 0.6 });

      gsap.timeline({
        scrollTrigger: { trigger: ".home-hero", start: "top 72%", once: true }
      })
        .to(".home-hero h1 .hero-letter", { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: "power3.out" })
        .fromTo(".home-hero__line", { y: 30 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 0.9)
        .to(".home-hero__date", { opacity: 1, duration: 0.7 }, 1.1)
        .fromTo(".home-hero .button", { scale: 0.9 }, { scale: 1, opacity: 1, duration: 0.7, ease: "power2.out" }, 1.3)
        .to(".particle-canvas", { opacity: 1, duration: 2, ease: "power1.out" }, 0)
        .to(".home-hero__scroll", { opacity: 1, duration: 0.6 }, 1.65);
      return;
    }

    if (document.querySelector(".story-hero")) {
      gsap.timeline()
        .to(".story-hero h1 span", { x: 0, opacity: 1, duration: 1, ease: "power3.out" })
        .to(".story-hero .eyebrow, .story-hero p", { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "power2.out" }, "-=0.55");
      return;
    }

    if (document.querySelector(".gallery-hero")) {
      gsap.timeline()
        .to(".gallery-hero h1, .gallery-hero p", { y: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: "power3.out" })
        .to(".gallery-hero__rule", { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, 1);
      gsap.from(".polaroid", {
        y: 200,
        x: (index) => index === 0 ? -120 : index === 2 ? 120 : 0,
        rotation: (index) => index === 0 ? -20 : index === 2 ? 20 : 12,
        opacity: 0,
        duration: 1.1,
        stagger: 0.2,
        ease: "power3.out"
      });
      return;
    }

    gsap.to(".page-hero [data-hero-reveal]", { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out" });
    if (document.querySelector(".event-hero")) gsap.to(".event-hero .particle-canvas", { opacity: 1, duration: 2 });
  };

  const setupScrollAnimations = () => {
    if (!hasGSAP || reducedMotion) return;

    document.querySelectorAll("[data-word-reveal]").forEach((element) => {
      if (!element.children.length) {
        element.innerHTML = element.textContent.trim().split(/\s+/).map((word) => `<span>${word}</span>`).join(" ");
      }
      gsap.from(element.children, {
        y: 20, opacity: 0, duration: 0.65, stagger: 0.04, ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 80%", once: true }
      });
    });

    const stats = document.querySelectorAll(".stat");
    if (stats.length) {
      gsap.from(stats, {
        y: 40, opacity: 0, duration: 0.9, stagger: 0.2, ease: "power2.out",
        scrollTrigger: { trigger: ".stats", start: "top 82%", once: true }
      });
      document.querySelectorAll("[data-count-to]").forEach((element) => {
        const state = { value: 0 };
        gsap.to(state, {
          value: Number(element.dataset.countTo), duration: 2, ease: "power2.out",
          onUpdate: () => { element.textContent = Math.round(state.value); },
          scrollTrigger: { trigger: element, start: "top 85%", once: true }
        });
      });
    }

    if (document.querySelector(".preview-row")) {
      gsap.from(".preview-card", {
        y: 60, rotation: 3, opacity: 0, duration: 0.9, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: ".preview-row", start: "top 82%", once: true }
      });
    }

    const storyTimeline = document.querySelector(".story-timeline");
    if (storyTimeline) {
      gsap.set(storyTimeline, { "--line-scale": 0 });
      gsap.to(storyTimeline, {
        "--line-scale": 1, duration: 2, ease: "power2.inOut",
        scrollTrigger: { trigger: storyTimeline, start: "top 78%", once: true }
      });
      document.querySelectorAll(".timeline__entry").forEach((entry) => {
        const left = entry.classList.contains("timeline__entry--left");
        gsap.set(entry, { "--dot-scale": 0 });
        gsap.from(entry, {
          x: left ? -80 : 80, opacity: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: {
            trigger: entry, start: "top 82%", once: true,
            onEnter: () => {
              entry.classList.add("is-active");
              gsap.to(entry, { "--dot-scale": 1, duration: 0.45, ease: "power2.out" });
            }
          }
        });
        const timelineImage = entry.querySelector(".timeline__image");
        if (timelineImage) {
          gsap.fromTo(timelineImage, { clipPath: "inset(0 100% 0 0)" }, {
            clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power3.inOut",
            scrollTrigger: { trigger: entry, start: "top 75%", once: true }
          });
        }
      });
    }

    if (document.querySelector(".bento")) {
      ScrollTrigger.batch(".bento__item", {
        start: "top 88%",
        once: true,
        onEnter: (batch) => withWillChange(batch, gsap.from(batch, { y: 40, opacity: 0, duration: 0.75, stagger: 0.08, ease: "power2.out" }))
      });
    }

    if (document.querySelector(".polaroids")) {
      document.querySelectorAll(".polaroid").forEach((card, index) => {
        const restingRotation = [-3, 1, -1.5][index] || 0;
        card.addEventListener("mouseenter", () => gsap.to(card, { rotation: 0, y: -20, boxShadow: "0 30px 75px rgba(0,0,0,.6)", duration: 0.45, ease: "power2.out" }));
        card.addEventListener("mouseleave", () => gsap.to(card, { rotation: restingRotation, y: index === 1 ? 26 : 0, boxShadow: "0 15px 45px rgba(0,0,0,.35)", duration: 0.65, ease: "power3.out" }));
      });
    }

    document.querySelectorAll(".memory-feature").forEach((card, index) => {
      gsap.from(card, {
        x: index % 2 === 0 ? -60 : 60, opacity: 0, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 84%", once: true }
      });
    });

    if (document.querySelector("[data-mosaic]")) {
      gsap.from("[data-mosaic] .memory-bubble", {
        y: -60, opacity: 0, scale: 0.8, duration: 0.8, stagger: 0.06, ease: "back.out(1.5)",
        scrollTrigger: { trigger: "[data-mosaic]", start: "top 82%", once: true }
      });
    }

    if (document.querySelector("[data-flip-grid]")) {
      ScrollTrigger.batch("[data-flip-grid] .wish-card", {
        start: "top 88%",
        once: true,
        onEnter: (batch) => withWillChange(batch, gsap.from(batch, {
          rotateY: 90, opacity: 0, duration: 0.8, stagger: 0.1, transformPerspective: 1000, ease: "power2.out"
        }))
      });
    }

    if (document.querySelector(".event-cards")) {
      gsap.from(".event-card", {
        y: 60, opacity: 0, duration: 0.85, stagger: 0.2, ease: "power3.out",
        scrollTrigger: { trigger: ".event-cards", start: "top 84%", once: true }
      });
    }

    if (document.querySelector(".traits")) {
      ScrollTrigger.batch(".trait", {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.from(batch, { y: 45, opacity: 0, duration: 0.75, stagger: 0.1, ease: "power2.out" })
      });
    }

    const specificSelectors = ".stat, .preview-card, .timeline__entry, .bento__item, .memory-feature, .memory-bubble, .wish-card, .event-card";
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      if (element.matches(specificSelectors) || element.closest(specificSelectors)) return;
      gsap.from(element, {
        y: 42, opacity: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 86%", once: true }
      });
    });

    document.querySelectorAll(".section-title, .section-heading").forEach((heading) => {
      gsap.to(heading, {
        "--underline-scale": 1, duration: 0.75, ease: "power2.inOut",
        scrollTrigger: { trigger: heading, start: "top 82%", once: true }
      });
    });

    if (document.querySelector(".birthday-hero__bg")) {
      gsap.to(".birthday-hero__bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".birthday-hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }
  };

  setupParticles();
  setupTilt();
  setupLightbox();
  setupForms();
  setupEventBorders();
  document.querySelectorAll(".section-label, .eyebrow, .footer__monogram").forEach((element) => element.classList.add("accent-pulse"));
  prepareAnimationStates();
  setupScrollAnimations();

  if (reducedMotion || !hasGSAP) return;
  window.addEventListener("pageIntroComplete", runHeroSequence, { once: true });
})();
