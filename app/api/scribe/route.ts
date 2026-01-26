import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs' // required for the official SDK

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { input } = await req.json()

    if (!input || typeof input !== 'string' || input.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide more de-identified clinical input.' },
        { status: 400 }
      )
    }

    const system = `
You are an inpatient psychiatry documentation assistant.
PHI is strictly prohibited. Only de-identified practice text is allowed.

Output requirements:
- Produce ONE smooth narrative progress note.
- Must open with: "Patient interviewed, chart reviewed, and case discussed with staff."
- Must include: nursing/milieu staff observations; PRN/STATs in past 24h (or explicitly none);
  med adherence + adverse effects; recent med changes; at least one patient quote;
  at least one MSE finding from today's exam; 
  - NO headings except exactly one header at before describing ongoing inpatient necessity: "Clinical Justification for Inpatient Stay:"
ongoing inpatient necessity and why unsafe for discharge today.
- Avoid "absent symptom" language (do NOT list negatives like "no AVH, no delusions" etc).
- Vary phrasing/sentence structure to reduce repeated notes across patients.
- Keep it defensible, neutral, trauma-informed, and UM-ready.
`

    const user = `
Convert the following de-identified raw clinical input into the required narrative note format.

RAW INPUT:
${input}
`

    // Use a cost-effective model. You can change later.
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 700,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    const note = completion.choices?.[0]?.message?.content?.trim() || ''

    return NextResponse.json({ note })
  } catch (err: any) {
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      'Unknown error calling OpenAI'

    // Common causes: missing env var, quota, invalid key, etc.
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
