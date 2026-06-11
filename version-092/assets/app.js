function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
}

function setupMobileNav() {
    var toggle = document.querySelector('.menu-toggle');
    var mobile = document.querySelector('.mobile-nav');
    if (!toggle || !mobile) {
        return;
    }
    toggle.addEventListener('click', function () {
        var open = mobile.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
}

function setupHero() {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (!slides.length) {
        return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }
    function restart() {
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(function () {
            show(current + 1);
        }, 5200);
    }
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(parseInt(dot.getAttribute('data-hero-index') || '0', 10));
            restart();
        });
    });
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    if (prev) {
        prev.addEventListener('click', function () {
            show(current - 1);
            restart();
        });
    }
    if (next) {
        next.addEventListener('click', function () {
            show(current + 1);
            restart();
        });
    }
    restart();
}

function setupFilters() {
    var cards = selectAll('.movie-card');
    if (!cards.length) {
        return;
    }
    var search = document.querySelector('.site-search');
    var year = document.querySelector('.filter-year');
    var type = document.querySelector('.filter-type');
    var empty = document.querySelector('.empty-result');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (search && q) {
        search.value = q;
    }
    function matchYear(card, value) {
        if (!value) {
            return true;
        }
        var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
        if (value === '2010') {
            return cardYear >= 2010 && cardYear < 2020;
        }
        if (value === '2000') {
            return cardYear >= 2000 && cardYear < 2010;
        }
        if (value === '1990') {
            return cardYear > 0 && cardYear < 2000;
        }
        return String(cardYear) === value;
    }
    function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var shown = 0;
        cards.forEach(function (card) {
            var text = card.textContent.toLowerCase() + ' ' + Array.prototype.map.call(card.attributes, function (attr) {
                return attr.value;
            }).join(' ').toLowerCase();
            var ok = (!keyword || text.indexOf(keyword) !== -1) && matchYear(card, yearValue) && (!typeValue || text.indexOf(typeValue.toLowerCase()) !== -1);
            card.hidden = !ok;
            if (ok) {
                shown += 1;
            }
        });
        if (empty) {
            empty.hidden = shown !== 0;
        }
    }
    if (search) {
        search.addEventListener('input', apply);
    }
    if (year) {
        year.addEventListener('change', apply);
    }
    if (type) {
        type.addEventListener('change', apply);
    }
    apply();
}

function loadExternalHls(callback) {
    if (window.Hls) {
        callback();
        return;
    }
    var existing = document.querySelector('script[data-hls-lib="ready"]');
    if (existing) {
        existing.addEventListener('load', callback, { once: true });
        return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-lib', 'ready');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
}

function startMoviePlayer(url) {
    var video = document.getElementById('video-player');
    var shell = document.querySelector('.player-shell');
    if (!video || !url) {
        return;
    }
    function playNow() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }
    function markPlaying() {
        if (shell) {
            shell.classList.add('is-playing');
        }
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.getAttribute('src') !== url) {
            video.src = url;
        }
        markPlaying();
        playNow();
        return;
    }
    loadExternalHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
            if (!video._siteHls) {
                video._siteHls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                video._siteHls.attachMedia(video);
            }
            video._siteHls.loadSource(url);
            markPlaying();
            video._siteHls.on(window.Hls.Events.MANIFEST_PARSED, playNow);
        } else {
            video.src = url;
            markPlaying();
            playNow();
        }
    });
}

window.startMoviePlayer = startMoviePlayer;

document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
});
