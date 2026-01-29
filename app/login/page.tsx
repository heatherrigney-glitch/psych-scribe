"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-fuchsia-50 to-rose-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-pink-200/60 bg-white/80 backdrop-blur shadow-xl p-8">
        <div className="mb-6">
          <div className="text-sm font-semibold tracking-wide text-pink-600">
            WHAT LIKE IT’S HARD
          </div>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Scribe Login
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to keep clinician inputs organized by account.
          </p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/scribe" })}
          className="w-full rounded-xl bg-pink-600 px-4 py-3 text-white font-semibold shadow hover:bg-pink-700 active:scale-[0.99] transition"
        >
          Sign in with Google
        </button>

        <div className="mt-6 rounded-xl border border-pink-100 bg-pink-50 p-4 text-xs text-gray-700">
          <div className="font-semibold text-pink-700 mb-1">Reminder</div>
          Practice use only. PHI strictly prohibited.
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          ✨ Elle Woods energy only ✨
        </div>
      </div>
    </div>
  );
}

