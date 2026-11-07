import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Flame, Menu, X } from "lucide-react";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { submitRegistration, type SubmitResult } from "@/lib/registrations";
import { COHORTS, ROLES, VENUE_LINES, phoneKey, type SignupKind } from "@/lib/retreat";

const START = Date.parse("2026-11-27T14:00:00+01:00");
const END = Date.parse("2026-11-28T14:00:00+01:00");

const NAV = [
  { href: "#about", label: "Gathering" },
  { href: "#flow", label: "Flow" },
  { href: "#ministers", label: "Ministers" },
  { href: "#give", label: "Support" },
  { href: "#register", label: "Register" },
] as const;

type Tone = "peak" | "pause" | "still";

type Block = {
  time: string;
  title: string;
  tone: Tone;
};

type Day = {
  id: string;
  label: string;
  when: string;
  blocks: Block[];
};

const DAYS: Day[] = [
  {
    id: "friday",
    label: "Friday",
    when: "November 27",
    blocks: [
      { time: "1:00 PM – 2:00 PM", title: "Arrival & Registration", tone: "pause" },
      { time: "2:00 PM – 4:30 PM", title: "Session 1 — The Awakening / Opening Fire", tone: "peak" },
      { time: "4:30 PM – 5:30 PM", title: "Break 1 — Afternoon Refresh & Networking", tone: "pause" },
      { time: "5:30 PM – 8:00 PM", title: "Session 2 — The Burden & Word", tone: "peak" },
      { time: "8:00 PM – 9:30 PM", title: "Break 2 — Dinner & Stretch", tone: "pause" },
      { time: "9:30 PM – 1:30 AM", title: "Session 3 — The Midnight Watch & Crucible", tone: "peak" },
    ],
  },
  {
    id: "night",
    label: "The night",
    when: "Into Saturday",
    blocks: [
      { time: "1:30 AM – 5:30 AM", title: "The Rest / Silent Hours — Soaking & Tarrying", tone: "still" },
    ],
  },
  {
    id: "saturday",
    label: "Saturday",
    when: "November 28",
    blocks: [
      { time: "5:30 AM – 7:30 AM", title: "Morning Glory & Dawn Watch", tone: "peak" },
      { time: "7:30 AM – 9:00 AM", title: "Break 3 — Breakfast & Fresh-up", tone: "pause" },
      { time: "9:00 AM – 12:00 PM", title: "Session 4 — The Mandate", tone: "peak" },
      { time: "12:00 PM – 2:00 PM", title: "Session 5 — The Sending & Closing Fire", tone: "peak" },
    ],
  },
];

const ARCS = [
  { index: "01", title: "Opening Fire", text: "Session 1. The awakening, while the room is still arriving to itself." },
  { index: "02", title: "The Burden", text: "Session 2. The Word, carried before the house sits down to eat." },
  { index: "03", title: "Midnight Watch", text: "The crucible. Minstrels stay with the house past midnight." },
  { index: "04", title: "The Mandate", text: "Saturday. What you were sent to carry, named before the closing fire." },
] as const;

type FieldErrors = {
  name?: string;
  phone?: string;
  choice?: string;
};

type Saved = {
  status: "created" | "updated";
  ref: string;
  name: string;
  kind: SignupKind;
  phone: string;
  detail: string;
  city: string;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "24 Hours with Jesus — Awake, Oh Sent One" },
      {
        name: "description",
        content:
          "The retreat of the year. 5th edition of 24 Hours with Jesus. Friday 27 November 2026, 2:00 PM to Saturday 28 November 2026, 2:00 PM. RCCG Light Headquarters, Ijoko, Ogun State.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signup, setSignup] = useState<SignupKind>("attendee");
  const registerVisible = useOnScreen("register");

  return (
    <div id="top" className="min-h-screen bg-bg text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-3 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <Header
        open={menuOpen}
        onToggle={() => setMenuOpen((value) => !value)}
        onNavigate={() => setMenuOpen(false)}
        onAttend={() => setSignup("attendee")}
      />
      <main id="main">
        <Hero
          onAttend={() => setSignup("attendee")}
          onVolunteer={() => setSignup("volunteer")}
        />
        <About />
        <Flow />
        <Ministers />
        <Give />
        <Register kind={signup} onKind={setSignup} />
      </main>
      <Footer />
      {!registerVisible && <MobileBar onAttend={() => setSignup("attendee")} />}
    </div>
  );
}

function Header({
  open,
  onToggle,
  onNavigate,
  onAttend,
}: {
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  onAttend: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onNavigate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onNavigate]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <a href="#top" className="flex items-center gap-2" onClick={onNavigate}>
          <Flame className="size-4 text-gold" aria-hidden />
          <span className="font-display text-lg font-semibold">24 Hours</span>
        </a>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Sections">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted hover:text-fg"
              onClick={item.href === "#register" ? onAttend : undefined}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#register"
            onClick={onAttend}
            className="inline-flex h-11 items-center bg-gold px-4 text-sm font-semibold text-bg hover:bg-gold-deep"
          >
            Register / Save Your Spot
          </a>
        </nav>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center border border-line text-fg md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={onToggle}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-line px-5 py-4 md:hidden" aria-label="Sections">
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex h-12 items-center text-base text-fg"
                  onClick={() => {
                    if (item.href === "#register") onAttend();
                    onNavigate();
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function Hero({ onAttend, onVolunteer }: { onAttend: () => void; onVolunteer: () => void }) {
  const now = useNow();
  const phase = phaseOf(now);

  return (
    <section className="hero-dawn relative">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:pt-16 md:pb-20 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gold">
            Mass Invasion Movement ’26
          </p>
          <p className="mt-6 text-sm uppercase tracking-widest text-muted">Presents</p>
          <p className="mt-2 font-display text-2xl font-semibold sm:text-3xl">24 Hours with Jesus</p>
          <h1 className="mt-4 font-display text-5xl font-semibold uppercase leading-none tracking-tight sm:text-7xl lg:text-8xl">
            <span className="block">Awake,</span>
            <span className="mt-2 block text-gold">Oh sent one</span>
          </h1>
          <p className="mt-6 text-lg text-fg">The retreat of the year</p>
          <p className="mt-2 max-w-xl text-muted">
            5th edition · Retreat, refresh, revival · Isaiah 6:1
          </p>
          <dl className="mt-8 grid max-w-xl gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">When</dt>
              <dd className="mt-2 text-fg">
                Friday, 27 November 2026
                <span className="mt-1 block">2:00 PM WAT, prompt</span>
                <span className="mt-1 block text-muted">through Saturday, 28 November, 2:00 PM</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Where</dt>
              <dd className="mt-2 text-fg">
                {VENUE_LINES[0]}
                <span className="mt-1 block text-muted">{VENUE_LINES[1]}</span>
                <span className="mt-1 block text-muted">{VENUE_LINES[2]}</span>
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#register"
              onClick={onAttend}
              className="inline-flex h-12 items-center justify-center bg-gold px-5 text-sm font-semibold text-bg hover:bg-gold-deep"
            >
              Register / Save Your Spot
            </a>
            <a
              href="#register"
              onClick={onVolunteer}
              className="inline-flex h-12 items-center justify-center border border-line px-5 text-sm font-medium text-fg hover:border-gold hover:text-gold"
            >
              Serve on the team
            </a>
          </div>
          <Countdown now={now} phase={phase} />
        </div>
        <figure className="mx-auto w-full max-w-md lg:max-w-none">
          <a href="/media/flyer.jpg" target="_blank" rel="noopener noreferrer" className="block">
            <img
              src="/media/flyer.jpg"
              width={1024}
              height={1280}
              alt="Official flyer. Mass Invasion Movement presents 24 Hours with Jesus, themed Awake, Oh Sent One. Host Min. Olatunde Emmanuel. Friday 27 November, 2 PM WAT, RCCG Light Headquarters, Ijoko."
              className="w-full border border-line"
            />
          </a>
          <figcaption className="mt-3 text-sm text-muted">
            The official notice.{" "}
            <a href="/media/flyer.jpg" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-fg">
              Open the flyer
            </a>
          </figcaption>
        </figure>
      </div>
      <div className="horizon" aria-hidden="true" />
    </section>
  );
}

function Countdown({ now, phase }: { now: number | null; phase: "before" | "live" | "after" }) {
  return (
    <div className="mt-10 max-w-xl border-y border-line py-5">
      <p className="sr-only">
        The retreat runs from Friday 27 November 2026 at 2:00 PM to Saturday 28 November 2026 at 2:00 PM,
        West Africa Time, at RCCG Light Headquarters, Ijoko.
      </p>
      {phase === "before" && (
        <div aria-hidden="true" className="grid grid-cols-4 gap-2">
          <CountCell value={now == null ? "--" : pad(part(START - now).days)} label="Days" />
          <CountCell value={now == null ? "--" : pad(part(START - now).hours)} label="Hrs" />
          <CountCell value={now == null ? "--" : pad(part(START - now).minutes)} label="Mins" />
          <CountCell value={now == null ? "--" : pad(part(START - now).seconds)} label="Secs" />
        </div>
      )}
      {phase === "live" && <p className="font-display text-2xl font-semibold text-gold">The house is awake.</p>}
      {phase === "after" && <p className="font-display text-2xl font-semibold text-fg">This edition has closed.</p>}
      <p className="mt-3 text-sm text-muted">
        {phase === "before" && "Until Friday, 2:00 PM WAT. Doors open at 1:00 PM."}
        {phase === "live" && "Stay through Saturday at 2:00 PM."}
        {phase === "after" && "We meet two or three times a year. The next date comes in its season."}
      </p>
    </div>
  );
}

function CountCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 text-center">
      <p className="font-display text-3xl font-semibold tabular-nums text-gold sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="scroll-mt-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden px-5 py-20 md:py-28">
        <p className="edition-mark absolute -right-1 top-16 hidden text-9xl lg:block" aria-hidden="true">
          05
        </p>
        <div className="relative grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-widest text-gold">The gathering</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
              One day you do not step out of.
            </h2>
            <div className="mt-6 space-y-4 text-lg text-muted">
              <p>
                24 Hours with Jesus is a non-stop retreat for teens, youth, and believers. Prayer, the
                Word, and a room that stays when the evening usually ends.
              </p>
              <p>
                Mass Invasion Movement holds it two or three times a year. This November gathering is
                the fifth. From 2:00 PM Friday until 2:00 PM Saturday, at RCCG Light Headquarters in
                Ijoko, you stay. Arrival opens at 1:00 PM.
              </p>
            </div>
          </div>
          <figure className="mx-auto w-full max-w-sm lg:max-w-none lg:pt-8">
            <div className="ember-field p-3 sm:p-4">
              <img
                src="/media/host.jpg"
                width={364}
                height={549}
                alt="Min. Olatunde Emmanuel, host, in a navy suit."
                className="aspect-3/4 w-full object-cover object-top"
              />
            </div>
            <figcaption className="mt-4">
              <p className="text-xs uppercase tracking-widest text-gold">Host</p>
              <p className="mt-1 font-display text-2xl font-semibold">Min. Olatunde Emmanuel</p>
              <p className="mt-1 text-sm text-muted">And other anointed ministers of God.</p>
            </figcaption>
          </figure>
        </div>
        <dl className="relative mt-14 grid grid-cols-3 gap-4 border-y border-line py-8">
          <div>
            <dt className="font-display text-4xl font-semibold text-gold sm:text-5xl">24</dt>
            <dd className="mt-2 text-sm text-muted">Hours, non-stop</dd>
          </div>
          <div>
            <dt className="font-display text-4xl font-semibold text-gold sm:text-5xl">5th</dt>
            <dd className="mt-2 text-sm text-muted">Milestone edition</dd>
          </div>
          <div>
            <dt className="font-display text-4xl font-semibold text-gold sm:text-5xl">2–3</dt>
            <dd className="mt-2 text-sm text-muted">Times a year</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Flow() {
  return (
    <section id="flow" className="scroll-mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-gold">The hours</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Program flow and three breaks
          </h2>
          <p className="mt-4 text-lg text-muted">
            Friday 1:00 PM through Saturday 2:00 PM. The breaks are for food, a stretch, and one
            another. The silent hours are part of the retreat, not a gap in it.
          </p>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-gold" aria-hidden="true" />
            Sessions and watches
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-muted" aria-hidden="true" />
            Arrival and breaks
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-ember" aria-hidden="true" />
            Silent hours
          </li>
        </ul>
        <div className="mt-12 space-y-14">
          {DAYS.map((day) => (
            <div key={day.id}>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-3xl font-semibold">{day.label}</h3>
                <p className="text-sm text-muted">{day.when}</p>
              </div>
              <ol className="border-l border-line">
                {day.blocks.map((block) => (
                  <li key={block.time} className="relative pb-8 pl-6 last:pb-0 md:pl-8">
                    <span
                      className={`absolute top-2 -left-1 size-2 rounded-full ${dotClass(block.tone)}`}
                      aria-hidden="true"
                    />
                    <div className="grid gap-1 md:grid-cols-[13rem_1fr] md:gap-8">
                      <p className="text-sm tabular-nums text-muted">{block.time}</p>
                      <p className={titleClass(block.tone)}>{block.title}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Ministers() {
  return (
    <section id="ministers" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-gold">The voices</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Ministers and minstrels
          </h2>
          <p className="mt-4 text-lg text-muted">
            Min. Olatunde Emmanuel hosts. With him, other anointed ministers of God, and minstrel
            teams for the midnight watch and the dawn. Further names are released before we gather.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {ARCS.map((arc) => (
            <li key={arc.index} className="border border-line bg-surface p-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-xs font-medium uppercase tracking-widest text-gold">Set</p>
                <p className="font-display text-2xl font-semibold text-gold">{arc.index}</p>
              </div>
              <h3 className="mt-8 font-display text-3xl font-semibold">{arc.title}</h3>
              <p className="mt-3 text-muted">{arc.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Give() {
  const [copied, setCopied] = useState(false);

  return (
    <section id="give" className="scroll-mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-end md:py-28">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gold">Support</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Stand with the gathering
          </h2>
          <p className="mt-4 max-w-md text-lg text-muted">
            If you want to help with meals, the hall, and the long night, send it here. Moniepoint.
          </p>
        </div>
        <div className="border border-line bg-bg p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-muted">Account number</p>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums tracking-wide sm:text-5xl">
            9015828778
          </p>
          <p className="mt-4 text-lg">Ayinde Olatunde</p>
          <p className="text-muted">Moniepoint</p>
          <button
            type="button"
            className="mt-6 inline-flex h-12 items-center gap-2 border border-line px-4 text-sm font-medium hover:border-gold"
            onClick={async () => {
              const ok = await copyText("9015828778");
              setCopied(ok);
              if (ok) window.setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="size-4 text-gold" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? "Copied" : "Copy account number"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Register({ kind, onKind }: { kind: SignupKind; onKind: (kind: SignupKind) => void }) {
  const formId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cohort, setCohort] = useState("");
  const [role, setRole] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);

  function resetFields() {
    setName("");
    setPhone("");
    setCohort("");
    setRole("");
    setCity("");
    setNote("");
    setErrors({});
    setFormError("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(name, phone, kind === "attendee" ? cohort : role);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    const detail =
      kind === "attendee"
        ? (COHORTS.find((item) => item.id === cohort)?.label ?? "")
        : role;

    setPending(true);
    let result: SubmitResult;
    try {
      result = await submitRegistration({
        data: {
          kind,
          name,
          phone,
          cohort: kind === "attendee" ? detail : "",
          city,
          role: kind === "volunteer" ? role : "",
          note: kind === "volunteer" ? note : "",
        },
      });
    } catch {
      setPending(false);
      setFormError("The desk could not save that just now. Try again in a moment.");
      return;
    }
    setPending(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSaved({
      status: result.status,
      ref: result.ref,
      name: result.name,
      kind: result.kind,
      phone: phone.trim(),
      detail,
      city: city.trim().replace(/\s+/g, " "),
    });
  }

  return (
    <section id="register" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:py-28 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <p className="text-xs font-medium uppercase tracking-widest text-gold">Your spot</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Register. Then come and stay.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Two lists. One for everyone coming to sit in the house. One for the team that will
            serve. Friday registration opens at 1:00 PM. The first session starts at 2:00 PM prompt.
          </p>
          <p className="mt-4 text-sm text-muted">
            Your name stays with the registration desk. It is not published on this page.
          </p>
        </div>

        <div className="border border-line bg-surface p-5 sm:p-8">
          {saved ? (
            <Confirmation
              saved={saved}
              onAnother={() => {
                setSaved(null);
                resetFields();
              }}
            />
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="How you are coming">
                <KindButton
                  pressed={kind === "attendee"}
                  onClick={() => {
                    onKind("attendee");
                    setErrors({});
                  }}
                >
                  I am attending
                </KindButton>
                <KindButton
                  pressed={kind === "volunteer"}
                  onClick={() => {
                    onKind("volunteer");
                    setErrors({});
                  }}
                >
                  I will volunteer
                </KindButton>
              </div>

              <div className="mt-6 space-y-5">
                <Field id={`${formId}-name`} label="Full name" error={errors.name}>
                  <input
                    id={`${formId}-name`}
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass(Boolean(errors.name))}
                    placeholder="Your name"
                    aria-invalid={Boolean(errors.name)}
                  />
                </Field>
                <Field id={`${formId}-phone`} label="WhatsApp number" error={errors.phone}>
                  <input
                    id={`${formId}-phone`}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className={inputClass(Boolean(errors.phone))}
                    placeholder="080…"
                    aria-invalid={Boolean(errors.phone)}
                  />
                </Field>

                {kind === "attendee" ? (
                  <ChoiceGrid
                    legend="I am coming as"
                    name="cohort"
                    value={cohort}
                    error={errors.choice}
                    options={COHORTS.map((item) => ({ id: item.id, label: item.label }))}
                    onChange={setCohort}
                  />
                ) : (
                  <ChoiceGrid
                    legend="I can serve in"
                    name="role"
                    value={role}
                    error={errors.choice}
                    options={ROLES.map((item) => ({ id: item, label: item }))}
                    onChange={setRole}
                  />
                )}

                <Field id={`${formId}-city`} label="City or area" hint="Optional">
                  <input
                    id={`${formId}-city`}
                    name="city"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className={inputClass(false)}
                    placeholder="Where you are coming from"
                  />
                </Field>

                {kind === "volunteer" && (
                  <Field id={`${formId}-note`} label="Note for the team" hint="Optional">
                    <textarea
                      id={`${formId}-note`}
                      name="note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      maxLength={240}
                      rows={3}
                      className="w-full border border-line bg-bg px-3 py-3 text-fg outline-none placeholder:text-muted"
                      placeholder="Experience, or anything the desk should know"
                    />
                  </Field>
                )}
              </div>

              {formError && (
                <p className="mt-4 text-sm text-ember" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-6 inline-flex h-12 w-full items-center justify-center bg-gold px-5 text-sm font-semibold text-bg hover:bg-gold-deep disabled:opacity-60"
              >
                {pending ? "Saving your spot…" : kind === "volunteer" ? "Join the team" : "Register / Save Your Spot"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function KindButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-12 items-center justify-center border px-3 text-sm font-medium ${
        pressed ? "border-gold bg-gold text-bg" : "border-line text-fg hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}

function ChoiceGrid({
  legend,
  name,
  value,
  error,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: string;
  error?: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-fg">{legend}</legend>
      <div className={`mt-2 grid gap-2 ${options.length > 4 ? "grid-cols-2" : "grid-cols-3"}`}>
        {options.map((item) => (
          <label
            key={item.id}
            className="flex min-h-12 cursor-pointer items-center justify-center border border-line px-2 text-center text-sm has-[:checked]:border-gold has-[:checked]:bg-gold has-[:checked]:text-bg"
          >
            <input
              type="radio"
              name={name}
              value={item.id}
              checked={value === item.id}
              onChange={() => onChange(item.id)}
              className="sr-only"
            />
            {item.label}
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-ember" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function Confirmation({ saved, onAnother }: { saved: Saved; onAnother: () => void }) {
  const [copied, setCopied] = useState(false);
  const slip = slipText(saved);
  const wa = `https://wa.me/?text=${encodeURIComponent(slip)}`;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-gold">
        {saved.status === "updated" ? "Details updated" : "You are on the list"}
      </p>
      <h3 className="mt-3 font-display text-3xl font-semibold">{saved.name}, your spot is marked.</h3>
      <p className="mt-3 text-muted">
        {saved.status === "updated"
          ? "This number was already registered. We kept the same reference and updated the details."
          : "Show this reference at the registration table on Friday."}{" "}
        Reference <span className="tabular-nums text-fg">{saved.ref}</span>.
      </p>
      <pre className="mt-6 overflow-x-auto border border-line bg-bg p-4 font-sans text-sm whitespace-pre-wrap text-fg">
        {slip}
      </pre>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 flex-1 items-center justify-center bg-gold px-4 text-sm font-semibold text-bg hover:bg-gold-deep"
        >
          Share on WhatsApp
        </a>
        <button
          type="button"
          onClick={async () => {
            const ok = await copyText(slip);
            setCopied(ok);
            if (ok) window.setTimeout(() => setCopied(false), 2000);
          }}
          className="inline-flex h-12 flex-1 items-center justify-center border border-line px-4 text-sm font-medium text-fg hover:border-gold"
        >
          {copied ? "Copied" : "Copy details"}
        </button>
      </div>
      <button
        type="button"
        onClick={onAnother}
        className="mt-4 text-sm text-muted underline-offset-4 hover:text-gold hover:underline"
      >
        Register another person
      </button>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
      {error && (
        <p className="mt-2 text-sm text-ember" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line pb-28 md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl font-semibold">24 Hours with Jesus</p>
          <p className="mt-1 text-sm text-muted">November edition · Awake, Oh Sent One</p>
          <p className="mt-1 text-sm text-muted">Mass Invasion Movement · #24HOURSWITHJESUS</p>
        </div>
        <div className="text-sm text-muted">
          <p>RCCG Light Headquarters, Ijoko, Ogun State</p>
          <p className="mt-1">27–28 November 2026 · 2:00 PM to 2:00 PM WAT</p>
          <a href="/admin" className="mt-3 inline-flex text-sm text-muted hover:text-gold">
            Registration desk
          </a>
        </div>
      </div>
    </footer>
  );
}

function MobileBar({ onAttend }: { onAttend: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur-md md:hidden">
      <div className="safe-bottom flex items-center justify-between gap-3 px-4 pt-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-gold">Nov 27–28</p>
          <p className="truncate text-sm text-fg">Ijoko, Ogun State</p>
        </div>
        <a
          href="#register"
          onClick={onAttend}
          className="inline-flex h-11 shrink-0 items-center bg-gold px-4 text-sm font-semibold text-bg"
        >
          Register
        </a>
      </div>
    </div>
  );
}

function inputClass(invalid: boolean) {
  return [
    "h-12 w-full border bg-bg px-3 text-fg outline-none placeholder:text-muted",
    invalid ? "border-ember" : "border-line",
  ].join(" ");
}

function dotClass(tone: Tone) {
  if (tone === "peak") return "bg-gold";
  if (tone === "still") return "bg-ember";
  return "bg-muted";
}

function titleClass(tone: Tone) {
  if (tone === "still") return "font-display text-xl font-semibold italic text-gold md:text-2xl";
  return "font-display text-xl font-semibold text-fg md:text-2xl";
}

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function useOnScreen(id: string) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = document.getElementById(id);
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [id]);
  return visible;
}

function phaseOf(now: number | null): "before" | "live" | "after" {
  if (now == null) return "before";
  if (now < START) return "before";
  if (now < END) return "live";
  return "after";
}

function part(ms: number) {
  const safe = Math.max(0, ms);
  const total = Math.floor(safe / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function validate(name: string, phone: string, choice: string): FieldErrors {
  const errors: FieldErrors = {};
  const letters = name.trim().match(/\p{L}/gu);
  if (!letters || letters.length < 2) errors.name = "Enter the name you will register with.";
  if (!phoneKey(phone)) errors.phone = "Enter a WhatsApp number we can reach.";
  if (!choice) errors.choice = "Choose one.";
  return errors;
}

function slipText(saved: Saved) {
  const lines = [
    "24 Hours with Jesus — November edition",
    "Awake, Oh Sent One · 5th edition",
    "Fri 27 Nov 2026, 2:00 PM → Sat 28 Nov 2026, 2:00 PM WAT",
    "RCCG Light Headquarters, Ijoko, Ogun State",
    "",
    `Name: ${saved.name}`,
    `WhatsApp: ${saved.phone}`,
    saved.kind === "volunteer" ? `Volunteer: ${saved.detail}` : `Coming as: ${saved.detail}`,
  ];
  if (saved.city) lines.push(`City: ${saved.city}`);
  lines.push(`Reference: ${saved.ref}`);
  return lines.join("\n");
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
