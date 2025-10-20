const PDFDocument = require('pdfkit');
const axios = require('axios');

const notes = [
  'A confirmation has been sent to both you and the MSF POC.',
  'Please ensure required notice periods are respected:',
  '2 working days for self-collection', // Child item
  '3 working days for delivery', // Child item
  '5 working days if cleaning required', // Child item
  'A receipt for end-of-month billing will be attached/issued separately.',
];

async function generateBookingAttachmentPdf(res, imageUrl, bookingData) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 80, bottom: 20, left: 125, right: 125 }
  });

  // Helper to draw a horizontal line
  const drawHorizontalLine = () => {
    // Add some space ABOVE the line.
    doc.moveDown();

    // Draw the line at the current cursor position.
    doc
      .strokeColor('#C7C5B6')
      .lineWidth(1)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();
  };

  // Helper for key-value pairs in the "Key Event Details" section
  const addDetailRow = (key, value, skipMoveDown) => {
    doc.font('Inter-Regular').fontSize(10).text(`${key}: `, { continued: true });
    doc.font('Inter-Bold').text(value);
    if (!skipMoveDown) {
      doc.moveDown(0.5);
    }
  };

  // --- DOCUMENT SETUP ---

  doc.pipe(res);
  // Register Fonts
  doc.registerFont('Inter-Regular', './fonts/Inter_18pt-Regular.ttf');
  doc.registerFont('Inter-SemiBold', './fonts/Inter_18pt-SemiBold.ttf');
  doc.registerFont('Inter-Bold', './fonts/Inter_18pt-Bold.ttf');

  // Set Background Color
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fbf6e2');
  // Set default text color
  doc.fillColor('#4D4F4D');

  try {
    // Fetch the image from the URL
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    // --- 1. HEADER ---
    const imageWidth = 80;
    const xPosition = (doc.page.width - imageWidth) / 2;
    const yPosition = 20
    doc.image(imageBuffer, xPosition, yPosition, { width: imageWidth });
    // --- 2. MAIN TITLE ---
    doc.font('Inter-Bold').fontSize(18).text('MSF Bouncy Castle Booking Confirmation', {
      align: 'center',
    });
    doc.moveDown();

    // --- 3. GREETING ---
    doc.font('Inter-Regular').fontSize(10).text('Hello ', { continued: true });
    doc.font('Inter-Bold').text(`${bookingData.pic},`);
    doc.moveDown(0.4);
    doc.font('Inter-Regular').text('Your booking request has been successfully received. Please find the details of your booking below:');
    doc.moveDown();

    doc.font('Inter-Bold').fontSize(12).text('Booking Dates');
    doc.moveDown(0.4);
    doc.font('Inter-Regular').fontSize(10).text(bookingData.bookingDates);
    drawHorizontalLine();
    doc.moveDown();

    doc.font('Inter-Bold').fontSize(12).text('Bouncy Castle Selection');
    doc.moveDown(0.4);
    bookingData.selection.forEach(item => doc.font('Inter-SemiBold').fontSize(10).text(item));
    doc.moveDown(0.4);
    doc.font('Inter-Regular').fontSize(10).text(`Collection Method: ${bookingData.collectionMethod}`);
    // --- 5. KEY EVENT DETAILS ---
    drawHorizontalLine();
    doc.moveDown();
    doc.font('Inter-Bold').fontSize(12).text('Key Event Details');
    doc.moveDown(0.4);
    addDetailRow('Event Name', bookingData.eventName);
    addDetailRow('Booking Start Time', bookingData.startTime);
    addDetailRow('Booking End Time', bookingData.endTime);
    addDetailRow('Event Location', bookingData.location);
    addDetailRow('Requestor\'s Department', bookingData.department);
    addDetailRow('PIC', bookingData.pic);
    addDetailRow('Tel', bookingData.email);
    addDetailRow('Remarks', bookingData.remarks, true);
    drawHorizontalLine();
    doc.moveDown();

    // --- 6. NOTES ---
    doc.font('Inter-Bold').fontSize(12).text('Notes');
    doc.moveDown(0.4);
    doc.font('Inter-Regular').fontSize(10);
    // Loop through the notes to manually create the nested list
    notes.forEach(note => {
      // Check if the note is a child item
      const isChild = /^\d/.test(note);

      // Set a different left margin (x position) for child items
      const xPosition = isChild ? doc.page.margins.left + 10 : doc.page.margins.left;

      // Manually add the bullet character and then the note text
      // We specify the x-coordinate to create the indentation
      doc.text(`• ${note}`, xPosition, doc.y, {
        lineGap: 4
      });
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    doc.fillColor('black');
    doc.fontSize(12).text('Error: Could not generate the PDF.', { align: 'center' });
  }

  doc.end();
}

/**
 * Generates the PDF and returns it as a buffer for attachments.
 * @param {string} imageUrl
 * @param {object} bookingData
 * @returns {Promise<Buffer>}
 */
function generatePdfAsBuffer(imageUrl, bookingData) {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 80, bottom: 20, left: 125, right: 125 }
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Helper to draw a horizontal line
    const drawHorizontalLine = () => {
      // Add some space ABOVE the line.
      doc.moveDown();

      // Draw the line at the current cursor position.
      doc
        .strokeColor('#C7C5B6')
        .lineWidth(1)
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
    };

    // Helper for key-value pairs in the "Key Event Details" section
    const addDetailRow = (key, value, skipMoveDown) => {
      doc.font('Inter-Regular').fontSize(10).text(`${key}: `, { continued: true });
      doc.font('Inter-Bold').text(value);
      if (!skipMoveDown) {
        doc.moveDown(0.5);
      }
    };

    // Register Fonts
    doc.registerFont('Inter-Regular', './fonts/Inter_18pt-Regular.ttf');
    doc.registerFont('Inter-SemiBold', './fonts/Inter_18pt-SemiBold.ttf');
    doc.registerFont('Inter-Bold', './fonts/Inter_18pt-Bold.ttf');

    // Set Background Color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fbf6e2');
    // Set default text color
    doc.fillColor('#4D4F4D');

    try {
      // Fetch the image from the URL
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');

      // --- 1. HEADER ---
      const imageWidth = 80;
      const xPosition = (doc.page.width - imageWidth) / 2;
      const yPosition = 20
      doc.image(imageBuffer, xPosition, yPosition, { width: imageWidth });

      // --- 2. MAIN TITLE ---
      doc.font('Inter-Bold').fontSize(18).text('MSF Bouncy Castle Booking Confirmation', {
        align: 'center',
      });
      doc.moveDown();

      // --- 3. GREETING ---
      doc.font('Inter-Regular').fontSize(10).text('Hello ', { continued: true });
      doc.font('Inter-Bold').text(`${bookingData.pic},`);
      doc.moveDown(0.4);
      doc.font('Inter-Regular').text('Your booking request has been successfully received. Please find the details of your booking below:');
      doc.moveDown();

      doc.font('Inter-Bold').fontSize(12).text('Booking Dates');
      doc.moveDown(0.4);
      doc.font('Inter-Regular').fontSize(10).text(bookingData.bookingDates);
      drawHorizontalLine();
      doc.moveDown();

      doc.font('Inter-Bold').fontSize(12).text('Bouncy Castle Selection');
      doc.moveDown(0.4);
      bookingData.selection.forEach(item => doc.font('Inter-SemiBold').fontSize(10).text(item));
      doc.moveDown(0.4);
      doc.font('Inter-Regular').fontSize(10).text(`Collection Method: ${bookingData.collectionMethod}`);

      // --- 5. KEY EVENT DETAILS ---
      drawHorizontalLine();
      doc.moveDown();
      doc.font('Inter-Bold').fontSize(12).text('Key Event Details');
      doc.moveDown(0.4);
      addDetailRow('Event Name', bookingData.eventName);
      addDetailRow('Booking Start Time', bookingData.startTime);
      addDetailRow('Booking End Time', bookingData.endTime);
      addDetailRow('Event Location', bookingData.location);
      addDetailRow('Requestor\'s Department', bookingData.department);
      addDetailRow('PIC', bookingData.pic);
      addDetailRow('Tel', bookingData.email);
      addDetailRow('Remarks', bookingData.remarks, true);
      drawHorizontalLine();
      doc.moveDown();

      // --- 6. NOTES ---
      doc.font('Inter-Bold').fontSize(12).text('Notes');
      doc.moveDown(0.4);
      doc.font('Inter-Regular').fontSize(10);
      // Loop through the notes to manually create the nested list
      notes.forEach(note => {
        // Check if the note is a child item
        const isChild = /^\d/.test(note);

        // Set a different left margin (x position) for child items
        const xPosition = isChild ? doc.page.margins.left + 10 : doc.page.margins.left;

        // Manually add the bullet character and then the note text
        // We specify the x-coordinate to create the indentation
        doc.text(`• ${note}`, xPosition, doc.y, {
          lineGap: 4
        });
      });
    } catch (error) {
      reject(error);
    }

    doc.end();
  });
}


const sampleBookingData = {
  pic: 'Afiq Rahman',
  bookingDates: 'Wednesday - Friday, 1 - 3 March, 2025',
  selection: ['1x Bouncy Castle 5 (Family Time)', '2x Bouncy Castle 6 (Slide)'],
  collectionMethod: 'Self-Collection',
  eventName: 'MSF Family Day - North Zone',
  startTime: 'Wed, 1 March 2025 09:00AM',
  endTime: 'Fri, 3 March 2025 08:00PM',
  location: 'Community Hall @ Northpoint',
  department: 'Youth & Sports',
  email: 'afiq.rahman@msf.gov.sg',
  remarks: 'Outdoor setup; ensure safety mats and power supply 13A available.',
};

module.exports = { generateBookingAttachmentPdf, sampleBookingData, generatePdfAsBuffer };