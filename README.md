# Gestión Culinaria - Cocinalias

Sistema web de gestión culinaria que permite a chefs, usuarios regulares y administradores colaborar en la gestión y descubrimiento de recetas culinarias.

---

## 📌 Importante - Para Usuarios Finales

**Si eres usuario del sistema (sin conocimientos técnicos):**

El sistema ya está instalado y funcionando. Solo necesitas:

1. **Abrir tu navegador** (Chrome, Firefox, Edge, etc.)
2. **Ir a la página principal** (el equipo técnico te proporcionará la dirección)
3. **Registrarte** como usuario o chef
4. **¡Comenzar a usar Cocinalias!**

**No necesitas instalar nada en tu computadora.** Las instrucciones técnicas a continuación son solo para desarrolladores que necesiten modificar el código.

---

## 👨‍💻 Para Desarrolladores y Personal Técnico

Las siguientes instrucciones son para instalar y configurar el sistema localmente para desarrollo y pruebas.

## Descripción

Plataforma digital colaborativa para la gestión y descubrimiento de recetas culinarias, facilitando la planificación de comidas según presupuesto, preferencias dietéticas e ingredientes disponibles.

## Funcionalidades Principales

### Usuarios Regulares
- Registro e inicio de sesión
- Búsqueda de recetas con filtros avanzados
- Guardar recetas como favoritas
- Calificar y comentar recetas
- Crear versiones derivadas de recetas

### Chefs/Expertos
- Todas las funcionalidades de usuario regular
- Crear recetas con ingredientes, pasos y costos
- Editar y eliminar pasos de recetas con control de bloqueo
- Editar y eliminar recetas propias
- Ver estadísticas de sus recetas

### Administradores
- Gestión de categorías
- Moderación de contenido
- Acceso a métricas del sistema

## Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- JWT para autenticación
- bcryptjs para encriptación
- CORS para manejo de peticiones cross-origin

### Frontend
- HTML5 semántico
- CSS3 con Bootstrap 5
- JavaScript (Vanilla)

## Instalación y Configuración

### Requisitos Previos
Antes de comenzar, asegúrate de tener instalado:
- **Node.js** versión 18 o superior ([Descargar aquí](https://nodejs.org/))
- **npm** (se instala automáticamente con Node.js)
- Cuenta gratuita en **MongoDB Atlas** ([Crear cuenta](https://www.mongodb.com/cloud/atlas/register))
- **Git** ([Descargar aquí](https://git-scm.com/downloads))
- **Visual Studio Code** con la extensión "Live Server" (recomendado para el frontend)

Para verificar que tienes Node.js y npm instalados:
```bash
node --version  # Debe mostrar v18.x.x o superior
npm --version   # Debe mostrar 9.x.x o superior
```

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/gestion_culinaria_canalias.git
cd gestion_culinaria_canalias
```

### Paso 2: Instalar Dependencias del Backend
```bash
cd backend
npm install
```

**Nota:** El frontend no requiere instalación de dependencias ya que usa solo HTML, CSS y JavaScript vanilla.

### Paso 3: Configurar Variables de Entorno
1. En la carpeta `backend`, crea un archivo llamado `.env`
2. Copia y pega el siguiente contenido:

```env
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@TU_CLUSTER.mongodb.net/gestion-culinaria?retryWrites=true&w=majority

JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=24h
```

3. **Reemplaza los valores:**
   - `TU_USUARIO`: Tu usuario de MongoDB Atlas
   - `TU_PASSWORD`: Tu contraseña de MongoDB Atlas
   - `TU_CLUSTER`: El nombre de tu cluster (ejemplo: cluster0.xxxxx)
   - `tu_clave_secreta_aqui`: Genera una clave segura con el comando:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

**⚠️ Importante:** El archivo `.env` NO debe subirse a GitHub (ya está en `.gitignore`)

### Paso 4: Crear Base de Datos en MongoDB Atlas
1. Ve a https://www.mongodb.com/cloud/atlas
2. Inicia sesión o crea una cuenta
3. Crea un nuevo cluster (gratis)
4. En "Database Access", crea un usuario con contraseña
5. En "Network Access", agrega tu IP (o 0.0.0.0/0 para todas)
6. Haz clic en "Connect" y copia la URI de conexión
7. Reemplaza `<password>` con tu contraseña en el archivo `.env`

### Paso 5: Ejecutar el Proyecto

#### Backend:
1. Abre una terminal en la carpeta del proyecto
2. Ejecuta el servidor:

```bash
npm start
```

O para modo desarrollo con recarga automática:
```bash
npm run dev
```

El servidor estará corriendo en: **http://localhost:3000**

#### Frontend:
Tienes dos opciones:

**Opción 1: Usando Live Server (recomendado)**
1. Instala la extensión "Live Server" en Visual Studio Code
2. Abre la carpeta del proyecto en VS Code
3. Click derecho en `frontend/html/index.html`
4. Selecciona "Open with Live Server"
5. Se abrirá automáticamente en: **http://127.0.0.1:5500/frontend/html/index.html**

**Opción 2: Abriendo archivos directamente**
1. Navega a la carpeta `frontend/html/`
2. Abre cualquier archivo `.html` con tu navegador
3. **Nota:** Algunos navegadores pueden bloquear peticiones AJAX por seguridad. Se recomienda usar Live Server.

**Verificación:**
- Backend debe mostrar: `Servidor corriendo en puerto 3000` y `MongoDB conectado`
- Frontend debe cargar la página principal sin errores en la consola del navegador

## Estructura del Proyecto

```
gestion_culinaria_canalias/
├── backend/
│   ├── controllers/
│   │   ├── admin_controller.js
│   │   ├── auth_controller.js
│   │   ├── recipe_controller.js
│   │   └── user_controller.js
│   ├── middleware/
│   │   ├── admin_middleware.js
│   │   └── auth_middleware.js
│   ├── models/
│   │   └── recipe.js
│   │   ├── user.js
│   ├── routes/
│   │   ├── admin_routes.js
│   │   ├── auth_routes.js
│   │   ├── recipe_routes.js
│   │   └── user_routes.js
│   └── server.js
├── docs/
│   ├── functional_requirements.md
│   └── non_functional_requirements.md
├── frontend/
│   └── css/
│       └── main.css
│   ├── html/
│   │   ├── admin.html
│   │   ├── crear_receta.html
│   │   ├── editar_receta.html
│   │   ├── explorar.html
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── perfil_publico.html
│   │   ├── perfil.html
│   │   ├── registro.html
│   │   └── ver_receta.html
│   ├── js/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── config.js
│   │   ├── crear_receta.js
│   │   ├── editar_receta.js
│   │   ├── explorar.js
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── perfil_publico.js
│   │   ├── perfil.js
│   │   ├── registro.js
│   │   └── ver_receta.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Uso del Sistema

### Registro de Usuario
1. Ve a `frontend/html/registro.html`
2. Completa el formulario con tus datos
3. Selecciona tu rol (Usuario o Chef)
4. Haz clic en "Registrarse"

### Iniciar Sesión
1. Ve a `frontend/html/login.html`
2. Ingresa tu correo y contraseña
3. Haz clic en "Iniciar Sesión"

### Crear una Receta (Solo Chefs)
1. Inicia sesión como chef
2. Ve a "Crear Receta" en el menú
3. Completa toda la información:
   - Título y descripción
   - Ingredientes con cantidades y costos (en colones ₡)
   - Pasos de preparación con control de bloqueo/edición
   - Tiempos y porciones
4. Usa los botones "Guardar paso" para bloquear cada paso
5. Puedes editar o eliminar pasos según necesites
6. Haz clic en "Publicar Receta"

### Buscar Recetas
1. Ve a "Explorar Recetas"
2. Usa los filtros disponibles:
   - Búsqueda por texto
   - Tipo de comida
   - Dificultad
   - Tiempo máximo
3. Haz clic en "Buscar"

### Calificar Recetas
1. Abre cualquier receta
2. Haz clic en las estrellas para calificar (1-5)
3. La calificación se guardará automáticamente

### Comentar Recetas
1. Abre cualquier receta
2. Escribe tu comentario en el campo de texto
3. Haz clic en "Publicar Comentario"

## Características Especiales

### Sistema de Calificación con Estrellas
- Interfaz intuitiva con estrellas interactivas
- Efecto hover para previsualizar calificación
- Una calificación por usuario
- Promedio automático de todas las calificaciones

### Gestión Avanzada de Pasos de Receta
- Cada paso puede ser bloqueado después de completarse
- Botón "Editar" para modificar pasos bloqueados
- Botón "Eliminar" para remover pasos innecesarios
- Numeración automática que se actualiza al eliminar pasos

### Costos en Colones Costarricenses
- Todos los precios se muestran en colones (₡)
- Cálculo automático de costo por porción
- Visualización de costo total de ingredientes

## Seguridad

- Contraseñas encriptadas con bcrypt (factor 10)
- Autenticación con JWT (tokens válidos por 24 horas)
- Validación de datos en frontend y backend
- Protección contra inyección NoSQL
- Variables de entorno para credenciales
- Configuración CORS para peticiones seguras

## Convenciones de Código

### Nomenclatura
- Archivos: `snake_case` (ejemplo: `auth_controller.js`, `crear_receta.js`)
- Variables y funciones: `camelCase` (ejemplo: `obtenerRecetas`, `configurarFormulario`)
- Clases CSS: `kebab-case` (ejemplo: `btn-primary`, `rating-stars`)
- Constantes: `UPPER_CASE` (ejemplo: `API_URL`)

### Commits
Formato: `tipo: descripción corta`

Tipos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de errores
- `docs`: Cambios en documentación
- `style`: Cambios de formato
- `refactor`: Mejoras de código

Ejemplo: `feat: implementar sistema de bloqueo de pasos en recetas`

## Testing

Para probar el sistema:
1. Registra al menos 2 usuarios (1 regular y 1 chef)
2. Como chef, crea 3-5 recetas con diferentes características
3. Prueba el sistema de bloqueo/edición de pasos
4. Como usuario regular, busca, califica y comenta recetas
5. Prueba crear una versión derivada de una receta
6. Verifica que los costos se muestren en colones (₡)

## Solución de Problemas

### Error de conexión a MongoDB
- Verifica que tu IP esté en la lista de Network Access
- Confirma que el usuario y contraseña sean correctos
- Asegúrate de reemplazar `<password>` en la URI

### Puerto 3000 en uso
Cambia el puerto en `.env`:
```env
PORT=3001
```

También actualiza `API_URL` en `frontend/js/config.js`:
```javascript
const API_URL = 'http://localhost:3001/api';
```

### Token inválido o expirado
Cierra sesión y vuelve a iniciar sesión para obtener un nuevo token.

### Error "API_URL is already declared"
Asegúrate de que `const API_URL` solo esté declarado en `config.js` y que todos los archivos HTML carguen `config.js` primero:
```html
<script src="../js/config.js"></script>
<script src="../js/auth.js"></script>
```

## Contribuidores

- María José Canalías Sanabria - Desarrollo Full Stack

## Licencia

Este proyecto es parte del curso SOFT-11 de Universidad CENFOTEC.

## Contacto

Para preguntas o sugerencias, contacta a: mcanaliass@ucenfotec.ac.cr

---

**Universidad CENFOTEC** - Proyecto Integrador 1 - 2025-C3