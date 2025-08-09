import { mountDotUI } from "./ui/dot.js";

function boot() {
  // Никаких тяжёлых инициализаций — только UI DOT + базовая привязка send
  mountDotUI();

  const input = document.getElementById("chat-input");
  const send = document.getElementById("send-btn");
  const list = document.querySelector(".messages");

  const sendNow = () => {
    const v = (input.value || "").trim();
    if (!v) return;
    const el = document.createElement("div");
    el.className = "msg";
    el.textContent = v;
    list.appendChild(el);
    input.value = "";
    el.scrollIntoView({ block: "end", behavior: "smooth" });
  };

  send.addEventListener("click", sendNow);
  input.addEventListener("keydown", (e)=>{
    if (e.key === "Enter") sendNow();
  });
}

document.addEventListener("DOMContentLoaded", boot);