(function () {
  function attachStream(video, streamUrl) {
    if (video.dataset.ready === "1") {
      return;
    }

    video.dataset.ready = "1";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }

    video.src = streamUrl;
  }

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var streamUrl = player.getAttribute("data-stream");

    if (!video || !streamUrl) {
      return;
    }

    function start() {
      attachStream(video, streamUrl);
      player.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    player.addEventListener("click", function (event) {
      if (event.target === video && player.classList.contains("is-playing")) {
        return;
      }

      start();
    });

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
})();
