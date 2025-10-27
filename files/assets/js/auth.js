document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');
    
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, role })
        });

        if (response.redirected) {
            // Successful login - follow the redirect
            window.location.href = response.url;
        } else {
            const data = await response.json();
            
            if (!data.success) {
                // Show SweetAlert for error
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: data.error || 'Invalid credentials',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Try Again'
                });
            }
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred during login',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        });
        console.error('Login error:', error);
    }
});