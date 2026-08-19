// ----------------------------------------------------
// LOCAL STORAGE API CLIENT
// ----------------------------------------------------

const INITIAL_SERVICES = [
  {
    id: 1,
    name: 'Manicuría Rusa & Gel Polish',
    description: 'Limpieza profunda de cutículas con torno y esmaltado semipermanente de larga duración con brillo espejo.',
    price: 18000,
    duration: '60 min',
    category: 'Uñas',
    image: '/images/lash-lifting.jpg' // Standard or fallback image
  },
  {
    id: 2,
    name: 'Soft Gel Extensions Coquette',
    description: 'Extensiones en gel de alta resistencia con acabado natural, diseño personalizado con sutiles destellos dorados.',
    price: 25000,
    duration: '90 min',
    category: 'Uñas',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Lifting de Pestañas & Lamination',
    description: 'Arqueado natural de pestañas con keratina nutricia, tinte negro intenso y perfilado de cejas de regalo.',
    price: 16000,
    duration: '50 min',
    category: 'Pestañas',
    image: '/images/lash-lifting.jpg'
  },
  {
    id: 4,
    name: 'Facial Glow & Hydration',
    description: 'Tratamiento facial iluminador con pulido de seda, ácido hialurónico y máscara de rosas con drenaje facial.',
    price: 22000,
    duration: '60 min',
    category: 'Skincare',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 5,
    name: 'Perfilado & Brow Lamination',
    description: 'Diseño de cejas según la visajismo de tu rostro, fijado orgánico y tratamiento fortificante.',
    price: 14000,
    duration: '45 min',
    category: 'Cejas',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop'
  }
];

const DEFAULT_TIME_SLOTS = [
  '09:00', '10:15', '11:30', '14:00', '15:15', '16:30', '17:45', '19:00'
];

// Helper to get from localstorage with fallback
const getStorageItem = (key, fallback) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(data);
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize services list in LocalStorage
export const fetchServices = async () => {
  return getStorageItem('coquette_services', INITIAL_SERVICES).filter(s => s.is_active !== false);
};

export const fetchBusinessInfo = async () => {
  return {
    name: 'Maison Coquette — Studio & Beauty',
    address: 'Av. Libertador 1420, Piso 3, Buenos Aires',
    phone: '+54 9 11 5544-3322',
    email: 'hola@maisoncoquette.com',
    instagram: '@maison.coquette.studio'
  };
};

// Get available slots for a specific date (calculating dynamically from LocalStorage)
export const fetchAvailableSlots = async (date) => {
  // Get all booked appointments
  const appointments = getStorageItem('coquette_appointments', []);
  const bookedSlots = appointments
    .filter((a) => a.date === date && a.status !== 'Cancelado')
    .map((a) => a.time_slot);
  const bookedSet = new Set(bookedSlots);

  // Get custom slots configured by admin
  const customSlots = getStorageItem('coquette_custom_slots', []);
  const dateCustomSlots = customSlots.filter((cs) => cs.date === date);

  let slotsList = [...DEFAULT_TIME_SLOTS];

  if (dateCustomSlots.length > 0) {
    const customSet = new Set(dateCustomSlots.map((cs) => cs.time_slot));
    DEFAULT_TIME_SLOTS.forEach((slot) => {
      if (!customSet.has(slot)) dateCustomSlots.push({ time_slot: slot, is_available: 1 });
    });
    slotsList = dateCustomSlots.map((cs) => cs.time_slot).sort();
  }

  return slotsList.map((slot) => {
    const isBooked = bookedSet.has(slot);
    const customObj = dateCustomSlots.find((cs) => cs.time_slot === slot);
    const isDisabledByAdmin = customObj ? customObj.is_available === 0 : false;
    return {
      time: slot,
      available: !isBooked && !isDisabledByAdmin,
      isBooked: isBooked,
      isDisabledByAdmin: isDisabledByAdmin
    };
  });
};

// Create a new appointment (Validates locally to prevent double booking & requests backend email send)
export const createAppointment = async (appointmentData) => {
  const appointments = getStorageItem('coquette_appointments', []);

  // 1. Prevent double booking check
  const doubleBooked = appointments.some(
    (a) => a.date === appointmentData.date && a.time_slot === appointmentData.time_slot && a.status !== 'Cancelado'
  );

  if (doubleBooked) {
    throw new Error('El horario seleccionado ya no está disponible. Alguien más acaba de reservarlo.');
  }

  // 2. Fetch service details
  const services = getStorageItem('coquette_services', INITIAL_SERVICES);
  const service = services.find((s) => s.id === Number(appointmentData.service_id));
  if (!service) {
    throw new Error('El servicio seleccionado no existe.');
  }

  // 3. Create appointment object
  const newAppointment = {
    id: appointments.length + 1 + Date.now(),
    client_firstname: appointmentData.client_firstname.trim(),
    client_lastname: appointmentData.client_lastname.trim(),
    client_email: appointmentData.client_email.trim(),
    client_phone: appointmentData.client_phone.trim(),
    service_id: service.id,
    service_name: service.name,
    date: appointmentData.date,
    time_slot: appointmentData.time_slot,
    price: service.price,
    duration: service.duration,
    status: 'Confirmado',
    created_at: new Date().toISOString()
  };

  // 4. Save to LocalStorage
  appointments.push(newAppointment);
  setStorageItem('coquette_appointments', appointments);

  // 5. Call API server to send confirmation email securely using backend SMTP
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppointment)
    });

    const emailData = await res.json();
    return {
      message: emailData.message || 'Turno confirmado. Revisá tu correo.',
      emailSent: emailData.emailSent,
      emailError: emailData.emailError,
      appointment: newAppointment,
      emailResult: emailData.emailResult
    };
  } catch (err) {
    // If backend server is unreachable, we still confirm booking locally but show email error
    return {
      message: '¡Tu turno fue reservado! Pero no pudimos enviar el correo de confirmación.',
      emailSent: false,
      emailError: 'Servidor de correo no disponible',
      appointment: newAppointment,
      emailResult: { success: false, error: err.message }
    };
  }
};

// Admin Operations using LocalStorage
export const fetchAdminAppointments = async () => {
  return getStorageItem('coquette_appointments', []);
};

export const cancelAppointment = async (id) => {
  const appointments = getStorageItem('coquette_appointments', []);
  const updated = appointments.map((a) => {
    if (a.id === id) return { ...a, status: 'Cancelado' };
    return a;
  });
  setStorageItem('coquette_appointments', updated);
  return { message: 'Turno cancelado' };
};

export const addService = async (serviceData) => {
  const services = getStorageItem('coquette_services', INITIAL_SERVICES);
  const newService = {
    id: services.length + 1 + Date.now(),
    name: serviceData.name,
    description: serviceData.description,
    price: Number(serviceData.price),
    duration: serviceData.duration,
    category: serviceData.category || 'General',
    image: serviceData.image || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop'
  };
  services.push(newService);
  setStorageItem('coquette_services', services);
  return newService;
};

export const updateService = async (id, serviceData) => {
  const services = getStorageItem('coquette_services', INITIAL_SERVICES);
  const updated = services.map((s) => {
    if (s.id === id) {
      return {
        ...s,
        name: serviceData.name,
        description: serviceData.description,
        price: Number(serviceData.price),
        duration: serviceData.duration,
        category: serviceData.category,
        image: serviceData.image
      };
    }
    return s;
  });
  setStorageItem('coquette_services', updated);
  return serviceData;
};

export const deleteService = async (id) => {
  const services = getStorageItem('coquette_services', INITIAL_SERVICES);
  const updated = services.map((s) => {
    if (s.id === id) return { ...s, is_active: false };
    return s;
  });
  setStorageItem('coquette_services', updated);
  return { message: 'Servicio eliminado' };
};

export const updateSlotAvailability = async (slotData) => {
  const customSlots = getStorageItem('coquette_custom_slots', []);
  const index = customSlots.findIndex((cs) => cs.date === slotData.date && cs.time_slot === slotData.time_slot);
  
  if (index > -1) {
    customSlots[index].is_available = slotData.is_available;
  } else {
    customSlots.push(slotData);
  }
  
  setStorageItem('coquette_custom_slots', customSlots);
  return { message: 'Horario actualizado' };
};

// Admin SMTP Test client helper
export const testRealEmail = async (toEmail) => {
  const res = await fetch('/api/admin/test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toEmail })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Fallo en la prueba de email real');
  }
  return data;
};
