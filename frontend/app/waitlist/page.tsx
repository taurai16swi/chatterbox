"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  WAITLIST_COUNTRIES as countryOptions,
  WAITLIST_FEATURES as featureOptions,
  WAITLIST_REFERRAL_SOURCES as sourceOptions,
} from "@/lib/waitlist/contract";
import { submitWaitlist } from "@/lib/waitlist/client";

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

const initialValues: FormValues = {
  fullName: "",
  email: "",
  country: "",
  chatterTag: "",
  interests: [],
  source: "",
  consent: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.fullName.trim()) errors.fullName = "Please enter your full name.";

  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!emailPattern.test(values.email.trim())) {
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

export default function WaitlistPage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const remainingSlots = useMemo(
    () => Math.max(0, 3 - values.interests.length),
    [values.interests.length],
  );

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggleFeature = (feature: string) => {
    setValues((current) => {
      const hasSelected = current.interests.includes(feature);
      if (hasSelected) {
        return {
          ...current,
          interests: current.interests.filter((item) => item !== feature),
        };
      }

      if (current.interests.length >= 3) {
        setErrors((existing) => ({ ...existing, interests: "Choose up to three priorities." }));
        return current;
      }

      return { ...current, interests: [...current.interests, feature] };
    });
    setErrors((current) => ({ ...current, interests: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) return;

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
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
    setFormError("");
    setSubmissionMessage("");
    setSubmitted(false);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#F8F7FF] text-[#201A4B]">
      <header className="sticky top-0 z-50 border-b border-[#E8E5FA] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
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
            <Link href="/#home" className="text-sm font-medium text-[#201A4B] hover:text-[#5B4BDB]">Home</Link>
            <Link href="/#about" className="text-sm font-medium text-[#201A4B] hover:text-[#5B4BDB]">About</Link>
            <Link href="/#features" className="text-sm font-medium text-[#201A4B] hover:text-[#5B4BDB]">Features</Link>
            <Link href="/#roadmap" className="text-sm font-medium text-[#201A4B] hover:text-[#5B4BDB]">Roadmap</Link>
            <Link href="/#faq" className="text-sm font-medium text-[#201A4B] hover:text-[#5B4BDB]">FAQ</Link>
          </nav>

          <div className="hidden items-center md:flex">
            <Link
              href="/#waitlist"
              className="rounded-xl bg-[#5B4BDB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4939C9]"
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
              {[
                ["/#home", "Home"],
                ["/#about", "About"],
                ["/#features", "Features"],
                ["/#roadmap", "Roadmap"],
                ["/#faq", "FAQ"],
              ].map(([href, label]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-[#201A4B] transition hover:bg-[#F4F1FF]"
                >
                  {label}
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

      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B4BDB]">Join the list</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#201A4B] sm:text-4xl">
              Be part of the conversation.
            </h1>
            <p className="mt-4 max-w-md text-lg leading-8 text-[#6C6591]">
              Join the Chatterbox waitlist and tell us what you’d love to see.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-[28px] border border-[#E9E4FF] bg-white p-6 shadow-[0_20px_60px_rgba(91,75,219,0.08)] sm:p-8">
              <span className="inline-flex rounded-full border border-[#DDD7FF] bg-[#F6F3FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5B4BDB]">
                Frontend preview
              </span>
              <h2 className="mt-5 text-3xl font-bold text-[#201A4B]">Thanks for your interest.</h2>
              <p className="mt-4 text-base leading-7 text-[#6C6591]">{submissionMessage}</p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-6 inline-flex rounded-xl bg-[#5B4BDB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4939C9]"
              >
                Back to form
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="relative rounded-[28px] border border-[#E9E4FF] bg-white p-5 shadow-[0_18px_60px_rgba(91,75,219,0.06)] sm:p-8">
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
                    type="text"
                    value={values.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-[#E9E4FF] bg-[#F9F8FF] px-4 py-3 text-base text-[#201A4B] outline-none transition placeholder:text-[#8A84A8] focus:border-[#5B4BDB] focus:ring-2 focus:ring-[#C9C4FF]"
                  />
                  {errors.fullName && <p id="fullName-error" className="mt-2 text-sm text-[#B42318]">{errors.fullName}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-medium text-[#201A4B]">
                    Email address <span className="text-[#5B4BDB]">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#E9E4FF] bg-[#F9F8FF] px-4 py-3 text-base text-[#201A4B] outline-none transition placeholder:text-[#8A84A8] focus:border-[#5B4BDB] focus:ring-2 focus:ring-[#C9C4FF]"
                  />
                  {errors.email && <p id="email-error" className="mt-2 text-sm text-[#B42318]">{errors.email}</p>}
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
                  {featureOptions.map((feature) => {
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
                    {remainingSlots > 0 ? `${remainingSlots} slots remaining` : "Maximum reached"}
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
                  {sourceOptions.map((source) => (
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
                    I agree to submit this information to express interest in Chatterbox and
                    understand that this does not create an account, verify my email, or
                    reserve a ChatterTag.
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
                  className="inline-flex items-center justify-center rounded-xl bg-[#5B4BDB] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4939C9] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting…" : "Join the waitlist"}
                </button>
                <p className="text-xs leading-5 text-[#6C6591]">
                  This request does not create an account or reserve a ChatterTag.
                </p>
              </div>
            </form>
          )}
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
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#201A4B]">Explore</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#6C6591]">
              <li><Link href="/#about" className="hover:text-[#5B4BDB]">About</Link></li>
              <li><Link href="/#features" className="hover:text-[#5B4BDB]">Features</Link></li>
              <li><Link href="/#faq" className="hover:text-[#5B4BDB]">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#201A4B]">Waitlist</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#6C6591]">
              <li><Link href="/#waitlist" className="hover:text-[#5B4BDB]">Join the waitlist</Link></li>
              <li><Link href="/#roadmap" className="hover:text-[#5B4BDB]">Roadmap</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#201A4B]">Company</h3>
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
