/* ==========================================================================
   VÍBORA INK · script.js
   JavaScript puro, sem bibliotecas externas.
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIGURAÇÃO DE CONTATO
   PLACEHOLDER: preencher com os dados reais da Víbora Ink.
   - whatsapp: somente números, com DDI e DDD (ex.: "55XX9XXXXXXXX")
   - email: endereço de e-mail, se houver
   Enquanto whatsapp e email estiverem vazios, os botões e formulários
   direcionam para o Instagram, que é o único canal confirmado.
   -------------------------------------------------------------------------- */
const CONFIG = {
  whatsapp: "",
  email: "",
  instagram: "https://www.instagram.com/viboraink/",
};

document.documentElement.classList.add("js");

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Aviso curto (toast) ---------- */
const toast = $("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

/* ---------- Copiar texto ----------
   navigator.clipboard só existe em HTTPS/localhost; no restante usa o método antigo. */
function copyText(text) {
  const legacy = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(legacy);
    return true;
  }
  return legacy();
}

/* ---------- Contato: WhatsApp > e-mail > Instagram ---------- */
function openContact(message = "") {
  if (CONFIG.whatsapp) {
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    return "sent";
  }
  if (CONFIG.email) {
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Contato pelo site")}&body=${encodeURIComponent(message)}`;
    return "sent";
  }
  // Sem WhatsApp/e-mail configurados: copia a mensagem e abre o Instagram
  const copied = message ? copyText(message) : false;
  window.open(CONFIG.instagram, "_blank", "noopener");
  showToast(copied
    ? "Abrimos o Instagram da Víbora Ink. Sua mensagem foi copiada: é só colar no direct."
    : "Abrimos o Instagram da Víbora Ink. Envie sua mensagem pelo direct.");
  return copied ? "copied" : "instagram";
}

// Botões com data-contact="mensagem pré-preenchida"
$$("[data-contact]").forEach((btn) =>
  btn.addEventListener("click", () => openContact(btn.dataset.contact))
);

// Links de canal (WhatsApp e e-mail) no contato e no rodapé
$$('[data-channel="whatsapp"]').forEach((link) => {
  if (CONFIG.whatsapp) {
    link.href = `https://wa.me/${CONFIG.whatsapp}`;
    link.target = "_blank";
    link.rel = "noopener";
  } else {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("O WhatsApp ainda não foi informado. Por enquanto, fale com a Víbora Ink pelo Instagram.");
    });
  }
});
$$('[data-channel="email"]').forEach((link) => {
  if (CONFIG.email) link.href = `mailto:${CONFIG.email}`;
  else link.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("O e-mail ainda não foi informado.");
  });
});

/* ---------- Menu: estado ao rolar, hamburger e seção ativa ---------- */
const header = $("#header");
const burger = $("#burger");
const nav = $("#nav");
const stickyCta = $("#sticky-cta");
const hero = $("#inicio");
const finalSection = $("#agendar");

const menuOpen = () => nav.classList.contains("is-open");

function setMenu(open, { restoreFocus = true } = {}) {
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("is-locked", open);
  if (open) setTimeout(() => $(".nav__link", nav)?.focus({ preventScroll: true }), 80);
  else if (restoreFocus) burger.focus({ preventScroll: true });
}
burger.addEventListener("click", () => setMenu(!menuOpen()));
$$(".nav__link").forEach((link) => link.addEventListener("click", () => {
  if (menuOpen()) setMenu(false, { restoreFocus: false });
}));
// Menu aberto por tamanho de tela que deixa de ser mobile: fecha para não travar a rolagem
window.matchMedia("(min-width: 1025px)").addEventListener("change", (e) => {
  if (e.matches && menuOpen()) setMenu(false, { restoreFocus: false });
});
document.addEventListener("keydown", (e) => {
  if (!menuOpen()) return;
  if (e.key === "Escape") setMenu(false);
  if (e.key === "Tab") {
    // Mantém o foco entre o menu aberto e o botão de fechar
    const focusables = [burger, ...$$("a", nav)];
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// Destaca no menu a seção visível (e limpa o destaque em seções fora do menu)
const navLinks = new Map($$(".nav__link").map((a) => [a.getAttribute("href").slice(1), a]));
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
      const link = navLinks.get(entry.target.id);
      if (link) { link.classList.add("is-active"); link.setAttribute("aria-current", "true"); }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
$$("main section[id]").forEach((s) => spy.observe(s));

/* ---------- Rolagem: header, parallax sutil e botão fixo ---------- */
const parallaxItems = reduceMotion ? [] : $$("[data-parallax]");
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  header.classList.toggle("is-scrolled", y > 40);

  // Botão fixo (celular): aparece depois do hero e some perto do CTA final
  const pastHero = y > hero.offsetHeight * 0.8;
  const nearFinal = finalSection.getBoundingClientRect().top < vh;
  stickyCta.classList.toggle("is-visible", pastHero && !nearFinal);

  parallaxItems.forEach((el) => {
    const rect = el.parentElement.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) return;
    const speed = parseFloat(el.dataset.parallax) || 0.1;
    const offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
  });
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

/* ---------- Revelação ao entrar na tela ---------- */
const revealer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
);
$$(".reveal").forEach((el) => revealer.observe(el));

/* ---------- Galeria: legendas, filtros e lightbox ---------- */
const works = $$(".work");
works.forEach((w) => { $(".work__btn", w).dataset.caption = w.dataset.caption || ""; });

// Filtros: só aparecem se as imagens tiverem data-style (não inventar estilos)
const filtersEl = $("#filters");
const gallery = $("#gallery");
const styles = [...new Set(works.map((w) => w.dataset.style).filter(Boolean))];
if (styles.length > 1) {
  filtersEl.hidden = false;
  ["Todos", ...styles].forEach((style, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = style;
    b.setAttribute("aria-pressed", String(i === 0));
    b.addEventListener("click", () => {
      $$("button", filtersEl).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const all = style === "Todos";
      gallery.classList.toggle("is-filtered", !all);
      works.forEach((w) => w.classList.toggle("is-hidden", !all && w.dataset.style !== style));
    });
    filtersEl.appendChild(b);
  });
}

const lightbox = $("#lightbox");
const lbImg = $(".lightbox__img", lightbox);
const lbText = $(".lightbox__text", lightbox);
const lbCount = $(".lightbox__count", lightbox);
let current = 0;
let lastFocus = null;

const visibleWorks = () => works.filter((w) => !w.classList.contains("is-hidden"));

function showImage(index) {
  const list = visibleWorks();
  current = (index + list.length) % list.length;
  const img = $("img", list[current]);
  lbImg.classList.remove("is-ready");
  const src = img.currentSrc || img.src;
  const done = () => requestAnimationFrame(() => lbImg.classList.add("is-ready"));
  lbImg.onload = done;
  lbImg.src = src;
  lbImg.alt = img.alt;
  if (lbImg.complete) done();
  lbText.textContent = list[current].dataset.caption || "";
  lbCount.textContent = `${String(current + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
}

let closeTimer;

function openLightbox(index) {
  clearTimeout(closeTimer);
  lastFocus = document.activeElement;
  lightbox.hidden = false;
  document.body.classList.add("is-locked");
  showImage(index);
  // Dois quadros: o navegador precisa pintar o estado inicial para a transição de opacidade acontecer
  requestAnimationFrame(() => requestAnimationFrame(() => lightbox.classList.add("is-open")));
  $(".lightbox__close", lightbox).focus();
}

function closeLightbox() {
  if (!lightbox.classList.contains("is-open")) return;
  lightbox.classList.remove("is-open");
  document.body.classList.remove("is-locked");
  closeTimer = setTimeout(() => { lightbox.hidden = true; lbImg.classList.remove("is-ready"); }, reduceMotion ? 0 : 450);
  lastFocus?.focus({ preventScroll: true });
}

works.forEach((w) =>
  $(".work__btn", w).addEventListener("click", () => openLightbox(visibleWorks().indexOf(w)))
);
$(".lightbox__close", lightbox).addEventListener("click", closeLightbox);
$(".lightbox__nav--prev", lightbox).addEventListener("click", () => showImage(current - 1));
$(".lightbox__nav--next", lightbox).addEventListener("click", () => showImage(current + 1));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target.classList.contains("lightbox__figure")) closeLightbox(); });

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showImage(current - 1);
  if (e.key === "ArrowRight") showImage(current + 1);
  if (e.key === "Tab") {
    // Mantém o foco dentro do lightbox
    const focusables = $$("button", lightbox);
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// Gesto de deslizar no celular
let touchX = null;
lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showImage(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

/* ---------- FAQ: abertura animada do accordion ---------- */
$$(".acc").forEach((item) => {
  const summary = $("summary", item);
  const body = $(".acc__body", item);
  let anim = null;
  let closing = false;
  summary.addEventListener("click", (e) => {
    if (reduceMotion) return;
    e.preventDefault();
    // Clique durante a animação: parte da altura atual, sem saltos
    const opening = !item.open || closing;
    const from = anim ? `${body.getBoundingClientRect().height}px` : opening ? "0px" : `${body.scrollHeight}px`;
    anim?.cancel();
    if (opening) item.open = true;
    closing = !opening;
    anim = body.animate(
      { height: [from, opening ? `${body.scrollHeight}px` : "0px"], opacity: opening ? [0, 1] : [1, 0] },
      { duration: 450, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
    );
    anim.onfinish = () => {
      if (!opening) item.open = false;
      closing = false;
      anim = null;
    };
  });
});

/* ---------- Formulários (Eventos e Guest Spot) ----------
   Não há servidor: a mensagem é montada com os campos e enviada
   pelo canal configurado em CONFIG (WhatsApp, e-mail ou Instagram). */
$$("form[data-form]").forEach((form) => {
  const status = $(".form__status", form);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    $$("input, textarea", form).forEach((field) => {
      const ok = field.checkValidity() && (!field.required || field.value.trim() !== "");
      field.closest(".field").classList.toggle("is-invalid", !ok);
      field.toggleAttribute("aria-invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      status.textContent = "Preencha os campos obrigatórios destacados.";
      $(".is-invalid input, .is-invalid textarea", form)?.focus();
      return;
    }
    const lines = $$("input, textarea", form)
      .filter((f) => f.value.trim())
      .map((f) => {
        let value = f.value.trim();
        if (f.type === "date") value = value.split("-").reverse().join("/");
        return `${f.name}: ${value}`;
      });
    const message = `Olá, Víbora Ink! Solicitação: ${form.dataset.form}\n\n${lines.join("\n")}`;
    const result = openContact(message);
    status.textContent = {
      sent: "Tudo pronto! Finalize o envio na janela que abriu.",
      copied: "Mensagem copiada. Cole no direct do Instagram para enviar.",
      instagram: "Abrimos o Instagram. Envie os dados acima pelo direct.",
    }[result];
  });
  form.addEventListener("input", (e) => {
    e.target.closest(".field")?.classList.remove("is-invalid");
    e.target.removeAttribute("aria-invalid");
    if (!$(".is-invalid", form)) status.textContent = "";
  });
});

// Datas de evento: não permite escolher um dia que já passou
const today = new Date();
const isoToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
$$('input[type="date"]').forEach((input) => { input.min = isoToday; });

// Ano do rodapé sempre atualizado
const yearEl = $("#year");
if (yearEl) yearEl.textContent = today.getFullYear();
