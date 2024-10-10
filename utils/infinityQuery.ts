export const getPageByIndex = async (itemIndex: number, limit = 30) => {
  const page = (itemIndex || 1) / limit + 1;

  return page;
};
