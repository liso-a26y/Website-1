import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({ name: '', pickup: '', destination: '', serviceType: 'Ride', carType: '', packageDetails: '' });
  const [rideInfo, setRideInfo] = useState(null);
  const [carOptions, setCarOptions] = useState([]);
  const serviceOptions = ['Ride', 'Delivery'];

  useEffect(() => {
    const loadCarOptions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cars');
        if (!response.ok) throw new Error('Failed to fetch car options');
        const cars = await response.json();
        const options = cars.map((car) => car.name);
        setCarOptions(options);
        setFormData((prev) => ({ ...prev, carType: options[0] || 'Sedan' }));
      } catch (error) {
        console.error('Failed to load car options:', error);
        const fallback = ['Sedan', 'SUV'];
        setCarOptions(fallback);
        setFormData((prev) => ({ ...prev, carType: prev.carType || 'Sedan' }));
      }
    };

    loadCarOptions();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/book-ride', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passengerName: formData.name,
        pickup: formData.pickup,
        destination: formData.destination,
        serviceType: formData.serviceType,
        carType: formData.carType,
        packageDetails: formData.packageDetails
      }),
    });
    const data = await response.json();
    setRideInfo(data);
  };

  return (
    <div className="App">
      <header className="navbar">
        <h1>Kheni's  Transportation Services</h1>
        <p>Your local ride, our community pride!</p>
      </header>

      <main className="container">
        {!rideInfo ? (
          <form className="booking-form" onSubmit={handleBook}>
            <h2>Where to, friend?</h2>
            <input 
              type="text" placeholder="Your Name" 
              onChange={(e) => setFormData({...formData, name: e.target.value})} required 
            />
            <input 
              type="text" placeholder="Pickup Location (e.g., Main St Shop)" 
              onChange={(e) => setFormData({...formData, pickup: e.target.value})} required 
            />
            <input 
              type="text" placeholder="Where are we going?" 
              onChange={(e) => setFormData({...formData, destination: e.target.value})} required 
            />
            <label>
              Service type:
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                required
              >
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </label>
            {formData.serviceType === 'Delivery' && (
              <input
                type="text"
                placeholder="Package details (what are you sending?)"
                value={formData.packageDetails}
                onChange={(e) => setFormData({...formData, packageDetails: e.target.value})}
                required
              />
            )}
            <label>
              {formData.serviceType === 'Delivery' ? 'Choose a delivery vehicle:' : 'Choose a car type:'}
              <select
                value={formData.carType}
                onChange={(e) => setFormData({...formData, carType: e.target.value})}
                required
              >
                {carOptions.length === 0 ? (
                  <option value="" disabled>Loading car options...</option>
                ) : (
                  carOptions.map((car) => (
                    <option key={car} value={car}>{car}</option>
                  ))
                )}
              </select>
            </label>
            <button type="submit">Request {formData.serviceType === 'Delivery' ? 'Delivery' : 'Ride'}</button>
          </form>
        ) : (
          <div className="ride-confirmed">
            <h2>{rideInfo.serviceType === 'Delivery' ? 'Delivery Confirmed! 🎉' : 'Ride Confirmed! 🎉'}</h2>
            <p><strong>Passenger:</strong> {rideInfo.passengerName}</p>
            <p><strong>From:</strong> {rideInfo.pickup}</p>
            <p><strong>To:</strong> {rideInfo.destination}</p>
            <p><strong>Service:</strong> {rideInfo.serviceType}</p>
            {rideInfo.serviceType === 'Delivery' && (
              <p><strong>Package:</strong> {rideInfo.packageDetails || 'No details provided'}</p>
            )}
            <p><strong>Vehicle:</strong> {rideInfo.carType}</p>
            <div className="status-box">
              <p>Status: {rideInfo.status}</p>
              <p>Driver: {rideInfo.driver}</p>
            </div>
            <button onClick={() => setRideInfo(null)}>Book Another Ride</button>
          </div>
        )}
      </main>
    </div>
  );
}


