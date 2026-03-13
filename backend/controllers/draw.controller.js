const prisma = require('../lib/prisma');

const startDraw = async (req, res) => {
  const { prizeId } = req.body;

  try {
    // Implementing the specific random selection logic from SRS
    const result = await prisma.$queryRaw`
      SELECT * FROM tickets
      WHERE is_winner = false
      AND removed = false
      ORDER BY RAND()
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'No eligible tickets found for draw' });
    }

    const winnerTicket = result[0];

    // Mark ticket as winner
    await prisma.ticket.update({
      where: { id: winnerTicket.id },
      data: { isWinner: true },
    });

    // Create winner record if prizeId is provided
    if (prizeId) {
      await prisma.winner.create({
        data: {
          ticketId: winnerTicket.id,
          prizeId: parseInt(prizeId),
        },
      });
    }

    res.json({
      ticketNumber: winnerTicket.ticket_number,
      name: winnerTicket.name,
      ticketId: winnerTicket.id
    });
  } catch (error) {
    console.error('Draw error:', error);
    res.status(500).json({ error: 'Raffle draw failed' });
  }
};

const removeTicket = async (req, res) => {
  const { ticketId } = req.body;
  try {
    await prisma.ticket.update({
      where: { id: parseInt(ticketId) },
      data: { removed: true },
    });
    res.json({ message: 'Ticket removed from future draws' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove ticket' });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await prisma.winner.findMany({
      include: {
        ticket: true,
        prize: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedHistory = history.map((h) => ({
      ticketNumber: h.ticket.ticketNumber,
      name: h.ticket.name,
      prize: h.prize ? h.prize.name : 'No Prize',
      createdAt: h.createdAt,
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

module.exports = { startDraw, removeTicket, getHistory };
