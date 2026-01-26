<form method="POST" action="/api/login">
  <input
    name="password"
    type="password"
    placeholder="Password"
    required
    style={{
      width: '100%',
      padding: 12,
      fontSize: 16,
      marginTop: 12,
      marginBottom: 12,
    }}
  />

  <button
    type="submit"
    style={{
      padding: 12,
      fontSize: 16,
      cursor: 'pointer',
    }}
  >
    Enter
  </button>
</form>