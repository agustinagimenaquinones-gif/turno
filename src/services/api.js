const API_BASE = '/api';

export const fetchBusinessInfo = async () => {
  try {
    const res = await fetch(`${API_BASE}/business`);
    if (!res.ok) throw new Error('Error al cargar datos del negocio');
    return await res.json();
  } catch (err) {
    return {
      name: 'Maison Coquette — Studio & Beauty',
      address: 'Av. Libertador 1420, Piso 3, Buenos Aires',
      phone: '+54 9 11 5544-3322',
      email: 'hola@maisoncoquette.com',
      instagram: '@maison.coquette.studio'
    };
  }
};

export const fetchServices = async () => {
  const res = await fetch(`${API_BASE}/services`);
  if (!res.ok) throw new Error('No se pudieron obtener los servicios');
  return await res.json();
};

export const fetchAvailableSlots = async (date) => {
  const res = await fetch(`${API_BASE}/slots?date=${encodeURIComponent(date)}`);
  if (!res.ok) throw new Error('No se pudieron cargar los horarios disponibles');
  return await res.json();
};

export const createAppointment = async (appointmentData) => {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appointmentData)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error al procesar el turno');
  }
  return data;
};

// Admin Endpoints
export const testRealEmail = async (toEmail) => {
  const res = await fetch(`${API_BASE}/admin/test-email`, {
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

export const fetchAdminAppointments = async () => {
  const res = await fetch(`${API_BASE}/admin/appointments`);
  if (!res.ok) throw new Error('Error al cargar la lista de turnos');
  return await res.json();
};

export const cancelAppointment = async (id) => {
  const res = await fetch(`${API_BASE}/admin/appointments/${id}/cancel`, {
    method: 'PUT'
  });
  if (!res.ok) throw new Error('Error al cancelar el turno');
  return await res.json();
};

export const addService = async (serviceData) => {
  const res = await fetch(`${API_BASE}/admin/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData)
  });
  if (!res.ok) throw new Error('Error al agregar el servicio');
  return await res.json();
};

export const updateService = async (id, serviceData) => {
  const res = await fetch(`${API_BASE}/admin/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData)
  });
  if (!res.ok) throw new Error('Error al actualizar servicio');
  return await res.json();
};

export const deleteService = async (id) => {
  const res = await fetch(`${API_BASE}/admin/services/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Error al eliminar servicio');
  return await res.json();
};

export const updateSlotAvailability = async (slotData) => {
  const res = await fetch(`${API_BASE}/admin/slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slotData)
  });
  if (!res.ok) throw new Error('Error al actualizar horario');
  return await res.json();
};
