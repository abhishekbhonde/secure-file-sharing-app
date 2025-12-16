const express = require('express');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const Share = require('../models/Share');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Share with specific users
router.post('/users', auth, async (req, res) => {
  try {
    const { fileId, userEmails, expiresInHours } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const users = await User.find({ email: { $in: userEmails } });
    const userIds = users.map(u => u._id);

    let linkExpiry;
    if (expiresInHours) {
      linkExpiry = new Date();
      linkExpiry.setHours(linkExpiry.getHours() + parseInt(expiresInHours));
    }

    let share = await Share.findOne({ file: fileId });

    if (share) {
      share.sharedWith = [...new Set([...share.sharedWith, ...userIds])];
      if (expiresInHours) share.linkExpiry = linkExpiry;
      await share.save();
    } else {
      share = new Share({
        file: fileId,
        owner: req.user._id,
        sharedWith: userIds,
        linkExpiry
      });
      await share.save();
    }

    res.json({ message: 'File shared successfully', share });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate share link
router.post('/link', auth, async (req, res) => {
  try {
    const { fileId, expiresInHours } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let linkExpiry;
    if (expiresInHours) {
      linkExpiry = new Date();
      linkExpiry.setHours(linkExpiry.getHours() + parseInt(expiresInHours));
    }

    let share = await Share.findOne({ file: fileId });

    if (share) {
      if (!share.shareLink) {
        share.shareLink = uuidv4();
      }
      if (expiresInHours) share.linkExpiry = linkExpiry;
      await share.save();
    } else {
      share = new Share({
        file: fileId,
        owner: req.user._id,
        shareLink: uuidv4(),
        linkExpiry
      });
      await share.save();
    }

    const shareUrl = `${req.protocol}://${req.get('host')}/shared/${share.shareLink}`;

    res.json({ shareLink: share.shareLink, shareUrl, expiry: linkExpiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Access file via share link
router.get('/link/:link', auth, async (req, res) => {
  try {
    const share = await Share.findOne({ shareLink: req.params.link })
      .populate('file')
      .populate('owner', 'username email');

    if (!share) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    if (share.linkExpiry && new Date() > share.linkExpiry) {
      return res.status(403).json({ error: 'Share link expired' });
    }

    // Log access
    share.accessLog.push({
      user: req.user._id,
      action: 'view'
    });
    await share.save();

    res.json({
      file: share.file,
      owner: share.owner,
      expiry: share.linkExpiry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get shares for a file (audit log)
router.get('/file/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const share = await Share.findOne({ file: req.params.fileId })
      .populate('sharedWith', 'username email')
      .populate('accessLog.user', 'username email');

    res.json(share || { message: 'File not shared yet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke access
router.delete('/revoke/:fileId/:userId', auth, async (req, res) => {
  try {
    const share = await Share.findOne({ file: req.params.fileId });
    
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    if (share.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    share.sharedWith = share.sharedWith.filter(
      id => id.toString() !== req.params.userId
    );
    await share.save();

    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;