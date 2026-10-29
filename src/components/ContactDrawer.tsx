import React, { useEffect, useRef, useState } from 'react';
import { CONTACT_CONTENT } from '../data/projects';
import { formatOfficeClock } from '../utils/clockMath';
import { ArrowRightThinIcon, CheckThinIcon } from './Icons';
import { SidePanel } from './SidePanel';

interface ContactDrawerProps {
  isOpen: boolean;
  now: Date;
  onClose: () => void;
}

export function ContactDrawer({ isOpen, now, onClose }: ContactDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const cph = formatOfficeClock(now, 'Europe/Copenhagen');
  const tor = formatOfficeClock(now, 'America/Toronto');

  const handleCopyEmail = async (id: string, email: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      }
    } catch {
      // Clipboard fallback ignored cleanly in restricted iframe contexts
    }
    setCopiedId(id);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <SidePanel
      visible={isOpen}
      label="Contact 28K Studio"
      onClose={onClose}
    >
      {/* Header: Contact + Intro Copy */}
      <div className="k28-panel-rule k28-prow-0 pt-2 md:pt-3">
        <div className="k28-contact-grid-8">
          <h2 className="m-0 col-span-6 md:col-span-4 text-[max(22px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#1F1F1F]">
            <span className="k28-reveal-mask">
              <span className="block k28-panel-line k28-prow-0">
                {CONTACT_CONTENT.title}
              </span>
            </span>
          </h2>
          <p className="m-0 mt-8 md:mt-0 col-span-6 md:col-span-4 text-[max(22px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#1F1F1F] pr-0 md:pr-10 k28-panel-fade k28-prow-1">
            {CONTACT_CONTENT.copy}
          </p>
        </div>
      </div>

      {/* 3 Interactive Copy-to-Clipboard Email Rows */}
      <div className="mt-16 md:mt-[12vw]">
        {CONTACT_CONTENT.inboxes.map((inbox, idx) => {
          const isCopied = copiedId === inbox.id;
          return (
            <div
              key={inbox.id}
              className={`k28-contact-inbox-row k28-panel-fade k28-prow-${
                2 + idx
              } ${isCopied ? 'is-copied' : ''}`}
            >
              <button
                type="button"
                data-cursor="active"
                onClick={() => handleCopyEmail(inbox.id, inbox.email)}
                aria-label={`Copy ${inbox.label.toLowerCase()} email ${inbox.email}`}
                className="w-full text-left py-6 md:py-[1.9vw] k28-contact-grid-8 items-start group"
              >
                <span className="hidden md:block md:col-span-4 text-[max(14px,1.25vw)] font-medium tracking-[-0.01em] leading-[1.25] text-[#999999] group-hover:text-[#333333]/70 transition-colors">
                  {inbox.title}
                </span>

                <div className="col-span-6 md:col-span-4 flex flex-col">
                  <span className="font-mono text-[11px] md:text-[12px] font-medium uppercase tracking-[0.03em] text-[#333333]/60">
                    {inbox.label}
                  </span>
                  <div className="mt-3.5 md:mt-[1.35vw] flex items-center justify-between text-[max(15px,1.25vw)] font-medium tracking-[-0.01em] leading-[1.25] text-[#1F1F1F]">
                    <span>{isCopied ? 'Copied!' : inbox.email}</span>
                    <span className="w-4 h-4 text-[#1F1F1F] k28-icon-wipe">
                      {isCopied ? (
                        <>
                          <CheckThinIcon className="k28-icon-out" />
                          <CheckThinIcon className="k28-icon-in" />
                        </>
                      ) : (
                        <>
                          <ArrowRightThinIcon className="k28-icon-out" />
                          <ArrowRightThinIcon className="k28-icon-in" />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Section A: Offices & Live Timezone Clocks */}
      <div className="mt-20 md:mt-[10.4vw] pt-3 k28-panel-rule k28-prow-5">
        <div className="k28-contact-grid-8">
          <h3 className="m-0 col-span-3 md:col-span-4 text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#1F1F1F]">
            <span className="k28-reveal-mask">
              <span className="block k28-panel-line k28-prow-5">Offices</span>
            </span>
          </h3>
          <span className="col-span-3 md:col-span-4 text-right md:text-left text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#999999]">
            <span className="k28-reveal-mask">
              <span className="block k28-panel-line k28-prow-5">A</span>
            </span>
          </span>
        </div>

        <div className="mt-12 md:mt-[6.5vw] grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[1.3889vw] k28-panel-fade k28-prow-6">
          {/* Copenhagen */}
          <div>
            <div className="text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#1F1F1F]">
              Copenhagen
            </div>
            <div className="text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#999999] flex items-center gap-4 md:gap-[3.2vw]">
              <span>Denmark</span>
              <span>/</span>
              <span>Europe</span>
            </div>
            <div className="mt-8 md:mt-[6.2vw] flex items-end justify-between">
              <span className="text-[max(56px,7.9861vw)] font-medium tracking-[-0.02em] leading-none text-[#1F1F1F] tabular-nums">
                {cph.time}
              </span>
              <span className="font-mono text-[11px] md:text-[12px] font-medium uppercase tracking-[0.03em] text-[#999999] mb-2 md:mb-[0.8vw]">
                {cph.zone}
              </span>
            </div>
          </div>

          {/* Toronto */}
          <div>
            <div className="text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#1F1F1F]">
              Toronto
            </div>
            <div className="text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#999999] flex items-center gap-4 md:gap-[3.2vw]">
              <span>Canada</span>
              <span>/</span>
              <span>North America</span>
            </div>
            <div className="mt-8 md:mt-[6.2vw] flex items-end justify-between">
              <span className="text-[max(56px,7.9861vw)] font-medium tracking-[-0.02em] leading-none text-[#1F1F1F] tabular-nums">
                {tor.time}
              </span>
              <span className="font-mono text-[11px] md:text-[12px] font-medium uppercase tracking-[0.03em] text-[#999999] mb-2 md:mb-[0.8vw]">
                {tor.zone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section B: Follow Social Links */}
      <div className="mt-16 md:mt-[5.5vw] pt-3 k28-panel-rule k28-prow-7 pb-6">
        <div className="k28-contact-grid-8">
          <h3 className="m-0 col-span-3 md:col-span-4 text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#1F1F1F]">
            <span className="k28-reveal-mask">
              <span className="block k28-panel-line k28-prow-7">Follow</span>
            </span>
          </h3>
          <span className="col-span-3 md:col-span-4 text-right md:text-left text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#999999]">
            <span className="k28-reveal-mask">
              <span className="block k28-panel-line k28-prow-7">B</span>
            </span>
          </span>
        </div>

        <ul className="list-none m-0 p-0 mt-10 md:mt-[2.6vw] k28-contact-grid-8 k28-panel-fade k28-prow-8">
          {CONTACT_CONTENT.socials.map((social) => (
            <li
              key={social.label}
              className="col-span-6 md:col-start-5 md:col-span-4"
            >
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="active"
                className="flex items-center justify-between py-2 md:py-[0.45vw] text-[max(14px,1.25vw)] font-medium tracking-[-0.01em] leading-[1.25] text-[#1F1F1F] group"
              >
                <span className="relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1px] after:bg-current after:origin-left after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform">
                  {social.label}
                </span>
                <span className="w-4 h-4 k28-icon-wipe">
                  <ArrowRightThinIcon className="k28-icon-out" />
                  <ArrowRightThinIcon className="k28-icon-in" />
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Danish HQ Address */}
        <div className="mt-12 md:mt-[4.5vw] k28-contact-grid-8 k28-panel-fade k28-prow-9">
          <address className="not-italic col-span-6 md:col-start-5 md:col-span-4 font-mono text-[11px] md:text-[12px] font-medium uppercase tracking-[0.03em] leading-[1.35] text-[#1F1F1F]">
            {CONTACT_CONTENT.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>
      </div>
    </SidePanel>
  );
}
