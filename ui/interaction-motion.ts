import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';

/** No animation until the preference is known; pause loops while the app is inactive. */
export function useInteractionMotion(): boolean {
  const [reduced, setReduced] = useState(true);
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    let mounted = true;
    let changed = false;
    const preference = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      changed = true;
      setReduced(value);
    });
    const app = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (mounted && !changed) setReduced(value);
      },
      () => {},
    );
    return () => {
      mounted = false;
      preference.remove();
      app.remove();
    };
  }, []);
  return active && !reduced;
}
