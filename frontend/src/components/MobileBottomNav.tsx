'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MapPin, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search & Rates', href: '/search', icon: Search },
    { label: 'Live Map', href: '/map', icon: MapPin },
    { label: 'AI Advisor', href: '/advisor', icon: MessageSquare, badge: 'AI' },
    { label: 'Price Trends', href: '/trends', icon: TrendingUp },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-emerald-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Active Indicator Pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-8 h-1 bg-emerald-600 rounded-full shadow-[0_0_8px_rgba(5,150,105,0.4)]" />
              )}

              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110 text-emerald-600' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 text-[8px] font-black text-white px-1 py-0.2 rounded-full border border-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
