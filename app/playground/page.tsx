"use client";

import { useListQuery } from "@/api/list/query";
import { CardContainer, CardContent, CardImageArea } from "@/components/Card";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

export default function Playground() {
  const { data, status, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useListQuery();

  const allRows = data ? data.pages.flatMap((d) => d) : [];
  // 한칸에 두개씩 보여주려면 2개의 묶음으로 새로운 리스트를 만들면됨.
  // 또는 계산할때 반만돌리고 랜더함수에서 수식을 통해 보여주는 형태로해도 될듯 <- 이게 더 좋아 보임
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (parentRef.current?.clientWidth ?? 1) * 0.6, // 한 ITEM 5:3으로 계산하면 높이가 맞음
    overscan: 5,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
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
                  {/* <CardImageArea></CardImageArea> */}
                  {isLoaderRow ? (
                    hasNextPage ? (
                      "Loading more..."
                    ) : (
                      "Noting"
                    )
                  ) : (
                    <CardContent name={`${post.name}`} />
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
