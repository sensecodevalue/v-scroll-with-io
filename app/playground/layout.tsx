import Container from "@/components/Container";
import { PropsWithChildren } from "react";

export default function PlaygroundLayout({ children }: PropsWithChildren) {
  return <Container>{children}</Container>;
}
