const prisma = require('../lib/prisma');

const createPrize = async (req, res) => {
  const { name } = req.body;
  try {
    const prize = await prisma.prize.create({
      data: { name },
    });
    res.json(prize);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prize' });
  }
};

const getPrizes = async (req, res) => {
  try {
    const prizes = await prisma.prize.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(prizes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prizes' });
  }
};

const updatePrize = async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;
  try {
    const prize = await prisma.prize.update({
      where: { id: parseInt(id) },
      data: { name, status },
    });
    res.json(prize);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update prize' });
  }
};

const deletePrize = async (req, res) => {
  const { id } = req.params;
  const prizeId = parseInt(id);

  try {
    // Check if prize has winners linked
    const winnerCount = await prisma.winner.count({
      where: { prizeId }
    });

    if (winnerCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete prize: This prize has already been awarded to winners.' 
      });
    }

    await prisma.prize.delete({
      where: { id: prizeId },
    });
    res.json({ message: 'Prize deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete prize - it may be referenced elsewhere' });
  }
};

const getRandomPrize = async (req, res) => {
  try {
    const activePrizes = await prisma.prize.findMany({
      where: { status: 'AVAILABLE' }
    });

    if (activePrizes.length === 0) {
      return res.status(404).json({ error: 'No active prizes found' });
    }

    const randomPrize = activePrizes[Math.floor(Math.random() * activePrizes.length)];
    res.json(randomPrize);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch random prize' });
  }
};

module.exports = { createPrize, getPrizes, updatePrize, deletePrize, getRandomPrize };
