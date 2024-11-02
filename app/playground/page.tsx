"use client";

import { useListQuery } from "@/api/list/query";
import { CardContainer, CardContent, CardImageArea } from "@/components/Card";
import { getCurrentPage, listWithDummy } from "@/utils/list";
import { useVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// 1. virtual size만큼의 더미 리스트를 만든다.
// 2. query fetching을 통해 온 데이터를 인덱스에 맞게 교체해준다.
// 3. 해당 index로 스크롤를 한다. (해당인덱스가 온전히 보일때까지 스크롤한다.)
// 3-1. 이때, 스크롤 해당 위치까지 내리면서 다른 패칭이 있으면 안된다.
//      따라서 해당 index item이 관측될때까지 next 및 prev fetching을 막는다.

const OVERSCAN = 5;

export default function Playground() {
  const isFirst = useRef(true);
  const lastPosition = useRef(10);
  const lastPositionObserver = useRef(false);
  const nextFetchingPage = getCurrentPage(lastPosition.current, 30); // 이건 store정보에따라 바꿀 수 있다. 단지 next를 위해서 사용됨

  const router = useRouter();

  const {
    data,
    status,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
  } = useListQuery({ page: nextFetchingPage });

  const allRows = listWithDummy({
    page: nextFetchingPage,
    size: 30,
    infiniteData: data,
  });
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length, // page 수 고려
    getScrollElement: () => parentRef.current,
    estimateSize: () => (parentRef.current?.clientWidth ?? 600) * 0.6, // 한 ITEM 5:3으로 계산하면 높이가 맞음
    overscan: OVERSCAN, //
  });

  useEffect(() => {
    if (!parentRef.current || !isFirst) return;
    rowVirtualizer.scrollToIndex(lastPosition.current);
    isFirst.current = false;
  }, [allRows.length, parentRef.current]);

  useEffect(() => {
    const [firstItem] = rowVirtualizer.getVirtualItems();
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    rowVirtualizer.getVirtualItems();

    if (!lastItem) {
      return;
    }

    const lastItemPage = getCurrentPage(lastItem.index, 30);
    const firstItemPage = getCurrentPage(firstItem.index, 30);
    const isOverNextPage = !data?.pageParams.includes(lastItemPage);
    const isOverPreviousPage = !data?.pageParams.includes(firstItemPage);
    const hasCurrent = data?.pageParams.includes(nextFetchingPage);
    const isObserveLastPosition = rowVirtualizer
      .getVirtualItems()
      .find((item) => item.index === lastPosition.current);
    lastPositionObserver.current =
      lastPositionObserver.current || !!isObserveLastPosition;

    if (!lastPositionObserver.current) {
      return;
    }

    // 첫번째 항목의 시작 픽셀이 0이면 맨위에 있다는 의미 즉, 처음에 위치하였기에 prev를 트리거
    if (hasNextPage && !isFetchingNextPage && isOverNextPage) {
      fetchNextPage();
    }

    if (
      hasCurrent &&
      hasPreviousPage &&
      !isFetchingPreviousPage &&
      isOverPreviousPage
    ) {
      fetchPreviousPage();
    }

    if (isOverPreviousPage) {
      console.log("???");
      const lastObserveIndex =
        lastItem.index > OVERSCAN ? lastItem.index - OVERSCAN : lastItem.index;
      router.replace(`/playground?i=${lastObserveIndex}`);
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <div>
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
              const isLoaderRow = virtualRow.index > allRows.length - 1;
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
