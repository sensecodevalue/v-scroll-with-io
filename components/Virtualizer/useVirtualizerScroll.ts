import useEffectOnce from "@/hooks/useEffectOnce";
import { Virtualizer } from "@tanstack/react-virtual";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

interface VirtualizerScrollProps<T, H extends HTMLElement> {
  allRows: T[];
  historyIndex: number;
  rowVirtualizer: Virtualizer<H, Element>;
  scrollElement: H | null;
  overscan: number;
  hasPage: (page: number) => boolean;
  getCurrentPage: (index: number) => number;
  onFetchNextPage: () => void;
  onFetchPreviousPage: () => void;
}

export default function useVirtualizerScroll<T, H extends HTMLElement>({
  allRows,
  historyIndex,
  rowVirtualizer,
  scrollElement,
  overscan,
  hasPage,
  getCurrentPage,
  onFetchNextPage,
  onFetchPreviousPage,
}: VirtualizerScrollProps<T, H>) {
  const router = useRouter();

  const lastPosition = useRef(Number(historyIndex) || 1);
  const isObserveLastPosition = useRef(false);

  // 최초의 위치로 스크롤을 진행한다 (가능 이유: dumy로 해당 사이즈를 계산했기 떄문에 가능)
  useEffectOnce(
    () => {
      rowVirtualizer.scrollToIndex(lastPosition.current); // index로하는것보다 scroll위치로하는게 더 적절하겠다.
      // history를 통해서 scroll이 기억되고 있으면 scroll을 사용할 수 도있고 더 좋을듯하다.
    },
    [rowVirtualizer],
    !!scrollElement
  );

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const firstItem = virtualItems[0];
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!firstItem || !lastItem) return; // 없어도 되면 과감히 제거하자.

    const lastItemPage = getCurrentPage(lastItem.index);
    const firstItemPage = getCurrentPage(firstItem.index);
    const isNeedNextPage = !hasPage(lastItemPage);
    const isNeedPreviousPage = !hasPage(firstItemPage);
    const hasLastPosition = rowVirtualizer
      .getVirtualItems()
      .find((item) => item.index === lastPosition.current);

    isObserveLastPosition.current =
      isObserveLastPosition.current || !!hasLastPosition; // 처음에는 관측하지 않았다가 관측했을때 true로 변경

    if (!isObserveLastPosition.current) {
      return;
    }

    // 첫번째 항목의 시작 픽셀이 0이면 맨위에 있다는 의미 즉, 처음에 위치하였기에 prev를 트리거
    if (isNeedNextPage) {
      onFetchNextPage();
    }

    if (isNeedPreviousPage) {
      onFetchPreviousPage();
    }

    // 한화면에 몇개의 아이템이 보이는지 계산해서 그계산과 차이날때만 업데이트를한다. debounce도 걸어놓자.
    const lastObserveIndex = lastItem.index - overscan;
    router.replace(`/playground?i=${lastObserveIndex}`);
  }, [allRows.length, rowVirtualizer.getVirtualItems()]);

  return {
    rowVirtualizer,
  };
}
