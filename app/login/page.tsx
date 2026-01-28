"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Login</h1>

      <button
        onClick={() => signIn("google", { callbackUrl: "/scribe" })}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
