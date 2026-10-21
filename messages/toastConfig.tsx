import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { AccessibilityInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { restoreActiveToast, TOAST_DURATION } from './toast';

function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}

export function ToastRoot() {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    restoreActiveToast();
    return () => {
      requestAnimationFrame(restoreActiveToast);
    };
  }, []);
  return (
    <Toast
      position="top"
      topOffset={insets.top + 12}
      visibilityTime={TOAST_DURATION}
      animationConfig={reducedMotion ? { type: 'timing', duration: 0 } : undefined}
    />
  );
}
