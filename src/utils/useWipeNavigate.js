import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook that triggers a wipe overlay transition before navigating.
 * @param {'ltr'|'rtl'} direction - 'ltr' = left-to-right, 'rtl' = right-to-left
 * @returns { wipeNavigate, wipeOverlay }
 *   - wipeNavigate(path): call this instead of navigate()
 *   - wipeOverlay: JSX element to render in your component
 */
export function useWipeNavigate() {
  const navigate = useNavigate();
  const [wipe, setWipe] = useState(null); // { direction, key }

  const wipeNavigate = useCallback((path, direction = 'ltr') => {
    setWipe({ direction, key: Date.now() });
    // Navigate at the midpoint of the wipe (when screen is fully covered)
    setTimeout(() => {
      navigate(path);
    }, 320);
    // Clean up overlay after animation completes
    setTimeout(() => {
      setWipe(null);
    }, 750);
  }, [navigate]);

  const wipeOverlay = wipe ? (
    <div
      key={wipe.key}
      className={`page-wipe-overlay wipe-${wipe.direction}`}
    />
  ) : null;

  return { wipeNavigate, wipeOverlay };
}
