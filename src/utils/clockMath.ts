export const STUDIO_FOUNDED_DATE = '2022-02-22T00:00:00Z';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Parses 3-digit or 6-digit hex color strings into RGB channels (0..255).
 * Gracefully trims trailing malformed hex digits (e.g. Storyblok #FFFFFFF).
 */
export function parseHexColor(hex: string): RgbColor {
  const cleaned = hex.trim().replace(/^#/, '');
  if (cleaned.length === 3) {
    return {
      r: parseInt(cleaned[0] + cleaned[0], 16),
      g: parseInt(cleaned[1] + cleaned[1], 16),
      b: parseInt(cleaned[2] + cleaned[2], 16),
    };
  }
  const six = cleaned.slice(0, 6).padEnd(6, '0');
  return {
    r: parseInt(six.slice(0, 2), 16) || 0,
    g: parseInt(six.slice(2, 4), 16) || 0,
    b: parseInt(six.slice(4, 6), 16) || 0,
  };
}

/**
 * Relative luminance per WCAG 2.1 specification (0 = black, 1 = white).
 */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = parseHexColor(hex);
  const toLinear = (channel: number) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Determines foreground icon color (#FFFFFF vs #1F1F1F) for 28K CTA pills
 * using WCAG contrast crossover threshold (~0.1791).
 */
export function getCtaForegroundColor(ctaHex: string): '#FFFFFF' | '#1F1F1F' {
  const threshold = Math.sqrt(1.05 * 0.05) - 0.05;
  return getRelativeLuminance(ctaHex) < threshold ? '#FFFFFF' : '#1F1F1F';
}

/**
 * Computes elapsed studio days since 2022-02-22 (matching 28K's 28,000-day philosophy).
 */
export function calculateStudioDayCount(
  now: Date,
  foundedIso: string = STUDIO_FOUNDED_DATE
): number {
  const founded = new Date(foundedIso);
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcFounded = Date.UTC(
    founded.getUTCFullYear(),
    founded.getUTCMonth(),
    founded.getUTCDate()
  );
  const diffDays = Math.floor((utcNow - utcFounded) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

/**
 * Formats the Today block lines matching 28k.studio ("THU", "OCT. 29", "DAY 1710").
 * Months longer than 3 letters receive a trailing period ("MAY 5" vs "OCT. 29").
 */
export function formatTodayDisplay(now: Date): {
  weekday: string;
  monthDay: string;
  dayLabel: string;
} {
  const weekday = now
    .toLocaleDateString('en-US', { weekday: 'short' })
    .toUpperCase();
  const fullMonth = now.toLocaleDateString('en-US', { month: 'long' });
  const monthPrefix =
    fullMonth.length > 3
      ? `${fullMonth.slice(0, 3).toUpperCase()}.`
      : fullMonth.toUpperCase();
  const monthDay = `${monthPrefix} ${now.getDate()}`;
  const dayCount = calculateStudioDayCount(now);
  return {
    weekday,
    monthDay,
    dayLabel: `DAY ${dayCount}`,
  };
}

/**
 * Formats 24-hour HH:MM and short timezone abbreviation for studio office clocks.
 */
export function formatOfficeClock(
  now: Date,
  timeZone: 'Europe/Copenhagen' | 'America/Toronto'
): { time: string; zone: string } {
  const timeParts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const hour = timeParts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = timeParts.find((p) => p.type === 'minute')?.value ?? '00';

  // Derive standard CET/CEST and EST/EDT abbreviations deterministically
  const tzOffsetParts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(now);
  const offsetRaw =
    tzOffsetParts.find((p) => p.type === 'timeZoneName')?.value ?? '';

  let zone = timeZone === 'Europe/Copenhagen' ? 'CET' : 'EST';
  if (timeZone === 'Europe/Copenhagen' && offsetRaw.includes('+2')) {
    zone = 'CEST';
  } else if (timeZone === 'America/Toronto' && offsetRaw.includes('-4')) {
    zone = 'EDT';
  }

  return {
    time: `${hour === '24' ? '00' : hour}:${minute}`,
    zone,
  };
}

/**
 * Converts clock angle (0deg = 12 o'clock, clockwise) to SVG Cartesian coordinates.
 */
export function polarToClockPoint(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: Number((cx + radius * Math.cos(rad)).toFixed(4)),
    y: Number((cy + radius * Math.sin(rad)).toFixed(4)),
  };
}

/**
 * Builds an SVG clockwise arc path from startDeg to endDeg on the 720x720 clock dial.
 */
export function buildClockArcPath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number
): string {
  const span = Math.max(0, Math.min(359.99, endDeg - startDeg));
  if (span <= 0.05) {
    return '';
  }
  const start = polarToClockPoint(cx, cy, radius, startDeg);
  const end = polarToClockPoint(cx, cy, radius, startDeg + span);
  const largeArcFlag = span > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

/**
 * Generates minor tick angles around 0..360 every 3 degrees,
 * skipping any tick that falls within minClearanceDeg of the N project indicator pills.
 */
export function generateClockMinorTickAngles(
  projectCount: number = 11,
  stepDeg: number = 3,
  minClearanceDeg: number = 2.6
): number[] {
  const indicatorAngles = Array.from(
    { length: projectCount },
    (_, i) => (i * 360) / projectCount
  );

  const ticks: number[] = [];
  for (let deg = 0; deg < 360; deg += stepDeg) {
    const overlapsIndicator = indicatorAngles.some((indDeg) => {
      const diff = Math.abs((((deg - indDeg) % 360) + 540) % 360 - 180);
      return diff < minClearanceDeg;
    });
    if (!overlapsIndicator) {
      ticks.push(deg);
    }
  }
  return ticks;
}

/**
 * Wraps an arbitrary integer index cleanly into [0, length - 1].
 */
export function wrapSlideIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/**
 * Computes shortest signed angular delta (-180..180) so clock hands never spin backwards 330deg on wrap.
 */
export function shortestAngleDelta(fromDeg: number, toDeg: number): number {
  return ((((toDeg - fromDeg) % 360) + 540) % 360) - 180;
}

export interface IndexGridEntry<TAsset> {
  kind: 'year' | 'placeholder' | 'asset';
  key: string;
  shortYear?: string;
  isFirstYear?: boolean;
  asset?: TAsset;
}

/**
 * Builds the flat Index archive sequence with year headers + alignment placeholders
 * matching 28k.studio's 12-column CSS grid rules across zoom levels 1, 2, and 3.
 */
export function buildIndexGridSequence<
  TAsset extends { id: string; shortYear: string }
>(assets: TAsset[]): IndexGridEntry<TAsset>[] {
  const entries: IndexGridEntry<TAsset>[] = [];
  let lastYear: string | null = null;

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    if (asset.shortYear !== lastYear) {
      const isFirst = lastYear === null;
      lastYear = asset.shortYear;
      if (!isFirst) {
        entries.push({
          kind: 'year',
          key: `year-${asset.shortYear}`,
          shortYear: asset.shortYear,
          isFirstYear: false,
        });
        // Two placeholders after year header:
        // zoom-1 (6 cols / span 2) uses 1 year + 2 placeholders = 3 items (half row) or clean alignment;
        // zoom-2 & zoom-3 hide the second placeholder via CSS (.placeholder + .placeholder { display: none })
        entries.push({
          kind: 'placeholder',
          key: `ph-${asset.shortYear}-1`,
        });
        entries.push({
          kind: 'placeholder',
          key: `ph-${asset.shortYear}-2`,
        });
      }
    }
    entries.push({
      kind: 'asset',
      key: asset.id,
      asset,
    });
  }

  return entries;
}

/**
 * Computes shortest-path slot target in a 3x-replicated counter strip (0 .. count*3 - 1).
 * Starting from normalized middle copy [count .. 2*count - 1], any shortest step [-floor(count/2) .. +floor(count/2)]
 * lands strictly within [ceil(count/2) .. 2*count + floor(count/2)], avoiding strip boundary overflow.
 */
export function computeCounterSlotTarget(
  prevIndex: number | null,
  nextIndex: number,
  count: number
): { fromSlot: number; toSlot: number; normalizedSlot: number } {
  if (count <= 0) {
    return { fromSlot: 0, toSlot: 0, normalizedSlot: 0 };
  }
  const cleanNext = wrapSlideIndex(nextIndex, count);
  const normalizedSlot = count + cleanNext;
  if (prevIndex === null) {
    return {
      fromSlot: normalizedSlot,
      toSlot: normalizedSlot,
      normalizedSlot,
    };
  }
  const cleanPrev = wrapSlideIndex(prevIndex, count);
  const fromSlot = count + cleanPrev;
  const rawDiff = (cleanNext - cleanPrev + count) % count;
  const shortestStep = rawDiff * 2 <= count ? rawDiff : rawDiff - count;
  return {
    fromSlot,
    toSlot: fromSlot + shortestStep,
    normalizedSlot,
  };
}

/**
 * Smoothly steps a continuous rotation angle toward targetDeg along the shortest circular path.
 */
export function stepContinuousAngle(
  currentDeg: number,
  targetDeg: number,
  lerpFactor: number
): number {
  const delta = shortestAngleDelta(currentDeg, targetDeg);
  if (Math.abs(delta) < 0.02) {
    return currentDeg + delta;
  }
  return currentDeg + delta * Math.max(0, Math.min(1, lerpFactor));
}

/**
 * Computes a bounded stagger bucket (0..15) for Index archive items ordered row-by-row
 * and center-outward within each row (matching 28k.studio's Qo/Je transition).
 */
export function computeCenterOutwardStaggerBucket(
  itemIndex: number,
  columnsPerRow: number = 4
): number {
  const cols = Math.max(1, columnsPerRow);
  const row = Math.floor(itemIndex / cols);
  const col = itemIndex % cols;
  const center = (cols - 1) / 2;
  const distFromEdgeRank = Math.round(
    center - Math.abs(col - center)
  );
  const bucket = row * 2 + Math.max(0, distFromEdgeRank);
  return Math.max(0, Math.min(15, bucket));
}

export interface FlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
}

/**
 * Exact 28k.studio inOutExpo easing curve (0 -> 1).
 */
export function inOutExpoEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

/**
 * Computes interpolated SVG clip-rect and inner zoomed image geometry for opening/closing
 * a project from an arbitrary thumbnail/clock rect to full viewport (and back).
 */
export function interpolateFlightFrame(
  from: FlightRect,
  to: FlightRect,
  rawProgress: number,
  peakZoomBoost: number = 0.045
): {
  clipX: number;
  clipY: number;
  clipWidth: number;
  clipHeight: number;
  clipRx: number;
  imgX: number;
  imgY: number;
  imgWidth: number;
  imgHeight: number;
  eased: number;
} {
  const clamped = Math.max(0, Math.min(1, rawProgress));
  const eased = inOutExpoEase(clamped);

  const clipX = from.x + (to.x - from.x) * eased;
  const clipY = from.y + (to.y - from.y) * eased;
  const clipWidth = from.width + (to.width - from.width) * eased;
  const clipHeight = from.height + (to.height - from.height) * eased;
  const fromRx = from.rx ?? 0;
  const toRx = to.rx ?? 0;
  const clipRx = fromRx + (toRx - fromRx) * eased;

  // Bell-curve zoom swell peaking at mid-flight (matching Fl(b) spike in 28k.studio)
  const spike = Math.sin(Math.PI * clamped);
  const zoom = 1 + peakZoomBoost * spike;
  const imgWidth = clipWidth * zoom;
  const imgHeight = clipHeight * zoom;
  const imgX = clipX - (imgWidth - clipWidth) / 2;
  const imgY = clipY - (imgHeight - clipHeight) / 2;

  return {
    clipX,
    clipY,
    clipWidth,
    clipHeight,
    clipRx,
    imgX,
    imgY,
    imgWidth,
    imgHeight,
    eased,
  };
}

export type NavRouteId = 'home' | 'work' | 'studio' | 'methods';

/**
 * Computes exact SVG circle geometry for 28k.studio's inward-iris nav indicator
 * (`r = 7 - fill * 3.5`, `strokeWidth = fill * 7`), keeping the outer edge locked at 7px
 * while closing the inner pinhole from 7px -> 0px.
 */
export function computeNavIrisGeometry(fillProgress: number): {
  fill: number;
  r: number;
  strokeWidth: number;
  innerHoleRadius: number;
  outerEdgeRadius: number;
} {
  const fill = Math.max(0, Math.min(1, fillProgress));
  const r = Number((7 - fill * 3.5).toFixed(4));
  const strokeWidth = Number((fill * 7).toFixed(4));
  const innerHoleRadius = Number((r - strokeWidth / 2).toFixed(4));
  const outerEdgeRadius = Number((r + strokeWidth / 2).toFixed(4));
  return {
    fill,
    r,
    strokeWidth,
    innerHoleRadius,
    outerEdgeRadius,
  };
}

/**
 * Computes desktop navbar entrance delays matching BUiQNiHt.js:
 * baseDelay = 600ms (Ie = 0.6s), step = 80ms (mt = 0.08s), active disc offset = +350ms (vt = 0.35s).
 */
export function computeDesktopNavStaggerMs(
  itemIndex: number,
  baseDelayMs: number = 600,
  stepMs: number = 80,
  discOffsetMs: number = 350
): {
  ringAndLabelDelayMs: number;
  activeDiscDelayMs: number;
} {
  const idx = Math.max(0, Math.floor(itemIndex));
  const ringAndLabelDelayMs = baseDelayMs + idx * stepMs;
  return {
    ringAndLabelDelayMs,
    activeDiscDelayMs: ringAndLabelDelayMs + discOffsetMs,
  };
}

/**
 * Computes bottom-to-top row reveal delay for the mobile navigation sheet matching Ze in BUiQNiHt.js:
 * baseDelay = 450ms (Xe = 0.45s), rowStep = 50ms (Ye = 0.05s).
 */
export function computeMobileSheetRowDelayMs(
  bottomUpRowIndex: number,
  baseDelayMs: number = 450,
  stepMs: number = 50
): number {
  return baseDelayMs + Math.max(0, Math.floor(bottomUpRowIndex)) * stepMs;
}

export type RouteTransitionKind =
  | 'noop'
  | 'close-project-to-work'
  | 'home-to-work'
  | 'fade-to-work-intro'
  | 'fade-route';

/**
 * Resolves the authentic 28k.studio transition plan when clicking navbar links (DA in CdmLDXNu.js):
 * - Same route without open project -> noop
 * - Work -> Work while project modal is open -> reverse hero flight back to clock/index (820ms)
 * - Home -> Work -> HomeHero exit (460ms) into Work Latest riffle + 0.8s logo entrance
 * - Studio/Methods -> Work -> 380ms fade-in curtain + Work Latest intro riffle
 * - All other cross-route transitions (Work <-> Studio <-> Methods <-> Home) -> 400ms fade-in + 800ms fade-out (#141414 curtain below navbar)
 */
export function resolveRouteTransitionPlan(
  fromRoute: NavRouteId,
  toRoute: NavRouteId,
  hasOpenProject: boolean
): {
  kind: RouteTransitionKind;
  fadeInMs: number;
  fadeOutMs: number;
  totalTravelMs: number;
} {
  if (fromRoute === toRoute && !hasOpenProject) {
    return { kind: 'noop', fadeInMs: 0, fadeOutMs: 0, totalTravelMs: 0 };
  }

  if (fromRoute === 'work' && toRoute === 'work' && hasOpenProject) {
    return {
      kind: 'close-project-to-work',
      fadeInMs: 0,
      fadeOutMs: 0,
      totalTravelMs: 820,
    };
  }

  if (fromRoute === 'home' && toRoute === 'work') {
    return {
      kind: 'home-to-work',
      fadeInMs: 460,
      fadeOutMs: 0,
      totalTravelMs: 900,
    };
  }

  if (
    toRoute === 'work' &&
    (fromRoute === 'studio' || fromRoute === 'methods')
  ) {
    return {
      kind: 'fade-to-work-intro',
      fadeInMs: 400,
      fadeOutMs: 800,
      totalTravelMs: 1200,
    };
  }

  return {
    kind: 'fade-route',
    fadeInMs: 400,
    fadeOutMs: 800,
    totalTravelMs: 1200,
  };
}



