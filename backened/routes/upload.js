const express = require('express');
const router = express.Router();

// Upload functionality temporarily disabled
// Will be re-enabled with Cloudinary later

router.post('/', (req, res) => {
  res.status(503).json({ 
    message: 'Image upload temporarily disabled because cloudinary integration is not added coming soon' 
  });
});

module.exports = router;