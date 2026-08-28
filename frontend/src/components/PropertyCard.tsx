import Link from 'next/link';
import { formatPrice } from '../lib/utils';
import { Bed, Square, Building, Sparkles } from 'lucide-react';

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isHighIntell = property.score > 80;

  return (
    <Link href={`/properties/${property.id}`} className="block h-full">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[16px] bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
        
        {/* Content */}
        <div className="flex flex-1 flex-col p-5 bg-gradient-to-b from-white/40 to-white/80">
          <div className="flex justify-between items-start mb-3">
            <div className="text-xl font-bold text-slate-900">
              {formatPrice(property.price)}
            </div>
            {/* IvyScore Badge */}
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-md transition-all ${isHighIntell ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200' : 'bg-white text-slate-600 border border-slate-200'}`}>
              <Sparkles className={`h-3 w-3 ${isHighIntell ? 'text-emerald-500' : 'text-slate-400'}`} />
              Score {property.score}
            </div>
          </div>
          <h3 className="mb-1 text-base font-semibold text-slate-800 line-clamp-1">
            {property.title}
          </h3>
          <p className="mb-4 text-sm text-slate-500 font-medium">
            {property.locality}, {property.city}
          </p>

          <div className="mt-auto flex gap-4 border-t border-slate-200/60 pt-4">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Bed className="h-4 w-4 text-emerald-500" />
              <span>{property.bhk} BHK</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Square className="h-4 w-4 text-emerald-500" />
              <span>{property.area} sqft</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}