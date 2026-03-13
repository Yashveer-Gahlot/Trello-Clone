const { PrismaClient } = require('@prisma/client');

// Use a singleton pattern to ensure only one instance of PrismaClient is created
let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}
prisma = global.prisma;

module.exports = prisma;
