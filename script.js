document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.createElement('p');
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'none';
    loginForm.appendChild(errorMessage);

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('user').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                window.location.href = 'admin.html';
            } else {
                const errorData = await response.json();
                errorMessage.innerText = errorData.error || 'Credenciales incorrectas';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            errorMessage.innerText = 'Error en el servidor. Intente más tarde.';
            errorMessage.style.display = 'block';
        }
    });
});
