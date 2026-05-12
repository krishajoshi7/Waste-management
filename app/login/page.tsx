"use client";

import { type FormEvent, useEffect, useState } from "react";

type LoginRole = "generator" | "collector";
type GeneratorAuthMode = "login" | "signup-profile" | "signup-otp";

export default function LoginPage() {
  const [role, setRole] = useState<LoginRole>("generator");
  const [generatorMode, setGeneratorMode] = useState<GeneratorAuthMode>("login");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedRole = params.get("role");

    // Visiting shared auth should always show the auth UI, even if a prior mock session exists.
    localStorage.removeItem("sustainable-ecg-role");
    setGeneratorMode("login");
    setNotice("");

    if (requestedRole === "generator" || requestedRole === "collector") {
      setRole(requestedRole);
    }
  }, []);

  function chooseRole(nextRole: LoginRole) {
    setRole(nextRole);
    setNotice("");
    setGeneratorMode("login");
  }

  function completeGeneratorSignup() {
    setNotice("Account verified and created. Please sign in with your password.");
    setGeneratorMode("login");
  }

  function completeLogin(nextRole: LoginRole) {
    // Only this explicit form-submit path creates a mock session and opens a workspace.
    localStorage.setItem("sustainable-ecg-role", nextRole);
    window.location.assign(
      nextRole === "generator" ? "/generator?auth=generator" : "/collector?auth=collector"
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card--wide">
        <a className="back-link" href="/">
          Back to home
        </a>
        <p className="eyebrow">Shared Login</p>
        <h1>Choose your workspace</h1>
        <p>
          Generators can create a public profile and verify it with OTP.
          Collectors sign in with staff credentials issued by the team.
        </p>

        <div className="role-choice" aria-label="Choose login role">
          <button
            className={role === "generator" ? "active" : ""}
            onClick={() => chooseRole("generator")}
            type="button"
          >
            Login as Generator
          </button>
          <button
            className={role === "collector" ? "active" : ""}
            onClick={() => chooseRole("collector")}
            type="button"
          >
            Login as Collector
          </button>
        </div>

        {role === "generator" && generatorMode === "login" ? (
          <GeneratorLogin
            notice={notice}
            onCreateProfile={() => {
              setNotice("");
              setGeneratorMode("signup-profile");
            }}
            onLogin={() => completeLogin("generator")}
          />
        ) : null}

        {role === "generator" && generatorMode === "signup-profile" ? (
          <GeneratorCreateProfile
            onBackToLogin={() => setGeneratorMode("login")}
            onProfileSaved={() => setGeneratorMode("signup-otp")}
          />
        ) : null}

        {role === "generator" && generatorMode === "signup-otp" ? (
          <GeneratorOtpVerify
            onBackToProfile={() => setGeneratorMode("signup-profile")}
            onVerified={completeGeneratorSignup}
          />
        ) : null}

        {role === "collector" ? <CollectorLogin onLogin={() => completeLogin("collector")} /> : null}
      </section>
    </main>
  );
}

function GeneratorLogin({
  notice,
  onCreateProfile,
  onLogin
}: {
  notice: string;
  onCreateProfile: () => void;
  onLogin: () => void;
}) {
  const [phone, setPhone] = useState("+91 98765 43210");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  // Prototype login: the backend will replace this fixed credential check.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (phone.replace(/\D/g, "") === "919876543210" && password === "password123") {
      setError("");
      onLogin();
      return;
    }

    setError("Use +91 98765 43210 and password123 for this prototype.");
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Contact number
        <input inputMode="tel" onChange={(event) => setPhone(event.target.value)} value={phone} />
      </label>
      <label>
        Password
        <input onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
      </label>
      {notice ? <span className="form-success">{notice}</span> : null}
      {error ? <span className="form-error">{error}</span> : null}
      <button className="primary-action" type="submit">
        Login as Generator
      </button>
      <button className="quiet-action" onClick={onCreateProfile} type="button">
        Create New Generator Profile
      </button>
    </form>
  );
}

function GeneratorCreateProfile({
  onBackToLogin,
  onProfileSaved
}: {
  onBackToLogin: () => void;
  onProfileSaved: () => void;
}) {
  const [name, setName] = useState("Tharun Stitch Works");
  const [contact, setContact] = useState("+91 98765 43210");
  const [address, setAddress] = useState("14 Market Road, Anna Nagar, Chennai");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  // Save profile first. OTP verification is intentionally the next step.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !contact.trim() || !address.trim()) {
      setError("Name, contact number, and address are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    onProfileSaved();
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Name / Organization name
        <input onChange={(event) => setName(event.target.value)} value={name} />
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
        <input inputMode="tel" onChange={(event) => setContact(event.target.value)} value={contact} />
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
        <input onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
      </label>
      {error ? <span className="form-error">{error}</span> : null}
      <button className="primary-action" type="submit">
        Create Profile
      </button>
      <button className="quiet-action" onClick={onBackToLogin} type="button">
        Back to Login
      </button>
    </form>
  );
}

function GeneratorOtpVerify({
  onBackToProfile,
  onVerified
}: {
  onBackToProfile: () => void;
  onVerified: () => void;
}) {
  const [otp, setOtp] = useState("123456");
  const [error, setError] = useState("");

  // OTP verifies only the first-time generator profile creation.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (otp !== "123456") {
      setError("Enter OTP 123456 to verify this prototype profile.");
      return;
    }

    setError("");
    onVerified();
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <div className="confirmation-box">
        <strong>Profile saved</strong>
        <span>Enter the OTP sent to the generator contact number.</span>
      </div>
      <label>
        OTP verification
        <input inputMode="numeric" onChange={(event) => setOtp(event.target.value)} value={otp} />
      </label>
      {error ? <span className="form-error">{error}</span> : null}
      <button className="primary-action" type="submit">
        Verify OTP
      </button>
      <button className="quiet-action" onClick={onBackToProfile} type="button">
        Edit Profile
      </button>
    </form>
  );
}

function CollectorLogin({ onLogin }: { onLogin: () => void }) {
  const [employeeId, setEmployeeId] = useState("COL-102");
  const [password, setPassword] = useState("staff1234");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (employeeId === "COL-102" && password === "staff1234") {
      setError("");
      onLogin();
      return;
    }

    setError("Use COL-102 and staff1234 for this prototype.");
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Employee ID
        <input onChange={(event) => setEmployeeId(event.target.value)} value={employeeId} />
      </label>
      <label>
        Password
        <input onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
      </label>
      <div className="confirmation-box">
        <strong>Staff access only</strong>
        <span>Collector profiles are created or approved by admin.</span>
      </div>
      {error ? <span className="form-error">{error}</span> : null}
      <button className="primary-action" type="submit">
        Login as Collector
      </button>
    </form>
  );
}
