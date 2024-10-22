import { ComponentPropsWithoutRef } from "react";

// // 300x360

export default function CardContainer(props: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className="w-[100%] flex flex-col"
      style={{
        height: "calc(max(100vw, 600px) * (6 / 5)) + 200px",
      }}
      {...props}
    />
  );
}
