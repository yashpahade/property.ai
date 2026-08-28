import React from 'react';

export default function AboutPage() {
  return (
    <div style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-dark)' }}>About IvyHuts</h1>
      <p style={{ fontSize: '18px', color: 'var(--text-muted-dark)', marginBottom: '32px' }}>
        IvyHuts is a leading AI-powered real estate intelligence platform designed to empower businesses, investors, and institutions globally.
      </p>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '16px' }}>Our Mission</h2>
      <p style={{ color: 'var(--text-dark)' }}>
        We aim to bring absolute transparency and predictive intelligence to the real estate market. By aggregating billions of data points—from transaction histories to satellite imagery—our proprietary AI models (IvyPredict, IvyScore, IvyRisk) deliver actionable insights that were previously only available to elite institutional investors.
      </p>
    </div>
  );
}
