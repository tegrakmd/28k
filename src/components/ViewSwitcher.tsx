import React from 'react';

export type WorkViewMode = 'latest' | 'index';

interface ViewSwitcherProps {
  mode: WorkViewMode;
  isHidden?: boolean;
  onChange: (mode: WorkViewMode) => void;
}

export function ViewSwitcher({
  mode,
  isHidden = false,
  onChange,
}: ViewSwitcherProps) {
  return (
    <div
      className={`k28-view-switcher ${isHidden ? 'is-hidden' : ''}`}
      role="group"
      aria-label="Switch work view"
    >
      <div className="k28-view-switcher-bg" />
      <button
        type="button"
        className={`k28-view-switcher-btn ${mode === 'latest' ? 'is-active' : ''}`}
        aria-pressed={mode === 'latest'}
        onClick={() => onChange('latest')}
      >
        <span className="k28-view-switcher-label">Latest</span>
      </button>
      <button
        type="button"
        className={`k28-view-switcher-btn ${mode === 'index' ? 'is-active' : ''}`}
        aria-pressed={mode === 'index'}
        onClick={() => onChange('index')}
      >
        <span className="k28-view-switcher-label">Index</span>
      </button>
    </div>
  );
}
