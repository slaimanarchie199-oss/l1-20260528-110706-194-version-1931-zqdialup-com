(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  var currentSlide = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    setSlide(0);
    window.setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5200);
  }

  var localSearch = document.querySelector("[data-local-search]");
  var localRegion = document.querySelector("[data-region-filter]");
  var localType = document.querySelector("[data-type-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var emptyState = document.querySelector("[data-empty-state]");

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(localSearch && localSearch.value);
    var region = normalize(localRegion && localRegion.value);
    var type = normalize(localType && localType.value);
    var visible = 0;

    cards.forEach(function (card) {
      var searchable = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardType = normalize(card.getAttribute("data-type"));
      var matched = true;

      if (keyword && searchable.indexOf(keyword) === -1) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? "none" : "block";
    }
  }

  [localSearch, localRegion, localType].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q");

  if (initialQuery && localSearch) {
    localSearch.value = initialQuery;
  }

  applyFilters();
})();
