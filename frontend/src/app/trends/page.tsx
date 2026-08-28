'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import StatsCard from '@/components/StatsCard';
import PriceChart from '@/components/PriceChart';
import { TrendingUp, Users, PiggyBank, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // We'll reuse dashboard data for the analytics view's charts where applicable
    api.getDashboardData().then(setData);
  }, []);

  if (!data) {
    return <div style={{ padding: '32px' }}><div className="skeleton" style={{ height: '100vh', width: '100%' }}></div></div>;
  }

  const comparisonData = [
    { name: 'Mumbai', '1BHK': 15000000, '2BHK': 25000000, '3BHK': 40000000 },
    { name: 'Pune', '1BHK': 4500000, '2BHK': 7500000, '3BHK': 12000000 },
    { name: 'Nagpur', '1BHK': 3000000, '2BHK': 5000000, '3BHK': 8000000 },
    { name: 'Nashik', '1BHK': 2500000, '2BHK': 4000000, '3BHK': 6500000 },
  ];

  return (
    <div className="animate-fadeIn" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Market Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Deep dive into real estate trends and historical data.</p>
        </div>
        <button style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <RefreshCw size={16} /> Refresh Data
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatsCard title="Total Volume (YTD)" value="₹4,250 Cr" trend={15.4} icon={TrendingUp} />
        <StatsCard title="Active Buyers" value="24,500" trend={8.2} icon={Users} />
        <StatsCard title="Avg Rental Yield" value="4.2%" trend={-0.5} icon={PiggyBank} />
        <StatsCard title="Avg Investment Score" value="76/100" trend={2.1} icon={TrendingUp} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>City-wise Price Comparison (by BHK)</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/10000000}Cr`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value: number) => formatPrice(value)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="1BHK" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="2BHK" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="3BHK" fill="var(--accent-emerald)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>Growth Trends (YoY %)</h3>
          <div style={{ height: '350px' }}>
             <PriceChart data={data.priceTrends} />
          </div>
        </div>
      </div>
    </div>
  );
}