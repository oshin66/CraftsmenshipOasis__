/**
 * Prisma Client — lazy singleton
 * On Vercel: "postinstall": "prisma generate" creates the client before build.
 * The lazy getter prevents build-time crash if client isn't generated yet.
 */

import { PrismaClient } from '@prisma/client'

/* eslint-disable @typescript-eslint/no-explicit-any */
const g = globalThis as any

function getClient(): PrismaClient {
  if (!g.__prisma) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client')
    g.__prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return g.__prisma
}

export const prisma: PrismaClient = new Proxy({} as any, {
  get(_, prop) {
    return (getClient() as any)[prop]
  },
}) as unknown as PrismaClient

