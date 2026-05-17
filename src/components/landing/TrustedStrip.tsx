/** Honest "where it's used" strip — no fake logos, just monospaced labels. */
export const TrustedStrip = () => (
  <div className="border-y border-border/60 bg-card/30">
    <div className="container py-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center mb-3">
        Built for the people we know best
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-muted-foreground">
        <span>MBA recruiting cycles</span>
        <span className="text-primary/40">·</span>
        <span>YC + On Deck founders</span>
        <span className="text-primary/40">·</span>
        <span>Operators between roles</span>
        <span className="text-primary/40">·</span>
        <span>Students keeping in touch</span>
      </div>
    </div>
  </div>
);
