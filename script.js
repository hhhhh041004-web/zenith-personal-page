document.documentElement.classList.add("reveal-ready");

const links = document.querySelectorAll('a[href^="#"]');
const header = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".nav a");
const sections = [...document.querySelectorAll("main section[id], .profile-grid[id]")];
const heroTitle = document.querySelector("#hero-title");
const portrait = document.querySelector(".hero-art");
const tickerNumbers = document.querySelectorAll("[data-count]");
const strengthCards = document.querySelectorAll(".strength-list article");
const experienceItems = document.querySelectorAll(".experience-list li");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroTitle && !heroTitle.dataset.split) {
  heroTitle.dataset.split = "true";
  heroTitle.innerHTML = [...heroTitle.textContent]
    .map((char) => `<span class="char">${char}</span>`)
    .join("");
}

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
};

const setActiveNav = () => {
  const current = sections
    .filter((section) => section.getBoundingClientRect().top < window.innerHeight * 0.45)
    .at(-1);

  if (!current) return;

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${current.id}`);
  });
};

const setScrollProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
  document.documentElement.style.setProperty("--edge-progress", Math.min(1, 0.2 + progress * 3).toFixed(4));
};

const updateChrome = () => {
  setScrollProgress();
  setHeaderState();
  setActiveNav();
};

window.addEventListener("scroll", updateChrome, { passive: true });
updateChrome();

const revealWithoutGsap = () => {
  const targets = document.querySelectorAll(
    ".hero-copy > *, .hero-art, .ticker div, .section-label, .section-body > *, .site-footer > *",
  );

  targets.forEach((target) => {
    target.style.opacity = "1";
    target.style.transform = "none";
  });

  document.querySelectorAll("#hero-title .char").forEach((char) => {
    char.style.opacity = "1";
    char.style.transform = "none";
  });
};

const animateNumber = (element) => {
  if (element.dataset.counted === "true") return;
  element.dataset.counted = "true";

  const end = Number(element.dataset.count);
  const suffix = element.dataset.suffix || "";
  const duration = 900;
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(end * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const initIntersectionMotion = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");

        entry.target.querySelectorAll?.("[data-count]").forEach(animateNumber);
        if (entry.target.matches("[data-count]")) animateNumber(entry.target);
      });
    },
    { threshold: 0.28 },
  );

  document.querySelectorAll(".section, .ticker, [data-count]").forEach((item) => observer.observe(item));

  const experienceObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-current", entry.isIntersecting);
      });
    },
    {
      rootMargin: "-36% 0px -46% 0px",
      threshold: 0,
    },
  );

  experienceItems.forEach((item) => experienceObserver.observe(item));
};

const initMagneticMotion = () => {
  if (window.matchMedia("(pointer: coarse)").matches || reduceMotion) return;

  document.querySelectorAll(".button").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.12 - 2}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });

  strengthCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-y", `${x * 7}deg`);
      card.style.setProperty("--tilt-x", `${y * -6}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--tilt-x", "0deg");
    });
  });
};

const initCursorTrace = () => {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  window.addEventListener(
    "pointermove",
    (event) => {
      document.body.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.body.style.setProperty("--cursor-y", `${event.clientY}px`);
      document.body.style.setProperty("--cursor-opacity", "1");
    },
    { passive: true },
  );

  document.querySelectorAll("a, button, .strength-list article, .experience-list li").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      document.body.style.setProperty("--cursor-scale", "1.8");
    });
    item.addEventListener("mouseleave", () => {
      document.body.style.setProperty("--cursor-scale", "1");
    });
  });
};

const initGsapMotion = () => {
  if (reduceMotion || !window.gsap) {
    revealWithoutGsap();
    return;
  }

  const { gsap } = window;
  gsap.registerPlugin?.(window.ScrollTrigger);

  gsap
    .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
    .to("#hero-title .char", {
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: 0.045,
      duration: 0.7,
    })
    .to(".hero-copy > *:not(#hero-title)", {
      opacity: 1,
      y: 0,
      stagger: 0.08,
    }, "-=0.42")
    .to(
      ".hero-art",
      {
        opacity: 1,
        y: 0,
        duration: 1,
      },
      "-=0.65",
    )
    .call(() => portrait?.classList.add("is-lit"), undefined, "-=0.45")
    .to(
      ".ticker div",
      {
        opacity: 1,
        y: 0,
        stagger: 0.07,
        duration: 0.65,
      },
      "-=0.35",
    );

  if (window.ScrollTrigger) {
    gsap.to(".hero-art img", {
      yPercent: -8,
      scale: 1.08,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".edge-lines", {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    document.querySelectorAll(".section").forEach((section) => {
      const targets = section.querySelectorAll(".section-label, .section-body > *");
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
        },
      });
    });

    gsap.to(".site-footer > *", {
      opacity: 1,
      y: 0,
      stagger: 0.08,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".site-footer",
        start: "top 92%",
      },
    });
  } else {
    revealWithoutGsap();
  }
};

initCursorTrace();
initIntersectionMotion();
initMagneticMotion();
initGsapMotion();
