import React, { useEffect, useRef } from 'react';
import heroMonolithImg from '../assets/images/home_hero_monolith_1793266024895.jpg';
import { ArrowDownThinIcon } from './Icons';

interface HomeHeroProps {
  isLeaving: boolean;
  onEnterWork: () => void;
}

const HERO_SERVICES = [
  'SPRINTS',
  'STRATEGY',
  'BRANDING',
  'DIGITAL EXPERIENCES',
  'PRODUCT DESIGN',
];

export function HomeHero({ isLeaving, onEnterWork }: HomeHeroProps) {
  const triggeredRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    triggeredRef.current = isLeaving;
  }, [isLeaving]);

  useEffect(() => {
    const triggerOnce = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      onEnterWork();
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) >= Math.abs(e.deltaX) && e.deltaY > 20) {
        triggerOnce();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null) return;
      const currentY = e.touches[0]?.clientY ?? touchStartYRef.current;
      if (touchStartYRef.current - currentY > 24) {
        touchStartYRef.current = null;
        triggerOnce();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'Enter') {
        e.preventDefault();
        triggerOnce();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEnterWork]);

  const lineClass = isLeaving ? 'k28-reveal-line-out' : 'k28-reveal-line-in';

  return (
    <section
      className={`k28-home-hero ${isLeaving ? 'is-leaving' : 'is-entering'}`}
      aria-label="28K Design Studio Home"
      data-scrollable-cursor="true"
    >
      {/* Atmospheric Black Basalt Background Media (scale 1.26 -> 1 outExpo) */}
      <div className="k28-home-media-wrap" aria-hidden="true">
        <img
          src={heroMonolithImg}
          alt=""
          className="k28-home-media-img"
        />
      </div>

      {/* 12-Column Home Grid Overlay */}
      <div className="k28-grid k28-home-grid">
        {/* Left Column: Giant 4-Piece Clipped 28K ☺ Mark + Locations */}
        <div className="k28-home-col-logo">
          <div className="k28-home-logo-box">
            <svg
              viewBox="0 0 217 698"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="k28-home-logo-svg"
              aria-label="28K Studio"
            >
              <defs>
                <clipPath id="home-logo-clip-two">
                  <rect x="0" y="0" width="194" height="246" />
                </clipPath>
                <clipPath id="home-logo-clip-eight">
                  <rect x="0" y="246" width="217" height="261" />
                </clipPath>
                <clipPath id="home-logo-clip-k">
                  <rect x="0" y="507" width="217" height="191" />
                </clipPath>
                <clipPath id="home-logo-clip-smiley">
                  <rect x="194" y="0" width="23" height="30" />
                </clipPath>
              </defs>

              <g clipPath="url(#home-logo-clip-two)">
                <path
                  className={`k28-hero-piece k28-hero-piece-0 ${
                    isLeaving ? 'is-leaving' : 'is-entering'
                  }`}
                  d="M113.273 0C155.456 6.20501e-05 189.876 25.3678 189.876 70.0078C189.876 115.325 153.091 138.322 119.347 159.288C96.7349 172.814 75.1362 185.671 68.3691 206.344V207.021H187.182V238.474H21.4746C21.4747 194.548 48.132 164.403 92.707 136.336C132.186 112.332 151.757 102.522 151.757 71.4072C151.757 52.1256 144.341 31.4992 112.278 31.499C75.831 31.499 64.6895 55.1737 64.6895 87.3223L27.5479 87.249C27.5479 37.5391 54.2143 0 113.273 0Z"
                  fill="currentColor"
                />
              </g>

              <g clipPath="url(#home-logo-clip-eight)">
                <path
                  className={`k28-hero-piece k28-hero-piece-1 ${
                    isLeaving ? 'is-leaving' : 'is-entering'
                  }`}
                  d="M105.675 254.297C157.3 254.297 191.378 279.784 191.378 317.605C191.378 341.39 177.204 359.814 153.248 370.2C181.256 380.923 197.786 401.686 197.786 428.156C197.786 469.027 161.352 496.161 105.675 496.161C50.3454 496.161 13.5626 469.027 13.5625 428.156C13.5625 401.358 30.0655 380.923 58.1016 370.2C34.1453 359.814 19.9805 341.39 19.9805 317.605C19.9805 279.757 54.3884 254.297 105.675 254.297ZM105.675 384.272C74.6317 384.272 53.719 401.021 53.7188 425.816C53.7188 450.266 74.6408 467.015 105.675 467.015C137.057 467.015 157.933 450.266 157.933 425.816C157.932 401.021 137.02 384.273 105.675 384.272ZM105.675 282.77C78.0147 282.77 59.1193 297.844 59.1191 320.281C59.1191 343.065 78.0146 358.139 105.675 358.139C133.683 358.139 152.239 343.065 152.239 320.281C152.239 297.844 133.683 282.77 105.675 282.77Z"
                  fill="currentColor"
                />
              </g>

              <g clipPath="url(#home-logo-clip-k)">
                <path
                  className={`k28-hero-piece k28-hero-piece-2 ${
                    isLeaving ? 'is-leaving' : 'is-entering'
                  }`}
                  d="M217 550.854H111.534L217 649.147V690.393L126.554 605.831L0 697.34V654.378L101.943 583.011L67.6523 550.854H0V517.637H217V550.854Z"
                  fill="currentColor"
                />
              </g>

              <g clipPath="url(#home-logo-clip-smiley)">
                <g
                  className={`k28-hero-piece k28-hero-piece-3 ${
                    isLeaving ? 'is-leaving' : 'is-entering'
                  }`}
                >
                  <path
                    d="M205.821 2C199.773 2 195 6.68131 195 13C195 19.3187 199.773 24 205.821 24C211.87 24 216.686 19.3187 216.686 13C216.686 6.68131 211.909 2 205.821 2ZM205.821 22.1362C200.866 22.1362 197.138 18.3171 197.138 13C197.138 7.6829 200.866 3.86382 205.821 3.86382C210.777 3.86382 214.548 7.6829 214.548 13C214.548 18.3171 210.821 22.1362 205.821 22.1362Z"
                    fill="currentColor"
                  />
                  <path
                    d="M205.829 16.9936C203.739 16.9936 202.219 15.3736 202.219 13.1396H200.042C200.042 16.5799 202.529 19.1709 205.829 19.1709C209.13 19.1709 211.639 16.5799 211.639 13.1396H209.461C209.461 15.4085 207.968 16.9936 205.829 16.9936Z"
                    fill="currentColor"
                  />
                  <path
                    d="M202.068 11.6157C202.91 11.6157 203.592 10.9333 203.592 10.0915C203.592 9.24977 202.91 8.56738 202.068 8.56738C201.226 8.56738 200.544 9.24977 200.544 10.0915C200.544 10.9333 201.226 11.6157 202.068 11.6157Z"
                    fill="currentColor"
                  />
                  <path
                    d="M209.471 11.6157C210.313 11.6157 210.996 10.9333 210.996 10.0915C210.996 9.24977 210.313 8.56738 209.471 8.56738C208.63 8.56738 207.947 9.24977 207.947 10.0915C207.947 10.9333 208.63 11.6157 209.471 11.6157Z"
                    fill="currentColor"
                  />
                </g>
              </g>
            </svg>
          </div>

          <div className="k28-home-locations">
            <span className="k28-reveal-mask text-[#999999]">
              <span className={`block ${lineClass} k28-delay-1`}>LOCATIONS</span>
            </span>
            <span className="k28-reveal-mask text-white">
              <span className={`block ${lineClass} k28-delay-2`}>TO &amp; CPH</span>
            </span>
          </div>
        </div>

        {/* Column 6: Services Label */}
        <div className="k28-home-col-services-label">
          <span className="k28-reveal-mask text-[#999999]">
            <span className={`block ${lineClass} k28-delay-2`}>SERVICES</span>
          </span>
        </div>

        {/* Columns 7-11: Studio Positioning Copy + Services List */}
        <div className="k28-home-col-copy">
          <div className="k28-home-headline">
            <h1 className="m-0 font-medium text-[length:inherit] leading-[inherit] tracking-[inherit] text-[#999999]">
              <span className="k28-reveal-mask">
                <span className={`block ${lineClass} k28-delay-0`}>
                  A Design Studio
                </span>
              </span>
            </h1>
            <h2 className="m-0 font-medium text-[length:inherit] leading-[inherit] tracking-[inherit] text-white">
              <span className="k28-reveal-mask">
                <span className={`block ${lineClass} k28-delay-1`}>
                  Devoted to making the most
                </span>
              </span>
              <span className="k28-reveal-mask">
                <span className={`block ${lineClass} k28-delay-2`}>
                  memorable experiences within
                </span>
              </span>
              <span className="k28-reveal-mask">
                <span className={`block ${lineClass} k28-delay-3`}>
                  our time.
                </span>
              </span>
            </h2>
          </div>

          <ul className="k28-home-services-list m-0 p-0 list-none">
            {HERO_SERVICES.map((srv, idx) => (
              <li key={srv} className="k28-reveal-mask">
                <span
                  className={`block ${lineClass} k28-delay-${Math.min(3, idx)}`}
                >
                  {srv}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 12 Bottom-Right: Vertical Yellow Scroll-to-Work Pill */}
        <div className="k28-home-col-cta">
          <button
            type="button"
            className={`k28-vertical-pill ${
              isLeaving ? 'k28-cta-leave' : 'k28-cta-enter'
            }`}
            aria-label="Scroll down to featured work"
            data-cursor="active"
            onClick={onEnterWork}
          >
            <ArrowDownThinIcon className="w-3.5 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
