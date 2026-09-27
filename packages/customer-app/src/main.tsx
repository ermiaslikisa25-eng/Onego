import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@onego/shared';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createOrder, watchCustomerOrders } from '@onego/shared';
import type { Order } from '@onego/shared';
import PhoneLogin from './PhoneLogin';
import './style.css';

const langs: Record<string, Record<string, string>> = {
  en: {
    title: 'OneGo',
    new: 'New delivery',
    pickup: 'Pickup address',
    dest: 'Destination',
    create: 'Create order',
    orders: 'My orders',
    service: 'Service',
    fee: 'Fee (ETB)',
    note: 'Note',
    logout: 'Logout',
  },
  am: {
    title: 'OneGo',
    new: 'አዲስ ዴሊቨሪ',
    pickup: 'የማንሳት አድራሻ',
    dest: 'የመድረሻ አድራሻ',
    create: 'ትዕዛዝ ፍጠር',
    orders: 'ትዕዛዞቼ',
    service: 'አገልግሎት',
    fee: 'ክፍያ (ብር)',
    note: 'ማስታወሻ',
    logout: 'ውጣ',
  },
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lang, setLang] = useState('en');
  const [service, setService] = useState<string>('parcel');
  const [pickup, setPickup] = useState('');
  const [dest, setDest] = useState('');
  const [fee, setFee] = useState('100');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const r = doc(db, 'users', u.uid);
        const s = await getDoc(r);
        if (!s.exists()) {
          await setDoc(r, {
            phone: u.phoneNumber,
            role: 'customer',
            createdAt: serverTimestamp(),
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    return watchCustomerOrders(user.uid, setOrders);
  }, [user]);

  if (!user) return <PhoneLogin onDone={() => {}} />;

  const t = langs[lang] || langs['en'];

  async function submit() {
    if (!pickup || !dest) {
      alert('Please enter pickup and destination addresses');
      return;
    }
    setLoading(true);
    try {
      await createOrder({
        customerId: user.uid,
        customerName: user.displayName || user.phoneNumber || '',
        customerPhone: user.phoneNumber || '',
        service: service as any,
        pickupAddress: pickup,
        destinationAddress: dest,
        note,
        fee: Number(fee) || 0,
        paymentMethod: 'cash',
        status: 'pending',
      });
      setPickup('');
      setDest('');
      setNote('');
      setFee('100');
      alert('Order created successfully!');
    } catch (error: any) {
      alert('Error creating order: ' + error.message);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <main>
      <header>
        <h1>{t.title}</h1>
        <div>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
          </select>
          <button onClick={handleLogout} style={{ marginLeft: '8px' }}>
            {t.logout}
          </button>
        </div>
      </header>

      <section className="card">
        <h2>{t.new}</h2>
        <div className="form-group">
          <label>{t.service}</label>
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="food">Food</option>
            <option value="groceries">Groceries</option>
            <option value="parcel">Parcel</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
        </div>
        <input
          placeholder={t.pickup}
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />
        <input
          placeholder={t.dest}
          value={dest}
          onChange={(e) => setDest(e.target.value)}
        />
        <input
          placeholder={t.fee}
          type="number"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />
        <textarea
          placeholder={t.note}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button onClick={submit} disabled={loading}>
          {loading ? 'Creating...' : t.create}
        </button>
        <p>💰 Payment: Cash on Delivery</p>
      </section>

      <section>
        <h2>{t.orders}</h2>
        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          orders.map((o) => (
            <div className="card" key={o.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <b>{o.service}</b>
                  <p style={{ margin: '4px 0' }}>
                    {o.pickupAddress} → {o.destinationAddress}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    Fee: {o.fee} ETB
                  </p>
                </div>
                <strong className={`status-${o.status}`}>{o.status.replace(/_/g, ' ')}</strong>
              </div>
              {o.driverName && (
                <p style={{ marginTop: '12px', fontSize: '14px' }}>
                  🚗 Driver: {o.driverName}
                </p>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  );
}

export default App;
