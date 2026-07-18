// ===========================
// Mobile Menu
// ===========================

const toggle = document.getElementById("menu-toggle");
const nav = document.querySelector(".nav-links");

if (toggle && nav) {
    toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("active");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
}


// ===========================
// Fade In Animation
// ===========================

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
    document.querySelectorAll(".fade-in").forEach((el) => el.classList.add("show"));
} else {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
    });

    document.querySelectorAll(".fade-in").forEach((el) => {
        observer.observe(el);
    });
}


// ===========================
// Gallery Lightbox
// ===========================

const galleryImages = Array.from(document.querySelectorAll(
    "[data-lightbox-image], .gallery-preview .gallery-grid img"
));
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeLightbox = document.querySelector(".close-lightbox");
const lightboxPrevious = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxCounter = document.getElementById("lightbox-counter");

let activeGalleryImages = [];
let activeGalleryIndex = -1;
let previouslyFocusedElement = null;
let touchStartX = 0;
let touchStartY = 0;

function getVisibleGalleryImages() {
    return galleryImages.filter((image) => {
        const category = image.closest(".gallery-category");
        return !category || !category.hidden;
    });
}

function getGalleryCaption(image) {
    const figureCaption = image.closest("figure")?.querySelector("figcaption");
    return image.dataset.caption || figureCaption?.textContent?.trim() || image.alt || "Gallery photo";
}

function updateLightboxImage(index) {
    if (!lightboxImage || !activeGalleryImages.length) return;

    activeGalleryIndex = (index + activeGalleryImages.length) % activeGalleryImages.length;

    const image = activeGalleryImages[activeGalleryIndex];
    lightboxImage.src = image.dataset.fullSrc || image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "Gallery image";
    lightboxImage.draggable = false;

    if (lightboxCaption) {
        lightboxCaption.textContent = getGalleryCaption(image);
    }

    if (lightboxCounter) {
        lightboxCounter.textContent = `${activeGalleryIndex + 1} / ${activeGalleryImages.length}`;
    }

    const hasMultipleImages = activeGalleryImages.length > 1;
    if (lightboxPrevious) lightboxPrevious.hidden = !hasMultipleImages;
    if (lightboxNext) lightboxNext.hidden = !hasMultipleImages;
}

function openLightbox(image) {
    if (!lightbox || !lightboxImage) return;

    activeGalleryImages = getVisibleGalleryImages();
    activeGalleryIndex = activeGalleryImages.indexOf(image);
    if (activeGalleryIndex < 0) activeGalleryIndex = 0;
    previouslyFocusedElement = document.activeElement;

    updateLightboxImage(activeGalleryIndex);
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (closeLightbox && typeof closeLightbox.focus === "function") {
        closeLightbox.focus();
    }
}

function closeLightboxModal() {
    if (!lightbox) return;

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === "function") {
        previouslyFocusedElement.focus();
    }
}

function navigateLightbox(direction) {
    if (!lightbox?.classList.contains("active")) return;
    updateLightboxImage(activeGalleryIndex + direction);
}

galleryImages.forEach((image) => {
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `View larger: ${image.alt || "gallery photo"}`);

    image.addEventListener("click", () => openLightbox(image));

    image.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(image);
        }
    });
});

if (closeLightbox) {
    closeLightbox.addEventListener("click", closeLightboxModal);
}

if (lightboxPrevious) {
    lightboxPrevious.addEventListener("click", () => navigateLightbox(-1));
}

if (lightboxNext) {
    lightboxNext.addEventListener("click", () => navigateLightbox(1));
}

if (lightbox) {
    lightbox.setAttribute("aria-hidden", "true");

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightboxModal();
        }
    });

    lightbox.addEventListener("touchstart", (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    lightbox.addEventListener("touchend", (event) => {
        const touch = event.changedTouches[0];
        const distanceX = touch.clientX - touchStartX;
        const distanceY = touch.clientY - touchStartY;

        if (Math.abs(distanceX) > 50 && Math.abs(distanceX) > Math.abs(distanceY)) {
            navigateLightbox(distanceX < 0 ? 1 : -1);
        }
    }, { passive: true });
}

document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("active")) return;

    if (e.key === "Escape") closeLightboxModal();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);

    if (e.key === "Tab") {
        const controls = [closeLightbox, lightboxPrevious, lightboxNext]
            .filter((control) => control && !control.hidden);
        if (!controls.length) return;

        const firstControl = controls[0];
        const lastControl = controls[controls.length - 1];

        if (e.shiftKey && document.activeElement === firstControl) {
            e.preventDefault();
            lastControl.focus();
        } else if (!e.shiftKey && document.activeElement === lastControl) {
            e.preventDefault();
            firstControl.focus();
        }
    }
});


// ===========================
// Gallery Filters
// ===========================

const filterButtons = document.querySelectorAll(".gallery-filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item[data-category]");
const galleryCategories = document.querySelectorAll(".gallery-category[data-category]");

if (filterButtons.length && (galleryCategories.length || galleryItems.length)) {
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.getAttribute("data-filter") || "all";

            filterButtons.forEach((btn) => {
                btn.classList.remove("is-active");
                btn.setAttribute("aria-pressed", "false");
            });

            button.classList.add("is-active");
            button.setAttribute("aria-pressed", "true");

            if (galleryCategories.length) {
                galleryCategories.forEach((categorySection) => {
                    const category = categorySection.getAttribute("data-category");
                    const match = filter === "all" || category === filter;

                    categorySection.hidden = !match;
                    categorySection.classList.remove("is-filter-visible");

                    if (match) {
                        requestAnimationFrame(() => {
                            categorySection.classList.add("is-filter-visible");
                        });
                    }
                });
            } else {
                galleryItems.forEach((item) => {
                    const category = item.getAttribute("data-category");
                    const match = filter === "all" || category === filter;
                    item.hidden = !match;
                });
            }
        });
    });
}


// ===========================
// Current Page Navigation
// ===========================

(function highlightCurrentNav() {
    const links = document.querySelectorAll(".nav-links a");
    if (!links.length) return;

    const path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const current = path === "" || path === "/" ? "index.html" : path;

    links.forEach((link) => {
        const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
        const isActive = href === current || (current === "index.html" && (href === "" || href === "index.html"));

        link.classList.toggle("is-active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
})();


// ===========================
// Navbar + Hero Parallax (rAF)
// ===========================

const navbar = document.querySelector(".navbar");
const parallaxHeroes = prefersReducedMotion
    ? []
    : Array.from(document.querySelectorAll(".hero-parallax, .hero, .gallery-hero, .about-hero, .contact-hero, .location-hero, .menu-header"));

let ticking = false;

function updateScrollPolish() {
    ticking = false;

    if (navbar) {
        navbar.classList.toggle("navbar-scrolled", window.scrollY > 60);
    }

    if (!parallaxHeroes.length) return;

    const viewportHeight = window.innerHeight || 1;

    parallaxHeroes.forEach((hero) => {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportHeight) return;

        const offset = Math.round(rect.top * -0.22);
        hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
    });
}

function onScrollPolish() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollPolish);
}

window.addEventListener("scroll", onScrollPolish, { passive: true });
updateScrollPolish();


// ===========================
// Open Today Badges
// ===========================

(function updateOpenTodayBadges() {
    const badges = document.querySelectorAll("#visit-open-badge, #footer-open-badge, .footer-open-badge");
    if (!badges.length) return;

    // Business hours: Mon–Sat 8:00 AM – 3:00 PM (America/New_York)
    const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const day = now.getDay(); // 0 = Sunday
    const minutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = 8 * 60;
    const closeMinutes = 15 * 60;
    const isOpenDay = day >= 1 && day <= 6;
    const isOpenNow = isOpenDay && minutes >= openMinutes && minutes < closeMinutes;

    if (!isOpenNow) return;

    badges.forEach((badge) => {
        badge.hidden = false;
    });
})();


// ===========================
// Floating Order Online Button
// ===========================

(function initFloatingOrderButton() {
    if (document.querySelector(".floating-order")) return;

    const orderUrl = "https://www.doordash.com/store/the-olive-branch-cafe-beaufort-40457383/100261758/";
    const button = document.createElement("a");

    button.className = "floating-order";
    button.href = orderUrl;
    button.target = "_blank";
    button.rel = "noopener noreferrer";
    button.setAttribute("aria-label", "Order Online from The Olive Branch Cafe");
    button.innerHTML = `
        <span class="floating-order-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6.5 8.5h11l-.8 10.2a1.6 1.6 0 0 1-1.6 1.5H9a1.6 1.6 0 0 1-1.6-1.5L6.5 8.5Z"/>
                <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>
            </svg>
        </span>
        <span>Order Online</span>
    `;

    document.body.appendChild(button);

    const showAt = 250;
    let floatingTick = false;

    function syncFloatingVisibility() {
        floatingTick = false;
        button.classList.toggle("is-visible", window.scrollY > showAt);
    }

    function onFloatingScroll() {
        if (floatingTick) return;
        floatingTick = true;
        requestAnimationFrame(syncFloatingVisibility);
    }

    window.addEventListener("scroll", onFloatingScroll, { passive: true });
    syncFloatingVisibility();

    // Mobile: one gentle pulse after ~9s of inactivity (once per page load)
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile || prefersReducedMotion) return;

    let pulsed = false;
    let idleTimer = null;

    function clearIdle() {
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }
    }

    function teardownIdleWatch() {
        clearIdle();
        ["scroll", "touchstart", "pointerdown", "keydown"].forEach((eventName) => {
            window.removeEventListener(eventName, onActivity);
        });
    }

    function schedulePulse() {
        if (pulsed) return;
        clearIdle();

        if (!button.classList.contains("is-visible")) return;

        idleTimer = setTimeout(() => {
            if (pulsed || !button.classList.contains("is-visible")) return;

            pulsed = true;
            button.classList.add("is-pulsing");

            const endPulse = () => {
                button.classList.remove("is-pulsing");
                button.removeEventListener("animationend", endPulse);
            };

            button.addEventListener("animationend", endPulse);
            teardownIdleWatch();
        }, 9000);
    }

    function onActivity() {
        if (pulsed) return;
        schedulePulse();
    }

    ["scroll", "touchstart", "pointerdown", "keydown"].forEach((eventName) => {
        window.addEventListener(eventName, onActivity, { passive: true });
    });

    // Start countdown once the button first becomes visible
    const visibilityWatcher = new MutationObserver(() => {
        if (button.classList.contains("is-visible")) {
            schedulePulse();
            visibilityWatcher.disconnect();
        }
    });

    visibilityWatcher.observe(button, { attributes: true, attributeFilter: ["class"] });

    if (button.classList.contains("is-visible")) {
        schedulePulse();
    }
})();
