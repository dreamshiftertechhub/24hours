import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { openDesk, type DeskRow } from "@/lib/registrations";

const DESK_KEY = "24hj-desk";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Registration desk — 24 Hours with Jesus" },
      { name: "description", content: "Private registration desk for 24 Hours with Jesus." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Desk,
});

function Desk() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<DeskRow[] | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [filter, setFilter] = useState<"all" | "attendee" | "volunteer">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(DESK_KEY);
    if (!stored) return;
    setPassword(stored);
    void load(stored, setRows, setError, setPending);
  }, []);

  const view = useMemo(() => {
    const list = rows ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((row) => {
      if (filter !== "all" && row.kind !== filter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.ref.toLowerCase().includes(q) ||
        row.city.toLowerCase().includes(q) ||
        row.role.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, query]);

  const attendees = rows?.filter((row) => row.kind === "attendee").length ?? 0;
  const volunteers = rows?.filter((row) => row.kind === "volunteer").length ?? 0;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="size-4 text-gold" aria-hidden />
            <span className="font-display text-lg font-semibold">24 Hours</span>
          </Link>
          <p className="text-sm text-muted">Registration desk</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <p className="text-xs font-medium uppercase tracking-widest text-gold">November edition</p>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Who is coming</h1>
        <p className="mt-3 max-w-xl text-muted">
          Attendees and volunteers for Awake, Oh Sent One. This list is not on the public page.
        </p>

        {rows == null ? (
          <form
            className="mt-10 max-w-md border border-line bg-surface p-5 sm:p-6"
            onSubmit={(event) => {
              event.preventDefault();
              sessionStorage.setItem(DESK_KEY, password);
              void load(password, setRows, setError, setPending);
            }}
          >
            <label htmlFor="desk-password" className="text-sm font-medium">
              Desk password
            </label>
            <input
              id="desk-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full border border-line bg-bg px-3 text-fg outline-none"
            />
            {error && (
              <p className="mt-3 text-sm text-ember" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending || password.length === 0}
              className="mt-4 inline-flex h-12 w-full items-center justify-center bg-gold text-sm font-semibold text-bg hover:bg-gold-deep disabled:opacity-60"
            >
              {pending ? "Opening…" : "Open the list"}
            </button>
          </form>
        ) : (
          <div className="mt-10">
            <div className="grid grid-cols-3 gap-3 border-y border-line py-6">
              <Stat value={String(rows.length)} label="On the list" />
              <Stat value={String(attendees)} label="Attending" />
              <Stat value={String(volunteers)} label="Volunteers" />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-3 gap-2 sm:flex">
                <FilterChip pressed={filter === "all"} onClick={() => setFilter("all")} label="All" />
                <FilterChip
                  pressed={filter === "attendee"}
                  onClick={() => setFilter("attendee")}
                  label="Attending"
                />
                <FilterChip
                  pressed={filter === "volunteer"}
                  onClick={() => setFilter("volunteer")}
                  label="Volunteers"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-11 items-center border border-line px-3 text-sm hover:border-gold"
                  onClick={() => downloadCsv(rows)}
                >
                  Download
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center border border-line px-3 text-sm hover:border-gold"
                  onClick={() => {
                    const stored = sessionStorage.getItem(DESK_KEY) ?? password;
                    void load(stored, setRows, setError, setPending);
                  }}
                >
                  {pending ? "Refreshing…" : "Refresh"}
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center px-3 text-sm text-muted hover:text-gold"
                  onClick={() => {
                    sessionStorage.removeItem(DESK_KEY);
                    setRows(null);
                    setPassword("");
                    setError("");
                    setQuery("");
                  }}
                >
                  Lock
                </button>
              </div>
            </div>

            <label className="mt-4 block">
              <span className="sr-only">Search the list</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, number, city, or reference"
                className="h-12 w-full border border-line bg-bg px-3 text-fg outline-none placeholder:text-muted"
              />
            </label>

            {error && (
              <p className="mt-4 text-sm text-ember" role="alert">
                {error}
              </p>
            )}

            {view.length === 0 ? (
              <p className="mt-10 text-muted">
                {rows.length === 0 ? "No one has registered yet." : "Nothing matches that search."}
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {view.map((row) => (
                  <li key={`${row.kind}-${row.ref}`} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
                    <div className="min-w-0">
                      <p className="font-display text-xl font-semibold">{row.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {row.phone}
                        {row.kind === "attendee" && row.cohort ? ` · ${row.cohort}` : ""}
                        {row.kind === "volunteer" && row.role ? ` · ${row.role}` : ""}
                        {row.city ? ` · ${row.city}` : ""}
                      </p>
                      {row.note && <p className="mt-2 text-sm text-fg">{row.note}</p>}
                    </div>
                    <div className="text-sm sm:text-right">
                      <p className="uppercase tracking-widest text-gold">
                        {row.kind === "volunteer" ? "Volunteer" : "Attending"}
                      </p>
                      <p className="mt-1 tabular-nums text-muted">{row.ref}</p>
                      <p className="mt-1 text-muted">{formatWhen(row.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-semibold text-gold sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

function FilterChip({
  pressed,
  onClick,
  label,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center px-3 text-sm ${
        pressed ? "bg-gold text-bg" : "border border-line text-fg hover:border-gold"
      }`}
    >
      {label}
    </button>
  );
}

async function load(
  password: string,
  setRows: (rows: DeskRow[] | null) => void,
  setError: (error: string) => void,
  setPending: (pending: boolean) => void,
) {
  setPending(true);
  setError("");
  try {
    const result = await openDesk({ data: { password } });
    if (!result.ok) {
      sessionStorage.removeItem(DESK_KEY);
      setRows(null);
      setError(result.error);
      return;
    }
    setRows(result.rows);
  } catch {
    setError("The list could not be opened just now. Try again in a moment.");
  } finally {
    setPending(false);
  }
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function downloadCsv(rows: DeskRow[]) {
  const header = ["Reference", "Kind", "Name", "Phone", "Detail", "City", "Note", "Registered"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.ref,
        row.kind,
        row.name,
        row.phone,
        row.kind === "volunteer" ? row.role : row.cohort,
        row.city,
        row.note,
        row.createdAt,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "24-hours-with-jesus-registrations.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
