// /chat/chat.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://krkeznlzivyvgxdrhvyr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtya2V6bmx6aXZ5dmd4ZHJodnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTk1MDAsImV4cCI6MjA4Mzc3NTUwMH0.aXJGYkm5TbdrXX3CXuioOOOYe9WiIIhUej9Oe_gHax4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FLOW_URL = new URL("./chat-flow.json", import.meta.url).toString();
const STORAGE_KEY = "renolight_chat_session_id_v1";

let flow = null;
let state = {
  sessionId: null,
  branch: null,
  answers: {}, // role/scale/timeline/city/free_text_question
};

function $(sel) {
  return document.querySelector(sel);
}

function ensurePanel() {
  if ($("#chatPanel")) return;

  const panel = document.createElement("div");
  panel.id = "chatPanel";
  panel.className = "chat-panel";
  panel.innerHTML = `
    <div class="chat-header">
      <div class="chat-title">Asystent</div>
      <button id="chatCloseBtn" type="button">Zamknij</button>
    </div>
    <div id="chatBody" class="chat-body"></div>
    <div id="chatActions" class="chat-actions"></div>
  `;
  document.body.appendChild(panel);

  $("#chatCloseBtn").addEventListener("click", closeChat);
}

async function loadFlow() {
  if (flow) return flow;
  const res = await fetch(FLOW_URL, { cache: "no-store" });
  flow = await res.json();
  return flow;
}

function getUtm() {
  const url = new URL(window.location.href);
  return {
    utm_source: url.searchParams.get("utm_source"),
    utm_medium: url.searchParams.get("utm_medium"),
    utm_campaign: url.searchParams.get("utm_campaign"),
    utm_term: url.searchParams.get("utm_term"),
    utm_content: url.searchParams.get("utm_content"),
  };
}

function newId() {
  return crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function dbInsert(table, row) {
  const { error } = await supabase.from(table).insert(row);
  if (error) throw error;
}

function pushMsg(from, text) {
  const body = $("#chatBody");
  const el = document.createElement("div");
  el.className = `chat-msg ${from === "bot" ? "bot" : "user"}`;
  el.textContent = text;
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
}

function setActions(html) {
  $("#chatActions").innerHTML = html;
}

function btn(label, dataNext, dataValue, extra = "") {
  return `<button type="button" data-next="${
    dataNext ?? ""
  }" data-value="${encodeURIComponent(
    dataValue ?? ""
  )}" ${extra}>${label}</button>`;
}

async function startSessionIfNeeded() {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    state.sessionId = stored;
    return;
  }

  state.sessionId = newId();
  sessionStorage.setItem(STORAGE_KEY, state.sessionId);

  const utm = getUtm();
  await dbInsert("chat_sessions", {
    id: state.sessionId,
    landing_url: window.location.href,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent || null,
    ...utm,
  });
}

async function go(nodeId) {
  const f = await loadFlow();
  const node = f.nodes[nodeId];

  if (!node) {
    pushMsg("bot", "Wystąpił błąd konfiguracji czatu.");
    setActions(`<div class="chat-error">Brak nodeId: ${nodeId}</div>`);
    return;
  }

  if (node.type === "message") {
    pushMsg("bot", node.text);
    if (node.next) return go(node.next);
    setActions(btn("Zamknij", "", "", 'id="chatEndBtn"'));
    $("#chatEndBtn").addEventListener("click", closeChat);
    return;
  }

  if (node.type === "choices") {
    pushMsg("bot", node.text);
    setActions(node.options.map((o) => btn(o.label, o.next, o.value)).join(""));

    Array.from($("#chatActions").querySelectorAll("button")).forEach((b) => {
      b.addEventListener("click", async () => {
        const next = b.getAttribute("data-next");
        const val = decodeURIComponent(b.getAttribute("data-value") || "");
        const label = b.textContent || "";

        pushMsg("user", label);

        if (nodeId === "START") state.branch = val;
        if (node.questionKey) state.answers[node.questionKey] = val;

        setActions("");
        if (next) await go(next);
      });
    });
    return;
  }

  if (node.type === "input") {
    pushMsg("bot", node.text);

    const skipBtn = node.allowSkip
      ? btn(node.skipLabel || "Pomiń", node.next, "unknown")
      : "";

    setActions(`
      <div class="chat-input-row">
        <input id="chatTextInput" type="text" placeholder="${
          node.placeholder || ""
        }" />
        ${btn("Dalej", node.next, "__submit__")}
        ${skipBtn}
        <div class="chat-error" id="chatInputError" style="display:none;"></div>
      </div>
    `);

    const input = $("#chatTextInput");
    const err = $("#chatInputError");

    Array.from($("#chatActions").querySelectorAll("button")).forEach((b) =>
      b.addEventListener("click", async () => {
        const next = b.getAttribute("data-next");
        const valRaw = decodeURIComponent(b.getAttribute("data-value") || "");

        let val = valRaw;
        if (valRaw === "__submit__") {
          val = (input.value || "").trim();
          if (!val) {
            err.style.display = "block";
            err.textContent =
              "Uzupełnij pole lub wybierz „Nie wiem / nie chcę…”";
            return;
          }
        }

        const shown =
          valRaw === "unknown" ? node.skipLabel || "Nie wiem / nie chcę…" : val;
        pushMsg("user", shown);

        if (node.questionKey) {
          state.answers[node.questionKey] =
            valRaw === "unknown" ? "unknown" : val;
        }

        setActions("");
        if (next) await go(next);
      })
    );
    return;
  }

  if (node.type === "lead_form") {
    pushMsg("bot", node.text);

    setActions(`
      <div class="chat-input-row">
        <input id="leadEmail" type="email" placeholder="Email (wymagany)" />
        <input id="leadPhone" type="tel" placeholder="Telefon (opcjonalnie)" />
        <textarea id="leadNote" placeholder="Dodatkowa informacja (opcjonalnie)"></textarea>

        <label class="chat-note">
          <input id="leadConsent" type="checkbox" />
          ${node.consentLabel || "Zgadzam się na kontakt."}
        </label>

        <div class="chat-note">
          Administratorem danych jest ${node.privacyAdmin || "…"}.
          Szczegóły: <a href="${
            node.privacyLink || "#"
          }">Polityka prywatności</a>.
        </div>

        ${btn("Wyślij", node.next, "__submit__")}
        <div class="chat-error" id="leadError" style="display:none;"></div>
      </div>
    `);

    const emailEl = $("#leadEmail");
    const phoneEl = $("#leadPhone");
    const noteEl = $("#leadNote");
    const consentEl = $("#leadConsent");
    const err = $("#leadError");

    $("#chatActions")
      .querySelector("button")
      .addEventListener("click", async () => {
        const email = (emailEl.value || "").trim();
        const phone = (phoneEl.value || "").trim();
        const freeTextNote = (noteEl.value || "").trim();
        const consent = !!consentEl.checked;

        if (!email) {
          err.style.display = "block";
          err.textContent = "Email jest wymagany.";
          return;
        }
        if (!consent) {
          err.style.display = "block";
          err.textContent = "Zaznacz zgodę na kontakt w sprawie wyceny.";
          return;
        }

        err.style.display = "none";
        setActions(`<div class="chat-note">Wysyłanie…</div>`);

        try {
          await dbInsert("leads", {
            id: newId(),
            session_id: state.sessionId,
            email,
            phone: phone || null,
            consent_contact: consent,
            consent_text: node.consentLabel || null,
            role: state.answers.role || null,
            scale: state.answers.scale || null,
            timeline: state.answers.timeline || null,
            city: state.answers.city || null,
            free_text_note:
              freeTextNote || state.answers.free_text_question || null,
          });

          sessionStorage.removeItem(STORAGE_KEY);
          state.sessionId = null;

          pushMsg("user", "Wysłano dane kontaktowe");
          setActions("");
          await go(node.next);
        } catch (e) {
          setActions("");
          pushMsg("bot", "Nie udało się wysłać. Spróbuj ponownie za chwilę.");
        }
      });

    return;
  }
}

function openChat() {
  ensurePanel();
  $("#chatPanel").classList.add("is-open");
}

function closeChat() {
  const panel = $("#chatPanel");
  if (panel) panel.classList.remove("is-open");
}

async function startChat() {
  ensurePanel();
  await loadFlow();
  await startSessionIfNeeded();

  $("#chatBody").innerHTML = "";
  $("#chatActions").innerHTML = "";
  state.answers = {};
  state.branch = null;

  openChat();
  await go(flow.startNodeId);
}

function bindBubble() {
  const btnEl = document.getElementById("chatBubbleBtn");
  if (!btnEl) return;
  btnEl.addEventListener("click", startChat);
}

function injectCss() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("./chat.css", import.meta.url).toString();
  document.head.appendChild(link);
}

injectCss();
bindBubble();
