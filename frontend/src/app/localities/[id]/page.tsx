'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, Activity, Home, Building2, MapPin } from 'lucide-react';
import { MOCK_LOCALITIES, MOCK_PROPERTIES } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import PropertyCard from '@/components/PropertyCard';

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function LocalityDetailsPage({ params }: { params: { id: string } }) {
  const locality = MOCK_LOCALITIES.find(l => l.id === params.id);
  
  if (!locality) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', minHeight: '100vh' }}>
        <h2>Locality not found</h2>
        <Link href="/localities" style={{ color: 'var(--accent-blue)', marginTop: '20px', display: 'inline-block' }}>
          Back to Localities
        </Link>
      </div>
    );
  }

  const localProperties = MOCK_PROPERTIES.filter(p => p.locality === locality.name && p.city === locality.city);
  const comparableLocalities = MOCK_LOCALITIES.filter(l => l.city === locality.city && l.id !== locality.id).slice(0, 3);

  // Formatting data for chart
  const chartData = locality.priceHistory;

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1280px', margin: '0 auto', background: 'var(--bg-light)', minHeight: '100vh' }}>
      <Link href="/localities" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', textDecoration: 'none', marginBottom: '24px', fontWeight: '500' }}>
        <ArrowLeft size={18} />
        Back to Localities
      </Link>
      
      {/* Hero Section */}
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-dark)' }}>{locality.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted-dark)', fontSize: '18px', marginBottom: '16px' }}>
              <MapPin size={18} />
              {locality.city}, {locality.pincode}
            </div>
            <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--text-muted-dark)', maxWidth: '800px', margin: 0 }}>
              {locality.description}
            </p>
          </div>
          <div style={{ 
            background: 'var(--bg-light)', 
            padding: '16px 24px', 
            borderRadius: '12px', 
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted-dark)', marginBottom: '4px' }}>Properties Available</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{locality.totalProperties}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
          <div style={{ color: 'var(--text-muted-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} /> Avg Price / sqft
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-dark)' }}>₹{locality.avgPricePerSqft}</div>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
          <div style={{ color: 'var(--text-muted-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} /> 1Y Growth
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent-green)' }}>+{locality.priceGrowth1Y}%</div>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
          <div style={{ color: 'var(--text-muted-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> Rental Yield
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent-purple)' }}>{locality.rentalYield}%</div>
        </div>
        <div style={{ background: 'var(--text-dark)', color: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: '#cbd5e1', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> AI Investment Score
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#38bdf8' }}>{locality.aiScore}/100</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
        {/* Price Trends */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-dark)' }}>12-Month Price Trend</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={['auto', 'auto']} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`₹${value}/sqft`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="var(--accent-blue)" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--accent-blue)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Map View */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-dark)' }}>Location</h2>
          <div style={{ flex: 1, minHeight: '250px', borderRadius: '12px', overflow: 'hidden' }}>
            <MapComponent 
              properties={[]} 
              center={[locality.lat, locality.lng]} 
              zoom={14} 
              poiMarkers={[
                ...locality.nearbyAmenities?.hospitals?.map((h: any) => ({ lat: locality.lat + 0.002, lng: locality.lng + 0.001, name: h.name, type: 'hospital' })) || [],
                ...locality.nearbyAmenities?.schools?.map((s: any) => ({ lat: locality.lat - 0.002, lng: locality.lng - 0.001, name: s.name, type: 'school' })) || []
              ]}
            />
          </div>
        </div>
      </div>

      {/* Connectivity */}
      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-dark)' }}>Connectivity</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {locality.connectivity?.map((conn: any, idx: number) => (
            <div key={idx} style={{ padding: '12px 20px', background: 'var(--bg-light)', borderRadius: '30px', color: 'var(--text-dark)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--accent-blue)" /> {conn.name} ({conn.distance})
            </div>
          ))}
        </div>
      </div>

      {/* Amenities Grid */}
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-dark)' }}>Nearby Amenities</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {/* Hospitals */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/icons/hospital.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="Hospital" />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Hospitals</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {locality.nearbyAmenities?.hospitals?.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg-light)' }}>
                <span style={{ color: 'var(--text-dark)' }}>{item.name}</span>
                <span style={{ color: 'var(--text-muted-dark)' }}>{item.distance}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Schools */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/icons/school.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="School" />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Schools</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {locality.nearbyAmenities?.schools?.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg-light)' }}>
                <span style={{ color: 'var(--text-dark)' }}>{item.name}</span>
                <span style={{ color: 'var(--text-muted-dark)' }}>{item.distance}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Colleges */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/icons/college.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="College" />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Colleges</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {locality.nearbyAmenities?.colleges?.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg-light)' }}>
                <span style={{ color: 'var(--text-dark)' }}>{item.name}</span>
                <span style={{ color: 'var(--text-muted-dark)' }}>{item.distance}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Gyms */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/icons/gym.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="Gym" />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Gyms</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {locality.nearbyAmenities?.gyms?.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg-light)' }}>
                <span style={{ color: 'var(--text-dark)' }}>{item.name}</span>
                <span style={{ color: 'var(--text-muted-dark)' }}>{item.distance}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Restaurants */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/icons/restaurant.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="Restaurant" />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Restaurants</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {locality.nearbyAmenities?.restaurants?.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg-light)' }}>
                <span style={{ color: 'var(--text-dark)' }}>{item.name}</span>
                <span style={{ color: 'var(--text-muted-dark)' }}>{item.distance}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Malls */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/icons/mall.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="Mall" />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Malls</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {locality.nearbyAmenities?.malls?.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg-light)' }}>
                <span style={{ color: 'var(--text-dark)' }}>{item.name}</span>
                <span style={{ color: 'var(--text-muted-dark)' }}>{item.distance}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Compare Table */}
      {comparableLocalities.length > 0 && (
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-dark)' }}>Compare with Nearby Areas</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted-dark)' }}>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Locality</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Avg Price/sqft</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>1Y Growth</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>AI Score</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'var(--bg-light)', borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--text-dark)' }}>{locality.name} (Current)</td>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>₹{locality.avgPricePerSqft}</td>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--accent-green)' }}>+{locality.priceGrowth1Y}%</td>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--accent-purple)' }}>{locality.aiScore}</td>
                </tr>
                {comparableLocalities.map(comp => (
                  <tr key={comp.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px' }}>
                      <Link href={`/localities/${comp.id}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '500' }}>
                        {comp.name}
                      </Link>
                    </td>
                    <td style={{ padding: '16px' }}>₹{comp.avgPricePerSqft}</td>
                    <td style={{ padding: '16px', color: 'var(--accent-green)' }}>+{comp.priceGrowth1Y}%</td>
                    <td style={{ padding: '16px' }}>{comp.aiScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Local Properties */}
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-dark)' }}>Properties in {locality.name}</h2>
        {localProperties.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {localProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', color: 'var(--text-muted-dark)' }}>
            No properties found in this locality matching current criteria.
          </div>
        )}
      </div>
    </div>
  );
}
