import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://krkeznlzivyvgxdrhvyr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtya2V6bmx6aXZ5dmd4ZHJodnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTk1MDAsImV4cCI6MjA4Mzc3NTUwMH0.aXJGYkm5TbdrXX3CXuioOOOYe9WiIIhUej9Oe_gHax4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = {
      email: fd.get("email"),
      phone: fd.get("phone") || null,
      message: fd.get("message") || null,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    };

    const { data, error } = await supabase.from("leads_easy").insert(payload);

    if (error) {
      console.error("Supabase error:", error);
      alert(`${error.code ?? ""} ${error.message}`);
      return;
    }

    console.log("Inserted:", data);
    form.reset();
    alert("Wysłano. Dzięki!");
  });
});
