const express = require('express');
const router = express.Router();
const bwipjs = require('bwip-js');

router.get('/:text', (req, res) => {
    bwipjs.toBuffer({
        bcid:        'code128',       // Barcode type
        text:        req.params.text, // Text to encode
        scale:       3,               // 3x scaling factor
        height:      10,              // Bar height, in millimeters
        includetext: true,            // Show human-readable text
        textxalign:  'center',        // Always good to set this
    }, function (err, png) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(png);
        }
    });
});

module.exports = router;
