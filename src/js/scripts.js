'use strict';

let loadLazyLoadScript = false;

document.addEventListener('DOMContentLoaded', function () {
    lazyLoad();
    correctVh();
    initMobileMenu();
    animation();
}, false);

window.addEventListener('resize', function () {
    correctVh();
});

function correctVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
}

function lazyLoad() {
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img.lazyload');
        images.forEach(function (img) {
            img.src = img.dataset.src;
            img.onload = function () {
                img.classList.add('lazyloaded');
            };
        });
    } else {
        if (!loadLazyLoadScript) {
            loadLazyLoadScript = true;
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.2.0/lazysizes.min.js';
            document.body.appendChild(script);
        }
        document.addEventListener('lazyloaded', function (e) {
            const img = e.target;
        });
    }
}
function initMobileMenu() {
    const btnMenu = document.querySelectorAll('#open_menu');

    Array.from(btnMenu).forEach(function (item) {
        const pushClass = 'push';
        const html = document.getElementsByTagName('html')[0];
        const navbar = document.querySelector('.nav-bar');
        if(item) {
            item.onclick = function (e) {
                e.preventDefault();
                if (!html.classList.contains(pushClass)) {
                    html.classList.add(pushClass);
                } else {
                    html.classList.remove(pushClass);
                }
            }
        }

        if(navbar) {
            document.addEventListener('click', function(event) {
                const isClickInside = navbar.contains(event.target);
                const isClickBtn = item.contains(event.target);
                if (!isClickInside && !isClickBtn) {
                    html.classList.remove(pushClass);

                }
            });
        }
    });
}
function animation() {
    let animation = document.querySelectorAll('[data-animation]');

    function run() {
        Array.from(animation).forEach(function(item) {
            let offset = item.getBoundingClientRect().top + window.scrollY;
            let scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
            let vh = window.innerHeight;

            if(item) {
                if(offset < (scrollPosition + vh)) {
                    item.classList.add('is-inview');
                }
            }
        });
    }

    window.addEventListener('load', run);
    window.addEventListener('scroll', run);
}
