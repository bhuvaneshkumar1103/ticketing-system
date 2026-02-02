const Asset = require('../models/Asset');

// @desc    Get all assets with optional filtering
// @route   GET /api/assets
exports.getAssets = async (req, res) => {
  try {
    // Basic search filtering (matching our frontend filter row)
    const query = {};
    if (req.query.imei_no) query.imei_no = { $regex: req.query.imei_no, $options: 'i' };
    if (req.query.device_id) query.device_id = { $regex: req.query.device_id, $options: 'i' };

    const assets = await Asset.find(query).sort({ _id: -1 });
    res.status(200).json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single asset
// @route   GET /api/assets/:id
exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.status(200).json({ success: true, data: asset });
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
};

// @desc    Create new asset
// @route   POST /api/assets
exports.createAsset = async (req, res) => {
  try {
    const newAsset = await Asset.create(req.body);
    res.status(201).json({ success: true, data: newAsset });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: asset });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
exports.deleteAsset = async (req, res) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Asset deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};