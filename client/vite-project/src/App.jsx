import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- Web Audio Sound Engine ---
const playSound = (type = 'click', isMuted = false) => {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'tab') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.06);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch {
    // Ignore audio errors on unsupported browsers
  }
};

// --- Helper JSON to TypeScript / Zod Generator ---
const generateTypeScript = (obj, rootName = 'RootObject') => {
  if (typeof obj !== 'object' || obj === null) return `type ${rootName} = any;`;

  const interfaces = [];
  const parseObject = (o, name) => {
    let lines = [`export interface ${name} {`];
    for (const [key, value] of Object.entries(o)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      if (value === null) {
        lines.push(`  ${safeKey}: any | null;`);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          lines.push(`  ${safeKey}: any[];`);
        } else if (typeof value[0] === 'object' && value[0] !== null) {
          const subName = `${name}${key.charAt(0).toUpperCase() + key.slice(1, -1 || 1)}`;
          parseObject(value[0], subName);
          lines.push(`  ${safeKey}: ${subName}[];`);
        } else {
          lines.push(`  ${safeKey}: ${typeof value[0]}[];`);
        }
      } else if (typeof value === 'object') {
        const subName = `${name}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        parseObject(value, subName);
        lines.push(`  ${safeKey}: ${subName};`);
      } else {
        lines.push(`  ${safeKey}: ${typeof value};`);
      }
    }
    lines.push('}');
    interfaces.unshift(lines.join('\n'));
  };

  parseObject(obj, rootName);
  return interfaces.join('\n\n');
};

const generateZodSchema = (obj, rootName = 'rootSchema') => {
  if (typeof obj !== 'object' || obj === null) return `import { z } from 'zod';\n\nexport const ${rootName} = z.any();`;

  const schemas = [];
  const parseObject = (o, name) => {
    let lines = [`export const ${name} = z.object({`];
    for (const [key, value] of Object.entries(o)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      if (value === null) {
        lines.push(`  ${safeKey}: z.any().nullable(),`);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          lines.push(`  ${safeKey}: z.array(z.any()),`);
        } else if (typeof value[0] === 'object' && value[0] !== null) {
          const subName = `${name}_${key}_item`;
          parseObject(value[0], subName);
          lines.push(`  ${safeKey}: z.array(${subName}),`);
        } else if (typeof value[0] === 'number') {
          lines.push(`  ${safeKey}: z.array(z.number()),`);
        } else if (typeof value[0] === 'boolean') {
          lines.push(`  ${safeKey}: z.array(z.boolean()),`);
        } else {
          lines.push(`  ${safeKey}: z.array(z.string()),`);
        }
      } else if (typeof value === 'object') {
        const subName = `${name}_${key}`;
        parseObject(value, subName);
        lines.push(`  ${safeKey}: ${subName},`);
      } else if (typeof value === 'number') {
        lines.push(`  ${safeKey}: z.number(),`);
      } else if (typeof value === 'boolean') {
        lines.push(`  ${safeKey}: z.boolean(),`);
      } else {
        lines.push(`  ${safeKey}: z.string(),`);
      }
    }
    lines.push('});');
    schemas.unshift(lines.join('\n'));
  };

  parseObject(obj, rootName);
  return `import { z } from 'zod';\n\n` + schemas.join('\n\n');
};

// Preset sample data
const PRESET_JSONS = {
  user: JSON.stringify(
    {
      id: "usr_9921",
      name: "Abdul Rehman",
      email: "abdulrehman.engineer@gmail.com",
      role: "Lead Full Stack Architect",
      isActive: true,
      stats: {
        projectsShipped: 48,
        rating: 4.98,
        contributions: 1420
      },
      skills: ["React 19", "TypeScript", "Node.js", "Next.js", "TailwindCSS"],
      settings: {
        theme: "dark",
        notifications: true,
        twoFactorAuth: true
      }
    },
    null,
    2
  ),
  order: JSON.stringify(
    {
      orderId: "ORD-2026-9041",
      customer: "Sara Khan",
      currency: "PKR",
      totalAmount: 48500,
      paymentMethod: "EasyPaisa",
      isPaid: true,
      items: [
        { sku: "SNK-01", name: "Cyber Stride Runner", qty: 1, price: 24000 },
        { sku: "ACC-99", name: "Titanium Keycap Set", qty: 2, price: 12250 }
      ],
      shippingAddress: {
        city: "Karachi",
        province: "Sindh",
        postalCode: "75300",
        country: "Pakistan"
      }
    },
    null,
    2
  ),
  metrics: JSON.stringify(
    {
      timestamp: "2026-10-15T22:00:00Z",
      status: "healthy",
      uptimeSeconds: 849200,
      system: {
        cpuUsage: "18.4%",
        memoryUsage: "4.2 GB / 16 GB",
        activeThreads: 64
      },
      endpoints: [
        { route: "/api/v1/auth", latencyMs: 18, requestsPerMin: 1240 },
        { route: "/api/v1/shoes", latencyMs: 24, requestsPerMin: 890 }
      ]
    },
    null,
    2
  )
};

export default function App() {
  const [activeTab, setActiveTab] = useState('schema');
  const [isMuted, setIsMuted] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    playSound(type === 'error' ? 'click' : 'success', isMuted);
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const copyToClipboard = (text, label = 'Content') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`);
    }
  };

  const handleTabChange = (tab) => {
    playSound('tab', isMuted);
    setActiveTab(tab);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#070a13', color: '#f8fafc' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <span>{toast.type === 'error' ? '⚠️' : '✨'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Global Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(11, 16, 27, 0.85)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(to right, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  DevPulse
                </h1>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                  REACT 19 SUITE
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>High-Performance Engineering Platform • by Abdul Rehman</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Live System Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '12px',
                color: '#34d399',
                fontWeight: 600
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
              All Engines Online
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                playSound('click', isMuted);
              }}
              title={isMuted ? "Enable Sound FX" : "Mute Sound FX"}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: isMuted ? '#64748b' : '#38bdf8',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              {isMuted ? '🔇 Audio Off' : '🔊 Audio On'}
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/Abdulrehman00000/React_Project"
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub Source
            </a>

            {/* Back to Portfolio Link */}
            <a
              href="http://localhost:5500"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
            >
              Portfolio Hub ↗
            </a>
          </div>
        </div>

        {/* Studio Tool Tabs */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { id: 'schema', label: 'Schema Studio', icon: '⚡', desc: 'JSON to TS & Zod' },
            { id: 'regex', label: 'RegEx Lab', icon: '🧪', desc: 'Interactive Matcher' },
            { id: 'glass', label: 'CSS Glass Lab', icon: '🎨', desc: 'Glassmorphism & Shadows' },
            { id: 'hooks', label: 'React Hooks Vault', icon: '🪝', desc: 'Production Hooks' },
            { id: 'api', label: 'API Sandbox', icon: '🌐', desc: 'HTTP Mock Tester' },
            { id: 'scratchpad', label: 'Dev Scratchpad', icon: '📝', desc: 'Markdown & Notes' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #6366f1' : '3px solid transparent',
                  padding: '12px 16px',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s'
                }}
              >
                <span style={{ fontSize: '15px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
                <span style={{ fontSize: '10px', color: isActive ? '#818cf8' : '#475569', display: 'none' }}>
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Workspace */}
      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '28px 24px' }}>
        {activeTab === 'schema' && (
          <SchemaStudioTab
            onCopy={copyToClipboard}
            showToast={showToast}
            isMuted={isMuted}
          />
        )}
        {activeTab === 'regex' && (
          <RegexLabTab
            onCopy={copyToClipboard}
            showToast={showToast}
            isMuted={isMuted}
          />
        )}
        {activeTab === 'glass' && (
          <GlassStudioTab
            onCopy={copyToClipboard}
            showToast={showToast}
            isMuted={isMuted}
          />
        )}
        {activeTab === 'hooks' && (
          <HooksVaultTab
            onCopy={copyToClipboard}
            showToast={showToast}
            isMuted={isMuted}
          />
        )}
        {activeTab === 'api' && (
          <ApiSandboxTab
            onCopy={copyToClipboard}
            showToast={showToast}
            isMuted={isMuted}
          />
        )}
        {activeTab === 'scratchpad' && (
          <ScratchpadTab
            onCopy={copyToClipboard}
            showToast={showToast}
            isMuted={isMuted}
          />
        )}
      </main>

      {/* Signature Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#05070e',
          padding: '32px 24px',
          marginTop: 'auto'
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>DevPulse Platform</span>
              <span style={{ fontSize: '11px', color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '4px' }}>v2.5 Release</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Engineered & Designed by <strong style={{ color: '#e2e8f0' }}>Abdul Rehman</strong> • Full Stack Software Engineer • Karachi, Pakistan
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/923183707098"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#10b981', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <span>💬</span> WhatsApp: +92 318 3707098
            </a>
            <a
              href="mailto:abdulrehman.engineer@gmail.com"
              style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <span>✉️</span> Contact Developer
            </a>
            <div style={{ color: '#475569', fontSize: '12px' }}>
              Built with React 19 • Vite • Web Audio API
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// TAB 1: SCHEMA STUDIO (JSON to TS & ZOD)
// ==========================================
function SchemaStudioTab({ onCopy, showToast, isMuted }) {
  const [inputJson, setInputJson] = useState(PRESET_JSONS.user);
  const [outputMode, setOutputMode] = useState('typescript'); // 'typescript' | 'zod'
  const [rootInterfaceName, setRootInterfaceName] = useState('UserProfile');
  const [errorMsg, setErrorMsg] = useState(null);

  // Compute generated code
  const generatedCode = useMemo(() => {
    try {
      setErrorMsg(null);
      const parsed = JSON.parse(inputJson);
      if (outputMode === 'typescript') {
        return generateTypeScript(parsed, rootInterfaceName || 'Root');
      } else {
        return generateZodSchema(parsed, `${rootInterfaceName.toLowerCase() || 'root'}Schema`);
      }
    } catch (err) {
      setErrorMsg(err.message);
      return `// ⚠️ JSON Parse Error:\n// ${err.message}\n\n// Please check the syntax in the JSON input editor.`;
    }
  }, [inputJson, outputMode, rootInterfaceName]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed, null, 2));
      showToast('JSON beautified successfully!');
    } catch {
      showToast('Invalid JSON, cannot format', 'error');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed));
      showToast('JSON minified!');
    } catch {
      showToast('Invalid JSON, cannot minify', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tab Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
            ⚡ Schema & Type Studio
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Instantly convert raw JSON payloads into production-grade TypeScript interfaces and runtime Zod validation schemas.
          </p>
        </div>

        {/* Sample Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Quick Presets:</span>
          <button
            onClick={() => {
              setInputJson(PRESET_JSONS.user);
              setRootInterfaceName('UserProfile');
              showToast('Loaded User Profile preset');
            }}
            style={presetBtnStyle}
          >
            👤 User
          </button>
          <button
            onClick={() => {
              setInputJson(PRESET_JSONS.order);
              setRootInterfaceName('EcomOrder');
              showToast('Loaded E-Commerce Order preset');
            }}
            style={presetBtnStyle}
          >
            📦 E-Commerce
          </button>
          <button
            onClick={() => {
              setInputJson(PRESET_JSONS.metrics);
              setRootInterfaceName('SystemMetrics');
              showToast('Loaded System Metrics preset');
            }}
            style={presetBtnStyle}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Editor Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Left Side: JSON Input */}
        <div style={panelContainerStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#f1f5f9' }}>INPUT JSON</span>
              {errorMsg && (
                <span style={{ fontSize: '11px', color: '#f87171', background: 'rgba(239,68,68,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                  Syntax Error
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleFormat} style={toolActionBtnStyle}>
                ✨ Prettify
              </button>
              <button onClick={handleMinify} style={toolActionBtnStyle}>
                📦 Minify
              </button>
            </div>
          </div>

          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            className="code-font"
            style={{
              width: '100%',
              height: '480px',
              backgroundColor: '#0a0f1d',
              color: '#38bdf8',
              border: errorMsg ? '1px solid rgba(239,68,68,0.5)' : 'none',
              padding: '16px',
              fontSize: '13px',
              lineHeight: '1.6',
              resize: 'vertical',
              outline: 'none',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px'
            }}
            placeholder="Paste your JSON object here..."
          />
        </div>

        {/* Right Side: Generated Types / Zod */}
        <div style={panelContainerStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setOutputMode('typescript')}
                style={{
                  ...modeToggleBtnStyle,
                  backgroundColor: outputMode === 'typescript' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                  color: outputMode === 'typescript' ? '#fff' : '#94a3b8'
                }}
              >
                TypeScript (.ts)
              </button>
              <button
                onClick={() => setOutputMode('zod')}
                style={{
                  ...modeToggleBtnStyle,
                  backgroundColor: outputMode === 'zod' ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                  color: outputMode === 'zod' ? '#fff' : '#94a3b8'
                }}
              >
                Zod Schema (z.object)
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                value={rootInterfaceName}
                onChange={(e) => setRootInterfaceName(e.target.value)}
                placeholder="RootType"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  width: '110px'
                }}
              />
              <button
                onClick={() => onCopy(generatedCode, outputMode === 'typescript' ? 'TypeScript types' : 'Zod schemas')}
                style={{
                  ...toolActionBtnStyle,
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>

          <pre
            className="code-font"
            style={{
              margin: 0,
              padding: '16px',
              backgroundColor: '#0a0f1d',
              color: outputMode === 'typescript' ? '#a5b4fc' : '#c084fc',
              height: '480px',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: '1.6',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              whiteSpace: 'pre-wrap'
            }}
          >
            {generatedCode}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TAB 2: REGEX LIVE TESTER & PLAYGROUND
// ==========================================
function RegexLabTab({ onCopy, showToast }) {
  const [pattern, setPattern] = useState('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');
  const [flags, setFlags] = useState({ g: true, i: true, m: false });
  const [testString, setTestString] = useState(
    `Contact developer at abdulrehman.engineer@gmail.com for enterprise inquiries.
Alternative address: support@atelier-vendome.luxury
Invalid samples: user@.com, test_no_at_domain, admin@domain`
  );

  const PRESET_PATTERNS = [
    { label: 'Email Validator', regex: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$', flags: { g: true, i: true, m: false } },
    { label: 'Pakistan Phone (+92)', regex: '(?:\\+92|0092|0)?(3[0-9]{2})[\\s-]?[0-9]{7}', flags: { g: true, i: false, m: false } },
    { label: 'URL / HTTPS Link', regex: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)', flags: { g: true, i: true, m: false } },
    { label: 'Hex Color (#fff)', regex: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', flags: { g: true, i: true, m: false } },
    { label: 'IPv4 Address', regex: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', flags: { g: true, i: false, m: false } },
    { label: 'Strong Password', regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', flags: { g: false, i: false, m: false } }
  ];

  // Evaluate RegEx matches
  const { matches, isValid, error } = useMemo(() => {
    try {
      const activeFlags = Object.keys(flags).filter((f) => flags[f]).join('');
      const rx = new RegExp(pattern, activeFlags);
      const allMatches = [];

      if (flags.g) {
        let match;
        while ((match = rx.exec(testString)) !== null) {
          allMatches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (match.index === rx.lastIndex) rx.lastIndex++;
        }
      } else {
        const single = rx.exec(testString);
        if (single) {
          allMatches.push({
            value: single[0],
            index: single.index,
            groups: single.slice(1)
          });
        }
      }

      return { matches: allMatches, isValid: true, error: null };
    } catch (err) {
      return { matches: [], isValid: false, error: err.message };
    }
  }, [pattern, flags, testString]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
          🧪 RegEx Live Tester & Regex Forge
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Real-time JavaScript regular expression matcher with flag toggles, capture group inspectors, and production patterns.
        </p>
      </div>

      {/* Preset Library */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Patterns:</span>
        {PRESET_PATTERNS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPattern(p.regex);
              setFlags(p.flags);
              showToast(`Loaded ${p.label}`);
            }}
            style={presetBtnStyle}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* RegEx Input Box with Flags */}
      <div style={{ ...panelContainerStyle, padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: '#6366f1', fontSize: '20px', fontWeight: 700 }}>/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="code-font"
            placeholder="Type regex pattern (e.g. [a-z0-9]+)..."
            style={{
              flex: 1,
              minWidth: '260px',
              backgroundColor: '#0a0f1d',
              border: isValid ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(239,68,68,0.6)',
              color: '#38bdf8',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <span style={{ color: '#6366f1', fontSize: '20px', fontWeight: 700 }}>/</span>

          {/* Flag Checkboxes */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {['g', 'i', 'm'].map((flag) => (
              <button
                key={flag}
                onClick={() => setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }))}
                style={{
                  background: flags[flag] ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.04)',
                  border: flags[flag] ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                  color: flags[flag] ? '#818cf8' : '#64748b',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                {flag} ({flag === 'g' ? 'global' : flag === 'i' ? 'ignoreCase' : 'multiline'})
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ color: '#f87171', fontSize: '13px', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '6px' }}>
            ⚠️ RegEx Syntax Error: {error}
          </div>
        )}
      </div>

      {/* Test String & Live Match Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        <div style={panelContainerStyle}>
          <div style={panelHeaderStyle}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#f1f5f9' }}>TEST STRING</span>
            <button
              onClick={() => {
                setTestString('');
                showToast('Cleared test text');
              }}
              style={toolActionBtnStyle}
            >
              Clear
            </button>
          </div>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="code-font"
            style={{
              width: '100%',
              height: '340px',
              backgroundColor: '#0a0f1d',
              color: '#e2e8f0',
              border: 'none',
              padding: '16px',
              fontSize: '13px',
              lineHeight: '1.6',
              resize: 'vertical',
              outline: 'none',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px'
            }}
            placeholder="Type or paste text to test regex matches..."
          />
        </div>

        {/* Results Inspector */}
        <div style={panelContainerStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#f1f5f9' }}>MATCHES DETECTED</span>
              <span
                style={{
                  backgroundColor: matches.length > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                  color: matches.length > 0 ? '#34d399' : '#64748b',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
              >
                {matches.length} found
              </span>
            </div>
            {matches.length > 0 && (
              <button
                onClick={() => onCopy(matches.map((m) => m.value).join('\n'), 'Matches')}
                style={{ ...toolActionBtnStyle, backgroundColor: '#10b981', color: '#fff', border: 'none' }}
              >
                Copy All Matches
              </button>
            )}
          </div>

          <div style={{ height: '340px', overflow: 'auto', padding: '16px', backgroundColor: '#0a0f1d', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
            {matches.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '60px', fontSize: '14px' }}>
                No matches found for current pattern and test string.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {matches.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 700 }}>#{idx + 1}</span>
                        <code style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 600 }}>{m.value}</code>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Index: {m.index}</span>
                    </div>
                    <button
                      onClick={() => onCopy(m.value, `Match #${idx + 1}`)}
                      style={{ ...toolActionBtnStyle, padding: '4px 8px', fontSize: '11px' }}
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TAB 3: CSS GLASSMORPHISM & SHADOW LAB
// ==========================================
function GlassStudioTab({ onCopy, showToast }) {
  const [blur, setBlur] = useState(16);
  const [bgOpacity, setBgOpacity] = useState(25);
  const [borderOpacity, setBorderOpacity] = useState(20);
  const [radius, setRadius] = useState(16);
  const [shadowElevation, setShadowElevation] = useState(24);
  const [gradientPreset, setGradientPreset] = useState('midnight');

  const GRADIENTS = {
    midnight: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%)',
    cyber: 'linear-gradient(135deg, #090d16 0%, #172554 50%, #042f2e 100%)',
    sunset: 'linear-gradient(135deg, #451a03 0%, #1e1b4b 50%, #090d16 100%)',
    emerald: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #090d16 100%)'
  };

  const cssCode = `/* Glassmorphism Generated by DevPulse */
background: rgba(255, 255, 255, ${(bgOpacity / 100).toFixed(2)});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: ${radius}px;
border: 1px solid rgba(255, 255, 255, ${(borderOpacity / 100).toFixed(2)});
box-shadow: 0 ${Math.round(shadowElevation * 0.4)}px ${shadowElevation}px rgba(0, 0, 0, 0.45);`;

  const tailwindCode = `bg-white/[${(bgOpacity / 100).toFixed(2)}] backdrop-blur-[${blur}px] rounded-[${radius}px] border border-white/[${(borderOpacity / 100).toFixed(2)}] shadow-[0_${Math.round(shadowElevation * 0.4)}px_${shadowElevation}px_rgba(0,0,0,0.45)]`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
          🎨 CSS Glassmorphism & Shadow Designer
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Interactive visual designer for frosted modern glass panels, glowing borders, and realistic shadow elevations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Controls Panel */}
        <div style={{ ...panelContainerStyle, padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
            Visual Parameters
          </h3>

          {/* Blur */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>
              <span>Backdrop Blur</span>
              <strong style={{ color: '#38bdf8' }}>{blur}px</strong>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Background Opacity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>
              <span>Glass Tint Opacity</span>
              <strong style={{ color: '#38bdf8' }}>{bgOpacity}%</strong>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              value={bgOpacity}
              onChange={(e) => setBgOpacity(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Border Opacity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>
              <span>Border Glow Opacity</span>
              <strong style={{ color: '#38bdf8' }}>{borderOpacity}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={borderOpacity}
              onChange={(e) => setBorderOpacity(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Radius */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>
              <span>Corner Radius</span>
              <strong style={{ color: '#38bdf8' }}>{radius}px</strong>
            </div>
            <input
              type="range"
              min="4"
              max="40"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Shadow Elevation */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>
              <span>Shadow Elevation</span>
              <strong style={{ color: '#38bdf8' }}>{shadowElevation}px</strong>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={shadowElevation}
              onChange={(e) => setShadowElevation(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Background Stage Presets */}
          <div>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Stage Ambient:</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.keys(GRADIENTS).map((k) => (
                <button
                  key={k}
                  onClick={() => setGradientPreset(k)}
                  style={{
                    ...presetBtnStyle,
                    borderColor: gradientPreset === k ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    color: gradientPreset === k ? '#818cf8' : '#64748b',
                    textTransform: 'capitalize'
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              height: '340px',
              borderRadius: '16px',
              background: GRADIENTS[gradientPreset],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient colorful orbs behind glass */}
            <div
              style={{
                position: 'absolute',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: '#6366f1',
                filter: 'blur(50px)',
                top: '20px',
                left: '40px',
                opacity: 0.6
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: '#06b6d4',
                filter: 'blur(40px)',
                bottom: '30px',
                right: '40px',
                opacity: 0.5
              }}
            />

            {/* Generated Glass Card */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                maxWidth: '360px',
                padding: '24px',
                background: `rgba(255, 255, 255, ${bgOpacity / 100})`,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                borderRadius: `${radius}px`,
                border: `1px solid rgba(255, 255, 255, ${borderOpacity / 100})`,
                boxShadow: `0 ${Math.round(shadowElevation * 0.4)}px ${shadowElevation}px rgba(0, 0, 0, 0.45)`,
                color: '#fff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '16px'
                  }}
                >
                  AR
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Abdul Rehman</h4>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)' }}>Principal React Engineer</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>
                High-performance glass UI component rendered dynamically with hardware acceleration and zero lag.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.2)' }}>
                  Glassmorphism
                </span>
                <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.2)' }}>
                  Live Preview
                </span>
              </div>
            </div>
          </div>

          {/* Generated Code Boxes */}
          <div style={panelContainerStyle}>
            <div style={panelHeaderStyle}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#f1f5f9' }}>CSS DECLARATION</span>
              <button onClick={() => onCopy(cssCode, 'Vanilla CSS')} style={toolActionBtnStyle}>
                Copy CSS
              </button>
            </div>
            <pre className="code-font" style={{ margin: 0, padding: '14px', backgroundColor: '#0a0f1d', color: '#38bdf8', fontSize: '12px', overflow: 'auto' }}>
              {cssCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TAB 4: REACT HOOKS PRODUCTION VAULT
// ==========================================
function HooksVaultTab({ onCopy, showToast }) {
  // Demo states
  const [debounceInput, setDebounceInput] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [storageCount, setStorageCount] = useState(() => {
    return Number(localStorage.getItem('devpulse_demo_counter') || 42);
  });
  const [isCopied, setIsCopied] = useState(false);
  const [toggleState, setToggleState] = useState(true);

  // Debounce simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(debounceInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [debounceInput]);

  const updateCounter = (delta) => {
    const next = storageCount + delta;
    setStorageCount(next);
    localStorage.setItem('devpulse_demo_counter', String(next));
  };

  const HOOKS = [
    {
      name: 'useDebounce',
      desc: 'Delays updating state until a specified delay has elapsed, preventing expensive re-renders and excessive API calls on rapid input.',
      code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
      demo: (
        <div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
            Type rapidly below (debounces 500ms):
          </div>
          <input
            type="text"
            value={debounceInput}
            onChange={(e) => setDebounceInput(e.target.value)}
            placeholder="Search API query..."
            style={demoInputStyle}
          />
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#cbd5e1' }}>
            Debounced Value:{' '}
            <strong style={{ color: '#38bdf8' }}>{debouncedValue || '(awaiting input)'}</strong>
          </div>
        </div>
      )
    },
    {
      name: 'useLocalStorage',
      desc: 'Seamlessly synchronizes React component state with the browser localStorage, persisting state across reloads and browser sessions.',
      code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}`,
      demo: (
        <div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
            Synced Counter across page reloads:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => updateCounter(-1)} style={counterBtnStyle}>
              -1
            </button>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', minWidth: '40px', textAlign: 'center' }}>
              {storageCount}
            </span>
            <button onClick={() => updateCounter(+1)} style={counterBtnStyle}>
              +1
            </button>
          </div>
        </div>
      )
    },
    {
      name: 'useCopyToClipboard',
      desc: 'Copies arbitrary text strings to the system clipboard with status feedback and automatic timeout reset.',
      code: `import { useState, useCallback } from 'react';

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) return false;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  return [copiedText, copy] as const;
}`,
      demo: (
        <div>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText('Abdul Rehman — Full Stack Engineer');
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }
            }}
            style={{
              ...presetBtnStyle,
              backgroundColor: isCopied ? '#10b981' : 'rgba(99,102,241,0.2)',
              color: '#fff',
              padding: '8px 16px'
            }}
          >
            {isCopied ? '✓ Copied Name!' : 'Click to Test Clipboard'}
          </button>
        </div>
      )
    },
    {
      name: 'useToggle',
      desc: 'Ergonomic boolean toggle state manager with optional direct force true/false assignments.',
      code: `import { useState, useCallback } from 'react';

export function useToggle(initial: boolean = false) {
  const [state, setState] = useState(initial);
  const toggle = useCallback(() => setState((v) => !v), []);
  return [state, toggle] as const;
}`,
      demo: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setToggleState(!toggleState)}
            style={{
              background: toggleState ? '#10b981' : '#475569',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {toggleState ? 'SWITCH: ON' : 'SWITCH: OFF'}
          </button>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>State: {toggleState ? 'true' : 'false'}</span>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
          🪝 React 19 Custom Hooks Vault
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Production-tested React utility hooks with TypeScript generics, interactive playgrounds, and zero external dependencies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
        {HOOKS.map((hook, idx) => (
          <div key={idx} style={panelContainerStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '15px', color: '#38bdf8' }}>{hook.name}</span>
              </div>
              <button onClick={() => onCopy(hook.code, hook.name)} style={toolActionBtnStyle}>
                Copy Hook Code
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px', lineHeight: 1.5 }}>
                {hook.desc}
              </p>

              {/* Live Demo Widget Box */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '14px'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', marginBottom: '6px' }}>
                  ⚡ LIVE INTERACTIVE TEST
                </div>
                {hook.demo}
              </div>

              {/* Code Snippet */}
              <pre
                className="code-font"
                style={{
                  margin: 0,
                  padding: '12px',
                  backgroundColor: '#0a0f1d',
                  color: '#a5b4fc',
                  fontSize: '12px',
                  borderRadius: '8px',
                  maxHeight: '220px',
                  overflow: 'auto',
                  lineHeight: '1.5'
                }}
              >
                {hook.code}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// TAB 5: API SANDBOX & MOCK HTTP STUDIO
// ==========================================
function ApiSandboxTab({ onCopy, showToast }) {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState({
    status: 200,
    timeMs: 42,
    size: '1.2 KB',
    data: {
      userId: 1,
      id: 1,
      title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      body: "quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"
    }
  });

  const handleSend = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(url, { method });
      const elapsed = Math.round(performance.now() - start);
      const json = await res.json();
      setResponse({
        status: res.status,
        timeMs: elapsed,
        size: `${(JSON.stringify(json).length / 1024).toFixed(1)} KB`,
        data: json
      });
      showToast(`Request complete: ${res.status} OK`);
    } catch {
      // Mock fallback if CORS prevents live call
      const elapsed = Math.round(performance.now() - start);
      setResponse({
        status: 200,
        timeMs: elapsed || 38,
        size: '1.8 KB',
        data: {
          success: true,
          message: "Live API response simulated via DevPulse engine",
          endpoint: url,
          method: method,
          timestamp: new Date().toISOString(),
          payload: {
            developer: "Abdul Rehman",
            service: "High-Performance API Mock Gateway",
            region: "ap-south-1"
          }
        }
      });
      showToast('Mock response generated');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
          🌐 API Sandbox & Mock HTTP Tester
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Send live HTTP requests or mock RESTful endpoints with latency metrics, payload inspectors, and response headers.
        </p>
      </div>

      {/* URL & Method Bar */}
      <div style={{ ...panelContainerStyle, padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{
            backgroundColor: '#0a0f1d',
            border: '1px solid rgba(255,255,255,0.1)',
            color: method === 'GET' ? '#34d399' : method === 'POST' ? '#38bdf8' : '#f59e0b',
            fontWeight: 800,
            padding: '10px 14px',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '13px'
          }}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="code-font"
          placeholder="https://api.example.com/endpoint..."
          style={{
            flex: 1,
            minWidth: '280px',
            backgroundColor: '#0a0f1d',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            outline: 'none'
          }}
        />

        <button
          onClick={handleSend}
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: isLoading ? 'wait' : 'pointer',
            boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
            fontSize: '13px'
          }}
        >
          {isLoading ? 'Sending...' : '🚀 Send Request'}
        </button>
      </div>

      {/* Response Panel */}
      <div style={panelContainerStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#f1f5f9' }}>RESPONSE BODY</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              STATUS: {response.status} OK
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Time: {response.timeMs}ms</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Size: {response.size}</span>
          </div>

          <button
            onClick={() => onCopy(JSON.stringify(response.data, null, 2), 'Response JSON')}
            style={toolActionBtnStyle}
          >
            Copy JSON
          </button>
        </div>

        <pre
          className="code-font"
          style={{
            margin: 0,
            padding: '16px',
            backgroundColor: '#0a0f1d',
            color: '#38bdf8',
            fontSize: '13px',
            lineHeight: '1.6',
            height: '400px',
            overflow: 'auto',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px'
          }}
        >
          {JSON.stringify(response.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ==========================================
// TAB 6: DEV SCRATCHPAD & MARKDOWN LAB
// ==========================================
function ScratchpadTab({ onCopy, showToast }) {
  const [content, setContent] = useState(() => {
    return (
      localStorage.getItem('devpulse_scratchpad') ||
      `# 🚀 DevPulse Engineering Notes

- [x] Integrate high-resolution luxury shoe assets for Atelier Vendôme
- [x] Configure static JSON database fallback for Ladies Jewellery
- [x] Rebuild TechStore with dynamic sound effects & EasyPaisa drawer
- [x] Deploy DevPulse React 19 Studio platform
- [ ] Connect custom domain to GitHub Pages

### Architecture Notes
All client-side routing uses \`HashRouter\` to eliminate 404 errors on GitHub Pages subpaths.
Vite assets are configured with \`base: './'\` for full relative asset resolution.`
    );
  });

  const handleTextChange = (e) => {
    const val = e.target.value;
    setContent(val);
    localStorage.setItem('devpulse_scratchpad', val);
  };

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
          📝 Developer Scratchpad & Markdown Lab
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Persistent local scratchpad for developer notes, architecture drafts, and snippet staging. Autosaved locally.
        </p>
      </div>

      <div style={panelContainerStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
            <span>Words: <strong style={{ color: '#38bdf8' }}>{wordCount}</strong></span>
            <span>Characters: <strong style={{ color: '#38bdf8' }}>{content.length}</strong></span>
            <span style={{ color: '#10b981' }}>● Auto-saved to LocalStorage</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onCopy(content, 'Scratchpad notes')} style={toolActionBtnStyle}>
              Copy Notes
            </button>
            <button
              onClick={() => {
                setContent('');
                localStorage.removeItem('devpulse_scratchpad');
                showToast('Cleared scratchpad');
              }}
              style={toolActionBtnStyle}
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={content}
          onChange={handleTextChange}
          className="code-font"
          style={{
            width: '100%',
            height: '460px',
            backgroundColor: '#0a0f1d',
            color: '#e2e8f0',
            border: 'none',
            padding: '18px',
            fontSize: '14px',
            lineHeight: '1.7',
            outline: 'none',
            resize: 'vertical',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px'
          }}
          placeholder="Type your notes or markdown here..."
        />
      </div>
    </div>
  );
}

// ==========================================
// REUSABLE INLINE STYLES
// ==========================================
const panelContainerStyle = {
  backgroundColor: '#0c1222',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
};

const panelHeaderStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  padding: '12px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '10px'
};

const presetBtnStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#cbd5e1',
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const toolActionBtnStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#e2e8f0',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const modeToggleBtnStyle = {
  border: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer'
};

const demoInputStyle = {
  width: '100%',
  backgroundColor: '#0a0f1d',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#38bdf8',
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  outline: 'none'
};

const counterBtnStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 800,
  fontSize: '14px'
};
