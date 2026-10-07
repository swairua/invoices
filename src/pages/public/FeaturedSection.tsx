import { Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicRecentItem, usePublicProducts } from '@/hooks/usePublicSiteData';
import { formatCurrency } from './public-site-data';
import { SectionBadge } from './Stat';

interface FeaturedProps {
  items: PublicRecentItem[];
  loading: boolean;
}

export function RecentlyInvoiced({ items, loading }: FeaturedProps) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <SectionBadge>Recently invoiced</SectionBadge>
          <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-2">
            What we've delivered
          </h2>
          <p className="text-slate-600">
            A snapshot of recent customer orders — real products moving through
            our supply chain to labs and hospitals across East Africa.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-slate-500">No recent invoices to display.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card
                key={item.id}
                className="border border-slate-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <Badge variant="outline" className="text-xs mb-2">
                    {item.invoice_number || 'Invoice'}
                  </Badge>
                  <h3 className="font-semibold text-slate-900 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="font-semibold text-maroon-dark mt-3">
                    {formatCurrency(item.price)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ProductPreview() {
  const { data: products = [], isLoading } = usePublicProducts(12);
  return (
    <section className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <SectionBadge>Our catalogue</SectionBadge>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-2">
              Featured products
            </h2>
            <p className="text-slate-600">
              Hand-picked items from our inventory. All backed by genuine
              manufacturer warranty and local technical support.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/products">
              View all <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-60 w-full rounded-xl" />
        ) : products.length === 0 ? (
          <p className="text-slate-500">Catalogue loading.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product: any) => {
              const name = product.name || product.product_code || 'Product';
              const desc = product.description || product.notes || '';
              const price = product.selling_price ?? product.cost_price;
              const stock = product.stock_quantity ?? product.quantity;
              return (
                <Card
                  key={product.id}
                  className="border border-slate-200 hover:shadow-md transition-shadow group"
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-maroon-dark">
                        {name}
                      </h3>
                      {desc && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                          {desc}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {price ? formatCurrency(Number(price)) : 'On request'}
                      </span>
                      {Number(stock) > 0 ? (
                        <Badge className="bg-maroon/10 text-maroon-dark">
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
            })}
          </div>
        )}
        <div className="text-center mt-10">
          <Button asChild size="lg" className="bg-maroon hover:bg-maroon/dark text-white">
            <Link to="/products">
              All products <ShoppingCart className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
