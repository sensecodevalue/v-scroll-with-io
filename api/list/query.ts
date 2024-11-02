import { useInfiniteQuery } from "@tanstack/react-query";
import { getList } from "./api";

export const useListQuery = ({ page }: { page: number }) =>
  useInfiniteQuery({
    queryKey: ["list"],
    queryFn: ({ pageParam = page }) => getList({ page: pageParam }),
    getNextPageParam: (lastPage) => {
      // const nextPage = allPages.length + 1; // allPages은 getNextPageParam의 인자이다.
      // return lastPage.list?.length === 0 || lastPage.list?.length < 30
      //   ? undefined
      //   : nextPage;
      const nextPage = lastPage.meta.page + 1;
      return lastPage.meta.hasNext ? nextPage : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const prevPage = firstPage.meta.page - 1;
      return prevPage >= 1 ? prevPage : undefined;
    },
    initialPageParam: page,
  });
