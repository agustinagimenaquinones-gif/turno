import 'dotenv/config';
import nodemailer from 'nodemailer';

// Business basic details
export const BUSINESS_INFO = {
  name: 'Maison Coquette — Studio & Beauty',
  tagline: 'Estética delicada, moderna y profesional',
  address: 'Av. Libertador 1420, Piso 3, Buenos Aires',
  phone: '+54 9 11 5544-3322',
  email: 'hola@maisoncoquette.com',
  instagram: '@maison.coquette.studio',
  hours: 'Lunes a Sábados: 09:00 - 20:00 hs'
};

/**
 * Creates and verifies Nodemailer transporter using process.env credentials
 */
const getTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('⚠️ ATENCIÓN: Faltan credenciales SMTP en .env (SMTP_HOST, SMTP_USER, SMTP_PASS). El correo real no podrá ser entregado hasta configurarlos.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
};

export const generateEmailHTML = (appointment) => {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(appointment.price);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Turno — ${BUSINESS_INFO.name}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #fdf2f4;
      margin: 0;
      padding: 20px;
      color: #4a3b40;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(230, 180, 195, 0.25);
      border: 1px solid #f7e1e6;
    }
    .header {
      background: linear-gradient(135deg, #fdf2f4 0%, #f7e1e6 100%);
      padding: 35px 25px;
      text-align: center;
      border-bottom: 2px solid #f3c4ce;
    }
    .logo-badge {
      display: inline-block;
      width: 50px;
      height: 50px;
      line-height: 50px;
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
      font-size: 24px;
      margin-bottom: 12px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #4a3b40;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 5px 0 0 0;
      font-size: 13px;
      color: #8c6b73;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .content {
      padding: 35px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #4a3b40;
      margin-bottom: 20px;
      font-weight: 500;
    }
    .badge-confirmed {
      display: inline-block;
      background-color: #eaf8f0;
      color: #2b7a4b;
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 25px;
      border: 1px solid #c2e9d2;
    }
    .details-box {
      background-color: #fbf9f5;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #f3eee6;
      margin-bottom: 25px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px dashed #e6dcd3;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-size: 13px;
      color: #7a6b70;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .detail-value {
      font-size: 15px;
      color: #4a3b40;
      font-weight: 600;
      text-align: right;
    }
    .price-value {
      color: #c5a059;
      font-size: 17px;
      font-weight: 700;
    }
    .business-card {
      background: linear-gradient(135deg, #fffafc 0%, #fdf2f4 100%);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid #f7e1e6;
      margin-top: 25px;
    }
    .business-card h3 {
      margin: 0 0 10px 0;
      font-size: 15px;
      color: #4a3b40;
    }
    .business-item {
      font-size: 13px;
      color: #6b5a60;
      margin: 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer {
      text-align: center;
      padding: 25px;
      background-color: #faf5f6;
      font-size: 12px;
      color: #9e858c;
      border-top: 1px solid #f3dce2;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-badge">🎀</div>
      <h1>${BUSINESS_INFO.name}</h1>
      <p>Confirmación de Reserva</p>
    </div>
    
    <div class="content">
      <div class="greeting">¡Hola, ${appointment.client_firstname}! ✨</div>
      <div class="badge-confirmed">✓ TURNO CONFIRMADO EXITOSAMENTE</div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #5a4b50; margin-bottom: 25px;">
        Tu reserva ha sido registrada correctamente. Te esperamos con un café o té de bienvenida para disfrutar de tu momento de cuidado y relax.
      </p>

      <div class="details-box">
        <div class="detail-row">
          <span class="detail-label">Cliente</span>
          <span class="detail-value">${appointment.client_firstname} ${appointment.client_lastname}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Servicio</span>
          <span class="detail-value">${appointment.service_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${appointment.date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Horario</span>
          <span class="detail-value">${appointment.time_slot} hs</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duración</span>
          <span class="detail-value">${appointment.duration}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Precio Estimado</span>
          <span class="detail-value price-value">${formattedPrice}</span>
        </div>
      </div>

      <div class="business-card">
        <h3>📍 Información del Studio</h3>
        <div class="business-item">📌 <strong>Dirección:</strong> ${BUSINESS_INFO.address}</div>
        <div class="business-item">📞 <strong>Teléfono:</strong> ${BUSINESS_INFO.phone}</div>
        <div class="business-item">💌 <strong>Email:</strong> ${BUSINESS_INFO.email}</div>
        <div class="business-item">📷 <strong>Instagram:</strong> ${BUSINESS_INFO.instagram}</div>
        <div class="business-item">🕒 <strong>Horarios:</strong> ${BUSINESS_INFO.hours}</div>
      </div>
    </div>

    <div class="footer">
      <p>Si deseas reprogramar o cancelar tu turno, comunícate al menos con 24 hs de anticipación.</p>
      <p>© 2026 ${BUSINESS_INFO.name}. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Sends real email to appointment.client_email via SMTP
 */
export const sendConfirmationEmail = async (appointment) => {
  const html = generateEmailHTML(appointment);

  try {
    const transporter = await getTransporter();

    if (!transporter) {
      const errorMsg = 'No hay credenciales SMTP configuradas en .env (requiere SMTP_HOST, SMTP_USER, SMTP_PASS)';
      console.warn(`[EMAIL ERROR] Intento de envío a ${appointment.client_email} falló: ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
        html
      };
    }

    const fromAddress = process.env.EMAIL_FROM || `"${BUSINESS_INFO.name}" <${process.env.SMTP_USER}>`;

    console.log(`Enviando correo electrónico real a: ${appointment.client_email}...`);

    const info = await transporter.sendMail({
      from: fromAddress,
      to: appointment.client_email,
      subject: `✨ Turno Confirmado: ${appointment.service_name} — ${BUSINESS_INFO.name}`,
      html: html
    });

    console.log(`✅ CORREO REAL ENVIADO EXITOSAMENTE a ${appointment.client_email}. ID: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      html
    };
  } catch (err) {
    console.error(`❌ ERROR AL ENVIAR CORREO REAL a ${appointment.client_email}:`, err.message);
    return {
      success: false,
      error: err.message,
      html
    };
  }
};
