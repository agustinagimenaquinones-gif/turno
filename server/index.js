import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb, query, run, get } from './db.js';
import { sendConfirmationEmail, BUSINESS_INFO } from './mailer.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Standard default time slots
const DEFAULT_TIME_SLOTS = [
  '09:00', '10:15', '11:30', '14:00', '15:15', '16:30', '17:45', '19:00'
];

// Initialize DB schema and initial data
await initDb();

// ----------------------------------------------------
// PUBLIC & CLIENT ENDPOINTS
// ----------------------------------------------------

// Get business info
app.get('/api/business', (req, res) => {
  res.json(BUSINESS_INFO);
});

// Get active services
app.get('/api/services', async (req, res) => {
  try {
    const services = await query(`SELECT * FROM services WHERE is_active = 1 ORDER BY id ASC`);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los servicios' });
  }
});

// Get available slots for a specific date
app.get('/api/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Se requiere el parámetro date (YYYY-MM-DD)' });
  }

  try {
    // 1. Get already booked slots for this date
    const bookedAppointments = await query(
      `SELECT time_slot FROM appointments WHERE date = ? AND status != 'Cancelado'`,
      [date]
    );
    const bookedSlotsSet = new Set(bookedAppointments.map((a) => a.time_slot));

    // 2. Get custom slots configured for this date from DB
    const customSlots = await query(
      `SELECT time_slot, is_available FROM custom_slots WHERE date = ?`,
      [date]
    );

    let slotsList = [...DEFAULT_TIME_SLOTS];

    if (customSlots.length > 0) {
      const customSet = new Set(customSlots.map((cs) => cs.time_slot));
      DEFAULT_TIME_SLOTS.forEach((slot) => {
        if (!customSet.has(slot)) customSlots.push({ time_slot: slot, is_available: 1 });
      });
      slotsList = customSlots.map((cs) => cs.time_slot).sort();
    }

    const resultSlots = slotsList.map((slot) => {
      const isBooked = bookedSlotsSet.has(slot);
      const customObj = customSlots.find((cs) => cs.time_slot === slot);
      const isDisabledByAdmin = customObj ? customObj.is_available === 0 : false;
      return {
        time: slot,
        available: !isBooked && !isDisabledByAdmin,
        isBooked: isBooked,
        isDisabledByAdmin: isDisabledByAdmin
      };
    });

    res.json(resultSlots);
  } catch (err) {
    console.error('Error al obtener horarios:', err);
    res.status(500).json({ error: 'Error al obtener horarios disponibles' });
  }
});

// Book a new appointment (WITH ANTI-DOUBLE BOOKING PREVENTOR & REAL EMAIL TRANSMISSION)
app.post('/api/appointments', async (req, res) => {
  const {
    client_firstname,
    client_lastname,
    client_email,
    client_phone,
    service_id,
    date,
    time_slot
  } = req.body;

  if (!client_firstname || !client_lastname || !client_email || !client_phone || !service_id || !date || !time_slot) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // 1. Anti-double booking check: verify if date & time_slot is already reserved
    const existing = await get(
      `SELECT id FROM appointments WHERE date = ? AND time_slot = ? AND status != 'Cancelado'`,
      [date, time_slot]
    );

    if (existing) {
      return res.status(409).json({
        error: 'El horario seleccionado ya no está disponible. Alguien más acaba de reservarlo. Por favor selecciona otro horario.'
      });
    }

    // 2. Fetch service details
    const service = await get(`SELECT * FROM services WHERE id = ?`, [service_id]);
    if (!service) {
      return res.status(404).json({ error: 'El servicio seleccionado no existe.' });
    }

    // 3. Insert new appointment into DB
    const result = await run(
      `INSERT INTO appointments (client_firstname, client_lastname, client_email, client_phone, service_id, service_name, date, time_slot, price, duration, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmado')`,
      [
        client_firstname.trim(),
        client_lastname.trim(),
        client_email.trim(),
        client_phone.trim(),
        service.id,
        service.name,
        date,
        time_slot,
        service.price,
        service.duration
      ]
    );

    const newAppointment = {
      id: result.id,
      client_firstname: client_firstname.trim(),
      client_lastname: client_lastname.trim(),
      client_email: client_email.trim(),
      client_phone: client_phone.trim(),
      service_id: service.id,
      service_name: service.name,
      date,
      time_slot,
      price: service.price,
      duration: service.duration,
      status: 'Confirmado'
    };

    // 4. Real Email Sending
    const emailResult = await sendConfirmationEmail(newAppointment);

    if (emailResult.success) {
      res.status(201).json({
        message: 'Turno confirmado. Revisá tu correo.',
        emailSent: true,
        appointment: newAppointment,
        emailResult: emailResult
      });
    } else {
      res.status(201).json({
        message: '¡Tu turno fue reservado correctamente! Sin embargo, no pudimos enviar el correo de confirmación.',
        emailSent: false,
        emailError: emailResult.error,
        appointment: newAppointment,
        emailResult: emailResult
      });
    }
  } catch (err) {
    console.error('Error al reservar turno:', err);
    res.status(500).json({ error: 'Ocurrió un error al procesar la reserva' });
  }
});

// ----------------------------------------------------
// ADMIN ENDPOINTS (ETAPA 3 & SMTP TESTING)
// ----------------------------------------------------

// Endpoint to test SMTP configuration with any email
app.post('/api/admin/test-email', async (req, res) => {
  const { toEmail } = req.body;
  if (!toEmail) {
    return res.status(400).json({ error: 'El email de destino es requerido' });
  }

  const testApp = {
    id: 999,
    client_firstname: 'Cliente de Prueba',
    client_lastname: 'Prueba Real',
    client_email: toEmail,
    client_phone: '+54 9 11 0000-0000',
    service_name: 'Prueba de Envío Real SMTP',
    date: new Date().toISOString().split('T')[0],
    time_slot: '15:00',
    price: 15000,
    duration: '30 min',
    status: 'Confirmado'
  };

  const result = await sendConfirmationEmail(testApp);

  if (result.success) {
    res.json({ message: `Correo de prueba enviado con éxito a ${toEmail}`, result });
  } else {
    res.status(500).json({ error: `Fallo en el envío SMTP: ${result.error}`, result });
  }
});

// Get all appointments
app.get('/api/admin/appointments', async (req, res) => {
  try {
    const appointments = await query(
      `SELECT * FROM appointments ORDER BY date DESC, time_slot ASC`
    );
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener lista de turnos' });
  }
});

// Cancel an appointment
app.put('/api/admin/appointments/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    await run(`UPDATE appointments SET status = 'Cancelado' WHERE id = ?`, [id]);
    res.json({ message: 'Turno cancelado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cancelar el turno' });
  }
});

// Add new service
app.post('/api/admin/services', async (req, res) => {
  const { name, description, price, duration, category, image } = req.body;
  if (!name || !description || !price || !duration) {
    return res.status(400).json({ error: 'Nombre, descripción, precio y duración son requeridos' });
  }

  try {
    const result = await run(
      `INSERT INTO services (name, description, price, duration, category, image) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, Number(price), duration, category || 'General', image || '']
    );
    const newService = await get(`SELECT * FROM services WHERE id = ?`, [result.id]);
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar el servicio' });
  }
});

// Edit service
app.put('/api/admin/services/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, duration, category, image } = req.body;

  try {
    await run(
      `UPDATE services SET name = ?, description = ?, price = ?, duration = ?, category = ?, image = ? WHERE id = ?`,
      [name, description, Number(price), duration, category, image, id]
    );
    const updated = await get(`SELECT * FROM services WHERE id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al editar el servicio' });
  }
});

// Delete service
app.delete('/api/admin/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run(`UPDATE services SET is_active = 0 WHERE id = ?`, [id]);
    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar servicio' });
  }
});

// Add or toggle custom slot availability
app.post('/api/admin/slots', async (req, res) => {
  const { date, time_slot, is_available } = req.body;
  if (!date || !time_slot) {
    return res.status(400).json({ error: 'Fecha y horario son requeridos' });
  }

  try {
    await run(
      `INSERT INTO custom_slots (date, time_slot, is_available)
       VALUES (?, ?, ?)
       ON CONFLICT(date, time_slot) DO UPDATE SET is_available = excluded.is_available`,
      [date, time_slot, is_available !== undefined ? (is_available ? 1 : 0) : 1]
    );
    res.json({ message: 'Horario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el horario' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de Reserva de Turnos escuchando en http://localhost:${PORT}`);
});
