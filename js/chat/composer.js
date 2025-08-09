// js/chat/composer.js
import { send, getCurrentPeer } from "../services/chats.js";

const form = document.getElementById("chat-composer");
const input = document.getElementById("chat-input");

if (form && input) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    send(getCurrentPeer(), text);
    input.value = "";
  });
}