"use client";

import { useState } from "react";
import { Calendar, MapPin, Video, Users, Plus, Clock, X, Check, Star, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type RSVP = "going" | "interested" | null;

type Event = {
  id: string;
  title: string;
  host: string;
  date: string;
  time: string;
  endTime: string;
  type: "online" | "in-person";
  location: string;
  attendees: number;
  category: string;
  description: string;
  tags: string[];
};

const CATEGORIES = ["All", "Webinar", "Workshop", "Conference", "Networking", "Hackathon", "Meetup"];

const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "The Future of AI in Product Development",
    host: "Product Hunt",
    date: "Fri, Jul 11, 2026",
    time: "6:00 PM",
    endTime: "7:30 PM",
    type: "online",
    location: "Zoom Webinar",
    attendees: 3840,
    category: "Webinar",
    description: "Join product leaders from top AI companies discussing how LLMs are reshaping product thinking, user research, and feature development.",
    tags: ["AI", "Product", "LLMs"],
  },
  {
    id: "2",
    title: "Figma Advanced: Auto Layout & Components",
    host: "DesignIndia",
    date: "Sat, Jul 12, 2026",
    time: "10:00 AM",
    endTime: "1:00 PM",
    type: "online",
    location: "Google Meet",
    attendees: 712,
    category: "Workshop",
    description: "Deep dive into Figma's advanced features. You'll leave with a reusable component library and a solid understanding of responsive layouts.",
    tags: ["Design", "Figma", "UI"],
  },
  {
    id: "3",
    title: "Bengaluru Tech Summit 2026",
    host: "TiE Bangalore",
    date: "Thu, Jul 17, 2026",
    time: "9:00 AM",
    endTime: "6:00 PM",
    type: "in-person",
    location: "KTPO Convention Centre, Whitefield, Bengaluru",
    attendees: 5200,
    category: "Conference",
    description: "India's largest annual tech summit featuring keynotes from global tech leaders, startup pitches, and networking sessions.",
    tags: ["Tech", "Startups", "Networking"],
  },
  {
    id: "4",
    title: "Full-Stack Dev Meetup — React & Next.js",
    host: "Atlas Community",
    date: "Sat, Jul 19, 2026",
    time: "3:00 PM",
    endTime: "6:00 PM",
    type: "in-person",
    location: "91springboard, Koramangala, Bengaluru",
    attendees: 156,
    category: "Meetup",
    description: "Monthly meetup for React and Next.js developers. Lightning talks, code reviews, and networking over pizza.",
    tags: ["React", "Next.js", "Web"],
  },
  {
    id: "5",
    title: "GenAI Hackathon — Build with Claude",
    host: "Anthropic Developer Community",
    date: "Sat–Sun, Jul 26–27, 2026",
    time: "10:00 AM",
    endTime: "8:00 PM",
    type: "online",
    location: "Discord + Devfolio",
    attendees: 2180,
    category: "Hackathon",
    description: "48-hour hackathon building applications powered by Claude API. ₹5 lakh in prizes. Solo or teams of up to 4.",
    tags: ["GenAI", "Claude", "Hackathon"],
  },
  {
    id: "6",
    title: "Career Networking Night — Tech Edition",
    host: "LinkedIn Local Hyderabad",
    date: "Wed, Jul 23, 2026",
    time: "7:00 PM",
    endTime: "9:30 PM",
    type: "in-person",
    location: "WeWork Rajapushpa Infinia, Hyderabad",
    attendees: 320,
    category: "Networking",
    description: "Speed networking for tech professionals. Come with business cards, leave with a stronger professional network.",
    tags: ["Networking", "Career", "Tech"],
  },
  {
    id: "7",
    title: "Data Engineering with Apache Spark",
    host: "DataTech India",
    date: "Sun, Aug 3, 2026",
    time: "11:00 AM",
    endTime: "2:00 PM",
    type: "online",
    location: "Zoom Webinar",
    attendees: 945,
    category: "Workshop",
    description: "Hands-on workshop covering Apache Spark fundamentals, PySpark, Delta Lake, and building production data pipelines.",
    tags: ["Data", "Spark", "Python"],
  },
  {
    id: "8",
    title: "SaaS Founders Roundtable — Product-Market Fit",
    host: "Lightspeed India",
    date: "Thu, Aug 7, 2026",
    time: "5:00 PM",
    endTime: "6:30 PM",
    type: "online",
    location: "Exclusive invite link",
    attendees: 88,
    category: "Networking",
    description: "Intimate roundtable for early-stage SaaS founders. Discuss PMF signals, early GTM strategies, and first 100 customers.",
    tags: ["SaaS", "Founders", "GTM"],
  },
];

function formatAttendees(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

export default function EventsPage() {
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<"upcoming" | "my-events">("upcoming");
  const [rsvps, setRsvps] = useState<Record<string, RSVP>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createType, setCreateType] = useState<"online" | "in-person">("online");
  const [createLocation, setCreateLocation] = useState("");
  const [createDesc, setCreateDesc] = useState("");

  function setRsvp(id: string, status: RSVP) {
    setRsvps((r) => ({ ...r, [id]: r[id] === status ? null : status }));
  }

  const myEvents = MOCK_EVENTS.filter((e) => rsvps[e.id] === "going" || rsvps[e.id] === "interested");

  const filtered = MOCK_EVENTS.filter((e) => category === "All" || e.category === category);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createTitle.trim()) return;
    setShowCreate(false);
    setCreateTitle("");
    setCreateDate("");
    setCreateLocation("");
    setCreateDesc("");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Events</h1>
          <p className="text-sm text-muted mt-1">Webinars, workshops, conferences, and meetups</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-accent flex items-center gap-1.5">
          <Plus size={16} /> Create event
        </button>
      </div>

      {/* Create event modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Create an event</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Event title</label>
                <input
                  className="input"
                  placeholder="e.g. React Performance Workshop"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input" value={createDate} onChange={(e) => setCreateDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Format</label>
                  <select
                    className="input"
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as "online" | "in-person")}
                  >
                    <option value="online">Online</option>
                    <option value="in-person">In-person</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">{createType === "online" ? "Meeting link / Platform" : "Venue address"}</label>
                <input
                  className="input"
                  placeholder={createType === "online" ? "e.g. Zoom, Google Meet" : "e.g. 91springboard, Koramangala"}
                  value={createLocation}
                  onChange={(e) => setCreateLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="What will attendees learn or gain?"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-accent w-full" disabled={!createTitle.trim()}>
                Create event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { id: "upcoming", label: "Upcoming" },
          { id: "my-events", label: `My events${myEvents.length ? ` (${myEvents.length})` : ""}` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "upcoming" | "my-events")}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-teal text-teal" : "border-transparent text-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "upcoming" && (
        <>
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "chip transition-colors",
                  category === c ? "chip-teal" : "hover:bg-teal-light hover:text-teal-dark"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                rsvp={rsvps[event.id] ?? null}
                onRsvp={setRsvp}
                expanded={expanded === event.id}
                onToggleExpand={() => setExpanded(expanded === event.id ? null : event.id)}
              />
            ))}
          </div>
        </>
      )}

      {tab === "my-events" && (
        <div>
          {myEvents.length === 0 ? (
            <div className="card p-10 text-center">
              <Calendar size={32} className="mx-auto text-muted mb-3" />
              <p className="text-sm font-medium text-ink">No events yet</p>
              <p className="text-xs text-muted mt-1">Mark yourself as Going or Interested on upcoming events.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  rsvp={rsvps[event.id] ?? null}
                  onRsvp={setRsvp}
                  expanded={expanded === event.id}
                  onToggleExpand={() => setExpanded(expanded === event.id ? null : event.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  rsvp,
  onRsvp,
  expanded,
  onToggleExpand,
}: {
  event: Event;
  rsvp: RSVP;
  onRsvp: (id: string, status: RSVP) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex gap-4">
        {/* Date badge */}
        <div className="shrink-0 w-12 text-center">
          <div className="bg-teal text-white text-[10px] font-semibold uppercase rounded-t px-1 py-0.5 leading-tight">
            {event.date.split(", ")[1]?.split(" ")[0]}
          </div>
          <div className="border border-t-0 border-border rounded-b px-1 py-1">
            <p className="font-display text-xl text-ink leading-none">{event.date.split(" ")[3]?.replace(",", "")}</p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink leading-tight">{event.title}</p>
          <p className="text-xs text-muted mt-0.5">{event.host}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {event.time} – {event.endTime}
            </span>
            <span className="flex items-center gap-1">
              {event.type === "online" ? <Video size={11} /> : <MapPin size={11} />}
              {event.location}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} /> {formatAttendees(event.attendees)} attending
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {event.tags.map((tag) => (
              <span key={tag} className="chip text-[10px] py-0">{tag}</span>
            ))}
            <span
              className={cn(
                "chip text-[10px] py-0",
                event.type === "online" ? "chip-teal" : "chip-coral"
              )}
            >
              {event.type === "online" ? "Online" : "In-person"}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable description */}
      {expanded && (
        <p className="text-xs text-muted border-t border-border pt-3">{event.description}</p>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <button
          onClick={() => onRsvp(event.id, "going")}
          className={cn(
            "btn-sm flex items-center gap-1.5 flex-1 justify-center",
            rsvp === "going" ? "btn-accent" : "btn-outline"
          )}
        >
          {rsvp === "going" ? <Check size={13} /> : null}
          Going
        </button>
        <button
          onClick={() => onRsvp(event.id, "interested")}
          className={cn(
            "btn-sm flex items-center gap-1.5 flex-1 justify-center",
            rsvp === "interested" ? "bg-amber-light text-amber-dark border border-amber/30 rounded-lg" : "btn-outline"
          )}
        >
          {rsvp === "interested" ? <Star size={13} className="fill-amber text-amber" /> : <Star size={13} />}
          Interested
        </button>
        <button onClick={onToggleExpand} className="btn-ghost btn-sm text-muted flex items-center gap-1">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Less" : "More"}
        </button>
      </div>
    </div>
  );
}
