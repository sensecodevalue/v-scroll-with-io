import { PropsWithChildren } from "react";

export default function CardImageArea({ children }: PropsWithChildren) {
  return (
    <div
      className="w-[100%] relative"
      style={{
        height: "calc(max(100vw, 600px) * (6 / 5))",
      }}
    >
      {children}
    </div>
  );
}
