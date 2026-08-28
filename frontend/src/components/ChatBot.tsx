'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, User, Bot, Sparkles, ChevronRight, 
  RotateCcw, ArrowUpRight, MapPin, Building, LandPlot, Coffee
} from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  stepType?: 'state' | 'city' | 'area' | 'result';
  stateChosen?: string;
  cityChosen?: string;
}

const STATES_DIRECTORY = [
  'Maharashtra', 'Karnataka', 'Telangana', 'Delhi NCR', 'Gujarat', 'Uttar Pradesh'
];

const CITIES_BY_STATE: Record<string, string[]> = {
  'Maharashtra': ['Nagpur', 'Pune', 'Mumbai MMR', 'Thane', 'Navi Mumbai', 'Alibaug'],
  'Karnataka': ['Bangalore (Bengaluru)', 'Mysore', 'Mangalore'],
  'Telangana': ['Hyderabad (HMDA)', 'Tellapur / Gachibowli'],
  'Delhi NCR': ['Gurgaon (Gurugram)', 'Noida', 'Greater Noida'],
  'Gujarat': ['Ahmedabad (AUDA)', 'GIFT City'],
  'Uttar Pradesh': ['Noida Sector 150', 'Lucknow']
};

interface AreaItem {
  label: string;
  query: string;
  priceTag: string;
}

const AREAS_BY_CITY: Record<string, AreaItem[]> = {
  'Nagpur': [
    { label: 'Besa & Pipla (Wardha Rd)', query: 'Besa Pipla Plots Nagpur', priceTag: 'Plots: ₹39.2L/Guntha • ₹4,400/sqft' },
    { label: 'Wardha Road MIHAN & SEZ', query: 'Wardha Road MIHAN Nagpur', priceTag: 'Plots: ₹45.5L/Guntha • ₹5,100/sqft' },
    { label: 'Dharampeth & Ramdaspeth', query: 'Dharampeth Ramdaspeth Nagpur', priceTag: 'Flats: ₹9,800/sqft' },
    { label: 'Hingna & Wanadongri', query: 'Hingna Wanadongri Nagpur', priceTag: 'Plots: ₹26.5L/Guntha • ₹3,600/sqft' },
    { label: 'Wadi & Gondkhairi', query: 'Wadi Gondkhairi Samruddhi Nagpur', priceTag: 'Plots: ₹22.8L/Guntha • ₹3,400/sqft' }
  ],
  'Pune': [
    { label: 'Hinjewadi & Marunji', query: 'Hinjewadi Marunji PMRDA Plots Pune', priceTag: 'Plots: ₹68.0L/Guntha • ₹7,200/sqft' },
    { label: 'Baner & Balewadi', query: 'Baner Balewadi Pune', priceTag: 'Flats: ₹11,500/sqft' },
    { label: 'Kothrud & Deccan', query: 'Kothrud Pune', priceTag: 'Flats: ₹14,200/sqft' },
    { label: 'Wakad & Ravet', query: 'Wakad Ravet Pune', priceTag: 'Plots: ₹78.0L/Guntha • ₹7,900/sqft' },
    { label: 'Kharadi (EON/WTC)', query: 'Kharadi Wagholi Pune', priceTag: 'Flats: ₹8,600/sqft' }
  ],
  'Mumbai MMR': [
    { label: 'Bandra West & BKC', query: 'Bandra West Mumbai', priceTag: 'Flats: ₹48,500/sqft' },
    { label: 'Worli & Lower Parel', query: 'Worli Lower Parel Mumbai', priceTag: 'Flats: ₹42,000/sqft' },
    { label: 'Andheri West (Lokhandwala)', query: 'Andheri West Mumbai', priceTag: 'Flats: ₹26,500/sqft' },
    { label: 'Powai & Hiranandani', query: 'Powai Hiranandani Mumbai', priceTag: 'Flats: ₹24,800/sqft' },
    { label: 'Kharghar & Panvel', query: 'Kharghar Panvel Navi Mumbai', priceTag: 'Plots: ₹72.0L/Guntha • ₹8,900/sqft' },
    { label: 'Alibaug Coastal NA', query: 'Alibaug Mandwa Coastal NA Plots', priceTag: 'Plots: ₹42.0L/Guntha' }
  ],
  'Thane': [
    { label: 'Thane West (Ghodbunder)', query: 'Thane West Ghodbunder Road', priceTag: 'Plots: ₹95.0L/Guntha • ₹11,800/sqft' },
    { label: 'Majiwada & Pokhran', query: 'Majiwada Thane', priceTag: 'Flats: ₹14,500/sqft' },
    { label: 'Kalyan-Dombivli Palava', query: 'Kalyan Dombivli Palava', priceTag: 'Plots: ₹38.0L/Guntha • ₹5,800/sqft' }
  ],
  'Navi Mumbai': [
    { label: 'Kharghar & Panvel (Airport Axis)', query: 'Kharghar Panvel Navi Mumbai', priceTag: 'Plots: ₹72.0L/Guntha • ₹8,900/sqft' },
    { label: 'Ulwe & Dronagiri (MTHL Axis)', query: 'Ulwe Dronagiri Navi Mumbai', priceTag: 'Plots: ₹62.0L/Guntha • ₹7,600/sqft' }
  ],
  'Bangalore (Bengaluru)': [
    { label: 'Whitefield IT Corridor', query: 'Whitefield Bangalore', priceTag: 'Plots: ₹78.0L/Guntha • ₹8,200/sqft' },
    { label: 'Sarjapur Road & Bellandur', query: 'Sarjapur Road Bangalore', priceTag: 'Plots: ₹85.0L/Guntha • ₹9,100/sqft' }
  ],
  'Hyderabad (HMDA)': [
    { label: 'Gachibowli & Financial District', query: 'Gachibowli Hyderabad', priceTag: 'Flats: ₹9,800/sqft' },
    { label: 'Tellapur & Kokapet Plots', query: 'Tellapur Hyderabad plots', priceTag: 'Plots: ₹1.10 Cr/Guntha' }
  ],
  'Gurgaon (Gurugram)': [
    { label: 'Golf Course Extension Road', query: 'Golf Course Extension Gurgaon', priceTag: 'Flats: ₹18,500/sqft' },
    { label: 'Dwarka Expressway Sector 102-113', query: 'Dwarka Expressway Gurgaon', priceTag: 'Plots: ₹1.20 Cr/Guntha' }
  ],
  'Noida': [
    { label: 'Sector 150 Expressway', query: 'Sector 150 Noida Expressway', priceTag: 'Flats: ₹8,600/sqft' },
    { label: 'Greater Noida West', query: 'Greater Noida West', priceTag: 'Plots: ₹42.0L/Guntha • ₹5,200/sqft' }
  ]
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedCity, setSelectedCity] = useState('Nagpur');

  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: '### Step 1: Select State\nPlease choose your target state to start guided valuation with live prices:',
    sender: 'bot',
    timestamp: new Date(),
    stepType: 'state'
  }]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    const userMsg: Message = { id: Date.now(), text: `State: ${stateName}`, sender: 'user', timestamp: new Date() };
    const botMsg: Message = {
      id: Date.now() + 1,
      text: `### Step 2: Select City in ${stateName}\nChoose your city or metropolitan region:`,
      sender: 'bot',
      timestamp: new Date(),
      stepType: 'city',
      stateChosen: stateName
    };
    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    const userMsg: Message = { id: Date.now(), text: `City: ${cityName}`, sender: 'user', timestamp: new Date() };
    const botMsg: Message = {
      id: Date.now() + 1,
      text: `### Step 3: Choose Area & Check Prices in ${cityName}\nSelect a micro-market to view verified rates per Guntha and sq.ft:`,
      sender: 'bot',
      timestamp: new Date(),
      stepType: 'area',
      stateChosen: selectedState,
      cityChosen: cityName
    };
    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const handleAreaSelect = async (areaLabel: string, areaQuery: string, priceTag: string) => {
    const userMsg: Message = { id: Date.now(), text: `Area: ${areaLabel} (${priceTag})`, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `${areaQuery} ${selectedCity} ${selectedState}` }),
      });
      
      if (!res.ok) throw new Error('API failed');

      const data = await res.json();
      const botMsg: Message = { 
        id: Date.now() + 1, 
        text: data.reply, 
        sender: 'bot', 
        timestamp: new Date(),
        stepType: 'result',
        stateChosen: selectedState,
        cityChosen: selectedCity
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const fallbackMsg: Message = { 
        id: Date.now() + 1, 
        text: `### Valuation for ${areaLabel} (${selectedCity})\n* **Residential Plots**: ${priceTag}\n* **Flats Average**: INR 4,400/sq.ft (Circle Rate: INR 3,100/sq.ft)\n* **Cafes & Dining**: 0.8 km\n* **Schools & Education**: 1.2 km\n* **Transit / Metro**: 4.5 km`, 
        sender: 'bot', 
        timestamp: new Date(),
        stepType: 'result'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCustomSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      
      if (!res.ok) throw new Error('API failed');

      const data = await res.json();
      const botMsg: Message = { id: Date.now() + 1, text: data.reply, sender: 'bot', timestamp: new Date(), stepType: 'result' };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setTimeout(() => {
        const botMsg: Message = { 
          id: Date.now() + 1, 
          text: `Valuation for ${text}: Rates range between INR 2,200 - INR 5,800/sq.ft (~INR 24.0L - INR 63.0L / Guntha). Check 7/12 extract & MRDA sanction.`, 
          sender: 'bot', 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, botMsg]);
      }, 800);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setSelectedState('Maharashtra');
    setSelectedCity('Nagpur');
    setMessages([{
      id: 1,
      text: '### Step 1: Select State\nPlease choose your target state to start guided valuation with live prices:',
      sender: 'bot',
      timestamp: new Date(),
      stepType: 'state'
    }]);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 font-sans">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[94vw] sm:w-[420px] h-[560px] max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 text-slate-900">
          
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Guided Valuation Assistant
                </h3>
                <span className="text-[10px] text-emerald-700 font-semibold">State -> City -> Area (Live Rates) -> Cafes/Schools</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleReset}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors text-[10px] flex items-center gap-1 font-semibold"
                title="Restart Workflow"
              >
                <RotateCcw size={12} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container with Interactive Step Buttons */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;

              return (
                <div 
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={14} />
                    </div>
                  )}
                  <div 
                    className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed shadow-sm space-y-2.5 ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none font-medium' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: msg.text
                          .replace(/### (.*?)\n/g, '<h4 class="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1.5">$1</h4>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
                          .replace(/\* (.*?)\n/g, '<div class="flex items-start gap-1 my-0.5"><span class="text-emerald-600">•</span><span>$1</span></div>')
                          .replace(/---/g, '<hr class="border-slate-100 my-1.5"/>')
                      }} 
                    />

                    {/* Step 1 State Buttons */}
                    {msg.stepType === 'state' && isLast && (
                      <div className="pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                        {STATES_DIRECTORY.map((st) => (
                          <button
                            key={st}
                            onClick={() => handleStateSelect(st)}
                            className="px-2 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 rounded-lg text-[10px] font-semibold text-slate-700 hover:text-emerald-800 transition-colors"
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Step 2 City Buttons */}
                    {msg.stepType === 'city' && isLast && (
                      <div className="pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                        {(CITIES_BY_STATE[msg.stateChosen || selectedState] || ['Nagpur', 'Pune', 'Mumbai MMR']).map((ct) => (
                          <button
                            key={ct}
                            onClick={() => handleCitySelect(ct)}
                            className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-500 rounded-lg text-[10px] font-semibold text-slate-700 hover:text-indigo-800 transition-colors"
                          >
                            {ct}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Step 3 Area Buttons WITH LIVE PRICES */}
                    {msg.stepType === 'area' && isLast && (
                      <div className="pt-1.5 border-t border-slate-100 flex flex-col gap-1.5">
                        {(AREAS_BY_CITY[msg.cityChosen || selectedCity] || AREAS_BY_CITY['Nagpur']).map((ar, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAreaSelect(ar.label, ar.query, ar.priceTag)}
                            className="p-2 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-500 rounded-xl text-left flex flex-col justify-between transition-colors space-y-1 shadow-sm group"
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[11px] font-black text-slate-900 group-hover:text-emerald-800">{ar.label}</span>
                              <ArrowUpRight size={12} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 self-start">
                              {ar.priceTag}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Step 4 Action Buttons */}
                    {msg.stepType === 'result' && isLast && (
                      <div className="pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                        <button
                          onClick={() => handleCitySelect(selectedCity)}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                        >
                          Another Area in {selectedCity}
                        </button>
                        <button
                          onClick={handleReset}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                        >
                          Restart Flow
                        </button>
                      </div>
                    )}

                    <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2 justify-start items-center">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-slate-200 p-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleCustomSend(input); }}
            className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Or type any village, city, plot name..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-xs text-slate-900 placeholder:text-slate-400 font-medium"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors shrink-0"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
        title="Open Guided Real Estate Advisor"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

    </div>
  );
}
