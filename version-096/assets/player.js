(function () {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-overlay');
        var message = shell.querySelector('.player-message');
        var streamUrl = shell.getAttribute('data-play');
        var hlsInstance = null;
        var initialized = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function attachVideo() {
            if (!video || !streamUrl || initialized) {
                return;
            }
            initialized = true;
            shell.classList.add('is-playing');
            video.setAttribute('controls', 'controls');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setMessage('播放暂时不可用');
                    }
                });
            } else {
                video.src = streamUrl;
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setMessage('点击视频继续播放');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                attachVideo();
            });
        }

        shell.addEventListener('click', function () {
            if (!initialized) {
                attachVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
