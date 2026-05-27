const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock database of active rides
let rides = [];

const availableCars = [
    { id: 1, name: 'Sedan' },
    { id: 2, name: 'SUV' },

];

app.get('/api/cars', (req, res) => {
    res.json(availableCars);
});

// Route to request a ride or delivery
app.post('/api/book-ride', (req, res) => {
    const { passengerName, pickup, destination, carType, serviceType, packageDetails } = req.body;
    const mode = serviceType === 'Delivery' ? 'Delivery' : 'Ride';
    const newRide = {
        id: rides.length + 1,
        passengerName,
        pickup,
        destination,
        serviceType: mode,
        carType: carType || 'Sedan',
        packageDetails: mode === 'Delivery' ? packageDetails || '' : '',
        status: mode === 'Delivery' ? 'Assigning a courier...' : 'Searching for nearby driver...',
        driver: mode === 'Delivery' ? "Kheni's Courier Squad #1" : "Kheni's Local Hero #1"
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
