import React from 'react';

export default function ProjectsPage() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '1280px', margin: '0 auto', background: 'var(--bg-light)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>New Projects</h1>
      <p style={{ color: 'var(--text-muted-dark)', marginBottom: '32px' }}>Discover the latest residential and commercial projects from top builders.</p>
      
      <div style={{ padding: '64px', background: 'white', borderRadius: '16px', textAlign: 'center' }}>
        <h2>Coming Soon</h2>
        <p>We are currently onboarding top builders. Check back soon for exclusive pre-launch offers.</p>
      </div>
    </div>
  );
}
