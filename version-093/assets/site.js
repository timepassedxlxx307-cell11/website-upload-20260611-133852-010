(function () {
  var header = document.querySelector("[data-header]");
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 50) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
    var prev = slider.querySelector("[data-slide-prev]");
    var next = slider.querySelector("[data-slide-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        schedule();
      });
    });

    if (slides.length > 1) {
      schedule();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilterPanel() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var year = panel.querySelector("[data-year-filter]");
    var region = panel.querySelector("[data-region-filter]");
    var type = panel.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");

    function apply() {
      var keyword = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        var matchRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
        var matchType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
        var show = matchKeyword && matchYear && matchRegion && matchType;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initSearchPage() {
    var grid = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-page-input]");
    if (!grid) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");

    if (input) {
      input.value = query;
      input.addEventListener("input", function () {
        apply(input.value);
      });
    }

    function apply(value) {
      var keyword = normalize(value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var show = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    apply(query);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeroSlider();
    initFilterPanel();
    initSearchPage();
  });
})();
