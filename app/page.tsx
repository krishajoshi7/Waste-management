"use client";

import { useState } from "react";
import { mockStats } from "./prototype-data";

const rolePanels = {
  generator: {
    label: "Waste Generators",
    title: "Log textile waste in minutes",
    body: "Tailors, temples, households, NGOs, and boutiques can submit waste details, photos, quantity, location, and urgency from a mobile-first flow.",
    href: "/login?role=generator",
    action: "Login as Generator"
  },
  collector: {
    label: "Waste Collectors",
    title: "Move from assignment to warehouse proof",
    body: "Field staff can review assigned pickups, navigate to locations, capture actual quantity, and close delivery with warehouse verification.",
    href: "/login?role=collector",
    action: "Login as Collector"
  },
  admin: {
    label: "Admin Team",
    title: "Control operations from one dashboard",
    body: "Admins can review incoming requests, assign collectors, track active pickups, and monitor delivery reconciliation.",
    href: "/admin",
    action: "Admin Login"
  }
};

type RoleKey = keyof typeof rolePanels;

export default function Home() {
  const [activeRole, setActiveRole] = useState<RoleKey>("generator");
  const panel = rolePanels[activeRole];

  function openSharedLogin(role: "generator" | "collector") {
    localStorage.removeItem("sustainable-ecg-role");
    window.location.href = `/login?role=${role}`;
  }

  return (
    <main>
      <header className="site-nav">
        <a className="brand-mark" href="/">
          Sustainable ECG
        </a>
        <nav aria-label="Main navigation">
          <a href="#about">About</a>
          <a
            href="/login?role=generator"
            onClick={(event) => {
              event.preventDefault();
              openSharedLogin("generator");
            }}
          >
            Generator Login
          </a>
          <a
            href="/login?role=collector"
            onClick={(event) => {
              event.preventDefault();
              openSharedLogin("collector");
            }}
          >
            Collector Login
          </a>
          <a href="/admin">Admin</a>
        </nav>
      </header>

      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="eyebrow">Textile waste collection network</p>
          <h1>Turn fabric waste into a traceable recovery flow.</h1>
          <p>
            A responsive prototype for logging textile waste, assigning field
            pickups, and confirming warehouse delivery with clean operational
            data.
          </p>
          <div className="hero-actions">
            <a
              className="primary-link"
              href="/login?role=generator"
              onClick={(event) => {
                event.preventDefault();
                openSharedLogin("generator");
              }}
            >
              Login as Generator
            </a>
            <a
              className="secondary-link"
              href="/login?role=collector"
              onClick={(event) => {
                event.preventDefault();
                openSharedLogin("collector");
              }}
            >
              Login as Collector
            </a>
          </div>
        </div>

        <div className="live-board" aria-label="Live prototype summary">
          <div className="pulse-line">
            <span />
            <strong>Live prototype data</strong>
          </div>
          <div className="live-grid">
            <div>
              <span>Open</span>
              <strong>{mockStats.openRequests}</strong>
            </div>
            <div>
              <span>Scheduled</span>
              <strong>{mockStats.scheduledToday}</strong>
            </div>
            <div>
              <span>Completed</span>
              <strong>{mockStats.completedToday}</strong>
            </div>
            <div>
              <span>Warehouse</span>
              <strong>{mockStats.warehousePending}</strong>
            </div>
          </div>
          <div className="motion-track" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="role-switcher" aria-label="Workflow selector">
        <div className="section-heading">
          <p className="eyebrow">Core workflows</p>
          <h2>Separate experiences for each user group</h2>
        </div>
        <div className="switcher-grid">
          <div className="switcher-controls">
            {(Object.keys(rolePanels) as RoleKey[]).map((role) => (
              <button
                className={role === activeRole ? "active" : ""}
                key={role}
                onClick={() => setActiveRole(role)}
                type="button"
              >
                <span>{rolePanels[role].label}</span>
                <strong>{rolePanels[role].title}</strong>
              </button>
            ))}
          </div>
          <article className="role-preview">
            <p className="eyebrow">{panel.label}</p>
            <h3>{panel.title}</h3>
            <p>{panel.body}</p>
            <a
              className="primary-link"
              href={panel.href}
              onClick={(event) => {
                if (activeRole === "generator" || activeRole === "collector") {
                  event.preventDefault();
                  openSharedLogin(activeRole);
                }
              }}
            >
              {panel.action}
            </a>
          </article>
        </div>
      </section>

      <section id="about" className="about-section">
        <div>
          <p className="eyebrow">About</p>
          <h2>Built for textile waste visibility from source to warehouse.</h2>
        </div>
        <div className="about-copy">
          <p>
            Sustainable ECG connects local waste generators with collection
            staff so reusable and recyclable fabric can be captured before it
            disappears into informal or landfill streams.
          </p>
          <p>
            The prototype focuses on the operating loop: request creation,
            assignment, pickup evidence, status tracking, and warehouse
            verification.
          </p>
        </div>
      </section>

      <section className="impact-section" aria-label="Mock impact facts">
        {[
          ["12,400 kg", "textile waste recovered this year"],
          ["860", "pickup requests completed"],
          ["42", "local generators onboarded"],
          ["94%", "pickups delivered within 24 hours"]
        ].map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="role-explainer">
        <article>
          <p className="eyebrow">Generator</p>
          <h3>Who is a waste generator?</h3>
          <p>
            A generator is any tailor, temple, household, boutique, or NGO with
            reusable textile waste ready for pickup. They create requests and
            track pickup status.
          </p>
        </article>
        <article>
          <p className="eyebrow">Collector</p>
          <h3>Who is a waste collector?</h3>
          <p>
            A collector is field staff assigned to pick up fabric waste, record
            actual quantity and condition, and deliver it to the warehouse.
          </p>
        </article>
      </section>

      <section className="process-band" aria-label="Process">
        {[
          ["01", "Log waste", "Generator submits category, quantity, photos, and pickup location."],
          ["02", "Assign pickup", "Admin or routing logic assigns a collector and time window."],
          ["03", "Collect", "Collector confirms actual quantity, condition, and pickup timestamp."],
          ["04", "Verify", "Warehouse records delivered items and verified weight."]
        ].map(([step, title, body]) => (
          <article key={step}>
            <span>{step}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <footer className="site-footer">
        <div>
          <strong>Sustainable ECG</strong>
          <p>Textile waste pickup and warehouse traceability prototype.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a
            href="/login?role=generator"
            onClick={(event) => {
              event.preventDefault();
              openSharedLogin("generator");
            }}
          >
            Generator
          </a>
          <a
            href="/login?role=collector"
            onClick={(event) => {
              event.preventDefault();
              openSharedLogin("collector");
            }}
          >
            Collector
          </a>
          <a href="/admin">Admin</a>
          <a href="#about">About</a>
        </nav>
      </footer>
    </main>
  );
}
