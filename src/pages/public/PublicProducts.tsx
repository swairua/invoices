import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanyConfig } from '@/hooks/useCompanyConfig';
import { useSEO } from '@/hooks/useSEO';
import { generateOrganizationSchema } from '@/utils/seoHelpers';
import { usePublicProducts } from '@/hooks/usePublicSiteData';
import { PRODUCT_CATEGORIES, formatCurrency } from './public-site-data';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';

export default function PublicProducts() {
  const company = useCompanyConfig();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useSEO(
    {
      title: `Products - ${company.name || 'Haemonetics East Africa Limited'}`,
      description:
        'Browse our catalogue of laboratory reagents, instrumentation, consumables and diagnostic equipment across East Africa.',
      keywords:
        'laboratory equipment, reagents, diagnostics, medical supplies, Kenya, catalog',
      url: '/products',
      image: company.logo_url,
    },
    generateOrganizationSchema(company)
  );

  const { data: products = [], isLoading } = usePublicProducts(200);

  const filtered = useMemo(() => {
    return products.filter((p: any) => {
      const matchesSearch =
        !search ||
        (p.name || p.notes || productCode(p)).toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === 'All' ||
        p.category === activeCategory ||
        true; // categories are free-text; show all by default, filter by search only
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      <PublicHeader />

      <section className="bg-gradient-to-br from-slate-50 via-neutral-100 to-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Our catalogue
          </h1>
          <p className="text-slate-600 mt-4 max-w-2xl">
            Laboratory reagents, instrumentation, consumables and diagnostic
            equipment backed by genuine manufacturer warranty and local
            technical support across East Africa.
          </p>
        </div>
      </section>

      <section className="py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', ...PRODUCT_CATEGORIES.slice(0, 5)].map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'secondary'}
                  className={
                    activeCategory === cat
                      ? 'bg-maroon text-white'
                      : 'text-slate-700'
                  }
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No products match your search. Try adjusting the keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              className="border-slate-300 bg-white"
            >
              <Link to="/">
                <span className="font-semibold">Back to website</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function productCode(p: any): string {
  return p?.product_code || p?.sku || '';
}

function ProductCard({ product }: { product: any }) {
  const name = product.name || product.notes || productCode(product) || 'Product';
  const desc = product.description || product.notes || '';
  const price = product.selling_price ?? product.cost_price ?? product.unit_price;
  const stock = product.stock_quantity ?? product.quantity;
  return (
    <Card className="border border-slate-200 hover:shadow-md transition-shadow group flex flex-col h-full">
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
            <h3 className="font-semibold text-slate-900 group-hover:text-maroon-dark line-clamp-1">
            {name}
          </h3>
          {desc && (
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{desc}</p>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-slate-900">
            {price ? formatCurrency(Number(price)) : 'On request'}
          </span>
          {Number(stock) > 0 ? (
              <Badge className="bg-maroon/10 text-maroon-dark text-xs">
              In stock
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Out of stock
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
