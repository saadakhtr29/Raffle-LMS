const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

const startDraw = async (req, res) => {
  let { prizeId } = req.body;

  try {
    let selectedPrizeName = 'No Prize Assigned';

    // If no prizeId provided, pick a random AVAILABLE prize
    if (!prizeId) {
      const activePrizes = await prisma.prize.findMany({
        where: { status: 'AVAILABLE' }
      });
      
      if (activePrizes.length > 0) {
        const randomPrize = activePrizes[Math.floor(Math.random() * activePrizes.length)];
        prizeId = randomPrize.id;
        selectedPrizeName = randomPrize.name;
      }
    } else {
      // If prizeId was provided, fetch its name for the display
      const prize = await prisma.prize.findUnique({ where: { id: parseInt(prizeId) } });
      if (prize) selectedPrizeName = prize.name;
    }

    // Generate a literal random number between 1 and 15000
    const drawnNumber = Math.floor(Math.random() * 15000) + 1;
    const ticketNumberStr = String(drawnNumber).padStart(5, '0');

    // Check if this specific ticket exists and is eligible
    const winnerTicket = await prisma.ticket.findFirst({
      where: {
        ticketNumber: ticketNumberStr,
        isWinner: false,
        removed: false
      }
    });

    if (!winnerTicket) {
      return res.json({
        ticketNumber: ticketNumberStr,
        name: 'No Winner',
        ticketId: null,
        prizeName: selectedPrizeName,
        winnerFound: false
      });
    }

    const ticketId = winnerTicket.id;

    // Mark ticket as winner
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { isWinner: true },
    });

    // Create winner record if prizeId is resolved
    if (prizeId) {
      const winner = await prisma.winner.create({
        data: {
          ticketId: ticketId,
          prizeId: parseInt(prizeId),
        },
        include: { prize: true }
      });
      selectedPrizeName = winner.prize ? winner.prize.name : selectedPrizeName;
    }

    res.json({
      ticketNumber: ticketNumberStr,
      name: winnerTicket.name,
      ticketId: ticketId,
      prizeName: selectedPrizeName,
      winnerFound: true
    });
  } catch (error) {
    console.error('CRITICAL DRAW ERROR:', error);
    logger.error(`Draw failed: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Raffle draw failed: ' + error.message });
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
