const prisma = require('../lib/prisma');
const ExcelJS = require('exceljs');

const getWinners = async (req, res) => {
  try {
    const winners = await prisma.winner.findMany({
      include: {
        ticket: true,
        prize: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(winners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch winners' });
  }
};

const exportWinners = async (req, res) => {
  try {
    const winners = await prisma.winner.findMany({
      include: {
        ticket: true,
        prize: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Winners');

    worksheet.columns = [
      { header: 'Prize', key: 'prize', width: 20 },
      { header: 'Ticket', key: 'ticket', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Date', key: 'date', width: 25 },
    ];

    winners.forEach((w) => {
      worksheet.addRow({
        prize: w.prize ? w.prize.name : 'No Prize',
        ticket: w.ticket.ticketNumber,
        name: w.ticket.name,
        date: w.createdAt.toLocaleString(),
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'winners.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export winners' });
  }
};

const exportWinnersCSV = async (req, res) => {
  try {
    const winners = await prisma.winner.findMany({
      include: {
        ticket: true,
        prize: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let csvContent = "Prize,Ticket,Name,Date\n";
    winners.forEach(w => {
      const prize = w.prize ? w.prize.name : 'No Prize';
      const ticket = w.ticket.ticketNumber;
      const name = w.ticket.name;
      const date = w.createdAt.toLocaleString().replace(/,/g, '');
      csvContent += `"${prize}","${ticket}","${name}","${date}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=winners.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};

module.exports = { getWinners, exportWinners, exportWinnersCSV };
