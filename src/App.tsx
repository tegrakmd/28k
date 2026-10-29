import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FEATURED_PROJECTS } from './data/projects';
import {
  resolveRouteTransitionPlan,
  wrapSlideIndex,
} from './utils/clockMath';
import { ActiveRoute, Navbar } from './components/Navbar';
import { ClockDial } from './components/ClockDial';
import { LatestView } from './components/LatestView';
import { IndexView, ZoomLevel } from './components/IndexView';
import { ViewSwitcher, WorkViewMode } from './components/ViewSwitcher';
import { ContactDrawer } from './components/ContactDrawer';
import {
  CaseStudyModal,
  ProjectOpenSession,
} from './components/CaseStudyModal';
import { StudioMethodsViews } from './components/StudioMethodsViews';
import { HomeHero } from './components/HomeHero';
import { CustomCursor } from './components/CustomCursor';

const SLIDE_DURATION_MS = 8500;

export default function App() {
  const skipIntro =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [activeRoute, setActiveRoute] = useState<ActiveRoute>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'home') return 'home';
      if (v === 'studio') return 'studio';
      if (v === 'methods') return 'methods';
    }
    return 'work';
  });
  const [navVisualRoute, setNavVisualRoute] =
    useState<ActiveRoute>(activeRoute);
  const [pageFadePhase, setPageFadePhase] = useState<
    'idle' | 'fading-in' | 'fading-out'
  >('idle');
  const [isNavTravelling, setIsNavTravelling] = useState(false);

  const [isHomeLeaving, setIsHomeLeaving] = useState(false);

  const [workMode, setWorkMode] = useState<WorkViewMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'index') return 'index';
    }
    return 'latest';
  });
  const [leavingWorkMode, setLeavingWorkMode] = useState<WorkViewMode | null>(
    null
  );

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [previewSlideIndex, setPreviewSlideIndex] = useState<number | null>(
    null
  );
  const [isIntroRunning, setIsIntroRunning] = useState<boolean>(
    () => !skipIntro && activeRoute === 'work' && workMode === 'latest'
  );
  const [introRiffleIdx, setIntroRiffleIdx] = useState<number>(0);

  const [slideProgress, setSlideProgress] = useState<number>(0.34);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(2);
  const [projectSession, setProjectSession] =
    useState<ProjectOpenSession | null>(null);
  const [isProjectClosing, setIsProjectClosing] = useState<boolean>(false);
  const [projectCloseSignal, setProjectCloseSignal] = useState<number>(0);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(() => new Date());

  const wheelLockRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);
  const viewSwitchTimerRef = useRef<number | null>(null);
  const homeLeaveTimerRef = useRef<number | null>(null);
  const pageFadeSwapTimerRef = useRef<number | null>(null);
  const pageFadeEndTimerRef = useRef<number | null>(null);
  const navTravelTimerRef = useRef<number | null>(null);

  const totalFeatured = FEATURED_PROJECTS.length;

  // Initial rapid project-riffle intro inside centered clock stage (matching sZG4feHa.js)
  useEffect(() => {
    if (!isIntroRunning) return;
    const sequence = [9, 7, 5, 3, 2, 1, 0];
    let step = 0;
    setIntroRiffleIdx(sequence[0]);

    const interval = window.setInterval(() => {
      step += 1;
      if (step < sequence.length) {
        setIntroRiffleIdx(sequence[step]);
      } else {
        window.clearInterval(interval);
        setIntroRiffleIdx(0);
        setIsIntroRunning(false);
      }
    }, 75);

    return () => window.clearInterval(interval);
  }, [isIntroRunning]);

  const goToSlide = useCallback(
    (nextIndex: number, initialProgress = 0.24) => {
      setPreviewSlideIndex(null);
      setActiveSlideIndex(wrapSlideIndex(nextIndex, totalFeatured));
      setSlideProgress(initialProgress);
    },
    [totalFeatured]
  );

  const stepSlide = useCallback(
    (delta: number) => {
      setPreviewSlideIndex(null);
      setActiveSlideIndex((prev) => wrapSlideIndex(prev + delta, totalFeatured));
      setSlideProgress(0.24);
    },
    [totalFeatured]
  );

  const handleSwitchWorkMode = useCallback(
    (nextMode: WorkViewMode) => {
      if (nextMode === workMode || leavingWorkMode) return;
      setPreviewSlideIndex(null);
      setLeavingWorkMode(workMode);
      setWorkMode(nextMode);
      if (viewSwitchTimerRef.current) {
        window.clearTimeout(viewSwitchTimerRef.current);
      }
      viewSwitchTimerRef.current = window.setTimeout(() => {
        setLeavingWorkMode(null);
        viewSwitchTimerRef.current = null;
      }, 520);
    },
    [workMode, leavingWorkMode]
  );

  const startTravelGuard = useCallback((durationMs: number) => {
    if (navTravelTimerRef.current) {
      window.clearTimeout(navTravelTimerRef.current);
      navTravelTimerRef.current = null;
    }
    if (durationMs <= 0) {
      setIsNavTravelling(false);
      return;
    }
    setIsNavTravelling(true);
    navTravelTimerRef.current = window.setTimeout(() => {
      setIsNavTravelling(false);
      navTravelTimerRef.current = null;
    }, durationMs);
  }, []);

  const handleEnterWorkFromHome = useCallback(() => {
    if (isHomeLeaving) return;
    setIsHomeLeaving(true);
    setNavVisualRoute('work');
    startTravelGuard(900);
    if (homeLeaveTimerRef.current) {
      window.clearTimeout(homeLeaveTimerRef.current);
    }
    homeLeaveTimerRef.current = window.setTimeout(() => {
      setIsHomeLeaving(false);
      setActiveRoute('work');
      setWorkMode('latest');
      setLeavingWorkMode(null);
      setIsIntroRunning(!skipIntro);
      homeLeaveTimerRef.current = null;
    }, 460);
  }, [isHomeLeaving, skipIntro, startTravelGuard]);

  const handleNavigateRoute = useCallback(
    (route: ActiveRoute) => {
      if (isNavTravelling) return;
      setIsContactOpen(false);
      setPreviewSlideIndex(null);

      const hasOpenProject = Boolean(projectSession && !isProjectClosing);
      const plan = resolveRouteTransitionPlan(
        activeRoute,
        route,
        hasOpenProject
      );

      if (plan.kind === 'noop') {
        if (route === 'work' && workMode === 'index') {
          handleSwitchWorkMode('latest');
        }
        return;
      }

      if (plan.kind === 'close-project-to-work') {
        setNavVisualRoute('work');
        startTravelGuard(plan.totalTravelMs);
        setProjectCloseSignal((s) => s + 1);
        return;
      }

      if (plan.kind === 'home-to-work') {
        handleEnterWorkFromHome();
        return;
      }

      // Authentic $0 page-fade curtain (0.4s outQuad in -> swap at peak -> 0.8s outCubic out)
      setNavVisualRoute(route);
      startTravelGuard(plan.totalTravelMs);
      setPageFadePhase('fading-in');

      if (pageFadeSwapTimerRef.current) {
        window.clearTimeout(pageFadeSwapTimerRef.current);
      }
      if (pageFadeEndTimerRef.current) {
        window.clearTimeout(pageFadeEndTimerRef.current);
      }

      pageFadeSwapTimerRef.current = window.setTimeout(() => {
        setProjectSession(null);
        setIsProjectClosing(false);
        setIsHomeLeaving(false);
        setLeavingWorkMode(null);
        setActiveRoute(route);

        if (plan.kind === 'fade-to-work-intro') {
          setWorkMode('latest');
          setIsIntroRunning(!skipIntro);
        }

        setPageFadePhase('fading-out');
        pageFadeSwapTimerRef.current = null;

        pageFadeEndTimerRef.current = window.setTimeout(() => {
          setPageFadePhase('idle');
          pageFadeEndTimerRef.current = null;
        }, plan.fadeOutMs);
      }, plan.fadeInMs);
    },
    [
      activeRoute,
      workMode,
      projectSession,
      isProjectClosing,
      isNavTravelling,
      skipIntro,
      handleSwitchWorkMode,
      handleEnterWorkFromHome,
      startTravelGuard,
    ]
  );

  useEffect(() => {
    return () => {
      if (viewSwitchTimerRef.current)
        window.clearTimeout(viewSwitchTimerRef.current);
      if (homeLeaveTimerRef.current)
        window.clearTimeout(homeLeaveTimerRef.current);
      if (pageFadeSwapTimerRef.current)
        window.clearTimeout(pageFadeSwapTimerRef.current);
      if (pageFadeEndTimerRef.current)
        window.clearTimeout(pageFadeEndTimerRef.current);
      if (navTravelTimerRef.current)
        window.clearTimeout(navTravelTimerRef.current);
    };
  }, []);

  // Sync URL query parameter (?view=index / ?view=home / ?view=studio / ?view=methods) cleanly while preserving ?autostart
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (activeRoute === 'home') {
      url.searchParams.set('view', 'home');
    } else if (activeRoute === 'studio') {
      url.searchParams.set('view', 'studio');
    } else if (activeRoute === 'methods') {
      url.searchParams.set('view', 'methods');
    } else if (activeRoute === 'work' && workMode === 'index') {
      url.searchParams.set('view', 'index');
    } else {
      url.searchParams.delete('view');
    }
    window.history.replaceState({}, '', url.toString());
  }, [activeRoute, workMode]);

  // Update live studio clock & carousel progress smoothly
  useEffect(() => {
    let lastTs = performance.now();
    let rafId = 0;

    const tick = (ts: number) => {
      const dt = Math.min(100, ts - lastTs);
      lastTs = ts;

      setNow(new Date());

      const isLatestAutoPlay =
        activeRoute === 'work' &&
        workMode === 'latest' &&
        !leavingWorkMode &&
        !isIntroRunning &&
        previewSlideIndex === null &&
        !projectSession &&
        !isContactOpen;

      if (isLatestAutoPlay) {
        setSlideProgress((prev) => {
          const next = prev + dt / SLIDE_DURATION_MS;
          if (next >= 1) {
            setActiveSlideIndex((idx) => wrapSlideIndex(idx + 1, totalFeatured));
            return 0.02;
          }
          return next;
        });
      }
    };

    const intervalId = window.setInterval(() => {
      rafId = window.requestAnimationFrame(tick);
    }, 60);

    return () => {
      window.clearInterval(intervalId);
      window.cancelAnimationFrame(rafId);
    };
  }, [
    activeRoute,
    workMode,
    leavingWorkMode,
    isIntroRunning,
    previewSlideIndex,
    projectSession,
    isContactOpen,
    totalFeatured,
  ]);

  // Wheel & Touch navigation in Work -> Latest view
  useEffect(() => {
    if (
      activeRoute !== 'work' ||
      workMode !== 'latest' ||
      isIntroRunning ||
      projectSession ||
      isContactOpen
    ) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      const absY = Math.abs(e.deltaY);
      const absX = Math.abs(e.deltaX);
      const primaryDelta = absY >= absX ? e.deltaY : e.deltaX;
      if (Math.abs(primaryDelta) < 18) return;

      const nowMs = Date.now();
      if (nowMs - wheelLockRef.current < 520) return;
      wheelLockRef.current = nowMs;

      stepSlide(primaryDelta > 0 ? 1 : -1);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartYRef.current === null) return;
      const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;
      const diff = touchStartYRef.current - endY;
      touchStartYRef.current = null;
      if (Math.abs(diff) > 40) {
        stepSlide(diff > 0 ? 1 : -1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    activeRoute,
    workMode,
    isIntroRunning,
    projectSession,
    isContactOpen,
    stepSlide,
  ]);

  // Global Keyboard Navigation (Arrows, Space to toggle Latest/Index; SidePanel & CaseStudyModal handle their own animated Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isContactOpen || projectSession) return;

      if (activeRoute === 'work') {
        if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) {
          e.preventDefault();
          handleSwitchWorkMode(workMode === 'latest' ? 'index' : 'latest');
          return;
        }

        if (workMode === 'latest' && !isIntroRunning) {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            stepSlide(1);
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            stepSlide(-1);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeRoute,
    workMode,
    isIntroRunning,
    isContactOpen,
    projectSession,
    stepSlide,
    handleSwitchWorkMode,
  ]);

  const displayedSlideIndex = isIntroRunning
    ? introRiffleIdx
    : previewSlideIndex ?? activeSlideIndex;

  const displayedProgress =
    previewSlideIndex !== null ? 0.18 : slideProgress;

  const isProjectActivelyExpanded = Boolean(
    projectSession && !isProjectClosing
  );
  const showDialRing =
    activeRoute === 'work' &&
    workMode === 'latest' &&
    !isProjectActivelyExpanded;
  const showLatestLayer =
    activeRoute === 'work' &&
    (workMode === 'latest' || leavingWorkMode === 'latest');
  const showIndexLayer =
    activeRoute === 'work' &&
    (workMode === 'index' || leavingWorkMode === 'index');

  return (
    <div className="relative min-h-screen w-full select-none">
      {/* Top Fixed mix-blend-difference Navigation */}
      <Navbar
        activeRoute={navVisualRoute}
        isContactOpen={isContactOpen}
        isTravelling={isNavTravelling}
        skipIntro={skipIntro}
        now={now}
        onNavigate={handleNavigateRoute}
        onOpenContact={() => setIsContactOpen((prev) => !prev)}
      />

      {/* Authentic 28k.studio $0 Cross-Route Fade Curtain (z-index 98, strictly below Navbar z-100) */}
      {pageFadePhase !== 'idle' && (
        <div
          className={`k28-page-fade k28-page-fade-${pageFadePhase}`}
          aria-hidden="true"
        />
      )}

      <main className="relative min-h-screen w-full">
        {/* Centered 720x720 mix-blend-difference Studio Clock */}
        <ClockDial
          projects={FEATURED_PROJECTS}
          activeIndex={displayedSlideIndex}
          slideProgress={displayedProgress}
          showDialRing={showDialRing}
          isProjectOpen={isProjectActivelyExpanded}
          skipIntro={skipIntro}
          now={now}
          onPreviewProject={(idx) => {
            if (!isIntroRunning) setPreviewSlideIndex(idx);
          }}
          onSelectProject={(idx) => goToSlide(idx, 0.24)}
        />

        {/* Primary Route Content */}
        {activeRoute === 'home' ? (
          <HomeHero
            isLeaving={isHomeLeaving}
            onEnterWork={handleEnterWorkFromHome}
          />
        ) : activeRoute === 'work' ? (
          <>
            {showLatestLayer && (
              <LatestView
                projects={FEATURED_PROJECTS}
                activeIndex={displayedSlideIndex}
                now={now}
                isIntroRunning={isIntroRunning}
                isLeavingView={leavingWorkMode === 'latest'}
                isProjectExpanded={isProjectActivelyExpanded}
                onOpenProject={(proj, originRect) => {
                  setIsProjectClosing(false);
                  setProjectSession({
                    project: proj,
                    originRect,
                    originSource: 'latest',
                    initialImage: proj.heroImage,
                  });
                }}
              />
            )}

            {showIndexLayer && (
              <IndexView
                zoomLevel={zoomLevel}
                isLeavingView={leavingWorkMode === 'index'}
                onChangeZoom={setZoomLevel}
                onOpenProject={(proj, originRect, cardId, initialImage) => {
                  setIsProjectClosing(false);
                  setProjectSession({
                    project: proj,
                    originRect,
                    originSource: 'index',
                    originCardId: cardId,
                    initialImage,
                  });
                }}
              />
            )}

            <ViewSwitcher
              mode={workMode}
              isHidden={isProjectActivelyExpanded}
              onChange={handleSwitchWorkMode}
            />
          </>
        ) : (
          <StudioMethodsViews
            variant={activeRoute}
            onOpenContact={() => setIsContactOpen(true)}
            onBackToWork={() => handleNavigateRoute('work')}
          />
        )}
      </main>

      {/* Project Case Study Detail Modal with Hero Media Flight & Project Info SidePanel */}
      <CaseStudyModal
        session={projectSession}
        externalCloseSignal={projectCloseSignal}
        onClosingChange={setIsProjectClosing}
        onCloseComplete={() => {
          setProjectSession(null);
          setIsProjectClosing(false);
        }}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Slide-Over Off-White Contact Drawer */}
      <ContactDrawer
        isOpen={isContactOpen}
        now={now}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Authentic 75x75 mix-blend-difference Lagged Circle & Morphing Icon Cursor */}
      <CustomCursor />
    </div>
  );
}
