import { useState, useEffect } from "react";
import axios from "axios";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060d1f; font-family: 'Inter', sans-serif; color: white; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes chipIn { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
  @keyframes progressPulse {
    0% { width:0%; margin-left:0; }
    50% { width:55%; margin-left:22%; }
    100% { width:0%; margin-left:100%; }
  }
  @keyframes gaugeFill { from { stroke-dashoffset: 408; } }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  textarea { font-family: 'Inter', sans-serif; }
  textarea:focus { outline: none; }

  .tab-btn {
    flex: 1; padding: 11px 16px; border-radius: 10px; border: none;
    font-size: 13px; font-weight: 600; cursor: pointer;
    transition: all 0.2s; font-family: 'Inter', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .tab-active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white; box-shadow: 0 4px 14px rgba(99,102,241,0.4);
  }
  .tab-inactive {
    background: rgba(255,255,255,0.05); color: #94a3b8;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .tab-inactive:hover { background: rgba(255,255,255,0.08); color: white; }

  .analyze-btn {
    width: 100%; padding: 15px; border: none; border-radius: 13px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
    color: white; font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'Inter', sans-serif; letter-spacing: 0.3px;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(99,102,241,0.35);
  }
  .analyze-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99,102,241,0.5); }
  .analyze-btn:disabled { background: #1e293b; color: #475569; cursor: not-allowed; transform: none; box-shadow: none; }

  .feature-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 10px 16px; font-size: 12px; font-weight: 600;
    color: #94a3b8; transition: all 0.2s; cursor: default;
  }
  .feature-pill:hover { background: rgba(255,255,255,0.08); color: white; }
  .feature-pill span { font-size: 14px; }

  .info-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 14px 16px; transition: border-color 0.2s;
  }
  .info-card:hover { border-color: rgba(255,255,255,0.15); }

  .flag-item {
    display: flex; align-items: center; gap: 10px;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15);
    border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #fca5a5;
    animation: chipIn 0.3s ease both; transition: all 0.2s; cursor: default;
  }
  .flag-item:hover { background: rgba(239,68,68,0.14); transform: translateX(3px); }

  .action-item {
    display: flex; align-items: flex-start; gap: 10px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #cbd5e1;
    transition: all 0.2s; cursor: default;
  }
  .action-item:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); }

  .pro-tip {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #94a3b8; padding: 4px 0;
  }

  .report-btn {
    flex: 1; padding: 13px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #ef4444, #f87171);
    color: white; font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'Inter', sans-serif; transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(239,68,68,0.25);
  }
  .report-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239,68,68,0.4); }

  .reset-btn {
    flex: 1; padding: 13px; border-radius: 12px;
    background: rgba(255,255,255,0.05); color: #94a3b8;
    border: 1px solid rgba(255,255,255,0.08);
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'Inter', sans-serif; transition: all 0.2s;
  }
  .reset-btn:hover { background: rgba(255,255,255,0.1); color: white; }

  .toast {
    position: fixed; bottom: 28px; left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #22c55e; color: white; padding: 11px 24px;
    border-radius: 100px; font-size: 13px; font-weight: 600;
    opacity: 0; transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    pointer-events: none; z-index: 100;
    box-shadow: 0 4px 20px rgba(34,197,94,0.4); white-space: nowrap;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
`;

function SemiGauge({ score, color }) {
  const r = 70;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 10px ${color})` }} />
      </svg>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ fontSize: "38px", fontWeight: "800", color, lineHeight: 1, filter: `drop-shadow(0 0 12px ${color}88)` }}>{score}%</div>
        <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "2px", textTransform: "uppercase", marginTop: "4px" }}>SCAM PROBABILITY</div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  const [step, setStep] = useState(0);
  const steps = ["Scanning message content...", "Checking URLs for threats...", "Analyzing psychological triggers...", "Computing risk score..."];
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation: "spin 1.2s linear infinite", display: "block", margin: "0 auto 16px" }}>
        <circle cx="26" cy="26" r="22" fill="none" stroke="#1e293b" strokeWidth="5" />
        <circle cx="26" cy="26" r="22" fill="none" stroke="#6366f1" strokeWidth="5" strokeDasharray="50 88" strokeLinecap="round" />
      </svg>
      <p style={{ color: "#6366f1", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>{steps[step]}</p>
      <p style={{ color: "#475569", fontSize: "12px" }}>Multi-layer AI analysis in progress</p>
      <div style={{ height: "3px", background: "#1e293b", borderRadius: "3px", margin: "16px auto 0", width: "200px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7)", borderRadius: "3px", animation: "progressPulse 1.8s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

const WHAT_TO_DO = {
  high: [
    { icon: "🚫", text: "Do NOT click any links in the message" },
    { icon: "🔒", text: "NEVER share OTP, PIN, or bank details" },
    { icon: "📵", text: "Block & report the sender immediately" },
    { icon: "🏛️", text: "Report to cybercrime.gov.in or call 1930" },
  ],
  medium: [
    { icon: "⚠️", text: "Verify the sender before taking any action" },
    { icon: "📞", text: "Call your bank directly using official number" },
    { icon: "🔍", text: "Do not click links — visit the official website" },
    { icon: "📋", text: "Screenshot and report if confirmed scam" },
  ],
  safe: [
    { icon: "✅", text: "Message appears legitimate" },
    { icon: "🔍", text: "Always verify unexpected requests independently" },
    { icon: "📞", text: "When in doubt, call the sender's official number" },
    { icon: "🛡️", text: "Stay vigilant — no bank asks for OTP over SMS" },
  ],
};

export default function App() {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const analyze = async () => {
    if (!text.trim() && !file) { setError("Please enter a message or upload a screenshot."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const fd = new FormData();
      if (text.trim()) fd.append("text", text);
      if (file) fd.append("file", file);
      const res = await axios.post("http://127.0.0.1:8000/analyze", fd);
      setResult(res.data);
      setScanCount(c => c + 1);
    } catch {
      setError("Cannot connect to backend. Make sure FastAPI is running on port 8000.");
    }
    setLoading(false);
  };

  const copyReport = () => {
    if (!result) return;
    navigator.clipboard.writeText(
      `SCAM REPORT — ScamShield\n${"─".repeat(38)}\nRisk Score: ${result.score}%\nType: ${result.type}\nAnalysis: ${result.reasoning}\nRed Flags: ${result.red_flags.join(", ")}\nURLs Found: ${result.urls_found?.join(", ") || "None"}\n\nReport at: https://cybercrime.gov.in\nHelpline: 1930`
    );
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const scoreColor = result ? (result.score >= 71 ? "#ef4444" : result.score >= 31 ? "#f97316" : "#22c55e") : "#6366f1";
  const riskLevel = result ? (result.score >= 71 ? "high" : result.score >= 31 ? "medium" : "safe") : "safe";
  const riskLabel = result ? (result.score >= 71 ? "HIGH RISK SCAM" : result.score >= 31 ? "SUSPICIOUS" : "LIKELY SAFE") : "";
  const riskEmoji = result ? (result.score >= 71 ? "🚨" : result.score >= 31 ? "⚠️" : "✅") : "";

  // Only show red flags section when scam probability > 30
  const showSuspiciousReasons = result && result.score > 30;

  return (
    <>
      <style>{css}</style>

      {/* Navbar */}
      <div style={{ background: "rgba(6,13,31,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🛡️</div>
          <div>
            {/* ✏️ RENAMED: AI SCAM DETECTOR → ScamShield */}
            <div style={{ fontSize: "16px", fontWeight: "800", letterSpacing: "-0.3px" }}>
              <span style={{ color: "#818cf8" }}>Scam</span>Shield
            </div>
            <div style={{ fontSize: "11px", color: "#475569" }}>Analyze messages & screenshots instantly</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {[
            { icon: "🤖", label: "AI POWERED", sub: "Smart Analysis", color: "#6366f1" },
            { icon: "⚡", label: "INSTANT", sub: "Results in Seconds", color: "#f59e0b" },
            { icon: "🔒", label: "PRIVACY FIRST", sub: "100% Secure", color: "#38bdf8" },
          ].map((f, i) => (
            <div key={i} className="feature-pill">
              <span>{f.icon}</span>
              <div>
                <div style={{ color: f.color, fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>{f.label}</div>
                <div style={{ fontSize: "10px", color: "#475569" }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 32px", display: "flex", gap: "32px" }}>
        {[
          { val: scanCount, label: "Scans This Session" },
          { val: "3", label: "Detection Layers" },
          { val: "1930", label: "Cyber Crime Helpline" },
          { val: "EN + HI", label: "Languages Supported" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px", fontWeight: "700", color: "#818cf8" }}>{s.val}</span>
            <span style={{ fontSize: "11px", color: "#475569" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: result || loading ? "1fr 1fr" : "560px", gap: "24px", justifyContent: "center" }}>

        {/* LEFT — Input */}
        <div style={{ background: "linear-gradient(180deg, #0d1526 0%, #0a1020 100%)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "20px", padding: "24px", animation: "fadeIn 0.5s ease both" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>💬</span>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#818cf8", letterSpacing: "0.5px" }}>ANALYZE YOUR MESSAGE</h2>
            </div>
            <p style={{ fontSize: "13px", color: "#475569" }}>Paste a message or upload a screenshot to check if it's a scam</p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button className={`tab-btn ${tab === "text" ? "tab-active" : "tab-inactive"}`} onClick={() => setTab("text")}>
              💬 TEXT MESSAGE
            </button>
            <button className={`tab-btn ${tab === "screenshot" ? "tab-active" : "tab-inactive"}`} onClick={() => setTab("screenshot")}>
              📷 SCREENSHOT (OCR)
            </button>
          </div>

          {tab === "text" ? (
            <div>
              <textarea value={text} onChange={e => { setText(e.target.value); setCharCount(e.target.value.length); }}
                placeholder={'Paste suspicious message here...\n\nExample: "URGENT! Your KYC is pending.\nClick here to verify: bank-update.in/kyc\nEnter OTP to activate your account."'}
                rows={7} maxLength={1000}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px", color: "white", padding: "14px", fontSize: "14px",
                  resize: "vertical", lineHeight: "1.6", transition: "border-color 0.2s, box-shadow 0.2s"
                }}
                onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
              />
              <div style={{ textAlign: "right", fontSize: "11px", color: "#334155", marginTop: "4px" }}>{charCount}/1000</div>
            </div>
          ) : (
            <label style={{
              display: "block", border: "2px dashed rgba(99,102,241,0.3)", borderRadius: "12px",
              padding: "32px", textAlign: "center", cursor: "pointer", transition: "all 0.2s",
              background: file ? "rgba(34,197,94,0.05)" : "rgba(99,102,241,0.04)"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)"; e.currentTarget.style.background = "rgba(99,102,241,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = file ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.3)"; e.currentTarget.style.background = file ? "rgba(34,197,94,0.05)" : "rgba(99,102,241,0.04)"; }}
            >
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{file ? "✅" : "📤"}</div>
              <div style={{ fontWeight: "600", marginBottom: "4px" }}>{file ? "File Ready" : "Upload Screenshot (Optional)"}</div>
              <div style={{ color: "#475569", fontSize: "12px" }}>{file ? file.name : "PNG, JPG, JPEG up to 5MB"}</div>
            </label>
          )}

          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 14px", color: "#fca5a5", fontSize: "13px", marginTop: "14px" }}>⚠️ {error}</div>}

          <button className="analyze-btn" onClick={analyze} disabled={loading} style={{ marginTop: "16px" }}>
            ✨ ANALYZE FOR SCAMS
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "12px", fontSize: "12px", color: "#334155" }}>
            🔒 Your data is secure and never stored. Analysis happens instantly.
          </div>

          {/* Pro tips */}
          <div style={{ marginTop: "20px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: "14px", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "16px" }}>💡</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#fbbf24" }}>PRO TIPS:</span>
            </div>
            {[
              "Forward suspicious UPI, OTP, or bank messages",
              "Take screenshots of suspicious WhatsApp/SMS",
              "Copy links from unknown senders to analyze",
            ].map((tip, i) => (
              <div key={i} className="pro-tip">
                <span style={{ color: "#22c55e", fontSize: "14px" }}>✓</span> {tip}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Results */}
        {(result || loading) && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.5s ease both" }}>

            {loading && (
              <div style={{ background: "linear-gradient(180deg, #0d1526 0%, #0a1020 100%)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "20px", padding: "24px" }}>
                <LoadingSpinner />
              </div>
            )}

            {result && !loading && (
              <>
                {/* Score card */}
                <div style={{ background: "linear-gradient(180deg, #0d1526 0%, #0a1020 100%)", border: `1px solid rgba(99,102,241,0.25)`, borderRadius: "20px", padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                    <span style={{ color: "#818cf8", fontSize: "14px" }}>✦</span>
                    <h2 style={{ fontSize: "15px", fontWeight: "800", color: "#818cf8", letterSpacing: "1px" }}>ANALYSIS RESULT</h2>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <SemiGauge score={result.score} color={scoreColor} />
                      <div style={{ marginTop: "12px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          padding: "6px 14px", borderRadius: "100px",
                          background: `${scoreColor}18`, color: scoreColor,
                          border: `1px solid ${scoreColor}30`, fontSize: "12px", fontWeight: "700"
                        }}>
                          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: scoreColor, display: "inline-block", animation: "pulseGlow 1.5s ease-in-out infinite" }} />
                          {riskLabel}
                        </span>
                      </div>
                    </div>

                    <div style={{ background: `${scoreColor}10`, border: `1px solid ${scoreColor}25`, borderRadius: "14px", padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "18px" }}>{riskEmoji}</span>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: scoreColor }}>
                          {result.score >= 71 ? "SCAM DETECTED" : result.score >= 31 ? "BE CAUTIOUS" : "LOOKS SAFE"}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6" }}>{result.reasoning}</p>
                      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", color: "#475569" }}>Type:</span>
                        <span style={{ fontSize: "11px", color: scoreColor, fontWeight: "600" }}>{result.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✏️ CHANGED: Only render red flags when score > 30 */}
                {showSuspiciousReasons && result.red_flags?.length > 0 && (
                  <div style={{ background: "linear-gradient(180deg, #0d1526 0%, #0a1020 100%)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                      <span style={{ fontSize: "16px" }}>⚠️</span>
                      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#fbbf24" }}>WHY THIS IS SUSPICIOUS:</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {result.red_flags.map((f, i) => (
                        <div key={i} className="flag-item" style={{ animationDelay: `${i * 0.07}s` }}>
                          <span style={{ fontSize: "16px" }}>🚩</span> {f}
                        </div>
                      ))}
                    </div>
                    {result.urls_found?.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        {result.urls_found.map((url, i) => (
                          <div key={i} className="flag-item" style={{ color: result.url_malicious ? "#fca5a5" : "#fdba74" }}>
                            <span>{result.url_malicious ? "⛔" : "⚠️"}</span>
                            <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{url}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* What to do */}
                <div style={{ background: "linear-gradient(180deg, #0d1a10 0%, #0a1020 100%)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "20px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <span style={{ fontSize: "18px" }}>🛡️</span>
                    <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#22c55e" }}>WHAT YOU SHOULD DO:</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {WHAT_TO_DO[riskLevel].map((a, i) => (
                      <div key={i} className="action-item" style={{ animationDelay: `${i * 0.08}s` }}>
                        <span style={{ fontSize: "18px", flexShrink: 0 }}>{a.icon}</span>
                        <span>{a.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "12px 14px", fontSize: "12px", color: "#475569", lineHeight: "1.5", marginBottom: "4px" }}>
                  ⚠️ AI tools can make mistakes. Always contact your bank directly. Report scams at <strong style={{ color: "#64748b" }}>cybercrime.gov.in</strong> or call <strong style={{ color: "#64748b" }}>1930</strong>.
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="report-btn" onClick={copyReport}>📋 Copy Report for 1930</button>
                  <button className="reset-btn" onClick={() => { setResult(null); setText(""); setFile(null); setCharCount(0); }}>🔄 Scan Another</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "12px", color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}>
          🛡️ Built for your safety · Powered by AI & Machine Learning
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          {["🌐 English & Hindi", "📱 Mobile Friendly", "⚡ Free to Use"].map((f, i) => (
            <span key={i} style={{ fontSize: "12px", color: "#334155" }}>{f}</span>
          ))}
        </div>
      </div>

      <div className={`toast ${toast ? "show" : ""}`}>✓ Report copied to clipboard!</div>
    </>
  );
}

/*

cd C:\Users\HP\scam-detector
uvicorn main:app --reload

cd C:\Users\HP\scam-detector-ui
npm start

*/