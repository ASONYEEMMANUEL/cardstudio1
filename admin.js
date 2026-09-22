/* ============================================================
   Admin page
   NOTE: This uses a simple client-side passcode as a basic gate
   for a small internal tool. It is NOT real security — anyone who
   reads this file can see the passcode, and the Supabase anon key
   is public in the browser regardless. For a real deployment,
   protect the "orders" table with Supabase Auth + Row Level
   Security instead of (or in addition to) this passcode.
   ============================================================ */

const ADMIN_PASSCODE = "admin123"; // change this before deploying

const STATUS_OPTIONS = ["pending", "in_production", "completed", "cancelled"];
const STATUS_LABELS = {
  pending: "Pending",
  in_production: "In production",
  completed: "Completed",
  cancelled: "Cancelled",
};

/* ---------- login gate ---------- */
document.getElementById("login-btn").addEventListener("click", tryLogin);
document.getElementById("passcode-input").addEventListener("keydown", (e) => {
  if(e.key === "Enter") tryLogin();
});

function tryLogin(){
  const value = document.getElementById("passcode-input").value;
  if(value === ADMIN_PASSCODE){
    sessionStorage.setItem("cardStudioAdmin", "true");
    showAdmin();
  }else{
    document.getElementById("login-error").style.display = "block";
  }
}

document.getElementById("logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem("cardStudioAdmin");
  location.reload();
});

function showAdmin(){
  document.getElementById("login-view").style.display = "none";
  document.getElementById("admin-view").style.display = "block";
  loadOrders();
}

if(sessionStorage.getItem("cardStudioAdmin") === "true"){
  showAdmin();
}

/* ---------- data loading ---------- */
async function loadOrders(){
  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const tbody = document.getElementById("orders-body");

  if(error){
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Couldn't load orders: ${error.message}</td></tr>`;
    return;
  }

  renderStats(data);

  if(!data.length){
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No orders yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  data.forEach(order => tbody.appendChild(renderRow(order)));
}

function renderStats(orders){
  const total = orders.length;
  const counts = STATUS_OPTIONS.reduce((acc, s) => { acc[s] = 0; return acc; }, {});
  orders.forEach(o => { if(counts[o.status] !== undefined) counts[o.status]++; });

  const cards = [
    { label: "Total orders", num: total },
    { label: "Pending", num: counts.pending },
    { label: "In production", num: counts.in_production },
    { label: "Completed", num: counts.completed },
  ];

  const wrap = document.getElementById("admin-stats");
  wrap.innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="num">${c.num}</div>
      <div class="label">${c.label}</div>
    </div>
  `).join("");
}

function renderRow(order){
  const tr = document.createElement("tr");

  const color = findById(CARD_COLORS, order.color);
  const tpl = findById(CARD_TEMPLATES, order.template);
  const pattern = findById(CARD_PATTERNS, order.pattern);
  const date = new Date(order.created_at).toLocaleString();

  tr.innerHTML = `
    <td>
      <div style="font-weight:600;">${escapeHtml(order.customer_name)}</div>
      ${order.card_label ? `<div style="color:var(--steel); font-size:.82rem;">On card: ${escapeHtml(order.card_label)}</div>` : ""}
    </td>
    <td>
      <div>${escapeHtml(order.phone)}</div>
      <div style="color:var(--steel); font-size:.82rem;">${escapeHtml(order.email)}</div>
    </td>
    <td>
      <span class="mini-swatch" style="background: linear-gradient(135deg, ${color.from}, ${color.to});"></span>
      ${tpl.label} · ${color.label} · ${pattern.label}
    </td>
    <td>${order.image_url ? `<img class="thumb" src="${order.image_url}">` : "—"}</td>
    <td>${date}</td>
    <td></td>
  `;

  const statusCell = tr.lastElementChild;
  const select = document.createElement("select");
  select.className = "status-select";
  STATUS_OPTIONS.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = STATUS_LABELS[s];
    if(s === order.status) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => updateStatus(order.id, select.value));
  statusCell.appendChild(select);

  return tr;
}

async function updateStatus(orderId, newStatus){
  const { error } = await supabaseClient
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if(error){
    alert("Couldn't update status: " + error.message);
  }
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
