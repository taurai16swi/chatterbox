
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  WAITLIST_COUNTRIES as countryOptions,
  WAITLIST_FEATURES as formFeatureOptions,
  WAITLIST_REFERRAL_SOURCES as hearingOptions,
} from "@/lib/waitlist/contract";
import { submitWaitlist } from "@/lib/waitlist/client";

const navItems = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#features", label: "Features" },
  { href: "/#roadmap", label: "Roadmap" },
  { href: "/#faq", label: "FAQ" },
];

const roadmapGroups = [
  {
    title: "Initial experience",
    setLabel: "Initial focus",
    items: [
      "Personal profiles",
      "ChatterTags",
      "Contacts",
      "Direct messaging",
      "Basic settings",
    ],
  },
  {
    title: "Planned enhancements",
    setLabel: "Planned",
    items: [
      "Photo and document sharing",
      "Improved conversation experience",
      "Additional account controls",
    ],
  },
  {
    title: "Future exploration",
    setLabel: "Future exploration",
    items: [
      "Voice notes",
      "Audio/video calling",
      "Group conversations",
      "Social posts and photo/video clips",
      "Likes and comments",
      "Communities and channels",
      "Home feed",
      "Chatter AI assistant (later development stage)",
      "Business registration, profiles and communication services (later stage)",
      "ChatterWallet: peer-to-peer payments and transaction history (separate high-risk domain)",
      "Potential crypto services or trading (under consideration)",
    ],
  },
];

const featureCards = [
  {
    title: "Personal profiles",
    text: "Create a profile with a display name, profile picture, bio and ChatterTag.",
  },
  {
    title: "ChatterTags",
    text: "A unique identity concept to help users find and connect with others.",
  },
  {
    title: "Direct messaging",
    text: "A planned private messaging experience designed to feel personal and effortless.",
  },
  {
    title: "Photo and document sharing",
    text: "Planned sharing of images and files in a focused, easy-to-use experience.",
  },
  {
    title: "Contacts",
    text: "A dedicated place to maintain meaningful connections and conversations.",
  },
  {
    title: "Privacy-conscious settings",
    text: "An intended settings experience with account and privacy controls.",
  },
  {
    title: "Future voice notes and calls",
    text: "Voice notes and calls are part of the longer-term roadmap, not a current launch promise.",
  },
  {
    title: "Communities and channels",
    text: "A future stage for communities and shared spaces around interests and topics.",
  },
  {
    title: "Future home feed",
    text: "A possible social content experience with posts, likes and comments.",
  },
];

type FormValues = {
  fullName: string;
  email: string;
  country: string;
  chatterTag: string;
  interests: string[];
  source: string;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialFormValues: FormValues = {
  fullName: "",
  email: "",
  country: "",
  chatterTag: "",
  interests: [],
  source: "",
  consent: false,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Please enter your full name.";
  }

  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.interests.length > 3) {
    errors.interests = "Choose up to three priorities.";
  }

  if (!values.consent) {
    errors.consent = "Please confirm that you consent to send this request.";
  }

  return errors;
}

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <main className="min-h-screen bg-[#F8F7FF] text-[#201A4B]">
      <header className="sticky top-0 z-50 border-b border-[#E8E5FA] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Chatterbox home" className="inline-flex items-center">
            <Image
              src="/brand/chatterbox-logo.svg"
              alt="Chatterbox"
              width={240}
              height={80}
              priority
              className="h-auto w-[160px] sm:w-[220px]"
            />
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[#201A4B] transition hover:text-[#5B4BDB]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center md:flex">
            <Link
              href="/#waitlist"
              className="rounded-xl bg-[#5B4BDB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4939C9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BDB] focus-visible:ring-offset-2"
            >
              Join the waitlist
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="inline-flex items-center justify-center rounded-xl border border-[#DDD7FF] bg-white p-2.5 text-[#201A4B] md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div id="mobile-nav" className="border-t border-[#E8E5FA] bg-white md:hidden">
            <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col px-4 py-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-[#201A4B] transition hover:bg-[#F4F1FF]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/#waitlist"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-xl bg-[#5B4BDB] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Join the waitlist
              </Link>
            </nav>
          </div>
        )}
      </header>

      <section id="home" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex rounded-full border border-[#DDD7FF] bg-white px-4 py-2 text-sm font-medium text-[#5B4BDB] shadow-sm">
              Chatterbox
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#201A4B] sm:text-5xl lg:text-6xl">
              Messaging, made simple.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6C6591]">
              Meet Chatterbox — a new way to connect, share and stay in touch. Join the
              waitlist and help shape what we build next.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/#waitlist"
                className="inline-flex items-center justify-center rounded-xl bg-[#5B4BDB] px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#4939C9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BDB] focus-visible:ring-offset-2"
              >
                Join the waitlist
              </Link>

              <a
                href="#about"
                className="inline-flex items-center justify-center rounded-xl border border-[#DCD8F2] bg-white px-6 py-4 text-base font-semibold text-[#201A4B] transition hover:bg-[#F0EDFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BDB] focus-visible:ring-offset-2"
              >
                Explore Chatterbox
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] rounded-[32px] border border-[#EAE5FF] bg-white p-4 shadow-[0_28px_80px_rgba(91,75,219,0.12)] sm:p-6">
            <span className="absolute right-4 top-4 inline-flex rounded-full border border-[#DDD7FF] bg-[#F7F5FF] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5B4BDB]">
              Product concept
            </span>
            <div className="grid gap-5 lg:grid-cols-[240px_1fr_190px]">
              <aside className="rounded-[24px] border border-[#E9E4FF] bg-[#F7F5FF] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5B4BDB] text-sm font-bold text-white">
                      CB
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#201A4B]">Messages</p>
                      <p className="text-xs text-[#6C6591]">12 active</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-[#DDD7FF] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5B4BDB]"
                  >
                    New
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["Lina", "Hey! Want to trade…", "Now"],
                    ["Ava", "Photo upload ready", "12m"],
                    ["Dev team", "Roadmap update", "1h"],
                    ["Maya", "See you tonight!", "2h"],
                  ].map(([name, preview, time]) => (
                    <div
                      key={String(name)}
                      className="flex items-center justify-between rounded-2xl border border-transparent bg-white/60 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAE6FF] text-xs font-semibold text-[#201A4B]">
                          {String(name).slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#201A4B]">{name}</p>
                          <p className="text-xs text-[#6C6591]">{preview}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A84A8]">
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </aside>

              <main className="rounded-[24px] border border-[#E9E4FF] bg-[#F9F8FF] p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-[#EAE5FF] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B4BDB] text-sm font-bold text-white">
                      L
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#201A4B]">Lina Hart</p>
                      <p className="text-xs text-[#5B4BDB]">online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#5B4BDB]">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium">active</span>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-start">
                    <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-[#201A4B] shadow-sm">
                      Hey! I’ve been thinking about the launch plan and the community first steps.
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[78%] rounded-2xl rounded-br-md bg-[#EAE5FF] px-4 py-3 text-sm leading-6 text-[#201A4B] shadow-sm">
                      Absolutely. I want a place that feels personal and easy to keep up with.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-[#201A4B] shadow-sm">
                      Perfect. We can keep it simple: profiles, direct chats, and a shared space for updates.
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#E9E4FF] bg-white p-2.5">
                  <button
                    type="button"
                    className="rounded-xl border border-[#E9E4FF] bg-[#F7F5FF] px-3 py-2 text-xs font-medium text-[#5B4BDB]"
                  >
                    + Add
                  </button>
                  <input
                    aria-label="Message draft"
                    value="I can’t wait to see this."
                    readOnly
                    className="flex-1 bg-transparent text-sm text-[#201A4B] outline-none"
                  />
                  <button
                    type="button"
                    className="rounded-xl bg-[#5B4BDB] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Send
                  </button>
                </div>
              </main>

              <aside className="rounded-[24px] border border-[#E9E4FF] bg-[#F7F5FF] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#8B7CF6,#5B4BDB)] text-sm font-bold text-white">
                      LH
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#201A4B]">Lina Hart</p>
                      <p className="text-xs text-[#6C6591]">@linah</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 rounded-2xl bg-white p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A84A8]">
                      Bio
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#201A4B]">
                      Building quieter, simpler ways to connect.
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A84A8]">
                      ChatterTag
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#5B4BDB]">#community-first</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#E9E4FF] bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A84A8]">
                    Shared
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-[#201A4B]">
                    <div className="rounded-xl bg-[#F7F5FF] px-3 py-2">Launch notes.pdf</div>
                    <div className="rounded-xl bg-[#F7F5FF] px-3 py-2">Brand moodboard.png</div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-[#E8E5FA] bg-[#F3F1FF] px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B4BDB]">
            About Chatterbox
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#201A4B] sm:text-4xl">
            More meaningful ways to stay connected.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#6C6591]">
            Chatterbox is being developed as a messaging platform designed to make
            communication simple and personal. It is built around the idea of helping people
            stay in touch with less friction and more intention — while leaving room to grow
            alongside the community that shapes it.
          </p>

          <div className="mt-10 grid gap-5 text-left md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Personal profiles", "Create a profile that feels like you."],
              ["Easier connections", "Find and connect with the people who matter."],
              ["Direct messaging", "Private conversations designed for clarity."],
              ["Shared moments", "Photos, documents, and updates in one place."],
            ].map(([title, text]) => (
              <div key={String(title)} className="rounded-2xl border border-[#E9E4FF] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#201A4B]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6C6591]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B4BDB]">
              Core features
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#201A4B] sm:text-4xl">
              A platform designed to grow with its community.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-[#E9E4FF] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAE6FF] text-lg font-bold text-[#5B4BDB]">
                  ✦
                </div>
                <h3 className="text-xl font-semibold text-[#201A4B]">{feature.title}</h3>
                <p className="mt-3 text-base leading-7 text-[#6C6591]">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[#E8E5FA] bg-[#F9F8FF] px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B4BDB]">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#201A4B] sm:text-4xl">
              A simple path from interest to early conversation.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              "Join the waitlist.",
              "Tell us what matters to you.",
              "Follow the journey as Chatterbox develops.",
            ].map((step, index) => (
              <div key={step} className="rounded-2xl border border-[#E9E4FF] bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5B4BDB]">
                  0{index + 1}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[#201A4B]">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap" className="px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B4BDB]">
              Product roadmap
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#201A4B] sm:text-4xl">
              An indicative roadmap for the next chapter.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#6C6591]">
              This roadmap outlines possible product direction, not a delivery commitment.
              Later-stage and exploratory ideas may change and require further security,
              regulatory, and product review.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {roadmapGroups.map((group) => (
              <div key={group.title} className="rounded-[28px] border border-[#E9E4FF] bg-white p-6 shadow-sm">
                <span className="inline-flex rounded-full border border-[#DDD7FF] bg-[#F7F5FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B4BDB]">
                  {group.setLabel}
                </span>
                <h3 className="mt-4 text-2xl font-semibold text-[#201A4B]">{group.title}</h3>
                <ul className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#201A4B]">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#5B4BDB]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist" className="border-t border-[#E8E5FA] bg-[#F3F1FF] px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B4BDB]">
                Join the list
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#201A4B] sm:text-4xl">
                Be part of the conversation.
              </h2>
              <p className="mt-4 max-w-md text-lg leading-8 text-[#6C6591]">
                Join the Chatterbox waitlist and tell us what you’d love to see.
              </p>
            </div>

            <WaitlistForm />
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B4BDB]">
              FAQ
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#201A4B] sm:text-4xl">
              Common questions
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {[
              {
                question: "What is Chatterbox?",
                answer:
                  "Chatterbox is a messaging platform concept currently in development. It is being designed to help people connect in a simple, personal, and more meaningful way.",
              },
              {
                question: "Is Chatterbox available yet?",
                answer:
                  "Not yet. Chatterbox is still under development, and the current website is a public-facing preview focused on product direction and early interest.",
              },
              {
                question: "What is a ChatterTag?",
                answer:
                  "A ChatterTag is an identity concept intended to help users express themselves and discover people they may want to connect with in a friendly, recognisable way.",
              },
              {
                question: "Is my preferred ChatterTag guaranteed?",
                answer:
                  "No. A preferred ChatterTag is only a request. Chatterbox does not confirm availability, reserve it, or assign a username through this form.",
              },
              {
                question: "What features are being planned?",
                answer:
                  "The roadmap spans messaging, social features, a Chatter AI assistant, business services, and longer-term ChatterWallet and potential crypto ideas. Many are later-stage or exploratory; features and timing may change and are not delivery commitments.",
              },
              {
                question: "Does joining the waitlist create an account?",
                answer:
                  "Submitting the form sends a waitlist request to Chatterbox for consideration. It does not create an account, verify your email, or reserve a ChatterTag.",
              },
              {
                question: "How will my information be handled?",
                answer:
                  "The form sends the information you provide to the Chatterbox server for waitlist consideration. No email verification is currently performed. A privacy notice has not yet been published, so avoid submitting personal information until one is available.",
              },
            ].map((item, index) => {
              const isOpen = faqOpen === index;
              return (
                <div key={item.question} className="rounded-2xl border border-[#E9E4FF] bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                  >
                    <span className="text-base font-semibold text-[#201A4B]">{item.question}</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2EEFF] text-lg font-medium text-[#5B4BDB]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#F0ECFF] px-5 py-4 text-base leading-7 text-[#6C6591]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#201A4B] px-5 py-16 text-white sm:px-6 lg:py-20">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-[#2A234F] p-8 text-center shadow-[0_20px_60px_rgba(17,12,40,0.35)] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C6BEFF]">
            Your next conversation starts here
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Help shape the future of Chatterbox.
          </h2>
          <Link
            href="/#waitlist"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-4 text-base font-semibold text-[#201A4B] transition hover:bg-[#F3F0FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#201A4B]"
          >
            Explore the waitlist
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#E8E5FA] bg-white px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="Chatterbox home" className="inline-flex items-center">
              <Image
                src="/brand/chatterbox-logo.svg"
                alt="Chatterbox"
                width={240}
                height={80}
                className="h-auto w-[180px]"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#6C6591]">Messaging, made simple.</p>
            <p className="mt-4 text-sm text-[#6C6591]">BuildCore Technologies Limited</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#201A4B]">
              Explore
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#6C6591]">
              <li>
                <Link href="/#about" className="hover:text-[#5B4BDB]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-[#5B4BDB]">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#5B4BDB]">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#201A4B]">
              Waitlist
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#6C6591]">
              <li>
                <Link href="/#waitlist" className="hover:text-[#5B4BDB]">
                  Join the waitlist
                </Link>
              </li>
              <li>
                <Link href="/#roadmap" className="hover:text-[#5B4BDB]">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#201A4B]">
              Company
            </h3>
            <p className="mt-4 text-sm text-[#6C6591]">BuildCore Technologies Limited</p>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-6xl border-t border-[#E8E5FA] pt-5 text-center text-sm text-[#8A84A8]">
          © {new Date().getFullYear()} Chatterbox. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

function WaitlistForm() {
  const [values, setValues] = useState<FormValues>(initialFormValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  const featureSlotsRemaining = useMemo(
    () => Math.max(0, 3 - values.interests.length),
    [values.interests.length],
  );

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggleFeature = (feature: string) => {
    setValues((current) => {
      const alreadySelected = current.interests.includes(feature);
      if (alreadySelected) {
        return {
          ...current,
          interests: current.interests.filter((item) => item !== feature),
        };
      }

      if (current.interests.length >= 3) {
        setErrors((existing) => ({
          ...existing,
          interests: "Choose up to three priorities.",
        }));
        return current;
      }

      return { ...current, interests: [...current.interests, feature] };
    });

    setErrors((current) => ({ ...current, interests: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitWaitlist({
        ...values,
        website: honeypotRef.current?.value ?? "",
      });

      if (!result.ok) {
        setErrors((current) => ({ ...current, ...result.fields }));
        setFormError(result.message);
        return;
      }

      setSubmissionMessage(result.message);
      setSubmitted(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We could not submit your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialFormValues);
    setErrors({});
    setIsSubmitting(false);
    setFormError("");
    setSubmissionMessage("");
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="rounded-[28px] border border-[#E9E4FF] bg-white p-6 shadow-[0_20px_60px_rgba(91,75,219,0.08)] sm:p-8">
        <span className="inline-flex rounded-full border border-[#DDD7FF] bg-[#F6F3FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5B4BDB]">
          Frontend preview
        </span>
        <h3 className="mt-5 text-3xl font-bold text-[#201A4B]">Thanks for your interest.</h3>
        <p className="mt-4 text-base leading-7 text-[#6C6591]">
          {submissionMessage}
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-6 inline-flex rounded-xl bg-[#5B4BDB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4939C9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BDB] focus-visible:ring-offset-2"
        >
          Back to form
        </button>
      </div>
    );
  }

  return (
    <form id="waitlist-form" onSubmit={handleSubmit} noValidate className="relative rounded-[28px] border border-[#E9E4FF] bg-white p-5 shadow-[0_18px_60px_rgba(91,75,219,0.06)] sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B4BDB]">Waitlist</p>
        <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#201A4B] sm:text-4xl">
          Be part of the conversation.
        </h3>
        <p className="mt-3 text-base leading-7 text-[#6C6591]">
          Join the Chatterbox waitlist and tell us what you’d love to see.
        </p>
      </div>

      <div aria-hidden="true" className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input
          ref={honeypotRef}
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {formError && <p role="alert" className="mb-5 text-sm text-[#B42318]">{formError}</p>}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="fullName" className="mb-2 flex items-center gap-2 text-sm font-medium text-[#201A4B]">
            Full name <span className="text-[#5B4BDB]">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={values.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            placeholder="Your full name"
            className="w-full rounded-xl border border-[#E9E4FF] bg-[#F9F8FF] px-4 py-3 text-base text-[#201A4B] outline-none transition placeholder:text-[#8A84A8] focus:border-[#5B4BDB] focus:ring-2 focus:ring-[#C9C4FF]"
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-2 text-sm text-[#B42318]">
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-medium text-[#201A4B]">
            Email address <span className="text-[#5B4BDB]">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-[#E9E4FF] bg-[#F9F8FF] px-4 py-3 text-base text-[#201A4B] outline-none transition placeholder:text-[#8A84A8] focus:border-[#5B4BDB] focus:ring-2 focus:ring-[#C9C4FF]"
          />
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-[#B42318]">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="country" className="mb-2 block text-sm font-medium text-[#201A4B]">
            Country <span className="text-[#8A84A8]">(optional)</span>
          </label>
          <select
            id="country"
            value={values.country}
            onChange={(event) => updateField("country", event.target.value)}
            className="w-full rounded-xl border border-[#E9E4FF] bg-[#F9F8FF] px-4 py-3 text-base text-[#201A4B] outline-none transition focus:border-[#5B4BDB] focus:ring-2 focus:ring-[#C9C4FF]"
          >
            <option value="">Select a country</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="chatterTag" className="mb-2 block text-sm font-medium text-[#201A4B]">
            Preferred ChatterTag <span className="text-[#8A84A8]">(optional)</span>
          </label>
          <input
            id="chatterTag"
            name="chatterTag"
            type="text"
            value={values.chatterTag}
            onChange={(event) =>
              updateField("chatterTag", event.target.value.replace(/\s+/g, " ").trimStart())
            }
            placeholder="@yourtag"
            className="w-full rounded-xl border border-[#E9E4FF] bg-[#F9F8FF] px-4 py-3 text-base text-[#201A4B] outline-none transition placeholder:text-[#8A84A8] focus:border-[#5B4BDB] focus:ring-2 focus:ring-[#C9C4FF]"
          />
          <p className="mt-2 text-xs leading-5 text-[#6C6591]">
            Your preferred ChatterTag is a request only. It is not reserved or guaranteed.
          </p>
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="mb-3 block text-sm font-medium text-[#201A4B]">
          Features you are interested in <span className="text-[#8A84A8]">(choose up to 3)</span>
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          {formFeatureOptions.map((feature) => {
            const checked = values.interests.includes(feature);
            const disabled = !checked && values.interests.length >= 3;

            return (
              <label
                key={feature}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm text-[#201A4B] transition ${
                  checked ? "border-[#5B4BDB] bg-[#F3F0FF]" : "border-[#E9E4FF] bg-[#F9F8FF]"
                } ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-[#CCC4FF]"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFeature(feature)}
                  disabled={disabled}
                  className="mt-1 h-4 w-4 accent-[#5B4BDB]"
                />
                <span>{feature}</span>
              </label>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#6C6591]">
          <span>
            {featureSlotsRemaining > 0
              ? `${featureSlotsRemaining} slots remaining`
              : "Maximum reached"}
          </span>
          {errors.interests && <span className="text-[#B42318]">{errors.interests}</span>}
        </div>
      </fieldset>

      <div className="mt-8">
        <label htmlFor="source" className="mb-2 block text-sm font-medium text-[#201A4B]">
          How did you hear about Chatterbox? <span className="text-[#8A84A8]">(optional)</span>
        </label>
        <select
          id="source"
          value={values.source}
          onChange={(event) => updateField("source", event.target.value)}
          className="w-full rounded-xl border border-[#E9E4FF] bg-[#F9F8FF] px-4 py-3 text-base text-[#201A4B] outline-none transition focus:border-[#5B4BDB] focus:ring-2 focus:ring-[#C9C4FF]"
        >
          <option value="">Select an option</option>
          {hearingOptions.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </div>

      <div className="mt-8 rounded-2xl border border-[#E9E4FF] bg-[#F7F5FF] p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#201A4B]">
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(event) => updateField("consent", event.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            className="mt-1 h-4 w-4 accent-[#5B4BDB]"
          />
          <span>
            I agree to submit this information to express interest in Chatterbox and understand
            that this does not create an account, verify my email, or reserve a ChatterTag.
          </span>
        </label>
        <p className="mt-3 text-xs leading-5 text-[#6C6591]">
          Your details will be sent to Chatterbox for waitlist consideration. No email
          verification is performed. A privacy notice is not yet available.
        </p>
        {errors.consent && <p className="mt-2 text-sm text-[#B42318]">{errors.consent}</p>}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-[#5B4BDB] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4939C9] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BDB] focus-visible:ring-offset-2"
        >
          {isSubmitting ? "Submitting…" : "Join the waitlist"}
        </button>
        <p className="text-xs leading-5 text-[#6C6591]">
          This request does not create an account or reserve a ChatterTag.
        </p>
      </div>
    </form>
  );
}
