(() => {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  document.body.append(dot, ring);

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
  });

  document.querySelectorAll("a, button, input, textarea, .image-placeholder").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-hovering"));
    el.addEventListener("mouseleave", () => ring.classList.remove("is-hovering"));
  });

  const render = () => {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.transform = `translate(${ringX - 12}px, ${ringY - 12}px)`;
    requestAnimationFrame(render);
  };

  render();
})();
