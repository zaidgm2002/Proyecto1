const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('SUPABASE_URL:', supabaseUrl ? 'Encontrada' : 'No encontrada');
console.log('SUPABASE_KEY:', supabaseKey ? 'Encontrada' : 'No encontrada');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir tanto desarrollo como producción
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500'
];

// Agregar URL de Render si está configurada
if (process.env.RENDER_URL) {
  allowedOrigins.push(process.env.RENDER_URL);
}

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

//mi endpoint de prueba
app.get('/api/saludo', (req, res) =>{
  res.json('Hola mundo');
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('creado_en', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y password son requeridos' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, email, password }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    const { data, error } = await supabase
      .from('usuarios')
      .update({ nombre, email, password, actualizado_en: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Endpoints de agenda
app.get('/api/agenda', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

app.post('/api/agenda', async (req, res) => {
  try {
    const { titulo, descripcion, fecha, hora } = req.body;
    
    if (!titulo || !fecha) {
      return res.status(400).json({ error: 'Titulo y fecha son requeridos' });
    }

    const { data, error } = await supabase
      .from('eventos')
      .insert([{ titulo, descripcion: descripcion || '', fecha, hora: hora || '' }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

app.put('/api/agenda/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, hora } = req.body;

    const { data, error } = await supabase
      .from('eventos')
      .update({ titulo, descripcion, fecha, hora })
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

app.delete('/api/agenda/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
