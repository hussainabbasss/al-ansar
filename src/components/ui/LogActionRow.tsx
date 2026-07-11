import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

type LogActionRowProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
};

const rowClass =
  "group flex min-h-14 w-full items-center justify-between border-b border-outline-variant bg-surface-container px-5 py-4 text-left transition-colors duration-200 last:border-b-0 hover:bg-surface-variant";

export function LogActionRow({
  title,
  subtitle,
  href,
  onClick,
  icon: Icon,
}: LogActionRowProps) {
  const inner = (
    <>
      <div className="flex min-w-0 items-center gap-4">
        <Icon
          className="size-5 shrink-0 text-outline transition-colors group-hover:text-primary"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-on-surface">
            {title}
          </p>
          <p className="truncate text-sm text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-outline transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={rowClass}>
      {inner}
    </button>
  );
}
