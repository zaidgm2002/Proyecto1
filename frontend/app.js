const AGENDA_URL = 'http://localhost:3000/api/agenda';

// Navegación entre secciones
const authSection = document.getElementById('authSection');
const agendaSection = document.getElementById('agendaSection');
const mapSection = document.getElementById('mapSection');

function showSection(section) {
  authSection.classList.add('hidden');
  agendaSection.classList.add('hidden');
  mapSection.classList.add('hidden');
  section.classList.remove('hidden');
}

// Clerk initialization
const PUBLISHABLE_KEY = 'pk_test_c3VidGxlLXN3YW4tNjcuY2xlcmsuYWNjb3VudHMuZGV2JA';
let clerk;

// Inicializar Clerk manualmente
async function initClerk() {
  try {
    console.log('Inicializando Clerk...');

    await window.Clerk.load();
    clerk = window.Clerk;

    console.log('Clerk cargado exitosamente');

    if (clerk.user) {
      syncUser();
      showSection(agendaSection);
      cargarEventos();
    } else {
      clerk.mountSignIn(document.getElementById('clerk-auth'), {
        appearance: {
          elements: {
            card: {
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Error al inicializar Clerk:', err);
  }
}

// Hacer initClerk disponible globalmente para el evento onload
window.initClerk = initClerk;

// Función para obtener el token de Clerk
async function getAuthToken() {
  try {
    const token = await clerk.session?.getToken();
    return token;
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
}

// Función para sincronizar usuario con backend
async function syncUser() {
  try {
    const token = await getAuthToken();
    if (!token) return;

    const response = await fetch('http://localhost:3000/api/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('Usuario sincronizado:', userData);
    }
  } catch (error) {
    console.error('Error al sincronizar usuario:', error);
  }
}

// Inicializar Clerk cuando el DOM esté listo
document.getElementById('clerk-script').addEventListener('load', initClerk);

// Logout con Clerk
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await clerk.signOut();
    showSection(authSection);
    clerk.mountSignIn(document.getElementById('clerk-auth'));
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
});

// Funcionalidad de agenda
async function cargarEventos() {
  try {
    const token = await getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(AGENDA_URL, { headers });
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
    const token = await getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(AGENDA_URL, {
      method: 'POST',
      headers,
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
    const token = await getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${AGENDA_URL}/${id}`, {
      method: 'PUT',
      headers,
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
    const token = await getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`${AGENDA_URL}/${id}`, { 
      method: 'DELETE',
      headers 
    });
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

// Funcionalidad del mapa
let map;
let marker;

// Botón para ir al mapa
document.getElementById('mapaBtn').addEventListener('click', () => {
  showSection(mapSection);
  if (!map) {
    initMap();
  }
});

// Botón para volver a la agenda
document.getElementById('backToAgendaBtn').addEventListener('click', () => {
  showSection(agendaSection);
});

// Logout desde el mapa
document.getElementById('logoutBtnMap').addEventListener('click', async () => {
  try {
    await clerk.signOut();
    showSection(authSection);
    clerk.mountSignIn(document.getElementById('clerk-auth'));
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
});

// Inicializar mapa de Leaflet
function initMap() {
  map = L.map('map').setView([0, 0], 2);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

// Obtener ubicación del usuario
document.getElementById('getLocationBtn').addEventListener('click', () => {
  const statusDiv = document.getElementById('locationStatus');
  const infoDiv = document.getElementById('locationInfo');
  
  if (!navigator.geolocation) {
    statusDiv.textContent = 'Geolocalización no soportada por tu navegador';
    return;
  }
  
  statusDiv.textContent = 'Obteniendo ubicación...';
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      
      // Actualizar mapa
      map.setView([latitude, longitude], 15);
      
      // Remover marcador anterior si existe
      if (marker) {
        map.removeLayer(marker);
      }
      
      // Agregar nuevo marcador
      marker = L.marker([latitude, longitude]).addTo(map);
      
      // Mostrar información
      statusDiv.textContent = 'Ubicación obtenida';
      infoDiv.innerHTML = `
        <p class="text-gray-700"><strong>Latitud:</strong> ${latitude.toFixed(6)}</p>
        <p class="text-gray-700"><strong>Longitud:</strong> ${longitude.toFixed(6)}</p>
        <p class="text-gray-700"><strong>Precisión:</strong> ${position.coords.accuracy.toFixed(0)} metros</p>
      `;
    },
    (error) => {
      statusDiv.textContent = 'Error al obtener ubicación';
      infoDiv.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
    }
  );
});
