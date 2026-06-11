(function () {
  function initMoviePlayer(source) {
    var video = document.getElementById('videoPlayer');
    var cover = document.getElementById('playerCover');

    if (!video || !cover || !source) {
      return;
    }

    var ready = false;

    function attachSource() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function playVideo() {
      attachSource();
      cover.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    cover.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
      if (!ready) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
