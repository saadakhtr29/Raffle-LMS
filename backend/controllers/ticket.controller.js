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

    console.log(`Parsed ${data.length} records from file.`);
    if (data.length > 0) {
      console.log('First record sample:', JSON.stringify(data[0]));
    }

    let uploadedCount = 0;
    let duplicateCount = 0;
    let skipCount = 0;

    for (const record of data) {
      const ticketNumber = String(record.ticket_number || record.TicketNumber || record.ticketNumber || '').trim();
      const name = String(record.name || record.Name || record.participant_name || '').trim();

      if (!ticketNumber || !name) {
        skipCount++;
        continue;
      }

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

    res.json({ uploaded: uploadedCount, duplicates: duplicateCount, skipped: skipCount });
  } catch (error) {
    console.error('Upload error:', error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Failed to process file' });
  }
};

const searchTickets = async (req, res) => {
  const { search = '', page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  try {
    const where = {
      OR: [
        { ticketNumber: { contains: search } },
        { name: { contains: search } },
      ],
    };

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        select: {
          id: true,
          ticketNumber: true,
          name: true,
          isWinner: true,
          removed: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({ tickets, total, page: parseInt(page), totalPages: Math.ceil(total / take) });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};

module.exports = { uploadTickets, searchTickets };
