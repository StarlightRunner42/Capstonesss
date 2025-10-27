// Age calculation with validation
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

  const ageInput = document.getElementById('age');
  ageInput.value = age;
  
  // Validate senior age (60+)
  if (age < 60) {
    ageInput.style.borderColor = 'red';
    document.getElementById('age').value = '';
    Swal.fire({
      title: "You must be 60 years old or older to register.",
      text: "Please check your date of birth.",
      icon: "error"
    });
    return false;
  } else {
    ageInput.style.borderColor = '';
    return true;
  }
}


// Form validation function
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
  
  // Special validation for contact information
  if (currentStep === 1) {
    const contactEntries = document.querySelectorAll('.contact-entry');
    contactEntries.forEach(entry => {
      const name = entry.querySelector('input[name$="[name]"]').value;
      const relationship = entry.querySelector('input[name$="[relationship]"]').value;
      const phone = entry.querySelector('input[name$="[phone]"]').value;
      
      if (!name || !relationship || !phone) {
        isValid = false;
        entry.style.border = '1px solid red';
      } else {
        entry.style.border = '';
      }
    });
  }
  
  if (!isValid) {
    Swal.fire({
      title: "Missing Information",
      text: "Please complete all required fields before proceeding.",
      icon: "error"
    });
  }
  return isValid;
}

function toggleSpouseInput() {
  const civilStatus = document.getElementById("civil_status").value;
  const spouseGroup = document.getElementById("spouseGroup");
  spouseGroup.style.display = civilStatus === "Married" ? "block" : "none";
}

// Form navigation
let currentTab = 0;

function showTab(n) {
  const fieldsets = document.getElementsByTagName("fieldset");
  
  // Hide all fieldsets
  for (let i = 0; i < fieldsets.length; i++) {
    fieldsets[i].style.display = "none";
  }
  
  // Show current fieldset
  fieldsets[n].style.display = "block";
  
  // Update navigation buttons
  document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
  document.getElementById("nextBtn").innerHTML = n === fieldsets.length - 1 ? "Submit" : "Next";
  
  // Update progress indicator
  updateStepIndicator(n);
}

function nextPrev(n) {
  const fieldsets = document.getElementsByTagName("fieldset");
  
  // Validate before proceeding forward
  if (n > 0 && !validateCurrentStep(currentTab)) {
    return false;
  }
  
  // Hide current tab
  fieldsets[currentTab].style.display = "none";
  
  // Update current tab
  currentTab += n;
  
  // Submit if we're at the end
  if (currentTab >= fieldsets.length) {
    submitForm();
    return false;
  }
  
  // Show new tab
  showTab(currentTab);
}

function updateStepIndicator(n) {
  const steps = document.getElementsByClassName("step");
  for (let i = 0; i < steps.length; i++) {
    steps[i].classList.remove("active");
  }
  steps[n].classList.add("active");
}

// Child information management
function setupChildManagement() {
  const childrenContainer = document.getElementById('childrenContainer');
  
  document.getElementById('addChild').addEventListener('click', function() {
    const childEntry = childrenContainer.querySelector('.child-entry');
    const newChild = childEntry.cloneNode(true);

    // Reset values
    newChild.querySelectorAll('input').forEach(input => input.value = '');
    newChild.querySelector('select').value = 'not_working';
    newChild.querySelector('.delete-child').style.display = 'inline-block';
    
    childrenContainer.appendChild(newChild);
    setupWorkingStatusListeners();
  });

  // Delegated event for delete buttons
  childrenContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-child')) {
      const childEntries = childrenContainer.querySelectorAll('.child-entry');
      if (childEntries.length > 1) {
        e.target.closest('.child-entry').remove();
      }
    }
  });

  setupWorkingStatusListeners();
}

function setupWorkingStatusListeners() {
  document.querySelectorAll('select[name="childWorkingStatus[]"]').forEach(select => {
    select.addEventListener('change', function() {
      const incomeInput = this.closest('.form-row').querySelector('input[name="childIncome[]"]');
      incomeInput.style.display = this.value === 'working' ? 'block' : 'none';
      if (this.value !== 'working') incomeInput.value = '';
    });
    
    // Initialize visibility
    const incomeInput = select.closest('.form-row').querySelector('input[name="childIncome[]"]');
    incomeInput.style.display = select.value === 'working' ? 'block' : 'none';
  });
}

// Contact information management
function setupContactManagement() {
  const contactsContainer = document.getElementById('contactsContainer');
  const addContactButton = document.getElementById('addContact');
  let contactCounter = 1;

  addContactButton.addEventListener('click', function() {
    contactCounter++;
    const newContact = document.createElement('div');
    newContact.className = 'contact-entry';
    newContact.dataset.contactId = contactCounter;
    
    newContact.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label>Contact Type</label>
          <select class="contact-type" name="contacts[${contactCounter}][type]" required>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" name="contacts[${contactCounter}][name]" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Relationship</label>
          <input type="text" name="contacts[${contactCounter}][relationship]" required>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" name="contacts[${contactCounter}][phone]" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" name="contacts[${contactCounter}][email]">
        </div>
        <div class="form-group">
          <button type="button" class="remove-contact">Remove</button>
        </div>
      </div>
    `;
    
    contactsContainer.appendChild(newContact);
    
    // Add remove functionality
    newContact.querySelector('.remove-contact').addEventListener('click', function() {
      contactsContainer.removeChild(newContact);
    });
  });
}

// Form submission with AJAX
async function submitForm() {
  const form = document.getElementById('housingForm');
  const formData = new FormData(form);
  const submitButton = document.querySelector('#nextBtn');
  
  // Transform FormData to match backend structure
  const requestData = {
    identifying_information: {
      name: {
        first_name: formData.get('first_name'),
        middle_name: formData.get('middle_name'),
        last_name: formData.get('last_name')
      },
      address: {
        barangay: formData.get('barangay'),
        purok: formData.get('purok')
      },
      date_of_birth: formData.get('birthday'),
      age: parseInt(formData.get('age')),
      place_of_birth: formData.get('place_of_birth'),
      marital_status: formData.get('civil_status'),
      gender: formData.get('gender'),
      osca_id_number: formData.get('osca_id'),
      gsis_sss: formData.get('gsis_sss_no'),
      philhealth: formData.get('philhealth_no'),
      tin: formData.get('tin_no'),
      other_govt_id: formData.get('other_govt_id'),
      service_business_employment: formData.get('service'),
      current_pension: formData.get('pension'),
      capability_to_travel: formData.get('education_level') === 'Yes' ? 'Yes' : 'No',
      religion: formData.get('place_of_birth') // Note: This field is used for religion in your form
    },
    family_composition: {
      spouse: {
        name: formData.get('spouse_name') || undefined
      },
      father: {
        last_name: formData.get('fatherLastName'),
        first_name: formData.get('fatherFirstName'),
        middle_name: formData.get('fatherMiddleName'),
        extension: formData.get('fatherExtension') || undefined
      },
      mother: {
        last_name: formData.get('motherLastName'),
        first_name: formData.get('motherFirstName'),
        middle_name: formData.get('motherMiddleName')
      },
      children: Array.from(document.querySelectorAll('.child-entry')).map(child => ({
        full_name: child.querySelector('input[name="childFullName[]"]').value,
        occupation: child.querySelector('input[name="childOccupation[]"]').value,
        age: parseInt(child.querySelector('input[name="childAge[]"]').value) || undefined,
        working_status: child.querySelector('select[name="childWorkingStatus[]"]').value,
        income: child.querySelector('input[name="childIncome[]"]').value || undefined
      })).filter(child => child.full_name)
    },
    education_hr_profile: {
      educational_attainment: formData.get('education_level'),
      skills: Array.from(document.querySelectorAll('input[name="skills[]"]:checked')).map(el => el.value),
      skill_other_text: document.getElementById('skill-other-text').value || undefined
    }
  };

  // Process contacts
  requestData.identifying_information.contacts = Array.from(document.querySelectorAll('.contact-entry')).map(contact => ({
    type: contact.querySelector('.contact-type').value,
    name: contact.querySelector('input[name$="[name]"]').value,
    relationship: contact.querySelector('input[name$="[relationship]"]').value,
    phone: contact.querySelector('input[name$="[phone]"]').value,
    email: contact.querySelector('input[name$="[email]"]').value || undefined
  }));

  // Show loading indicator
  Swal.fire({
    title: 'Processing...',
    text: 'Please wait while we save your information',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  submitButton.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (!response.ok) throw data;

    Swal.fire({
      title: 'Success!',
      text: data.alert?.text || 'Senior citizen record created successfully',
      icon: 'success'
    }).then(() => {
      form.reset();
      window.location.href = '/add_senior'; // Redirect if needed
    });
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      title: 'Error',
      text: error.message || 'An error occurred while saving the data',
      icon: 'error'
    });
  } finally {
    submitButton.disabled = false;
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize form sections
  setupChildManagement();
  setupContactManagement();
  toggleSpouseInput(); // Initialize spouse field visibility
  
  // Initialize purok options if barangay is already selected
  if (document.getElementById('barangay').value) {
    updatePurokOptions();
  }
  
  // Set up required field validation
  document.querySelectorAll('[required]').forEach(input => {
    input.addEventListener('input', function() {
      if (this.value.trim()) this.style.borderColor = '';
    });
    
    input.addEventListener('blur', function() {
      if (!this.value.trim()) this.style.borderColor = 'red';
    });   
  });
  
  // Show first tab
  showTab(0);
});


document.querySelectorAll('#requiredDocuments input').forEach(input => {
  input.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g, '');
      if (this.value.length > 11) {
          this.value = this.value.slice(0, 11);
      }
  });
});


// Function to convert input to uppercase
function convertToUppercase(inputElement) {
  inputElement.value = inputElement.value.toUpperCase();
}

// Apply uppercase conversion to all relevant input fields
document.addEventListener('DOMContentLoaded', function() {
  // Get all text input fields (including text, email, tel, etc.)
  const inputFields = document.querySelectorAll('input[type="text"], input[type="tel"], textarea');
  
  // Apply to each field
  inputFields.forEach(input => {
      // Convert existing value
      input.value = input.value.toUpperCase();
      
      // Add event listener for new input
      input.addEventListener('input', function() {
          convertToUppercase(this);
      });
  });
});