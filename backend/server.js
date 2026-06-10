const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let agenda = [];

//mi endpoint de prueba
app.get('/api/saludo', (req, res) =>{
  res.json('Hola mundo');
});

app.get('/api/agenda', (req, res) => {
  res.json(agenda);
});

app.post('/api/agenda', (req, res) => {
  const { titulo, descripcion, fecha, hora } = req.body;
  
  if (!titulo || !fecha) {
    return res.status(400).json({ error: 'Titulo y fecha son requeridos' });
  }

  const nuevoEvento = {
    id: Date.now(),
    titulo,
    descripcion: descripcion || '',
    fecha,
    hora: hora || ''
  };

  agenda.push(nuevoEvento);
  res.status(201).json(nuevoEvento);
});

app.put('/api/agenda/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha, hora } = req.body;

  const index = agenda.findIndex(evento => evento.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }

  agenda[index] = {
    ...agenda[index],
    titulo: titulo || agenda[index].titulo,
    descripcion: descripcion !== undefined ? descripcion : agenda[index].descripcion,
    fecha: fecha || agenda[index].fecha,
    hora: hora !== undefined ? hora : agenda[index].hora
  };

  res.json(agenda[index]);
});

app.delete('/api/agenda/:id', (req, res) => {
  const { id } = req.params;
  const index = agenda.findIndex(evento => evento.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }

  agenda.splice(index, 1);
  res.json({ message: 'Evento eliminado' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
