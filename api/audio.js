// api/audio.js — Vercel serverless function
// Proxies POST requests to ElevenLabs so the API key stays server-side.
// Optional: the module works silently without this endpoint configured
// (see src/utils/audio.js — static-first / dynamic-fallback / silent-skip).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'ElevenLabs API key not configured' });
    return;
  }

  const { text, voiceId, modelId, voiceSettings } = req.body || {};
  if (!text) {
    res.status(400).json({ error: 'Missing "text" in request body' });
    return;
  }

  try {
    const resolvedVoiceId = voiceId || 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId || 'eleven_multilingual_v2',
          voice_settings: voiceSettings || { stability: 0.65, similarity_boost: 0.8, style: 0.3 },
        }),
      }
    );

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'ElevenLabs request failed' });
      return;
    }

    const arrayBuffer = await upstream.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).json({ error: 'Audio proxy error' });
  }
}
