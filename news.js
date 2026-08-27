/* MZ Moldova, încărcarea noutăților și randarea carousel-ului */
(function(){
  "use strict";

  var MONTHS = ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"];

  function formatDate(iso){
    var d = new Date(iso + "T00:00:00");
    if(isNaN(d.getTime())) return iso;
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  function isNewItem(dateStr){
    var itemDate = new Date(dateStr + "T00:00:00");
    if(isNaN(itemDate.getTime())) return false;
    var now = new Date();
    var todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var diffDays = Math.round((todayMidnight - itemDate) / 86400000);
    return diffDays >= 0 && diffDays < 2;
  }

  function slugify(str){
    return str.toString().toLowerCase()
      .replace(/[ăâ]/g,"a").replace(/î/g,"i").replace(/ș/g,"s").replace(/ț/g,"t")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/(^-|-$)/g,"");
  }

  function load(){
    return fetch("news.json", {cache:"no-store"}).then(function(res){
      if(!res.ok) throw new Error("Nu am putut încărca noutățile.");
      return res.json();
    }).then(function(items){
      return items.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
    });
  }

  window.MZNews = {formatDate:formatDate, slugify:slugify, load:load};

  /* ---------- construiește carousel-ul de pe pagina principală, dacă există ---------- */
  document.addEventListener("DOMContentLoaded", function(){
    var track = document.getElementById("news-track");
    if(!track) return;

    load().then(function(items){
      renderCarousel(track, items.slice(0, 7));
    }).catch(function(err){
      track.innerHTML = '<div class="slide active"><div class="slide-bg poster-1"></div>' +
        '<div class="slide-body"><h3>Nu am putut încărca noutățile</h3><p>' + escapeHtml(err.message || "") + '</p></div></div>';
    });
  });

  function renderCarousel(track, items){
    var root = document.getElementById("news-carousel");
    var dotsWrap = root.querySelector(".carousel-dots");
    if(!items.length){
      track.innerHTML = '<div class="slide active"><div class="slide-bg poster-1"></div>' +
        '<div class="slide-body"><h3>Nicio noutate momentan</h3><p>Revino curând.</p></div></div>';
      return;
    }

    track.innerHTML = items.map(function(item, idx){
      var hasPhoto = !!item.image;
      var bgStyle = hasPhoto ? ' style="background-image:url(\'' + item.image + '\')"' : "";
      return (
        '<div class="slide' + (idx===0 ? " active" : "") + (hasPhoto ? " has-photo" : "") + '" data-slug="' + item.slug + '">' +
          '<div class="slide-bg ' + (hasPhoto ? "" : (item.poster || "poster-1")) + '"' + bgStyle + '></div>' +
          '<div class="slide-icon">' + (item.icon || "⚽") + '</div>' +
          (isNewItem(item.date) ? '<div class="slide-badge-new">NEW</div>' : '') +
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
        var item = items.filter(function(i){ return i.slug === slide.getAttribute("data-slug"); })[0];
        if(item) openArticleModal(item);
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
    var interval = parseInt(root.getAttribute("data-interval") || "3200", 10);

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
      d.addEventListener("click", function(e){ e.stopPropagation(); go(idx); reset(); });
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

  /* ---------- deschide noutatea întreagă în modal, fără să schimbe pagina ---------- */
  function openArticleModal(item){
    if(!window.MZModal) return;
    var hasPhoto = !!item.image;
    var bannerInner = hasPhoto
      ? '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">'
      : escapeHtml(item.icon || "⚽");
    var bannerClass = "site-modal-banner" + (hasPhoto ? "" : (" " + (item.poster || "poster-1")));

    var html =
      '<div class="' + bannerClass + '">' + bannerInner + '</div>' +
      '<div class="site-modal-body">' +
        '<div class="eyebrow">Noutăți</div>' +
        '<h3 class="site-modal-title">' + escapeHtml(item.title) + '</h3>' +
        '<p class="site-modal-subtitle">' + escapeHtml(item.subtitle || "") + '</p>' +
        '<div class="site-modal-meta"><span>' + formatDate(item.date) + '</span><span class="dot"></span><span>' + escapeHtml(item.author || "Echipa MZ Moldova") + '</span></div>' +
        '<div class="prose" style="margin-top:22px;">' +
          (item.content || []).map(function(p){ return "<p>" + escapeHtml(p) + "</p>"; }).join("") +
        '</div>' +
      '</div>';

    window.MZModal.open(html);
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }
})();
