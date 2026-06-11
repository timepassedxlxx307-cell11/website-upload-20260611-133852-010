import { H as Hls } from "./video-player-dru42stk.js";

function playShell(shell) {
  var video = shell.querySelector("video");
  var source = shell.getAttribute("data-source");

  if (!video || !source) {
    return;
  }

  if (!shell.dataset.ready) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      shell.hlsInstance = hls;
    } else {
      video.src = source;
    }
    shell.dataset.ready = "true";
  }

  shell.classList.add("playing");
  video.controls = true;
  var promise = video.play();
  if (promise && typeof promise.catch === "function") {
    promise.catch(function () {
      shell.classList.remove("playing");
    });
  }
}

function initPlayers() {
  var shells = Array.prototype.slice.call(
    document.querySelectorAll(".player-shell"),
  );
  shells.forEach(function (shell) {
    var button = shell.querySelector(".play-button");
    var video = shell.querySelector("video");

    shell.addEventListener("click", function () {
      playShell(shell);
    });

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        playShell(shell);
      });
    }

    if (video) {
      video.addEventListener("play", function () {
        shell.classList.add("playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove("playing");
        }
      });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPlayers);
} else {
  initPlayers();
}
