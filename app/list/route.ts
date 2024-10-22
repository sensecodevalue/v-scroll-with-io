export const dynamic = "force-dynamic";
import { TypeGood, TypeListMeta } from "@/api/list/interface";
import { list } from "@/mock/goods.json";

const makeGoodListWithMeta = (page: number, limit: number) => {
  const targetList = list.slice((page - 1) * limit, page * limit);
  const meta = {
    page,
    size: targetList.length,
    totalCount: list.length,
    hasNext: page * limit < list.length,
    totalPage: Math.ceil(list.length / limit),
  };

  return {
    list: targetList,
    meta,
  };
};

interface TypeResponse {
  list: TypeGood[];
  meta: TypeListMeta;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 30;

  const data: TypeResponse = makeGoodListWithMeta(Number(page), Number(limit));

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
