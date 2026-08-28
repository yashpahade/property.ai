'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import { 
  MapPin, Building, Home, Star, Filter, Wallet
} from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  flat: 'var(--accent-green, #10b981)',
  villa: 'var(--accent-blue, #3b82f6)',
  studio: '#14b8a6',
  rowhouse: '#eab308'
};

export default function RentPage() {
  const [city, setCity] = useState('All');
  const [propertyType, setPropertyType] = useState('All');
  const [bhk, setBhk] = useState('All');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [sortBy, setSortBy] = useState('score');

  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter((p: any) => {
      if (p.type !== 'rent') return false;
      if (city !== 'All' && p.city.toLowerCase() !== city.toLowerCase()) return false;
      if (propertyType !== 'All' && p.propertyType !== propertyType) return false;
      if (bhk !== 'All' && p.bhk !== parseInt(bhk)) return false;
      if (minRent && p.price < parseInt(minRent)) return false;
      if (maxRent && p.price > parseInt(maxRent)) return false;
      return true;
    }).sort((a: any, b: any) => {
      if (sortBy === 'rent_low') return a.price - b.price;
      if (sortBy === 'rent_high') return b.price - a.price;
      if (sortBy === 'score') return b.score - a.score;
      return 0;
    });
  }, [city, propertyType, bhk, minRent, maxRent, sortBy]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-light, #f8fafc)' }}>
      {/* Header & Horizontal Filters */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border-light, #e2e8f0)', padding: '32px 32px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-dark, #0f172a)', marginBottom: '24px' }}>
            Rent Properties in Maharashtra
          </h1>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted-dark)' }}>
              <Filter size={20} />
              <span style={{ fontWeight: 600 }}>Filters:</span>
            </div>
            
            <select 
              value={city} onChange={(e) => setCity(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-light, #e2e8f0)', outline: 'none', backgroundColor: 'var(--bg-light)', fontWeight: 500 }}
            >
              <option value="All">All Cities</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Nashik">Nashik</option>
            </select>

            <select 
              value={propertyType} onChange={(e) => setPropertyType(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-light, #e2e8f0)', outline: 'none', backgroundColor: 'var(--bg-light)', fontWeight: 500 }}
            >
              <option value="All">Property Type</option>
              <option value="flat">Flat</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
              <option value="rowhouse">Row House</option>
            </select>

            <select 
              value={bhk} onChange={(e) => setBhk(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-light, #e2e8f0)', outline: 'none', backgroundColor: 'var(--bg-light)', fontWeight: 500 }}
            >
              <option value="All">BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>

            <input 
              type="number" placeholder="Min Rent/mo" 
              value={minRent} onChange={e => setMinRent(e.target.value)} 
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-light, #e2e8f0)', outline: 'none', backgroundColor: 'var(--bg-light)', width: '150px' }} 
            />
            
            <input 
              type="number" placeholder="Max Rent/mo" 
              value={maxRent} onChange={e => setMaxRent(e.target.value)} 
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-light, #e2e8f0)', outline: 'none', backgroundColor: 'var(--bg-light)', width: '150px' }} 
            />

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted-dark)' }}>Sort by:</span>
              <select 
                value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-light, #e2e8f0)', outline: 'none', backgroundColor: 'white', fontWeight: 600 }}
              >
                <option value="score">AI Score</option>
                <option value="rent_low">Rent: Low to High</option>
                <option value="rent_high">Rent: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-dark, #0f172a)', marginBottom: '24px' }}>
          {filteredProperties.length} Properties available for rent
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredProperties.map((property: any) => (
            <Link key={property.id} href={`/properties/${property.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ 
                backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1))', transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', border: '1px solid var(--border-light, #e2e8f0)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1))';
              }}
              >
                <div style={{ height: '200px', backgroundColor: '#e2e8f0', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1), linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
                  <div style={{ 
                    position: 'absolute', top: '12px', left: '12px', backgroundColor: TYPE_COLORS[property.propertyType] || '#333',
                    color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize'
                  }}>
                    {property.propertyType}
                  </div>
                  <div style={{ 
                    position: 'absolute', top: '12px', right: '12px', backgroundColor: 'white',
                    color: 'var(--text-dark)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <Star size={12} color="#eab308" fill="#eab308" /> {property.score}
                  </div>
                </div>
                
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark, #0f172a)', margin: '0 0 8px 0', lineHeight: 1.3 }}>{property.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted-dark, #64748b)', fontSize: '14px', marginBottom: '16px' }}>
                    <MapPin size={14} /> {property.locality}, {property.city}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-dark, #0f172a)', marginBottom: '4px' }}>
                    {formatPrice(property.price)} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted-dark)' }}>/ month</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted-dark, #64748b)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Wallet size={14} /> Deposit: {formatPrice(property.price * 3)}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 0', borderTop: '1px solid var(--border-light, #e2e8f0)', borderBottom: '1px solid var(--border-light, #e2e8f0)', marginTop: 'auto', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Home size={16} color="var(--text-muted-dark)" />
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted-dark)' }}>Size</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>{property.bhk} BHK • {property.area} sqft</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building size={16} color="var(--text-muted-dark)" />
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted-dark)' }}>Furnishing</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>Fully Furnished</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted-dark)' }}>Available Immediately</div>
                    <div style={{ color: 'var(--accent-purple, #8b5cf6)', fontSize: '14px', fontWeight: 600 }}>Contact Agent →</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
