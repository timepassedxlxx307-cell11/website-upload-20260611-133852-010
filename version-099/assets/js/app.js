(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobilePanel.hasAttribute("hidden") === false;
      if (isOpen) {
        mobilePanel.setAttribute("hidden", "");
        menuButton.setAttribute("aria-expanded", "false");
      } else {
        mobilePanel.removeAttribute("hidden");
        menuButton.setAttribute("aria-expanded", "true");
      }
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        activate(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activate(current + 1);
        restart();
      });
    }

    activate(0);
    play();
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var globalSearch = document.querySelector(".global-search-input");
  if (globalSearch && query) {
    globalSearch.value = query;
  }

  function filterList(input, list) {
    var value = input.value.trim().toLowerCase();
    var items = Array.prototype.slice.call(list.querySelectorAll(".search-item"));
    items.forEach(function (item) {
      var searchText = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
      item.classList.toggle("is-filtered-out", value && searchText.indexOf(value) === -1);
    });
  }

  var searchableList = document.querySelector(".searchable-list");
  var inlineFilter = document.querySelector(".inline-filter");
  if (searchableList && inlineFilter) {
    inlineFilter.addEventListener("input", function () {
      filterList(inlineFilter, searchableList);
    });
  }

  if (searchableList && globalSearch) {
    globalSearch.addEventListener("input", function () {
      filterList(globalSearch, searchableList);
    });
    if (query) {
      filterList(globalSearch, searchableList);
    }
  }
})();
