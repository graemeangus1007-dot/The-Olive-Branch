// Mobile Menu

const toggle = document.getElementById("menu-toggle");
const nav = document.querySelector(".nav-links");

if (toggle) {
    toggle.addEventListener("click", () => {
        nav.classList.toggle("active");
    });
}


// Fade In Animation

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

},{
    threshold:0.2
});


document.querySelectorAll(".fade-in").forEach(el=>{

    observer.observe(el);

});
// ===========================
// Gallery Lightbox
// ===========================

const galleryImages = document.querySelectorAll(".gallery-grid img");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeLightbox = document.querySelector(".close-lightbox");

galleryImages.forEach(image => {

    image.addEventListener("click", () => {

        lightbox.classList.add("active");
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;

    });

});

closeLightbox.addEventListener("click", () => {

    lightbox.classList.remove("active");

});

lightbox.addEventListener("click", (e) => {

    if (e.target === lightbox) {

        lightbox.classList.remove("active");

    }

});
// ===========================
// Shrink Navigation on Scroll
// ===========================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        navbar.classList.add("navbar-scrolled");

    } else {

        navbar.classList.remove("navbar-scrolled");

    }

});