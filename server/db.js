import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

// Open database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('Conectado exitosamente a la base de datos SQLite:', dbPath);
  }
});

// Helper for DB queries using Promises
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const initDb = async () => {
  // Create tables
  await run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      duration TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      image TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_firstname TEXT NOT NULL,
      client_lastname TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      service_id INTEGER NOT NULL,
      service_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      price REAL NOT NULL,
      duration TEXT NOT NULL,
      status TEXT DEFAULT 'Confirmado',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS custom_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      is_available INTEGER DEFAULT 1,
      UNIQUE(date, time_slot)
    )
  `);

  // Seed default services if empty
  const countRes = await get(`SELECT COUNT(*) as count FROM services`);
  if (countRes && countRes.count === 0) {
    const initialServices = [
      {
        name: 'Manicuría Rusa & Gel Polish',
        description: 'Limpieza profunda de cutículas con torno y esmaltado semipermanente de larga duración con brillo espejo.',
        price: 18000,
        duration: '60 min',
        category: 'Uñas',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop'
      },
      {
        name: 'Soft Gel Extensions Coquette',
        description: 'Extensiones en gel de alta resistencia con acabado natural, diseño personalizado con sutiles destellos dorados.',
        price: 25000,
        duration: '90 min',
        category: 'Uñas',
        image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=600&auto=format&fit=crop'
      },
      {
        name: 'Lifting de Pestañas & Lamination',
        description: 'Arqueado natural de pestañas con keratina nutricia, tinte negro intenso y perfilado de cejas de regalo.',
        price: 16000,
        duration: '50 min',
        category: 'Pestañas',
        image: '/images/lash-lifting.jpg'
      },
      {
        name: 'Facial Glow & Hydration',
        description: 'Tratamiento facial iluminador con pulido de seda, ácido hialurónico y máscara de rosas con drenaje facial.',
        price: 22000,
        duration: '60 min',
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop'
      },
      {
        name: 'Perfilado & Brow Lamination',
        description: 'Diseño de cejas según la visajismo de tu rostro, fijado orgánico y tratamiento fortificante.',
        price: 14000,
        duration: '45 min',
        category: 'Cejas',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop'
      }
    ];

    for (const s of initialServices) {
      await run(
        `INSERT INTO services (name, description, price, duration, category, image) VALUES (?, ?, ?, ?, ?, ?)`,
        [s.name, s.description, s.price, s.duration, s.category, s.image]
      );
    }
    console.log('Servicios iniciales cargados en SQLite.');
  }
};

export default db;
