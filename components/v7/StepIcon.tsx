type Icon = "chat" | "clapperboard" | "calendar" | "frames";

// Original line drawings, kept deliberately simple at the grid's small scale.
export function StepIcon({ icon }: { icon: Icon }) {
  return (
    <svg className="v7-step-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icon === "chat" && <><path d="M10 7h20a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5H17l-8 5v-6a5 5 0 0 1-4-5V12a5 5 0 0 1 5-5Z" /><path d="M12 16h16M12 22h10" /></>}
      {icon === "clapperboard" && <><path d="M6 17h28v15a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3ZM6 17 4 9l27-6 2 8Z" /><path d="m12 7 5 6m4-8 5 6M7 23h26" /></>}
      {icon === "calendar" && <><rect x="6" y="8" width="28" height="27" rx="4" /><path d="M13 4v8M27 4v8M6 17h28m-22 8 5 5 11-10" /></>}
      {icon === "frames" && <><rect x="11" y="13" width="24" height="22" rx="3" /><path d="M29 8H9a3 3 0 0 0-3 3v17M23 3H5a3 3 0 0 0-3 3v16" /><path d="m21 19 7 5-7 5Z" /></>}
    </svg>
  );
}
