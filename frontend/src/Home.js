import React, { useEffect, useState } from 'react';
import { fetchHomeSummary } from './api';
import './Home.css';

function Home() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    fetchHomeSummary()
      .then(data => {
        if (mounted) setSummary(data);
      })
      .catch(err => {
        if (mounted) setError(err.message || 'Failed to load dashboard summary');
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="dashboard-shell">
      <div className="dashboard-hero">
        <p className="dashboard-kicker">Student Command Center</p>
        <h2>Welcome to Your Smart Campus Home</h2>
        <p>
          View today&apos;s priorities, discover upcoming activities, and quickly access essential campus tools.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Today&apos;s Snapshot</h3>
          {!summary && !error && <p className="state-text">Loading summary...</p>}
          {error && <p className="state-text error">{error}</p>}
          {summary && (
            <ul>
              <li>{summary.totalEvents} registered campus events</li>
              <li>{summary.activeServices} active service channels</li>
              <li>{summary.totalResources} available learning resources</li>
            </ul>
          )}
        </div>
        <div className="dashboard-card">
          <h3>System Coverage</h3>
          {summary && (
            <ul>
              <li>{summary.totalServices} total service entries</li>
              <li>{summary.totalEvents} events available for discovery</li>
              <li>{summary.totalResources} searchable resource records</li>
            </ul>
          )}
        </div>
        <div className="dashboard-card">
          <h3>Product Vision</h3>
          <ul>
            <li>Centralized services for students and staff</li>
            <li>Real-time campus coordination</li>
            <li>Secure and simple account experience</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Home;
