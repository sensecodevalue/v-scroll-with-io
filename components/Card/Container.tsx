import { ComponentPropsWithoutRef } from "react";

// // 300x360

export default function CardContainer(props: ComponentPropsWithoutRef<"div">) {
  return <div className="w-[100%]" {...props} />;
}
