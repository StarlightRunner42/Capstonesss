document.addEventListener("DOMContentLoaded", function () {
    const roleOptions = document.querySelectorAll('.role-option');
    const hiddenInput = document.getElementById('selected-role');

    roleOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Remove active class from all options
            roleOptions.forEach(opt => opt.classList.remove('active'));

            // Add active class to clicked option
            this.classList.add('active');

            // Update hidden input value
            hiddenInput.value = this.dataset.role;
        });
    });
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const password = document.getElementById('password').value;
    
    // Validate password requirements
    const hasLength = password.length >= 8;
    const hasCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLength || !hasCase || !hasNumber) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Password',
            text: 'Password must be at least 8 characters, contain uppercase and lowercase letters, and include a number.',
            confirmButtonText: 'OK'
        });
        return; // Stop form submission
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Success case
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: result.message || 'User created successfully',
                confirmButtonText: 'OK'
            }).then(() => {
                // Optional: Redirect after success
                window.location.href = ''; // Redirect to login page
            });
        } else {
            // Error case
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.error || 'Something went wrong',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: 'Could not connect to the server',
            confirmButtonText: 'OK'
        });
    }
});

// Password strength indicator
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const strength = document.querySelector('.password-strength');
    const requirements = document.querySelectorAll('.requirement i');
    
    // Check requirements
    const hasLength = password.length >= 8;
    const hasCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    requirements[0].className = hasLength ? 'fas fa-check' : 'fas fa-circle';
    requirements[1].className = hasCase ? 'fas fa-check' : 'fas fa-circle';
    requirements[2].className = hasNumber ? 'fas fa-check' : 'fas fa-circle';
    
    let strengthValue = 0;
    if (hasLength) strengthValue += 33;
    if (hasCase) strengthValue += 33;
    if (hasNumber) strengthValue += 34;
    
    strength.style.width = `${strengthValue}%`;
    strength.style.background = 
        strengthValue <= 33 ? '#ff4444' :
        strengthValue <= 66 ? '#ffa700' : '#00C851';
});