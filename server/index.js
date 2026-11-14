import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkUpsertCustomers
} from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map((s) => s.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Two Wheeler Finance Customer Manager API',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/customers', async (_req, res) => {
  try {
    const customers = await readCustomers();
    res.json({ customers, count: customers.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load customers', details: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { customerName, vehicleNumber, mobileNumber } = req.body || {};
    if (!customerName || !vehicleNumber || !mobileNumber) {
      return res.status(400).json({
        error: 'Customer Name, Vehicle Number, and Mobile Number are required.'
      });
    }
    const created = await createCustomer(req.body);
    res.status(201).json({ customer: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create customer', details: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const updated = await updateCustomer(req.params.id, req.body || {});
    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ customer: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer', details: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const removed = await deleteCustomer(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer', details: err.message });
  }
});

app.post('/api/customers/bulk', async (req, res) => {
  try {
    const { customers, mode = 'merge' } = req.body || {};
    if (!Array.isArray(customers)) {
      return res.status(400).json({ error: 'Expected customers array' });
    }
    const result = await bulkUpsertCustomers(customers, mode);
    res.json({ customers: result, count: result.length });
  } catch (err) {
    res.status(500).json({ error: 'Bulk sync failed', details: err.message });
  }
});

// Serve built React frontend when running fullstack on Render
const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      message: 'Two Wheeler Finance Customer Manager API is running.',
      health: '/api/health',
      endpoints: ['/api/customers', '/api/customers/bulk']
    });
  });
}

app.listen(PORT, () => {
  console.log(`Two Wheeler Finance API listening on port ${PORT}`);
});
