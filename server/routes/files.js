const express = require('express');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const File = require('../models/File');
const Share = require('../models/Share');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Upload files
router.post('/upload', auth, upload.array('files', 10), async (req, res) => {
  try {
    const { compress } = req.body;
    const files = [];

    for (const file of req.files) {
      let filePath = file.path;
      let compressed = false;

      // Optional compression
      if (compress === 'true') {
        const compressedPath = `${file.path}.gz`;
        const gzip = zlib.createGzip();
        const source = fs.createReadStream(file.path);
        const destination = fs.createWriteStream(compressedPath);

        await new Promise((resolve, reject) => {
          source.pipe(gzip).pipe(destination)
            .on('finish', resolve)
            .on('error', reject);
        });

        fs.unlinkSync(file.path); // Delete original
        filePath = compressedPath;
        compressed = true;
      }

      const fileDoc = new File({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath,
        owner: req.user._id,
        compressed
      });

      await fileDoc.save();
      files.push(fileDoc);
    }

    res.status(201).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's files
router.get('/', auth, async (req, res) => {
  try {
    const files = await File.find({ owner: req.user._id })
      .sort({ uploadDate: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get shared files
router.get('/shared', auth, async (req, res) => {
  try {
    const shares = await Share.find({ sharedWith: req.user._id })
      .populate('file')
      .populate('owner', 'username email');
    
    const files = shares.map(share => ({
      ...share.file.toObject(),
      sharedBy: share.owner,
      shareId: share._id
    }));

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download file
router.get('/download/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check access permission
    const isOwner = file.owner.toString() === req.user._id.toString();
    const share = await Share.findOne({
      file: file._id,
      $or: [
        { sharedWith: req.user._id },
        { shareLink: req.query.link }
      ]
    });

    if (!isOwner && !share) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check link expiry
    if (share?.linkExpiry && new Date() > share.linkExpiry) {
      return res.status(403).json({ error: 'Share link expired' });
    }

    // Log access
    if (share) {
      share.accessLog.push({
        user: req.user._id,
        action: 'download'
      });
      await share.save();
    }

    // Handle compressed files
    if (file.compressed) {
      const gunzip = zlib.createGunzip();
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);
      
      fs.createReadStream(file.path)
        .pipe(gunzip)
        .pipe(res);
    } else {
      res.download(file.path, file.originalName);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete file
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete shares
    await Share.deleteMany({ file: file._id });

    await file.deleteOne();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;