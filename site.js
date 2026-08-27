/* ManagerZone Moldova — shared site behaviour */
(function(){
  "use strict";

  document.addEventListener("DOMContentLoaded", function(){
    initNavToggle();
    initActiveNav();
    initReveal();
    initYear();
    initCarousels();
    initLightbox();
    initContactForm();
  });

  /* ---------- mobile nav ---------- */
  function initNavToggle(){
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if(!toggle || !nav) return;
    toggle.addEventListener("click", function(){
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ nav.classList.remove("open"); });
    });
  }

  /* ---------- highlight nav link matching scroll position ---------- */
  function initActiveNav(){
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
    if(!links.length) return;
    var sections = links.map(function(l){
      var id = l.getAttribute("href").slice(1);
      return document.getElementById(id);
    }).filter(Boolean);
    if(!sections.length) return;

    function onScroll(){
      var y = window.scrollY + 120;
      var current = sections[0];
      sections.forEach(function(s){ if(s.offsetTop <= y) current = s; });
      links.forEach(function(l){
        l.classList.toggle("active", l.getAttribute("href") === "#" + current.id);
      });
    }
    window.addEventListener("scroll", onScroll, {passive:true});
    onScroll();
  }

  /* ---------- scroll reveal ---------- */
  function initReveal(){
    var items = document.querySelectorAll(".reveal, .reveal-scale");
    if(!items.length) return;
    if(!("IntersectionObserver" in window)){
      items.forEach(function(el){ el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15, rootMargin:"0px 0px -60px 0px"});
    items.forEach(function(el){ io.observe(el); });
  }

  function initYear(){
    document.querySelectorAll("[data-year]").forEach(function(el){
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- carousel ---------- */
  function initCarousels(){
    document.querySelectorAll("[data-carousel]").forEach(function(root){
      var track = root.querySelector(".carousel-track");
      var slides = Array.prototype.slice.call(root.querySelectorAll(".slide"));
      var dotsWrap = root.querySelector(".carousel-dots");
      if(!slides.length) return;
      var i = 0;
      var timer = null;
      var interval = parseInt(root.getAttribute("data-interval") || "5500", 10);

      if(dotsWrap){
        dotsWrap.innerHTML = "";
        slides.forEach(function(_, idx){
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", "Slide " + (idx+1));
          b.addEventListener("click", function(){ go(idx); reset(); });
          dotsWrap.appendChild(b);
        });
      }
      var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

      function go(n){
        slides[i].classList.remove("active");
        if(dots[i]) dots[i].classList.remove("active");
        i = (n + slides.length) % slides.length;
        slides[i].classList.add("active");
        if(dots[i]) dots[i].classList.add("active");
      }
      function next(){ go(i+1); }
      function prev(){ go(i-1); }
      function reset(){
        if(timer) clearInterval(timer);
        timer = setInterval(next, interval);
      }

      var nextBtn = root.querySelector(".carousel-arrow.next");
      var prevBtn = root.querySelector(".carousel-arrow.prev");
      if(nextBtn) nextBtn.addEventListener("click", function(e){ e.stopPropagation(); next(); reset(); });
      if(prevBtn) prevBtn.addEventListener("click", function(e){ e.stopPropagation(); prev(); reset(); });

      root.addEventListener("mouseenter", function(){ if(timer) clearInterval(timer); });
      root.addEventListener("mouseleave", reset);

      go(0);
      reset();
    });
  }

  /* ---------- lightbox (offline meets gallery) ---------- */
  function initLightbox(){
    var lightbox = document.querySelector("[data-lightbox]");
    if(!lightbox) return;
    var visual = lightbox.querySelector(".lightbox-visual");
    var title = lightbox.querySelector(".lightbox-info h4");
    var desc = lightbox.querySelector(".lightbox-info p");
    var closeBtn = lightbox.querySelector(".lightbox-close");

    document.querySelectorAll(".gallery-item").forEach(function(item){
      item.addEventListener("click", function(){
        var tile = item.querySelector(".tile");
        visual.className = "lightbox-visual " + (tile ? tile.className.replace("tile","").trim() : "");
        visual.textContent = tile ? tile.textContent : "";
        title.textContent = item.getAttribute("data-title") || "";
        desc.textContent = item.getAttribute("data-desc") || "";
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });

    function close(){
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }
    if(closeBtn) closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", function(e){
      if(e.target === lightbox) close();
    });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") close();
    });
  }

  /* ---------- contact form -> mailto ---------- */
  function initContactForm(){
    var form = document.querySelector("[data-contact-form]");
    if(!form) return;
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var name = form.querySelector("[name=name]").value.trim();
      var email = form.querySelector("[name=email]").value.trim();
      var message = form.querySelector("[name=message]").value.trim();
      var subject = encodeURIComponent("Mesaj de la " + (name || "vizitator") + " — MZ Moldova");
      var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:mzmoldova@outlook.com?subject=" + subject + "&body=" + body;
    });
  }
})();
