import React, { useEffect, useRef, useState } from 'react';

type CursorIconKind = 'none' | 'plus' | 'arrow-left' | 'arrow-right' | 'close';

const ICON_PATHS: Record<
  Exclude<CursorIconKind, 'none'>,
  { a: string; b: string; strokeWidth: number }
> = {
  plus: {
    a: 'M10 0L10 20',
    b: 'M0 10L20 10',
    strokeWidth: 1,
  },
  'arrow-left': {
    a: 'M17.5 9.8627L3.4375 9.8627',
    b: 'M9.0625 15.4877L3.4375 9.8627L9.0625 4.2377',
    strokeWidth: 0.95,
  },
  'arrow-right': {
    a: 'M2.5 9.8627L16.5625 9.8627',
    b: 'M10.9375 15.4877L16.5625 9.8627L10.9375 4.2377',
    strokeWidth: 0.95,
  },
  close: {
    a: 'M2.812 16.3979L16.3943 2.8156',
    b: 'M2.812 2.8119L16.3943 16.3942',
    strokeWidth: 0.9,
  },
};

export function CustomCursor() {
  const [isFinePointer, setIsFinePointer] = useState(false);

  const outerGroupRef = useRef<SVGGElement | null>(null);
  const circleElemRef = useRef<SVGCircleElement | null>(null);
  const scrollGroupRef = useRef<SVGGElement | null>(null);
  const topArrowRef = useRef<SVGPathElement | null>(null);
  const bottomArrowRef = useRef<SVGPathElement | null>(null);
  const innerGroupRef = useRef<SVGGElement | null>(null);
  const pathARef = useRef<SVGPathElement | null>(null);
  const pathBRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsFinePointer(mq.matches);
    if (!mq.matches) return;

    let rafId = 0;
    let visible = false;
    let enterStartTs = 0;
    let isPressed = false;
    let isActiveControl = false;
    let isScrollableSurface = false;
    let currentIcon: CursorIconKind = 'none';

    const target = { x: -200, y: -200 };
    const outer = { x: -200, y: -200 };
    const inner = { x: -200, y: -200 };
    let scale = 1;
    let arrowOffset = 0;
    let lastTs = 0;

    const applyIconPaths = (icon: CursorIconKind) => {
      if (currentIcon === icon) return;
      currentIcon = icon;
      const pA = pathARef.current;
      const pB = pathBRef.current;
      const dot = dotRef.current;
      if (!pA || !pB || !dot) return;

      if (icon === 'none') {
        pA.setAttribute('d', 'M10 10L10.01 10');
        pB.setAttribute('d', 'M10 10L10.01 10');
        pA.setAttribute('opacity', '0');
        pB.setAttribute('opacity', '0');
        dot.setAttribute('opacity', '1');
      } else {
        const spec = ICON_PATHS[icon];
        pA.setAttribute('d', spec.a);
        pB.setAttribute('d', spec.b);
        pA.setAttribute('stroke-width', String(spec.strokeWidth));
        pB.setAttribute('stroke-width', String(spec.strokeWidth));
        pA.setAttribute('opacity', '1');
        pB.setAttribute('opacity', '1');
        dot.setAttribute('opacity', '0');
      }
    };

    const inspectHoverTarget = (el: EventTarget | null) => {
      if (!(el instanceof Element)) {
        isActiveControl = false;
        isScrollableSurface = false;
        applyIconPaths('none');
        return;
      }

      const iconHost = el.closest('[data-cursor-icon]');
      const iconAttr = iconHost?.getAttribute('data-cursor-icon') as
        | CursorIconKind
        | null;

      if (
        iconAttr === 'plus' ||
        iconAttr === 'arrow-left' ||
        iconAttr === 'arrow-right' ||
        iconAttr === 'close'
      ) {
        applyIconPaths(iconAttr);
        isActiveControl = false;
      } else {
        applyIconPaths('none');
        const interactive = el.closest(
          'button, a, [data-cursor="active"], [role="button"]'
        );
        isActiveControl = Boolean(interactive);
      }

      isScrollableSurface = Boolean(el.closest('[data-scrollable-cursor="true"]'));
    };

    const handlePointerMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        outer.x = target.x;
        outer.y = target.y;
        inner.x = target.x;
        inner.y = target.y;
        enterStartTs = performance.now();
      }
      inspectHoverTarget(e.target);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button === 0) isPressed = true;
    };

    const handlePointerUp = () => {
      isPressed = false;
    };

    const handleMouseLeave = () => {
      visible = false;
    };

    const tick = (ts: number) => {
      const dtFactor = lastTs
        ? Math.min(3, Math.max(0.2, (ts - lastTs) / 16.6667))
        : 1;
      lastTs = ts;

      const outerG = outerGroupRef.current;
      const circleEl = circleElemRef.current;
      const scrollG = scrollGroupRef.current;
      const innerG = innerGroupRef.current;

      if (visible && outerG && circleEl && scrollG && innerG) {
        const lerpOuter = 1 - Math.pow(1 - 0.17, dtFactor);
        const lerpInner = 1 - Math.pow(1 - 0.35, dtFactor);
        const lerpScale = 1 - Math.pow(1 - 0.16, dtFactor);

        outer.x += (target.x - outer.x) * lerpOuter;
        outer.y += (target.y - outer.y) * lerpOuter;
        inner.x += (target.x - inner.x) * lerpInner;
        inner.y += (target.y - inner.y) * lerpInner;

        const targetScale = isPressed ? 0.76 : isActiveControl ? 0.4 : 1;
        scale += (targetScale - scale) * lerpScale;

        const targetArrow = isPressed ? 8 : 0;
        arrowOffset += (targetArrow - arrowOffset) * lerpScale;

        // 2s inOutExpo draw-in on first pointer entry (matching K5xd-C2_.js)
        const elapsed = Math.min(1, (ts - enterStartTs) / 1400);
        const eased =
          elapsed < 0.5
            ? 4 * elapsed * elapsed * elapsed
            : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
        const dashOffset = (1 - eased) * 100;
        const rot = -360 + eased * 270; // -360 -> -90

        outerG.setAttribute('opacity', '1');
        outerG.setAttribute(
          'transform',
          `translate(${outer.x.toFixed(2)} ${outer.y.toFixed(2)}) rotate(${rot.toFixed(
            2
          )}) scale(${scale.toFixed(3)})`
        );
        circleEl.setAttribute('stroke-dashoffset', dashOffset.toFixed(2));

        const showScrollArrows =
          isScrollableSurface && !isActiveControl && currentIcon === 'none' && elapsed > 0.7;
        scrollG.setAttribute('opacity', showScrollArrows ? '0.9' : '0');
        scrollG.setAttribute(
          'transform',
          `translate(${outer.x.toFixed(2)} ${outer.y.toFixed(2)})`
        );
        topArrowRef.current?.setAttribute(
          'transform',
          `translate(-4 ${(-44 - arrowOffset).toFixed(2)})`
        );
        bottomArrowRef.current?.setAttribute(
          'transform',
          `translate(-4 ${(40 + arrowOffset).toFixed(2)})`
        );

        innerG.setAttribute('opacity', elapsed > 0.25 ? '1' : '0');
        innerG.setAttribute(
          'transform',
          `translate(${inner.x.toFixed(2)} ${inner.y.toFixed(2)})`
        );
      } else if (outerG && scrollG && innerG) {
        outerG.setAttribute('opacity', '0');
        scrollG.setAttribute('opacity', '0');
        innerG.setAttribute('opacity', '0');
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <svg
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[9999] mix-blend-difference text-white overflow-visible"
      aria-hidden="true"
    >
      {/* 75x75 Outer Lagged Circle (r=37, pathLength=100) */}
      <g ref={outerGroupRef} opacity="0">
        <circle
          ref={circleElemRef}
          cx="0"
          cy="0"
          r="37"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset="100"
        />
      </g>

      {/* Vertical Scroll Double-Triangles (8x81 above/below circle) */}
      <g ref={scrollGroupRef} opacity="0">
        <path
          ref={topArrowRef}
          d="M8.001 4.0005L4.0005 0L0 4.0005H8.001Z"
          fill="currentColor"
        />
        <path
          ref={bottomArrowRef}
          d="M0 0L4.0005 4.0005L8.001 0H0Z"
          fill="currentColor"
        />
      </g>

      {/* Inner Fast-Tracking Icon / Center Dot */}
      <g ref={innerGroupRef} opacity="0">
        <g transform="translate(-10 -10)">
          <path
            ref={pathARef}
            d="M10 10L10.01 10"
            stroke="currentColor"
            fill="none"
            opacity="0"
          />
          <path
            ref={pathBRef}
            d="M10 10L10.01 10"
            stroke="currentColor"
            fill="none"
            opacity="0"
          />
        </g>
        <circle ref={dotRef} cx="0" cy="0" r="2" fill="currentColor" opacity="1" />
      </g>
    </svg>
  );
}
