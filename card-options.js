/* ============================================================
   Card design options
   Kept as plain JS config, no database table needed for these —
   only the finished order gets saved to Supabase.
   ============================================================ */

const CARD_TEMPLATES = [
  { id: "classic",  label: "Classic",  network: "VISA" },
  { id: "minimal",  label: "Minimal",  network: "DEBIT" },
  { id: "signature", label: "Signature", network: "MASTERCARD" },
];

const CARD_COLORS = [
  { id: "midnight", label: "Midnight",  from: "#0E1526", to: "#1F2C4C" },
  { id: "gold",     label: "Brass Gold", from: "#7A5B12", to: "#C9A227" },
  { id: "mint",     label: "Mint",       from: "#0E5C43", to: "#2FBF8F" },
  { id: "crimson",  label: "Crimson",    from: "#5C1414", to: "#D65C4F" },
  { id: "slate",    label: "Slate",      from: "#3A4256", to: "#5B6B8C" },
  { id: "plum",     label: "Plum",       from: "#3B1E4A", to: "#7A4499" },
];

const CARD_PATTERNS = [
  { id: "none",    label: "Plain" },
  { id: "dots",    label: "Dots" },
  { id: "stripes", label: "Stripes" },
  { id: "waves",   label: "Waves" },
  { id: "grid",    label: "Grid" },
];

function findById(list, id){
  return list.find(item => item.id === id) || list[0];
}
