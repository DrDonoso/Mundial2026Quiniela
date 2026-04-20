import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 py-4 px-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4 text-gold" />
          <span>Mundial 2026 Over 9000</span>
        </div>
        <p className="text-xs text-muted-foreground/60">
          FIFA World Cup 2026 Betting Pool &middot; Made with passion
        </p>
      </div>
    </footer>
  );
}
