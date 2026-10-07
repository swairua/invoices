import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { MANUFACTURERS, PRODUCT_CATEGORIES } from './public-site-data';
import { useState } from 'react';

export function CategoriesSection() {
  const cols = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Product categories
          </h2>
          <p className="text-slate-600 mt-4">
            Laboratory reagents, instrumentation and consumables for every
            diagnostic and research setting.
          </p>
        </div>
        <div className={`grid ${cols} gap-5`}>
          {PRODUCT_CATEGORIES.map((cat) => (
            <div
              key={cat}
              className="group bg-slate-50 rounded-xl p-5 border border-slate-200 hover:shadow-md hover:border-maroon/50 transition-all text-center cursor-pointer"
            >
              <Package className="h-6 w-6 text-maroon mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-slate-800 group-hover:text-maroon-dark">
                {cat}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandLogo({ name, logo, className }: { name: string; logo?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={className}
      />
    );
  }
  return (
    <span className="text-xs font-semibold text-slate-600">{name}</span>
  );
}

export function BrandsSection() {
  return (
    <section className="py-14 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs text-slate-500 font-semibold mb-6">
          Brands and agencies we represent
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-5">
          {MANUFACTURERS.map((brand) => (
            <div
              key={brand.name}
              className="inline-flex items-center justify-center min-h-[3.5rem] max-w-[10rem] px-2"
            >
              <BrandLogo
                name={brand.name}
                logo={brand.logo}
                className="h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}