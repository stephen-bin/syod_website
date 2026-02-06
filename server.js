const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_PLACEHOLDER';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Data Storage
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

// Helper: Read/Write Orders
function getOrders() {
    try {
        const data = fs.readFileSync(ORDERS_FILE);
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveOrder(order) {
    const orders = getOrders();
    orders.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// --- Endpoints ---

// 1. Initiate Payment
app.post('/api/initiate-payment', async (req, res) => {
    try {
        const { email, amount, metadata } = req.body; // Amount in Cedis

        if (!email || !amount) {
            return res.status(400).json({ error: 'Email and amount required' });
        }

        // Paystack expects amount in pesewas (x100)
        const params = {
            email,
            amount: amount * 100,
            callback_url: `http://localhost:${PORT}/payment-success.html`, // Or handle via frontend
            metadata
        };

        const response = await axios.post('https://api.paystack.co/transaction/initialize', params, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data.data); // Returns authorization_url, access_code, reference
    } catch (error) {
        console.error('Paystack Init Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Payment initialization failed' });
    }
});

// 2. Verify Payment & Save Order (Frontend calls this after success, or we rely on Paystack Webhook)
// For simplicity, we'll verify transaction status here
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { reference, orderDetails } = req.body;

        if (!reference) {
            return res.status(400).json({ error: 'Reference required' });
        }

        // Verify with Paystack
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
        });

        const data = response.data.data;

        if (data.status === 'success') {
            // Save Order
            const newOrder = {
                id: reference,
                date: new Date().toISOString(),
                customer: {
                    email: data.customer.email,
                    ...orderDetails // name, phone, address, notes passed from frontend
                },
                amount: data.amount / 100,
                items: orderDetails.items || [], // Cart items
                paystack_ref: reference
            };

            saveOrder(newOrder);
            res.json({ success: true, order: newOrder });
        } else {
            res.status(400).json({ success: false, message: 'Payment not successful' });
        }
    } catch (error) {
        console.error('Paystack Verify Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// 3. Export Orders
app.get('/api/admin/export-orders', async (req, res) => {
    try {
        const orders = getOrders();
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Orders');

        sheet.columns = [
            { header: 'Order ID', key: 'id', width: 15 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Address', key: 'address', width: 30 },
            { header: 'Total (GHS)', key: 'amount', width: 15 },
            { header: 'Items', key: 'items', width: 40 },
            { header: 'Notes', key: 'notes', width: 20 }
        ];

        orders.forEach(order => {
            const itemsStr = order.items ? order.items.map(i => `${i.quantity}x ${i.title}`).join(', ') : '';
            sheet.addRow({
                id: order.id,
                date: new Date(order.date).toLocaleString(),
                name: order.customer.name,
                email: order.customer.email,
                phone: order.customer.phone,
                address: order.customer.address,
                amount: order.amount,
                items: itemsStr,
                notes: order.customer.notes
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).send('Export failed');
    }
});

// 4. Register Event
app.post('/api/register-event', async (req, res) => {
    try {
        const { eventId, name, email, phone } = req.body;

        if (!eventId || !name || !email) {
            return res.status(400).json({ error: 'Event ID, Name, and Email required' });
        }

        // Get Event Details
        const eventsData = fs.readFileSync(path.join(DATA_DIR, 'events.json'));
        const events = JSON.parse(eventsData);
        const event = events.find(e => e.id == eventId);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Save Registration
        const regFile = path.join(DATA_DIR, 'registrations.json');
        let registrations = [];
        try {
            registrations = JSON.parse(fs.readFileSync(regFile));
        } catch (e) { }

        registrations.push({
            eventId,
            eventName: event.title,
            name,
            email,
            phone,
            date: new Date().toISOString()
        });
        fs.writeFileSync(regFile, JSON.stringify(registrations, null, 2));

        // Attempt Email (if nodemailer is available)
        let emailSent = false;
        try {
            // Check if nodemailer exists
            const nodemailer = require('nodemailer');
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: `Registration Confirmed: ${event.title}`,
                    text: `Hello ${name},\n\nYou have successfully registered for "${event.title}".\n\nDate: ${event.date}\nMeeting Link: ${event.link}\n\nSee you there!`,
                    html: `<h3>Registration Confirmed</h3><p>Hello ${name},</p><p>You have successfully registered for <strong>${event.title}</strong>.</p><p><strong>Date:</strong> ${event.date}</p><p><a href="${event.link}">Click here to join the meeting</a></p>`
                };

                await transporter.sendMail(mailOptions);
                emailSent = true;
            }
        } catch (e) {
            console.log("Email skipped or failed:", e.message);
        }

        // Return success + link (so frontend can show it immediately)
        res.json({
            success: true,
            message: 'Registration successful',
            link: event.link,
            emailSent
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// 5. Get Events
app.get('/api/events', (req, res) => {
    try {
        const eventsData = fs.readFileSync(path.join(DATA_DIR, 'events.json'));
        res.json(JSON.parse(eventsData));
    } catch (e) {
        res.json([]);
    }
});

// 6. Export Registrations
app.get('/api/admin/export-registrations', async (req, res) => {
    try {
        const regFile = path.join(DATA_DIR, 'registrations.json');
        let registrations = [];
        try {
            registrations = JSON.parse(fs.readFileSync(regFile));
        } catch (e) { }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Registrations');

        sheet.columns = [
            { header: 'Event', key: 'eventName', width: 25 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Date', key: 'date', width: 20 }
        ];

        registrations.forEach(r => {
            sheet.addRow({
                eventName: r.eventName,
                name: r.name,
                email: r.email,
                phone: r.phone,
                date: new Date(r.date).toLocaleString()
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=registrations.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).send('Export failed');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
