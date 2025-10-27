document.addEventListener('DOMContentLoaded', function() {
    // Employment status toggle
    const employmentStatus = document.getElementById('employment_status');
    const categoryGroup = document.getElementById('categoryGroup');
    const typeGroup = document.getElementById('typeGroup');
    const categorySelect = document.getElementById('employment_category');
    const typeSelect = document.getElementById('employment_type');
  
    employmentStatus.addEventListener('change', function() {
        if (this.value === 'Employee') {
            categoryGroup.style.display = 'block';
            typeGroup.style.display = 'block';
            categorySelect.required = true;
            typeSelect.required = true;
        } else {
            categoryGroup.style.display = 'none';
            typeGroup.style.display = 'none';
            categorySelect.required = false;
            typeSelect.required = false;
            categorySelect.value = null;
            typeSelect.value = null;
        }
    });
    employmentStatus.dispatchEvent(new Event('change'));

    // KK Assembly toggle
    const assemblySelect = document.getElementById('Assembly');
    assemblySelect.addEventListener('change', toggleSkFields);
});

// Age calculation
function calculateAge() {
    const birthdayInput = document.getElementById('birthday').value;
    if (!birthdayInput) return false;
    
    const birthday = new Date(birthdayInput);
    if (isNaN(birthday.getTime())) {
        Swal.fire({
            title: "Invalid date",
            text: "Please enter a valid date of birth",
            icon: "error"
        });
        return false;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDifference = today.getMonth() - birthday.getMonth();
  
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
  
    document.getElementById('age').value = age;
    return true;
}

// Toggle SK fields based on KK Assembly selection
function toggleSkFields() {
    const selection = document.getElementById('Assembly').value;
    const yesFields = document.getElementById('sk-yes-fields');
    const noFields = document.getElementById('sk-no-fields');
    
    yesFields.style.display = 'none';
    noFields.style.display = 'none';
    
    if (selection === 'Yes') {
        yesFields.style.display = 'block';
    } else if (selection === 'No') {
        noFields.style.display = 'block';
    }
}

// Form navigation
let currentTab = 0;

function showTab(n) {
    const x = document.getElementsByTagName("fieldset");
    for (let i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    
    x[n].style.display = "block";
    
    document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
    
    const nextBtn = document.getElementById("nextBtn");
    if (n === (x.length - 1)) {
        nextBtn.innerHTML = "Submit";
        nextBtn.setAttribute("type", "button");
    } else {
        nextBtn.innerHTML = "Next";
        nextBtn.setAttribute("type", "button");
    }
    
    fixStepIndicator(n);
}

function nextPrev(n) {
    const x = document.getElementsByTagName("fieldset");
    
    if (n > 0 && !validateCurrentStep(currentTab)) {
        return false;
    }
    
    x[currentTab].style.display = "none";
    currentTab = currentTab + n;
    
    if (currentTab >= x.length) {
        // Submit the form via AJAX
        const form = document.getElementById("housingForm");
        const formData = new FormData(form);
        
        // Convert FormData to JSON
        const jsonData = {};
        formData.forEach((value, key) => {
            // Handle array fields
            if (key.endsWith('[]')) {
                const cleanKey = key.replace('[]', '');
                if (!jsonData[cleanKey]) {
                    jsonData[cleanKey] = [];
                }
                jsonData[cleanKey].push(value);
            } else {
                jsonData[key] = value;
            }
        });
        
        // Show loading indicator
        Swal.fire({
            title: 'Processing...',
            html: 'Please wait while we submit your information',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        fetch(form.action, {
            method: form.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                title: "Success!",
                text: data.message || "Your information has been successfully submitted.",
                icon: "success",
                confirmButtonText: "OK"
            }).then(() => {
                // Redirect to a success page or reset the form
                window.location.href = "/youth-form"; // Change to your desired redirect
            });
        })
        .catch(error => {
            let errorMessage = "There was a problem submitting your form. Please try again.";
            
            if (error.errors) {
                // Handle validation errors
                errorMessage = "Please correct the following errors:\n" + 
                    error.errors.join("\n");
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Swal.fire({
                title: "Error!",
                html: errorMessage.replace(/\n/g, '<br>'),
                icon: "error",
                confirmButtonText: "OK"
            });
            
            // Scroll back to the first tab if there are errors
            currentTab = 0;
            showTab(currentTab);
        });
        
        return false;
    }
    
    showTab(currentTab);
}

function fixStepIndicator(n) {
    const steps = document.getElementsByClassName("step");
    for (let i = 0; i < steps.length; i++) {
        steps[i].classList.remove("active");
    }
    steps[n].classList.add("active");
}

// Form validation
function validateCurrentStep(currentStep) {
    let isValid = true;
    const currentFieldset = document.getElementsByTagName('fieldset')[currentStep];
    const requiredInputs = currentFieldset.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'red';
            isValid = false;
            
            if (!isValid) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            input.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        Swal.fire({
            title: "Validation Error",
            text: "Please complete all required fields before proceeding.",
            icon: "error"
        });
    }
    return isValid;
}

// Initialize first tab
showTab(0);