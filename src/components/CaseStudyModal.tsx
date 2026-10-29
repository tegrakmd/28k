import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CONTACT_CONTENT, ProjectData } from '../data/projects';
import { FlightRect, interpolateFlightFrame } from '../utils/clockMath';
import {
  ArrowRightThinIcon,
  CheckThinIcon,
  CloseThinIcon,
  InfoLinesIcon,
} from './Icons';
import { SidePanel } from './SidePanel';

export interface ProjectOpenSession {
  project: ProjectData;
  originRect: FlightRect | null;
  originSource: 'latest' | 'index';
  originCardId?: string;
  initialImage?: string;
}

interface CaseStudyModalProps {
  session: ProjectOpenSession | null;
  externalCloseSignal?: number;
  onClosingChange?: (isClosing: boolean) => void;
  onCloseComplete: () => void;
  onOpenContact: () => void;
}

type ModalStagePhase = 'opening' | 'active' | 'closing';

const OPEN_FLIGHT_MS = 880;
const CLOSE_FLIGHT_MS = 820;

export function CaseStudyModal({
  session,
  externalCloseSignal = 0,
  onClosingChange,
  onCloseComplete,
  onOpenContact,
}: CaseStudyModalProps) {
  const project = session?.project ?? null;

  const [settledSession, setSettledSession] =
    useState<ProjectOpenSession | null>(null);
  const [isClosingFlight, setIsClosingFlight] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [slideState, setSlideState] = useState<{
    current: number;
    leaving: number | null;
    seq: number;
  }>({ current: 0, leaving: null, seq: 0 });
  const [infoOpen, setInfoOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const flightSvgRef = useRef<SVGSVGElement | null>(null);
  const flightBackdropRef = useRef<SVGRectElement | null>(null);
  const flightClipRectRef = useRef<SVGRectElement | null>(null);
  const flightImgRef = useRef<SVGImageElement | null>(null);
  const flightSecondaryImgRef = useRef<SVGImageElement | null>(null);
  const closeDestRectRef = useRef<FlightRect | null>(null);
  const wheelLockRef = useRef<number>(0);
  const copyTimerRef = useRef<number | null>(null);

  const onClosingChangeRef = useRef(onClosingChange);
  onClosingChangeRef.current = onClosingChange;
  const onCloseCompleteRef = useRef(onCloseComplete);
  onCloseCompleteRef.current = onCloseComplete;

  // Derive synchronous stagePhase so frame 0 of a new session NEVER flashes full-screen before rAF starts
  const stagePhase: ModalStagePhase = isClosingFlight
    ? 'closing'
    : session && session !== settledSession && session.originRect
    ? 'opening'
    : 'active';

  // Reset per-session state and run opening flight (originRect -> full viewport)
  useEffect(() => {
    if (!session) {
      setSettledSession(null);
      setIsClosingFlight(false);
      setControlsVisible(false);
      setInfoOpen(false);
      return;
    }

    const initialIdx = session.initialImage
      ? Math.max(
          0,
          session.project.slides.findIndex(
            (s) => s.image === session.initialImage
          )
        )
      : 0;

    setSlideState({ current: initialIdx, leaving: null, seq: 0 });
    setInfoOpen(false);
    setIsClosingFlight(false);
    onClosingChangeRef.current?.(false);

    if (!session.originRect) {
      setSettledSession(session);
      setControlsVisible(true);
      return;
    }

    setControlsVisible(false);
    let rafId = 0;
    const startTs = performance.now();
    const fromRect = session.originRect;

    const controlsTimer = window.setTimeout(() => {
      setControlsVisible(true);
    }, Math.round(OPEN_FLIGHT_MS * 0.65));

    const tickOpen = (ts: number) => {
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = window.innerHeight;
      const rawT = Math.min(1, (ts - startTs) / OPEN_FLIGHT_MS);
      const frame = interpolateFlightFrame(
        fromRect,
        { x: 0, y: 0, width: vw, height: vh, rx: 0 },
        rawT,
        0.045
      );

      flightSvgRef.current?.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
      flightBackdropRef.current?.setAttribute('width', String(vw));
      flightBackdropRef.current?.setAttribute('height', String(vh));
      flightBackdropRef.current?.setAttribute(
        'opacity',
        Math.min(1, frame.eased * 1.15).toFixed(3)
      );

      flightClipRectRef.current?.setAttribute('x', frame.clipX.toFixed(2));
      flightClipRectRef.current?.setAttribute('y', frame.clipY.toFixed(2));
      flightClipRectRef.current?.setAttribute(
        'width',
        frame.clipWidth.toFixed(2)
      );
      flightClipRectRef.current?.setAttribute(
        'height',
        frame.clipHeight.toFixed(2)
      );
      flightClipRectRef.current?.setAttribute('rx', frame.clipRx.toFixed(2));

      flightImgRef.current?.setAttribute('x', frame.imgX.toFixed(2));
      flightImgRef.current?.setAttribute('y', frame.imgY.toFixed(2));
      flightImgRef.current?.setAttribute('width', frame.imgWidth.toFixed(2));
      flightImgRef.current?.setAttribute('height', frame.imgHeight.toFixed(2));

      if (rawT < 1) {
        rafId = window.requestAnimationFrame(tickOpen);
      } else {
        setSettledSession(session);
      }
    };

    rafId = window.requestAnimationFrame(tickOpen);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(controlsTimer);
    };
  }, [session]);

  // Run reverse close flight once closing SVG stage is mounted in DOM
  useEffect(() => {
    if (!isClosingFlight || !session) return;
    const targetRect = closeDestRectRef.current;
    if (!targetRect) {
      onCloseCompleteRef.current();
      return;
    }

    let rafId = 0;
    const startTs = performance.now();

    const tickClose = (ts: number) => {
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = window.innerHeight;
      const rawT = Math.min(1, (ts - startTs) / CLOSE_FLIGHT_MS);
      const frame = interpolateFlightFrame(
        { x: 0, y: 0, width: vw, height: vh, rx: 0 },
        targetRect,
        rawT,
        0.035
      );

      flightSvgRef.current?.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
      flightBackdropRef.current?.setAttribute('width', String(vw));
      flightBackdropRef.current?.setAttribute('height', String(vh));
      flightBackdropRef.current?.setAttribute(
        'opacity',
        Math.max(0, 1 - frame.eased * 1.15).toFixed(3)
      );

      flightClipRectRef.current?.setAttribute('x', frame.clipX.toFixed(2));
      flightClipRectRef.current?.setAttribute('y', frame.clipY.toFixed(2));
      flightClipRectRef.current?.setAttribute(
        'width',
        frame.clipWidth.toFixed(2)
      );
      flightClipRectRef.current?.setAttribute(
        'height',
        frame.clipHeight.toFixed(2)
      );
      flightClipRectRef.current?.setAttribute('rx', frame.clipRx.toFixed(2));

      flightImgRef.current?.setAttribute('x', frame.imgX.toFixed(2));
      flightImgRef.current?.setAttribute('y', frame.imgY.toFixed(2));
      flightImgRef.current?.setAttribute('width', frame.imgWidth.toFixed(2));
      flightImgRef.current?.setAttribute('height', frame.imgHeight.toFixed(2));

      if (flightSecondaryImgRef.current) {
        flightSecondaryImgRef.current.setAttribute('x', frame.imgX.toFixed(2));
        flightSecondaryImgRef.current.setAttribute('y', frame.imgY.toFixed(2));
        flightSecondaryImgRef.current.setAttribute(
          'width',
          frame.imgWidth.toFixed(2)
        );
        flightSecondaryImgRef.current.setAttribute(
          'height',
          frame.imgHeight.toFixed(2)
        );
        flightSecondaryImgRef.current.setAttribute(
          'opacity',
          Math.max(0, 1 - frame.eased * 1.25).toFixed(3)
        );
      }

      if (rawT < 1) {
        rafId = window.requestAnimationFrame(tickClose);
      } else {
        setIsClosingFlight(false);
        onCloseCompleteRef.current();
      }
    };

    rafId = window.requestAnimationFrame(tickClose);
    return () => window.cancelAnimationFrame(rafId);
  }, [isClosingFlight, session]);

  // Clear outgoing slide layer after scale(1 -> 1.08) crossfade finishes
  useEffect(() => {
    if (slideState.leaving === null) return;
    const timer = window.setTimeout(() => {
      setSlideState((prev) => ({ ...prev, leaving: null }));
    }, 520);
    return () => window.clearTimeout(timer);
  }, [slideState.leaving, slideState.seq]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Trigger reverse hero media flight (full viewport -> live centered clock frame or Index card)
  const requestCloseProject = useCallback(() => {
    if (!session || isClosingFlight) return;

    setInfoOpen(false);
    setControlsVisible(false);
    onClosingChangeRef.current?.(true);

    let destRect: FlightRect | null = session.originRect;
    if (session.originSource === 'latest') {
      const liveMedia = document.querySelector(
        '[data-testid="latest-centered-media"]'
      );
      if (liveMedia) {
        const b = liveMedia.getBoundingClientRect();
        if (b.width > 0 && b.height > 0) {
          destRect = {
            x: b.left,
            y: b.top,
            width: b.width,
            height: b.height,
            rx: 0,
          };
        }
      }
    } else if (session.originCardId) {
      const liveCard = document.querySelector(
        `[data-card-id="${session.originCardId}"] .k28-asset-media`
      );
      if (liveCard) {
        const b = liveCard.getBoundingClientRect();
        if (b.width > 0 && b.height > 0) {
          destRect = {
            x: b.left,
            y: b.top,
            width: b.width,
            height: b.height,
            rx: 0,
          };
        }
      }
    }

    if (!destRect) {
      onCloseComplete();
      return;
    }

    closeDestRectRef.current = destRect;
    setIsClosingFlight(true);
  }, [session, isClosingFlight]);

  const requestCloseRef = useRef(requestCloseProject);
  requestCloseRef.current = requestCloseProject;
  const prevCloseSignalRef = useRef(externalCloseSignal);

  useEffect(() => {
    if (externalCloseSignal !== prevCloseSignalRef.current) {
      prevCloseSignalRef.current = externalCloseSignal;
      requestCloseRef.current();
    }
  }, [externalCloseSignal]);

  const goToSlide = useCallback(
    (nextIdx: number) => {
      if (!project || stagePhase !== 'active') return;
      const total = project.slides.length;
      if (nextIdx >= total) {
        requestCloseProject();
        return;
      }
      if (nextIdx < 0) return;
      setSlideState((prev) => {
        if (prev.current === nextIdx) return prev;
        return {
          current: nextIdx,
          leaving: prev.current,
          seq: prev.seq + 1,
        };
      });
    },
    [project, stagePhase, requestCloseProject]
  );

  // Keyboard navigation inside CaseStudyModal (Arrows/Space step slides; Escape closes info first, then project)
  useEffect(() => {
    if (!session) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (infoOpen) return; // SidePanel handles Escape when open
      if (stagePhase !== 'active') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        requestCloseProject();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        if (e.target instanceof HTMLButtonElement && e.key === ' ') return;
        e.preventDefault();
        goToSlide(slideState.current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToSlide(slideState.current - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, infoOpen, stagePhase, slideState.current, goToSlide, requestCloseProject]);

  if (!project || !session) return null;

  const slides = project.slides;
  const currentSlide = slides[slideState.current] ?? slides[0];
  const leavingSlide =
    slideState.leaving !== null ? slides[slideState.leaving] : null;
  const isLastSlide = slideState.current >= slides.length - 1;

  const destinationImageHref =
    session.originSource === 'latest'
      ? project.heroImage
      : session.initialImage ?? project.heroImage;
  const activeSlideImageHref = currentSlide.image ?? project.heroImage;
  const flightImageHref =
    stagePhase === 'closing'
      ? destinationImageHref
      : session.initialImage ?? activeSlideImageHref;
  const showClosingCrossfade =
    stagePhase === 'closing' && activeSlideImageHref !== destinationImageHref;

  const handleCopyEmail = async (id: string, email: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      }
    } catch {
      // Ignore restricted clipboard contexts
    }
    setCopiedId(id);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopiedId(null), 2000);
  };

  const renderSlideVisual = (
    slide: ProjectData['slides'][number],
    animClass: string,
    keyStr: string
  ) => {
    if (slide.layout === 'split' && slide.secondaryImage) {
      return (
        <div
          key={keyStr}
          className={`absolute inset-0 w-full h-full grid grid-cols-1 md:grid-cols-2 ${animClass}`}
        >
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={slide.image}
              alt={`${project.title} showcase left`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={slide.secondaryImage}
              alt={`${project.title} showcase right`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      );
    }

    if (slide.layout === 'inset') {
      return (
        <div
          key={keyStr}
          className={`absolute inset-0 w-full h-full flex items-center justify-center p-[8vw] bg-[#161616] ${animClass}`}
        >
          <img
            src={slide.image}
            alt={`${project.title} showcase`}
            className="max-w-[78vw] max-h-[76vh] object-contain rounded-md shadow-2xl"
          />
        </div>
      );
    }

    if (slide.layout === 'typographic') {
      return (
        <div
          key={keyStr}
          className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 bg-[#181818] text-white overflow-hidden ${animClass}`}
        >
          <img
            src={slide.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-25 scale-105 blur-[2px]"
          />
          <div className="relative z-10 text-center max-w-4xl">
            <span className="font-mono text-[12px] uppercase tracking-[0.08em] opacity-75">
              {project.discipline} — {project.year}
            </span>
            <h2 className="mt-4 text-[clamp(36px,6vw,92px)] font-medium tracking-[-0.03em] leading-[0.95]">
              {slide.badgeText ?? `${project.title} — ${project.subtitle}`}
            </h2>
          </div>
        </div>
      );
    }

    return (
      <div
        key={keyStr}
        className={`absolute inset-0 w-full h-full overflow-hidden ${animClass}`}
      >
        <img
          src={slide.image}
          alt={`${project.title} — ${project.subtitle}`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  const initVw =
    typeof document !== 'undefined'
      ? document.documentElement.clientWidth || window.innerWidth
      : 1440;
  const initVh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const initFlightRect: FlightRect =
    stagePhase === 'opening' && session.originRect
      ? session.originRect
      : { x: 0, y: 0, width: initVw, height: initVh, rx: 0 };

  return (
    <>
      {/* Hero Media Open/Close SVG Flight Stage (0 inline styles, sub-pixel inOutExpo interpolation) */}
      {(stagePhase === 'opening' || stagePhase === 'closing') && (
        <svg
          ref={flightSvgRef}
          viewBox={`0 0 ${initVw} ${initVh}`}
          className="fixed inset-0 w-full h-full z-[98] pointer-events-none"
          data-project={project.slug}
          aria-hidden="true"
        >
          <defs>
            <clipPath id="k28-project-flight-clip">
              <rect
                ref={flightClipRectRef}
                x={initFlightRect.x}
                y={initFlightRect.y}
                width={initFlightRect.width}
                height={initFlightRect.height}
                rx={initFlightRect.rx ?? 0}
              />
            </clipPath>
          </defs>
          <rect
            ref={flightBackdropRef}
            x="0"
            y="0"
            width={initVw}
            height={initVh}
            className="fill-[var(--project-bg,#141414)]"
            opacity={stagePhase === 'closing' ? '1' : '0'}
          />
          <g clipPath="url(#k28-project-flight-clip)">
            <image
              ref={flightImgRef}
              href={flightImageHref}
              x={initFlightRect.x}
              y={initFlightRect.y}
              width={initFlightRect.width}
              height={initFlightRect.height}
              preserveAspectRatio="xMidYMid slice"
            />
            {showClosingCrossfade && (
              <image
                ref={flightSecondaryImgRef}
                href={activeSlideImageHref}
                x={initFlightRect.x}
                y={initFlightRect.y}
                width={initFlightRect.width}
                height={initFlightRect.height}
                preserveAspectRatio="xMidYMid slice"
                opacity="1"
              />
            )}
          </g>
        </svg>
      )}

      {/* Interactive Full-Bleed Project Detail Slider */}
      <div
        className={`fixed inset-0 z-[95] overflow-hidden ${
          stagePhase === 'active'
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
        data-project={project.slug}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} — ${project.subtitle} Case Study`}
      >
        <div
          className="w-full h-full relative bg-[var(--project-bg,#EEEEEE)] overflow-hidden"
          onWheel={(e) => {
            if (infoOpen || stagePhase !== 'active') return;
            if (Math.abs(e.deltaY) < 28) return;
            const nowMs = Date.now();
            if (nowMs - wheelLockRef.current < 560) return;
            wheelLockRef.current = nowMs;
            if (e.deltaY > 0) goToSlide(slideState.current + 1);
            else goToSlide(slideState.current - 1);
          }}
        >
          {leavingSlide &&
            renderSlideVisual(
              leavingSlide,
              'k28-case-slide-leave',
              `leave-${leavingSlide.id}-${slideState.seq}`
            )}

          {renderSlideVisual(
            currentSlide,
            slideState.seq > 0 ? 'k28-case-slide-enter' : '',
            `enter-${currentSlide.id}-${slideState.seq}`
          )}

          {/* Left / Right Interactive Slide Stepping Zones (matching ProjectDetailSlider in CjYIh23l.js) */}
          {!infoOpen && stagePhase === 'active' && (
            <>
              {slideState.current > 0 && (
                <button
                  type="button"
                  aria-label="Previous case study slide"
                  data-cursor-icon="arrow-left"
                  onClick={() => goToSlide(slideState.current - 1)}
                  className="absolute left-0 top-16 bottom-24 w-1/2 z-10"
                />
              )}
              <button
                type="button"
                aria-label={
                  isLastSlide
                    ? 'Close case study and return to work'
                    : 'Next case study slide'
                }
                data-cursor-icon={isLastSlide ? 'close' : 'arrow-right'}
                onClick={() => goToSlide(slideState.current + 1)}
                className={`absolute right-0 top-16 bottom-24 z-10 ${
                  slideState.current > 0 ? 'w-1/2' : 'w-full'
                }`}
              />
            </>
          )}

          {/* Bottom-Left Slide Counter & Progress Ring */}
          <div className="fixed left-[var(--grid-outer-gutter)] bottom-[1.3889vw] z-20 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.03em] text-white mix-blend-difference pointer-events-none">
            <svg viewBox="0 0 20 20" className="w-4 h-4 -rotate-90" fill="none">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="1.6"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="1.6"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={
                  100 - ((slideState.current + 1) / slides.length) * 100
                }
                className="transition-[stroke-dashoffset] duration-500"
              />
            </svg>
            <span>
              {project.title} — 0{slideState.current + 1} / 0{slides.length}
            </span>
          </div>
        </div>
      </div>

      {/* Staggered Frosted Circular Controls (Project Details ≡ + Close ×, $e = 0.08s stagger) */}
      <div className="fixed right-[var(--grid-outer-gutter)] bottom-[var(--grid-outer-gutter)] z-[99] flex items-center gap-2.5 pointer-events-none">
        <button
          type="button"
          data-cursor="active"
          aria-label={
            infoOpen ? 'Hide project information' : 'Show project information'
          }
          aria-expanded={infoOpen}
          onClick={() => setInfoOpen((v) => !v)}
          className={`k28-case-round-btn k28-case-btn-0 ${
            controlsVisible ? 'is-visible' : ''
          }`}
        >
          <span className="w-4 h-4 k28-icon-wipe">
            <InfoLinesIcon className="k28-icon-out" />
            <InfoLinesIcon className="k28-icon-in" />
          </span>
        </button>

        <button
          type="button"
          data-cursor="active"
          aria-label="Close case study"
          onClick={requestCloseProject}
          className={`k28-case-round-btn k28-case-btn-1 ${
            controlsVisible ? 'is-visible' : ''
          }`}
        >
          <span className="w-4 h-4 k28-icon-wipe">
            <CloseThinIcon className="k28-icon-out" />
            <CloseThinIcon className="k28-icon-in" />
          </span>
        </button>
      </div>

      {/* Authentic 28k.studio ProjectDetailPanel inside SidePanel (1.19s inOutExpo sheet wipe + cascading rules & lines) */}
      <SidePanel
        visible={infoOpen}
        label={`${project.title} project information`}
        onClose={() => setInfoOpen(false)}
      >
        <div className="flex flex-col gap-16 md:gap-[9.5vw] pb-8">
          {/* Section 1: Discipline + Title / Subtitle + Website / Services / Year */}
          <section>
            <div className="k28-panel-rule k28-prow-0 pt-3 md:pt-[0.85vw]">
              <div className="k28-contact-grid-8">
                <div className="hidden md:block md:col-span-3 text-[max(22px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#1F1F1F]">
                  <span className="k28-reveal-mask">
                    <span className="block k28-panel-line k28-prow-0">
                      {project.discipline}
                    </span>
                  </span>
                </div>
                <div className="col-span-6 md:col-start-5 md:col-span-4">
                  <h2 className="m-0 text-[max(22px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#666666]">
                    <span className="k28-reveal-mask">
                      <span className="block k28-panel-line k28-prow-0">
                        {project.title}
                      </span>
                    </span>
                  </h2>
                  <h3 className="m-0 text-[max(22px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#1F1F1F]">
                    <span className="k28-reveal-mask">
                      <span className="block k28-panel-line k28-prow-1">
                        {project.subtitle}
                      </span>
                    </span>
                  </h3>
                </div>
              </div>
            </div>

            <div className="mt-14 md:mt-[10.5vw] k28-contact-grid-8 items-end font-mono text-[11px] md:text-[12px] font-medium uppercase tracking-[0.03em]">
              <div className="hidden md:block md:col-span-3">
                {project.liveUrl && (
                  <span className="k28-reveal-mask">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="active"
                      className="inline-block underline hover:opacity-70 k28-panel-line k28-prow-2"
                    >
                      VISIT WEBSITE
                    </a>
                  </span>
                )}
              </div>
              <div className="col-span-2 md:col-span-1 text-[#666666]">
                <span className="k28-reveal-mask">
                  <span className="block k28-panel-line k28-prow-2">
                    SERVICES
                  </span>
                </span>
              </div>
              <ul className="m-0 p-0 list-none col-span-3 md:col-span-3 flex flex-col gap-1">
                {project.services.map((srv, idx) => (
                  <li key={srv} className="k28-reveal-mask">
                    <span
                      className={`block k28-panel-line k28-prow-${Math.min(
                        5,
                        2 + idx
                      )}`}
                    >
                      {srv}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="col-span-1 md:col-span-1 text-right">
                <span className="k28-reveal-mask">
                  <span className="block k28-panel-line k28-prow-3">
                    {project.year}
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: Editorial Info (Challenge & Solution) */}
          <section className="k28-panel-rule k28-prow-4 pt-3 md:pt-[0.85vw]">
            <div className="k28-contact-grid-8">
              <h2 className="m-0 col-span-6 md:col-span-4 text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] mb-6 md:mb-0">
                <span className="k28-reveal-mask">
                  <span className="block k28-panel-line k28-prow-4">Info</span>
                </span>
              </h2>
              <div className="col-span-6 md:col-span-4 text-[max(13px,0.98vw)] font-medium leading-[1.58]">
                <h3 className="m-0 text-[#1F1F1F] font-medium text-[length:inherit]">
                  <span className="k28-reveal-mask">
                    <span className="block k28-panel-line k28-prow-5">
                      Challenge
                    </span>
                  </span>
                </h3>
                <p className="mt-2 mb-0 text-[#666666] k28-panel-fade k28-prow-5">
                  {project.challenge}
                </p>

                <h3 className="mt-8 mb-0 text-[#1F1F1F] font-medium text-[length:inherit]">
                  <span className="k28-reveal-mask">
                    <span className="block k28-panel-line k28-prow-6">
                      Solution
                    </span>
                  </span>
                </h3>
                <p className="mt-2 mb-0 text-[#666666] k28-panel-fade k28-prow-6">
                  {project.solution}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Deliverables & Studio Credits List (Interactive Yellow Band Hover) */}
          <section className="k28-panel-rule k28-prow-7 pt-3 md:pt-[0.85vw]">
            <div className="k28-contact-grid-8 mb-8 md:mb-[2.8vw]">
              <h3 className="m-0 col-span-4 text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2]">
                <span className="k28-reveal-mask">
                  <span className="block k28-panel-line k28-prow-7">
                    Deliverables
                  </span>
                </span>
              </h3>
              <div className="col-span-2 md:col-span-4 text-right md:text-left text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2] text-[#999999]">
                <span className="k28-reveal-mask">
                  <span className="block k28-panel-line k28-prow-7">
                    0{project.services.length}
                  </span>
                </span>
              </div>
            </div>

            <div>
              {project.services.map((srv, idx) => (
                <div
                  key={srv}
                  className={`k28-contact-inbox-row py-4 md:py-[1.1vw] k28-panel-fade k28-prow-${Math.min(
                    10,
                    7 + idx
                  )}`}
                >
                  <div className="k28-contact-grid-8 items-center text-[max(13px,1.05vw)] font-medium">
                    <span className="col-span-3 md:col-span-4 text-[#1F1F1F]">
                      {srv}
                    </span>
                    <span className="col-span-2 md:col-span-3 text-[#666666]">
                      28K Studio — TO &amp; CPH
                    </span>
                    <span className="col-span-1 text-right font-mono text-[11px] text-[#999999]">
                      {project.year}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Contact Links inside ProjectDetailPanel (matching CjYIh23l.js contact-list) */}
          <section className="k28-panel-rule k28-prow-9 pt-3 md:pt-[0.85vw]">
            <div className="k28-contact-grid-8 mb-8 md:mb-[2.8vw]">
              <h3 className="m-0 col-span-6 md:col-span-4 text-[max(20px,1.9444vw)] font-medium tracking-[-0.02em] leading-[1.2]">
                <span className="k28-reveal-mask">
                  <span className="block k28-panel-line k28-prow-9">
                    Contact
                  </span>
                </span>
              </h3>
            </div>

            {CONTACT_CONTENT.inboxes.slice(0, 2).map((inbox) => {
              const isCopied = copiedId === inbox.id;
              return (
                <div
                  key={inbox.id}
                  className={`k28-contact-inbox-row ${
                    isCopied ? 'is-copied' : ''
                  }`}
                >
                  <button
                    type="button"
                    data-cursor="active"
                    onClick={() => handleCopyEmail(inbox.id, inbox.email)}
                    className="w-full text-left py-5 md:py-[1.6vw] k28-contact-grid-8 items-start group"
                  >
                    <span className="hidden md:block md:col-span-4 text-[max(14px,1.2vw)] font-medium text-[#999999] group-hover:text-[#1F1F1F]/70 transition-colors">
                      {inbox.title}
                    </span>
                    <div className="col-span-6 md:col-span-4 flex flex-col">
                      <span className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.03em] text-[#333333]/60">
                        {inbox.label}
                      </span>
                      <div className="mt-3 flex items-center justify-between text-[max(14px,1.2vw)] font-medium text-[#1F1F1F]">
                        <span>{isCopied ? 'Copied!' : inbox.email}</span>
                        <span className="w-4 h-4 k28-icon-wipe">
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

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                data-cursor="active"
                onClick={() => {
                  setInfoOpen(false);
                  onCloseComplete();
                  onOpenContact();
                }}
                className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.03em] underline text-[#666666] hover:text-[#1F1F1F]"
              >
                OPEN FULL STUDIO CONTACT PANEL
              </button>
            </div>
          </section>
        </div>
      </SidePanel>
    </>
  );
}
