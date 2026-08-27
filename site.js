/* MZ Moldova, comportament comun al site-ului */
(function(){
  "use strict";

  document.addEventListener("DOMContentLoaded", function(){
    initNavToggle();
    initActiveNav();
    initReveal();
    initYear();
    initLightbox();
    initContactForm();
    initSiteModal();
    initLegalModals();
    initCookieBanner();
  });

  /* ---------- meniu mobil ---------- */
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

  /* ---------- evidențiază linkul din meniu în funcție de scroll ---------- */
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

  /* ---------- apariție treptată la scroll ---------- */
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

  /* ---------- lightbox pentru galeria Offline Meets ---------- */
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

  /* ---------- formular de contact, trimite prin email ---------- */
  function initContactForm(){
    var form = document.querySelector("[data-contact-form]");
    if(!form) return;
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var name = form.querySelector("[name=name]").value.trim();
      var email = form.querySelector("[name=email]").value.trim();
      var message = form.querySelector("[name=message]").value.trim();
      var subject = encodeURIComponent("Mesaj de la " + (name || "vizitator") + " prin site MZ Moldova");
      var body = encodeURIComponent(message + "\n\nTrimis de " + name + " (" + email + ")");
      window.location.href = "mailto:mzmoldova@outlook.com?subject=" + subject + "&body=" + body;
    });
  }

  /* ---------- modalul general (noutate întreagă, termeni, cookies, confidențialitate) ---------- */
  var siteModalEl, siteModalBody;

  function initSiteModal(){
    siteModalEl = document.querySelector("[data-site-modal]");
    if(!siteModalEl) return;
    siteModalBody = siteModalEl.querySelector("[data-site-modal-body]");
    var closeBtn = siteModalEl.querySelector("[data-site-modal-close]");

    if(closeBtn) closeBtn.addEventListener("click", closeSiteModal);
    siteModalEl.addEventListener("click", function(e){
      if(e.target === siteModalEl) closeSiteModal();
    });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeSiteModal();
    });
  }

  function openSiteModal(html){
    if(!siteModalEl) return;
    siteModalBody.innerHTML = html;
    siteModalEl.classList.add("open");
    siteModalEl.scrollTop = 0;
    document.body.style.overflow = "hidden";
  }

  function closeSiteModal(){
    if(!siteModalEl) return;
    siteModalEl.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* expus global, ca news.js să poată deschide modalul pentru o noutate */
  window.MZModal = {open: openSiteModal, close: closeSiteModal};

  /* ---------- linkurile din footer (Termeni, Cookies, Confidențialitate) deschid modalul ---------- */
  function initLegalModals(){
    var triggers = document.querySelectorAll("[data-legal]");
    if(!triggers.length) return;
    triggers.forEach(function(trigger){
      trigger.addEventListener("click", function(e){
        e.preventDefault();
        var key = trigger.getAttribute("data-legal");
        var template = document.getElementById("legal-" + key);
        if(template) openSiteModal(template.innerHTML);
      });
    });
  }

  /* ---------- banner de cookie-uri ---------- */
  function getCookie(name){
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }
  function setCookie(name, value){
    var oneYear = 60 * 60 * 24 * 365;
    document.cookie = name + "=" + encodeURIComponent(value) + "; max-age=" + oneYear + "; path=/; SameSite=Lax";
  }

  function initCookieBanner(){
    var banner = document.querySelector("[data-cookie-banner]");
    if(!banner) return;
    var acceptBtn = banner.querySelector("[data-cookie-accept]");
    var declineBtn = banner.querySelector("[data-cookie-decline]");

    if(!getCookie("mz_consent")){
      setTimeout(function(){ banner.classList.add("show"); }, 900);
    }

    if(acceptBtn) acceptBtn.addEventListener("click", function(){
      setCookie("mz_consent", "acceptat");
      banner.classList.remove("show");
    });
    if(declineBtn) declineBtn.addEventListener("click", function(){
      setCookie("mz_consent", "doar-esentiale");
      banner.classList.remove("show");
    });
  }
})();
