'use client'

import { useMemo, useRef, useState } from 'react'

declare global {
  interface Window {
    webkitSpeechRecognition?: any
    SpeechRecognition?: any
  }
}

export default function ScribePage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Dictation state
  const [isDictating, setIsDictating] = useState(false)
  const [dictationSupported, setDictationSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  const wordCount = useMemo(() => {
    const t = input.trim()
    if (!t) return 0
    return t.split(/\s+/).length
  }, [input])

  function ensureRecognition() {
    if (recognitionRef.current) return recognitionRef.current

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setDictationSupported(false)
      throw new Error('Dictation not supported in this browser. Use Chrome or Edge.')
    }

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (event: any) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) final += transcript
        else interim += transcript
      }

      // Append final chunks to the input box; show interim as it changes
      if (final) {
        setInput((prev) => {
          const sep = prev.trim().length ? ' ' : ''
          return prev + sep + final.trim()
        })
      }

      // Optional: you can show interim somewhere; for simplicity we ignore it.
    }

    rec.onerror = (e: any) => {
      setIsDictating(false)
      // Some errors are harmless (e.g., "no-speech"); keep message minimal
      setError(e?.error ? `Dictation error: ${e.error}` : 'Dictation error.')
    }

    rec.onend = () => {
      setIsDictating(false)
    }

    recognitionRef.current = rec
    return rec
  }

  function toggleDictation() {
    setError('')
    try {
      const rec = ensureRecognition()
      if (!isDictating) {
        rec.start()
        setIsDictating(true)
      } else {
        rec.stop()
        setIsDictating(false)
      }
    } catch (e: any) {
      setError(e?.message || 'Dictation failed to start.')
    }
  }

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const res = await fetch('/api/scribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Request failed')
      }

      setOutput(data.note || '')
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output)
    } catch {
      // ignore
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/75 px-3 py-1 text-xs font-semibold tracking-wide text-pink-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-pink-500" />
              Practice only — PHI strictly prohibited
            </div>

            <h1
              className="mt-4 text-4xl font-semibold tracking-tight text-gray-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Psych Scribe
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              De-identified documentation training tool. Narrative format. Only heading used:{" "}
              <span className="font-semibold">Clinical Justification for Inpatient Stay:</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              className="text-xs font-semibold text-pink-700 hover:text-pink-800 underline underline-offset-4"
              href="/login"
            >
              Login
            </a>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Input */}
          <section className="rounded-2xl border border-pink-200/70 bg-white/70 shadow-sm backdrop-blur">
            <div className="border-b border-pink-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Raw Input</h2>
                <span className="text-xs text-gray-500">{wordCount} words</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Paste or dictate de-identified content. Include: quote, staff report, PRN/STAT 24h, meds + tolerability,
                today’s MSE, unsafe-for-discharge rationale.
              </p>
            </div>

            <div className="p-5">
              <textarea
                className="h-72 w-full resize-none rounded-xl border border-pink-200 bg-white/85 p-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/60"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Example starter (de-identified):
Patient quote: "..."
Per nursing/milieu staff: ...
PRNs/STATs past 24h: none / (list)
Meds: adherent; adverse effects: ...
MSE today: ...
Unsafe for discharge because: ...`}
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Generating…' : 'Generate Note'}
                </button>

                <button
                  onClick={() => {
                    setInput('')
                    setOutput('')
                    setError('')
                  }}
                  className="rounded-xl border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-pink-50"
                >
                  Clear
                </button>

                <button
                  onClick={toggleDictation}
                  disabled={!dictationSupported}
                  className={`rounded-xl border px-5 py-3 text-sm font-semibold shadow-sm transition ${
                    dictationSupported
                      ? 'border-pink-200 bg-white text-gray-900 hover:bg-pink-50'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  title={
                    dictationSupported
                      ? 'Start/stop dictation (Chrome/Edge recommended)'
                      : 'Dictation not supported in this browser'
                  }
                >
                  {isDictating ? 'Stop Dictation' : 'Start Dictation'}
                </button>

                {isDictating && (
                  <span className="text-xs font-semibold text-pink-700">
                    Listening…
                  </span>
                )}

                <div className="ml-auto text-xs text-gray-500">
                  Tip: Chrome/Edge dictation works best.
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-4 rounded-xl border border-pink-200 bg-white/70 px-4 py-3 text-xs text-gray-700">
                <span className="font-semibold text-pink-700">Reminder:</span> Dictate/paste de-identified content only.
                No names, DOBs, MRNs, addresses, phone numbers, or uniquely identifying details.
              </div>
            </div>
          </section>

          {/* Output */}
          <section className="rounded-2xl border border-pink-200/70 bg-white/70 shadow-sm backdrop-blur">
            <div className="border-b border-pink-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Generated Note</h2>
                <button
                  onClick={copyOutput}
                  disabled={!output}
                  className="rounded-lg border border-pink-200 bg-white px-3 py-1.5 text-xs font-semibold text-pink-700 shadow-sm transition hover:bg-pink-50 disabled:opacity-50"
                >
                  Copy
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Smooth narrative; only separate heading is{" "}
                <span className="font-semibold">Clinical Justification for Inpatient Stay:</span>
              </p>
            </div>

            <div className="p-5">
              <textarea
                className="h-72 w-full resize-none rounded-xl border border-pink-200 bg-white/85 p-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/60"
                value={output}
                readOnly
                placeholder="Generated note will appear here…"
              />
              <div className="mt-4 text-center text-xs text-gray-500">
                 <span className="text-pink-700 font-semibold">What, like it’s hard?</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}