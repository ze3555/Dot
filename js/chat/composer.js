
// Minimal no-op to keep the bottom panel wired
const form = document.getElementById("chat-composer");
const input = document.getElementById("chat-input");

if (form && input) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const msg = document.createElement("div");
    msg.textContent = text;
    document.getElementById("messages")?.appendChild(msg);
    input.value = "";
  });
}