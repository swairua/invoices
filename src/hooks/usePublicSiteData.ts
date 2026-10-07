import { useQuery } from '@tanstack/react-query';
import { externalApiAdapter } from '@/integrations/database/external-api-adapter';

/**
 * Public website data hooks.
 * All reads go through the public (unauthenticated) endpoint and are strictly
 * read-only - they never touch write paths or mutate the real data.
 */

const NUM = (result: any): number => {
  const total = result?.data?.[0]?.total;
  return Number(total) || 0;
};

export interface PublicStats {
  clients: number;
  invoices: number;
  products: number;
  totalBilled: number;
}

export function usePublicStats() {
  return useQuery<PublicStats>({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const [clients, invoices, products, billed] = await Promise.all([
        externalApiAdapter.select('clients', { _count_only: true }, true),
        externalApiAdapter.select('invoices', { is_deleted: 0, invoice_type_id: 1, _count_only: true }, true),
        externalApiAdapter.select('products', { is_deleted: 0, _count_only: true }, true),
        externalApiAdapter.select('invoices', { is_deleted: 0, invoice_type_id: 1, _sum: 'amount' }, true),
      ]);
      return {
        clients: NUM(clients),
        invoices: NUM(invoices),
        products: NUM(products),
        totalBilled: Math.round(NUM(billed) * 100) / 100,
      };
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePublicProducts(limit = 48) {
  return useQuery<any[]>({
    queryKey: ['public-products', limit],
    queryFn: async () => {
      const { data, error } = await externalApiAdapter.select(
        'products',
        {
          is_deleted: 0,
          _limit: limit,
          _order: { column: 'created_at', direction: 'desc' },
        },
        true
      );
      if (error) return [];
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export interface PublicRecentItem {
  id: string;
  name: string;
  description: string;
  price: number;
  invoice_number?: string;
  invoice_date?: string;
}

export function usePublicRecentInvoiced(count = 12) {
  return useQuery<PublicRecentItem[]>({
    queryKey: ['public-recent-invoiced', count],
    queryFn: async () => {
      const invResult = await externalApiAdapter.select(
        'invoices',
        {
          is_deleted: 0,
          _order: { column: 'invoice_date', direction: 'desc' },
          _limit: 10,
        },
        true
      );
      const invoices = invResult.data || [];
      const ids = invoices.map((i: any) => i.id).filter(Boolean);
      if (ids.length === 0) return [];

      const itemsResult = await externalApiAdapter.select(
        'invoice_items',
        { invoice_id_in: ids, _limit: count },
        true
      );
      const items = itemsResult.data || [];
      const invoiceMap = new Map<string, any>(invoices.map((i: any) => [i.id, i]));

      return items.slice(0, count).map((item: any) => {
        const invoice = invoiceMap.get(item.invoice_id);
        return {
          id: item.id,
          name: item.name || item.description || 'Item',
          description: item.description || '',
          price: Number(item.unit_price) || 0,
          invoice_number: invoice?.invoice_number,
          invoice_date: invoice?.invoice_date,
        };
      });
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
