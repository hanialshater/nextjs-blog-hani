import { hasDraftAccess, isDraftAccessConfigured, privateDraftHeaders } from '../drafts/access'

export function isBookAccessConfigured() {
  const password = process.env.DREAM_REVIEW_PASSWORD
  return (
    isDraftAccessConfigured() || (!!password && password.length >= 32 && password.length <= 256)
  )
}

// A book reader's credential deliberately never passes the owner draft gate.
export async function hasBookAccess(authorization: string | null) {
  if (await hasDraftAccess(authorization)) return true
  const password = process.env.DREAM_REVIEW_PASSWORD
  if (!password || password.length < 32 || password.length > 256) return false
  if (!authorization || authorization.length > 1024) return false
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
  const [left, right] = await Promise.all(
    [supplied, `dream:${password}`].map(
      async (value) => new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))
    )
  )
  let difference = 0
  for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index]
  return difference === 0
}

export function bookAccessDenied() {
  return new Response(isBookAccessConfigured() ? 'Sign in to read this book.' : 'Not found', {
    status: isBookAccessConfigured() ? 401 : 404,
    headers: {
      ...privateDraftHeaders,
      ...(isBookAccessConfigured()
        ? { 'WWW-Authenticate': 'Basic realm="The Dream review", charset="UTF-8"' }
        : {}),
    },
  })
}
