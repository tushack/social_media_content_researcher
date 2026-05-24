import React, { useState } from "react";
import { Loader2, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, signInWithGoogle } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authModalOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");

      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0c11] p-6 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Sign in required
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Please sign in with Google to scan viral ideas, use New Scan, save
              ideas, and access your research history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-zinc-400 hover:bg-white/[0.08]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Continue with Google"
          )}
        </Button>

        {error && (
          <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
          After sign in, you can use the research dashboard and upgrade your
          plan.
        </p>
      </div>
    </div>
  );
}