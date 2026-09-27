export type Role = 'customer' | 'driver' | 'supervisor' | 'admin';
export type OrderStatus = 'pending' | 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
export type OrderService = 'food' | 'groceries' | 'parcel' | 'shopping' | 'other';
export type PaymentMethod = 'cash';

export interface User {
  uid: string;
  phone: string;
  role: Role;
  name?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Order {
  id?: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  service: OrderService;
  pickupAddress: string;
  destinationAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  note?: string;
  fee: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CashCollection {
  id?: string;
  orderId: string;
  driverId: string;
  amount: number;
  status: 'pending' | 'collected';
  createdAt?: any;
}

export interface AuditLog {
  id?: string;
  userId: string;
  userRole: Role;
  action: string;
  orderId?: string;
  details?: Record<string, any>;
  timestamp?: any;
}
