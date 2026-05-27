const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock database of active rides
let rides = [];

// Mock database of driver profiles
let drivers = [
    { id: 1, name: 'John Doe', phone: '555-0100', vehicle: 'Sedan', license: 'ABC123', rating: 4.8, available: true },
    { id: 2, name: 'Jane Smith', phone: '555-0111', vehicle: 'SUV', license: 'XYZ789', rating: 4.9, available: true },
];

const availableCars = [
    { id: 1, name: 'Sedan' },
    { id: 2, name: 'SUV' },

];

app.get('/api/cars', (req, res) => {
    res.json(availableCars);
});

// Drivers endpoints
app.get('/api/drivers', (req, res) => {
    res.json(drivers);
});

app.post('/api/drivers', (req, res) => {
    const { name, phone, vehicle, license, rating } = req.body;
    if (!name) return res.status(400).json({ error: 'Driver name is required' });
    const newDriver = {
        id: drivers.length + 1,
        name,
        phone: phone || '',
        vehicle: vehicle || 'Sedan',
        license: license || '',
        rating: rating || 5,
        available: true,
    };
    drivers.push(newDriver);
    console.log('Driver created:', newDriver.name);
    res.status(201).json(newDriver);
});

// Route to request a ride or delivery
app.post('/api/book-ride', (req, res) => {
    const { passengerName, pickup, destination, carType, serviceType, packageDetails } = req.body;
    const mode = serviceType === 'Delivery' ? 'Delivery' : 'Ride';

    // Try to assign a driver for ride requests
    let assignedDriver = null;
    if (mode === 'Ride') {
        assignedDriver = drivers.find(d => d.available && (!carType || d.vehicle === carType));
        if (assignedDriver) assignedDriver.available = false;
    }

    const newRide = {
        id: rides.length + 1,
        passengerName,
        pickup,
        destination,
        serviceType: mode,
        carType: carType || 'Sedan',
        packageDetails: mode === 'Delivery' ? packageDetails || '' : '',
        status: assignedDriver ? 'Driver assigned' : (mode === 'Delivery' ? 'Assigning a courier...' : 'Searching for nearby driver...'),
        driver: assignedDriver ? assignedDriver.name : (mode === 'Delivery' ? "Kheni's Courier Squad #1" : "No driver yet")
    };

    rides.push(newRide);
    console.log(`New ${mode.toLowerCase()} requested to ${destination} with ${newRide.carType}`);
    res.status(201).json(newRide);
});

app.listen(PORT, () => {
    console.log(`Kheni's Backend running on http://localhost:${PORT}`);
});

const PRICE_PER_KM = 25;

function calculateFare(distanceKm) {
    return distanceKm * PRICE_PER_KM;
}
