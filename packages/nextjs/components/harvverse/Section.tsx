import type { ReactNode } from "react";

type SectionProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  id?: string;
};

export const Section = ({
  eyebrow,
  title,
  description,
  align = "start",
  actions,
  children,
  className,
  contentClassName,
  id,
}: SectionProps) => {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <section id={id} className={`relative w-full px-4 py-16 sm:px-6 lg:px-10 lg:py-24 ${className ?? ""}`}>
      <div className="mx-auto w-full max-w-7xl">
        {(eyebrow || title || description || actions) && (
          <header className={`flex flex-col gap-3 ${alignment} mb-10 lg:mb-14`}>
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className={`flex flex-col gap-3 ${align === "center" ? "items-center mx-auto" : ""}`}>
                {title ? (
                  <h2 className="max-w-2xl text-balance text-3xl font-light tracking-tight text-harv-text sm:text-4xl lg:text-5xl">
                    {title}
                  </h2>
                ) : null}
                {description ? (
                  <p className="max-w-2xl text-base leading-relaxed text-muted-harv">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
            </div>
          </header>
        )}
        <div className={contentClassName}>{children}</div>
      </div>
    </section>
  );
};
