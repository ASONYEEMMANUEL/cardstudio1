/* ============================================================
   Order page
   Reads the design saved by customize.js, uploads the optional
   image to Supabase Storage, and inserts a row into "orders".
   ============================================================ */

const STORAGE_KEY = "cardDesign";

function loadDesign(){
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if(!raw) return null;
  try{ return JSON.parse(raw); }catch(e){ return null; }
}

const design = loadDesign() || {
  template: CARD_TEMPLATES[0].id,
  color: CARD_COLORS[0].id,
  pattern: CARD_PATTERNS[0].id,
  name: "",
  imageDataUrl: null,
};

function renderDesignSummary(){
  const tpl = findById(CARD_TEMPLATES, design.template);
  const color = findById(CARD_COLORS, design.color);
  const pattern = findById(CARD_PATTERNS, design.pattern);

  const card = document.getElementById("preview-card");
  card.style.background = `linear-gradient(135deg, ${color.from}, ${color.to})`;
  document.getElementById("preview-pattern").className = "pattern-layer pattern-" + pattern.id;
  document.getElementById("preview-name").textContent = design.name.trim() || "YOUR NAME";
  document.getElementById("preview-network").textContent = tpl.network;

  document.getElementById("summary-template").textContent = tpl.label;
  document.getElementById("summary-color").textContent = color.label;
  document.getElementById("summary-pattern").textContent = pattern.label;

  const img = document.getElementById("preview-image");
  if(design.imageDataUrl){
    img.src = design.imageDataUrl;
    img.style.display = "block";
  }
}

function showStatus(message, type){
  const el = document.getElementById("status-banner");
  el.textContent = message;
  el.className = "status-banner show " + type;
}

/* Convert a data URL (from FileReader) back into a Blob for upload */
function dataUrlToBlob(dataUrl){
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for(let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function uploadDesignImage(){
  if(!design.imageDataUrl) return null;
  const blob = dataUrlToBlob(design.imageDataUrl);
  const ext = blob.type.split("/")[1] || "png";
  const path = `orders/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseClient.storage.from(IMAGE_BUCKET).upload(path, blob, {
    contentType: blob.type,
    upsert: false,
  });
  if(error) throw error;

  const { data } = supabaseClient.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

document.getElementById("order-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById("submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  try{
    const imageUrl = await uploadDesignImage();

    const { error } = await supabaseClient.from("orders").insert({
      customer_name: document.getElementById("full-name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      template: design.template,
      color: design.color,
      pattern: design.pattern,
      card_label: design.name.trim() || null,
      image_url: imageUrl,
      status: "pending",
    });

    if(error) throw error;

    showStatus("Order submitted! We'll be in touch by email or phone with updates.", "success");
    document.getElementById("order-form").reset();
    sessionStorage.removeItem(STORAGE_KEY);
    submitBtn.textContent = "Order submitted";
  }catch(err){
    console.error(err);
    showStatus("Something went wrong submitting your order: " + err.message, "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit order";
  }
});

renderDesignSummary();
