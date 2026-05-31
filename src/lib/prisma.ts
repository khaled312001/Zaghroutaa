import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// نحفظ في الـ global عشان ما يتعملش أكتر من instance (حتى في الإنتاج)
globalForPrisma.prisma = prisma;
