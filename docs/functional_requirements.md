Requerimientos Funcionales

1. Autenticación y gestión de usuarios

RF-001: Registro de usuario
Descripción: el sistema debe permitir el registro de nuevos usuarios con información básica
Actores: usuarios no registrados
Criterios de aceptación: 
- El usuario debe proporcionar: nombre completo, correo electrónico, contraseña (mínimo 8 caracteres)
- El sistema debe validar que el correo electrónico sea único
- El usuario debe seleccionar su rol inicial: usuario regular o chef/experto
- La contraseña debe almacenarse encriptada en la base de datos 
- El sistema debe enviar confirmación visual tras registro exitoso
Verificación: registrar un usuario con datos válidos y verificar que aparece en la base de datos con la contraseña encriptada

RF-002: Inicio de sesión
Descripción: el sistema debe permitir a usuarios registrados iniciar sesión con sus credenciales
Actores: usuario registrado, chef, administrador
Criterios de aceptación: 
- El usuario debe proporcionar correo electrónico y contraseña
- El sistema debe validar las credenciales contra la base de datos
- Tras inicio exitoso, el sistema debe redirigir según el rol del usuario
- El sistema debe mantener la sesión activa mediante token JWT (JSON Web Token)
- El sistema debe mostrar mensaje de error si las credenciales son incorrectas
Verificación: iniciar sesión con credenciales correctas e incorrectas, verificar redirección y persistencia de sesión

RF-003: Gestión de usuario
Descripción: el sistema debe oermitir a los usuarios ver y editar su información de perfil
Actores: usuario regular, chef, administrador
Criterios de aceptación: 
- El usuario puede actualizar: nombre, biografía, foto de perfil, preferencias dietéticas
- Los cambios deben guardarse inmediatamente en la base de datos
- El sistema debe validar el formato de los datos ingresados
- El usuario puede ver estadísticas personales: recetas creadas, seguidores, recetas favoritas
Verificación: editar perfil y verificar que los cambios se reflejan en la base de datos y en la interfaz

2. Gestión de recetas 

RF-004: Crear receta 
Descripción: los chefs deben poder crear recetas completas con todos los detalles necesarios
Actores: chef/expertos
Criterios de aceptación: 
- El chef debe proporcionar: título, descripción e ingredientes, tiempo de preparación, tiempo de cocción, porciones 
- Debe poder agregar ingredientes con: nombre, cantidad, unidad de medida, costo estimado
- Debe poder agregar pasos de preparación en orden secuencial con descripción e imagen opcional
- Debe poder clasificar la receta: tipo (desayuno, almuerzo, cena, postre, botana), dificultad (fácil, media, difícil), ocasión (diario, especial)
- El sistema debe calcular automáticamente el costo total aproximado y costo aproximado por porción
- La receta debe guardarse como borrador o publicarse directamente
Verificación: crear una receta completa y verificar que todos los campos se guardan correctamente con costo calculado

RF-005: Editar receta
Descripción: los chefs deben poder modificar sus recetas publicadas
Actores: chef/expertos
Criterios de aceptación:
- El chef solo puede editar sus propias recetas
- Puede modificar cualquier campo de la receta original
- Los cambios deben reflejarse inmediatamente tras guardar
- El sistema debe mantener un registro de versión actualizada (fecha de última modificación)
Verificación: editar una receta existente y verificar que los cambios se guardan y muestran correctamente

RF-006: Eliminar receta
Descripción: los chefs deben poder eliminar sus recetas publicadas
Actores: chef/expertos
Criterios de aceptación:
- El chef solo puede eliminar sus propias recetas
- El sistema debe solicitar confirmación antes de eliminar
- Al eliminar, todas las referencias (favoritos, comentarios) deben eliminarse o marcarse como inactivas
- Las versiones derivadas deben mantenerse pero indicar que la receta original fue eliminada
Verificación: eliminar una receta y verificar que desaparece del sistema pero las derivadas se mantienen

3. Búsqueda y descubrimiento

RF-007: Búsqueda básica de recetas
Descripción: los usuarios deben poder buscar recetas por nombre o palabra clave
Actores: usuario regular, chef, administrador
Criterios de aceptación:
- El usuario puede ingresar texto en barra de búsqueda
- El sistema debe buscar coincidencias en: título, descripción, ingredientes, tags
- Los resultados deben mostrarse en máximo 2 segundos
- Debe mostrar mínimo: título, imagen, tiempo total, dificultad, calificación promedio
Verificación: realizar búsqueda con diferentes términos y verificar relevancia de resultados

RF-008: Búsqueda avanzada con filtros
Descripción: los usuarios deben poder refinar búsquedas aplicando múltiples filtros
Actores: usuario regular, chef, administrador
Criterios de aceptación:
- Filtros disponibles: tipo de comida, dificultad, tiempo máximo, rango de presupuesto, preferencias dietéticas (vegetariano, vegano, sin gluten)
- El usuario puede aplicar múltiples filtros simultáneamente
- Los resultados deben actualizarse dinámicamente al cambiar filtros
- Debe mostrar cantidad de resultados encontrados
Verificación: aplicar combinación de filtros y verificar que resultados cumplen todos los criterios

RF-009: Guardar recetas como favoritos
Descripción: los usuarios deben poder marcar recetas como favoritas para acceso rápido
Actores: usuario regular, chef
Criterios de aceptación:
- El usuario puede marcar/desmarcar cualquier receta como favorita con un clic
- Las recetas favoritas deben aparecer en sección "Mis Favoritos" del perfil
- El cambio debe reflejarse inmediatamente en la interfaz
- El ícono de favorito debe cambiar visualmente según el estado
Verificación: agregar y quitar favoritos, verificar persistencia tras cerrar sesión

RF-010: Crear versión derivada de receta
Descripción: los usuarios deben poder crear su propia versión de una receta manteniendo atribución al autor original
Actores: usuario regular, chef
Criterios de aceptación:
- El usuario puede seleccionar "Crear mi versión" en cualquier receta
- Se carga formulario con datos de la receta original pre-llenados
- El usuario puede modificar cualquier campo
- La nueva versión debe enlazar y dar crédito a la receta original
- Debe indicar claramente "Basada en [nombre receta] por [autor original]"
Verificación: crear versión derivada y verificar enlace con original y atribución visible

RF-011: Calificar recetas
Descripción: los usuarios deben poder calificar recetas con un sistema de estrellas
Actores: usuario regular, chef
Criterios de aceptación:
- El usuario puede calificar de 1 a 5 estrellas
- Solo puede calificar una vez por receta (puede modificar su calificación)
- El sistema debe calcular y mostrar calificación promedio automáticamente
- La calificación debe actualizarse en tiempo real
Verificación: calificar una receta y verificar actualización del promedio correctamente

RF-012: Comentar recetas
Descripción: los usuarios deben poder dejar comentarios en recetas compartiendo su experiencia
Actores: usuario regular, chef
Criterios de aceptación:
- El usuario puede escribir comentario de hasta 500 caracteres
- Debe poder incluir opcionalmente foto del resultado
Los comentarios deben mostrarse ordenados por fecha (más recientes primero)
- El autor de la receta debe recibir notificación de nuevos comentarios
Verificación: Publicar comentario con y sin imagen, verificar orden y notificación

<!-- ELIMINADO POR VALIDACIÓN CON CLIENTE - 18/11/2025
4. Planificación

RF-013: Crear planificador de menú semanal
Descripción: los usuarios deben poder planificar sus comidas de la semana seleccionando recetas
Actores: usuario regular, chef
Criterios de aceptación:
- El usuario puede crear planificador con vista de 7 días
- Para cada día puede asignar recetas a: desayuno, almuerzo, cena, snacks
- Puede agregar recetas desde búsqueda o favoritos
- El sistema debe calcular presupuesto total estimado del menú
- Puede guardar múltiples planificadores (ej: "Semana vegetariana", "Semana económica")
Verificación: crear planificador completo de 7 días y verificar cálculo de presupuesto total

RF-014: Generar lista de compras automática
Descripción: el sistema debe generar lista de compras consolidada basada en el menú semanal
Actores: usuario regular, chef
Criterios de aceptación:
- A partir de un planificador, el sistema debe consolidar todos los ingredientes
- Debe sumar cantidades de ingredientes repetidos
- Debe agrupar ingredientes por categoría: lácteos, carnes, verduras, etc.
- El usuario puede marcar ingredientes que ya tiene
- Debe calcular costo total estimado de la lista
Verificación: generar lista desde planificador con recetas repetidas, verificar suma correcta de cantidades

RF-015: Editar lista de compras
Descripción: los usuarios deben poder modificar la lista de compras generada
Actores: usuario regular, chef
Criterios de aceptación:
- El usuario puede agregar items manualmente
- Puede modificar cantidades de items existentes
- Puede eliminar items que no necesita
- Puede marcar items como comprados
- Los cambios deben guardarse automáticamente
Verificación: modificar lista generada automáticamente y verificar persistencia de cambios
-->

5. Comunidad

RF-016: Sistema de Seguidores
Descripción: los usuarios deben poder seguir a chefs y otros usuarios para ver sus publicaciones
Actores: usuario regular, chef
Criterios de aceptación:
- El usuario puede seguir/dejar de seguir a cualquier otro usuario
- Debe ver cantidad de seguidores y seguidos en cada perfil
- Debe tener feed de actividad con recetas de usuarios seguidos
- El usuario seguido puede ver lista de sus seguidores
Verificación: seguir a varios usuarios y verificar feed de actividad actualizado

RF-017: Ranking de recetas populares
Descripción: el sistema debe mostrar las recetas más populares y mejor valoradas
Actores: usuario regular, chef, administrador
Criterios de aceptación:
- Debe mostrar rankings por: más vistas, mejor calificadas, más comentadas, más guardadas
- Los rankings pueden filtrarse por período: semana, mes, todo el tiempo
- Debe actualizar rankings cada 24 horas
- Mínimo top 10 en cada categoría
Verificación: Verificar que rankings reflejan datos reales de la BD y se actualizan correctamente

6. Administración
RF-018: Gestión de categorías
Descripción: el administrador debe poder crear, editar y eliminar categorías de recetas.
Actores: administrador
Criterios de aceptación:
- El administrador puede crear nuevas categorías con nombre y descripción
- Puede editar categorías existentes
- Puede eliminar categorías que no estén en uso
- Las categorías deben estar disponibles inmediatamente para clasificar recetas
Verificación: crear categoría y verificar que aparece disponible al crear receta

RF-019: Moderación de contenido
Descripción: el administrador debe poder moderar recetas, comentarios y usuarios reportados
Actores: administrador
Criterios de aceptación:
- El administrador debe ver cola de contenido reportado por usuarios
- Puede eliminar recetas, comentarios o usuarios que violen términos
- Puede suspender temporalmente usuarios
- Cada acción de moderación debe quedar registrada con fecha y justificación
Verificación: Reportar contenido, moderar como admin, verificar eliminación o suspensión

RF-020: Dashboard de métricas
Descripción: el administrador debe tener acceso a métricas y estadísticas del sistema
Actores: administrador
Criterios de aceptación:
- Debe mostrar: total de usuarios, total de recetas, recetas publicadas hoy/semana/mes
- Gráficos de: usuarios activos, recetas más vistas, categorías más populares
- Estadísticas de engagement: promedio de comentarios, calificaciones, tiempo en sitio
- Debe poder exportar reportes en formato CSV
Verificación: acceder a dashboard y verificar que datos coinciden con consultas directas a BD

7. Notificaciones
RF-021: Notificaciones en tiempo real
Descripción: los usuarios deben recibir notificaciones sobre actividad relevante
Actores: usuario regular, chef
Criterios de aceptación:
- El usuario recibe notificaciones por: nuevos seguidores, comentarios en sus recetas, respuestas a comentarios, likes en versiones derivadas
- Las notificaciones deben aparecer en ícono de campana con contador
- Debe poder marcar notificaciones como leídas
- Las notificaciones no leídas deben persistir entre sesiones
Verificación: generar eventos que disparen notificaciones y verificar aparición en tiempo real



Fecha de elaboración: Noviembre 2025
Versión: 1.1
Estado: Actualizado según validación con cliente - 18/11/2025
