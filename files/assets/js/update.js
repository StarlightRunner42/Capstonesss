// Sample user data - in a real app, this would come from an API
let users = [
    { id: 1, username: 'admin1', email: 'admin1@example.com', role: 'admin', status: 'active' },
    { id: 2, username: 'user1', email: 'user1@example.com', role: 'admin', status: 'active' },
    { id: 3, username: 'editor1', email: 'editor1@example.com', role: 'staff', status: 'active' },
    { id: 4, username: 'user2', email: 'user2@example.com', role: 'staff', status: 'pending' },
    { id: 5, username: 'suspended1', email: 'suspended@example.com', role: 'staff', status: 'suspended' }
];

// DOM Elements
const userList = document.getElementById('user-list');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-user-form');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.querySelector('.cancel-btn');
const refreshBtn = document.getElementById('refresh-btn');
const searchInput = document.getElementById('search-input');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderUserList(users);
    
    // Event Listeners
    closeBtn.addEventListener('click', () => editModal.style.display = 'none');
    cancelBtn.addEventListener('click', () => editModal.style.display = 'none');
    refreshBtn.addEventListener('click', () => renderUserList(users));
    searchInput.addEventListener('input', handleSearch);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });
});



// Handle edit button click
function handleEdit(e) {
    const userId = parseInt(e.target.getAttribute('data-id'));
    const user = users.find(u => u.id === userId);
    
    if (user) {
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-username').value = user.username;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-role').value = user.role;
        document.getElementById('edit-status').value = user.status;
        
        editModal.style.display = 'block';
    }
}

// Handle delete button click
function handleDelete(e) {
    const userId = parseInt(e.target.getAttribute('data-id'));
    
    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(user => user.id !== userId);
        renderUserList(users);
        alert('User deleted successfully');
    }
}

// Handle form submission
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userId = parseInt(document.getElementById('edit-user-id').value);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            username: document.getElementById('edit-username').value,
            email: document.getElementById('edit-email').value,
            role: document.getElementById('edit-role').value,
            status: document.getElementById('edit-status').value
        };
        
        renderUserList(users);
        editModal.style.display = 'none';
        alert('User updated successfully');
    }
});

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        renderUserList(users);
        return;
    }
    
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm) ||
        user.status.toLowerCase().includes(searchTerm)
    );
    
    renderUserList(filteredUsers);
}