const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const Share = require('./models/Share');
const File = require('./models/File');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/share', require('./routes/share'));

const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

// Public share link handler with PDF preview
app.get('/shared/:shareLink', async (req, res) => {
  try {
    const share = await Share.findOne({ shareLink: req.params.shareLink })
      .populate('file')
      .populate('owner', 'username email');
    if (!share) {
      return res.status(404).send('Link not found');
    }
    if (share.linkExpiry && new Date() > share.linkExpiry) {
      return res.status(403).send('Link expired');
    }
    const file = share.file;
    // Support both compressed (.gz) and normal PDFs
    let canPreviewPdf =
      file.mimetype === 'application/pdf' &&
      (file.path.endsWith('.pdf') || file.path.endsWith('.pdf.gz'));
    if (canPreviewPdf) {
      // Decompress if needed
      if (file.path.endsWith('.gz')) {
        const pdfPath = path.join(__dirname, file.path.replace(/\.gz$/, ''));
        const gzPath = path.join(__dirname, file.path);
        if (!fs.existsSync(pdfPath)) {
          const buffer = fs.readFileSync(gzPath);
          const decompressed = zlib.gunzipSync(buffer);
          fs.writeFileSync(pdfPath, decompressed);
        }
      }
      return res.send(`
        <html>
          <head>
            <title>Shared PDF: ${file.originalName}</title>
            <style>
              body { margin: 0; background: #2a2a2a; }
              .pdf-viewer {
                width: 100vw;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              embed {
                border: 2px solid #444;
                border-radius: 8px;
              }
            </style>
          </head>
          <body>
            <div class="pdf-viewer">
              <embed src="/shared/pdf/${file._id}" type="application/pdf" width="80%" height="90%" />
            </div>
          </body>
        </html>
      `);
    } else {
      return res.status(400).send('Only PDF files can be previewed at this link.');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

// Serve decompressed PDFs for sharing
app.get('/shared/pdf/:fileId', async (req, res) => {
  try {
    const share = await Share.findOne({ "file": req.params.fileId }).populate('file');
    if (!share) return res.status(404).send('No such share');
    const file = share.file;
    let pdfPath = path.join(__dirname, file.path);
    if (file.path.endsWith('.gz')) {
      // Decompress to temp if needed (same as above)
      const decompressedPath = pdfPath.replace(/\.gz$/, '');
      if (!fs.existsSync(decompressedPath)) {
        const buffer = fs.readFileSync(pdfPath);
        const decompressed = zlib.gunzipSync(buffer);
        fs.writeFileSync(decompressedPath, decompressed);
      }
      pdfPath = decompressedPath;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(pdfPath);
  } catch (e) {
    res.status(500).send("Could not serve PDF.");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));