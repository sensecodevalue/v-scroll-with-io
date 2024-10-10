import { ComponentPropsWithoutRef } from "react";

export default function Container(props: ComponentPropsWithoutRef<"div">) {
  return <div className="max-w-[600px] min-w-[368px] w-[100%]" {...props} />;
}
