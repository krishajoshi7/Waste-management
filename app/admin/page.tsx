"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  assignCollector,
  readPrototypeState,
  type WasteRequest
} from "../prototype-store";

const ADMIN_CODE = "admin123";

const statusLabels: Record<string, string> = {
  request_created: "Request Created",
  collector_assigned: "Collector Assigned",
  pickup_scheduled: "Pickup Scheduled",
  pickup_completed: "Pickup Completed",
  delivered_to_warehouse: "Delivered"
};

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<WasteRequest[]>([]);

  useEffect(() => {
    setRequests(readPrototypeState().requests);

    if (!isAuthorized) {
      return;
    }

    const interval = window.setInterval(refreshRequests, 1200);

    return () => window.clearInterval(interval);
  }, [isAuthorized]);

  function refreshRequests() {
    setRequests(readPrototypeState().requests);
  }

  function handleAssign(requestId: string) {
    assignCollector(requestId);
    refreshRequests();
  }

  const openRequests = requests.filter(
    (request) => request.status !== "delivered_to_warehouse"
  ).length;
  const awaitingAssignment = requests.filter(
    (request) => request.status === "request_created"
  ).length;
  const completedToday = requests.filter(
    (request) => request.status === "pickup_completed"
  ).length;
  const urgentPickups = requests.filter(
    (request) => request.urgency === "Urgent"
  ).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (accessCode.trim() === ADMIN_CODE) {
      setIsAuthorized(true);
      setError("");
      return;
    }

    setError("Invalid admin code");
  }

  if (!isAuthorized) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <a className="back-link" href="/">
            Back to prototype
          </a>
          <p className="eyebrow">Admin Authorization</p>
          <h1>Admin Dashboard</h1>
          <p>
            Enter the prototype admin code to access request assignment,
            operational metrics, and warehouse status.
          </p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              Admin access code
              <input
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="admin123"
                type="password"
              />
            </label>
            {error ? <span className="form-error">{error}</span> : null}
            <button className="primary-action" type="submit">
              Authorize Admin
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <a className="back-link" href="/">
            Back to prototype
          </a>
          <p className="eyebrow">Authorized Admin</p>
          <h1>Monitor requests and assign collectors</h1>
        </div>
        <button type="button" onClick={() => setIsAuthorized(false)}>
          Sign out
        </button>
      </header>

      <section className="admin-grid" aria-label="Admin metrics">
        {[
          ["Open requests", openRequests],
          ["Awaiting assignment", awaitingAssignment],
          ["Completed today", completedToday],
          ["Urgent pickups", urgentPickups]
        ].map(([label, value]) => (
          <div className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="table-shell" aria-label="Waste requests">
        <div className="table-row table-row--head">
          <span>Request</span>
          <span>Generator</span>
          <span>Waste</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {requests.map((request) => (
          <div className="table-row" key={request.id}>
            <span>{request.id}</span>
            <span>{request.generator}</span>
            <span>{request.wasteCategory}</span>
            <span>{statusLabels[request.status]}</span>
            <button
              type="button"
              onClick={() => handleAssign(request.id)}
              disabled={request.status !== "request_created"}
            >
              {request.status === "request_created" ? "Assign" : "Review"}
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
