import 'dotenv/config';
import { sendConfirmationEmail } from './mailer.js';

const targetEmail = process.argv[2] || process.env.SMTP_USER;

if (!targetEmail) {
  console.log('\n❌ Uso: npm run test-email tu_correo@ejemplo.com\n');
  process.exit(1);
}

console.log(`\n📧 Iniciando prueba de envío real de email por SMTP a: ${targetEmail}`);
console.log(`- Configuración detectada: Host=${process.env.SMTP_HOST || 'NO CONFIGURADO'}, User=${process.env.SMTP_USER || 'NO CONFIGURADO'}\n`);

const mockAppointment = {
  id: 888,
  client_firstname: 'Usuario',
  client_lastname: 'Prueba Real',
  client_email: targetEmail,
  client_phone: '+54 9 11 5544-3322',
  service_name: 'Manicuría Rusa & Gel Polish',
  date: new Date().toISOString().split('T')[0],
  time_slot: '16:30',
  price: 18000,
  duration: '60 min',
  status: 'Confirmado'
};

const runTest = async () => {
  const result = await sendConfirmationEmail(mockAppointment);
  if (result.success) {
    console.log(`\n✅ ¡ÉXITO TOTAL! Correo real entregado por SMTP. Revisa la casilla de ${targetEmail}`);
  } else {
    console.log(`\n❌ ERROR AL ENVIAR CORREO: ${result.error}`);
    console.log('\n💡 CONSEJO: Completa los datos en el archivo .env:');
    console.log('   SMTP_HOST=smtp.gmail.com');
    console.log('   SMTP_PORT=465');
    console.log('   SMTP_SECURE=true');
    console.log('   SMTP_USER=tu_correo@gmail.com');
    console.log('   SMTP_PASS=tu_contraseña_de_aplicación\n');
  }
};

runTest();
