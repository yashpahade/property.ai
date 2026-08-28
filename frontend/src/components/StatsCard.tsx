import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  trend?: number;
  icon: LucideIcon;
}

export default function StatsCard({ title, value, trend, icon: Icon }: StatsCardProps) {
  const isPositive = trend && trend > 0;
  
  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '10px', 
          backgroundColor: 'var(--bg-secondary)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--accent-blue)'
        }}>
          <Icon size={20} />
        </div>
        
        {trend !== undefined && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontSize: '13px',
            fontWeight: 600,
            color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-red)',
            backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '4px 8px',
            borderRadius: '12px'
          }}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>
          {title}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}