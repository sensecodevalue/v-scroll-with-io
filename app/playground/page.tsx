"use client";

import { CardContainer, CardContent, CardImageArea } from "@/components/Card";

export default function Playground() {
  return (
    <div className="w-[100%] grid grid-cols-2">
      <CardContainer>
        <CardImageArea></CardImageArea>
        <CardContent name={"1"} />
      </CardContainer>
      <CardContainer>
        <CardImageArea></CardImageArea>
        <CardContent name={"2"} />
      </CardContainer>
      <CardContainer>
        <CardImageArea></CardImageArea>
        <CardContent name={"3"} />
      </CardContainer>
      <CardContainer>
        <CardImageArea></CardImageArea>
        <CardContent name={"4"} />
      </CardContainer>
    </div>
  );
}
