import { Badge } from "@/components/ui/badge";
import { Star, Heart, MapPin } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  location: string;
}

export default function ListingCard({ id, title, category, price, unit, image, location }: ListingCardProps) {
  return (
    <Link href={`/listing/${id}`}>
      <div className="group cursor-pointer relative bg-white rounded-3xl overflow-hidden shadow-premium hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          {/* Overlays */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/60 to-transparent opacity-60" />

          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 font-black tracking-widest text-[9px] uppercase px-3 py-1 rounded-full shadow-lg">
              {category}
            </Badge>
          </div>

          <button className="absolute top-4 right-4 h-9 w-9 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300 flex items-center justify-center group/heart">
            <Heart className="h-4 w-4 group-hover/heart:fill-current" />
          </button>

          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/90">
            <MapPin className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">{location.split(',')[0]}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-950 text-base leading-tight line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="font-black text-[10px] text-amber-700">4.9</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-lg text-slate-950">Rs {price.toLocaleString()}</span>
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">/{unit}</span>
            </div>

            <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-300">
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

