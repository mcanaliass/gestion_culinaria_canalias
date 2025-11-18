# gestion_culinaria_canalias

Página web  que permite a chefs, usuarios regulares y administradores colaborar en la gestión y descubrimiento de recetas culinarias, facilitando la planificación de comidas según presupuesto, preferencias
dietéticas e ingredientes disponibles

## Convenciones de Nomenclatura
Nombres de archivos en minúsculas con guiones (ejemplo_uno.html)
Clases CSS descriptivas con guiones (class-btn, clase)
Variables CSS con doble guión (--color)
Comentarios descriptivos (<!--comentario-->)
Estructura de carpetas ()

### Estrategia de Branches
- main: Código estable y funcional
- develop: Rama de desarrollo e integración
- feature/nombre: Nuevas funcionalidades
  - Ejemplo: `feature/search-recipes`
- fix/nombre: Corrección de errores
  - Ejemplo: `fix/login-error`

### Convención de Commits
Los mensajes de commit siguen el formato: `tipo: descripción corta`

### Tipos de Commit
- feat: Nueva funcionalidad para el usuario
- fix: Corrección de errores
- docs: Cambios en documentación
- style: Cambios de formato (indentación, espacios)
- refactor: Mejoras de código sin cambiar funcionalidad
- test: Agregar o modificar pruebas
- chore: Tareas de mantenimiento (instalar dependencias, configuración)

### Ejemplos:
feat: implementar formulario de creación de recetas
fix: corregir validación de ingredientes
docs: actualizar instrucciones de instalación
style: aplicar formato consistente en CSS

### Reglas importantes:

1. Primera letra minúscula después del tipo
2. Sin punto final en la descripción corta
3. Tiempo presente: "agregar" no "agregado" o "agregué"
4. Máximo 72 caracteres en la primera línea
5. En español