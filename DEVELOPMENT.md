# OneGo v1 development setup

OneGo is a four-app Vite workspace:

- `packages/customer-app` — customer order creation and live tracking
- `packages/driver-app` — assigned delivery workflow and status updates
- `packages/supervisor-web` — driver assignment and operations monitoring
- `packages/admin-web` — administrative dashboard
- `packages/shared` — Firebase client, order utilities, and shared types
- `functions` — trusted server-side role bootstrap utility

## Requirements

- Node.js 18 or newer
- A Firebase project with Phone Authentication and Firestore enabled
- Firebase CLI only if you want to deploy rules

## Install

```bash
npm install
```

The repository uses placeholders only. For each app, copy `.env.example` to `.env.local` and fill in the Firebase **web app** configuration from Firebase Console. Vite exposes only variables prefixed with `VITE_`. Never put a service-account JSON, private key, or `GOOGLE_APPLICATION_CREDENTIALS` value in any browser environment file.

## Run one app

```bash
npm run dev -- customer
npm run dev -- driver
npm run dev -- supervisor
npm run dev -- admin
```

The runner uses ports 5173, 5174, 5175, and 5176 respectively. Use separate browser profiles or sign-in accounts when testing different roles.

## Verify and build

```bash
npm run typecheck
npm run build
```

Both commands type-check and build all four browser apps. The `functions` package is intentionally excluded from the browser build because it is server-only.

## Firebase roles and workflow

New users are created as customers. Assign staff roles only from a trusted machine:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node functions/setRole.js +2519XXXXXXXX driver
```

Supported roles are `customer`, `driver`, `supervisor`, and `admin`. After changing a claim, the user must sign out and sign in again. Deploy Firestore rules with `firebase deploy --only firestore:rules`.

Order flow: customer creates a cash-on-delivery order, supervisor assigns a driver, driver accepts it, marks pickup, marks in transit, and marks delivered. Firestore listeners update the customer view in real time.
