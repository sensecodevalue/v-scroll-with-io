"use client";

import { useListQuery } from "@/api/list/query";
import { CardContainer, CardContent, CardImageArea } from "@/components/Card";
import { getCurrentPage, listWithDummy } from "@/utils/list";
import { useVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

// 1. virtual size만큼의 더미 리스트를 만든다.
// 2. query fetching을 통해 온 데이터를 인덱스에 맞게 교체해준다.
// 3. 해당 index로 스크롤를 한다. (해당인덱스가 온전히 보일때까지 스크롤한다.)
// 3-1. 이때, 스크롤 해당 위치까지 내리면서 다른 패칭이 있으면 안된다.
//      따라서 해당 index item이 관측될때까지 next 및 prev fetching을 막는다.

// 남은 일들
// 코드 정리
// 1. 여러 환경에서 확장성 있게 접근할 수 있도록 수정
//    OVERSCAN, lastPosition(=route query로 받기), estimateSize
// 2. 스크롤 이벤트를 통해 lastPosition을 업데이트
// 3. 블로그로 정리

/**
 * 만약 라우터가 아닌 sessionStorage를 사용한다면?
 * - 적절한 초기화 전략을 생각홰야된다.
 * - 라우터의 경우 router history에 따라서 정보를 갖고 동작을하지만
 * - sessionStorage 히스토리가 특정 조작이 없다면 유지되지 때문에 의도하지 않은 동작이 발생할 수 있다.
 * - sessionStorage에 저장을하고 새로 초기화를 위해서 카테고리를 클릭하는 등 새로롭게 페이지로 접근을 했을 경우, 초기화를 해야주어야되는데
 * - 이럴 경우 적절한 대처를 진행해야된다.
 * - ex) router에 state=InScroll 이런식으로 특정 트리거가 있지 않아야될까 생각한다.
 */

const OVERSCAN = 5;
const PAGE_SIZE = 30;
const DEFAULT_ELEMENT_SIZE = 600;

const calculateSize = (width: number, xRatio: number, yRatio: number) => {
  const totalRatio = xRatio + yRatio;
  return (width * xRatio) / totalRatio;
};

export default function Playground() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyIndex = searchParams.get("i"); // history기능은 on/off할 수 있도록하자. 또는 on/off에 따라 다른 hooks를 호출하도록하자.

  const isFirst = useRef(true);
  const lastPosition = useRef(Number(historyIndex) || 1);
  const lastPositionObserver = useRef(false);
  const lastFetchingPage = getCurrentPage(lastPosition.current, PAGE_SIZE); // 이건 store정보에따라 바꿀 수 있다. 단지 next를 위해서 사용됨

  const {
    data,
    status,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
  } = useListQuery({ page: lastFetchingPage }); // TODO: useSuspenseInfinityQuery로 변경하기
  // data는 주입해주면 그만

  const biggestPage = Math.max(
    ...(data?.pages?.map((page) => page.meta.page) || [0])
  );

  const allRows = useMemo(
    () =>
      listWithDummy({
        page: biggestPage,
        size: PAGE_SIZE,
        infiniteData: data,
      }),
    [biggestPage, data]
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = calculateSize(
    parentRef.current?.clientWidth ?? DEFAULT_ELEMENT_SIZE,
    5,
    3
  );
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length, // page 수 고려
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize, // 한 ITEM 5:3으로 계산하면 높이가 맞음
    overscan: OVERSCAN,
  });

  // 최초의 위치로 스크롤을 진행한다 (가능 이유: dumy로 해당 사이즈를 계산했기 떄문에 가능)
  useEffect(() => {
    if (!isFirst.current || !parentRef.current) return;
    rowVirtualizer.scrollToIndex(lastPosition.current); // index로하는것보다 scroll위치로하는게 더 적절하겠다.
    // history를 통해서 scroll이 기억되고 있으면 scroll을 사용할 수 도있고 더 좋을듯하다.
    isFirst.current = false;
  }, [parentRef.current, rowVirtualizer]);

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const firstItem = virtualItems[0];
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!lastItem) {
      return;
    }

    const lastItemPage = getCurrentPage(lastItem.index, PAGE_SIZE);
    const firstItemPage = getCurrentPage(firstItem.index, PAGE_SIZE);
    const isOverNextPage = !data?.pageParams.includes(lastItemPage);
    const isOverPreviousPage = !data?.pageParams.includes(firstItemPage);
    const isObserveLastPosition = rowVirtualizer
      .getVirtualItems()
      .find((item) => item.index === lastPosition.current);

    lastPositionObserver.current =
      lastPositionObserver.current || !!isObserveLastPosition; // 처음에는 관측하지 않았다가 관측했을때 true로 변경

    if (!lastPositionObserver.current) {
      return;
    }

    // 첫번째 항목의 시작 픽셀이 0이면 맨위에 있다는 의미 즉, 처음에 위치하였기에 prev를 트리거
    if (hasNextPage && !isFetchingNextPage && isOverNextPage) {
      fetchNextPage();
    }

    if (hasPreviousPage && !isFetchingPreviousPage && isOverPreviousPage) {
      fetchPreviousPage();
    }

    // 한화면에 몇개의 아이템이 보이는지 계산해서 그계산과 차이날때만 업데이트를한다. debounce도 걸어놓자.
    const lastObserveIndex = lastItem.index - OVERSCAN;
    router.replace(`/playground?i=${lastObserveIndex}`);
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <div>
      {/* 여긴 서스펜스로 빠지고 */}
      {status === "pending" ? (
        <div>Loading...</div>
      ) : (
        <div
          className="w-[100%] h-screen overflow-auto scrollbar-hide"
          ref={parentRef}
        >
          <div
            // className={`w-[100%] grid grid-cols-2 relative`}
            className={`w-[100%] relative`}
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > allRows.length - 1; // 마지막 페이지
              const post = allRows[virtualRow.index];

              return (
                <CardContainer
                  key={virtualRow.index}
                  data-index={`${virtualRow.index}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {/* isLoaderRow 처리 부분은 합성컴포넌트를 통해서 해결하면될듯 컨테이너를 감싸서 fullback을 받던지 */}
                  {/* hasNextPage 처리 부분도 처리될 수 있음 베스트*/}
                  {isLoaderRow ? (
                    hasNextPage ? (
                      "Loading more..."
                    ) : (
                      "Noting"
                    )
                  ) : (
                    <>
                      <CardImageArea>
                        {post.thumbnail && (
                          <Image
                            src={post.thumbnail}
                            alt="post.name"
                            fill
                            objectFit="contain"
                          />
                        )}
                      </CardImageArea>
                      <CardContent name={`${post.name}`} />
                    </>
                  )}
                </CardContainer>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
