'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import InvestmentGauge from '@/components/InvestmentGauge';
import { formatPrice, getInvestmentRating, getInvestmentColor } from '@/lib/utils';
import { MapPin, Building, Calendar, Car, ArrowLeft, ArrowUpRight, CheckCircle2, Navigation } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function PropertyDetail({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    api.getProperty(params.id).then(setProperty);
  }, [params.id]);

  if (!property) return <div style={{ padding: '32px' }}><div className="skeleton" style={{ height: '60vh', width: '100%', borderRadius: 'var(--radius-md)' }}></div></div>;

  return (
    <div className="animate-slideUp pt-24" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to Properties
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column */}
        <div>
          <div style={{ height: '400px', background: 'var(--gradient-hero)', borderRadius: 'var(--radius-lg)', position: 'relative', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Building size={80} color="var(--border-subtle)" />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: '24px', left: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ padding: '4px 12px', backgroundColor: 'var(--accent-blue)', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{property.bhk} BHK</span>
                <span style={{ padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Ready to Move</span>
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{property.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)' }}>
                <MapPin size={16} /> {property.locality}, {property.city}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Property Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Price</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatPrice(property.price)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Area</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{property.area} sqft</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Price/sqft</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{Math.round(property.price / property.area).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Age</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{property.age} Years</div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Amenities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {property.amenities.map((amenity: string) => (
                <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  <span style={{ textTransform: 'capitalize' }}>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', height: '400px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Location</h3>
            <div style={{ height: 'calc(100% - 50px)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <MapComponent properties={[property]} center={[property.lat, property.lng]} zoom={14} />
            </div>
          </div>
        </div>

        {/* Right Column (AI Insights) */}
        <div>
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--accent-blue-glow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', marginBottom: '20px', fontWeight: 'bold' }}>
              <ArrowUpRight size={20} /> AI Valuation Report
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <InvestmentGauge score={property.score} size={160} />
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ 
                display: 'inline-block',
                padding: '8px 24px',
                backgroundColor: `${getInvestmentColor(property.score)}20`,
                color: getInvestmentColor(property.score),
                borderRadius: '24px',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}>
                {getInvestmentRating(property.score)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Listed Price</span>
                <span style={{ fontWeight: 'bold' }}>{formatPrice(property.price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>AI True Value</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-emerald)' }}>{formatPrice(property.price * 1.05)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Confidence</span>
                <span style={{ fontWeight: 'bold' }}>94%</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Future Projections</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>1 Year Forecast</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{formatPrice(property.price * 1.08)} <span style={{ fontSize: '14px', color: 'var(--accent-emerald)' }}>+8%</span></div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>3 Year Forecast</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{formatPrice(property.price * 1.25)} <span style={{ fontSize: '14px', color: 'var(--accent-emerald)' }}>+25%</span></div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>5 Year Forecast</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{formatPrice(property.price * 1.48)} <span style={{ fontSize: '14px', color: 'var(--accent-emerald)' }}>+48%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}