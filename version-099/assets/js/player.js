(function () {
  var video = document.querySelector(".media-player");
  var overlay = document.querySelector(".player-overlay");

  if (!video || !overlay) {
    return;
  }

  var stream = video.getAttribute("data-stream");
  var hasAttached = false;

  function attach() {
    if (hasAttached || !stream) {
      return;
    }
    hasAttached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  }

  function start() {
    attach();
    overlay.classList.add("is-hidden");
    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });
})();
