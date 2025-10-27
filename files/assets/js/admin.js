function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.form-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Form').classList.add('active');
    document.querySelector(`.form-tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
}

// Form submission handlers
document.getElementById('registerBarangay').addEventListener('submit', function(e) {
    e.preventDefault();
    const barangayName = document.getElementById('barangayName').value;
    
    // Add to dropdown (in real app this would come from backend)
    const select = document.getElementById('selectBarangay');
    const option = document.createElement('option');
    option.value = select.options.length;
    option.textContent = barangayName;
    select.appendChild(option);
    
    alert(`Barangay "${barangayName}" registered!`);
    this.reset();
});

document.getElementById('registerPurok').addEventListener('submit', function(e) {
    e.preventDefault();
    const barangay = document.getElementById('selectBarangay');
    const purokName = document.getElementById('purokName').value;
    
    alert(`Purok "${purokName}" added to ${barangay.options[barangay.selectedIndex].text}!`);
    this.reset();
});


// Tab switching functionality
const tabs = document.querySelectorAll('.tab');
const forms = document.querySelectorAll('.form-container');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.id.replace('tab-', 'form-');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding form
        forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === target) {
                form.classList.add('active');
            }
        });
    });
});

// Form submission (prevent default for demo)
document.getElementById('registerBarangay').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Barangay registration submitted successfully!');
});

document.getElementById('registerPurok').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Purok added successfully!');
});