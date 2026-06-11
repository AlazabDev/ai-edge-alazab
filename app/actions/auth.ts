'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session
}

export async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user
}
