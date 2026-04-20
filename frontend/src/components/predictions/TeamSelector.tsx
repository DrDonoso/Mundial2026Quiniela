import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Team } from "@/types";
import { Search, ChevronDown, X } from "lucide-react";

interface TeamSelectorProps {
  teams: Team[];
  selectedTeamId: string;
  onSelect: (teamId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TeamSelector({
  teams,
  selectedTeamId,
  onSelect,
  disabled = false,
  placeholder = "Select a team...",
}: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
      >
        {selectedTeam ? (
          <div className="flex items-center gap-2">
            <img
              src={selectedTeam.flag_url}
              alt={selectedTeam.code}
              className="h-5 w-7 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="font-medium">{selectedTeam.name}</span>
            <span className="text-xs text-muted-foreground">
              ({selectedTeam.code})
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <div className="flex items-center gap-1">
          {selectedTeam && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect("");
              }}
              className="rounded p-0.5 hover:bg-muted"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border-0 bg-muted py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredTeams.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No teams found
              </div>
            ) : (
              filteredTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => {
                    onSelect(team.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                    team.id === selectedTeamId
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <img
                    src={team.flag_url}
                    alt={team.code}
                    className="h-4 w-6 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="font-medium">{team.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {team.code}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
