const express = require('express');
const { generateBookingAttachmentPdf, sampleBookingData } = require('./services/pdfGenerator');

const app = express();
const port = 3000;

app.get('/generate-pdf', async (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=booking-confirmation.pdf');

  const logoImageUrl = 'https://rxqfrojpwinspidmrgyl.supabase.co/storage/v1/object/public/edm/msf-logo-hd.png';

  await generateBookingAttachmentPdf(res, logoImageUrl, sampleBookingData);
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});