export interface TypeList {
  meta: TypeListMeta;
  list: TypeGood[];
}

export interface TypeGood {
  id: number;
  name: string;
  thumbnail: string;
  price: number;
  brand: string;
}

export interface TypeListMeta {
  page: number;
  size: number;
  totalCount: number;
  hasNext: boolean;
  totalPage: number;
}
