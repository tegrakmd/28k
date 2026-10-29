import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseHexColor,
  getCtaForegroundColor,
  calculateStudioDayCount,
  formatTodayDisplay,
  formatOfficeClock,
  buildClockArcPath,
  generateClockMinorTickAngles,
  wrapSlideIndex,
  shortestAngleDelta,
  buildIndexGridSequence,
  computeCounterSlotTarget,
  stepContinuousAngle,
  computeCenterOutwardStaggerBucket,
  inOutExpoEase,
  interpolateFlightFrame,
  computeNavIrisGeometry,
  computeDesktopNavStaggerMs,
  computeMobileSheetRowDelayMs,
  resolveRouteTransitionPlan,
} from './clockMath';

test('parseHexColor handles standard 6-digit, 3-digit, and 7-digit CMS hex typos', () => {
  assert.deepEqual(parseHexColor('#EEEEEE'), { r: 238, g: 238, b: 238 });
  assert.deepEqual(parseHexColor('#fff'), { r: 255, g: 255, b: 255 });
  assert.deepEqual(parseHexColor('#FFFFFFF'), { r: 255, g: 255, b: 255 });
});

test('getCtaForegroundColor picks dark text for bright yellow/lime CTAs and white for dark/saturated CTAs', () => {
  assert.equal(getCtaForegroundColor('#FFF414'), '#1F1F1F'); // ON.Energy yellow
  assert.equal(getCtaForegroundColor('#B4FE00'), '#1F1F1F'); // Hut 8 lime
  assert.equal(getCtaForegroundColor('#333333'), '#FFFFFF'); // Dumpling.FM dark grey
  assert.equal(getCtaForegroundColor('#0171E4'), '#FFFFFF'); // Augen Pro blue
  assert.equal(getCtaForegroundColor('#E10523'), '#FFFFFF'); // ESPN Ovechkin red
});

test('calculateStudioDayCount matches 28k.studio founding date (2022-02-22 -> Oct 29 2026 = 1710)', () => {
  const oct29 = new Date(2026, 9, 29, 12, 0, 0);
  assert.equal(calculateStudioDayCount(oct29), 1710);
});

test('formatTodayDisplay abbreviates months > 3 chars with period and keeps MAY without period', () => {
  const oct29 = new Date(2026, 9, 29, 12, 0, 0);
  const formattedOct = formatTodayDisplay(oct29);
  assert.equal(formattedOct.weekday, 'THU');
  assert.equal(formattedOct.monthDay, 'OCT. 29');
  assert.equal(formattedOct.dayLabel, 'DAY 1710');

  const may5 = new Date(2026, 4, 5, 12, 0, 0);
  assert.equal(formatTodayDisplay(may5).monthDay, 'MAY 5');
});

test('formatOfficeClock formats 24h time and CET/CEST or EST/EDT labels', () => {
  const winterUtc = new Date('2026-01-15T14:30:00Z');
  const cphWinter = formatOfficeClock(winterUtc, 'Europe/Copenhagen');
  const torWinter = formatOfficeClock(winterUtc, 'America/Toronto');
  assert.equal(cphWinter.time, '15:30');
  assert.equal(cphWinter.zone, 'CET');
  assert.equal(torWinter.time, '09:30');
  assert.equal(torWinter.zone, 'EST');

  const summerUtc = new Date('2026-07-15T14:30:00Z');
  assert.equal(formatOfficeClock(summerUtc, 'Europe/Copenhagen').zone, 'CEST');
  assert.equal(formatOfficeClock(summerUtc, 'America/Toronto').zone, 'EDT');
});

test('buildClockArcPath returns empty string for zero span and valid SVG arc for positive span', () => {
  assert.equal(buildClockArcPath(360, 360, 342.5, 0, 0), '');
  const arc = buildClockArcPath(360, 360, 342.5, 0, 32.7273);
  assert.ok(arc.startsWith('M 360 17.5 A 342.5 342.5 0 0 1 '));
});

test('generateClockMinorTickAngles skips ticks colliding with the 11 project indicators', () => {
  const ticks = generateClockMinorTickAngles(11, 3, 2.6);
  // 0deg is indicator #0, so 0deg must be excluded
  assert.equal(ticks.includes(0), false);
  // 3deg is >= 2.6deg away from 0deg, so 3deg is included
  assert.equal(ticks.includes(3), true);
  assert.ok(ticks.length > 95 && ticks.length < 120);
});

test('wrapSlideIndex and shortestAngleDelta wrap cleanly across 0/11 and 0/360 boundaries', () => {
  assert.equal(wrapSlideIndex(-1, 11), 10);
  assert.equal(wrapSlideIndex(11, 11), 0);
  assert.equal(shortestAngleDelta(350, 10), 20);
  assert.equal(shortestAngleDelta(10, 350), -20);
});

test('buildIndexGridSequence inserts year headers and 2 placeholders on subsequent year transitions', () => {
  const sample = [
    { id: 'a1', shortYear: '26' },
    { id: 'a2', shortYear: '26' },
    { id: 'b1', shortYear: '25' },
  ];
  const seq = buildIndexGridSequence(sample);
  assert.equal(seq.length, 6);
  assert.equal(seq[0].kind, 'asset');
  assert.equal(seq[2].kind, 'year');
  assert.equal(seq[2].shortYear, '25');
  assert.equal(seq[3].kind, 'placeholder');
  assert.equal(seq[4].kind, 'placeholder');
  assert.equal(seq[5].kind, 'asset');
});

test('computeCounterSlotTarget takes shortest wrap path across 11 -> 01 and 01 -> 11', () => {
  const forwardWrap = computeCounterSlotTarget(10, 0, 11);
  // 10 is at middle slot 21; stepping +1 wraps forward to slot 22 ('01' in 3rd copy), then normalizes to 11
  assert.equal(forwardWrap.fromSlot, 21);
  assert.equal(forwardWrap.toSlot, 22);
  assert.equal(forwardWrap.normalizedSlot, 11);

  const backwardWrap = computeCounterSlotTarget(0, 10, 11);
  // 0 is at middle slot 11; stepping -1 wraps backward to slot 10 ('11' in 1st copy), then normalizes to 21
  assert.equal(backwardWrap.fromSlot, 11);
  assert.equal(backwardWrap.toSlot, 10);
  assert.equal(backwardWrap.normalizedSlot, 21);
});

test('stepContinuousAngle and computeCenterOutwardStaggerBucket behave monotonically', () => {
  // From 350deg toward 10deg with 0.5 factor -> steps +10deg to 360deg (not backwards to 180deg)
  assert.equal(stepContinuousAngle(350, 10, 0.5), 360);
  // Outer columns (col 0, col 3) start slightly before inner columns (col 1, col 2) on row 0
  assert.equal(computeCenterOutwardStaggerBucket(0, 4), 0);
  assert.equal(computeCenterOutwardStaggerBucket(1, 4), 1);
  assert.equal(computeCenterOutwardStaggerBucket(4, 4), 2);
});

test('inOutExpoEase and interpolateFlightFrame match exact source/target rects at endpoints with mid-flight swell', () => {
  assert.equal(inOutExpoEase(0), 0);
  assert.equal(inOutExpoEase(0.5), 0.5);
  assert.equal(inOutExpoEase(1), 1);

  const from = { x: 336, y: 194, width: 768, height: 512, rx: 0 };
  const to = { x: 0, y: 0, width: 1440, height: 900, rx: 0 };

  const start = interpolateFlightFrame(from, to, 0, 0.05);
  assert.equal(start.clipX, 336);
  assert.equal(start.clipY, 194);
  assert.equal(start.clipWidth, 768);
  assert.equal(start.imgWidth, 768);

  const mid = interpolateFlightFrame(from, to, 0.5, 0.05);
  assert.equal(mid.clipX, 168);
  assert.equal(mid.clipY, 97);
  assert.equal(mid.clipWidth, 1104);
  // Mid-flight image width swells by 5% around clip center
  assert.ok(mid.imgWidth > mid.clipWidth);
  assert.equal(
    Number((mid.imgX + mid.imgWidth / 2).toFixed(2)),
    Number((mid.clipX + mid.clipWidth / 2).toFixed(2))
  );

  const end = interpolateFlightFrame(from, to, 1, 0.05);
  assert.equal(end.clipX, 0);
  assert.equal(end.clipY, 0);
  assert.equal(end.clipWidth, 1440);
  assert.equal(end.clipHeight, 900);
  assert.ok(Math.abs(end.imgWidth - 1440) < 0.001);
});

test('computeNavIrisGeometry closes aperture inward from 7px rim to 0px pinhole while keeping outer edge at 7px', () => {
  const empty = computeNavIrisGeometry(0);
  assert.equal(empty.r, 7);
  assert.equal(empty.strokeWidth, 0);
  assert.equal(empty.innerHoleRadius, 7);
  assert.equal(empty.outerEdgeRadius, 7);

  const half = computeNavIrisGeometry(0.5);
  assert.equal(half.r, 5.25);
  assert.equal(half.strokeWidth, 3.5);
  assert.equal(half.innerHoleRadius, 3.5);
  assert.equal(half.outerEdgeRadius, 7);

  const full = computeNavIrisGeometry(1);
  assert.equal(full.r, 3.5);
  assert.equal(full.strokeWidth, 7);
  assert.equal(full.innerHoleRadius, 0);
  assert.equal(full.outerEdgeRadius, 7);
});

test('computeDesktopNavStaggerMs and computeMobileSheetRowDelayMs match BUiQNiHt.js timings', () => {
  const workStagger = computeDesktopNavStaggerMs(0);
  const contactStagger = computeDesktopNavStaggerMs(3);
  assert.equal(workStagger.ringAndLabelDelayMs, 600);
  assert.equal(workStagger.activeDiscDelayMs, 950);
  assert.equal(contactStagger.ringAndLabelDelayMs, 840);
  assert.equal(contactStagger.activeDiscDelayMs, 1190);

  assert.equal(computeMobileSheetRowDelayMs(0), 450);
  assert.equal(computeMobileSheetRowDelayMs(5), 700);
});

test('resolveRouteTransitionPlan selects authentic 28k.studio route transition strategies', () => {
  assert.equal(resolveRouteTransitionPlan('work', 'work', false).kind, 'noop');
  assert.equal(
    resolveRouteTransitionPlan('work', 'work', true).kind,
    'close-project-to-work'
  );
  assert.equal(
    resolveRouteTransitionPlan('home', 'work', false).kind,
    'home-to-work'
  );
  assert.equal(
    resolveRouteTransitionPlan('studio', 'work', false).kind,
    'fade-to-work-intro'
  );
  const studioPlan = resolveRouteTransitionPlan('work', 'studio', false);
  assert.equal(studioPlan.kind, 'fade-route');
  assert.equal(studioPlan.fadeInMs, 400);
  assert.equal(studioPlan.fadeOutMs, 800);
  assert.equal(studioPlan.totalTravelMs, 1200);
});



