const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    ticket_id: { type: Number, unique: true },
    imei_no: { type: String, required: true, index: true },
    history: {type: String},
    error_data: {
        source_website: String,
        error_message: String,
        
        // CHANGED: Now an Object to store field names and their incorrect values
        mismatched_fields: { type: Object, default: {} }, 
        
        missing_fields: [String], 
        timestamp: { type: Date, default: Date.now },
        reported_by: { type: String }
    },

    analysis: {
        root_cause: { 
            type: String, 
            enum: ['DATA_MISSING', 'DATA_MISMATCH', 'HARDWARE_FAILURE', 'DEVICE_NOT_FOUND', 'UNKNOWN'],
            default: 'UNKNOWN'
        },
        resolution_steps: String,
        suggested_data: { type: Object, default: {} }
    },

    last_updated_time: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['OPEN', 'IN_ANALYSIS', 'CMR_REVIEW', 'MANUFACTURER_ANALYSIS', 'RESOLVED', 'CLOSED'], 
        default: 'OPEN' 
    },
    manufacturer_resolution: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model('Ticket', TicketSchema);