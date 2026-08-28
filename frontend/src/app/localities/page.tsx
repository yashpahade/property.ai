'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, TrendingUp, Activity, Home, ArrowUpDown } from 'lucide-react';
import { MOCK_LOCALITIES } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';

const CITIES = ['All', 'Nagpur', 'Pune', 'Mumbai', 'Nashik'];

export default function LocalitiesDirectory() {
  const [activeCity, setActiveCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score'); // 'price', 'growth', 'score'

  const filteredLocalities = useMemo(() => {
    let result = MOCK_LOCALITIES;

    // Filter by city
    if (activeCity !== 'All') {
      result = result.filter(loc => loc.city === activeCity);
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(loc => 
        loc.name.toLowerCase().includes(q) || 
        loc.city.toLowerCase().includes(q) ||
        (loc.pincode && loc.pincode.includes(q))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'price') return b.avgPricePerSqft - a.avgPricePerSqft;
      if (sortBy === 'growth') return b.priceGrowth1Y - a.priceGrowth1Y;
      if (sortBy === 'score') return b.aiScore - a.aiScore;
      return 0;
    });

    return result;
  }, [activeCity, searchQuery, sortBy]);

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1280px', margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-dark)' }}>
          Explore Prime Localities
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted-dark)', maxWidth: '600px', margin: '0 auto' }}>
          Discover the best neighborhoods with high growth potential, top-tier amenities, and excellent connectivity.
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* City Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                border: `1px solid ${activeCity === city ? 'var(--accent-blue)' : 'var(--border-light)'}`,
                background: activeCity === city ? 'var(--accent-blue)' : 'white',
                color: activeCity === city ? 'white' : 'var(--text-dark)',
                fontWeight: activeCity === city ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted-dark)' }} />
            <input 
              type="text" 
              placeholder="Search localities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={18} style={{ color: 'var(--text-muted-dark)' }} />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <option value="score">AI Score</option>
              <option value="growth">Highest Growth</option>
              <option value="price">Highest Price</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '24px' 
      }}>
        {filteredLocalities.map(locality => (
          <Link href={`/localities/${locality.id}`} key={locality.id} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid var(--border-light)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-dark)', marginBottom: '4px' }}>
                      {locality.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted-dark)', fontSize: '14px' }}>
                      <MapPin size={14} />
                      {locality.city}
                    </div>
                  </div>
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--accent-purple)',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    <Activity size={16} />
                    {locality.aiScore}/100
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted-dark)', fontSize: '12px', marginBottom: '4px' }}>Avg. Price</div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>₹{locality.avgPricePerSqft}/sqft</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted-dark)', fontSize: '12px', marginBottom: '4px' }}>1Y Growth</div>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={14} />
                      +{locality.priceGrowth1Y}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted-dark)', fontSize: '13px' }}>
                  <Home size={14} />
                  {locality.totalProperties} properties available
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredLocalities.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted-dark)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>No localities found</div>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
