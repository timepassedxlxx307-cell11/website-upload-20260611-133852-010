function selectAll(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function setupHeader() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var searchButton = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  if (searchButton && searchPanel) {
    searchButton.addEventListener('click', function () {
      searchPanel.classList.toggle('open');
      var input = searchPanel.querySelector('input');
      if (searchPanel.classList.contains('open') && input) {
        input.focus();
      }
    });
  }
}

function setupHeroCarousel() {
  var hero = document.querySelector('[data-hero-carousel]');
  if (!hero) {
    return;
  }

  var slides = selectAll('[data-hero-slide]', hero);
  var dots = selectAll('[data-hero-dot]', hero);
  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
      dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
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
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      show(index);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupPageFilter() {
  var input = document.querySelector('[data-page-filter]');
  var cards = selectAll('.searchable-card');
  if (!input || !cards.length) {
    return;
  }

  input.addEventListener('input', function () {
    var query = input.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      card.style.display = haystack.indexOf(query) === -1 ? 'none' : '';
    });
  });
}

function setupSearchPage() {
  var root = document.querySelector('[data-search-results]');
  if (!root || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = document.querySelector('[data-search-input]');
  if (input) {
    input.value = query;
  }

  var normalized = query.toLowerCase();
  var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
    if (!normalized) {
      return true;
    }
    return [movie.title, movie.region, movie.year, movie.type, movie.tags].join(' ').toLowerCase().indexOf(normalized) !== -1;
  }).slice(0, 240);

  if (!results.length) {
    root.innerHTML = '<div class="search-results-empty">没有找到匹配内容，请尝试更换关键词。</div>';
    return;
  }

  root.innerHTML = results.map(function (movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <div class="movie-poster">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="movie-year">' + escapeHtml(movie.year) + '</span>',
      '      <span class="movie-play">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-meta-row">',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '        <strong>' + escapeHtml(movie.region) + '</strong>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('
');
  }).join('
');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setupVideoPlayer(videoId, overlayId, buttonId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var isReady = false;

  if (!video || !source) {
    return;
  }

  function bindSource() {
    if (isReady) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      isReady = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      isReady = true;
      return;
    }

    video.src = source;
    isReady = true;
  }

  function beginPlayback() {
    bindSource();
    if (overlay) {
      overlay.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', beginPlayback);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      beginPlayback();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupHeader();
  setupHeroCarousel();
  setupPageFilter();
  setupSearchPage();
});
