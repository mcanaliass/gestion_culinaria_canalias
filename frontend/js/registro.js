document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-registro');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmarPassword = document.getElementById('confirmar-password').value;
    const rol = document.getElementById('rol').value;
    const btnRegistrar = document.getElementById('btn-registrar');

    // Validar que las contraseñas coincidan
    if (password !== confirmarPassword) {
      mostrarMensaje('Las contraseñas no coinciden', 'error');
      return;
    }

    // Deshabilitar botón
    btnRegistrar.disabled = true;
    btnRegistrar.textContent = 'Registrando...';

    try {
      const response = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email, password, rol })
      });

      const data = await response.json();

      if (data.success) {
        mostrarMensaje('¡Registro exitoso! Redirigiendo al inicio de sesión...', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        mostrarMensaje(data.message || 'Error al registrar usuario', 'error');
        btnRegistrar.disabled = false;
        btnRegistrar.textContent = 'Registrarse';
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('Error de conexión con el servidor', 'error');
      btnRegistrar.disabled = false;
      btnRegistrar.textContent = 'Registrarse';
    }
  });
});

function mostrarMensaje(mensaje, tipo) {
  const container = document.getElementById('mensaje-container');
  const claseAlerta = tipo === 'success' ? 'alert-success' : 'alert-danger';
  const icono = tipo === 'success' ? '✅' : '❌';

  container.innerHTML = `
    <div class="alert ${claseAlerta} alert-dismissible fade show" role="alert">
      ${icono} ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}