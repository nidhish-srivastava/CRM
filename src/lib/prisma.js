import { PrismaClient } from '@prisma/client';

let prisma

if (process.env.NODE_ENV === 'production') {
  // In production, instantiate Prisma Client once
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to avoid multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
