import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.12;
const DEFAULT_ZOOM = 0.85;

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export default function OrgChartViewport({ children, legend = null, printTitle = 'Organization chart' }) {
  const shellRef = useRef(null);
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const printSnapshotRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const zoomAtPoint = useCallback((anchorX, anchorY, getNextZoom) => {
    setZoom((prevZoom) => {
      const nextZoom = clampZoom(getNextZoom(prevZoom));
      if (nextZoom === prevZoom) return prevZoom;
      const ratio = nextZoom / prevZoom;
      setPan((prevPan) => ({
        x: anchorX - ratio * (anchorX - prevPan.x),
        y: anchorY - ratio * (anchorY - prevPan.y),
      }));
      return nextZoom;
    });
  }, []);

  const zoomBy = useCallback((delta) => {
    const el = viewportRef.current;
    const anchorX = el ? el.clientWidth / 2 : 0;
    const anchorY = el ? el.clientHeight / 2 : 0;
    zoomAtPoint(anchorX, anchorY, (z) => z + delta);
  }, [zoomAtPoint]);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(DEFAULT_ZOOM);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;

    const onWheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const anchorX = e.clientX - rect.left;
      const anchorY = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      zoomAtPoint(anchorX, anchorY, (z) => z + delta);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAtPoint]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const restoreAfterPrint = () => {
      const snap = printSnapshotRef.current;
      if (!snap) return;
      setPan(snap.pan);
      setZoom(snap.zoom);
      printSnapshotRef.current = null;
    };
    window.addEventListener('afterprint', restoreAfterPrint);
    return () => window.removeEventListener('afterprint', restoreAfterPrint);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = shellRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      /* ignore unsupported */
    }
  }, []);

  const handlePrint = useCallback(() => {
    printSnapshotRef.current = { pan, zoom };
    setPan({ x: 0, y: 0 });
    setZoom(1);
    window.requestAnimationFrame(() => {
      window.print();
    });
  }, [pan, zoom]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.org-chart-viewport__controls')) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
      pointerId: e.pointerId,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    setPan({
      x: drag.originX + (e.clientX - drag.startX),
      y: drag.originY + (e.clientY - drag.startY),
    });
  };

  const endDrag = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (e.pointerId != null && drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(drag.pointerId);
    } catch {
      /* ignore */
    }
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      ref={shellRef}
      className={`org-chart-fs-root${isFullscreen ? ' org-chart-fs-root--active' : ''}`}
    >
      <div className="org-chart-fs-print-header">
        <h2 className="org-chart-fs-print-title">{printTitle}</h2>
        <p className="org-chart-fs-print-date">
          {new Date().toLocaleString()}
        </p>
      </div>

      {legend ? <div className="org-chart-fs-legend">{legend}</div> : null}

      <div
        ref={viewportRef}
        className={`org-chart-viewport${dragging ? ' org-chart-viewport--dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="org-chart-viewport__controls" role="toolbar" aria-label="Chart view">
          <div className="org-chart-viewport__controls-group">
            <button
              type="button"
              className="org-chart-zoom-btn"
              onClick={() => zoomBy(ZOOM_STEP)}
              title="Zoom in"
              aria-label="Zoom in"
            >
              +
            </button>
            <span className="org-chart-zoom-level" aria-live="polite">{zoomPercent}%</span>
            <button
              type="button"
              className="org-chart-zoom-btn"
              onClick={() => zoomBy(-ZOOM_STEP)}
              title="Zoom out"
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              className="org-chart-zoom-btn org-chart-zoom-btn--reset"
              onClick={resetView}
              title="Reset view"
              aria-label="Reset view"
            >
              ⟲
            </button>
          </div>
          <div className="org-chart-viewport__controls-divider" aria-hidden="true" />
          <div className="org-chart-viewport__controls-group">
            <button
              type="button"
              className="org-chart-zoom-btn org-chart-zoom-btn--text"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullscreen ? 'Exit' : 'Full screen'}
            </button>
            {isFullscreen ? (
              <button
                type="button"
                className="org-chart-zoom-btn org-chart-zoom-btn--text org-chart-zoom-btn--print"
                onClick={handlePrint}
                title="Print chart"
                aria-label="Print chart"
              >
                Print
              </button>
            ) : null}
          </div>
        </div>
        <p className="org-chart-viewport__hint">Drag to pan · Ctrl + scroll to zoom</p>
        <div
          className="org-chart-viewport__stage"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
