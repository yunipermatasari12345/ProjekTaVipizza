import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Hero banner ala TA kating — gambar gelap + breadcrumb + judul
export default function PageHero({ title, breadcrumbs = [], image }) {
  const bgImage = image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1600';

  return (
    <section
      className="relative bg-cover bg-center"
      style={{ backgroundImage: `linear-gradient(rgba(11, 83, 69, 0.82), rgba(11, 83, 69, 0.82)), url(${bgImage})` }}
    >
      <div className="max-w-6xl mx-auto px-6 py-14 text-center text-white">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center justify-center gap-1 text-sm text-white/80 mb-3">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
      </div>
    </section>
  );
}
