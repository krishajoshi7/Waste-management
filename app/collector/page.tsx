"use client";

import { useEffect, useState } from "react";
import {
  completePickup,
  confirmWarehouseDelivery,
  readPrototypeState,
  type WasteRequest
} from "../prototype-store";

export default function CollectorPage() {
  const [isCollectorAuthorized, setIsCollectorAuthorized] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [actualQuantity, setActualQuantity] = useState("19 kg collected");
  const [verifiedWeight, setVerifiedWeight] = useState("18.6 kg");
  const [warehouseStaff, setWarehouseStaff] = useState("Meera K");

  const assignedRequests = requests.filter((request) => request.collector);
  const selectedRequest =
    assignedRequests.find((request) => request.id === selectedRequestId) ??
    assignedRequests[0];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authRole = params.get("auth");
    const role = authRole === "collector"
      ? authRole
      : localStorage.getItem("sustainable-ecg-role");

    if (role === "collector") {
      localStorage.setItem("sustainable-ecg-role", "collector");

      if (authRole === "collector") {
        window.history.replaceState(null, "", "/collector");
      }

      const state = readPrototypeState();
      const nextAssignedRequests = state.requests.filter((request) => request.collector);

      setRequests(state.requests);
      setSelectedRequestId(nextAssignedRequests[0]?.id ?? "");
      setIsCollectorAuthorized(true);
      setIsSessionChecked(true);
      return;
    }

    window.location.replace("/login?role=collector");
    setIsSessionChecked(true);
  }, []);

  function refreshRequests(nextSelectedId?: string) {
    const state = readPrototypeState();
    setRequests(state.requests);

    if (nextSelectedId) {
      setSelectedRequestId(nextSelectedId);
    }
  }

  useEffect(() => {
    if (!isCollectorAuthorized) {
      return;
    }

    const interval = window.setInterval(() => refreshRequests(), 1200);

    return () => window.clearInterval(interval);
  }, [isCollectorAuthorized]);

  function handleCompletePickup() {
    if (!selectedRequest) {
      return;
    }

    completePickup(selectedRequest.id, actualQuantity);
    refreshRequests(selectedRequest.id);
  }

  function handleConfirmDelivery() {
    if (!selectedRequest) {
      return;
    }

    confirmWarehouseDelivery(selectedRequest.id, verifiedWeight, warehouseStaff);
    refreshRequests(selectedRequest.id);
  }

  if (!isSessionChecked) {
    return (
      <main>
        <section className="protected-card">
          <p className="eyebrow">Checking session</p>
          <h1>Loading collector workspace</h1>
        </section>
      </main>
    );
  }

  if (isSessionChecked && !isCollectorAuthorized) {
    return null;
  }

  return (
    <main>
      <header className="site-nav">
        <a className="brand-mark" href="/">
          Sustainable ECG
        </a>
        <nav aria-label="Collector navigation">
          <a href="/">Home</a>
          <a href="/login?role=collector">Switch Account</a>
          <a href="/login?role=generator">Generator Login</a>
          <a href="/admin">Admin</a>
        </nav>
      </header>

      <section className="route-hero route-hero--collector">
        <p className="eyebrow">Waste Collector App</p>
        <h1>Assigned pickups and warehouse delivery</h1>
        <p>
          Field staff can scan their pickup queue, navigate to generators,
          record actual collection details, and confirm warehouse handoff.
        </p>
      </section>

      <section className="workspace workspace--alt">
        <div className="collector-layout">
          <article className="queue-panel">
            <div className="panel-title">
              <h3>Assigned Pickups</h3>
              <span>{assignedRequests.length} active</span>
            </div>
            {assignedRequests.length === 0 ? (
              <div className="assignment-card">
                <strong>No assignments yet</strong>
                <span>Ask admin to assign a pending request.</span>
              </div>
            ) : null}
            {assignedRequests.map((assignment) => (
              <div className="assignment-card" key={assignment.id}>
                <div>
                  <strong>{assignment.generator}</strong>
                  <span>{assignment.address}</span>
                </div>
                <p>{assignment.wasteCategory}</p>
                <button
                  type="button"
                  onClick={() => setSelectedRequestId(assignment.id)}
                >
                  {assignment.status === "pickup_completed"
                    ? "Deliver"
                    : assignment.status === "delivered_to_warehouse"
                      ? "Done"
                      : "Open"}
                </button>
              </div>
            ))}
          </article>

          {selectedRequest ? (
          <article className="detail-panel">
            <div className="map-visual" aria-label="Map preview">
              <span className="route-dot route-dot--start" />
              <span className="route-line" />
              <span className="route-dot route-dot--end" />
            </div>
            <div className="detail-copy">
              <p className="eyebrow">Pickup Detail</p>
              <h3>{selectedRequest.generator}</h3>
              <p>{selectedRequest.address}</p>
              <div className="data-grid">
                <div>
                  <span>Waste</span>
                  <strong>{selectedRequest.wasteCategory}</strong>
                </div>
                <div>
                  <span>Estimate</span>
                  <strong>{selectedRequest.quantity}</strong>
                </div>
                <div>
                  <span>Window</span>
                  <strong>{selectedRequest.pickupWindow}</strong>
                </div>
              </div>
              <form className="inline-form">
                <input
                  value={actualQuantity}
                  onChange={(event) => setActualQuantity(event.target.value)}
                />
                <select defaultValue="clean">
                  <option value="clean">Clean</option>
                  <option value="mixed">Mixed</option>
                  <option value="soiled">Soiled</option>
                </select>
                <button
                  type="button"
                  onClick={handleCompletePickup}
                  disabled={
                    selectedRequest.status === "pickup_completed" ||
                    selectedRequest.status === "delivered_to_warehouse"
                  }
                >
                  Mark Pickup Complete
                </button>
              </form>
            </div>
          </article>
          ) : null}

          {selectedRequest ? (
          <article className="delivery-panel">
            <h3>Warehouse Delivery</h3>
            <form className="form-stack">
              <label>
                Warehouse
                <input defaultValue="Central Textile Recovery Hub" />
              </label>
              <label>
                Verified weight
                <input
                  value={verifiedWeight}
                  onChange={(event) => setVerifiedWeight(event.target.value)}
                />
              </label>
              <label>
                Staff name
                <input
                  value={warehouseStaff}
                  onChange={(event) => setWarehouseStaff(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="primary-action"
                onClick={handleConfirmDelivery}
                disabled={selectedRequest.status !== "pickup_completed"}
              >
                Confirm Delivery
              </button>
            </form>
          </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
