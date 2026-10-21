import { forwardRef, useImperativeHandle, useRef } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { FloatingActions } from './floatingActions';
import { useScrollToTop } from '@/hooks/useScrollToTop';

type Props = ScrollViewProps & { showCart?: boolean; hideFloatingActions?: boolean };

export const FloatingScrollView = forwardRef<ScrollView, Props>(function FloatingScrollView(
  {
    showCart = true,
    hideFloatingActions = false,
    onScroll,
    contentContainerStyle,
    scrollEventThrottle = 100,
    ...props
  },
  ref
) {
  const scrollRef = useRef<ScrollView>(null);
  const scroll = useScrollToTop();
  useImperativeHandle(ref, () => scrollRef.current!, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        {...props}
        contentContainerStyle={[
          contentContainerStyle,
          {
            paddingBottom: Math.max(
              Number(StyleSheet.flatten(contentContainerStyle)?.paddingBottom) || 0,
              144
            ),
          },
        ]}
        ref={scrollRef}
        scrollEventThrottle={scrollEventThrottle}
        onScroll={(event) => {
          scroll.onScroll(event);
          onScroll?.(event);
        }}
      />
      <FloatingActions
        showCart={showCart}
        hidden={hideFloatingActions}
        showBackToTop={scroll.showBackToTop}
        onBackToTop={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
    </View>
  );
});
