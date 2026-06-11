(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function matchesYear(cardYear, value) {
    var year = Number(cardYear || 0);
    if (!value || value === '全部年份') {
      return true;
    }
    if (value === '2010-2019') {
      return year >= 2010 && year <= 2019;
    }
    if (value === '2000-2009') {
      return year >= 2000 && year <= 2009;
    }
    if (value === '1990以前') {
      return year > 0 && year < 1990;
    }
    return String(year) === value;
  }

  function setupFilters() {
    var input = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var container = document.querySelector('[data-card-container]');
    var empty = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    if (!cards.length) {
      return;
    }

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '全部类型';
      var yearValue = yearSelect ? yearSelect.value : '全部年份';
      var visible = 0;

      cards.forEach(function (card) {
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var okKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
        var okType = !typeValue || typeValue === '全部类型' || cardType.indexOf(typeValue) !== -1;
        var okYear = matchesYear(cardYear, yearValue);
        var show = okKeyword && okType && okYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    function sortCards() {
      if (!container || !sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        var aYear = Number(a.getAttribute('data-year') || 0);
        var bYear = Number(b.getAttribute('data-year') || 0);
        var aScore = Number(a.getAttribute('data-score') || 0);
        var bScore = Number(b.getAttribute('data-score') || 0);
        var aTitle = a.getAttribute('data-title') || '';
        var bTitle = b.getAttribute('data-title') || '';
        if (mode === 'year-asc') {
          return aYear - bYear;
        }
        if (mode === 'year-desc') {
          return bYear - aYear;
        }
        if (mode === 'title') {
          return aTitle.localeCompare(bTitle, 'zh-CN');
        }
        return bScore - aScore;
      });
      sorted.forEach(function (card) {
        container.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
      sortCards();
    } else {
      apply();
    }
  }

  function setupImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      }, { once: true });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-button]');
      var status = player.querySelector('[data-player-status]');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-src');
      var hls = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        if (!source) {
          setStatus('暂无片源');
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('准备播放');
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('正在重新连接');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('正在恢复播放');
              hls.recoverMediaError();
            } else {
              setStatus('播放加载失败');
              hls.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('准备播放');
        } else {
          video.src = source;
          setStatus('点击播放');
        }
        video.controls = true;
      }

      function playOrPause() {
        if (video.paused) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              setStatus('再次点击播放');
            });
          }
        } else {
          video.pause();
        }
      }

      attachSource();

      if (button) {
        button.addEventListener('click', playOrPause);
      }
      video.addEventListener('click', playOrPause);
      video.addEventListener('play', function () {
        player.classList.add('playing');
        setStatus('播放中');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('playing');
        setStatus('已暂停');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupImages();
    setupPlayers();
  });
})();
