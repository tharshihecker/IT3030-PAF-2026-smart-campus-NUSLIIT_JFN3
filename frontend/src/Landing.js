import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  return (
    <section className="landing-shell">
      <div className="landing-hero">
        <p className="landing-kicker">IT3030 Project</p>
        <h2>Smart Campus Management Platform</h2>
        <p>
          One unified system for student services, campus resources, and event discovery. This platform is designed to
          reduce friction in daily university life through fast digital workflows.
        </p>
        <div className="landing-actions">
          <Link to="/signup" className="cta-primary">
            Create Account
          </Link>
          <Link to="/login" className="cta-secondary">
            Login
          </Link>
        </div>
      </div>

      <div className="landing-grid">
        <article className="landing-card">
          <h3>What It Solves</h3>
          <p>Students no longer need multiple portals for common campus activities and service updates.</p>
        </article>
        <article className="landing-card">
          <h3>Core Features</h3>
          <p>Account access, service requests, event visibility, and learning resource discovery from one dashboard.</p>
        </article>
        <article className="landing-card">
          <h3>Why It Matters</h3>
          <p>Faster decisions, less administrative overhead, and better campus experience with centralized information.</p>
        </article>
      </div>
    </section>
  );
}

export default Landing;
