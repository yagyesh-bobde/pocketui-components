import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, type StyleProp, type TextStyle } from 'react-native';

export interface AnimatedTextProps {
  text: string;
  /** Typography applied to the text, including font size, weight, and color. */
  style?: StyleProp<TextStyle>;
  testID?: string;
}

/** Start static, respect live accessibility changes, and stop motion in the background. */
export function useTextMotion(): boolean {
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
