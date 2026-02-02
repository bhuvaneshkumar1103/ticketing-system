require('dotenv').config();
const mongoose = require('mongoose');
const Asset = require('./models/Asset'); // Ensure the path matches your project

const assets = [
    {
        imei_no: "860100000001",
        device_id: "DEV-001",
        vehicle_no: "KA-01-HH-1234",
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 5,
        satellites_connected: 12,
        signal_strength_dbm: -65,
        data_upload_interval: 30,
        battery_duration: 95,
        tamper_detection: false,
        sos_button_status: "NORMAL",
        rto_compilance_status: true,
        is_online: true,
        gps_fixed: true,
        metadata: {
            device_model: "T-1000",
            manufacturer: "IoT Core",
            cluster_manager_id: "CMR_NORTH",
            installation_date: new Date('2023-01-10')
        }
    },
    {
        imei_no: "860100000002",
        device_id: "DEV-002",
        vehicle_no: "MH-12-AB-5678",
        latitude: 19.0760,
        longitude: 72.8777,
        accuracy: 50,
        satellites_connected: 3,
        signal_strength_dbm: -105, // Poor Signal
        data_upload_interval: 60,
        battery_duration: 10, // Low Battery
        tamper_detection: false,
        sos_button_status: "NORMAL",
        rto_compilance_status: true,
        is_online: true,
        gps_fixed: false,
        metadata: {
            device_model: "T-1000",
            manufacturer: "IoT Core",
            cluster_manager_id: "CMR_WEST",
            installation_date: new Date('2023-05-20')
        }
    },
    {
        imei_no: "860100000003",
        device_id: "DEV-003",
        vehicle_no: "DL-01-CC-9012",
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 100,
        satellites_connected: 0,
        signal_strength_dbm: -120,
        data_upload_interval: 30,
        battery_duration: 0, // Dead Battery
        tamper_detection: true, // Tampered!
        sos_button_status: "PRESSED",
        rto_compilance_status: false,
        is_online: false,
        gps_fixed: false,
        metadata: {
            device_model: "T-2000",
            manufacturer: "TechTrack",
            cluster_manager_id: "CMR_NORTH",
            installation_date: new Date('2022-11-15')
        }
    },
    {
        imei_no: "860100000004",
        device_id: "DEV-004",
        vehicle_no: "TN-07-JK-3456",
        latitude: 13.0827,
        longitude: 80.2707,
        accuracy: 8,
        satellites_connected: 9,
        signal_strength_dbm: -75,
        data_upload_interval: 30,
        battery_duration: 60,
        tamper_detection: false,
        sos_button_status: "NORMAL",
        rto_compilance_status: true,
        is_online: true,
        gps_fixed: true,
        metadata: {
            device_model: "UltraGPS",
            manufacturer: "SatLink",
            cluster_manager_id: "CMR_SOUTH",
            installation_date: new Date('2024-01-05')
        }
    },
    {
        imei_no: "860100000005",
        device_id: "DEV-005",
        vehicle_no: "TS-09-ER-7890",
        latitude: 17.3850,
        longitude: 78.4867,
        accuracy: 12,
        satellites_connected: 7,
        signal_strength_dbm: -88,
        data_upload_interval: 120,
        battery_duration: 40,
        tamper_detection: false,
        sos_button_status: "NORMAL",
        rto_compilance_status: false, // Non-compliant
        is_online: true,
        gps_fixed: true,
        metadata: {
            device_model: "T-1000",
            manufacturer: "IoT Core",
            cluster_manager_id: "CMR_SOUTH",
            installation_date: new Date('2023-08-12')
        }
    },
    {
        imei_no: "860100000006",
        device_id: "DEV-006",
        vehicle_no: "WB-02-ZZ-1111",
        latitude: 22.5726,
        longitude: 88.3639,
        accuracy: 4,
        satellites_connected: 14,
        signal_strength_dbm: -50,
        data_upload_interval: 30,
        battery_duration: 88,
        tamper_detection: false,
        sos_button_status: "NORMAL",
        rto_compilance_status: true,
        is_online: true,
        gps_fixed: true,
        metadata: {
            device_model: "T-2000",
            manufacturer: "TechTrack",
            cluster_manager_id: "CMR_EAST",
            installation_date: new Date('2023-12-01')
        }
    },
    {
        imei_no: "860100000007",
        device_id: "DEV-007",
        vehicle_no: "HR-26-QQ-2222",
        latitude: 28.4595,
        longitude: 77.0266,
        accuracy: 200,
        satellites_connected: 2,
        signal_strength_dbm: -115,
        data_upload_interval: 30,
        battery_duration: 5,
        tamper_detection: true,
        sos_button_status: "NORMAL",
        rto_compilance_status: true,
        is_online: false,
        gps_fixed: false,
        metadata: {
            device_model: "T-1000",
            manufacturer: "IoT Core",
            cluster_manager_id: "CMR_NORTH",
            installation_date: new Date('2023-03-30')
        }
    },
    {
        imei_no: "860100000008",
        device_id: "DEV-008",
        vehicle_no: "GJ-01-UU-3333",
        latitude: 23.0225,
        longitude: 72.5714,
        accuracy: 6,
        satellites_connected: 11,
        signal_strength_dbm: -70,
        data_upload_interval: 60,
        battery_duration: 72,
        tamper_detection: false,
        sos_button_status: "NORMAL",
        rto_compilance_status: true,
        is_online: true,
        gps_fixed: true,
        metadata: {
            device_model: "UltraGPS",
            manufacturer: "SatLink",
            cluster_manager_id: "CMR_WEST",
            installation_date: new Date('2023-10-10')
        }
    },
    {
        imei_no: "860100000009",
        device_id: "DEV-009",
        vehicle_no: "UP-32-AA-4444",
        latitude: 26.8467,
        longitude: 80.9462,
        accuracy: 10,
        satellites_connected: 8,
        signal_strength_dbm: -90,
        data_upload_interval: 30,
        battery_duration: 35,
        tamper_detection: false,
        sos_button_status: "NORMAL",
        rto_compilance_status: true,
        is_online: true,
        gps_fixed: true,
        metadata: {
            device_model: "T-1000",
            manufacturer: "IoT Core",
            cluster_manager_id: "CMR_NORTH",
            installation_date: new Date('2024-01-25')
        }
    },
    {
        imei_no: "860100000010",
        device_id: "DEV-010",
        vehicle_no: "KL-01-BB-9999",
        latitude: 8.5241,
        longitude: 76.9366,
        accuracy: 5,
        satellites_connected: 13,
        signal_strength_dbm: -62,
        data_upload_interval: 30,
        battery_duration: 99,
        tamper_detection: false,
        sos_button_status: "NORMAL",
        rto_compilance_status: true,
        is_online: true,
        gps_fixed: true,
        metadata: {
            device_model: "T-2000",
            manufacturer: "TechTrack",
            cluster_manager_id: "CMR_SOUTH",
            installation_date: new Date('2023-06-18')
        }
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");
        
        await Asset.deleteMany({});
        console.log("Existing assets cleared.");
        
        await Asset.insertMany(assets);
        console.log("✅ 10 Assets successfully seeded!");
        
        process.exit();
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedDB();