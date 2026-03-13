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
  try {
    await prisma.prize.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Prize deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prize' });
  }
};

module.exports = { createPrize, getPrizes, updatePrize, deletePrize };
