'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import { Map, Grid, SlidersHorizontal, Search } from 'lucide-react';
import { LoadingCard } from '@/components/Loading';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    api.getProperties().then((data) => {
      setProperties(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="animate-fadeIn" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Property Discovery</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Explore investment opportunities across top cities.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setView('grid')}
            style={{ 
              padding: '8px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: view === 'grid' ? 'var(--accent-blue)' : 'var(--bg-card)', 
              color: view === 'grid' ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            <Grid size={18} /> Grid
          </button>
          <button 
            onClick={() => setView('map')}
            style={{ 
              padding: '8px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: view === 'map' ? 'var(--accent-blue)' : 'var(--bg-card)', 
              color: view === 'map' ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            <Map size={18} /> Map
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search localities, projects..." 
            style={{ 
              width: '100%', 
              padding: '10px 10px 10px 40px', 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              outline: 'none'
            }} 
          />
        </div>
        <select style={{ padding: '10px 16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}>
          <option>All Cities</option>
          <option>Mumbai</option>
          <option>Pune</option>
          <option>Nagpur</option>
          <option>Nashik</option>
        </select>
        <select style={{ padding: '10px 16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}>
          <option>Property Type</option>
          <option>Apartment</option>
          <option>Villa</option>
          <option>Plot</option>
        </select>
        <button style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <SlidersHorizontal size={18} /> More Filters
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {[1,2,3,4,5,6].map(i => <LoadingCard key={i} />)}
        </div>
      ) : view === 'grid' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {properties.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button style={{ padding: '8px 16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>Previous</button>
            <button style={{ padding: '8px 16px', backgroundColor: 'var(--accent-blue)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}>1</button>
            <button style={{ padding: '8px 16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>2</button>
            <button style={{ padding: '8px 16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>Next</button>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, minHeight: '600px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          {/* Map view could be rendered here but map page handles full map experience */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ color: 'var(--text-muted)' }}>Please use the Map Explorer tab for full map experience.</p>
          </div>
        </div>
      )}
    </div>
  );
}