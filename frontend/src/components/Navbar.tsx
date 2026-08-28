'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, MapPin, MessageSquare, TrendingUp, Sparkles, 
  Building2, ShieldCheck, Layers, Award, Landmark
} from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm py-2.5 px-4 sm:px-8' 
        : 'bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-3 px-4 sm:px-8'
    }`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Landmark className="h-4 w-4 text-white" />
            </div>
            <div className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
              Props<span className="text-emerald-600">.ai</span>
            </div>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3 text-emerald-600" /> Statutory Verified
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          <Link
            href="/search"
            className={`flex items-center gap-1.5 hover:text-emerald-600 transition-colors ${
              pathname === '/search' ? 'text-emerald-600 font-extrabold' : ''
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search & Valuation</span>
          </Link>

          <Link
            href="/map"
            className={`flex items-center gap-1.5 hover:text-emerald-600 transition-colors ${
              pathname === '/map' ? 'text-emerald-600 font-extrabold' : ''
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Pan-India GIS Map</span>
          </Link>

          <Link
            href="/advisor"
            className={`flex items-center gap-1.5 hover:text-emerald-600 transition-colors ${
              pathname === '/advisor' ? 'text-emerald-600 font-extrabold' : ''
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI Advisor</span>
          </Link>

          <Link
            href="/trends"
            className={`flex items-center gap-1.5 hover:text-emerald-600 transition-colors ${
              pathname === '/trends' ? 'text-emerald-600 font-extrabold' : ''
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Price Indices</span>
          </Link>
        </nav>

        {/* Right CTA Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/advisor"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Consult Advisor</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
