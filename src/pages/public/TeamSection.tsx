import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TEAM, TeamMember, CLIENT_LOGOS } from './public-site-data';
import { SectionBadge } from './Stat';
import { useState } from 'react';

function ClientLogo({ name, logo, className }: { name: string; logo?: string; className?: string }) {
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
    <span className="text-xs text-slate-300">{name}</span>
  );
}

export function TeamSection() {
  return (
    <section id="team" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionBadge>Our leadership</SectionBadge>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            Leading with expertise
          </h2>
          <p className="text-slate-600 mt-4">
            Our management team brings deep industry knowledge and a commitment
            to advancing healthcare delivery across East Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member: TeamMember) => (
            <Card
              key={member.name}
              className="border border-slate-200 text-center hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-6">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-maroon/10 to-neutral-100 flex items-center justify-center mb-4 text-2xl">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-bold text-slate-900">{member.name}</h3>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {member.title}
                </Badge>
                <p className="mt-3 text-sm text-slate-600 line-clamp-5">
                  {member.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClientsStrip() {
  return (
    <section className="py-14 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs text-slate-400 font-semibold mb-6">
          Trusted by leading healthcare providers and research institutions
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 mt-4">
          {CLIENT_LOGOS.map((client) => (
            <div
              key={client.name}
              className="inline-flex items-center justify-center min-h-[2.5rem] max-w-[10rem] px-1"
            >
              <ClientLogo
                name={client.name}
                logo={client.logo}
                className="h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}