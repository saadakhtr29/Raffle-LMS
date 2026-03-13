require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const url = process.env.DATABASE_URL.replace('mysql://', 'mariadb://');
const adapter = new PrismaMariaDb(url);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
