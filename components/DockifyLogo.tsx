import { useId } from "react";
import { cn } from "@/lib/utils";

interface DockifyLogoProps {
  className?: string;
  compact?: boolean;
}

export function DockifyLogo({ className, compact = false }: DockifyLogoProps) {
  const uid = useId().replace(/:/g, "");
  const fillId = `dockify-fill-${uid}`;
  const documentId = `dockify-doc-${uid}`;
  const glowId = `dockify-glow-${uid}`;
  const sparkleId = `dockify-sparkle-${uid}`;

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center",
        compact ? "gap-1.5" : "gap-2 sm:gap-2.5",
        className,
      )}
    >
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[0.7rem] ring-1 ring-white/15",
          compact ? "h-7 w-7 sm:h-8 sm:w-8" : "h-8 w-8 sm:h-9 sm:w-9",
        )}
        style={{
          boxShadow:
            "0 0.4px 0.8px rgb(165 180 252 / 0.55), 0 4px 10px rgb(37 99 235 / 0.28), 0 0 12px rgb(34 211 238 / 0.18)",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          className="h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={fillId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="48%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id={documentId} x1="8" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
            <linearGradient id={sparkleId} x1="18" y1="14" x2="26" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ECFEFF" />
              <stop offset="100%" stopColor="#C4B5FD" />
            </linearGradient>
            <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="0.85" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="32" height="32" rx="9" fill={`url(#${fillId})`} />
          <path
            d="M9.2 7.4h9.1L22.8 12v12.2c0 1.1-.9 2-2 2H11.2c-1.1 0-2-.9-2-2V9.4c0-1.1.9-2 2-2Z"
            fill={`url(#${documentId})`}
          />
          <path d="M18.3 7.4v4.4c0 .2.2.4.4.4h4.1" fill="#A5F3FC" />
          <path
            d="M11.1 11.2h2.2c2.35 0 3.9 1.45 3.9 3.65 0 2.25-1.55 3.7-3.9 3.7H11.1v-7.35Z"
            fill={`url(#${fillId})`}
            opacity="0.92"
          />
          <path
            d="M13.4 19.6 16 22.2l7.1-7.4"
            fill="none"
            stroke={`url(#${sparkleId})`}
            strokeWidth="2.05"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowId})`}
          />
          <path
            d="M24.15 8.05 24.7 9.5l1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55Z"
            fill="#EEF2FF"
          />
        </svg>
      </span>
      <span
        className={cn(
          "truncate font-sans font-bold tracking-tight text-white",
          compact ? "text-[13px] sm:text-sm" : "text-[14px] sm:text-[15px]",
        )}
      >
        Dock
        <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
          ify
        </span>
      </span>
    </span>
  );
}
