import { PropsWithChildren } from "react";

// // 300x360

export default function CardContainer({ children }: PropsWithChildren) {
  return <div className="w-[100%] pb-4">{children}</div>;
}
