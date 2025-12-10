import { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import './App.css';
// import { supabase } from './supabaseClient';
// window.supabase = supabase;

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [displayedOutput, setDisplayedOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamTimerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [lockedPanel, setLockedPanel] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(10);
  const [tokenUsage, setTokenUsage] = useState(0);

  const HOST_EMAIL = process.env.REACT_APP_HOST_EMAIL || 'host@example.com';

  useEffect(() => {
  const hash = window.location.hash;
  if (hash.includes("access_token") && typeof window.supabase !== "undefined" && window.supabase) {
    window.supabase.auth.getSession().then(({ data: session }) => {
      if (session?.session?.user) {
        console.log("🛠️ Session manually recovered:", session.session.user);
        setUserEmail(session.session.user.email);
        window.location.hash = ""; // remove token fragment from URL
      }
    });
  }
}, []);
 
  
  useEffect(() => {
    if (typeof window.supabase !== "undefined" && window.supabase) {
      const { data: listener } = window.supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          console.log("🧠 Supabase session restored:", session.user);
          setUserEmail(session.user.email);
        }
      });
      return () => listener.subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      if (typeof window.supabase === "undefined" || !window.supabase) {
        return;
      }
      const { data, error } = await window.supabase.auth.getUser();
      console.log("🧠 Supabase getUser() result:", data, error);

      const user = data?.user;
      if (user) {
        const email = user.email;
        setUserEmail(email);
        if (email === HOST_EMAIL) {
          setUsageLimit(Infinity);
          return;
        }

        const { data: profiles, error } = await window.supabase
          .from('users')
          .select('usage_count, is_paid')
          .eq('email', email);

        const profile = profiles?.[0];

        if (error && error.code === 'PGRST116') {
          await window.supabase.from('users').insert({ email, usage_count: 0, is_paid: false });
          setUsageLimit(25);
        } else if (profile) {
          const limit = profile.is_paid ? 100 : 25;
          setUsageLimit(limit);
          setUsageCount(profile.usage_count);
        } else {
          await window.supabase.from('users').insert({ email, usage_count: 0, is_paid: false });
          setUsageLimit(25);
          setUsageCount(0);
        }
      }
    };
    getUser();
  }, []);

  const stopStreaming = () => {
    if (streamTimerRef.current !== null) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setIsStreaming(false);
  };

  const startStreaming = (fullText) => {
    stopStreaming();
    setIsStreaming(true);
    setDisplayedOutput('');
    
    const CHUNK_SIZE = 8;
    const INTERVAL_MS = 20;
    let index = 0;
    
    streamTimerRef.current = setInterval(() => {
      index += CHUNK_SIZE;
      if (index >= fullText.length) {
        setDisplayedOutput(fullText);
        stopStreaming();
      } else {
        setDisplayedOutput(fullText.slice(0, index));
      }
    }, INTERVAL_MS);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!userEmail) {
      const localUsage = Number(localStorage.getItem("guestUsage") || "0");
      // if (localUsage >= 10) {
      //   alert("Guest limit reached. Sign in for more.");
      //   return;
      // }
      localStorage.setItem("guestUsage", localUsage + 1);
      setUsageCount(localUsage + 1);
    } else if (userEmail !== HOST_EMAIL && usageCount >= usageLimit) {
      alert("Usage limit reached. Upgrade for more.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await response.json();
      setOutput(data.output);
      startStreaming(data.output);
      console.log("Tokens used:", data.token_count);
      setTokenUsage(prev => prev + data.token_count);

      if (userEmail && userEmail !== HOST_EMAIL && typeof window.supabase !== "undefined" && window.supabase) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        await window.supabase.from('users').update({ usage_count: newCount }).eq('email', userEmail);
      }
    } catch (error) {
      console.error('Frontend fetch error:', error);
      setOutput('ERROR: Failed to fetch response.');
    }
    setLoading(false);
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    setActivePanel(null);
    setLockedPanel(null);
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message}`));
    } else {
      document.exitFullscreen();
    }
  };
const handleGoogleLogin = async () => {
  if (typeof window.supabase === "undefined" || !window.supabase) {
    console.log("Supabase not available - guest mode only");
    return;
  }
  try {
    const { data, error } = await window.supabase.auth.signInWithOAuth({ provider: 'google' });
    console.log("OAuth response:", data, error);

    if (error) {
      console.error("Login error:", error.message);
    } else if (data?.url) {
      console.log("Redirecting to:", data.url);
      window.location.href = data.url;
    } else {
      console.error("No redirect URL returned from Supabase.");
    }
  } catch (e) {
    console.error("Unexpected sign-in failure:", e);
  }
};



  const handleHoverPanel = (panel) => {
    if (!lockedPanel) setActivePanel(panel);
  };

  const handleClickPanel = (panel) => {
    if (lockedPanel === panel) {
      setLockedPanel(null);
      setActivePanel(null);
    } else {
      setLockedPanel(panel);
      setActivePanel(panel);
    }
  };

  const handleClosePanels = () => {
    setActivePanel(null);
    setLockedPanel(null);
  };

  useEffect(() => {
    const icons = document.querySelectorAll('.fas');
    icons.forEach((icon) => {
      icon.addEventListener('mouseenter', () => {
        icon.style.opacity = 1;
        icon.style.textShadow = '0 0 4px #00ff88';
      });
      icon.addEventListener('mouseleave', () => {
        icon.style.opacity = 0.5;
        icon.style.textShadow = 'none';
      });
    });
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.hash.includes('access_token')) {
      setActivePanel(null);
      setLockedPanel(null);
      window.history.replaceState(null, '', '/');
    }
  }, []);

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  return (

    <>
      <div className="hud-wrapper" onMouseLeave={() => { if (!lockedPanel) handleClosePanels(); }}>
        <div className="hud-bar">
          <div className="hud-left">
            <span>[0]neShot-AI</span><span className="version-tag">v0.8_BETA</span>
          </div>
          <div className="hud-right">
  <i className="fas fa-info-circle hud-icon" onMouseEnter={() => handleHoverPanel("info")} onClick={() => handleClickPanel("info")}></i>
  <i className="fas fa-cog hud-icon" onMouseEnter={() => handleHoverPanel("settings")} onClick={() => handleClickPanel("settings")}></i>
  <i className="fas fa-expand hud-icon" onMouseEnter={handleClosePanels} onClick={toggleFullscreen}></i>
  
  <span className="guest-tag hover-glow expandable" onClick={handleGoogleLogin}>
    {userEmail
      ? `${userEmail.split('@')[0]} • USAGE: ${usageCount} / ${usageLimit === Infinity ? '∞' : usageLimit}`
      : "SIGN IN"}
  </span>

  {userEmail && usageLimit !== Infinity && (
    <div className="token-bar-container">
      <div
        className="token-bar-fill"
        style={{ width: `${Math.min(100, (tokenUsage / usageLimit) * 100)}%` }}
      />
      <div className="token-bar-label">
        {`${Math.floor((tokenUsage / usageLimit) * 100)}% USED`}
      </div>
    </div>
  )}
</div>


            

        </div>
      </div>

      <div className="app-shell">
        <style>{`@font-face { font-family: 'DS-Digital'; src: url('/fonts/DS-DIGI.TTF') format('truetype'); } .blinking-cursor { animation: blink 1.1s steps(2, start) infinite; } @keyframes blink { to { visibility: hidden; } }`}</style>
        
        <div className="terminal-shell">
          <div className="app-header">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <h1 className="title" style={{ position: 'relative', zIndex: 1 }}>
                [0]neShot-AI
              </h1>
            </div>
            <div className="title-divider"></div>
          </div>

          <div className="terminal-layout">
          <div className="console-box">
            <div className="output-panel">
              <div className="console-output">
                {!displayedOutput && !output ? (
                  <>
                    <br />[BOOT SEQUENCE INITIALIZED] ...<br />
                    &gt; LINK STATUS: STABLE<br />
                    &gt; SYSTEM STANDBY<br />
                    <span className="blinking-cursor">_</span>
                  </>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                    components={{
                      table: ({ children }) => (
                        <div className="markdown-table-wrapper">
                          <table className="markdown-table">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead>{children}</thead>,
                      th: ({ children }) => <th>{children}</th>,
                      td: ({ children }) => <td>{children}</td>,
                      pre: ({ children }) => <pre className="oneshot-pre">{children}</pre>,
                      code: ({ inline, children, ...props }) => {
                        if (inline) {
                          return <code className="oneshot-code-inline" {...props}>{children}</code>;
                        }
                        return <code className="oneshot-code" {...props}>{children}</code>;
                      },
                    }}
                  >
                    {displayedOutput + (isStreaming ? " ▌" : "")}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
          
          <div className="input-panel">
            {loading && <div className="loading-text">PROCESSING . . .</div>}
            <form onSubmit={handleSubmit} className="input-form">
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ENTER COMMAND . . ."
                minRows={1}
                maxRows={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="command-input"
              />
              <button type="submit" disabled={loading} className="submit-button" aria-label="Submit">
                <img
                  src="/assets/target.png"
                  alt="Strike"
                  className={loading ? 'spinning-icon' : ''}
                  style={{ width: '30px', height: '30px', filter: 'drop-shadow(0 0 4px #00ff88)' }}
                />
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>

      {activePanel === "info" && (
        <div className="info-panel" style={{ width: '480px', fontSize: '15px', lineHeight: '1.5' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>
            [INFO] — ONESHOT-AI SYSTEM OVERVIEW
          </h2>
          <div style={{ marginBottom: '10px' }}>
            VERSION: v 0.8_BETA &nbsp;&nbsp;&nbsp; MODE: TACTICAL (Stateless)
          </div>
          <div style={{ borderBottom: '1px solid #00ff88', marginBottom: '10px' }}></div>
          <div style={{ marginBottom: '10px' }}>
            <strong>SYSTEM PURPOSE</strong><br />
            ONESHOT-AI is a zero-recursion AI terminal.<br />
            No memory. No filler. One input. One strike.<br />
            It is a stripped-down tactical AI.<br />
            It doesn’t remember. It doesn’t drift.
            You get one shot — make it count.
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>BEST USES</strong><br />
            • Collapse overthinking into execution.<br />
            • Refine prompts for ChatGPT or Claude.<br />
            • Generate tactical responses, scripts, or blurbs.<br />
            • Get quick answers under pressure (e.g. tests, tasks).<br />
            • Run isolated input tests without memory bleed.
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>TIPS</strong><br />
            • Ask surgical questions.<br />
            • Skip "what do you think about…" — go for "Refine this into…"<br />
            • You are the operator. AI is your tool.
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>MODULES</strong><br />
            ONESHOT saves no inputs. Your data is not stored.<br />
            Stateless by design. Drift-proof. Mission-ready.
          </div>
        </div>
      )}

      {activePanel === "settings" && (
        <div className="settings-popup">
          MODULE LOCKED — SYSTEM SETTINGS COMING SOON
        </div>
      )}
    </>
  );
}

export default App;
