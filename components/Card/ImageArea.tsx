import { PropsWithChildren } from "react";

export default function CardImageArea({ children }: PropsWithChildren) {
  return <div className="w-[100%] aspect-w-5 aspect-h-6">{children}</div>;
}
