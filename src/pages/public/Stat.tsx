import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from './public-site-data';

interface StatProps {
  number: number | undefined;
  label: string;
  suffix?: string;
  isCurrency?: boolean;
}

export function Stat({ number, label, suffix = '+', isCurrency }: StatProps) {
  const value = isCurrency ? formatCurrency(number ?? 0) : `${number ?? '-'}${number != null ? suffix : ''}`;
  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl font-extrabold">{value}</p>
      <p className="text-slate-400 text-sm mt-1">{label}</p>
    </div>
  );
}

export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="secondary" className="text-xs font-semibold bg-white/60 border-white/50">
      {children}
    </Badge>
  );
}
