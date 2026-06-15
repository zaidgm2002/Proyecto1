const API_URL = 'http://localhost:3000/api/usuarios';
const AGENDA_URL = 'http://localhost:3000/api/agenda';

// Navegación entre secciones
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const agendaSection = document.getElementById('agendaSection');

function showSection(section) {
  loginSection.classList.add('hidden');
  registerSection.classList.add('hidden');
  agendaSection.classList.add('hidden');
  section.classList.remove('hidden');
}

// Botones de navegación
document.getElementById('showRegisterBtn').addEventListener('click', () => {
  showSection(registerSection);
});

document.getElementById('showLoginBtn').addEventListener('click', () => {
  showSection(loginSection);
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('usuario');
  showSection(loginSection);
});

// Registro de usuarios
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const usuario = {
    nombre: document.getElementById('registerNombre').value,
    email: document.getElementById('registerEmail').value,
    password: document.getElementById('registerPassword').value
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });
    
    if (response.ok) {
      alert('Usuario registrado exitosamente');
      e.target.reset();
      showSection(loginSection);
    } else {
      const error = await response.json();
      alert('Error al registrar usuario: ' + error.error);
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    alert('Error al registrar usuario');
  }
});

// Login de usuarios
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(API_URL);
    const usuarios = await response.json();
    
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
      alert('Login exitoso');
      showSection(agendaSection);
      cargarEventos();
    } else {
      alert('Email o password incorrectos');
    }
  } catch (error) {
    console.error('Error al hacer login:', error);
    alert('Error al hacer login');
  }
});

// Funcionalidad de agenda
async function cargarEventos() {
  try {
    const response = await fetch(AGENDA_URL);
    const eventos = await response.json();
    mostrarEventos(eventos);
  } catch (error) {
    console.error('Error al cargar eventos:', error);
  }
}

function mostrarEventos(eventos) {
  const lista = document.getElementById('eventosList');
  
  if (eventos.length === 0) {
    lista.innerHTML = '<p class="text-gray-500 text-center">No hay eventos</p>';
    return;
  }

  lista.innerHTML = eventos.map(evento => `
    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800">${evento.titulo}</h3>
          ${evento.descripcion ? `<p class="text-gray-600 text-sm mt-1">${evento.descripcion}</p>` : ''}
          <p class="text-gray-500 text-sm mt-2">
            📅 ${evento.fecha} ${evento.hora ? `🕐 ${evento.hora}` : ''}
          </p>
        </div>
        <div class="flex gap-2 ml-4">
          <button onclick="editarEvento(${evento.id})" 
            class="text-blue-500 hover:text-blue-700 text-sm">Editar</button>
          <button onclick="eliminarEvento(${evento.id})" 
            class="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function agregarEvento(evento) {
  try {
    const response = await fetch(AGENDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evento)
    });
    const nuevoEvento = await response.json();
    cargarEventos();
    return nuevoEvento;
  } catch (error) {
    console.error('Error al agregar evento:', error);
  }
}

async function actualizarEvento(id, evento) {
  try {
    const response = await fetch(`${AGENDA_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evento)
    });
    const eventoActualizado = await response.json();
    cargarEventos();
    return eventoActualizado;
  } catch (error) {
    console.error('Error al actualizar evento:', error);
  }
}

async function eliminarEvento(id) {
  if (!confirm('¿Estás seguro de eliminar este evento?')) return;
  
  try {
    await fetch(`${AGENDA_URL}/${id}`, { method: 'DELETE' });
    cargarEventos();
  } catch (error) {
    console.error('Error al eliminar evento:', error);
  }
}

let editandoId = null;

function editarEvento(id) {
  const eventos = document.querySelectorAll('#eventosList > div');
  eventos.forEach(div => {
    const titulo = div.querySelector('h3').textContent;
    const descripcion = div.querySelector('p')?.textContent || '';
    const fechaHora = div.querySelector('p:last-child').textContent;
    const fecha = fechaHora.match(/📅 (\d{4}-\d{2}-\d{2})/)?.[1] || '';
    const hora = fechaHora.match(/🕐 (\d{2}:\d{2})/)?.[1] || '';

    document.getElementById('titulo').value = titulo;
    document.getElementById('descripcion').value = descripcion;
    document.getElementById('fecha').value = fecha;
    document.getElementById('hora').value = hora;
    editandoId = id;
    
    document.querySelector('#eventoForm button').textContent = 'Actualizar Evento';
  });
}

document.getElementById('eventoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const evento = {
    titulo: document.getElementById('titulo').value,
    descripcion: document.getElementById('descripcion').value,
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value
  };

  if (editandoId) {
    await actualizarEvento(editandoId, evento);
    editandoId = null;
    document.querySelector('#eventoForm button').textContent = 'Agregar Evento';
  } else {
    await agregarEvento(evento);
  }

  e.target.reset();
});

// Verificar si hay usuario logueado al cargar la página
const usuarioGuardado = localStorage.getItem('usuario');
if (usuarioGuardado) {
  showSection(agendaSection);
  cargarEventos();
} else {
  showSection(loginSection);
}
