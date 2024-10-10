import { httpInstance } from "@/http";
import { TypeList } from "./interface";

export const getList = async ({ page }: { page: number }) => {
  const response = await httpInstance.get<TypeList[]>("list", {
    searchParams: { page },
  });

  return response.json();
};
