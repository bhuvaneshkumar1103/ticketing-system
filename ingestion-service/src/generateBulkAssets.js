require('dotenv').config();
const mongoose = require('mongoose');
const Asset = require('./models/Asset'); 

const generateData = () => {
    const bulkAssets = [];
    const regions = ['CMR_NORTH', 'CMR_SOUTH', 'CMR_EAST', 'CMR_WEST', 'CMR_CENTRAL'];
    const models = ['T-1000', 'T-2000', 'UltraGPS', 'Apex-Tracker'];

    // Starting from 11 because we already have 1-10
    for (let i = 11; i <= 100; i++) {
        const isOnline = Math.random() > 0.15; // 85% online
        const hasGps = isOnline ? Math.random() > 0.1 : false; // 90% GPS fix if online
        
        bulkAssets.push({
            imei_no: `860100000${i.toString().padStart(3, '0')}`,
            device_id: `DEV-${i.toString().padStart(3, '0')}`,
            vehicle_no: `IND-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i+1) % 26))}-${i}${i+1}`,
            latitude: 12.0 + Math.random() * 15,
            longitude: 72.0 + Math.random() * 15,
            accuracy: Math.floor(Math.random() * 50),
            satellites_connected: isOnline ? Math.floor(Math.random() * 15) : 0,
            signal_strength_dbm: isOnline ? -(Math.floor(Math.random() * 40) + 50) : -120,
            data_upload_interval: 30,
            battery_duration: Math.floor(Math.random() * 100),
            tamper_detection: Math.random() < 0.05, // 5% chance of tampering
            sos_button_status: Math.random() < 0.02 ? "PRESSED" : "NORMAL",
            rto_compilance_status: Math.random() > 0.05,
            is_online: isOnline,
            gps_fixed: hasGps,
            metadata: {
                device_model: models[i % models.length],
                manufacturer: "IoT Global Corp",
                cluster_manager_id: regions[i % regions.length],
                installation_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
            }
        });
    }
    return bulkAssets;
};

const seedBulkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for bulk seeding...");

        const data = generateData();
        // Use insertMany for high performance
        await Asset.insertMany(data);
        
        console.log(`✅ Successfully added 90 new assets. Total should now be 100.`);
        process.exit();
    } catch (err) {
        console.error("❌ Bulk Seeding failed:", err);
        process.exit(1);
    }
};

seedBulkDB();