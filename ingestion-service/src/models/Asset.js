const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
    // Primary Key (Replacing emis_no)
    imei_no: { type: String, required: true, unique: true, index: true },
    device_id: {type: String, required: true, unique:true, index: true},
    vehicle_no: {type: String},
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
    accuracy: {type: Number, required: true},
    satellites_connected: {type: Number, required: true},
    signal_strength_dbm: {type: Number, required: true},
    data_upload_interval : {type: Number, required: true},
    battery_duration: {type:Number, required: true},
    tamper_detection: {type: Boolean, required: true},
    sos_button_status: {type: String, required: true},
    rto_compilance_status: {type: Boolean, required: true},
    is_online: { type: Boolean, default: false , required: true},
    gps_fixed: { type: Boolean, default: false , required: true},
    // Business Metadata
    metadata: {
        device_model: String,
        manufacturer: String,
        cluster_manager_id: String,
        installation_date: Date
    }
});

module.exports = mongoose.model('Asset', AssetSchema);