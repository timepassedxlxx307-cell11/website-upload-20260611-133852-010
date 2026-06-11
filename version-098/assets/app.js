(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(
      document.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll(".hero-dot"),
    );
    var next = document.querySelector(".hero-next");
    var prev = document.querySelector(".hero-prev");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startCarousel() {
      if (timer) {
        clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    if (slides.length) {
      showSlide(0);
      startCarousel();
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startCarousel();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startCarousel();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startCarousel();
      });
    });

    var searchForms = Array.prototype.slice.call(
      document.querySelectorAll("[data-home-search]"),
    );
    searchForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("data-target") || "search.html";
        window.location.href =
          target + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });

    var resultsNode = document.querySelector("[data-search-results]");
    if (resultsNode && Array.isArray(window.MOVIE_SEARCH_DATA)) {
      var queryInput = document.querySelector("[data-search-input]");
      var regionSelect = document.querySelector("[data-region-filter]");
      var typeSelect = document.querySelector("[data-type-filter]");
      var yearSelect = document.querySelector("[data-year-filter]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (queryInput) {
        queryInput.value = initialQuery;
      }

      function renderOptions(select, values) {
        if (!select) {
          return;
        }
        values.forEach(function (value) {
          var option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      }

      function uniqueValues(key) {
        var values = [];
        window.MOVIE_SEARCH_DATA.forEach(function (item) {
          var value = item[key];
          if (value && values.indexOf(value) === -1) {
            values.push(value);
          }
        });
        return values.slice(0, 80);
      }

      renderOptions(regionSelect, uniqueValues("region"));
      renderOptions(typeSelect, uniqueValues("type"));
      renderOptions(yearSelect, uniqueValues("year"));

      function itemMatches(item, query, region, type, year) {
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.line,
          item.category,
        ]
          .join(" ")
          .toLowerCase();
        return (
          (!query || haystack.indexOf(query.toLowerCase()) !== -1) &&
          (!region || item.region === region) &&
          (!type || item.type === type) &&
          (!year || item.year === year)
        );
      }

      function renderSearch() {
        var query = queryInput ? queryInput.value.trim() : "";
        var region = regionSelect ? regionSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var matches = window.MOVIE_SEARCH_DATA.filter(function (item) {
          return itemMatches(item, query, region, type, year);
        }).slice(0, 120);

        if (!matches.length) {
          resultsNode.innerHTML =
            '<div class="not-found">没有找到符合条件的影片</div>';
          return;
        }

        resultsNode.innerHTML = matches
          .map(function (item) {
            return (
              '<article class="movie-card">' +
              '<a class="card-cover" href="' +
              item.url +
              '">' +
              '<img src="' +
              item.cover +
              '" alt="' +
              escapeHtml(item.title) +
              '" loading="lazy">' +
              '<span class="play-badge">▶</span>' +
              "</a>" +
              '<div class="card-body">' +
              '<div class="card-meta"><span>' +
              escapeHtml(item.year) +
              "</span><span>" +
              escapeHtml(item.region) +
              "</span></div>" +
              '<h3><a href="' +
              item.url +
              '">' +
              escapeHtml(item.title) +
              "</a></h3>" +
              "<p>" +
              escapeHtml(item.line) +
              "</p>" +
              '<div class="tag-row"><span>' +
              escapeHtml(item.category) +
              "</span><span>" +
              escapeHtml(item.type) +
              "</span></div>" +
              "</div>" +
              "</article>"
            );
          })
          .join("");
      }

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      [queryInput, regionSelect, typeSelect, yearSelect].forEach(
        function (node) {
          if (node) {
            node.addEventListener("input", renderSearch);
            node.addEventListener("change", renderSearch);
          }
        },
      );

      renderSearch();
    }
  });
})();
