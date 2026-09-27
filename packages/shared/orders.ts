import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderStatus } from './types';

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  return addDoc(collection(db, 'orders'), {
    ...order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function watchCustomerOrders(uid: string, cb: (orders: Order[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'orders'), where('customerId', '==', uid), orderBy('createdAt', 'desc')),
    (s) =>
      cb(
        s.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Order),
        }))
      )
  );
}

export function watchAllOrders(cb: (orders: Order[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
    (s) =>
      cb(
        s.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Order),
        }))
      )
  );
}

export function watchDriverOrders(uid: string, cb: (orders: Order[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'orders'), where('driverId', '==', uid), orderBy('createdAt', 'desc')),
    (s) =>
      cb(
        s.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Order),
        }))
      )
  );
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
}

export async function assignDriver(id: string, driverId: string, driverName: string, driverPhone?: string) {
  await updateDoc(doc(db, 'orders', id), {
    driverId,
    driverName,
    driverPhone: driverPhone || '',
    status: 'assigned',
    updatedAt: serverTimestamp(),
  });
}
