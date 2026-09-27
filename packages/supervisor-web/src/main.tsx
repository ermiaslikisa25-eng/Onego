import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@onego/shared';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { watchAllOrders, assignDriver, setOrderStatus } from '@onego/shared';
import type { Order } from '@onego/shared';
import PhoneLogin from './PhoneLogin';
import './style.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data()?.role || 'customer');
        } else {
          setRole('customer');
        }

        // Fetch all drivers
        try {
          const driverSnapshot = await getDocs(collection(db, 'users'));
          const driverList = driverSnapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((x: any) => x.role === 'driver');
          setDrivers(driverList);
        } catch (error) {
          console.error('Error fetching drivers:', error);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!user || !['supervisor', 'admin'].includes(role)) return;
    return watchAllOrders(setOrders);
  }, [user, role]);

  if (!user) return <PhoneLogin onDone={() => {}} />;

  if (!['supervisor', 'admin'].includes(role))
    return (
      <main>
        <div className="card access-denied">
          <h2>👮 Supervisor Access Required</h2>
          <p>Your account must be assigned the supervisor or admin role by an administrator.</p>
          <button onClick={() => signOut(auth)}>Logout</button>
        </div>
      </main>
    );

  async function assignDriverToOrder(orderId: string, driverId: string) {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;
    setLoading(true);
    try {
      await assignDriver(orderId, driverId, driver.name || driver.phone || driverId, driver.phone);
    } catch (error: any) {
      alert('Error assigning driver: ' + error.message);
    }
    setLoading(false);
  }

  async function cancelOrder(orderId: string) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setLoading(true);
    try {
      await setOrderStatus(orderId, 'cancelled');
    } catch (error: any) {
      alert('Error cancelling order: ' + error.message);
    }
    setLoading(false);
  }

  const pendingOrders = orders.filter((o) => !o.driverId);
  const assignedOrders = orders.filter((o) => o.driverId && o.status !== 'delivered');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  return (
    <main>
      <header>
        <h1>👮 OneGo Supervisor</h1>
        <button onClick={() => signOut(auth)}>Logout</button>
      </header>

      <section className="card">
        <h2>📊 Overview</h2>
        <div className="grid">
          <div className="card">
            <h3>Total Orders</h3>
            <b style={{ fontSize: '24px' }}>{orders.length}</b>
          </div>
          <div className="card">
            <h3>Awaiting Assignment</h3>
            <b style={{ fontSize: '24px', color: '#ff9800' }}>{pendingOrders.length}</b>
          </div>
          <div className="card">
            <h3>Drivers Available</h3>
            <b style={{ fontSize: '24px', color: '#4caf50' }}>{drivers.length}</b>
          </div>
          <div className="card">
            <h3>Completed</h3>
            <b style={{ fontSize: '24px', color: '#2196f3' }}>{completedOrders.length}</b>
          </div>
        </div>
      </section>

      {pendingOrders.length > 0 && (
        <section>
          <h2>⏳ Pending Assignment ({pendingOrders.length})</h2>
          {pendingOrders.map((o) => (
            <div className="card" key={o.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{o.service}</h3>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    📍 {o.pickupAddress} → {o.destinationAddress}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    👤 {o.customerName || o.customerPhone}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>💰 {o.fee} ETB</p>
                </div>
              </div>
              <div className="row">
                <select onChange={(e) => assignDriverToOrder(o.id!, e.target.value)} disabled={loading}>
                  <option value="">👇 Assign driver...</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name || d.phone || d.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </section>
      )}

      {assignedOrders.length > 0 && (
        <section>
          <h2>🚗 In Progress ({assignedOrders.length})</h2>
          {assignedOrders.map((o) => (
            <div className="card" key={o.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{o.service}</h3>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    📍 {o.pickupAddress} → {o.destinationAddress}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>👤 {o.customerName}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>🚗 {o.driverName}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>💰 {o.fee} ETB</p>
                </div>
                <strong className={`status-${o.status}`}>{o.status.replace(/_/g, ' ')}</strong>
              </div>
              <div className="row">
                <button className="danger" onClick={() => cancelOrder(o.id!)} disabled={loading}>
                  ✕ Cancel
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {completedOrders.length > 0 && (
        <section>
          <h2>✓ Completed ({completedOrders.length})</h2>
          {completedOrders.slice(0, 10).map((o) => (
            <div className="card" key={o.id} style={{ opacity: 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    {o.service} • {o.customerName}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>💰 {o.fee} ETB</p>
                </div>
                <strong className={`status-${o.status}`}>{o.status.replace(/_/g, ' ')}</strong>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

export default App;
