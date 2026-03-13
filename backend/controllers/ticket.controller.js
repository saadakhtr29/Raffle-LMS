const prisma = require('../lib/prisma');
const { parseExcel, parseCSV } = require('../utils/fileParser');
const fs = require('fs');

const uploadTickets = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

  try {
    let data = [];
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      data = parseExcel(filePath);
    } else if (fileExtension === 'csv') {
      data = await parseCSV(filePath);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    let uploadedCount = 0;
    let duplicateCount = 0;

    // Use a transaction or batching if performance is an issue for 100k+ tickets
    // For now, simple loop with error handling for duplicates
    for (const record of data) {
      const ticketNumber = String(record.ticket_number || record.TicketNumber || record.ticketNumber || '');
      const name = record.name || record.Name || record.participant_name || '';

      if (!ticketNumber || !name) continue;

      try {
        await prisma.ticket.upsert({
          where: { ticketNumber },
          update: {},
          create: {
            ticketNumber,
            name,
          },
        });
        uploadedCount++;
      } catch (error) {
        console.error(`Error processing ticket ${ticketNumber}:`, error);
        duplicateCount++;
      }
    }

    // Cleanup file
    fs.unlinkSync(filePath);

    res.json({ uploaded: uploadedCount, duplicates: duplicateCount });
  } catch (error) {
    console.error('Upload error:', error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Failed to process file' });
  }
};

const searchTickets = async (req, res) => {
  const { search } = req.query;

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { ticketNumber: { contains: search } },
          { name: { contains: search } },
        ],
      },
      select: {
        id: true,
        ticketNumber: true,
        name: true,
        isWinner: true,
        removed: true,
      },
      take: 50, // Limit results for performance
    });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};

module.exports = { uploadTickets, searchTickets };
