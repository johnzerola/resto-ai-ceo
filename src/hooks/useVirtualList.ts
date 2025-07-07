import { useState, useMemo, useCallback, useEffect } from 'react';

interface VirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualListItem<T> {
  index: number;
  data: T;
  style: React.CSSProperties;
}

// Hook para virtualização de listas grandes - otimização de performance
export function useVirtualList<T>(
  items: T[],
  { itemHeight, containerHeight, overscan = 5 }: VirtualListOptions
) {
  const [scrollTop, setScrollTop] = useState(0);

  // Calcular índices visíveis
  const visibleRange = useMemo(() => {
    const totalItems = items.length;
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + visibleItemCount + overscan,
      totalItems - 1
    );

    const offsetStartIndex = Math.max(0, startIndex - overscan);

    return {
      start: offsetStartIndex,
      end: endIndex,
      total: totalItems
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Itens virtualizados
  const virtualItems = useMemo(() => {
    const { start, end } = visibleRange;
    const virtualizedItems: VirtualListItem<T>[] = [];

    for (let i = start; i <= end; i++) {
      if (items[i]) {
        virtualizedItems.push({
          index: i,
          data: items[i],
          style: {
            position: 'absolute',
            top: i * itemHeight,
            height: itemHeight,
            width: '100%',
          },
        });
      }
    }

    return virtualizedItems;
  }, [items, visibleRange, itemHeight]);

  // Handler de scroll otimizado
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Altura total da lista
  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  // Scroll para item específico
  const scrollToItem = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  return {
    virtualItems,
    totalHeight,
    handleScroll,
    scrollToItem,
    visibleRange,
  };
}