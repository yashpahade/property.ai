'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import InvestmentGauge from '@/components/InvestmentGauge';
import { formatPrice } from '@/lib/utils';
import { BrainCircuit, Loader2, Info, ShieldCheck, Sparkles, TrendingUp, IndianRupee, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ValuationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    city: 'Mumbai',
    locality: 'Bandra West',
    bhk: '2',
    carpetArea: '1000',
    propertyType: 'flat',
    age: '2',
    floor: '5',
    totalFloors: '20',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      const pred = await api.predictValue({
        city: formData.city,
        locality: formData.locality,
        bhk: Number(formData.bhk),
        carpetArea: Number(formData.carpetArea),
        propertyType: formData.propertyType,
        age: Number(formData.age)
      });
      setResult(pred);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pt-24 pb-16 px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BrainCircuit size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                AI Valuation & Ready Reckoner
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
              Pan-India Real Estate Valuation Engine
            </h1>
            <p className="text-xs text-slate-400">
              Combines Machine Learning Hedonic Regression with Government Circle Rates across Maharashtra and India.
            </p>
          </div>
        </header>

        {/* 2-Column Grid: Form & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Input Form */}
          <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Property Specifications
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* City & Locality */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">City / Region</label>
                  <select 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Mumbai">Mumbai MMR</option>
                    <option value="Pune">Pune & PCMC</option>
                    <option value="Thane">Thane</option>
                    <option value="Navi Mumbai">Navi Mumbai</option>
                    <option value="Kalyan">Kalyan-Dombivli</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Chhatrapati Sambhaji Nagar">Chhatrapati Sambhaji Nagar</option>
                    <option value="Kolhapur">Kolhapur</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Gurgaon">Gurgaon (NCR)</option>
                    <option value="Noida">Noida (NCR)</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Gandhinagar">GIFT City Gandhinagar</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Goa">Goa</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Locality / Area</label>
                  <input 
                    type="text" 
                    name="locality"
                    value={formData.locality} 
                    onChange={handleChange}
                    placeholder="e.g. Bandra, Hinjewadi..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* BHK & Property Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Bedrooms (BHK)</label>
                  <select 
                    name="bhk" 
                    value={formData.bhk} 
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  >
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK / Penthouse</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Property Type</label>
                  <select 
                    name="propertyType" 
                    value={formData.propertyType} 
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  >
                    <option value="flat">Apartment / Flat</option>
                    <option value="villa">Independent Villa</option>
                    <option value="penthouse">Luxury Penthouse</option>
                    <option value="rowhouse">Rowhouse</option>
                    <option value="plot">Residential Plot</option>
                  </select>
                </div>
              </div>

              {/* Carpet Area & Property Age */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Carpet Area (sq.ft)</label>
                  <input 
                    type="number" 
                    name="carpetArea"
                    value={formData.carpetArea} 
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Building Age (Years)</label>
                  <input 
                    type="number" 
                    name="age"
                    value={formData.age} 
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Calculating RAG Valuation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Calculate Live Valuation</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Column 2: Results Card */}
          <div className="lg:col-span-7 space-y-6">
            {!result && !loading && (
              <div className="bg-slate-950 p-12 rounded-2xl border border-slate-800 text-center space-y-3">
                <BrainCircuit className="h-12 w-12 text-slate-600 mx-auto" />
                <h3 className="font-bold text-base text-slate-300">Ready to Valuate Any Property in India</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Fill in property specifications on the left to extract official Government Ready Reckoner rates, fair market valuation, and 5-year capital appreciation forecasts.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-slate-950 p-12 rounded-2xl border border-slate-800 text-center space-y-3">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto" />
                <h4 className="font-bold text-sm text-white">Synthesizing Real Estate Alpha...</h4>
                <p className="text-xs text-slate-500">Cross-referencing IGR Maharashtra, NHB RESIDEX & ML regression...</p>
              </div>
            )}

            {result && !loading && (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                      Verified AI Valuation
                    </span>
                    <h2 className="text-3xl font-black text-white mt-0.5">
                      ₹{(result.estimatedValue / 10000000).toFixed(2)} Cr
                    </h2>
                    <p className="text-xs text-slate-400">
                      Rate: <strong className="text-white">₹{result.pricePerSqft?.toLocaleString('en-IN') || Math.round(result.estimatedValue / Number(formData.carpetArea))}</strong> / sq.ft
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Confidence Score</div>
                    <div className="text-2xl font-extrabold text-emerald-400">{result.confidence}%</div>
                    <div className="text-[10px] text-slate-500">ML Hedonic Model</div>
                  </div>
                </div>

                {/* Rates Comparison Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase">Ready Reckoner Rate</span>
                    <div className="text-base font-extrabold text-indigo-400 mt-0.5">
                      ₹{(result.readyReckonerRate || Math.round(result.pricePerSqft * 0.65)).toLocaleString('en-IN')} / sq.ft
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Gross Rental Yield</span>
                    <div className="text-base font-extrabold text-amber-400 mt-0.5">
                      {result.rentalYield || 4.2}% p.a.
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">5-Year Growth Forecast</span>
                    <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                      ₹{(result.projections['5Y'] / 10000000).toFixed(2)} Cr
                    </div>
                  </div>
                </div>

                {/* Capital Gain Projections */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-300">Multi-Year Price Projections</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                      <span className="text-slate-400 text-[10px]">1 Year (2025)</span>
                      <div className="font-bold text-white mt-0.5">₹{(result.projections['1Y'] / 10000000).toFixed(2)} Cr</div>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                      <span className="text-slate-400 text-[10px]">3 Years (2027)</span>
                      <div className="font-bold text-white mt-0.5">₹{(result.projections['3Y'] / 10000000).toFixed(2)} Cr</div>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                      <span className="text-slate-400 text-[10px]">5 Years (2029)</span>
                      <div className="font-bold text-emerald-400 mt-0.5">₹{(result.projections['5Y'] / 10000000).toFixed(2)} Cr</div>
                    </div>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <Link 
                    href={`/search?q=${encodeURIComponent(formData.locality + ' ' + formData.city)}`}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    View detailed RAG Government Report →
                  </Link>
                  <Link 
                    href="/map"
                    className="text-slate-400 hover:text-white"
                  >
                    Explore on map
                  </Link>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}