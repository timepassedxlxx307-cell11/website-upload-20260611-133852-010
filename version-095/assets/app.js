(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var showcase = document.querySelector('[data-showcase]');

  if (showcase) {
    var slides = Array.prototype.slice.call(showcase.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(showcase.querySelectorAll('[data-slide-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(nextSlide, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var nextButton = showcase.querySelector('[data-slide-next]');
    var prevButton = showcase.querySelector('[data-slide-prev]');

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        nextSlide();
        startTimer();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-dot')) || 0);
        startTimer();
      });
    });

    showcase.addEventListener('mouseenter', stopTimer);
    showcase.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-page-search]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var filterAreas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
  var activeChip = '';

  function applyFilter() {
    var query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var chip = normalize(activeChip);

    filterAreas.forEach(function (area) {
      var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card, .rank-row'));

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesChip = !chip || text.indexOf(chip) !== -1;
        card.classList.toggle('hidden-by-search', !(matchesQuery && matchesChip));
      });
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeChip = chip.getAttribute('data-filter-chip') || '';
      chips.forEach(function (item) {
        item.classList.toggle('active', item === chip && activeChip !== '');
      });
      applyFilter();
    });
  });
})();
