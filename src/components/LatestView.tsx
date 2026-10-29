import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProjectData } from '../data/projects';
import { PlusIcon, SmileyIcon } from './Icons';
import {
  computeCounterSlotTarget,
  FlightRect,
  formatTodayDisplay,
} from '../utils/clockMath';

interface LatestViewProps {
  projects: ProjectData[];
  activeIndex: number;
  now: Date;
  isIntroRunning?: boolean;
  isLeavingView?: boolean;
  isProjectExpanded?: boolean;
  onOpenProject: (project: ProjectData, originRect: FlightRect | null) => void;
}

interface SlideTransitionState {
  currentIdx: number;
  leavingIdx: number | null;
  seq: number;
}

export function LatestView({
  projects,
  activeIndex,
  now,
  isIntroRunning = false,
  isLeavingView = false,
  isProjectExpanded = false,
  onOpenProject,
}: LatestViewProps) {
  const mediaBtnRef = useRef<HTMLButtonElement | null>(null);
  const count = projects.length;
  const activeProject = projects[activeIndex] ?? projects[0];
  const today = formatTodayDisplay(now);
  const totalLabel = String(count).padStart(2, '0');

  const triggerOpen = (proj: ProjectData) => {
    const el = mediaBtnRef.current;
    const b = el?.getBoundingClientRect();
    const rect: FlightRect | null =
      b && b.width > 0 && b.height > 0
        ? { x: b.left, y: b.top, width: b.width, height: b.height, rx: 0 }
        : null;
    onOpenProject(proj, rect);
  };

  // Dual-layer simultaneous photo zoom & masked content transition state
  const [transition, setTransition] = useState<SlideTransitionState>({
    currentIdx: activeIndex,
    leavingIdx: null,
    seq: 0,
  });

  useEffect(() => {
    setTransition((prev) => {
      if (prev.currentIdx === activeIndex) return prev;
      return {
        currentIdx: activeIndex,
        leavingIdx: isIntroRunning ? null : prev.currentIdx,
        seq: prev.seq + 1,
      };
    });
  }, [activeIndex, isIntroRunning]);

  useEffect(() => {
    if (transition.leavingIdx === null) return;
    const timer = window.setTimeout(() => {
      setTransition((prev) => ({ ...prev, leavingIdx: null }));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [transition.leavingIdx, transition.seq]);

  // Continuous 3x11 two-digit slot counter (matching sZG4feHa.js counterColumn)
  const counterItems = useMemo(
    () =>
      Array.from({ length: count * 3 }, (_, idx) => ({
        key: `slot-${idx}`,
        label: String((idx % count) + 1).padStart(2, '0'),
      })),
    [count]
  );

  const prevCounterIdxRef = useRef<number | null>(null);
  const [slotPos, setSlotPos] = useState<number>(() => count + activeIndex);
  const [slotInstant, setSlotInstant] = useState<boolean>(true);

  useEffect(() => {
    const prevIdx = prevCounterIdxRef.current;
    prevCounterIdxRef.current = activeIndex;

    const { toSlot, normalizedSlot } = computeCounterSlotTarget(
      prevIdx,
      activeIndex,
      count
    );

    if (prevIdx === null || isIntroRunning) {
      setSlotInstant(true);
      setSlotPos(normalizedSlot);
      return;
    }

    setSlotInstant(false);
    setSlotPos(toSlot);

    if (toSlot !== normalizedSlot) {
      const snapTimer = window.setTimeout(() => {
        setSlotInstant(true);
        setSlotPos(normalizedSlot);
      }, 760);
      return () => window.clearTimeout(snapTimer);
    }
  }, [activeIndex, count, isIntroRunning]);

  const currentProject = projects[transition.currentIdx] ?? activeProject;
  const leavingProject =
    transition.leavingIdx !== null ? projects[transition.leavingIdx] : null;

  const lineAnimClass = isIntroRunning
    ? 'k28-reveal-held'
    : isProjectExpanded
    ? 'k28-reveal-line-out'
    : 'k28-reveal-line-in';

  return (
    <section
      className={`k28-latest ${isLeavingView ? 'is-leaving' : 'is-entering'} ${
        isProjectExpanded ? 'is-project-expanded' : ''
      }`}
      data-project={currentProject.slug}
      data-scrollable-cursor="true"
      aria-label="Featured projects carousel"
    >
      {/* Locked Exact Clock-Centered 3:2 Project Showcase Stage */}
      <button
        ref={mediaBtnRef}
        type="button"
        className="k28-latest-media-btn"
        data-testid="latest-centered-media"
        data-cursor-icon="plus"
        aria-label={`Open case study: ${currentProject.title} ${currentProject.subtitle}`}
        onClick={() => triggerOpen(currentProject)}
      >
        {leavingProject && (
          <img
            key={`leave-${leavingProject.slug}-${transition.seq}`}
            src={leavingProject.heroImage}
            alt=""
            aria-hidden="true"
            className="k28-latest-media-img k28-media-leave"
          />
        )}
        <img
          key={`enter-${currentProject.slug}-${transition.seq}`}
          src={currentProject.heroImage}
          alt={`${currentProject.title} — ${currentProject.subtitle}`}
          className={`k28-latest-media-img ${
            transition.seq > 0
              ? isIntroRunning
                ? 'k28-media-riffle'
                : 'k28-media-enter'
              : 'k28-media-initial'
          }`}
        />
      </button>

      {/* Left (Client + Subtitle + CTA Pill) & Right (Discipline + Year) Metadata */}
      <div className="k28-latest-meta-row">
        {leavingProject && !isIntroRunning && (
          <div
            key={`meta-leave-${leavingProject.slug}-${transition.seq}`}
            className="k28-grid k28-latest-meta-layer is-leaving"
            data-project={leavingProject.slug}
            aria-hidden="true"
          >
            <div className="k28-latest-piece k28-latest-piece-left">
              <div className="k28-reveal-mask k28-latest-primary-text">
                <span className="block k28-reveal-line-out">
                  {leavingProject.title}
                </span>
              </div>
              <div className="k28-reveal-mask k28-latest-secondary-text">
                <span className="block k28-reveal-line-out">
                  {leavingProject.subtitle}
                </span>
              </div>
              <div className="k28-cta-pill-wrap k28-cta-leave">
                <span className="k28-cta-pill">
                  <span className="k28-cta-plus">
                    <PlusIcon />
                  </span>
                </span>
              </div>
            </div>

            <div className="k28-latest-piece k28-latest-piece-right">
              <div className="k28-reveal-mask k28-latest-primary-text">
                <span className="block k28-reveal-line-out">
                  {leavingProject.discipline}
                </span>
              </div>
              <div className="k28-reveal-mask k28-latest-secondary-text">
                <span className="block k28-reveal-line-out">
                  {leavingProject.year}
                </span>
              </div>
            </div>
          </div>
        )}

        <div
          key={`meta-enter-${currentProject.slug}-${transition.seq}-${
            isIntroRunning ? 'hold' : 'show'
          }`}
          className="k28-grid k28-latest-meta-layer"
        >
          <div className="k28-latest-piece k28-latest-piece-left">
            <h1 className="m-0 font-medium text-[length:inherit] leading-[inherit] tracking-[inherit] k28-latest-primary-text">
              <span className="k28-reveal-mask">
                <span className={`block ${lineAnimClass} k28-delay-0`}>
                  {currentProject.title}
                </span>
              </span>
            </h1>
            <p className="m-0 font-medium text-[length:inherit] leading-[inherit] tracking-[inherit] k28-latest-secondary-text">
              <span className="k28-reveal-mask">
                <span className={`block ${lineAnimClass} k28-delay-1`}>
                  {currentProject.subtitle}
                </span>
              </span>
            </p>
            <div
              className={`k28-cta-pill-wrap ${
                isIntroRunning
                  ? 'opacity-0 pointer-events-none'
                  : isProjectExpanded
                  ? 'k28-cta-leave'
                  : 'k28-cta-enter'
              }`}
            >
              <button
                type="button"
                className="k28-cta-pill"
                data-cursor="active"
                aria-label={`View ${currentProject.title} ${currentProject.subtitle} project details`}
                onClick={() => triggerOpen(currentProject)}
              >
                <span className="k28-cta-plus k28-icon-wipe">
                  <PlusIcon className="k28-icon-out" />
                  <PlusIcon className="k28-icon-in" />
                </span>
              </button>
            </div>
          </div>

          <div className="k28-latest-piece k28-latest-piece-right">
            <span className="k28-reveal-mask k28-latest-primary-text">
              <span className={`block ${lineAnimClass} k28-delay-2`}>
                {currentProject.discipline}
              </span>
            </span>
            <span className="k28-reveal-mask k28-latest-secondary-text">
              <span className={`block ${lineAnimClass} k28-delay-3`}>
                {currentProject.year}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom-Left Live Studio Day Counter */}
      <div className="k28-today" aria-label="Studio date and day count">
        <span className="k28-today-line">
          <span>{today.weekday}</span>
          <SmileyIcon />
        </span>
        <span className="k28-today-line">
          <span>{today.monthDay}</span>
        </span>
        <span className="k28-today-line">
          <span>{today.dayLabel}</span>
        </span>
      </div>

      {/* Bottom-Right Continuous 3x11 Slot-Machine Slide Counter (01 / 11) */}
      <div
        className={`k28-slide-counter ${
          isIntroRunning ? 'opacity-0' : 'opacity-100'
        }`}
        aria-live="polite"
        aria-label={`Project ${String(activeIndex + 1).padStart(
          2,
          '0'
        )} of ${totalLabel}`}
      >
        <span className="k28-counter-window" aria-hidden="true">
          <span
            className={`k28-counter-strip ${
              slotInstant ? 'is-instant' : ''
            } k28-slot-${slotPos}`}
          >
            {counterItems.map((item) => (
              <span key={item.key}>{item.label}</span>
            ))}
          </span>
        </span>
        <span className="whitespace-pre" aria-hidden="true">
          {` / ${totalLabel}`}
        </span>
      </div>
    </section>
  );
}
