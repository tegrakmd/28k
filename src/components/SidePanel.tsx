import React, { useEffect, useRef, useState } from 'react';
import { CloseThinIcon, Logo28K } from './Icons';

export type SidePanelPhase = 'closed' | 'opening' | 'open' | 'closing';

interface SidePanelProps {
  visible: boolean;
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}

const OPEN_DURATION_MS = 1190;
const CLOSE_DURATION_MS = 250;

export function SidePanel({
  visible,
  label,
  onClose,
  children,
}: SidePanelProps) {
  const [phase, setPhase] = useState<SidePanelPhase>(() =>
    visible ? 'opening' : 'closed'
  );

  useEffect(() => {
    if (visible) {
      setPhase('opening');
      const timer = window.setTimeout(() => {
        setPhase('open');
      }, OPEN_DURATION_MS);
      return () => window.clearTimeout(timer);
    } else {
      setPhase((prev) => (prev === 'closed' ? 'closed' : 'closing'));
    }
  }, [visible]);

  useEffect(() => {
    if (phase !== 'closing') return;
    const timer = window.setTimeout(() => {
      setPhase('closed');
    }, CLOSE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible) return;
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [visible]);

  const effectivePhase: SidePanelPhase = visible
    ? phase === 'closed' || phase === 'closing'
      ? 'opening'
      : phase
    : phase === 'opening' || phase === 'open'
    ? 'closing'
    : phase;

  if (effectivePhase === 'closed') return null;

  return (
    <aside className="k28-sidepanel-root" aria-hidden={!visible}>
      <div
        className={`k28-sidepanel k28-sidepanel-${effectivePhase}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        {/* Translucent Dark Backdrop (1.19s inOutCubic fade in, 0.25s fade out; cursor morphs to close X) */}
        <button
          type="button"
          className="k28-sidepanel-backdrop"
          aria-label={`Close ${label}`}
          data-cursor-icon="close"
          onClick={onClose}
        />

        {/* Scrollable Sheet Stage */}
        <div className="k28-sidepanel-scroll">
          <div className="k28-sidepanel-container">
            <div className="k28-sidepanel-inner">
              {/* Off-white #FDFDF9 background layer wiping 101% -> 0% over 1.19s inOutExpo */}
              <div className="k28-sidepanel-sheet-bg" aria-hidden="true" />

              {/* Stationary Held Content Layer with Cascading Rule Draws & Line Reveals */}
              <div className="k28-sidepanel-held">
                {/* Mobile Header Row (28K mark + frosted close button) & Desktop Top-Right Close Button */}
                <div className="flex items-center justify-between md:justify-end mb-6 md:mb-2">
                  <div
                    className="w-[6.1333vw] min-w-[24px] text-[#1F1F1F] md:hidden"
                    aria-hidden="true"
                  >
                    <Logo28K />
                  </div>
                  <button
                    type="button"
                    aria-label={`Close ${label}`}
                    data-cursor="active"
                    onClick={onClose}
                    className="k28-sidepanel-close-btn"
                  >
                    <span className="w-4 h-4 k28-icon-wipe">
                      <CloseThinIcon className="k28-icon-out" />
                      <CloseThinIcon className="k28-icon-in" />
                    </span>
                  </button>
                </div>

                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
