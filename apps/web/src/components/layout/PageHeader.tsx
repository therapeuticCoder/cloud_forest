import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="space-y-4">
      <Badge variant="secondary" className="w-fit">
        {eyebrow}
      </Badge>

      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
