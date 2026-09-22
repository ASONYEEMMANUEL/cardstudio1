/* ============================================================
   Customize page
   Selections are kept in sessionStorage under "cardDesign" so the
   order page can read them without a backend round trip.
   ============================================================ */

const STORAGE_KEY = "cardDesign";

const state = loadState() || {
  template: CARD_TEMPLATES[0].id,
  color: CARD_COLORS[0].id,
  pattern: CARD_PATTERNS[0].id,
  name: "",
  imageDataUrl: null,
};

function loadState(){
  try{
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

function saveState(){
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------- render option pickers ---------- */
function renderTemplateOptions(){
  const wrap = document.getElementById("template-options");
  wrap.innerHTML = "";
  CARD_TEMPLATES.forEach(t => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "option-chip" + (t.id === state.template ? " selected" : "");
    el.textContent = t.label;
    el.addEventListener("click", () => {
      state.template = t.id;
      renderTemplateOptions();
      updatePreview();
      saveState();
    });
    wrap.appendChild(el);
  });
}

function renderColorOptions(){
  const wrap = document.getElementById("color-options");
  wrap.innerHTML = "";
  CARD_COLORS.forEach(c => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "swatch" + (c.id === state.color ? " selected" : "");
    el.title = c.label;
    el.style.background = `linear-gradient(135deg, ${c.from}, ${c.to})`;
    el.addEventListener("click", () => {
      state.color = c.id;
      renderColorOptions();
      updatePreview();
      saveState();
    });
    wrap.appendChild(el);
  });
}

function renderPatternOptions(){
  const wrap = document.getElementById("pattern-options");
  wrap.innerHTML = "";
  CARD_PATTERNS.forEach(p => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "option-chip" + (p.id === state.pattern ? " selected" : "");
    el.textContent = p.label;
    el.addEventListener("click", () => {
      state.pattern = p.id;
      renderPatternOptions();
      updatePreview();
      saveState();
    });
    wrap.appendChild(el);
  });
}

/* ---------- preview ---------- */
function updatePreview(){
  const tpl = findById(CARD_TEMPLATES, state.template);
  const color = findById(CARD_COLORS, state.color);
  const pattern = findById(CARD_PATTERNS, state.pattern);

  const card = document.getElementById("preview-card");
  card.style.background = `linear-gradient(135deg, ${color.from}, ${color.to})`;

  const patternLayer = document.getElementById("preview-pattern");
  patternLayer.className = "pattern-layer pattern-" + pattern.id;

  document.getElementById("preview-name").textContent = state.name.trim() || "YOUR NAME";
  document.getElementById("preview-network").textContent = tpl.network;

  document.getElementById("summary-template").textContent = tpl.label;
  document.getElementById("summary-color").textContent = color.label;
  document.getElementById("summary-pattern").textContent = pattern.label;

  const img = document.getElementById("preview-image");
  if(state.imageDataUrl){
    img.src = state.imageDataUrl;
    img.style.display = "block";
  }else{
    img.style.display = "none";
  }
}

/* ---------- name input ---------- */
document.getElementById("card-name-input").addEventListener("input", (e) => {
  state.name = e.target.value.toUpperCase();
  updatePreview();
  saveState();
});

/* ---------- image upload ---------- */
document.getElementById("image-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if(!file) return;
  if(file.size > 3 * 1024 * 1024){
    alert("Please choose an image under 3MB.");
    e.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.imageDataUrl = reader.result;
    document.getElementById("upload-label").textContent = file.name;
    updatePreview();
    saveState();
  };
  reader.readAsDataURL(file);
});

/* ---------- init ---------- */
document.getElementById("card-name-input").value = state.name || "";
renderTemplateOptions();
renderColorOptions();
renderPatternOptions();
updatePreview();
