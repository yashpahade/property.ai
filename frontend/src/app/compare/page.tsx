import React from 'react';

export default function ComparePage() {
  return (
    <div style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-dark)' }}>Compare Localities</h1>
      <p style={{ fontSize: '16px', color: 'var(--text-muted-dark)', marginBottom: '40px' }}>
        Side-by-side market analysis of top investment destinations.
      </p>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: 'var(--shadow-sm)', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: 'var(--bg-dark)', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '20px' }}>Metric</th>
              <th style={{ padding: '20px' }}>Civil Lines, Nagpur</th>
              <th style={{ padding: '20px' }}>Dharampeth, Nagpur</th>
              <th style={{ padding: '20px' }}>Mihan, Nagpur</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '20px', fontWeight: 'bold' }}>Avg Price / sqft</td>
              <td style={{ padding: '20px' }}>₹7,850</td>
              <td style={{ padding: '20px' }}>₹9,100</td>
              <td style={{ padding: '20px' }}>₹4,200</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '20px', fontWeight: 'bold' }}>1-Year Growth</td>
              <td style={{ padding: '20px', color: 'var(--accent-green)' }}>+6.2%</td>
              <td style={{ padding: '20px', color: 'var(--accent-green)' }}>+4.1%</td>
              <td style={{ padding: '20px', color: 'var(--accent-green)', fontWeight: 'bold' }}>+12.4%</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '20px', fontWeight: 'bold' }}>Rental Yield</td>
              <td style={{ padding: '20px' }}>4.1%</td>
              <td style={{ padding: '20px' }}>3.8%</td>
              <td style={{ padding: '20px' }}>5.2%</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '20px', fontWeight: 'bold' }}>AI Investment Score</td>
              <td style={{ padding: '20px' }}>8.5 / 10</td>
              <td style={{ padding: '20px' }}>7.8 / 10</td>
              <td style={{ padding: '20px', fontWeight: 'bold', color: 'var(--accent-purple)' }}>9.2 / 10</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
