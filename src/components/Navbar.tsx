import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Logo28K,
  NavCircleIcon,
  CloseThinIcon,
  SmileyIcon,
  ArrowRightThinIcon,
  CheckThinIcon,
} from './Icons';
import { formatTodayDisplay, formatOfficeClock } from '../utils/clockMath';

export type ActiveRoute = 'home' | 'work' | 'studio' | 'methods';

type LogoPhase =
  | 'hidden'
  | 'enter-initial'
  | 'enter-route'
  | 'visible'
  | 'leaving';

type MobileSheetPhase = 'closed' | 'opening' | 'open' | 'closing';

interface NavbarProps {
  activeRoute: ActiveRoute;
  isContactOpen: boolean;
  isTravelling?: boolean;
  skipIntro?: boolean;
  now: Date;
  onNavigate: (route: ActiveRoute) => void;
  onOpenContact: () => void;
}

const NAV_ROUTE_ITEMS: ReadonlyArray<{ id: 'work' | 'studio' | 'methods'; label: string }> = [
  { id: 'work', label: 'Work' },
  { id: 'studio', label: 'Studio' },
  { id: 'methods', label: 'Methods' },
];

export function Navbar({
  activeRoute,
  isContactOpen,
  isTravelling = false,
  skipIntro = false,
  now,
  onNavigate,
  onOpenContact,
}: NavbarProps) {
  // Desktop & Mobile trigger initial entrance choreography (BUiQNiHt.js: 0.6s base + 0.08s stagger)
  const [isIntro, setIsIntro] = useState<boolean>(() => !skipIntro);

  // Top-left 28K vertical mark state machine (BUiQNiHt.js: G() — 1.0s initial / 0.8s route enter / 0.7s inCubic exit)
  const pageCarriesMark = activeRoute !== 'home';
  const [logoPhase, setLogoPhase] = useState<LogoPhase>(() => {
    if (!pageCarriesMark) return 'hidden';
    return skipIntro ? 'visible' : 'enter-initial';
  });
  const prevCarriesMarkRef = useRef<boolean>(pageCarriesMark);

  // Mobile Menu Sheet state machine (BUiQNiHt.js: Ze() — 1.19s inOutExpo upward wipe + bottom-up stagger / 0.25s +10px dissolve)
  const [sheetPhase, setSheetPhase] = useState<MobileSheetPhase>('closed');
  const [emailCopied, setEmailCopied] = useState<boolean>(false);

  const sheetTimerRef = useRef<number | null>(null);
  const logoTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;
  const onOpenContactRef = useRef(onOpenContact);
  onOpenContactRef.current = onOpenContact;

  // Settle initial nav entrance cleanly so subsequent active route clicks use pure CSS --fill iris transitions
  useEffect(() => {
    if (!isIntro) return;
    const timer = window.setTimeout(() => {
      setIsIntro(false);
    }, 2300);
    return () => window.clearTimeout(timer);
  }, [isIntro]);

  // Settle initial logo entrance after 1.0s delay + 1.4s outExpo
  useEffect(() => {
    if (logoPhase !== 'enter-initial') return;
    const timer = window.setTimeout(() => {
      setLogoPhase((prev) => (prev === 'enter-initial' ? 'visible' : prev));
    }, 2450);
    return () => window.clearTimeout(timer);
  }, [logoPhase]);

  // React to Home <-> non-Home route transitions for the top-left 28K logo
  useEffect(() => {
    if (prevCarriesMarkRef.current === pageCarriesMark) return;
    prevCarriesMarkRef.current = pageCarriesMark;

    if (logoTimerRef.current) {
      window.clearTimeout(logoTimerRef.current);
      logoTimerRef.current = null;
    }

    if (pageCarriesMark) {
      setLogoPhase('enter-route');
      logoTimerRef.current = window.setTimeout(() => {
        setLogoPhase('visible');
        logoTimerRef.current = null;
      }, 1780);
    } else {
      setLogoPhase('leaving');
      logoTimerRef.current = window.setTimeout(() => {
        setLogoPhase('hidden');
        logoTimerRef.current = null;
      }, 720);
    }
  }, [pageCarriesMark]);

  const openMobileMenu = useCallback(() => {
    if (sheetTimerRef.current) {
      window.clearTimeout(sheetTimerRef.current);
      sheetTimerRef.current = null;
    }
    setSheetPhase('opening');
    sheetTimerRef.current = window.setTimeout(() => {
      setSheetPhase('open');
      sheetTimerRef.current = null;
    }, 1190);
  }, []);

  const closeMobileMenu = useCallback((afterClose?: () => void) => {
    if (sheetTimerRef.current) {
      window.clearTimeout(sheetTimerRef.current);
      sheetTimerRef.current = null;
    }
    setSheetPhase((prev) => {
      if (prev === 'closed') {
        afterClose?.();
        return 'closed';
      }
      sheetTimerRef.current = window.setTimeout(() => {
        setSheetPhase('closed');
        sheetTimerRef.current = null;
        afterClose?.();
      }, 250);
      return 'closing';
    });
  }, []);

  // Escape key closes mobile sheet smoothly
  useEffect(() => {
    if (sheetPhase === 'closed' || sheetPhase === 'closing') return;
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [sheetPhase, closeMobileMenu]);

  // Auto-close mobile sheet if viewport resizes to desktop (>= 834px)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 834px)');
    const handleResize = (e: MediaQueryListEvent) => {
      if (e.matches) {
        if (sheetTimerRef.current) {
          window.clearTimeout(sheetTimerRef.current);
          sheetTimerRef.current = null;
        }
        setSheetPhase('closed');
      }
    };
    mq.addEventListener('change', handleResize);
    return () => mq.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (sheetTimerRef.current) window.clearTimeout(sheetTimerRef.current);
      if (logoTimerRef.current) window.clearTimeout(logoTimerRef.current);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleMobileRoute = (route: ActiveRoute) => {
    onNavigateRef.current(route);
    closeMobileMenu();
  };

  const handleMobileContact = () => {
    closeMobileMenu(() => {
      onOpenContactRef.current();
    });
  };

  const handleCopyMobileEmail = async () => {
    try {
      await navigator.clipboard?.writeText('hi@28K.studio');
    } catch {
      // Clipboard fallback ignored cleanly in restricted frames
    }
    setEmailCopied(true);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      setEmailCopied(false);
      copyTimerRef.current = null;
    }, 3500);
  };

  const today = formatTodayDisplay(now);
  const cph = formatOfficeClock(now, 'Europe/Copenhagen');
  const tor = formatOfficeClock(now, 'America/Toronto');

  const isSheetMounted = sheetPhase !== 'closed';
  const isLogoInteractive = logoPhase !== 'hidden' && logoPhase !== 'leaving';

  return (
    <>
      <header
        className={`k28-nav-layer ${isIntro ? 'is-intro' : ''} ${
          isTravelling ? 'is-travelling' : ''
        } ${isSheetMounted ? 'is-sheet-open' : ''}`}
        aria-label="Primary"
      >
        <div className="k28-nav-inner">
          {/* Desktop Top-Left Vertical 28K Logo Mark */}
          <button
            type="button"
            data-cursor="active"
            className={`k28-logo-btn k28-logo-phase-${logoPhase}`}
            aria-label="28K Studio — Home"
            tabIndex={isLogoInteractive ? 0 : -1}
            aria-hidden={!isLogoInteractive ? true : undefined}
            onClick={() => onNavigate('home')}
          >
            <Logo28K className="k28-logo-svg" />
          </button>

          {/* Desktop 4-Item Navigation (Work, Studio, Methods, Contact) */}
          <nav className="k28-nav-links" aria-label="Main navigation">
            {NAV_ROUTE_ITEMS.map((item, idx) => {
              const isActive = activeRoute === item.id && !isContactOpen;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-cursor="active"
                  className={`k28-nav-link k28-nav-stagger-${idx} ${
                    isActive ? 'is-active' : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onNavigate(item.id)}
                >
                  <NavCircleIcon />
                  <span className="k28-nav-label-mask">
                    <span className="k28-nav-label-inner">{item.label}</span>
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              data-cursor="active"
              className={`k28-nav-link k28-nav-stagger-3 ${
                isContactOpen ? 'is-active' : ''
              }`}
              aria-expanded={isContactOpen}
              onClick={onOpenContact}
            >
              <NavCircleIcon />
              <span className="k28-nav-label-mask">
                <span className="k28-nav-label-inner">Contact</span>
              </span>
            </button>
          </nav>

          {/* Mobile Menu Trigger (< 834px) */}
          <button
            type="button"
            data-cursor="active"
            className="k28-mobile-menu-trigger k28-nav-stagger-0"
            aria-expanded={isSheetMounted}
            aria-label="Open menu"
            tabIndex={isSheetMounted ? -1 : 0}
            onClick={openMobileMenu}
          >
            <NavCircleIcon />
            <span className="k28-nav-label-mask">
              <span className="k28-nav-label-inner">Menu</span>
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Persistent mix-blend-difference Top-Left Page Logo (z-index: 101, sits cleanly above open mobile sheet) */}
      <button
        type="button"
        data-cursor="active"
        className={`k28-mobile-page-logo k28-logo-phase-${logoPhase} ${
          isTravelling ? 'is-travelling' : ''
        }`}
        aria-label="28K Studio Home"
        tabIndex={isLogoInteractive ? 0 : -1}
        aria-hidden={!isLogoInteractive ? true : undefined}
        onClick={() => handleMobileRoute('home')}
      >
        <Logo28K className="k28-logo-svg" />
      </button>

      {/* Authentic Animated Mobile Navigation Sheet (1.19s inOutExpo upward wipe + bottom-to-top stagger + 0.25s +10px dissolve) */}
      {isSheetMounted && (
        <div
          className={`k28-mobile-sheet k28-mobile-sheet-${sheetPhase}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="k28-mobile-sheet-bg" aria-hidden="true" />

          <div className="k28-mobile-sheet-inner">
            {/* Top Head + Links */}
            <div className="relative z-10">
              <div className="flex items-start justify-between px-[var(--grid-outer-gutter)] pt-[var(--grid-outer-gutter)]">
                <button
                  type="button"
                  className={`w-[6.1333vw] min-w-[24px] text-[#333333] k28-mrow-fade k28-mrow-6 ${
                    pageCarriesMark ? 'invisible pointer-events-none' : ''
                  }`}
                  aria-label="28K Studio Home"
                  tabIndex={pageCarriesMark ? -1 : 0}
                  onClick={() => handleMobileRoute('home')}
                >
                  <Logo28K />
                </button>

                <button
                  type="button"
                  className="k28-mobile-close-btn k28-mrow-fade k28-mrow-6"
                  aria-label="Close menu"
                  onClick={() => closeMobileMenu()}
                >
                  <span className="w-[5.3333vw] h-[5.3333vw] min-w-[17px] min-h-[17px] k28-icon-wipe">
                    <CloseThinIcon className="k28-icon-out" />
                    <CloseThinIcon className="k28-icon-in" />
                  </span>
                </button>
              </div>

              {/* Mobile Links (Bottom-up stagger: Contact=row2, Methods=row3, Studio=row4, Work=row5) */}
              <nav
                className="mt-[10.6667vw] px-[var(--grid-outer-gutter)] flex flex-col gap-[5.3333vw]"
                aria-label="Mobile links"
              >
                {NAV_ROUTE_ITEMS.map((item, idx) => {
                  const active = activeRoute === item.id && !isContactOpen;
                  const bottomUpRow = 5 - idx; // Work=5, Studio=4, Methods=3
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleMobileRoute(item.id)}
                      className={`k28-mobile-nav-link k28-mrow-${bottomUpRow} ${
                        active ? 'is-active' : ''
                      }`}
                    >
                      <NavCircleIcon className="k28-mobile-nav-circle" />
                      <span className="k28-nav-label-mask">
                        <span className="k28-mobile-link-line">{item.label}</span>
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleMobileContact}
                  className={`k28-mobile-nav-link k28-mrow-2 ${
                    isContactOpen ? 'is-active' : ''
                  }`}
                >
                  <NavCircleIcon className="k28-mobile-nav-circle" />
                  <span className="k28-nav-label-mask">
                    <span className="k28-mobile-link-line">Contact</span>
                  </span>
                </button>
              </nav>
            </div>

            {/* Bottom Footer: General Email Rule + Today & Locations (Bottom-up rows 1 and 0) */}
            <div className="relative z-10 mt-[8vw] pb-[var(--grid-outer-gutter)]">
              <div className="px-[var(--grid-outer-gutter)]">
                <div className="k28-mobile-rule k28-mrow-1">
                  <button
                    type="button"
                    onClick={handleCopyMobileEmail}
                    className="w-full flex flex-col py-4 text-left text-[#333333]"
                  >
                    <span className="k28-nav-label-mask font-mono text-[11px] uppercase tracking-[0.02em] text-[#333333]/60">
                      <span className="block k28-mrow-line k28-mrow-1">
                        General
                      </span>
                    </span>
                    <span className="mt-2 w-full flex items-center justify-between text-[18px] font-medium tracking-[-0.01em] text-[#333333]">
                      <span className="k28-nav-label-mask">
                        <span className="block k28-mrow-line k28-mrow-1">
                          {emailCopied ? 'Copied!' : 'hi@28K.studio'}
                        </span>
                      </span>
                      <span className="w-4 h-4 k28-icon-wipe k28-mrow-fade k28-mrow-1">
                        {emailCopied ? (
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
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-[10.6667vw] px-[var(--grid-outer-gutter)] flex items-end justify-between font-mono text-[12px] uppercase tracking-[0.01em] leading-[1.4] text-[#333333]">
                <div className="flex flex-col">
                  <span className="k28-nav-label-mask">
                    <span className="flex items-center gap-1.5 k28-mrow-line k28-mrow-0">
                      {today.weekday} <SmileyIcon />
                    </span>
                  </span>
                  <span className="k28-nav-label-mask">
                    <span className="block k28-mrow-line k28-mrow-0">
                      {today.monthDay}
                    </span>
                  </span>
                  <span className="k28-nav-label-mask">
                    <span className="block k28-mrow-line k28-mrow-0">
                      {today.dayLabel}
                    </span>
                  </span>
                </div>

                <div className="flex items-end gap-[1.3333vw]">
                  <span className="k28-nav-label-mask">
                    <span className="block k28-mrow-line k28-mrow-0">
                      {cph.time}
                    </span>
                  </span>
                  <span className="k28-nav-label-mask text-[#999999]">
                    <span className="block k28-mrow-line k28-mrow-0">
                      {cph.zone}
                    </span>
                  </span>
                  <span className="k28-nav-label-mask text-[#999999] ml-[1.3333vw]">
                    <span className="block k28-mrow-line k28-mrow-0">/</span>
                  </span>
                  <span className="k28-nav-label-mask">
                    <span className="block k28-mrow-line k28-mrow-0">
                      {tor.time}
                    </span>
                  </span>
                  <span className="k28-nav-label-mask text-[#999999]">
                    <span className="block k28-mrow-line k28-mrow-0">
                      {tor.zone}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
