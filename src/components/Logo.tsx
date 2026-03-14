interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 select-none ${className ?? ''}`}>
      {/* Focus-point mark: outer ring → middle ring → center dot */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer ring */}
        <circle
          cx="11"
          cy="11"
          r="9.25"
          stroke="#3B7482"
          strokeWidth="1.25"
          strokeOpacity="0.55"
        />
        {/* Middle ring */}
        <circle
          cx="11"
          cy="11"
          r="5.5"
          stroke="#3B7482"
          strokeWidth="1.25"
          strokeOpacity="0.8"
        />
        {/* Center dot */}
        <circle cx="11" cy="11" r="2.25" fill="#3B7482" />
      </svg>

      {/* Wordmark */}
      <span className="font-serif text-[15px] font-medium text-foreground/80 tracking-tight leading-none">
        StayPut
      </span>
    </div>
  );
}
