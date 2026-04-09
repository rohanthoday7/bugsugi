import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bs-root">
      <div className="bs-grid-bg"></div>
      <div className="bs-vignette"></div>
      <div className="bs-scanline"></div>

      <nav className="bs-nav">
        <div className="bs-nav-logo">
          <span className="bs-pulse"></span>BUGSUGI // ROUND_01
        </div>
        <ul className="bs-nav-links">
          <li><a href="/" onClick={(e) => { e.preventDefault(); }}>Home</a></li>
          <li><a href="/instructions" onClick={(e) => { e.preventDefault(); navigate('/instructions'); }}>Instructions</a></li>
          <li><a href="/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>Admin</a></li>
        </ul>
      </nav>

      <section className="bs-hero">
        <div className="bs-tag">MCQ Challenge — Round 1</div>

        <div className="bs-logo-wrap animate-bs-float">
          <img src="/icons.svg" alt="BugSugi Logo" style={{ filter: "drop-shadow(0 0 10px #19c5b4)" }} />
        </div>

        <h1 className="bs-title">BUGSUGI</h1>
        <p className="bs-sub">// Technical Trivia · Season 2026</p>
        <p className="bs-desc">
          Bugsugi is an exciting code-fixing event featured in the Samavarthan fest, organized and hosted by MVSR, where participants debug and optimize code to showcase their problem-solving skills.
        </p>

        <div className="bs-actions">
          <button className="bs-btn-primary" onClick={() => navigate('/login')}>
            Enter Arena
          </button>
          <button className="bs-btn-secondary" onClick={() => navigate('/instructions')}>
            View Instructions
          </button>
        </div>
      </section>

      <div className="bs-divider">
        <div className="bs-divider-line"></div>
        <div className="bs-divider-dot"></div>
        <div className="bs-divider-line"></div>
      </div>

      <div className="bs-stats">
        <div className="bs-stat">
          <div className="bs-stat-val">120</div>
          <div className="bs-stat-label">Questions</div>
        </div>
        <div className="bs-stat">
          <div className="bs-stat-val">
            60<span style={{ fontSize: '18px', color: 'rgba(25,197,180,0.6)' }}>min</span>
          </div>
          <div className="bs-stat-label">Time Limit</div>
        </div>
        <div className="bs-stat">
          <div className="bs-stat-val">1</div>
          <div className="bs-stat-label">Attempt</div>
        </div>
        <div className="bs-stat">
          <div className="bs-stat-val">∞</div>
          <div className="bs-stat-label">Stakes</div>
        </div>
      </div>

      <div className="bs-features">
        <div className="bs-feature">
          <div className="bs-corner bs-corner-tl"></div>
          <div className="bs-feature-icon">01 // SECURE</div>
          <p className="bs-feature-title">Anti-Cheat Layer</p>
          <p className="bs-feature-text">Tab-switch detection with auto-submit on repeated violations. Right-click disabled.</p>
        </div>
        <div className="bs-feature">
          <div className="bs-feature-icon">02 // ADAPTIVE</div>
          <p className="bs-feature-title">Auto-Save Engine</p>
          <p className="bs-feature-text">Every answer synced to the server in real time. No data loss on disconnects.</p>
        </div>
        <div className="bs-feature">
          <div className="bs-corner bs-corner-br"></div>
          <div className="bs-feature-icon">03 // LIVE</div>
          <p className="bs-feature-title">Live Leaderboard</p>
          <p className="bs-feature-text">Rankings update instantly after submission. Track your position among peers.</p>
        </div>
      </div>

      <footer className="bs-footer">
        <p className="bs-footer-text">BugSugi © 2026 — Technical Events Division — All systems nominal</p>
      </footer>
    </div>
  );
}
