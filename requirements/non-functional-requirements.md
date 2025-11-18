Requerimientos No Funcionales

1. Rendimiento

RNF-001: Tiempo de respuesta del servidor
Descripción: el sistema debe responder rápidamente a las peticiones de los usuarios para garantizar una experiencia fluida
Prioridad: Alta
Criterios de aceptación:
- Operaciones de lectura (GET): Tiempo de respuesta < 500ms en el 95% de los casos
- Operaciones de escritura (POST/PUT/DELETE): Tiempo de respuesta < 1 segundo en el 90% de los casos
- Búsquedas simples de recetas: < 2 segundos
- Búsquedas con múltiples filtros aplicados: < 3 segundos
- Carga de dashboard administrativo con métricas: < 2.5 segundos
Verificación: utilizar herramientas como Postman o Thunder Client para medir tiempos de respuesta bajo carga normal (5-10 usuarios concurrentes). Documentar resultados con capturas de pantalla

RNF-002: Tiempo de carga de páginas
Descripción: las páginas web deben cargarse rápidamente para mejorar la experiencia del usuario y retención
Prioridad: Alta
Criterios de aceptación:
- Página de inicio/exploración: Tiempo de carga completa < 2 segundos
- Páginas de recetas individuales: < 3 segundos
- Resultados de búsqueda: Primera visualización < 1.5 segundos
- Planificador de menú semanal: < 2 segundos
- Dashboard de usuario: < 2 segundos
Verificación: utilizar Google Lighthouse o Chrome DevTools para medir tiempo de carga en conexión 3G/4G simulada. Score de rendimiento > 80 en Lighthouse

<!-- ELIMINADO POR VALIDACIÓN CON CLIENTE - 18/11/2025
RNF-003: Cálculo de presupuestos
Descripción: el sistema debe calcular presupuestos de recetas y menús semanales de forma eficiente
Prioridad: Media
Criterios de aceptación:
- Cálculo de costo total de receta individual: < 100ms
- Cálculo de presupuesto de menú semanal completo (21 comidas): < 2 segundos
- Generación de lista de compras consolidada: < 1.5 segundos
- Los cálculos deben realizarse del lado del servidor para garantizar precisión
Verificación: crear menú semanal con 21 recetas y medir tiempo de cálculo de presupuesto total. Verificar exactitud sumando manualmente
-->

2. Seguridad 

RNF-004: Encriptación de contraseñas
Descripción: las contraseñas de usuarios deben almacenarse de forma segura utilizando algoritmos robustos
Prioridad: Alta
Criterios de aceptación:
- Uso de algoritmo bcrypt con factor de costo mínimo de 10
- Ninguna contraseña debe almacenarse en texto plano en la base de datos
- Las contraseñas deben tener mínimo 8 caracteres con al menos una mayúscula, una minúscula y un número
- El sistema debe rechazar contraseñas comunes (ej: "Password123", "12345678")
Verificación: inspeccionar colección de usuarios en MongoDB Atlas y verificar que campo de contraseña contiene hash bcrypt. Intentar registrar contraseñas débiles y verificar rechazo con mensaje claro

RNF-005: Autenticación con JWT
Descripción: el sistema debe implementar autenticación segura basada en tokens JSON Web Tokens
Prioridad: Alta
Criterios de aceptación:
- Tokens JWT con expiración de 24 horas
- Uso de firma HMAC SHA256 o superior
- Los tokens deben incluir solo información no sensible (ID usuario, rol, nombre)
- El token debe invalidarse al cerrar sesión
- Rutas protegidas deben verificar token válido antes de permitir acceso
Verificación: interceptar token con Chrome DevTools (Network tab), decodificar en jwt.io y verificar estructura, expiración correcta y ausencia de datos sensibles como contraseñas o información financiera

RNF-006: Validación de entrada de datos
Descripción: todos los datos ingresados por usuarios deben ser validados para prevenir inyecciones y errores
Prioridad: Alta
Criterios de aceptación:
- Validación tanto en frontend (feedback inmediato) como backend (seguridad definitiva)
- Mensajes de error específicos y claros sin exponer información técnica del sistema
- Sanitización de caracteres especiales peligrosos en campos de texto: <, >, &, ", ', /, \
- Límites de longitud en todos los campos de texto (nombre: 100 chars, descripción: 500 chars, comentarios: 500 chars)
- Validación de formato de email con expresión regular
- Validación de tipos de dato numéricos (cantidades, costos, porciones)
Verificación: intentar enviar datos malformados, excesivos o con caracteres especiales en formularios (registro, creación de recetas, comentarios) y verificar validación adecuada con mensajes claros

RNF-007: Protección contra ataques comunes
Descripción: el sistema debe implementar medidas de seguridad contra ataques web frecuentes
Prioridad: Media
Criterios de aceptación:
- Protección contra inyección NoSQL en consultas a MongoDB
- Rate limiting: máximo 100 peticiones por IP por minuto
- Headers de seguridad configurados (CORS, Content-Security-Policy)
- Protección contra XSS mediante sanitización de HTML en contenido generado por usuarios
- Variables de entorno (.env) nunca incluidas en repositorio (uso de .gitignore)
Verificación: revisar código verificando uso de bibliotecas como helmet.js, express-rate-limit. Intentar inyección NoSQL en búsquedas y verificar rechazo

3. Usabilidad

RNF-008: Diseño responsivo
Descripción: la interfaz debe adaptarse correctamente a diferentes tamaños de pantalla garantizando funcionalidad completa
Prioridad: Alta
Criterios de aceptación:
- Funcionalidad completa en resoluciones: 320px (móvil pequeño), 768px (tablet), 1920px (escritorio)
- Elementos táctiles mínimo 44x44 píxeles en dispositivos móviles
- Navegación accesible con una mano en móviles (menú hamburguesa accesible)
- Sin scroll horizontal en ninguna resolución
- Imágenes responsivas que se adaptan sin distorsión
- Formularios usables en pantallas pequeñas (campos apilados verticalmente)
Verificación: usar Chrome DevTools en modo responsive para probar en múltiples resoluciones (iPhone SE, iPad, Desktop). Verificar que todas las funcionalidades son accesibles y usables

RNF-009: Accesibilidad web (WCAG 2.1 Nivel AA)
Descripción: el sistema debe ser accesible para personas con discapacidades visuales, motoras y cognitivas
Prioridad: Alta
Criterios de aceptación:
- Contraste mínimo de 4.5:1 para texto normal
- Contraste mínimo de 3:1 para texto grande (18pt o 14pt bold)
- Todas las imágenes funcionales con atributo alt descriptivo
- Imágenes decorativas con alt="" (vacío)
- Navegación completa con solo teclado (sin mouse): Tab, Enter, Escape
- Etiquetas semánticas HTML5 (header, nav, main, section, footer)
- Labels asociados a inputs en formularios
- Score de accesibilidad > 90 en Google Lighthouse
Verificación: usar Google Lighthouse, axe DevTools o WAVE para auditoría de accesibilidad. Navegar el sitio completo solo con teclado verificando que todas las acciones son posibles

RNF-010: Mensajes de error claros
Descripción: los mensajes de error y confirmación deben ser comprensibles y orientar al usuario hacia la solución
Prioridad: Media
Criterios de aceptación:
- Mensajes en lenguaje natural sin códigos técnicos (evitar "Error 500", "undefined")
- Indicación clara de qué campo tiene error y por qué (ej: "El email debe incluir @")
- Sugerencias de corrección cuando sea posible
- Mensajes de éxito visibles por 3-5 segundos con opción de cerrar
- Mensajes de error permanentes hasta corrección del problema
- No usar alert() de JavaScript, sino componentes visuales integrados
- Colores diferenciados: verde para éxito, rojo para error, amarillo para advertencia
Verificación: generar errores intencionalmente (formularios incompletos, datos inválidos, acciones no permitidas) y verificar claridad, utilidad y duración de mensajes mostrados

RNF-011: Experiencia de usuario fluida
Descripción: el sistema debe proporcionar feedback visual inmediato y prevenir acciones duplicadas
Prioridad: Media
Criterios de aceptación:
- Botones de envío deshabilitados tras primer clic para prevenir envíos duplicados
- Indicadores de carga (spinners) durante operaciones que toman > 500ms
- Datos guardados en BD reflejados en UI inmediatamente sin recargar página
- Confirmaciones requeridas para acciones destructivas (eliminar receta, eliminar cuenta)
- Navegación intuitiva con máximo 3 clics para llegar a cualquier funcionalidad principal
Verificación: realizar flujos completos de usuario (crear receta, planificar menú, seguir usuario) verificando feedback visual en cada paso y ausencia de duplicaciones

4. Mantenibilidad

RNF-012: Código limpio y documentado
Descripción: el código debe ser legible, mantenible y seguir estándares de calidad establecidos por el equipo
Prioridad: Media
Criterios de aceptación:
- Funciones con máximo 50 líneas de código (dividir en subfunciones si es necesario)
- Variables y funciones con nombres descriptivos en español o inglés consistente (no mezclar idiomas)
- Comentarios JSDoc en funciones complejas o que requieran explicación
- Separación clara de responsabilidades: rutas, controladores, modelos (patrón MVC)
- Sin código comentado en versión final (eliminar o justificar)
- Indentación consistente (2 o 4 espacios, definido en team-agreements.md)
Verificación: revisión de código por pares verificando legibilidad y comprensión sin explicación adicional. Verificar que otro desarrollador puede entender y modificar el código

RNF-013: Estructura de proyecto organizada
Descripción: los archivos y carpetas del proyecto deben seguir una estructura lógica y consistente
Prioridad: Media
Criterios de aceptación:
- Separación clara de backend y frontend en carpetas
- Backend: rutas, controladores, modelos, middlewares en carpetas separadas
- Frontend: páginas, componentes, estilos, scripts en carpetas separadas
- Archivos de configuración en raíz (.env.example, package.json, .gitignore)
- README.md con instrucciones claras de instalación y ejecución
- Nomenclatura consistente de archivos (camelCase, kebab-case o snake_case definido en team-agreements.md)
Verificación: revisar estructura de carpetas y verificar que cualquier desarrollador nuevo puede ubicar archivos intuitivamente. Probar instrucciones del README en máquina limpia

5. Escalabilidad

RNF-014: Crecimiento de datos
Descripción: el sistema debe mantener rendimiento aceptable con crecimiento moderado de datos
Prioridad: Baja
Criterios de aceptación:
- Rendimiento estable con hasta 1,000 recetas en base de datos
- Rendimiento estable con hasta 500 usuarios registrados
- Índices en MongoDB para campos de búsqueda frecuente (email, categoría, fecha de creación)
- Paginación en listados: máximo 20 items por página
- Degradación de rendimiento < 20% con 3x datos iniciales
Verificación: cargar base de datos con 1,000 recetas de prueba (usando scripts de seed) y medir tiempos de respuesta en búsquedas y cargas de páginas. Comparar con BD pequeña

RNF-015: Optimización de consultas
Descripción: las consultas a base de datos deben estar optimizadas para minimizar tiempo de respuesta
Prioridad: Media
Criterios de aceptación:
- Uso de índices en MongoDB para campos: email (único), categoría, fecha de creación, calificación promedio
- Proyecciones para traer solo campos necesarios (evitar traer receta completa si solo se necesita título)
- Queries de búsqueda ejecutadas en < 200ms para BD con 1,000 registros
- Agregaciones de MongoDB para cálculos complejos (promedios, conteos, agrupaciones)
- Evitar consultas N+1 (múltiples queries en bucles)
Verificación: analizar queries en MongoDB Compass o usando .explain() y verificar uso de índices. Medir tiempos de queries complejas en búsquedas con filtros múltiples

6. Compatibilidad

<!-- ELIMINADO POR VALIDACIÓN CON CLIENTE - 18/11/2025
RNF-016: Compatibilidad de navegadores
Descripción: el sistema debe funcionar correctamente en los navegadores web más utilizados
Prioridad: Alta
Criterios de aceptación:
- Funcionalidad completa en: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Uso de características JavaScript compatibles (ES6 soportado por navegadores target)
- Uso de CSS compatible (evitar características experimentales sin fallbacks)
- Mensaje informativo en navegadores no soportados (ej: Internet Explorer)
- Testing en al menos 2 navegadores diferentes durante desarrollo
Verificación: probar sistema en Chrome, Firefox y Safari verificando funcionalidad completa. Usar herramientas como BrowserStack si es necesario (opcional)
-->

RNF-017: Independencia de plataforma
Descripción: el sistema debe poder ejecutarse en diferentes sistemas operativos sin modificaciones
Prioridad: Media
Criterios de aceptación:
- Funcionalidad completa en: Windows 10/11, macOS 12+, Linux Ubuntu 20.04+
- Uso de rutas de archivos multiplataforma (path module de Node.js, no barras hardcodeadas)
- Variables de entorno para configuración específica de ambiente (.env para desarrollo/producción)
- Dependencias multiplataforma en package.json
Verificación: instalar y ejecutar proyecto en al menos 2 sistemas operativos diferentes siguiendo README.md. Verificar que no hay errores relacionados con rutas o configuración específica de OS

7. Disponibilidad

RNF-018: Disponibilidad del sistema
Descripción: el sistema debe estar operativo y accesible cuando los usuarios lo necesiten
Prioridad: Media
Criterios de aceptación:
- Uptime de 95% durante período de evaluación del proyecto
- Manejo de errores del servidor sin crashes completos de la aplicación
- Página de error 404 personalizada para rutas no existentes
- Página de error 500 amigable ante errores internos (sin mostrar stack traces al usuario)
- Logs de errores en servidor para debugging (usando console.error o biblioteca de logging)
Verificación: simular errores comunes (BD desconectada, ruta inexistente, error en query) y verificar que aplicación no crashea completamente, sino que muestra error amigable y permite continuar navegación

RNF-019: Recuperación ante errores
Descripción: el sistema debe manejar errores gracefully sin pérdida de datos del usuario
Prioridad: Media
Criterios de aceptación:
- Errores de conexión a BD manejados con mensajes claros ("No se pudo conectar, intenta más tarde")
- Formularios conservan datos ingresados tras error de validación
- Reconexión automática a MongoDB si conexión se pierde temporalmente
- Transacciones de BD completadas o revertidas completamente (no dejar datos inconsistentes)
Verificación: desconectar MongoDB Atlas temporalmente durante operación y verificar que sistema muestra error sin crashear y se recupera al reconectar

8. Legalidad y Cumplimiento

RNF-020: Protección de datos personales
Descripción: el sistema debe proteger la privacidad de los usuarios y sus datos personales
Prioridad: Media
Criterios de aceptación:
- Recolección solo de datos estrictamente necesarios (nombre, email, preferencias)
- Información clara sobre uso de datos en página de términos y condiciones
- Opción de eliminar cuenta y todos los datos asociados del usuario
- No compartir datos con terceros (no aplica en este proyecto)
- Contraseñas nunca visibles ni recuperables (solo reseteo)
Verificación: revisar formularios de registro verificando que solo se piden datos necesarios. Probar eliminación de cuenta y verificar que usuario y sus datos desaparecen de BD

RNF-21: Derechos de autor y atribución
Descripción: el sistema debe respetar la propiedad intelectual de las recetas y dar crédito apropiado
Prioridad: Media
Criterios de aceptación:
- Atribución clara de autoría en cada receta (nombre del chef visible)
- Sistema de reporte de plagio o contenido inapropiado en cada receta
- Enlaces visibles a recetas originales en versiones derivadas ("Basada en...")
- Términos de uso indicando que usuarios otorgan licencia de uso al publicar contenido
- Imágenes subidas por usuarios son responsabilidad de quien las sube (términos claros)
Verificación: verificar presencia de información de autoría en todas las vistas de recetas. Crear versión derivada y verificar enlace visible a original

9. Aspectos específicos del dominio

RNF-022: Precisión en cálculos culinarios
Descripción: los cálculos relacionados con cantidades, costos y porciones deben ser precisos y consistentes
Prioridad: Media
Criterios de aceptación:
- Uso de tipos de dato decimal para costos (no float que genera errores de redondeo)
- Conversión correcta entre unidades de medida (tazas, gramos, mililitros)
- Cálculo de porciones proporcional (si receta es para 4 y usuario quiere 6, ajustar cantidades correctamente)
- Redondeo consistente de decimales (2 decimales para costos, 1 decimal para cantidades)
- Validación de cantidades positivas (no permitir -5 huevos)
Verificación: crear receta con costos y cantidades variadas, generar versiones con diferentes porciones y verificar que cálculos son correctos manualmente



Fecha de elaboración: Noviembre 2025
Versión: 1.1
Estado: Actualizado según validación con cliente - 18/11/2025