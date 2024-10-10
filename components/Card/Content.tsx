interface CardContentProps {
  name: string;
}

export default function CardContent({ name }: CardContentProps) {
  return (
    <div className="h-[100px] p-2">
      <span>{name}</span>
    </div>
  );
}
