import React from 'react';

export default function ContactPage() {
  return (
    <div style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-dark)' }}>Contact Us</h1>
      <p style={{ fontSize: '18px', color: 'var(--text-muted-dark)', marginBottom: '48px' }}>
        Get in touch with our enterprise sales or customer support team.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ background: 'var(--bg-light)', padding: '32px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Global Headquarters</h3>
          <p style={{ color: 'var(--text-muted-dark)', lineHeight: '1.6' }}>
            IvyHuts Technologies<br/>
            Silicon Valley, CA<br/>
            contact@ivyhuts.com<br/>
            +1 (555) 123-4567
          </p>
        </div>
        <div style={{ background: 'var(--bg-light)', padding: '32px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Send a Message</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" placeholder="Name" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
            <input type="email" placeholder="Email" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
            <textarea placeholder="How can we help?" rows={4} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}></textarea>
            <button className="btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}
