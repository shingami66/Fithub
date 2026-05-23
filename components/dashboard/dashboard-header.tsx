export function DashboardHeader({ firstName }: { firstName: string }) {
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="space-y-1">
        <p className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">{today}</p>
        <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-none text-transparent">
          Welcome, {firstName}
        </h1>
      </div>

      {/* Avatar with subtle glow */}
      <div className="relative group hidden sm:block">
        <div
          className="absolute -inset-2 rounded-full bg-[#7dd3fc]/5 blur-xl transition-opacity duration-500 group-hover:bg-[#7dd3fc]/10"
          aria-hidden="true"
        />
        <div className="relative h-14 w-14 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          <span className="text-lg font-bold text-white">{firstName[0]}</span>
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[2.5px] border-[#050505] bg-[#7dd3fc] animate-pulse" />
        </div>
      </div>
    </header>
  );
}
