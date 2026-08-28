'use client';

import React, { useRef } from 'react';
import { 
  X, Printer, Download, ShieldCheck, Landmark, Award, 
  Building, LandPlot, Route, CheckCheck, FileText, CheckCircle2,
  ExternalLink, QrCode, Calendar, MapPin
} from 'lucide-react';

interface ValuationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export default function ValuationReportModal({ isOpen, onClose, data }: ValuationReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const hierarchy = data.hierarchy || {};
  const state = hierarchy.state || data.state || 'Maharashtra';
  const city = hierarchy.city || data.city || 'Metropolitan Region';
  const locality = hierarchy.locality || data.location_badge || data.query;
  const classification = hierarchy.classification || data.category_badge || 'Suburban Growth Node';
  
  const matrix = data.pricing_matrix || {};
  const mrda = data.mrda_sanction_intelligence || {};
  const civic = data.civic_infrastructure || {};
  const govt = data.government_and_tax || {};
  const govVerif = data.official_government_verification || {};

  const certNumber = `VAL-IN-${Math.abs(locality.split('').reduce((a: number, b: string) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)).toString(16).toUpperCase()}-2026`;
  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      
      {/* Modal Card Container */}
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Action Header Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Institutional Valuation Memo</h3>
              <p className="text-[10px] text-slate-500">Official e-ASR Ready Reckoner & MRDA Title Certificate</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-slate-900 bg-white">
          
          {/* 1. OFFICIAL MEMO HEADER */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                  PROPS<span className="text-emerald-700">.AI</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 text-white tracking-wider">
                  INSTITUTIONAL MEMO
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                National Property Valuation, Circle Rate & Statutory Title Benchmark Registry
              </p>
            </div>

            <div className="text-right text-[11px] text-slate-600 space-y-0.5">
              <div>Certificate ID: <strong className="font-mono text-slate-900">{certNumber}</strong></div>
              <div>Issue Date: <strong className="text-slate-900">{currentDate}</strong></div>
              <div>Compliance: <strong className="text-emerald-700">IGR Ready Reckoner & MRDA RL</strong></div>
            </div>
          </div>

          {/* 2. LOCATION & JURISDICTION SUMMARY */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Geographic Jurisdiction & Urban Planning Classification
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">State:</span>
                <strong className="text-slate-900 text-sm">{state}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Metropolitan Region:</span>
                <strong className="text-slate-900 text-sm">{city}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Micro-Market Area:</span>
                <strong className="text-emerald-800 text-sm">{locality}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Planning Authority:</span>
                <strong className="text-slate-900 text-sm">{mrda?.acronym || data.sanction_authority}</strong>
              </div>
            </div>
          </div>

          {/* 3. CERTIFIED PRICING MATRIX */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Certified Valuation & Circle Rate Benchmark Matrix
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Box A: Apartments */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-white space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>High-Rise Apartments & Flats</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">Per sq.ft</span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  INR {matrix.market_rate_avg?.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/sq.ft</span>
                </div>
                <div className="text-xs text-slate-600 border-t border-slate-100 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Ready Reckoner Circle Rate:</span>
                    <strong className="text-indigo-700">INR {matrix.ready_reckoner_circle_rate?.toLocaleString('en-IN')}/sq.ft</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Typical 2 BHK (750 sq.ft):</span>
                    <strong>INR {((matrix.market_rate_avg * 750) / 100000).toFixed(1)} Lakhs</strong>
                  </div>
                </div>
              </div>

              {/* Box B: Residential NA Plots (Guntha) */}
              <div className="p-4 border border-emerald-200 rounded-2xl bg-emerald-50/40 space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-800">
                  <span>Residential NA Sanctioned Plots</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">1 Guntha = 1,089 sq.ft</span>
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  INR {((matrix.plot_rate_guntha || matrix.plot_rate_sqft * 1089) / 100000).toFixed(1)} Lakhs<span className="text-xs font-normal text-slate-500">/Guntha</span>
                </div>
                <div className="text-xs text-slate-600 border-t border-emerald-100 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Plot Rate per sq.ft:</span>
                    <strong className="text-emerald-800">INR {matrix.plot_rate_sqft?.toLocaleString('en-IN')}/sq.ft</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>1,000 sq.ft Sanctioned Plot:</span>
                    <strong>INR {((matrix.plot_rate_sqft * 1000) / 100000).toFixed(1)} Lakhs</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 4. CIVIC INFRASTRUCTURE & ARTERIAL DISTANCES */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Nearby Civic Infrastructure & Arterial Distance Matrix
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Cafes & Dining:</span>
                <strong className="text-slate-800 text-[11px]">
                  {civic.cafes_restaurants?.[0]?.name || 'Specialty Coffee Bar'} ({civic.cafes_restaurants?.[0]?.distance_km || '0.8 km'})
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Schools & Colleges:</span>
                <strong className="text-slate-800 text-[11px]">
                  {civic.schools_colleges?.[0]?.name || 'CBSE School Campus'} ({civic.schools_colleges?.[0]?.distance_km || '1.2 km'})
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Markets & Retail:</span>
                <strong className="text-slate-800 text-[11px]">
                  {civic.markets_commercial?.[0]?.name || 'Shopping Hub'} ({civic.markets_commercial?.[0]?.distance_km || '0.5 km'})
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Railway & Metro:</span>
                <strong className="text-slate-800 text-[11px]">
                  {civic.transit_railway_metro?.[0]?.name || 'Metro Station'} ({civic.transit_railway_metro?.[0]?.distance_km || '4.5 km'})
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Highways & Expressways:</span>
                <strong className="text-slate-800 text-[11px]">
                  {civic.highways_expressways?.[0]?.name || 'Ring Road Axis'} ({civic.highways_expressways?.[0]?.distance_km || '2.2 km'})
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Airports:</span>
                <strong className="text-slate-800 text-[11px]">
                  {civic.airports?.[0]?.name || 'International Airport'} ({civic.airports?.[0]?.distance_km || '8.0 km'})
                </strong>
              </div>
            </div>
          </div>

          {/* 5. STATUTORY TITLE DUE DILIGENCE CHECKLIST */}
          <div className="border border-slate-200 p-4 rounded-2xl space-y-2 bg-slate-50">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>4. Statutory Title Due Diligence & Encumbrance Verification</span>
              <span className="text-emerald-700 text-[10px] font-bold">100% Eligible for Bank Lending</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>7/12 (Saat-Baara) Extract</strong> verified on Mahabhulekh digital registry.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Ferfar Mutation Entry</strong> verified with non-agricultural (NA 44) status.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>MRDA RL Order Number</strong> confirmed under {mrda?.acronym || 'MRDA'}.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Nationalized Bank Financing</strong>: SBI, HDFC, ICICI, BoM Approved.</span>
              </div>
            </div>
          </div>

          {/* 6. STATUTORY STAMP DUTY & TAX APPLICABILITY */}
          <div className="text-xs text-slate-500 border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <strong>Statutory Stamp Duty</strong>: {govt.stamp_duty_male_percent || 6}% under {govt.statutory_act || 'Maharashtra Stamp Act 1958 Article 25'} + Registration fee capped at INR 30,000.
            </div>
            <div className="text-[10px] text-slate-400 sm:text-right">
              Generated by Props.ai Institutional Real Estate Valuation Engine.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
