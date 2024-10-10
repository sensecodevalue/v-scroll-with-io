import { useInfiniteQuery } from "@tanstack/react-query";
import { getList } from "./api";

export const useListQuery = () =>
  useInfiniteQuery({
    queryKey: ["list"],
    queryFn: ({ pageParam = 1 }) => getList({ page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;

      return lastPage?.length === 0 || lastPage?.length < 30
        ? undefined
        : nextPage;
    },
    initialPageParam: 1,
  });
