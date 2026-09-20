<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>OpenRouter Chatbot</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    color: #e2e8f0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    min-height: 100vh;
  }
  .chat-container {
    width: 100%;
    max-width: 780px;
    height: 90vh;
    max-height: 900px;
    background: #1e293b;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.05);
  }

  /* Header */
  header {
    padding: 16px 20px;
    background: #0f172a;
    border-bottom: 1px solid #334155;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .status-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 10px #22c55e;
    flex-shrink: 0;
  }
  .title { font-weight: 600; font-size: 15px; flex: 1; }
  .title small { display: block; color: #94a3b8; font-weight: 400; font-size: 12px; margin-top: 2px; }
  .model-select {
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 12px;
    cursor: pointer;
    outline: none;
  }
  .model-select:hover { border-color: #3b82f6; }

  /* Messages */
  #messages {
    flex: 1;
    padding: 24px 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scroll-behavior: smooth;
  }
  #messages::-webkit-scrollbar { width: 8px; }
  #messages::-webkit-scrollbar-track { background: transparent; }
  #messages::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  #messages::-webkit-scrollbar-thumb:hover { background: #475569; }

  .msg {
    max-width: 82%;
    padding: 12px 16px;
    border-radius: 14px;
    line-height: 1.55;
    font-size: 15px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    animation: fadeIn .25s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .msg.user {
    align-self: flex-end;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: #fff;
    border-bottom-right-radius: 4px;
  }
  .msg.bot {
    align-self: flex-start;
    background: #334155;
    border-bottom-left-radius: 4px;
  }
  .msg.error {
    align-self: flex-start;
    background: #7f1d1d;
    color: #fecaca;
    border-bottom-left-radius: 4px;
  }

  /* Typing indicator */
  .typing { display: inline-flex; gap: 4px; align-items: center; }
  .typing span {
    width: 7px; height: 7px;
    background: #94a3b8;
    border-radius: 50%;
    animation: bounce 1.2s infinite;
  }
  .typing span:nth-child(2) { animation-delay: .15s; }
  .typing span:nth-child(3) { animation-delay: .3s; }
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: .5; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  /* Input area */
  form {
    display: flex;
    padding: 14px;
    gap: 10px;
    background: #0f172a;
    border-top: 1px solid #334155;
  }
  textarea {
    flex: 1;
    resize: none;
    border-radius: 12px;
    border: 1px solid #334155;
    background: #1e293b;
    color: #e2e8f0;
    padding: 12px 14px;
    font-family: inherit;
    font-size: 15px;
    line-height: 1.4;
    outline: none;
    height: 48px;
    max-height: 160px;
    transition: border-color .15s;
  }
  textarea:focus { border-color: #3b82f6; }
  textarea::placeholder { color: #64748b; }

  .btn {
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all .15s;
    font-size: 14px;
    height: 48px;
    padding: 0 20px;
  }
  #send {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: #fff;
  }
  #send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,.4); }
  #send:disabled { opacity: .5; cursor: not-allowed; }
  #clear {
    background: #334155;
    color: #e2e8f0;
    padding: 0 16px;
  }
  #clear:hover { background: #475569; }
</style>
</head>
<body>

<div class="chat-container">
  <header>
    <span class="status-dot"></span>
    <div class="title">
      OpenRouter Chatbot
      <small id="status">Ready</small>
    </div>
    <select class="model-select" id="model">
      <option value="openai/gpt-4o-mini" selected>GPT-4o mini</option>
      <option value="openai/gpt-4o">GPT-4o</option>
      <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
      <option value="google/gemini-flash-1.5">Gemini Flash 1.5</option>
      <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B</option>
    </select>
  </header>

  <div id="messages"></div>

  <form id="chat-form">
    <textarea id="input" placeholder="Type a message…  (Enter to send, Shift+Enter for newline)" autofocus></textarea>
    <button id="clear" class="btn" type="button" title="New chat">Clear</button>
    <button id="send" class="btn" type="submit">Send</button>
  </form>
</div>

<script>
/* =========================================================
   CONFIGURATION
   ========================================================= */
const API_KEY = "PASTE_YOUR_NEW_KEY_HERE";   // <-- revoke the old key & paste the new one
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SYSTEM_PROMPT = "You are a helpful, friendly, and concise assistant.";

/* =========================================================
   DOM REFS
   ========================================================= */
const messagesEl = document.getElementById("messages");
const form       = document.getElementById("chat-form");
const input      = document.getElementById("input");
const sendBtn    = document.getElementById("send");
const clearBtn   = document.getElementById("clear");
const modelSel   = document.getElementById("model");
const statusEl   = document.getElementById("status");

/* =========================================================
   STATE
   ========================================================= */
let history = [{ role: "system", content: SYSTEM_PROMPT }];
let isBusy = false;

/* =========================================================
   UI HELPERS
   ========================================================= */
function setStatus(text, ok = true) {
  statusEl.textContent = text;
  statusEl.style.color = ok ? "#94a3b8" : "#f87171";
}

function addMessage(text, cls) {
  const div = document.createElement("div");
  div.className = "msg " + cls;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function addTypingIndicator() {
  const div = document.createElement("div");
  div.className = "msg bot";
  div.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function autoGrow(el) {
  el.style.height = "48px";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
}

/* =========================================================
   CORE — send to OpenRouter with streaming
   ========================================================= */
async function sendMessage(userText) {
  if (isBusy) return;
  isBusy = true;
  sendBtn.disabled = true;
  setStatus("Thinking…");

  addMessage(userText, "user");
  history.push({ role: "user", content: userText });

  const botDiv = addTypingIndicator();
  let fullReply = "";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json",
        "HTTP-Referer": location.origin || "http://localhost",
        "X-Title": "OpenRouter Chatbot"
      },
      body: JSON.stringify({
        model: modelSel.value,
        messages: history,
        stream: true
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error("HTTP " + res.status + " — " + errText.slice(0, 300));
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let firstChunk = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const raw of lines) {
        const line = raw.trim();
        if (!line || !line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;

        try {
          const json  = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content || "";
          if (delta) {
            if (firstChunk) {
              botDiv.className = "msg bot";
              botDiv.textContent = "";
              firstChunk = false;
            }
            fullReply += delta;
            botDiv.textContent = fullReply;
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
        } catch (_) { /* skip malformed chunk */ }
      }
    }

    if (!fullReply) {
      botDiv.className = "msg bot";
      botDiv.textContent = "(empty response)";
    }

    history.push({ role: "assistant", content: fullReply });
    setStatus("Ready");

  } catch (err) {
    botDiv.className = "msg error";
    botDiv.textContent = "❌ " + err.message;
    setStatus("Error", false);
    console.error(err);
  } finally {
    isBusy = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

/* =========================================================
   EVENTS
   ========================================================= */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || isBusy) return;
  input.value = "";
  autoGrow(input);
  sendMessage(text);
});

input.addEventListener("input", () => autoGrow(input));

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

clearBtn.addEventListener("click", () => {
  if (isBusy) return;
  history = [{ role: "system", content: SYSTEM_PROMPT }];
  messagesEl.innerHTML = "";
  addMessage("New chat started. Ask me anything ✨", "bot");
  setStatus("Ready");
  input.focus();
});

/* =========================================================
   GREETING
   ========================================================= */
addMessage("Hi! I'm your OpenRouter chatbot. Ask me anything ✨", "bot");
input.focus();
</script>
</body>
</html>