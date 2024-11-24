import { WithListMeta } from "@/api/list/interface";
import { InfiniteData } from "@tanstack/react-query";
import { isFunction } from "./typeGuard";

export const getCurrentPage = (itemIndex: number, pageSize: number) => {
  return Math.floor(itemIndex / pageSize) + 1;
};

const makeDummyList = <T>(
  size: number,
  defaultValue: T | ((index: number) => T)
) => {
  return Array.from({ length: size }, (_, index) => {
    const value = isFunction(defaultValue) ? defaultValue(index) : defaultValue;

    return { id: index, ...value };
  });
};

export const listWithDummy = <T extends { id: number }>({
  page,
  size,
  infiniteData,
  defaultValue,
}: {
  page: number;
  size: number;
  infiniteData?: InfiniteData<WithListMeta<T>>;
  defaultValue: T;
}) => {
  const dummy = makeDummyList<T>(size * page, (index) => ({
    ...defaultValue,
    id: index,
  }));

  if (!infiniteData) return dummy;

  infiniteData.pages?.forEach((page) => {
    dummy.splice((page.meta.page - 1) * size, page.list.length, ...page.list);
  });

  return dummy;
};

export const calculateSize = (
  width: number,
  xRatio: number,
  yRatio: number
) => {
  const totalRatio = xRatio + yRatio;
  return (width * xRatio) / totalRatio;
};
