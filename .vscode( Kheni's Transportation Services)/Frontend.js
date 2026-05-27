import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({ name: '', pickup: '', destination: '', serviceType: 'Ride', carType: '', packageDetails: '' });
  const [rideInfo, setRideInfo] = useState(null);
  const [carOptions, setCarOptions] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', vehicle: '', plate: '', licenseNumber: '', rating: 5 });
  const [showDrivers, setShowDrivers] = useState(false);
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

    const loadDrivers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/drivers');
        if (res.ok) {
          const list = await res.json();
          setDrivers(list);
        }
      } catch (err) {
        console.warn('Could not load drivers', err);
      }
    };

    loadCarOptions();
    loadDrivers();
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

  const fetchDrivers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/drivers');
      if (res.ok) {
        const list = await res.json();
        setDrivers(list);
      }
    } catch (err) {
      console.error('Failed to fetch drivers', err);
    }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: driverForm.name,
          phone: driverForm.phone,
          vehicle: driverForm.vehicle,
          plate: driverForm.plate,
          license: driverForm.licenseNumber,
          rating: driverForm.rating,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setDrivers(prev => [...prev, created]);
        setDriverForm({ name: '', phone: '', vehicle: '', plate: '', licenseNumber: '', rating: 5 });
      }
    } catch (err) {
      console.error('Failed to create driver', err);
    }
  };

  return (
    <div className="App">
      <header className="navbar">
        <h1>Kheni's  Transportation Services</h1>
        <p>Your local ride, our community pride!</p>
      </header>

      <main className="container">
        <div style={{ width: '100%', maxWidth: 900, display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div className="driver-controls">
              <button className={`toggle-btn ${!showDrivers ? 'active' : ''}`} onClick={() => setShowDrivers(false)}>Book Ride</button>
              <button className={`toggle-btn ${showDrivers ? 'active' : ''}`} onClick={() => { setShowDrivers(true); fetchDrivers(); }}>Driver Profiles</button>
            </div>

            {showDrivers ? (
              <div className="booking-form">
                <h2>Create Driver Profile</h2>
                <form onSubmit={handleCreateDriver}>
                  <input type="text" placeholder="Driver Name" value={driverForm.name} onChange={(e) => setDriverForm({...driverForm, name: e.target.value})} required />
                  <input type="text" placeholder="Phone" value={driverForm.phone} onChange={(e) => setDriverForm({...driverForm, phone: e.target.value})} />
                  <input type="text" placeholder="Vehicle (e.g., Sedan)" value={driverForm.vehicle} onChange={(e) => setDriverForm({...driverForm, vehicle: e.target.value})} />
                  <input type="text" placeholder="Plate number" value={driverForm.plate} onChange={(e) => setDriverForm({...driverForm, plate: e.target.value})} />
                  <input type="text" placeholder="License number" value={driverForm.licenseNumber} onChange={(e) => setDriverForm({...driverForm, licenseNumber: e.target.value})} />
                  <input type="number" min="1" max="5" placeholder="Rating" value={driverForm.rating} onChange={(e) => setDriverForm({...driverForm, rating: e.target.value})} />
                  <button type="submit">Create Driver</button>
                </form>

                <h3 style={{ marginTop: 18 }}>Available Drivers</h3>
                <div className="drivers-list">
                  {drivers.length === 0 ? (
                    <p className="small">No drivers yet.</p>
                  ) : (
                    drivers.map(d => (
                      <div key={d.id} className="driver-card">
                        <div className="driver-info">
                          <strong>{d.name}</strong>
                          <span className="small">{d.vehicle} • {d.plate || 'No plate'}</span>
                          <span className="small">{d.phone}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="small">Rating: {d.rating}</div>
                          <div className="small">{d.available ? 'Available' : 'Busy'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              !rideInfo ? (
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
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


