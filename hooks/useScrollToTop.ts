import { useCallback, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export function useScrollToTop() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowBackToTop(event.nativeEvent.contentOffset.y > 300);
  }, []);

  return { showBackToTop, onScroll };
}
