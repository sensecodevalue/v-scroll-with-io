import Container from "@/components/Container";
import Provider from "@/components/Provider";
import { PropsWithChildren } from "react";

export default function PlaygroundLayout({ children }: PropsWithChildren) {
  return (
    <Provider>
      <Container>{children}</Container>
    </Provider>
  );
}
