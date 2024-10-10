export const dynamic = "force-dynamic";

const makePageData = (page: number, limit: number) => {
  return new Array(limit).fill(0).map((_, i) => ({
    name: `Item ${page * limit + i}`,
    id: page * limit + i,
    url: "",
  }));
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");
  const limit = 30; //searchParams.get("limit")

  const data = makePageData(Number(page), limit);

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
