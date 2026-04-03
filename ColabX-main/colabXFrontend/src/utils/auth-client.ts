import { createAuthClient } from "better-auth/react"
import { AUTH_BASE } from "@/lib/api"

export const authClient = createAuthClient({
  baseURL: AUTH_BASE,
})

export const { signIn, signUp, useSession } = authClient