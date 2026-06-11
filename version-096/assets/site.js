(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var scope = panel.parentElement || document;
        var input = panel.querySelector('[data-search-input]');
        var year = panel.querySelector('[data-year-filter]');
        var type = panel.querySelector('[data-type-filter]');
        var reset = panel.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

        function applyFilter() {
            var text = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';

            cards.forEach(function (card) {
                var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var textMatch = !text || keywords.indexOf(text) !== -1;
                var yearMatch = true;
                var typeMatch = true;

                if (yearValue) {
                    if (yearValue === '2022') {
                        yearMatch = Number(cardYear) <= 2022;
                    } else {
                        yearMatch = cardYear === yearValue;
                    }
                }

                if (typeValue) {
                    typeMatch = cardType.indexOf(typeValue) !== -1 || keywords.indexOf(typeValue.toLowerCase()) !== -1;
                }

                card.classList.toggle('is-hidden', !(textMatch && yearMatch && typeMatch));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (year) {
            year.addEventListener('change', applyFilter);
        }

        if (type) {
            type.addEventListener('change', applyFilter);
        }

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (type) {
                    type.value = '';
                }
                applyFilter();
            });
        }
    });
})();
