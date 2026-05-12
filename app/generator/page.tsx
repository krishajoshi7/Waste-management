"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  createWasteRequest,
  readPrototypeState,
  type WasteRequest
} from "../prototype-store";

const statusLabels: Record<string, string> = {
  request_created: "Request Created",
  collector_assigned: "Collector Assigned",
  pickup_scheduled: "Pickup Scheduled",
  pickup_completed: "Pickup Completed",
  delivered_to_warehouse: "Delivered"
};

const statusSteps = [
  "request_created",
  "collector_assigned",
  "pickup_scheduled",
  "pickup_completed",
  "delivered_to_warehouse"
];

const screens = [
  "Home",
  "Waste Logging",
  "Upload Photos",
  "Confirmation",
  "Track Status",
  "Profile"
] as const;

type GeneratorScreen = (typeof screens)[number] | "Login / Signup" | "Create Account";
type RequestDraft = {
  wasteCategory: string;
  quantityType: "weight" | "bag_count";
  quantity: string;
  condition: "Clean" | "Mixed" | "Wet / Soiled";
  urgency: "Normal" | "Urgent";
  address: string;
  notes: string;
};

export default function GeneratorPage() {
  const [activeScreen, setActiveScreen] = useState<GeneratorScreen>("Home");
  const [isGeneratorAuthorized, setIsGeneratorAuthorized] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [loginNotice, setLoginNotice] = useState("");
  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [activeRequestId, setActiveRequestId] = useState("");
  const [draftRequest, setDraftRequest] = useState<RequestDraft>({
    wasteCategory: "Cloth scraps",
    quantityType: "weight" as const,
    quantity: "18 kg",
    condition: "Clean" as const,
    urgency: "Urgent" as const,
    address: "14 Market Road, Anna Nagar, Chennai",
    notes: "Clean cotton scraps packed near the cutting table."
  });

  const activeRequest =
    requests.find((request) => request.id === activeRequestId) ?? requests[0];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authRole = params.get("auth");
    const role = authRole === "generator"
      ? authRole
      : localStorage.getItem("sustainable-ecg-role");

    if (role === "generator") {
      localStorage.setItem("sustainable-ecg-role", "generator");

      if (authRole === "generator") {
        window.history.replaceState(null, "", "/generator");
      }

      const state = readPrototypeState();
      setRequests(state.requests);
      setActiveRequestId(state.requests[0]?.id ?? "");
      setIsGeneratorAuthorized(true);
      setIsSessionChecked(true);
      return;
    }

    window.location.replace("/login?role=generator");
    setIsSessionChecked(true);
  }, []);

  // Prototype route guard: generator workflow screens stay locked until shared login succeeds.
  function openScreen(screen: GeneratorScreen) {
    if (
      !isGeneratorAuthorized &&
      screen !== "Login / Signup" &&
      screen !== "Create Account"
    ) {
      setActiveScreen("Login / Signup");
      return;
    }

    setActiveScreen(screen);
  }

  useEffect(() => {
    if (!isGeneratorAuthorized) {
      return;
    }

    const interval = window.setInterval(() => {
      setRequests(readPrototypeState().requests);
    }, 1200);

    return () => window.clearInterval(interval);
  }, [isGeneratorAuthorized]);

  function refreshRequests(nextActiveId?: string) {
    const nextState = readPrototypeState();
    setRequests(nextState.requests);

    if (nextActiveId) {
      setActiveRequestId(nextActiveId);
    }
  }

  function submitRequest() {
    const nextRequest = createWasteRequest({
      generator: "Tharun Stitch Works",
      address: draftRequest.address,
      wasteCategory: draftRequest.wasteCategory,
      quantity: draftRequest.quantity,
      quantityType: draftRequest.quantityType,
      condition: draftRequest.condition,
      urgency: draftRequest.urgency,
      notes: draftRequest.notes,
      pickupWindow: "Awaiting admin assignment"
    });

    refreshRequests(nextRequest.id);
    setActiveScreen("Confirmation");
  }

  function completeGeneratorAuth() {
    setIsGeneratorAuthorized(true);
    setLoginNotice("");
    setActiveScreen("Home");
  }

  function completeAccountCreation() {
    setIsGeneratorAuthorized(false);
    setLoginNotice("Account verified and created. Please sign in with your password.");
    setActiveScreen("Login / Signup");
  }

  if (!isSessionChecked) {
    return (
      <main>
        <section className="protected-card">
          <p className="eyebrow">Checking session</p>
          <h1>Loading generator workspace</h1>
        </section>
      </main>
    );
  }

  if (isSessionChecked && !isGeneratorAuthorized) {
    return null;
  }

  return (
    <main>
      <header className="site-nav">
        <a className="brand-mark" href="/">
          Sustainable ECG
        </a>
        <nav aria-label="Generator navigation">
          <a href="/">Home</a>
          <a href="/login?role=generator">Switch Account</a>
          <a href="/collector">Collector</a>
          <a href="/admin">Admin</a>
        </nav>
      </header>

      <section className="route-hero route-hero--generator">
        <p className="eyebrow">Waste Generator App</p>
        <h1>Seven screens for request creation and tracking</h1>
        <p>
          Login, profile setup, waste logging, photo upload, confirmation, and
          status tracking are separated into reviewable prototype screens.
        </p>
      </section>

      <section className="workspace">
        <div className="screen-tabs" aria-label="Waste generator screens">
          {screens.map((screen, index) => (
            <button
              className={screen === activeScreen ? "active" : ""}
              disabled={!isGeneratorAuthorized}
              key={screen}
              onClick={() => openScreen(screen)}
              type="button"
            >
              <span>{index + 1}</span>
              {screen}
            </button>
          ))}
        </div>

        <div className="screen-showcase">
          <aside className="screen-notes">
            <p className="eyebrow">Current Screen</p>
            <h2>{activeScreen}</h2>
            <p>{getScreenDescription(activeScreen)}</p>
          </aside>

          <section className="phone-stage" aria-live="polite">
            {activeScreen === "Login / Signup" ? (
              <LoginScreen
                notice={loginNotice}
                onAuthenticated={completeGeneratorAuth}
                onCreateAccount={() => setActiveScreen("Create Account")}
              />
            ) : null}
            {activeScreen === "Create Account" ? (
              <CreateAccountScreen
                onAccountCreated={completeAccountCreation}
                onBackToLogin={() => setActiveScreen("Login / Signup")}
              />
            ) : null}
            {activeScreen === "Home" && activeRequest ? (
              <HomeScreen
                activeRequest={activeRequest}
                recentRequests={requests.slice(1, 3)}
                onCreateRequest={() => setActiveScreen("Waste Logging")}
              />
            ) : null}
            {activeScreen === "Waste Logging" ? (
              <WasteLoggingScreen
                draftRequest={draftRequest}
                onChange={setDraftRequest}
                onContinue={() => setActiveScreen("Upload Photos")}
              />
            ) : null}
            {activeScreen === "Upload Photos" ? (
              <UploadPhotosScreen onSubmitRequest={submitRequest} />
            ) : null}
            {activeScreen === "Confirmation" && activeRequest ? (
              <ConfirmationScreen
                activeRequest={activeRequest}
                onCreateAnother={() => setActiveScreen("Waste Logging")}
                onTrack={() => setActiveScreen("Track Status")}
              />
            ) : null}
            {activeScreen === "Track Status" && activeRequest ? (
              <TrackStatusScreen activeRequest={activeRequest} />
            ) : null}
            {activeScreen === "Profile" ? <ProfileScreen /> : null}
          </section>
        </div>
      </section>
    </main>
  );
}

function LoginScreen({
  notice,
  onAuthenticated,
  onCreateAccount
}: {
  notice: string;
  onAuthenticated: () => void;
  onCreateAccount: () => void;
}) {
  const [phone, setPhone] = useState("+91 98765 43210");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  // Mock login uses phone + password. OTP is only used once during account creation.
  function handleAuth(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const normalizedPhone = phone.replace(/\D/g, "");
    const isValidPhone = normalizedPhone === "919876543210";
    const isValidPassword = password.trim() === "password123";

    if (isValidPhone && isValidPassword) {
      setError("");
      onAuthenticated();
      return;
    }

    setError("Use +91 98765 43210 and password123 for this prototype.");
  }

  return (
    <article className="phone-screen app-phone">
      <div className="screen-header">
        <span>Login / Signup</span>
        <span>01</span>
      </div>
      <div className="login-brand">
        <span className="avatar">SE</span>
        <h3>Welcome</h3>
        <p>Sign in or create a generator account to request textile waste pickup.</p>
      </div>
      <form className="form-stack" onSubmit={handleAuth}>
        <label>
          Contact number
          <input
            inputMode="tel"
            onChange={(event) => setPhone(event.target.value)}
            value={phone}
          />
        </label>
        <label>
          Password
          <input
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        <label>
          User type
          <select defaultValue="generator">
            <option value="generator">Waste Generator</option>
          </select>
        </label>
        {notice ? <span className="form-success">{notice}</span> : null}
        {error ? <span className="form-error">{error}</span> : null}
        <button type="submit" className="primary-action">
          Sign In
        </button>
        <button type="button" className="quiet-action" onClick={onCreateAccount}>
          Create New Account
        </button>
      </form>
    </article>
  );
}

function CreateAccountScreen({
  onAccountCreated,
  onBackToLogin
}: {
  onAccountCreated: () => void;
  onBackToLogin: () => void;
}) {
  const [error, setError] = useState("");
  const [organizationName, setOrganizationName] = useState("Tharun Stitch Works");
  const [contactNumber, setContactNumber] = useState("+91 98765 43210");
  const [address, setAddress] = useState("14 Market Road, Anna Nagar, Chennai");
  const [otp, setOtp] = useState("123456");
  const [password, setPassword] = useState("password123");
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Step 1 saves the profile locally. OTP is requested only after this data is saved.
  function handleCreateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!organizationName.trim() || !contactNumber.trim() || !address.trim()) {
      setError("Name, contact number, and address are required.");
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setIsProfileSaved(true);
  }

  // Step 2 verifies the first-time OTP, then sends the user back to login.
  function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (otp.trim() !== "123456") {
      setError("Enter OTP 123456 to verify this prototype profile.");
      return;
    }

    setError("");
    onAccountCreated();
  }

  return (
    <article className="phone-screen app-phone app-phone--tall">
      <div className="screen-header">
        <span>Create New Account</span>
        <span>{isProfileSaved ? "OTP" : "Profile"}</span>
      </div>
      {!isProfileSaved ? (
      <form className="form-stack" onSubmit={handleCreateProfile}>
        <label>
          Name / Organization name
          <input
            onChange={(event) => setOrganizationName(event.target.value)}
            value={organizationName}
          />
        </label>
        <label>
          Type of generator
          <select defaultValue="tailor">
            <option value="tailor">Tailor</option>
            <option value="temple">Temple</option>
            <option value="household">Household</option>
            <option value="boutique">Boutique</option>
            <option value="ngo">NGO</option>
          </select>
        </label>
        <label>
          Contact number
          <input
            inputMode="tel"
            onChange={(event) => setContactNumber(event.target.value)}
            value={contactNumber}
          />
        </label>
        <label>
          Address
          <textarea onChange={(event) => setAddress(event.target.value)} value={address} />
        </label>
        <div className="split-fields">
          <label>
            Auto-location
            <input defaultValue="13.0843, 80.2101" />
          </label>
          <button type="button">Use current location</button>
        </div>
        <label>
          Preferred pickup time window
          <select defaultValue="afternoon">
            <option value="morning">Morning, 9 AM - 12 PM</option>
            <option value="afternoon">Afternoon, 2 PM - 5 PM</option>
            <option value="evening">Evening, 5 PM - 8 PM</option>
          </select>
        </label>
        <label>
          Average waste frequency
          <select defaultValue="weekly">
            <option value="">Optional</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="occasional">Occasional</option>
          </select>
        </label>
        <label>
          Create password
          <input
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        {error ? <span className="form-error">{error}</span> : null}
        <button type="submit" className="primary-action">
          Create Profile
        </button>
        <button type="button" className="quiet-action" onClick={onBackToLogin}>
          Back to Login
        </button>
      </form>
      ) : (
      <form className="form-stack" onSubmit={handleVerifyOtp}>
        <div className="confirmation-box">
          <strong>Profile saved</strong>
          <span>{organizationName}</span>
          <span>{contactNumber}</span>
          <span>{address}</span>
        </div>
        <label>
          OTP verification
          <input
            inputMode="numeric"
            onChange={(event) => setOtp(event.target.value)}
            value={otp}
          />
        </label>
        {error ? <span className="form-error">{error}</span> : null}
        <button type="submit" className="primary-action">
          Verify OTP
        </button>
        <button
          type="button"
          className="quiet-action"
          onClick={() => {
            setError("");
            setIsProfileSaved(false);
          }}
        >
          Edit Profile
        </button>
      </form>
      )}
    </article>
  );
}

function HomeScreen({
  activeRequest,
  recentRequests,
  onCreateRequest
}: {
  activeRequest: WasteRequest;
  recentRequests: WasteRequest[];
  onCreateRequest: () => void;
}) {
  return (
    <article className="phone-screen app-phone">
      <div className="screen-header">
        <span>Home</span>
        <span className="avatar">TS</span>
      </div>
      <button className="primary-action" onClick={onCreateRequest}>
        Create Pickup Request
      </button>
      <div className="request-card featured">
        <p>Active request</p>
        <h3>{activeRequest.wasteCategory}</h3>
        <div className="meta-row">
          <span>{activeRequest.quantity}</span>
          <span>{activeRequest.urgency}</span>
        </div>
        <div className="fabric-strip" aria-hidden="true">
          <span className="fabric fabric--mint" />
          <span className="fabric fabric--coral" />
          <span className="fabric fabric--ink" />
        </div>
      </div>
      <div className="mini-list">
        {recentRequests.map((request) => (
          <div key={request.id}>
            <span>{request.wasteCategory}</span>
            <strong>{statusLabels[request.status]}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function WasteLoggingScreen({
  draftRequest,
  onChange,
  onContinue
}: {
  draftRequest: RequestDraft;
  onChange: (nextDraft: RequestDraft) => void;
  onContinue: () => void;
}) {
  return (
    <article className="phone-screen app-phone app-phone--tall">
      <div className="screen-header">
        <span>Waste Logging Form</span>
        <span>03</span>
      </div>
      <form className="form-stack">
        <label>
          Waste category
          <select
            value={draftRequest.wasteCategory}
            onChange={(event) =>
              onChange({ ...draftRequest, wasteCategory: event.target.value })
            }
          >
            <option value="Cloth scraps">Cloth scraps</option>
            <option value="Sarees">Sarees</option>
            <option value="Kurtas">Kurtas</option>
            <option value="Bedsheets">Bedsheets</option>
            <option value="Temple cloth">Temple cloth</option>
            <option value="Mixed fabric">Mixed fabric</option>
            <option value="Others">Others</option>
          </select>
        </label>
        <div className="split-fields">
          <label>
            Quantity type
            <select
              value={draftRequest.quantityType}
              onChange={(event) =>
                onChange({
                  ...draftRequest,
                  quantityType: event.target.value as "weight" | "bag_count"
                })
              }
            >
              <option value="weight">Weight in kg</option>
              <option value="bag_count">Bag count</option>
            </select>
          </label>
          <label>
            Estimated quantity
            <input
              value={draftRequest.quantity}
              onChange={(event) =>
                onChange({ ...draftRequest, quantity: event.target.value })
              }
            />
          </label>
        </div>
        <label>
          Condition
          <select
            value={draftRequest.condition}
            onChange={(event) =>
              onChange({
                ...draftRequest,
                condition: event.target.value as "Clean" | "Mixed" | "Wet / Soiled"
              })
            }
          >
            <option value="Clean">Clean</option>
            <option value="Mixed">Mixed</option>
            <option value="Wet / Soiled">Wet / Soiled</option>
          </select>
        </label>
        <label>
          Pickup urgency
          <select
            value={draftRequest.urgency}
            onChange={(event) =>
              onChange({
                ...draftRequest,
                urgency: event.target.value as "Normal" | "Urgent"
              })
            }
          >
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </select>
        </label>
        <label>
          Pickup address
          <textarea
            value={draftRequest.address}
            onChange={(event) =>
              onChange({ ...draftRequest, address: event.target.value })
            }
          />
        </label>
        <label>
          Notes
          <textarea
            value={draftRequest.notes}
            onChange={(event) =>
              onChange({ ...draftRequest, notes: event.target.value })
            }
          />
        </label>
        <button type="button" className="primary-action" onClick={onContinue}>
          Continue to Photos
        </button>
      </form>
    </article>
  );
}

function UploadPhotosScreen({ onSubmitRequest }: { onSubmitRequest: () => void }) {
  return (
    <article className="phone-screen app-phone">
      <div className="screen-header">
        <span>Upload Photos</span>
        <span>04</span>
      </div>
      <div className="photo-row photo-row--large" aria-label="Uploaded photo previews">
        <span />
        <span />
        <button type="button">+</button>
      </div>
      <div className="requirement-list">
        <div>
          <strong>Photo 1</strong>
          <span>Waste pile preview</span>
        </div>
        <div>
          <strong>Photo 2</strong>
          <span>Bag or storage view</span>
        </div>
        <div>
          <strong>Photo 3</strong>
          <span>Optional close-up</span>
        </div>
      </div>
      <button type="button" className="primary-action" onClick={onSubmitRequest}>
        Submit Request
      </button>
    </article>
  );
}

function ConfirmationScreen({
  activeRequest,
  onCreateAnother,
  onTrack
}: {
  activeRequest: WasteRequest;
  onCreateAnother: () => void;
  onTrack: () => void;
}) {
  return (
    <article className="phone-screen app-phone">
      <div className="screen-header">
        <span>Pickup Confirmation</span>
        <span>05</span>
      </div>
      <div className="success-mark">OK</div>
      <div className="confirmation-box">
        <strong>Request created</strong>
        <span>Request ID: {activeRequest.id}</span>
        <span>Waste: {activeRequest.wasteCategory}</span>
        <span>Quantity: {activeRequest.quantity}</span>
        <span>Pickup: 14 Market Road, Anna Nagar</span>
      </div>
      <button
        type="button"
        className="primary-action"
        onClick={onTrack}
      >
        Track Request
      </button>
      <button type="button" className="quiet-action" onClick={onCreateAnother}>
        Create Another Request
      </button>
    </article>
  );
}

function TrackStatusScreen({
  activeRequest
}: {
  activeRequest: WasteRequest;
}) {
  return (
    <article className="phone-screen app-phone">
      <div className="screen-header">
        <span>Track Request Status</span>
        <span>{activeRequest.id}</span>
      </div>
      <div className="timeline">
        {statusSteps.map((step) => (
          <div
            key={step}
            className={
              statusSteps.indexOf(step) <= statusSteps.indexOf(activeRequest.status)
                ? "complete"
                : ""
            }
          >
            <span />
            <p>{statusLabels[step]}</p>
          </div>
        ))}
      </div>
      <div className="contact-tile">
        <small>Collector assigned</small>
        <strong>{activeRequest.collector}</strong>
        <span>{activeRequest.pickupWindow}</span>
      </div>
    </article>
  );
}

function ProfileScreen() {
  return (
    <article className="phone-screen app-phone app-phone--tall">
      <div className="screen-header">
        <span>Profile</span>
        <span>07</span>
      </div>
      <form className="form-stack">
        <label>
          Name / Organization name
          <input defaultValue="Tharun Stitch Works" />
        </label>
        <label>
          Type of generator
          <select defaultValue="tailor">
            <option value="tailor">Tailor</option>
            <option value="temple">Temple</option>
            <option value="household">Household</option>
            <option value="boutique">Boutique</option>
            <option value="ngo">NGO</option>
          </select>
        </label>
        <label>
          Contact number
          <input defaultValue="+91 98765 43210" inputMode="tel" />
        </label>
        <label>
          Address
          <textarea defaultValue="14 Market Road, Anna Nagar, Chennai" />
        </label>
        <div className="split-fields">
          <label>
            Auto-location
            <input defaultValue="13.0843, 80.2101" />
          </label>
          <button type="button">Use current location</button>
        </div>
        <label>
          Preferred pickup time window
          <select defaultValue="afternoon">
            <option value="morning">Morning, 9 AM - 12 PM</option>
            <option value="afternoon">Afternoon, 2 PM - 5 PM</option>
            <option value="evening">Evening, 5 PM - 8 PM</option>
          </select>
        </label>
        <label>
          Average waste frequency
          <select defaultValue="weekly">
            <option value="">Optional</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="occasional">Occasional</option>
          </select>
        </label>
        <button type="button" className="primary-action">
          Save Profile
        </button>
      </form>
    </article>
  );
}

function getScreenDescription(screen: GeneratorScreen) {
  const descriptions: Record<GeneratorScreen, string> = {
    "Login / Signup": "Entry screen for phone and password login after account creation.",
    "Create Account": "Dedicated signup flow that saves the profile first, then asks for OTP verification before returning to Login.",
    Home: "Generator landing screen with the primary create pickup action and active request cards.",
    "Waste Logging": "Request form for category, quantity, condition, urgency, address, and notes.",
    "Upload Photos": "Dedicated screen for adding one to three images before submission.",
    Confirmation: "Post-submit summary showing request ID, waste details, and pickup address.",
    "Track Status": "Timeline for request created through delivered to warehouse.",
    Profile: "One-time generator profile with organization, contact, address, location, and pickup preferences."
  };

  return descriptions[screen];
}
