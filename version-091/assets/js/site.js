(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupImageFallback() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      }, { once: true });
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var search = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var category = scope.querySelector("[data-category-filter]");
      var empty = scope.querySelector("[data-empty-state]");

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function apply() {
        var keyword = valueOf(search);
        var yearValue = valueOf(year);
        var typeValue = valueOf(type);
        var categoryValue = valueOf(category);
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-index") || "").toLowerCase();
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesYear = !yearValue || String(card.getAttribute("data-year")) === yearValue;
          var matchesType = !typeValue || String(card.getAttribute("data-type")).toLowerCase() === typeValue;
          var matchesCategory = !categoryValue || String(card.getAttribute("data-category")) === categoryValue;
          var matched = matchesKeyword && matchesYear && matchesType && matchesCategory;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, year, type, category].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
    });
  }

  function setupPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      if (!video || !overlay) {
        return;
      }
      var sourceNode = video.querySelector("source");
      var source = sourceNode ? sourceNode.getAttribute("src") : video.getAttribute("src");
      var hlsInstance = null;

      function startPlayback() {
        overlay.classList.add("is-hidden");
        if (!source) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (video.getAttribute("src") !== source) {
            video.setAttribute("src", source);
          }
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          }
          video.play().catch(function () {});
          return;
        }
        video.setAttribute("src", source);
        video.play().catch(function () {});
      }

      overlay.addEventListener("click", startPlayback);
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
    });
  }

  onReady(function () {
    setupMenu();
    setupImageFallback();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
})();
