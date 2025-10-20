const express = require('express');
const { createPdfWithImageFromUrl } = require('./services/pdfGenerator');

const app = express();
const port = 3000;

app.get('/generate-pdf', async (req, res) => {
  // Set the response headers here, as it's a server concern
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=document.pdf');

  const supabaseImageUrl = 'https://rxqfrojpwinspidmrgyl.supabase.co/storage/v1/object/public/edm/msf-logo.png';

  await createPdfWithImageFromUrl(res, supabaseImageUrl);
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});