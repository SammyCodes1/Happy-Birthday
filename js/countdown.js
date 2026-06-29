(() => {
  const widgets = document.querySelectorAll("[data-countdown]");
  if (!widgets.length) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (value) => String(value).padStart(2, "0");
  const birthdayMessage = "MRS OMHONRIA PAULINE";

  const showBirthdayMessage = (widget) => {
    if (widget.classList.contains("is-complete")) return;
    widget.classList.add("is-complete");
    if (!widget.classList.contains("countdown-landing__timer")) {
      widget.innerHTML = "";
      return;
    }
    widget.innerHTML = `<span class="countdown__complete">${birthdayMessage}</span>`;
  };

  const buildFlipDigit = (element, value) => {
    element.dataset.value = value;
    element.innerHTML = `
      <span class="flip-half flip-half--top">${value}</span>
      <span class="flip-half flip-half--bottom">${value}</span>
      <span class="flip-leaf flip-leaf--top">${value}</span>
      <span class="flip-leaf flip-leaf--bottom">${value}</span>
    `;
  };

  const setValue = (element, value) => {
    if (!element) return;
    if (!element.classList.contains("party-countdown__number")) {
      element.textContent = value;
      return;
    }
    if (!element.dataset.value) {
      buildFlipDigit(element, value);
      return;
    }
    if (element.dataset.value === value) return;
    if (reducedMotion) {
      buildFlipDigit(element, value);
      return;
    }

    const previous = element.dataset.value;
    const topStatic = element.querySelector(".flip-half--top");
    const bottomStatic = element.querySelector(".flip-half--bottom");
    const topLeaf = element.querySelector(".flip-leaf--top");
    const bottomLeaf = element.querySelector(".flip-leaf--bottom");
    topStatic.textContent = value;
    bottomStatic.textContent = previous;
    topLeaf.textContent = previous;
    bottomLeaf.textContent = value;
    element.classList.remove("is-flipping");
    void element.offsetWidth;
    element.classList.add("is-flipping");
    element.dataset.value = value;

    window.setTimeout(() => {
      bottomStatic.textContent = value;
      element.classList.remove("is-flipping");
    }, 820);
  };

  const update = () => {
    widgets.forEach((widget) => {
      const target = new Date(widget.dataset.date || "2026-06-29T00:00:00+01:00");
      const distance = target.getTime() - Date.now();
      if (distance <= 0) {
        showBirthdayMessage(widget);
        return;
      }
      const values = {
        days: pad(Math.floor(distance / 86400000)),
        hours: pad(Math.floor((distance / 3600000) % 24)),
        minutes: pad(Math.floor((distance / 60000) % 60)),
        seconds: pad(Math.floor((distance / 1000) % 60))
      };
      Object.entries(values).forEach(([key, value]) => setValue(widget.querySelector(`[data-${key}]`), value));
    });
  };

  update();
  setInterval(update, 1000);
})();
