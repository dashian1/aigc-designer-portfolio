const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const introGate = document.querySelector(".intro-gate");
const introVideo = document.querySelector(".intro-video");
const introSkip = document.querySelector(".intro-skip");
const introProgress = document.querySelector(".intro-progress span");
const introTime = document.querySelector(".intro-time");
const machineVideo = document.querySelector(".machine-screen");
const leverButton = document.querySelector(".lever-button");
const shouldSkipIntro = new URLSearchParams(window.location.search).has("skipIntro");

if (!prefersReducedMotion && window.Lenis) {
  try {
    const lenis = new window.Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.88,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    if (window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
    }
  } catch {
    document.documentElement.classList.remove("lenis", "lenis-smooth");
  }
}

if (window.gsap && window.ScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);
}

document.querySelectorAll(".menu-item, .button, .icon-button, .lever-button").forEach((node) => {
  node.classList.add("magnetic");
});

if (!prefersReducedMotion && window.gsap) {
  document.querySelectorAll(".magnetic").forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
      gsap.to(node, { x, y, duration: 0.28, ease: "power3.out" });
    });

    node.addEventListener("pointerleave", () => {
      gsap.to(node, { x: 0, y: 0, duration: 0.42, ease: "elastic.out(1, 0.45)" });
    });
  });
}

document.querySelector(".deck-main")?.addEventListener("pointermove", (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  event.currentTarget.style.setProperty("--mx", `${x}%`);
  event.currentTarget.style.setProperty("--my", `${y}%`);
});

function playMuted(video) {
  if (!video || prefersReducedMotion) return;
  video.muted = true;
  video.play().catch(() => {});
}

function revealHome() {
  if (prefersReducedMotion || !window.gsap) return;

  gsap.from(".site-header", {
    y: -18,
    opacity: 0,
    duration: 0.55,
    ease: "power2.out",
  });

  gsap.from(".command-deck .reveal-item", {
    y: 22,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: "power3.out",
  });

  if (window.ScrollTrigger) {
    gsap.utils.toArray("main > section:not(.command-deck) .reveal-item").forEach((item) => {
      gsap.from(item, {
        y: 34,
        opacity: 0,
        duration: 0.78,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 84%",
          once: true,
        },
      });
    });
  }
}

function finishIntro() {
  introVideo?.pause();
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.body.classList.add("intro-complete");
  document.body.classList.remove("intro-locked");
  playMuted(machineVideo);
  revealHome();
}

if (!introGate) {
  playMuted(machineVideo);
  revealHome();
} else if (shouldSkipIntro) {
  finishIntro();
} else if (introVideo) {
  introVideo.muted = true;
  introVideo.play().catch(() => {
    introGate?.classList.add("needs-click");
  });
}

introSkip?.addEventListener("click", finishIntro);

introGate?.addEventListener("click", (event) => {
  if (
    event.target === introGate ||
    event.target === introVideo ||
    event.target.classList.contains("pixel-shade")
  ) {
    finishIntro();
  }
});

introVideo?.addEventListener("timeupdate", () => {
  if (introProgress && introVideo.duration) {
    introProgress.style.width = `${(introVideo.currentTime / introVideo.duration) * 100}%`;
  }

  if (introTime) {
    const seconds = Number.isFinite(introVideo.currentTime) ? Math.floor(introVideo.currentTime) : 0;
    introTime.textContent = `00:${String(seconds).padStart(2, "0")}`;
  }
});

introVideo?.addEventListener("ended", finishIntro);

leverButton?.addEventListener("click", () => {
  leverButton.classList.remove("is-spinning");
  void leverButton.offsetWidth;
  leverButton.classList.add("is-spinning");

  if (machineVideo) {
    machineVideo.currentTime = 0;
    playMuted(machineVideo);
  }
});

if (window.lucide) {
  lucide.createIcons({
    attrs: {
      "stroke-width": 2,
    },
  });
}

const creativeFirstOrder = [
  "04_lingzhi_promo_full",
  "05_lingzhi_creative_2",
  "06_lingzhi_cloud_crane",
  "07_lingzhi_dangshen",
  "08_lingzhi_warm",
  "15_etc_speed_ad",
  "16_etc_wuxia",
  "17_etc_wukong",
  "18_etc_node_8",
  "19_etc_yaban",
  "25_sushi_creative_2",
  "26_sushi_logo_1",
  "27_sushi_logo_2",
  "28_sushi_dot",
];

function prioritizeCreativeVideos() {
  const carouselNode = document.querySelector(".video-carousel");
  if (!carouselNode) return;

  const cards = Array.from(carouselNode.querySelectorAll(".video-card"));
  const priority = new Map(creativeFirstOrder.map((key, index) => [key, index]));
  const baseIndex = creativeFirstOrder.length;

  cards
    .map((card, index) => {
      const source = card.querySelector("video")?.dataset.src || "";
      const key = Array.from(priority.keys()).find((item) => source.includes(item));
      return {
        card,
        index,
        rank: key ? priority.get(key) : baseIndex + index,
      };
    })
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .forEach(({ card }, index) => {
      const label = card.querySelector(".video-meta span");
      if (label) {
        label.textContent = label.textContent.replace(/^\d+/, String(index + 1).padStart(2, "0"));
      }
      carouselNode.appendChild(card);
    });
}

prioritizeCreativeVideos();

const carousel = document.querySelector(".video-carousel");
const videoCards = Array.from(document.querySelectorAll(".video-card"));
const dotsWrap = document.querySelector(".carousel-dots");
const carouselControls = document.querySelector(".carousel-controls");
const carouselStatus = document.createElement("span");
let activeVideoIndex = 0;
let suppressCardOpen = false;
let lightboxIndex = 0;

if (carouselControls && videoCards.length > 0) {
  carouselStatus.className = "carousel-status";
  carouselStatus.setAttribute("aria-live", "polite");
  carouselControls.prepend(carouselStatus);
}

const lightbox = document.createElement("div");
lightbox.className = "video-lightbox";
lightbox.setAttribute("aria-hidden", "true");
lightbox.innerHTML = `
  <div class="video-lightbox-backdrop" data-lightbox-close></div>
  <div class="video-lightbox-panel" role="dialog" aria-modal="true" aria-label="作品视频预览">
    <button class="icon-button lightbox-close" type="button" aria-label="关闭预览">
      <i data-lucide="x" aria-hidden="true"></i>
    </button>
    <button class="icon-button lightbox-nav lightbox-prev" type="button" aria-label="上一条视频">
      <i data-lucide="chevron-left" aria-hidden="true"></i>
    </button>
    <video class="lightbox-video" controls playsinline></video>
    <button class="icon-button lightbox-nav lightbox-next" type="button" aria-label="下一条视频">
      <i data-lucide="chevron-right" aria-hidden="true"></i>
    </button>
    <div class="lightbox-meta">
      <span></span>
      <strong></strong>
    </div>
  </div>
`;
document.body.appendChild(lightbox);

const lightboxVideo = lightbox.querySelector(".lightbox-video");
const lightboxMetaType = lightbox.querySelector(".lightbox-meta span");
const lightboxMetaTitle = lightbox.querySelector(".lightbox-meta strong");

if (window.lucide) {
  lucide.createIcons({
    attrs: {
      "stroke-width": 2,
    },
  });
}

function updateCarouselStatus() {
  if (carouselStatus && videoCards.length > 0) {
    carouselStatus.textContent = `${String(activeVideoIndex + 1).padStart(2, "0")} / ${videoCards.length}`;
  }
}

function getCardVideoData(index) {
  const card = videoCards[index];
  const video = card?.querySelector("video");
  return {
    card,
    src: video?.dataset.src || video?.getAttribute("src") || "",
    poster: video?.getAttribute("poster") || "",
    label: card?.querySelector(".video-meta span")?.textContent || "",
    title: card?.querySelector(".video-meta h3")?.textContent || "",
  };
}

function openLightbox(index) {
  if (!videoCards.length || suppressCardOpen) return;

  lightboxIndex = (index + videoCards.length) % videoCards.length;
  const data = getCardVideoData(lightboxIndex);
  if (!data.src || !lightboxVideo) return;

  videoCards[activeVideoIndex]?.querySelector("video")?.pause();
  lightboxMetaType.textContent = data.label;
  lightboxMetaTitle.textContent = data.title;
  lightboxVideo.poster = data.poster;
  lightboxVideo.src = data.src;
  lightboxVideo.currentTime = 0;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxVideo.play().catch(() => {});
  lightbox.querySelector(".lightbox-close")?.focus();
}

function closeLightbox() {
  if (!lightbox.classList.contains("is-open")) return;

  lightboxVideo.pause();
  lightboxVideo.removeAttribute("src");
  lightboxVideo.load();
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  applyVideoState();
}

function stepLightbox(delta) {
  openLightbox(lightboxIndex + delta);
}

function applyVideoState() {
  videoCards.forEach((card, cardIndex) => {
    const video = card.querySelector("video");
    const isActive = cardIndex === activeVideoIndex;
    const distance = Math.abs(cardIndex - activeVideoIndex);
    card.classList.toggle("is-active", isActive);

    if (!video) return;

    /* Lazy load: only keep src for active + adjacent; unload distant ones */
    const dataSrc = video.getAttribute("data-src");
    if (distance <= 1 && dataSrc) {
      if (!video.src || video.src !== dataSrc) {
        video.src = dataSrc;
        video.load();
      }
    } else if (distance > 1) {
      video.removeAttribute("src");
      video.load();
    }

    if (isActive && !prefersReducedMotion) {
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });

  document.querySelectorAll(".carousel-dots button").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeVideoIndex);
  });

  updateCarouselStatus();
}

function setActiveVideo(index) {
  if (!carousel || videoCards.length === 0) return;

  activeVideoIndex = (index + videoCards.length) % videoCards.length;
  applyVideoState();

  videoCards[activeVideoIndex].scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    inline: "center",
    block: "nearest",
  });
}

if (carousel && dotsWrap && videoCards.length > 0) {
  videoCards.forEach((card, index) => {
    const title = card.querySelector(".video-meta h3")?.textContent || `第 ${index + 1} 条视频`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `打开视频预览：${title}`);
    card.addEventListener("click", () => openLightbox(index));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  /* ---- Dot indicators ---- */
  videoCards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `切换到第 ${index + 1} 条视频`);
    dot.addEventListener("click", () => setActiveVideo(index));
    dotsWrap.appendChild(dot);
  });

  document.querySelector(".reel-prev")?.addEventListener("click", () => {
    setActiveVideo(activeVideoIndex - 1);
  });

  document.querySelector(".reel-next")?.addEventListener("click", () => {
    setActiveVideo(activeVideoIndex + 1);
  });

  /* ---- Snap-to-card on scroll end ---- */
  let scrollTimer;
  let isProgrammaticScroll = false;

  carousel.addEventListener("scroll", () => {
    // Don't recalc if this scroll was triggered by our own setActiveVideo
    if (isProgrammaticScroll) return;

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      videoCards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const distance = Math.abs(cardCenter - carouselCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      if (nearestIndex !== activeVideoIndex) {
        activeVideoIndex = nearestIndex;
        applyVideoState();
      }
      // Snap precisely to the nearest card
      isProgrammaticScroll = true;
      videoCards[nearestIndex].scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
      setTimeout(() => { isProgrammaticScroll = false; }, 500);
    }, 80);
  });

  /* ---- Mouse drag + touch swipe ---- */
  let isDragging = false;
  let dragStartX = 0;
  let dragScrollLeft = 0;

  const getClientX = (e) => {
    if (e.touches) return e.touches[0].pageX;
    return e.pageX;
  };

  const startDrag = (e) => {
    isDragging = true;
    suppressCardOpen = false;
    dragStartX = getClientX(e) - carousel.offsetLeft;
    dragScrollLeft = carousel.scrollLeft;
    carousel.classList.add("is-dragging");
  };

  const moveDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = getClientX(e) - carousel.offsetLeft;
    const walk = (x - dragStartX) * 1.4;
    if (Math.abs(walk) > 8) {
      suppressCardOpen = true;
    }
    carousel.scrollLeft = dragScrollLeft - walk;
  };

  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove("is-dragging");
    setTimeout(() => {
      suppressCardOpen = false;
    }, 80);
  };

  carousel.addEventListener("mousedown", startDrag);
  carousel.addEventListener("mousemove", moveDrag);
  carousel.addEventListener("mouseleave", stopDrag);
  carousel.addEventListener("mouseup", stopDrag);

  carousel.addEventListener("touchstart", startDrag, { passive: false });
  carousel.addEventListener("touchmove", moveDrag, { passive: false });
  carousel.addEventListener("touchend", stopDrag);

  /* ---- Keyboard arrows ---- */
  carousel.setAttribute("tabindex", "0");
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveVideo(activeVideoIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveVideo(activeVideoIndex + 1);
    }
  });

  applyVideoState();
}

lightbox.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox-prev")?.addEventListener("click", () => stepLightbox(-1));
lightbox.querySelector(".lightbox-next")?.addEventListener("click", () => stepLightbox(1));
lightbox.querySelector("[data-lightbox-close]")?.addEventListener("click", closeLightbox);

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    closeLightbox();
  } else if (event.key === "ArrowLeft") {
    stepLightbox(-1);
  } else if (event.key === "ArrowRight") {
    stepLightbox(1);
  }
});

/* 作品筛选 */
const filterButtons = document.querySelectorAll(".filter-btn");
const missionCards = document.querySelectorAll(".mission-card");

if (filterButtons.length && missionCards.length) {
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      // 更新按钮状态
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      // 筛选卡片
      missionCards.forEach((card) => {
        const category = card.dataset.category || "all";
        if (filter === "all" || category === filter) {
          card.style.display = "";
          card.style.opacity = "0";
          card.style.transform = "translateY(20px)";
          setTimeout(() => {
            card.style.transition = "opacity 300ms ease, transform 300ms ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, 50);
        } else {
          card.style.transition = "opacity 200ms ease";
          card.style.opacity = "0";
          card.style.transform = "translateY(20px)";
          setTimeout(() => {
            card.style.display = "none";
          }, 200);
        }
      });
    });
  });
}
