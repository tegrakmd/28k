import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProjectData } from '../data/projects';
import {
  buildClockArcPath,
  generateClockMinorTickAngles,
  polarToClockPoint,
  stepContinuousAngle,
} from '../utils/clockMath';

interface ClockDialProps {
  projects: ProjectData[];
  activeIndex: number;
  slideProgress: number; // 0..1 within active slide
  showDialRing: boolean; // true in Work -> Latest; false in Home/Index/Studio/Methods (hands only)
  isProjectOpen?: boolean;
  skipIntro?: boolean;
  now: Date;
  onSelectProject: (index: number) => void;
  onPreviewProject?: (index: number | null) => void;
}

export function ClockDial({
  projects,
  activeIndex,
  slideProgress,
  showDialRing,
  isProjectOpen = false,
  skipIntro = false,
  now,
  onSelectProject,
  onPreviewProject,
}: ClockDialProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const count = projects.length; // 11
  const sectorDeg = 360 / count; // 32.72727deg

  const minorTickAngles = useMemo(
    () => generateClockMinorTickAngles(count, 3, 2.6),
    [count]
  );

  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const hourAngle = hours * 30 + minutes * 0.5;

  const activeStartDeg = activeIndex * sectorDeg;
  const activeCurrentDeg = activeStartDeg + slideProgress * sectorDeg;
  const targetSecondsDeg = showDialRing ? activeCurrentDeg : seconds * 6;

  // Refs for smooth 60fps shortest-path hand sweep & arc draw without React 60Hz setState
  const secondsHandRef = useRef<SVGLineElement | null>(null);
  const hourHandRef = useRef<SVGLineElement | null>(null);
  const progressArcRef = useRef<SVGPathElement | null>(null);

  const targetStateRef = useRef({
    targetSecondsDeg,
    activeStartDeg,
    activeCurrentDeg,
    hourAngle,
    showDialRing,
  });
  targetStateRef.current = {
    targetSecondsDeg,
    activeStartDeg,
    activeCurrentDeg,
    hourAngle,
    showDialRing,
  };

  useEffect(() => {
    let rafId = 0;
    const mountTs = performance.now();
    let currentContinuousDeg = targetStateRef.current.targetSecondsDeg;
    let currentArcStart = targetStateRef.current.activeStartDeg;
    let currentArcEnd = targetStateRef.current.activeCurrentDeg;
    let lastTs = mountTs;

    const animate = (ts: number) => {
      const dtFactor = Math.min(3, Math.max(0.2, (ts - lastTs) / 16.6667));
      lastTs = ts;

      const {
        targetSecondsDeg: tgtSec,
        activeStartDeg: tgtStart,
        activeCurrentDeg: tgtEnd,
        hourAngle: hrDeg,
        showDialRing: ringVisible,
      } = targetStateRef.current;

      const lerp = 1 - Math.pow(1 - 0.22, dtFactor);
      currentContinuousDeg = stepContinuousAngle(
        currentContinuousDeg,
        tgtSec,
        lerp
      );
      currentArcStart = stepContinuousAngle(currentArcStart, tgtStart, lerp);
      currentArcEnd = stepContinuousAngle(currentArcEnd, tgtEnd, lerp);

      // Smooth 0.9s outExpo radial hand reveal from center clearance (y1=336)
      const revealT = skipIntro ? 1 : Math.min(1, (ts - mountTs) / 900);
      const revealEase = 1 - Math.pow(1 - revealT, 4);

      if (hourHandRef.current) {
        hourHandRef.current.setAttribute(
          'y2',
          (336 - 336 * revealEase).toFixed(2)
        );
        hourHandRef.current.setAttribute(
          'transform',
          `rotate(${hrDeg.toFixed(3)} 360 360)`
        );
      }

      if (secondsHandRef.current) {
        secondsHandRef.current.setAttribute(
          'y2',
          (336 - 2136 * revealEase).toFixed(2)
        );
        secondsHandRef.current.setAttribute(
          'transform',
          `rotate(${currentContinuousDeg.toFixed(3)} 360 360)`
        );
      }

      if (progressArcRef.current) {
        if (ringVisible) {
          const normStart = ((currentArcStart % 360) + 360) % 360;
          const span = Math.max(0, currentArcEnd - currentArcStart);
          const arcD = buildClockArcPath(
            360,
            360,
            342.5,
            normStart,
            normStart + Math.min(sectorDeg, span)
          );
          progressArcRef.current.setAttribute('d', arcD);
        } else {
          progressArcRef.current.setAttribute('d', '');
        }
      }

      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(rafId);
  }, [sectorDeg, skipIntro]);

  const initialArcD = showDialRing
    ? buildClockArcPath(360, 360, 342.5, activeStartDeg, activeCurrentDeg)
    : '';

  return (
    <div
      className={`k28-clock ${isProjectOpen ? 'is-project-open' : ''}`}
      data-testid="studio-clock"
    >
      <svg
        viewBox="-12 -12 744 744"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="k28-clock-svg"
        aria-hidden="true"
      >
        <g className={`k28-clock-dial-group ${showDialRing ? '' : 'is-hidden'}`}>
          {/* Active progress band (r=342.5, strokeWidth=35 -> spans r=325..360) */}
          <path
            ref={progressArcRef}
            d={initialArcD}
            stroke="#FFFFFF"
            strokeWidth="35"
            fill="none"
          />

          {/* Minor 3-degree perimeter ticks (r=360 inward to r=350) */}
          <g opacity="0.48" className="mix-blend-difference">
            {minorTickAngles.map((deg) => {
              const outer = polarToClockPoint(360, 360, 360, deg);
              const inner = polarToClockPoint(360, 360, 350, deg);
              return (
                <line
                  key={deg}
                  x1={outer.x}
                  y1={outer.y}
                  x2={inner.x}
                  y2={inner.y}
                  stroke="#FFFFFF"
                  className="k28-clock-tick"
                />
              );
            })}
          </g>

          {/* 11 Radial Project Pill Indicators */}
          {projects.map((project, idx) => {
            const angle = idx * sectorDeg;
            const isActive = idx === activeIndex;
            const isHovered = hoveredSlot === idx && !isActive;

            return (
              <g
                key={project.slug}
                transform={`rotate(${angle.toFixed(4)} 360 360)`}
              >
                {!isActive && (
                  <line
                    x1="360"
                    y1="0"
                    x2="360"
                    y2="50"
                    stroke="#FFFFFF"
                    className="k28-indicator-line"
                  />
                )}

                {!isActive && (
                  <rect
                    x="353"
                    y="-7"
                    width="14"
                    height="64"
                    rx="7"
                    stroke="#FFFFFF"
                    opacity={isHovered ? '0.95' : '0.32'}
                    className="k28-indicator-outline"
                  />
                )}

                {isHovered && (
                  <rect
                    x="353"
                    y="-7"
                    width="14"
                    height="64"
                    rx="7"
                    fill="#FFFFFF"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Hour hand: 24-unit center clearance (y=336 to y=0), rotates around (360,360) */}
        <line
          ref={hourHandRef}
          x1="360"
          y1="336"
          x2="360"
          y2="0"
          stroke="#FFFFFF"
          className="k28-clock-hand"
          transform={`rotate(${hourAngle.toFixed(3)} 360 360)`}
        />

        {/* Sweeping 100vmax seconds/progress hand: 24-unit center clearance (y=336 to y=-1800) */}
        <line
          ref={secondsHandRef}
          x1="360"
          y1="336"
          x2="360"
          y2="-1800"
          stroke="#FFFFFF"
          className="k28-clock-hand"
          transform={`rotate(${targetSecondsDeg.toFixed(3)} 360 360)`}
        />
      </svg>

      {/* Accessible native buttons aligned to the 11 radial indicator pills */}
      {showDialRing &&
        projects.map((project, idx) => {
          const isActive = idx === activeIndex;
          const num = String(idx + 1).padStart(2, '0');
          return (
            <button
              key={project.slug}
              type="button"
              className={`k28-clock-slot k28-clock-slot-${idx}`}
              data-cursor="active"
              aria-label={`Select project ${num}: ${project.title} — ${project.subtitle}`}
              aria-pressed={isActive}
              onMouseEnter={() => {
                setHoveredSlot(idx);
                onPreviewProject?.(idx);
              }}
              onMouseLeave={() => {
                setHoveredSlot(null);
                onPreviewProject?.(null);
              }}
              onClick={() => {
                setHoveredSlot(null);
                onSelectProject(idx);
              }}
            />
          );
        })}
    </div>
  );
}
