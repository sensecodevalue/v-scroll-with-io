"use client";

import { TypeGood } from "@/api/list/interface";
import { useListQuery } from "@/api/list/query";
import { CardContainer, CardContent, CardImageArea } from "@/components/Card";
import useVirtualizerScroll from "@/components/Virtualizer/useVirtualizerScroll";
import { calculateSize, getCurrentPage, listWithDummy } from "@/utils/list";
import { useVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef } from "react";

const OVERSCAN = 5;
const PAGE_SIZE = 30;
const DEFAULT_ELEMENT_SIZE = 600;

export default function Playground() {
  const searchParams = useSearchParams();
  const historyIndex = searchParams.get("i"); // history기능은 on/off할 수 있도록하자. 또는 on/off에 따라 다른 hooks를 호출하도록하자.

  const lastPosition = useRef(Number(historyIndex) || 1);
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
      listWithDummy<TypeGood>({
        page: biggestPage,
        size: PAGE_SIZE,
        infiniteData: data,
        defaultValue: {
          id: 0,
          name: "",
          thumbnail: "",
          price: 0,
          brand: "",
        },
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

  useVirtualizerScroll<TypeGood, HTMLDivElement>({
    allRows,
    historyIndex: lastPosition.current,
    rowVirtualizer,
    scrollElement: parentRef.current,
    overscan: OVERSCAN,
    hasPage: (page) => {
      return !!data?.pageParams.includes(page);
    },
    getCurrentPage: (index) => getCurrentPage(index, PAGE_SIZE),
    onFetchNextPage: () => {
      if (!hasNextPage || isFetchingNextPage) return;
      fetchNextPage();
    },
    onFetchPreviousPage: () => {
      if (!hasPreviousPage || isFetchingPreviousPage) return;
      fetchPreviousPage();
    },
  });

  // 최초의 위치로 스크롤을 진행한다 (가능 이유: dumy로 해당 사이즈를 계산했기 떄문에 가능)

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
