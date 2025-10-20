const PDFDocument = require('pdfkit');
const axios = require('axios');

/**
 * Generates a PDF with an image from a URL and pipes it to a writable stream.
 * @param {object} res - The Express response stream.
 * @param {string} imageUrl - The URL of the image to include.
 */
async function createPdfWithImageFromUrl(res, imageUrl) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Pipe the PDF content to the response stream
  doc.pipe(res);

  try {
    // Fetch the image from the URL
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    // --- Add Content to PDF ---

    // Header Image
    const imageWidth = 100;
    // Calculate the x coordinate to center the image on the page
    const xPosition = (doc.page.width - imageWidth) / 2;
    // Header Image
    doc.image(imageBuffer, xPosition, 30, {
      width: imageWidth
    });

    // Body Text
    doc.y = 150; // Set Y position below the image
    doc.fontSize(24).text('Lorem ipsum', { align: 'center' });

  } catch (error) {
    console.error('Error generating PDF:', error);
    doc.fontSize(16).text('Error: Could not generate the PDF.', { align: 'center' });
  }

  // Finalize the PDF
  doc.end();
}

// Export the function to make it accessible in other files
module.exports = { createPdfWithImageFromUrl };