import React from 'react';

export default function PricingPage() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '1280px', margin: '0 auto', background: 'var(--bg-light)', minHeight: '100vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>Simple, Transparent Pricing</h1>
      <p style={{ color: 'var(--text-muted-dark)', marginBottom: '48px' }}>Choose the plan that fits your real estate needs.</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
        {/* Basic */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '300px', textAlign: 'left', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Basic</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Free</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: 'var(--text-muted-dark)', lineHeight: '2' }}>
            <li>✓ Browse Properties</li>
            <li>✓ Basic Search</li>
            <li>✓ Save Favorites</li>
          </ul>
          <button className="btn-outline" style={{ width: '100%', color: 'var(--text-dark)', borderColor: 'var(--border-light)' }}>Get Started</button>
        </div>

        {/* Pro */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '300px', textAlign: 'left', border: '2px solid var(--accent-green)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'var(--accent-green)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Most Popular</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Pro Investor</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>₹999<span style={{ fontSize: '14px', color: 'var(--text-muted-dark)' }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: 'var(--text-muted-dark)', lineHeight: '2' }}>
            <li>✓ AI Valuation Tool</li>
            <li>✓ Market Trends Analysis</li>
            <li>✓ Investment Reports</li>
            <li>✓ Priority Support</li>
          </ul>
          <button className="btn-primary" style={{ width: '100%' }}>Subscribe Now</button>
        </div>
      </div>
    </div>
  );
}
