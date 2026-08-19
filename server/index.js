import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { sendConfirmationEmail, BUSINESS_INFO } from './mailer.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get business info
app.get('/api/business', (req, res) => {
  res.json(BUSINESS_INFO);
});

// Secure API endpoint to send confirmation email (called from frontend LocalStorage system)
app.post('/api/send-email', async (req, res) => {
  const appointment = req.body;

  if (!appointment || !appointment.client_email || !appointment.service_name || !appointment.date || !appointment.time_slot) {
    return res.status(400).json({ error: 'Faltan datos requeridos de la reserva para enviar el correo.' });
  }

  try {
    const emailResult = await sendConfirmationEmail(appointment);

    if (emailResult.success) {
      res.json({
        message: 'Turno confirmado. Revisá tu correo.',
        emailSent: true,
        emailResult
      });
    } else {
      res.json({
        message: '¡Tu turno fue reservado! Sin embargo, no pudimos enviar el correo de confirmación.',
        emailSent: false,
        emailError: emailResult.error,
        emailResult
      });
    }
  } catch (err) {
    console.error('Error al despachar correo:', err);
    res.status(500).json({ error: 'Ocurrió un error al procesar el envío del correo' });
  }
});

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

app.listen(PORT, () => {
  console.log(`Servidor de Correo SMTP escuchando en http://localhost:${PORT}`);
});
