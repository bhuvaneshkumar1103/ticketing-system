const Asset = require('../models/Asset'); // Ensure this matches your Asset model filename

/**
 * Main Analysis Coordinator
 */
const runTicketAnalysis = async (ticket) => {
    try {
        // --- PART 1: Update Status to IN_ANALYSIS ---
        await updateStatusToAnalysis(ticket);

        // --- PART 2: Business Logic to find Root Cause ---
        const analysisResult = await performBusinessLogic(ticket);

        // --- PART 3: Move to CMR Review and Save Results ---
        await finalizeForCMR(ticket, analysisResult);

    } catch (err) {
        console.error(`❌ Critical failure in Analysis Service for Ticket #${ticket.ticket_id}:`, err);
        // Fallback: don't leave ticket stuck in 'IN_ANALYSIS' if code crashes
        ticket.status = 'OPEN';
        await ticket.save();
    }
};

/**
 * PART 1: Set initial processing state
 */
const updateStatusToAnalysis = async (ticket) => {
    ticket.status = 'IN_ANALYSIS';
    ticket.last_updated_time = Date.now();
    await ticket.save();
    console.log(`[Phase 1] Ticket #${ticket.ticket_id} moved to IN_ANALYSIS`);
};

/**
 * PART 2: Business Logic (The Brains)
 * Compares RPA error with IoT Telemetry
 */
const performBusinessLogic = async (ticket) => {
    const asset = await Asset.findOne({ imei_no: ticket.imei_no });

    if (!asset) {
        return { root_cause: 'DEVICE_NOT_FOUND', steps: 'Verify IMEI registration.', data: {} };
    }

    // --- 1. Priority 1: Hardware Criticals ---
    // If the device is offline or tampered, data mismatches are secondary.
    if (asset.tamper_detection || !asset.is_online) {
        return { 
            root_cause: 'HARDWARE_OFFLINE', 
            steps: 'Hardware issue detected. Resolve physical connectivity before verifying portal data.', 
            data: { is_online: asset.is_online, tamper_detection: asset.tamper_detection } 
        };
    }

    // --- 2. Priority 2: Data Integrity (Missing & Mismatch) ---
    let suggestedData = {};
    let issueTypes = [];

    // Check for Missing Fields
    if (ticket.error_data.missing_fields?.length > 0) {
        issueTypes.push('DATA_MISSING');
        ticket.error_data.missing_fields.forEach(field => {
            suggestedData[field] = asset[field] !== undefined ? asset[field] : asset.metadata[field];
        });
    }

    // Check for Mismatched Fields
    const mismatchedKeys = Object.keys(ticket.error_data.mismatched_fields || {});
    if (mismatchedKeys.length > 0) {
        issueTypes.push('DATA_MISMATCH');
        mismatchedKeys.forEach(field => {
            // Only add to suggestedData if it's not already there from the missing check
            if (!suggestedData[field]) {
                suggestedData[field] = asset[field] !== undefined ? asset[field] : asset.metadata[field];
            }
        });
    }

    // Determine Final Root Cause based on findings
    if (issueTypes.length > 0) {
        const rootCause = issueTypes.length > 1 ? 'DATA_MISMATCH' : issueTypes[0]; // Mismatch is usually more "complex"
        const steps = issueTypes.length > 1 
            ? 'The portal has both missing and incorrect data. Update all fields using suggested_data.' 
            : `The portal has ${issueTypes[0].toLowerCase().replace('_', ' ')} issues. Update as per suggested_data.`;

        return {
            root_cause: rootCause,
            steps: steps,
            data: suggestedData
        };
    }

    return { root_cause: 'UNKNOWN', steps: 'RPA reported error, but no specific data issues found. Manual audit required.', data: {} };
};

/**
 * PART 3: Finalize and Handover
 */
const finalizeForCMR = async (ticket, result) => {
    ticket.analysis.root_cause = result.root_cause;
    ticket.analysis.resolution_steps = result.steps;
    
    // Inject the structured key-value pairs here
    ticket.analysis.suggested_data = result.data; 
    
    ticket.status = 'CMR_REVIEW';
    ticket.last_updated_time = Date.now();
    
    await ticket.save();
};

module.exports = { runTicketAnalysis };