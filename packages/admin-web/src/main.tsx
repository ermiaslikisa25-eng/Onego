import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db, watchAllOrders } from '@onego/shared';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type { Order } from '@onego/shared';
import PhoneLogin from './PhoneLogin';
import './style.css';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => onAuthStateChanged(auth, async u => { setUser(u); if (!u) return; const snap = await getDoc(doc(db,'users',u.uid)); setRole(snap.data()?.role || 'customer'); const all = await getDocs(collection(db,'users')); setUsers(all.docs.map(d=>({id:d.id,...d.data()}))); }), []);
  useEffect(() => { if (user && role === 'admin') return watchAllOrders(setOrders); }, [user, role]);
  if (!user) return <PhoneLogin onDone={() => {}}/>;
  if (role !== 'admin') return <main><div className="card access-denied"><h2>Admin access required</h2><p>Only an administrator can view this console.</p><button onClick={()=>signOut(auth)}>Logout</button></div></main>;
  const drivers = users.filter(u=>u.role==='driver'); const customers = users.filter(u=>u.role==='customer'); const delivered = orders.filter(o=>o.status==='delivered');
  return <main><header><h1>OneGo Admin</h1><button onClick={()=>signOut(auth)}>Logout</button></header><div className="grid"><div className="card"><h3>Orders</h3><b>{orders.length}</b></div><div className="card"><h3>Customers</h3><b>{customers.length}</b></div><div className="card"><h3>Drivers</h3><b>{drivers.length}</b></div><div className="card"><h3>Cash delivered</h3><b>{delivered.reduce((sum,o)=>sum+(o.fee||0),0)} ETB</b></div></div><h2>Recent orders</h2>{orders.slice(0,30).map(o=><div className="card" key={o.id}><strong>{o.status.replace(/_/g,' ')}</strong><p>{o.service} — {o.fee} ETB</p><p>{o.pickupAddress} → {o.destinationAddress}</p><p>Customer: {o.customerName || o.customerPhone || 'Unknown'} {o.driverName && <>· Driver: {o.driverName}</>}</p></div>)}</main>;
}
