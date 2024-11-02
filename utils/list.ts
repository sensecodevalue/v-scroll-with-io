import { TypeList } from "@/api/list/interface";
import { InfiniteData } from "@tanstack/react-query";

export const getCurrentPage = (itemIndex: number, pageSize: number) => {
  return Math.floor(itemIndex / pageSize) + 1;
};

export const dummyList = (size: number) => {
  return Array.from({ length: size }, (_, index) => ({
    id: index,
    name: `name_${index}`,
    thumbnail: "",
    price: 0,
    brand: `brand_${index}`,
  }));
};

export const listWithDummy = ({
  page,
  size,
  infiniteData,
}: {
  page: number;
  size: number;
  infiniteData?: InfiniteData<TypeList>;
}) => {
  const dumy = Array.from({ length: size * page }, (_, index) => ({
    id: index,
    name: `name_${index}`,
    thumbnail: "",
    price: 0,
    brand: `brand_${index}`,
  }));

  if (!infiniteData) return dumy;

  infiniteData.pages?.forEach((page) => {
    dumy.splice((page.meta.page - 1) * size, page.list.length, ...page.list);
  });

  return dumy;
};
