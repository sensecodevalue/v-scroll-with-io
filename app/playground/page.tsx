"use client";

import CardContainer from "@/components/Card/Container";
import CardImageArea from "@/components/Card/ImageArea";

export default function Playground() {
  return (
    <div className="w-[100%] grid grid-cols-2">
      <CardContainer>
        <CardImageArea></CardImageArea>
      </CardContainer>
      <CardContainer>
        <CardImageArea></CardImageArea>
      </CardContainer>
      <CardContainer>
        <CardImageArea></CardImageArea>
      </CardContainer>
      <CardContainer>
        <CardImageArea></CardImageArea>
      </CardContainer>
    </div>
  );
}
