import { Sprout } from "lucide-react";
import { useId, type ReactNode, type RefObject } from "react";

function CloudForestMark() {
  return (
    <div className="auth-boundary-brand" aria-label="Cloud Forest">
      <span className="auth-boundary-brand-mark" aria-hidden="true">
        <Sprout />
      </span>
      <span>Cloud Forest</span>
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-boundary-entry">
      <CloudForestMark />
      {children}
      <p className="auth-boundary-footnote">Cloud Forest is invitation only.</p>
    </main>
  );
}

export function AuthCard({
  children,
  headingRef,
  icon,
  title,
}: {
  children: ReactNode;
  headingRef?: RefObject<HTMLHeadingElement | null>;
  icon: ReactNode;
  title: string;
}) {
  const titleId = useId();

  return (
    <section className="auth-boundary-card" aria-labelledby={titleId}>
      <span className="auth-boundary-card-icon" aria-hidden="true">
        {icon}
      </span>
      <h1 id={titleId} ref={headingRef} tabIndex={-1}>
        {title}
      </h1>
      {children}
    </section>
  );
}

export function LoadingScreen() {
  return (
    <AuthLayout>
      <AuthCard icon={<Sprout />} title="Opening Cloud Forest">
        <p>Checking your Cloud Forest session.</p>
      </AuthCard>
    </AuthLayout>
  );
}
