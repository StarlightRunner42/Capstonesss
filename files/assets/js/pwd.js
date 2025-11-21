document.addEventListener('DOMContentLoaded', function() {
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
            
            // Set to null instead of empty string
            categorySelect.value = null;
            typeSelect.value = null;
        }
    });
  
    // Trigger the change event once in case there's a default value
    employmentStatus.dispatchEvent(new Event('change'));
  });
  
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
    
    // Uncomment for senior age validation (60+)
    /*
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
    */
    return true;
  }
  
  // Form validation function
  function validateCurrentStep(currentStep) {
    let isValid = true;
    const currentFieldset = document.getElementsByTagName('fieldset')[currentStep];
    const requiredInputs = currentFieldset.querySelectorAll('[required]');
    
    // Validate required fields
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'red';
            isValid = false;
            
            // Scroll to first invalid field
            if (!isValid) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                isValid = false; // Ensure we don't override this
            }
        } else {
            input.style.borderColor = '';
        }
    });
    
    // Special validation for contact information step — only validate fields that are required
    if (currentStep === 1) {
        const contactEntries = document.querySelectorAll('.contact-entry');
        contactEntries.forEach(entry => {
            let entryValid = true;
            const requiredFields = entry.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                const value = (field.value || '').trim();
                if (!value) {
                    entryValid = false;
                    field.style.borderColor = 'red';
                    // scroll to first invalid field
                    if (isValid) field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    field.style.borderColor = '';
                }
            });
            if (!entryValid) {
                isValid = false;
                entry.style.border = '1px solid red';
            } else {
                entry.style.border = '';
            }
        });
    }
    
    // Email validation for first step
    if (currentStep === 0) {
        const emailInput = document.getElementById('email');
        if (emailInput && emailInput.value.trim() && !validateEmail(emailInput.value.trim())) {
            emailInput.style.borderColor = 'red';
            isValid = false;
        }
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
  
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function showCheckmark(groupId) {
    document.querySelector(`#${groupId} .checkmark`).style.display = "inline";
  }
  
  function toggleSpouseInput() {
    const civilStatus = document.getElementById("civil_status").value;
    const spouseGroup = document.getElementById("spouseGroup");
    spouseGroup.style.display = civilStatus === "Married" ? "block" : "none";
  }
  
  let currentTab = 0;
  
  function showTab(n) {
      var x = document.getElementsByTagName("fieldset");
      for (var i = 0; i < x.length; i++) {
        x[i].style.display = "none";
      }
      
      x[n].style.display = "block";
      
      if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
      } else {
        document.getElementById("prevBtn").style.display = "inline";
      }
      
      if (n == x.length) {
        document.getElementById("nextBtn").innerHTML = "Submit";
        document.getElementById("nextBtn").setAttribute("type", "button");
      } else {
        document.getElementById("nextBtn").innerHTML = "Next";
        document.getElementById("nextBtn").setAttribute("type", "button");
      }
      
      fixStepIndicator(n);
  }
  
  function nextPrev(n) {
    var x = document.getElementsByTagName("fieldset");
    
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
          // Handle array fields (like disability[])
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
      
      // Handle contacts data specially
      const contacts = {};
      formData.forEach((value, key) => {
          if (key.startsWith('contacts[')) {
              const matches = key.match(/contacts\[(\d+)\]\[(\w+)\]/);
              if (matches) {
                  const contactId = matches[1];
                  const field = matches[2];
                  if (!contacts[contactId]) {
                      contacts[contactId] = {};
                  }
                  contacts[contactId][field] = value;
              }
          }
      });
      
      // Convert contacts object to array
      jsonData.contacts = Object.values(contacts);
      
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
              window.location.href = "/add_pwd"; // Change to your desired redirect
              // OR to reset the form:
              // form.reset();
              // currentTab = 0;
              // showTab(currentTab);
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
              html: errorMessage.replace(/\n/g, '<br>'), // Convert newlines to <br>
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
  
  function toggleIncome(selectElement) {
    const formRow = selectElement.closest('.form-row');
    const incomeInput = formRow.querySelector('input[name="childIncome[]"]');
    incomeInput.style.display = selectElement.value === 'working' ? 'block' : 'none';
    if (selectElement.value !== 'working') incomeInput.value = '';
  }
  
  // Child information management
  document.addEventListener('DOMContentLoaded', function() {
    const childrenContainer = document.getElementById('childrenContainer');
    let contactCounter = document.querySelectorAll('.contact-entry').length;

    // Add child entry handler
    document.getElementById('addChild').addEventListener('click', function() {
        const childEntry = childrenContainer.querySelector('.child-entry');
        const newChild = childEntry.cloneNode(true);
        
        // Clear values
        newChild.querySelectorAll('input').forEach(input => input.value = '');
        newChild.querySelector('select').value = 'not_working';
        newChild.querySelector('.delete-child').style.display = 'inline-block';
        
        childrenContainer.appendChild(newChild);
        attachWorkingStatusListeners();
    });

    // Delete child entry (event delegation)
    childrenContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-child')) {
            const childEntries = childrenContainer.querySelectorAll('.child-entry');
            if (childEntries.length > 1) {
                e.target.closest('.child-entry').remove();
            }
        }
    });

    // Add contact entry handler
    document.getElementById('addContact').addEventListener('click', function() {
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
        
        // Convert new inputs to uppercase
        const newInputs = newContact.querySelectorAll('input[type="text"], input[type="tel"]');
        newInputs.forEach(input => {
            input.addEventListener('input', function() {
                convertToUppercase(this);
            });
        });
    });

    // Remove contact entry handler using event delegation
    contactsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-contact') && !e.target.disabled) {
            const allContacts = contactsContainer.querySelectorAll('.contact-entry');
            if (allContacts.length > 1) {
                e.target.closest('.contact-entry').remove();
            } else {
                Swal.fire({
                    title: "Cannot Remove",
                    text: "You must keep at least one contact.",
                    icon: "warning"
                });
            }
        }
    });
    
    // Initialize purok options if barangay is selected
    if (document.getElementById('barangay').value) {
        updatePurokOptions();
    }
    
    // Initialize working status listeners
    attachWorkingStatusListeners();
    
    // Initialize first tab
    showTab(0);
});
  
  function attachWorkingStatusListeners() {
    document.querySelectorAll('select[name="childWorkingStatus[]"]').forEach(select => {
        select.addEventListener('change', function() {
            toggleIncome(this);
        });
        // Initialize visibility
        toggleIncome(select);
    });
  }
  
  // Barangay and Purok functions
  function updatePurokOptions() {
      const barangaySelect = document.getElementById('barangay');
      const purokSelect = document.getElementById('purok');
      const selectedBarangay = barangaySelect.value;
      
      // Clear existing options except the first one
      while (purokSelect.options.length > 1) {
          purokSelect.remove(1);
      }
      
      // Add new options based on selected barangay
      if (selectedBarangay && barangays[selectedBarangay]) {
          barangays[selectedBarangay].forEach(purok => {
              const option = document.createElement('option');
              option.value = purok;
              option.textContent = purok;
              purokSelect.appendChild(option);
          });
      }
  }

  
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