// Shared by middleware and server handlers. Never import this into client components.
export const privateDraftHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  Vary: 'Authorization',
}

export function isDraftAccessConfigured() {
  const password = process.env.DRAFT_PREVIEW_PASSWORD
  return !!password && password.length >= 32 && password.length <= 256
}

export async function hasDraftAccess(authorization: string | null) {
  if (!isDraftAccessConfigured() || !authorization || authorization.length > 1024) return false
  const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(authorization)
  if (!match) return false
  let supplied: string
  try {
    supplied = new TextDecoder('utf-8', { fatal: true }).decode(
      Uint8Array.from(atob(match[1]), (character) => character.charCodeAt(0))
    )
  } catch {
    return false
  }
  const encoder = new TextEncoder()
  const expected = `hani:${process.env.DRAFT_PREVIEW_PASSWORD}`
  const [left, right] = await Promise.all(
    [supplied, expected].map(
      async (value) => new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))
    )
  )
  let difference = 0
  for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index]
  return difference === 0
}

export function draftAccessDenied() {
  if (!isDraftAccessConfigured()) {
    return new Response('Not found', { status: 404, headers: privateDraftHeaders })
  }
  return new Response('Sign in to read drafts.', {
    status: 401,
    headers: {
      ...privateDraftHeaders,
      'WWW-Authenticate': 'Basic realm="Hani private drafts", charset="UTF-8"',
    },
  })
}
