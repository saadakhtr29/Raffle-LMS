const prisma = require('../lib/prisma');

const getStats = async (req, res) => {
  try {
    const totalTickets = await prisma.ticket.count();
    const totalPrizes = await prisma.prize.count();
    const totalWinners = await prisma.winner.count();

    res.json({
      totalTickets,
      totalPrizes,
      totalWinners,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

module.exports = { getStats };
