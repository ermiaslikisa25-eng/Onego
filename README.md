# OneGo development

Install dependencies from the repository root:

```bash
npm install
```

Run one app at a time from the unified runner:

```bash
npm run dev -- customer
npm run dev -- driver
npm run dev -- supervisor
npm run dev -- admin
```

The apps use ports 5173–5176 respectively. Copy the Firebase web configuration into a `.env` file in each app using the `VITE_FIREBASE_*` names documented in `FIREBASE_SETUP.md`. Never commit Firebase service-account credentials.

Build every workspace with:

```bash
npm run build
```
