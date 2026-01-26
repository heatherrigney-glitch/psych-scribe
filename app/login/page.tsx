export default function LoginPage({
  searchParams,
}: {
  searchParams?: { e?: string }
}) {
  const showError = searchParams?.e === '1'

  return (
    <main style={{ maxWidth: 520, margin: '60px auto', fontFamily: 'system-ui' }}>
      <h1>Login</h1>

      {showError && (
        <p style={{ color: 'crimson' }}>Incorrect password. Try again.</p>
      )}

      <form method="POST" action="/api/login">
        <input
          name="password"
          type="password"
          placeholder="Password"
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            marginTop: 12,
            marginBottom: 12,
          }}
        />
        <button type="submit" style={{ padding: 12, fontSize: 16 }}>
          Enter
        </button>
      </form>
    </main>
  )
}