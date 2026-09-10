"use client";

import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";

const STORAGE_KEY = "dockify-beta-auth";
const BetaAuthContext = createContext<{ logout: () => void } | null>(null);

export function useBetaAuth() {
  return useContext(BetaAuthContext);
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUnlocked(localStorage.getItem(STORAGE_KEY) === "1");
    setReady(true);
  }, []);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
    setPassword("");
    setError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const expected = process.env.NEXT_PUBLIC_BETA_PASSWORD ?? "";
    if (password === expected && expected.length > 0) {
      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setError(null);
      return;
    }
    setError("Incorrect password.");
  };

  if (!ready) {
    return <div className="min-h-screen bg-neutral-950" />;
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Beta access</p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight">Enter password</h1>
          <p className="mt-1 text-sm text-neutral-400">This review queue is limited to invited testers.</p>
          <label htmlFor="beta-password" className="mt-5 block text-xs font-medium text-neutral-400">
            Password
          </label>
          <input
            id="beta-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            className="mt-1.5 h-10 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 text-sm text-white outline-none ring-brand-500/40 placeholder:text-neutral-600 focus:border-neutral-500 focus:ring-2"
            placeholder="Beta password"
          />
          {error && (
            <p className="mt-2 text-xs font-medium text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-white text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return <BetaAuthContext.Provider value={{ logout }}>{children}</BetaAuthContext.Provider>;
}
