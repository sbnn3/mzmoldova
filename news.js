/* ManagerZone Moldova — news data loading + carousel rendering */
(function(){
  "use strict";

  var MONTHS = ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"];

  function formatDate(iso){
    var d = new Date(iso + "T00:00:00");
    if(isNaN(d.getTime())) return iso;
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  function slugify(str){
    return str.toString().toLowerCase()
      .replace(/[ăâ]/g,"a").replace(/î/g,"i").replace(/ș/g,"s").replace(/ț/g,"t")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/(^-|-$)/g,"");
  }

  function dataUrl(){
    // works whether the page lives at the site root or one level deep
    return "news.json";
  }

  function load(){
    return fetch(dataUrl(), {cache:"no-store"}).then(function(res){
      if(!res.ok) throw new Error("Nu am putut încărca noutățile.");
      return res.json();
    }).then(function(items){
      return items.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
    });
  }

  window.MZNews = {formatDate:formatDate, slugify:slugify, load:load};

  /* ---------- build the homepage carousel, if present ---------- */
  document.addEventListener("DOMContentLoaded", function(){
    var track = document.getElementById("news-track");
    if(!track) return;

    load().then(function(items){
      renderCarousel(track, items);
    }).catch(function(err){
      track.innerHTML = '<div class="slide active"><div class="slide-bg poster-1"></div>' +
        '<div class="slide-body"><h3>Nu am putut încărca noutățile</h3><p>' + (err.message || "") + '</p></div></div>';
    });
  });

  function renderCarousel(track, items){
    var root = document.getElementById("news-carousel");
    var dotsWrap = root.querySelector(".carousel-dots");
    if(!items.length){
      track.innerHTML = '<div class="slide active"><div class="slide-bg poster-1"></div>' +
        '<div class="slide-body"><h3>Nicio noutate momentan</h3><p>Reveniți curând.</p></div></div>';
      return;
    }

    track.innerHTML = items.map(function(item, idx){
      var hasPhoto = !!item.image;
      var bgStyle = hasPhoto ? ' style="background-image:url(\'' + item.image + '\')"' : "";
      return (
        '<div class="slide' + (idx===0 ? " active" : "") + (hasPhoto ? " has-photo" : "") + '" data-slug="' + item.slug + '">' +
          '<div class="slide-bg ' + (hasPhoto ? "" : (item.poster || "poster-1")) + '"' + bgStyle + '></div>' +
          '<div class="slide-icon">' + (item.icon || "⚽") + '</div>' +
          '<div class="slide-body">' +
            '<div class="slide-date">' + formatDate(item.date) + '</div>' +
            '<h3>' + escapeHtml(item.title) + '</h3>' +
            '<p>' + escapeHtml(item.subtitle || "") + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    var slides = Array.prototype.slice.call(track.querySelectorAll(".slide"));
    slides.forEach(function(slide){
      slide.addEventListener("click", function(){
        window.location.href = "news.html?slug=" + encodeURIComponent(slide.getAttribute("data-slug"));
      });
    });

    dotsWrap.innerHTML = "";
    slides.forEach(function(_, idx){
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Noutatea " + (idx+1));
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    var i = 0, timer = null;
    var interval = parseInt(root.getAttribute("data-interval") || "6000", 10);

    function go(n){
      slides[i].classList.remove("active");
      if(dots[i]) dots[i].classList.remove("active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("active");
      if(dots[i]) dots[i].classList.add("active");
    }
    function next(){ go(i+1); }
    function prev(){ go(i-1); }
    function reset(){ if(timer) clearInterval(timer); timer = setInterval(next, interval); }

    dots.forEach(function(d, idx){
      d.addEventListener("click", function(){ go(idx); reset(); });
    });
    var nextBtn = root.querySelector(".carousel-arrow.next");
    var prevBtn = root.querySelector(".carousel-arrow.prev");
    if(nextBtn) nextBtn.addEventListener("click", function(e){ e.stopPropagation(); next(); reset(); });
    if(prevBtn) prevBtn.addEventListener("click", function(e){ e.stopPropagation(); prev(); reset(); });

    root.addEventListener("mouseenter", function(){ if(timer) clearInterval(timer); });
    root.addEventListener("mouseleave", reset);

    go(0);
    reset();
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }
})();
