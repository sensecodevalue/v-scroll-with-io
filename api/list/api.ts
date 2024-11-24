import { httpInstance } from "@/http";
import { TypeGood, WithListMeta } from "./interface";

export const getList = async ({ page }: { page: number }) => {
  const response = await httpInstance.get<WithListMeta<TypeGood>>("list", {
    searchParams: { page },
  });

  return response.json();
};
