import React, { useMemo } from 'react';
import {
  ALL_PROJECTS,
  INDEX_ARCHIVE_ASSETS,
  IndexArchiveAsset,
  ProjectData,
} from '../data/projects';
import {
  buildIndexGridSequence,
  computeCenterOutwardStaggerBucket,
  FlightRect,
} from '../utils/clockMath';
import { PlusIcon, MinusIcon } from './Icons';

export type ZoomLevel = 1 | 2 | 3;

interface IndexViewProps {
  zoomLevel: ZoomLevel;
  isLeavingView?: boolean;
  onChangeZoom: (zoom: ZoomLevel) => void;
  onOpenProject: (
    project: ProjectData,
    originRect: FlightRect | null,
    cardId?: string,
    initialImage?: string
  ) => void;
}

export function IndexView({
  zoomLevel,
  isLeavingView = false,
  onChangeZoom,
  onOpenProject,
}: IndexViewProps) {
  const sequence = useMemo(
    () => buildIndexGridSequence<IndexArchiveAsset>(INDEX_ARCHIVE_ASSETS),
    []
  );

  const firstYear = INDEX_ARCHIVE_ASSETS[0]?.shortYear ?? '26';
  const columnsPerRow = zoomLevel === 1 ? 6 : zoomLevel === 3 ? 3 : 4;

  const handleCardClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    asset: IndexArchiveAsset
  ) => {
    const found = ALL_PROJECTS.find((p) => p.slug === asset.projectSlug);
    if (!found) return;
    const mediaEl = e.currentTarget.querySelector('.k28-asset-media');
    const b = mediaEl?.getBoundingClientRect();
    const rect: FlightRect | null =
      b && b.width > 0 && b.height > 0
        ? { x: b.left, y: b.top, width: b.width, height: b.height, rx: 0 }
        : null;
    onOpenProject(found, rect, asset.id, asset.image);
  };

  let visibleCardCounter = 0;

  return (
    <section
      className={`k28-index-scroll k28-archive-zoom-${zoomLevel} ${
        isLeavingView ? 'is-leaving' : 'is-entering'
      }`}
      aria-label="Project archive index"
      data-zoom={zoomLevel}
    >
      {/* Fixed mix-blend-difference Zoom + / - Controls */}
      <div className="k28-zoom-controls" role="group" aria-label="Archive grid zoom">
        <button
          type="button"
          className="k28-zoom-btn"
          data-cursor="active"
          aria-label="Zoom in archive grid"
          disabled={zoomLevel >= 3}
          onClick={() =>
            onChangeZoom(Math.min(3, zoomLevel + 1) as ZoomLevel)
          }
        >
          <PlusIcon />
        </button>
        <button
          type="button"
          className="k28-zoom-btn"
          data-cursor="active"
          aria-label="Zoom out archive grid"
          disabled={zoomLevel <= 1}
          onClick={() =>
            onChangeZoom(Math.max(1, zoomLevel - 1) as ZoomLevel)
          }
        >
          <MinusIcon />
        </button>
      </div>

      {/* First Year Hero Numeral ('26') with Masked Line Reveal */}
      <h1 className="k28-index-year k28-index-year-first">
        <span className="k28-reveal-mask">
          <span
            className={`block ${
              isLeavingView ? 'k28-reveal-line-out' : 'k28-reveal-line-in'
            }`}
          >
            {firstYear}
          </span>
        </span>
      </h1>

      {/* 12-Column Archive Grid with Row-by-Row Center-Outward Stagger */}
      <div key={`zoom-grid-${zoomLevel}`} className="k28-grid k28-index-items k28-zoom-fade">
        {sequence.map((entry) => {
          if (entry.kind === 'year') {
            return (
              <div key={entry.key} className="k28-index-item pt-8 md:pt-12">
                <h2 className="m-0 k28-index-year">
                  <span className="k28-reveal-mask">
                    <span
                      className={`block ${
                        isLeavingView ? 'k28-reveal-line-out' : 'k28-reveal-line-in'
                      }`}
                    >
                      {entry.shortYear}
                    </span>
                  </span>
                </h2>
              </div>
            );
          }

          if (entry.kind === 'placeholder') {
            return (
              <div
                key={entry.key}
                className="k28-index-item k28-index-placeholder"
                aria-hidden="true"
              />
            );
          }

          const asset = entry.asset!;
          const cardIdx = visibleCardCounter++;
          const staggerBucket = computeCenterOutwardStaggerBucket(
            cardIdx,
            columnsPerRow
          );
          const isOliveOnEnergy =
            asset.projectSlug === 'on-energy' && asset.indexNumber === '2.0';

          return (
            <div
              key={entry.key}
              className={`k28-index-item k28-index-card-anim k28-stagger-${staggerBucket}`}
              data-project={asset.projectSlug}
              data-card-id={asset.id}
            >
              <button
                type="button"
                className="k28-asset-card"
                data-cursor-icon="plus"
                aria-label={`${asset.projectTitle} asset ${asset.indexNumber}`}
                onClick={(e) => handleCardClick(e, asset)}
              >
                <div className="k28-asset-head">
                  {asset.isFirstOfProject && (
                    <span className="k28-asset-title">{asset.projectTitle}</span>
                  )}
                  <span className="k28-asset-num">{asset.indexNumber}</span>
                </div>

                {asset.variant === 'brand-tile' ? (
                  <div
                    className={`k28-asset-media k28-asset-brand-tile ${
                      isOliveOnEnergy ? 'is-olive-dark' : ''
                    }`}
                  >
                    <span className="text-[clamp(18px,2vw,30px)] font-semibold tracking-[-0.03em] leading-none">
                      {asset.markText}
                    </span>
                    <span className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] opacity-70">
                      {asset.markSubtext}
                    </span>
                  </div>
                ) : asset.variant === 'inset' ? (
                  <div className="k28-asset-media k28-asset-media-inset">
                    <img
                      src={asset.image}
                      alt={`${asset.projectTitle} ${asset.indexNumber}`}
                      loading="lazy"
                      className="k28-asset-media-img"
                    />
                  </div>
                ) : (
                  <div className="k28-asset-media">
                    <img
                      src={asset.image}
                      alt={`${asset.projectTitle} ${asset.indexNumber}`}
                      loading="lazy"
                      className="k28-asset-media-img"
                    />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
