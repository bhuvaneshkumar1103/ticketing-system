const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const { runTicketAnalysis } = require('../services/analysisService'); // Import the service
const Counter = require('../models/Counter');
const { authorize } = require('../middleware/auth');

router.post('/report-error', async (req, res) => {
    try {
        console.log(req.body);
        const { imei_no, error_message, source, mismatched_fields, missing_fields,status } = req.body;

        const counter = await Counter.findOneAndUpdate(
            { id: 'ticket_id' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        // 1. Create the initial ticket with status IN_ANALYSIS
        const newTicket = new Ticket({
            ticket_id: counter.seq, // Manually assigning the controlled ID
            imei_no,
            status: status || 'OPEN', 
            error_data: {
                source_website: source,
                error_message,
                mismatched_fields: mismatched_fields || {},
                missing_fields: missing_fields || [],
                reported_by: "RPA_AUTOMATION"
            }
        });

        // 2. Save the ticket (this triggers the auto-increment ID)
        await newTicket.save();

        // 3. Trigger the Analysis Service (Asynchronous)
        // We don't use 'await' here if we want to return the response immediately to the RPA bot
        runTicketAnalysis(newTicket);

        res.status(201).json({
            success: true,
            message: "Ticket received and analysis started",
            ticket_id: newTicket.ticket_id,
            current_status: newTicket.status
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/chat-report-error', async (req, res) => {
    try {
        console.log(req.body);
        const { error_message, history} = req.body;

        const counter = await Counter.findOneAndUpdate(
            { id: 'ticket_id' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        imei_no = "860100000010";

        // 1. Create the initial ticket with status IN_ANALYSIS
        const newTicket = new Ticket({
            ticket_id: counter.seq, // Manually assigning the controlled ID
            imei_no,
            history,
            status: 'OPEN', 
            error_data: {
                source_website: "Fitter App",
                error_message: "Error in Fitment App, Kindly Assist",
                mismatched_fields: {},
                missing_fields: [],
                reported_by: "CHAT_BOT"
            }
        });

        // 2. Save the ticket (this triggers the auto-increment ID)
        await newTicket.save();

        // 3. Trigger the Analysis Service (Asynchronous)
        // We don't use 'await' here if we want to return the response immediately to the RPA bot
        runTicketAnalysis(newTicket);

        res.status(201).json({
            success: true,
            message: "Ticket received and analysis started",
            ticket_id: newTicket.ticket_id,
            current_status: newTicket.status
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * @POST - Full Ticket Creation.
 * Accepts all fields fr manual UI entry.
 */
router.post('/', authorize(['CMR', 'ADMIN']), async (req, res) => {
    try {
        const { imei_no, error_message, source, mismatched_fields, missing_fields, reported_by } = req.body;

        // 1. STAGE 1: Validation
        // If this fails, the code jumps to catch() and the counter stays the same
        if (!imei_no) {
            return res.status(400).json({ success: false, error: "IMEI number is required" });
        }

        // 2. STAGE 2: Increment Counter
        // We only do this once we are confident the request is valid
        const counter = await Counter.findOneAndUpdate(
            { id: 'ticket_id' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        // 3. STAGE 3: Create and Save Ticket
        const newTicket = new Ticket({
            ticket_id: counter.seq, // Manually assigning the controlled ID
            imei_no,
            status: 'OPEN',
            error_data: {
                source_website: source || "UI_MANUAL",
                error_message,
                mismatched_fields: mismatched_fields || {},
                missing_fields: missing_fields || [],
                reported_by: reported_by || "SYSTEM"
            }
        });

        await newTicket.save();

        // 4. STAGE 4: Trigger Background Analysis
        // We pass the ticket object to the service
        runTicketAnalysis(newTicket);

        res.status(201).json({
            success: true,
            ticket_id: newTicket.ticket_id,
            message: "Ticket created and analysis started."
        });

    } catch (err) {
        console.error("Ticket Creation Error:", err.message);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error", 
            details: err.message 
        });
    }
});

// 2. READ: Get All Tickets (With Filtering)
// Example: /api/tickets?status=CMR_REVIEW
/**
 * @GET /search - Advanced List with Pagination, Sorting, and Search
 * Query Params:
 * - page: Current page number (default: 1)
 * - limit: Rows per page (default: 10)
 * - sortBy: Field to sort by (default: last_updated_time)
 * - sortOrder: 'asc' or 'desc' (default: desc)
 * - [Any other field]: imei_no, status, etc.
 */
router.get('', authorize(['CMR', 'MANUFACTURER', 'ADMIN']), async (req, res) => {
    let filter = { ...req.accessFilter, ...req.query };
    try {
        // 1. Extract and Set Defaults
        const page = parseInt(req.query.page) || 1;
        const startIndex = parseInt(req.query.start_index) || 1;
        const limit = parseInt(req.query.row_count) || 10;
        const sortBy = req.query.sort_by || 'last_updated_time';
        const sortOrder = req.query.sort_order === 'des' ? -1 : 1;
        
        // Calculate Skip (e.g., Page 2 with 10 limit skips 10 rows)
        const skip = startIndex ? startIndex -1 : ((page - 1) * limit);

        // 2. Build Dynamic Search Filter
        const { status, imei_no, root_cause, ticket_id } = req.query;

        if (ticket_id) filter.ticket_id = ticket_id;
        if (imei_no) filter.imei_no = imei_no;
        if (status) filter.status = status;
        if (root_cause) filter['analysis.root_cause'] = { $regex: root_cause, $options: 'i' };

        // 3. Execute Query with Sorting and Pagination
        // We use Promise.all to get both the data and the total count in parallel
        const [tickets, totalCount] = await Promise.all([
            Ticket.find(filter)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit),
            Ticket.countDocuments(filter)
        ]);

        // 4. Return Structured Response
        res.json({
            success: true,
            pagination: {
                total_records: totalCount,
                current_page: page,
                total_pages: Math.ceil(totalCount / limit),
                row_count: tickets.length
            },
            filters_applied: filter,
            sorting: {
                field: sortBy,
                order: req.query.sortOrder || 'desc'
            },
            data: tickets
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. READ: Get Single Ticket by Readable ID (ticket_id)
router.get('/:id', authorize(['CMR', 'MANUFACTURER', 'ADMIN']), async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
        ticket_id: req.params.id, 
        ...req.accessFilter 
    });
        
    if (!ticket) {
        return res.status(403).json({ error: "Ticket not found or unauthorized" });
    }

    if (req.user && req.user.role === 'MANUFACTURER') {
      // 1. Fetch Asset profile
      var asset = await Asset.findOne({ imei_no: ticket.imei_no });
      
      // SAFETY CHECK: If asset is null, allowedKeys is an empty array
      var allowedKeys = asset ? Object.keys(asset.toObject()) : [];
      allowedKeys = allowedKeys.concat(Object.keys(asset.metadata));

      // Logic for the Missing Fields Array
      const getTechnicalMissingFields = (missingArray) => {
          // Check allowedKeys.length to ensure we have technical data to compare against
          if (allowedKeys.length === 0) return []; 

          return (missingArray || []).filter(fieldKey => 
              allowedKeys.includes(fieldKey.toLowerCase()) && !["vehicle_no"].includes(fieldKey.toLowerCase())
          );
      };

      // 2. Filter Mismatched Fields
      const techMismatches = {};
      if (allowedKeys.length > 0) {
        Object.keys(ticket.error_data.mismatched_fields || {}).forEach(key => {
          if (allowedKeys.includes(key) && !["vehicle_no"].includes(key)) techMismatches[key] = ticket.error_data.mismatched_fields[key];
        });
      }

      // 3. Filter Suggested Data in Analysis
      const techSuggestions = {};
      if (allowedKeys.length > 0) {
        Object.keys(ticket.analysis.suggested_data || {}).forEach(key => {
          if (allowedKeys.includes(key) && !["vehicle_no"].includes(key)) techSuggestions[key] = ticket.analysis.suggested_data[key];
        });
      }

      // Override original fields for the response
      ticket.error_data.mismatched_fields = techMismatches;
      ticket.analysis.suggested_data = techSuggestions;
      ticket.error_data.missing_fields = getTechnicalMissingFields(ticket.error_data.missing_fields);
      
      // Redact sensitive message
      ticket.error_data.error_message = "Technical Data Mismatch - Details Restricted"; 
    }

    res.json({ data: ticket });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// 4. UPDATE: Update Status or Add Comments
// Used by CMR to move ticket to 'RESOLVED'
// 4. UPDATE: Update All Fields + Status Logic
router.put('/:id', authorize(['CMR', 'MANUFACTURER', 'ADMIN']), async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ 
            ticket_id: req.params.id, 
            ...req.accessFilter 
        });
        
        if (!ticket) {
            return res.status(403).json({ error: "Ticket not found or unauthorized" });
        }

        const role = req.user.role;
        const updates = req.body;
        console.log(role);
        if (role === 'MANUFACTURER') {
            // 1. STRICT LOCK: Manufacturer can ONLY change these specific things
            const allowedStatus = ['MANUFACTURER_ANALYSIS', 'RESOLVED'];
            
            // Only update status if it's in the allowed list
            if (updates.status && allowedStatus.includes(updates.status)) {
                ticket.status = updates.status;
            } else {
                // Default forced status if they don't provide one or provide an illegal one
                // ticket.status = 'MANUFACTURER_ANALYSIS';
                return res.status(403).json({ error: "You are not allowed to move status other than resolved" }); 
            }

            // Only update the resolution field
            if (updates.manufacturer_resolution) {
                ticket.manufacturer_resolution = updates.manufacturer_resolution;
            }

            // BLOCK everything else by not mapping updates to other fields
        } else {
            // 2. OTHERS (ADMIN/CMR) LOCK: Cannot touch manufacturer fields
            const { 
                manufacturer_resolution, 
                status, 
                ticket_id, 
                _id, 
                ...otherUpdates 
            } = updates;

            // Prevent others from moving the ticket TO or FROM manufacturer statuses
            const restrictedStatuses = ['MANUFACTURER_ANALYSIS', 'RESOLVED'];
            if (status && !restrictedStatuses.includes(status)) {
                ticket.status = status;
            }

            // Apply all other allowed fields
            Object.assign(ticket, otherUpdates);
        }

        ticket.last_updated_time = Date.now();
        await ticket.save();
        runTicketAnalysis(newTicket);

        res.json({ message: "Update successful", data: ticket });
        
    } catch (err) {
        res.status(400).json({ error: "Update failed", details: err.message });
    }
});

// 5. DELETE: Remove a Ticket
router.delete('/:id',authorize(['ADMIN']), async (req, res) => {
    try {
        const ticket = await Ticket.findOneAndDelete({ ticket_id: req.params.id });
        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
        res.json({ success: true, message: "Ticket deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;