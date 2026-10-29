import React, { useRef } from 'react';
import { METHODS_CONTENT, STUDIO_CONTENT } from '../data/projects';
import { ArrowDownThinIcon, ArrowRightThinIcon } from './Icons';

interface EditorialPageProps {
  variant: 'studio' | 'methods';
  onOpenContact: () => void;
  onBackToWork: () => void;
}

export function StudioMethodsViews({
  variant,
  onOpenContact,
  onBackToWork,
}: EditorialPageProps) {
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const isStudio = variant === 'studio';
  const title = isStudio ? STUDIO_CONTENT.title : METHODS_CONTENT.title;
  const lead = isStudio ? STUDIO_CONTENT.lead : METHODS_CONTENT.lead;
  const heroImage = isStudio ? STUDIO_CONTENT.heroImage : METHODS_CONTENT.heroImage;

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      key={variant}
      className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#141414] text-white z-[3]"
    >
      {/* Hero Block matching ref-studio.png & ref-methods.png with 28k.studio masked entrance */}
      <section className="pt-[68vw] md:pt-[24.3056vw]">
        <div className="k28-grid items-end">
          <h1 className="m-0 col-span-5 md:col-span-5 text-[max(45px,14.9333vw)] md:text-[max(92px,7.9861vw)] font-medium tracking-[-0.03em] md:tracking-[-0.02em] leading-none">
            <span className="k28-reveal-mask">
              <span className="block k28-reveal-line-in k28-delay-0">
                {title}
              </span>
            </span>
          </h1>

          <p className="m-0 hidden md:block md:col-start-7 md:col-end-11 text-[max(13px,0.9028vw)] font-medium leading-[1.5] text-[#999999] k28-editorial-lead-in">
            {lead}
          </p>

          <div className="col-span-1 md:col-start-12 md:col-end-13 justify-self-end">
            <button
              type="button"
              data-cursor="active"
              aria-label={`Scroll down ${title} page`}
              onClick={scrollToDetails}
              className="k28-vertical-pill k28-cta-enter"
            >
              <ArrowDownThinIcon />
            </button>
          </div>
        </div>

        <p className="md:hidden px-[var(--grid-outer-gutter)] mt-6 text-[14px] font-medium leading-[1.5] text-[#999999] k28-editorial-lead-in">
          {lead}
        </p>

        {/* Full-Width Editorial Hero Frame (1440 / 790 aspect on desktop) */}
        <div className="k28-grid mt-[5.3333vw] md:mt-[1.0417vw]">
          <div className="col-span-full relative aspect-[375/440] md:aspect-[1440/790] overflow-hidden bg-[#1F1F1F]">
            <img
              src={heroImage}
              alt={`28K ${title}`}
              className="w-full h-full object-cover grayscale contrast-110 k28-editorial-hero-img"
            />
          </div>
        </div>
      </section>

      {/* Main Editorial Content */}
      <div ref={detailsRef} className="mt-24 md:mt-[12vw] pb-16">
        {isStudio ? (
          <>
            {/* Studio Metrics */}
            <div className="k28-grid">
              <div className="col-span-full border-t border-white/12 pt-3 flex items-center justify-between mb-12 md:mb-[6vw]">
                <h2 className="m-0 text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em]">
                  In Numbers
                </h2>
                <span className="text-[#FFC32A] text-[max(20px,1.9444vw)] font-medium">
                  01
                </span>
              </div>

              {STUDIO_CONTENT.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="col-span-3 md:col-span-3 border-t border-white/12 pt-5 pb-10"
                >
                  <div className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.03em] text-[#999999]">
                    {stat.label}
                  </div>
                  <div className="mt-8 md:mt-[3.5vw] text-[max(44px,6.5vw)] font-medium tracking-[-0.02em] leading-none">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Studio Capabilities */}
            <div className="k28-grid mt-20 md:mt-[10vw]">
              <div className="col-span-full border-t border-white/12 pt-3 flex items-center justify-between mb-12 md:mb-[6vw]">
                <h2 className="m-0 text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em]">
                  Capabilities
                </h2>
                <span className="text-[#FFC32A] text-[max(20px,1.9444vw)] font-medium">
                  02
                </span>
              </div>

              {STUDIO_CONTENT.capabilities.map((cap) => (
                <div
                  key={cap.category}
                  className="col-span-6 md:col-span-6 border-t border-white/12 pt-6 pb-8 flex flex-col md:flex-row gap-6 md:gap-16"
                >
                  <span className="font-mono text-[12px] uppercase tracking-[0.03em] text-white min-w-[110px]">
                    {cap.category}
                  </span>
                  <ul className="list-none m-0 p-0 flex flex-col gap-2 font-mono text-[12px] uppercase tracking-[0.03em] text-[#999999]">
                    {cap.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Studio Recognitions */}
            <div className="k28-grid mt-20 md:mt-[10vw]">
              <div className="col-span-full border-t border-white/12 pt-3 flex items-center justify-between mb-10">
                <h2 className="m-0 text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em]">
                  Recognition
                </h2>
                <span className="text-[#FFC32A] text-[max(20px,1.9444vw)] font-medium">
                  03
                </span>
              </div>

              <div className="col-span-full">
                {STUDIO_CONTENT.recognitions.map((rec) => (
                  <div
                    key={rec.title}
                    className="grid grid-cols-6 md:grid-cols-12 gap-[var(--grid-gutter)] py-4 border-t border-white/12 font-mono text-[11px] md:text-[12px] uppercase tracking-[0.03em]"
                  >
                    <span className="hidden md:block md:col-span-3 text-[#666666]">
                      {rec.date}
                    </span>
                    <span className="col-span-2 md:col-span-3 text-[#666666]">
                      {rec.platform}
                    </span>
                    <span className="col-span-4 md:col-span-6 text-white">
                      {rec.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Methods Principles */
          <div className="k28-grid">
            <div className="col-span-full border-t border-white/12 pt-3 flex items-center justify-between mb-12 md:mb-[6vw]">
              <h2 className="m-0 text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em]">
                How We Work
              </h2>
              <span className="text-[#FFC32A] text-[max(20px,1.9444vw)] font-medium">
                01 — 04
              </span>
            </div>

            <div className="col-span-full flex flex-col gap-16 md:gap-[7vw]">
              {METHODS_CONTENT.principles.map((p) => (
                <div
                  key={p.number}
                  className="grid grid-cols-6 md:grid-cols-12 gap-[var(--grid-gutter)] border-t border-white/12 pt-6"
                >
                  <div className="col-span-2 md:col-span-3 text-[max(44px,6.5vw)] font-medium tracking-[-0.02em] leading-none">
                    {p.number}
                  </div>
                  <div className="col-span-4 md:col-start-7 md:col-span-5">
                    <div className="text-[max(16px,1.25vw)] font-medium text-[#999999]">
                      {p.title}
                    </div>
                    <div className="text-[max(16px,1.25vw)] font-medium text-[#FDFDF9]">
                      {p.subtitle}
                    </div>
                    <p className="mt-5 mb-0 text-[max(13px,0.92vw)] font-medium leading-[1.55] text-[#999999]">
                      {p.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-28 md:mt-[12vw] pt-6 border-t border-white/12 k28-grid items-end font-mono text-[11px] md:text-[12px] uppercase tracking-[0.03em]">
          <div className="col-span-3 md:col-span-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={onBackToWork}
              className="inline-flex items-center gap-2 text-white hover:text-[#FFC32A] transition-colors w-fit"
            >
              <span>EXPLORE SELECTED WORK</span>
              <ArrowRightThinIcon className="w-3.5 h-3.5" />
            </button>
            <span className="text-[#999999]">CVR / DK43079211</span>
          </div>

          <div className="col-span-3 md:col-start-7 md:col-span-4 text-[#FDFDF9]">
            <span className="block">28K APS — ESROMGADE 15</span>
            <span className="block text-[#999999]">COPENHAGEN &amp; TORONTO</span>
          </div>

          <div className="col-span-6 md:col-span-2 text-right mt-6 md:mt-0">
            <button
              type="button"
              onClick={onOpenContact}
              className="text-[#FFC32A] hover:underline"
            >
              GET IN TOUCH
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
