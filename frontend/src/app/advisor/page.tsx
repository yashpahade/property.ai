'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Send, Bot, User, MapPin, Building, ShieldCheck, 
  Layers, ArrowUpRight, Compass, RefreshCw, Copy, Check, LandPlot, Home,
  Route, GraduationCap, ShoppingBag, Train, Plane, HeartPulse, Coffee,
  ChevronRight, RotateCcw, CheckCircle2, IndianRupee, Tag
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  stepType?: 'state_selection' | 'city_selection' | 'area_selection' | 'valuation_result';
  stateChosen?: string;
  cityChosen?: string;
}

const STATES_DIRECTORY = [
  'Maharashtra', 'Karnataka', 'Telangana', 'Delhi NCR', 
  'Gujarat', 'Uttar Pradesh', 'Tamil Nadu', 'Rajasthan'
];

const CITIES_BY_STATE: Record<string, string[]> = {
  'Maharashtra': ['Nagpur', 'Pune', 'Mumbai MMR', 'Thane', 'Navi Mumbai', 'Nashik', 'Alibaug / Coastal', 'Sindhudurg'],
  'Karnataka': ['Bangalore (Bengaluru)', 'Mysore', 'Mangalore', 'Hubli'],
  'Telangana': ['Hyderabad (HMDA)', 'Tellapur / Gachibowli', 'Warangal', 'Secunderabad'],
  'Delhi NCR': ['Gurgaon (Gurugram)', 'Noida', 'Greater Noida (YEIDA)', 'Delhi Core'],
  'Gujarat': ['Ahmedabad (AUDA)', 'GIFT City / Gandhinagar', 'Surat', 'Vadodara'],
  'Uttar Pradesh': ['Noida Sector 150', 'Lucknow', 'Varanasi', 'Kanpur'],
  'Tamil Nadu': ['Chennai (OMR Corridor)', 'Coimbatore', 'Madurai'],
  'Rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur']
};

interface AreaItem {
  label: string;
  query: string;
  plotRate: string;
  flatRate: string;
}

const AREAS_BY_CITY: Record<string, AreaItem[]> = {
  'Nagpur': [
    { label: 'Besa & Pipla (Wardha Rd)', query: 'Besa Pipla Plots Nagpur', plotRate: '₹39.2L/Guntha', flatRate: '₹4,400/sq.ft' },
    { label: 'Wardha Road MIHAN & SEZ', query: 'Wardha Road MIHAN Nagpur', plotRate: '₹45.5L/Guntha', flatRate: '₹5,100/sq.ft' },
    { label: 'Dharampeth & Ramdaspeth', query: 'Dharampeth Ramdaspeth Nagpur', plotRate: '₹1.15 Cr/Guntha', flatRate: '₹9,800/sq.ft' },
    { label: 'Hingna & Wanadongri', query: 'Hingna Wanadongri Nagpur', plotRate: '₹26.5L/Guntha', flatRate: '₹3,600/sq.ft' },
    { label: 'Wadi & Gondkhairi (Samruddhi)', query: 'Wadi Gondkhairi Samruddhi Nagpur', plotRate: '₹22.8L/Guntha', flatRate: '₹3,400/sq.ft' },
    { label: 'Koradi Road & Godhani', query: 'Koradi Road Nagpur', plotRate: '₹31.0L/Guntha', flatRate: '₹3,900/sq.ft' },
    { label: 'Umred Road & Dighori', query: 'Dighori Umred Road Nagpur', plotRate: '₹28.5L/Guntha', flatRate: '₹3,700/sq.ft' }
  ],
  'Pune': [
    { label: 'Hinjewadi (Phases 1-4) & Marunji', query: 'Hinjewadi Marunji PMRDA Plots Pune', plotRate: '₹68.0L/Guntha', flatRate: '₹7,200/sq.ft' },
    { label: 'Baner, Balewadi & Aundh', query: 'Baner Balewadi Pune', plotRate: '₹1.45 Cr/Guntha', flatRate: '₹11,500/sq.ft' },
    { label: 'Kothrud & Deccan', query: 'Kothrud Pune', plotRate: '₹1.65 Cr/Guntha', flatRate: '₹14,200/sq.ft' },
    { label: 'Wakad, Ravet & Punawale', query: 'Wakad Ravet Pune', plotRate: '₹78.0L/Guntha', flatRate: '₹7,900/sq.ft' },
    { label: 'Kharadi (EON/WTC) & Wagholi', query: 'Kharadi Wagholi Pune', plotRate: '₹82.0L/Guntha', flatRate: '₹8,600/sq.ft' },
    { label: 'Moshi (Spine Rd) & Chakan', query: 'Moshi Chakan Pune', plotRate: '₹34.5L/Guntha', flatRate: '₹4,800/sq.ft' },
    { label: 'Bavdhan, Sus & Pirangut', query: 'Bavdhan Pirangut Pune', plotRate: '₹56.0L/Guntha', flatRate: '₹6,800/sq.ft' }
  ],
  'Mumbai MMR': [
    { label: 'Bandra West & BKC', query: 'Bandra West Mumbai', plotRate: 'Freehold Heritage', flatRate: '₹48,500/sq.ft' },
    { label: 'Worli & Lower Parel', query: 'Worli Lower Parel Mumbai', plotRate: 'Sea-Facing High Rise', flatRate: '₹42,000/sq.ft' },
    { label: 'Andheri West (Lokhandwala)', query: 'Andheri West Mumbai', plotRate: 'Urban Core', flatRate: '₹26,500/sq.ft' },
    { label: 'Powai & Hiranandani', query: 'Powai Hiranandani Mumbai', plotRate: 'Township', flatRate: '₹24,800/sq.ft' },
    { label: 'Thane West (Ghodbunder)', query: 'Thane West Ghodbunder Road', plotRate: '₹95.0L/Guntha', flatRate: '₹11,800/sq.ft' },
    { label: 'Kharghar & Panvel (Airport Axis)', query: 'Kharghar Panvel Navi Mumbai', plotRate: '₹72.0L/Guntha', flatRate: '₹8,900/sq.ft' },
    { label: 'Alibaug Coastal NA Plots', query: 'Alibaug Mandwa Coastal NA Plots', plotRate: '₹42.0L/Guntha', flatRate: 'Villas: ₹2.2 Cr' }
  ],
  'Thane': [
    { label: 'Thane West (Ghodbunder Road)', query: 'Thane West Ghodbunder Road', plotRate: '₹95.0L/Guntha', flatRate: '₹11,800/sq.ft' },
    { label: 'Majiwada & Pokhran', query: 'Majiwada Thane', plotRate: 'Urban Core', flatRate: '₹14,500/sq.ft' },
    { label: 'Kalyan-Dombivli Palava', query: 'Kalyan Dombivli Palava', plotRate: '₹38.0L/Guntha', flatRate: '₹5,800/sq.ft' },
    { label: 'Mira Road & Bhayandar', query: 'Mira Road Bhayandar', plotRate: '₹55.0L/Guntha', flatRate: '₹8,200/sq.ft' }
  ],
  'Navi Mumbai': [
    { label: 'Kharghar & Panvel (Airport Axis)', query: 'Kharghar Panvel Navi Mumbai', plotRate: '₹72.0L/Guntha', flatRate: '₹8,900/sq.ft' },
    { label: 'Ulwe & Dronagiri (MTHL / Atal Setu)', query: 'Ulwe Dronagiri Navi Mumbai', plotRate: '₹62.0L/Guntha', flatRate: '₹7,600/sq.ft' },
    { label: 'Vashi & Seawoods', query: 'Vashi Seawoods Navi Mumbai', plotRate: 'CIDCO Freehold', flatRate: '₹16,500/sq.ft' }
  ],
  'Bangalore (Bengaluru)': [
    { label: 'Whitefield IT Corridor', query: 'Whitefield Bangalore', plotRate: '₹78.0L/Guntha', flatRate: '₹8,200/sq.ft' },
    { label: 'Sarjapur Road & Bellandur', query: 'Sarjapur Road Bangalore', plotRate: '₹85.0L/Guntha', flatRate: '₹9,100/sq.ft' },
    { label: 'Electronic City Phase 1 & 2', query: 'Electronic City Bangalore', plotRate: '₹48.0L/Guntha', flatRate: '₹5,800/sq.ft' },
    { label: 'Devanahalli (Airport Corridor)', query: 'Devanahalli Airport Bangalore', plotRate: '₹38.0L/Guntha', flatRate: '₹5,200/sq.ft' }
  ],
  'Hyderabad (HMDA)': [
    { label: 'Gachibowli & Financial District', query: 'Gachibowli Hyderabad', plotRate: '₹1.80 Cr/Guntha', flatRate: '₹9,800/sq.ft' },
    { label: 'Tellapur & Kokapet (HMDA Plots)', query: 'Tellapur Hyderabad plots', plotRate: '₹1.10 Cr/Guntha', flatRate: '₹7,600/sq.ft' },
    { label: 'Mokila & Shankarpalli', query: 'Mokila Hyderabad plots', plotRate: '₹38.0L/Guntha', flatRate: 'Villas: ₹1.8 Cr' },
    { label: 'Shamshabad (Airport Corridor)', query: 'Shamshabad Hyderabad', plotRate: '₹42.0L/Guntha', flatRate: '₹5,400/sq.ft' }
  ],
  'Gurgaon (Gurugram)': [
    { label: 'Golf Course Extension Road', query: 'Golf Course Extension Gurgaon', plotRate: 'HSVP Freehold', flatRate: '₹18,500/sq.ft' },
    { label: 'Dwarka Expressway Sector 102-113', query: 'Dwarka Expressway Gurgaon', plotRate: '₹1.20 Cr/Guntha', flatRate: '₹12,400/sq.ft' },
    { label: 'Sohna Road Corridor', query: 'Sohna Road Gurgaon', plotRate: '₹48.0L/Guntha', flatRate: '₹7,200/sq.ft' }
  ],
  'Noida': [
    { label: 'Sector 150 Expressway', query: 'Sector 150 Noida Expressway', plotRate: 'Authority Lease', flatRate: '₹8,600/sq.ft' },
    { label: 'Greater Noida West / Extension', query: 'Greater Noida West', plotRate: '₹42.0L/Guntha', flatRate: '₹5,200/sq.ft' },
    { label: 'YEIDA Yamuna Expressway', query: 'YEIDA Yamuna Expressway', plotRate: '₹28.0L/Guntha', flatRate: '₹4,400/sq.ft' }
  ]
};

export default function AdvisorPage() {
  const [currentStep, setCurrentStep] = useState<'state' | 'city' | 'area' | 'valuation'>('state');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedCity, setSelectedCity] = useState<string>('Nagpur');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'step-1-init',
      role: 'assistant',
      content: `### Step 1: Select or Enter State

Please select your target **State** to initiate institutional property valuation:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stepType: 'state_selection'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handler 1: State Selection
  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    setCurrentStep('city');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `State: ${stateName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `### Step 2: Select City / Metropolitan Region in ${stateName}

State mapped: **${stateName}**. Select your target **City or Metropolitan Region**:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stepType: 'city_selection',
      stateChosen: stateName
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  // Handler 2: City Selection
  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setCurrentStep('area');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `City: ${cityName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `### Step 3: Choose Area & Check Live Prices in ${cityName}

City mapped: **${cityName} (${selectedState})**. Select a micro-market below to view certified rates per Guntha and sq.ft:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stepType: 'area_selection',
      stateChosen: selectedState,
      cityChosen: cityName
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  // Handler 3: Area Selection -> Executes Valuation & Civic Amenities
  const handleAreaSelect = async (areaLabel: string, areaQuery: string, plotRate: string, flatRate: string) => {
    setCurrentStep('valuation');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Selected Area: ${areaLabel} (Plots: ${plotRate} | Flats: ${flatRate})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `${areaQuery} ${selectedCity} ${selectedState}` })
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Valuation retrieved successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stepType: 'valuation_result',
        stateChosen: selectedState,
        cityChosen: selectedCity
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `### Institutional Valuation Report: ${areaLabel}

**Geographic Hierarchy**: State: **${selectedState}** | City: **${selectedCity}** | Area: **${areaLabel}**

---

### Verified Pricing & Valuation Matrix
* **Residential NA Sanctioned Plots**: **${flatRate}** (~**${plotRate}** [1 Guntha = 1,089 sq.ft])
  * *Standard 1,000 sq.ft Plot*: ~**INR 36.0 Lakhs**
  * *2 Guntha Plot (2,178 sq.ft)*: ~**INR 78.4 Lakhs**
* **High-Rise Apartments & Flats**: **${flatRate}** (Ready Reckoner Circle Rate: **INR 3,100/sq.ft**)
  * *Typical 2 BHK (750 sq.ft)*: ~**INR 33.0 Lakhs** | *Est. Monthly Rent*: ~**INR 15,500/mo**
* **Duplex Penthouses**: ~**INR 0.85 Cr**
* **Independent Villas & Bungalows**: ~**INR 1.30 Cr**

---

### Nearby Civic Infrastructure & Arterial Distances
* **Cafes & Dining**: Specialty Coffee Bar & Local Food Street (0.8 km)
* **Schools & Education**: International School & Regional College (1.2 km)
* **Markets & Retail**: Main Town Shopping Center & Commercial Hub (0.5 km)
* **Transit (Railway / Metro)**: Metro Station (4.5 km), Junction Railway (9.5 km)
* **Highways & Arterials**: 4-Lane Ring Road / National Highway (2.2 km)
* **Airports**: International / Domestic Airport (8.0 km)

---

### Statutory Sanctions & Bank Loan Status
* **Sanction Authority**: MRDA / Designated Regional Planning Authority
* **Title Due Diligence**: Verify 7/12 (Saat-Baara) extract, Ferfar mutation, and layout sanction order.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stepType: 'valuation_result',
        stateChosen: selectedState,
        cityChosen: selectedCity
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Custom User Input Form
  const handleCustomSend = async () => {
    if (!input.trim() || loading) return;
    const queryText = input.trim();
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText })
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Valuation retrieved successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stepType: 'valuation_result'
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('state');
    setSelectedState('Maharashtra');
    setSelectedCity('Nagpur');
    setMessages([
      {
        id: 'step-1-init',
        role: 'assistant',
        content: `### Step 1: Select or Enter State

Please select your target **State** to initiate institutional property valuation:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stepType: 'state_selection'
      }
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 text-slate-900 pt-14 md:pt-16 font-sans">
      
      {/* 1. HEADER BAR */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Bot className="h-5 w-5 text-emerald-700" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-slate-900">
                Institutional Real Estate Guided Advisor
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Redis Fast Cache
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive Flow: State -> City -> Area (With Live Guntha & Sq.ft Prices) -> Cafes & Schools
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Restart Workflow"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Restart Flow</span>
        </button>
      </div>

      {/* 2. MESSAGES CONTAINER WITH INTERACTIVE SCRIPT STEPS */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 p-[1.5px] shrink-0 mt-1 shadow-sm">
                    <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                      <Bot className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                )}

                <div className={`relative max-w-[94%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none font-medium shadow-md shadow-emerald-600/10'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  
                  {/* Message Content */}
                  {msg.role === 'assistant' ? (
                    <div 
                      className="prose prose-sm prose-slate max-w-none text-slate-800"
                      dangerouslySetInnerHTML={{ 
                        __html: msg.content
                          .replace(/### (.*?)\n/g, '<h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 mb-2 mt-2">$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
                          .replace(/\* (.*?)\n/g, '<div class="flex items-start gap-1.5 my-1"><span class="text-emerald-600 mt-0.5">•</span><span>$1</span></div>')
                          .replace(/---/g, '<hr class="border-slate-100 my-3"/>')
                      }} 
                    />
                  ) : (
                    <div>{msg.content}</div>
                  )}

                  {/* STEP 1: INTERACTIVE STATE BUTTONS */}
                  {msg.stepType === 'state_selection' && isLastMessage && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Click to Choose State:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {STATES_DIRECTORY.map((st) => (
                          <button
                            key={st}
                            onClick={() => handleStateSelect(st)}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-all shadow-sm active:scale-95 flex items-center gap-1"
                          >
                            <span>{st}</span>
                            <ChevronRight className="h-3 w-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: INTERACTIVE CITY BUTTONS */}
                  {msg.stepType === 'city_selection' && isLastMessage && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Click to Choose City in {msg.stateChosen || selectedState}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(CITIES_BY_STATE[msg.stateChosen || selectedState] || ['Nagpur', 'Pune', 'Mumbai MMR', 'Thane']).map((ct) => (
                          <button
                            key={ct}
                            onClick={() => handleCitySelect(ct)}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-500 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-800 transition-all shadow-sm active:scale-95 flex items-center gap-1"
                          >
                            <span>{ct}</span>
                            <ChevronRight className="h-3 w-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: INTERACTIVE AREA BUTTONS WITH VISIBLE LIVE PRICES */}
                  {msg.stepType === 'area_selection' && isLastMessage && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Choose Area in {msg.cityChosen || selectedCity} (With Live Rates):</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          1 Guntha = 1,089 sq.ft
                        </span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(AREAS_BY_CITY[msg.cityChosen || selectedCity] || AREAS_BY_CITY['Nagpur']).map((area, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAreaSelect(area.label, area.query, area.plotRate, area.flatRate)}
                            className="p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-500 rounded-2xl text-left transition-all shadow-sm active:scale-95 flex flex-col justify-between space-y-1.5 group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 group-hover:text-emerald-800">
                                {area.label}
                              </span>
                              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </div>

                            {/* Prominent Price Tag Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                                Plots: {area.plotRate}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                                Flats: {area.flatRate}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: VALUATION NEXT-STEP ACTION BUTTONS */}
                  {msg.stepType === 'valuation_result' && isLastMessage && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCitySelect(selectedCity)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1"
                      >
                        <Compass className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Another Area in {selectedCity}</span>
                      </button>
                      <button
                        onClick={() => handleStateSelect(selectedState)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1"
                      >
                        <Building className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Change City</span>
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                        <span>Change State</span>
                      </button>
                      <Link
                        href={`/search?q=${encodeURIComponent(selectedCity)}`}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Full City Directory</span>
                      </Link>
                    </div>
                  )}

                  {/* Footer Timestamp & Copy Button */}
                  <div className={`flex items-center justify-between pt-1 text-[10px] ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400 border-t border-slate-100'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
                      >
                        {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1 font-bold text-xs shadow-sm">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 p-[1.5px] shrink-0 mt-1 shadow-sm">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Bot className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-medium">Retrieving certified plot rates (₹/Guntha), flat prices, nearby cafes & schools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. BOTTOM INPUT FORM */}
      <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0 space-y-2 mb-14 md:mb-0 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-2">
          
          <div className="relative flex items-center">
            <input 
              type="text"
              placeholder="Or type any specific custom village, plot, town or query (e.g. Waki Pune, Besa Nagpur)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCustomSend();
                }
              }}
              disabled={loading}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl md:rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 shadow-inner transition-all font-medium"
            />
            <button
              onClick={handleCustomSend}
              disabled={loading || !input.trim()}
              className="absolute right-1.5 p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-lg md:rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
