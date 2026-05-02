import { SignJWT, jwtVerify } from "jose"

const encoder = new TextEncoder()

const secret = (key: string) => encoder.encode(key)

export const signToken = async (
  payload: Record<string, unknown>,
  jwtSecret: string,
  expiresIn = "7d"
) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret(jwtSecret))

export const verifyToken = async <T extends Record<string, unknown>>(
  token: string,
  jwtSecret: string
): Promise<T | null> => {
  try {
    const { payload } = await jwtVerify(token, secret(jwtSecret))
    return payload as T
  } catch {
    return null
  }
}