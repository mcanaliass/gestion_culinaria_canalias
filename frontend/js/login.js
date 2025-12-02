document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-login');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btnLogin = document.getElementById('btn-login');

    btnLogin.disabled = true;
    btnLogin.textContent = 'Iniciando sesión...';

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        mostrarMensaje('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        mostrarMensaje(data.message || 'Error al iniciar sesión', 'error');
        btnLogin.disabled = false;
        btnLogin.textContent = 'Iniciar Sesión';
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('Error de conexión con el servidor', 'error');
      btnLogin.disabled = false;
      btnLogin.textContent = 'Iniciar Sesión';
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