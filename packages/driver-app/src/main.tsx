import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@onego/shared';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { watchDriverOrders, setOrderStatus } from '@onego/shared';
import type { Order } from '@onego/shared';
import PhoneLogin from './PhoneLogin';
import './style.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data()?.role || 'customer');
        } else {
          await setDoc(doc(db, 'users', u.uid), {
            phone: u.phoneNumber,
            role: 'customer',
            createdAt: serverTimestamp(),
          });
          setRole('customer');
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!user || role !== 'driver') return;
    return watchDriverOrders(user.uid, setOrders);
  }, [user, role]);

  if (!user) return <PhoneLogin onDone={() => {}} />;

  if (role !== 'driver')
    return (
      <main>
        <div className="card access-denied">
          <h2>🔒 Driver Access Required</h2>
          <p>Your account must be assigned the driver role by an administrator.</p>
          <p>Contact your supervisor to enable driver access.</p>
          <button onClick={() => signOut(auth)}>Logout</button>
        </div>
      </main>
    );

  async function updateStatus(orderId: string, status: string) {
    setLoading(true);
    try {
      await setOrderStatus(orderId, status as any);
    } catch (error: any) {
      alert('Error updating status: ' + error.message);
    }
    setLoading(false);
  }

  function openMaps(destination: string) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  }

  return (
    <main>
      <header>
        <h1>🚗 OneGo Driver</h1>
        <button onClick={() => signOut(auth)}>Logout</button>
      </header>

      <section>
        <h2>📦 Your Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <div className="card">
            <p>No orders assigned yet. Check back soon!</p>
          </div>
        ) : (
          orders.map((o) => (
            <div className="card" key={o.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{o.service}</h3>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    📍 {o.pickupAddress}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    🎯 {o.destinationAddress}
                  </p>
                  <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                    💰 {o.fee} ETB • {o.customerName || o.customerPhone}
                  </p>
                  {o.note && (
                    <p style={{ margin: '8px 0', fontSize: '14px', fontStyle: 'italic', color: '#888' }}>
                      💬 {o.note}
                    </p>
                  )}
                </div>
                <strong className={`status-${o.status}`} style={{ marginLeft: '12px' }}>
                  {o.status.replace(/_/g, ' ')}
                </strong>
              </div>

              <div className="row">
                {o.status === 'assigned' && (
                  <button onClick={() => updateStatus(o.id!, 'accepted')} disabled={loading}>
                    ✓ Accept
                  </button>
                )}
                {(o.status === 'accepted' || o.status === 'picked_up') && (
                  <>
                    <button onClick={() => updateStatus(o.id!, 'picked_up')} disabled={loading}>
                      📦 Picked Up
                    </button>
                    <button onClick={() => updateStatus(o.id!, 'in_transit')} disabled={loading}>
                      🚗 In Transit
                    </button>
                  </>
                )}
                {o.status === 'in_transit' && (
                  <button onClick={() => updateStatus(o.id!, 'delivered')} disabled={loading}>
                    ✓ Delivered
                  </button>
                )}
                <button onClick={() => openMaps(o.destinationAddress)} style={{ background: '#2196f3' }}>
                  🗺️ Navigate
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

export default App;
