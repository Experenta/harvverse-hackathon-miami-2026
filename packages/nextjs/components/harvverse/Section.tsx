import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

type SectionProps = {
  eyebrow?: string;
  eyebrowTone?: "default" | "leaf" | "honey" | "proof" | "torch";
  coordinate?: string;
  index?: string;
  title?: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  id?: string;
};

/**
 * Section — canonical section header.
 * Pairs a Fraunces display title with a mono eyebrow + coordinate kicker.
 * Includes a small index marker so sections feel printed/numbered.
 */
export const Section = ({
  eyebrow,
  eyebrowTone = "default",
  coordinate,
  index,
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
    <section id={id} className={`relative w-full px-4 py-14 sm:px-6 lg:px-10 lg:py-20 ${className ?? ""}`}>
      <div className="mx-auto w-full max-w-7xl">
        {(eyebrow || title || description || actions) && (
          <header className={`flex flex-col gap-4 ${alignment} mb-9 lg:mb-12`}>
            {(eyebrow || index) && (
              <div className="flex items-center gap-3">
                {index ? (
                  <span className="border-r border-rule-hi pr-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">
                    {index}
                  </span>
                ) : null}
                {eyebrow ? (
                  <Eyebrow tone={eyebrowTone} coordinate={coordinate}>
                    {eyebrow}
                  </Eyebrow>
                ) : null}
              </div>
            )}
            <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className={`flex flex-col gap-3 ${align === "center" ? "mx-auto items-center" : ""}`}>
                {title ? (
                  <h2 className="font-display max-w-3xl text-balance text-[clamp(2rem,4vw,3.5rem)] leading-[0.98] tracking-tight text-paper">
                    {title}
                  </h2>
                ) : null}
                {description ? <p className="max-w-2xl text-base leading-relaxed text-paper-2">{description}</p> : null}
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
