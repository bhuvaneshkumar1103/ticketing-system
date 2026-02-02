const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');

router.get('', authorize(['CMR', 'MANUFACTURER', 'ADMIN']), (req, res) => {
    res.json({
        fields: {
            status: {
                type: 'select',
                options: ['OPEN', 'IN_ANALYSIS', 'CMR_REVIEW', 'MANUFACTURER_ANALYSIS', 'RESOLVED'],
                editableBy: ['CMR'] // Frontend uses this to grey out fields
            },
            root_cause: {
                type: 'select',
                options: ['DATA_MISSING', 'DATA_MISMATCH', 'HARDWARE_OFFLINE'],
                editableBy: [] // AI only
            }
        }
    });
});

module.exports = router;