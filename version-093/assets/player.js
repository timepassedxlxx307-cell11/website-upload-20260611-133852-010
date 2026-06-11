function createMoviePlayer(videoId, coverId, source) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var hlsInstance = null;

  if (!video || !cover || !source) {
    return;
  }

  function attachSource() {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.getAttribute("src") !== source) {
        video.setAttribute("src", source);
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
    } else if (video.getAttribute("src") !== source) {
      video.setAttribute("src", source);
    }
  }

  function start() {
    attachSource();
    cover.classList.add("is-hidden");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });
}
