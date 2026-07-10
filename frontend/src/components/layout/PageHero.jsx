import React from 'react';

// Brand colors sesuai Beranda
const brandDark    = '#2C1810';
const brandPrimary = '#8B3A0F';
const brandLight   = '#FAF6F1';
const brandMuted   = '#E8DDD5';

export default function PageHero({ title, subtitle }) {
  return (
    <section
      className="relative overflow-hidden border-b"
      style={{ backgroundColor: brandLight, borderColor: brandMuted }}
    >
      {/* Ornamen sudut — senada beranda */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-bl-full opacity-30"
        style={{ backgroundColor: '#F4A261' }}
      />
      <div
        className="absolute bottom-0 left-0 w-28 h-28 rounded-tr-full opacity-10"
        style={{ backgroundColor: brandPrimary }}
      />

      {/* Konten — rata tengah */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-14 text-center">

        {/* Judul */}
        <h1
          className="text-3xl md:text-4xl font-black tracking-tight leading-tight"
          style={{ color: brandDark }}
        >
          {title}
        </h1>

        {/* Garis aksen */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="h-0.5 w-10 rounded-full" style={{ backgroundColor: brandPrimary }} />
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: brandPrimary }} />
          <div className="h-0.5 w-10 rounded-full" style={{ backgroundColor: brandPrimary }} />
        </div>

        {/* Subtitle opsional */}
        {subtitle && (
          <p className="mt-4 text-sm md:text-base leading-relaxed max-w-xl mx-auto" style={{ color: `${brandDark}90` }}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
