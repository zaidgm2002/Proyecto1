# Agenda Diaria

Aplicación sencilla de agenda diaria con backend en Node.js y frontend en JavaScript, utilizando Tailwind CSS para el estilo.

## Estructura

```
Proyecto1/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── models/
│   │   └── Evento.js
│   └── .env
└── frontend/
    ├── index.html
    └── app.js
```

## Instalación y Ejecución

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor:
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

### Frontend

1. Abrir el archivo `index.html` en un navegador:
```
frontend/index.html
```

O usar un servidor local (opcional):
```bash
cd frontend
npx serve
```

## Funcionalidades

- **Crear eventos**: Título, descripción, fecha y hora
- **Ver eventos**: Lista de todos los eventos
- **Editar eventos**: Modificar eventos existentes
- **Eliminar eventos**: Borrar eventos de la agenda

## API Endpoints

- `GET /api/agenda` - Obtener todos los eventos
- `POST /api/agenda` - Crear nuevo evento
- `PUT /api/agenda/:id` - Actualizar evento
- `DELETE /api/agenda/:id` - Eliminar evento

## Notas

- Utiliza MongoDB Atlas como base de datos para persistencia de eventos
- Los eventos se mantienen incluso al reiniciar el servidor
- Configurar archivo `.env` con la URI de conexión a MongoDB Atlas
- Diseño minimalista y código fácil de leer
