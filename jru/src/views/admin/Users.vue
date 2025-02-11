<template>
  <div class="admin-layout">
    <Header />
    <div class="content-wrapper">
      <SideBar :isCollapsed="isSidebarCollapsed" />
      <div class="main-content">
        <div class="user-management">
          <div class="page-header">
            <h1>User Management</h1>
            <button class="add-user-btn" @click="openAddUserModal">
              <i class="pi pi-plus"></i> Add New User
            </button>
          </div>

          <div class="filters">
            <input type="text" v-model="searchQuery" placeholder="Search users..." />
            <select v-model="roleFilter">
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.user_id">
                  <td>{{ user.user_id }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.role }}</td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <button class="action-btn edit"@click="editUser(user)">
                <i class="pi pi-pencil"></i>
              </button>
<button class="action-btn delete" @click="confirmDelete(user.user_id)">
  <i class="pi pi-trash"></i>
</button>

                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <AddUser 
      :isVisible="showAddUserModal" 
      @close="closeAddUserModal" 
      @user-added="fetchUsers"
    />

    <!-- Edit User Modal -->
    <EditUser 
      :show="showEditUserModal" 
      :user="selectedUser" 
      @close="closeEditUserModal" 
      @update="fetchUsers"
    />
  </div>
</template>

<script>
import axios from 'axios';
import Header from '@/components/admin/header.vue';
import SideBar from '@/components/admin/sidebar.vue';
import AddUser from '@/components/admin/users/AddUser.vue';
import EditUser from '@/components/admin/users/EditUser.vue';

export default {
  name: 'UserManagement',
  components: { Header, SideBar, AddUser, EditUser },
  data() {
    return {
      searchQuery: '',
      roleFilter: '',
      users: [],
      isSidebarCollapsed: false,
      showAddUserModal: false,
      showEditUserModal: false,
      selectedUser: null,
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        return (
          (user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(this.searchQuery.toLowerCase())) &&
          (!this.roleFilter || user.role === this.roleFilter)
        );
      });
    }
  },
  methods: {
    openAddUserModal() {
    this.showAddUserModal = true;
  },
  closeAddUserModal() {
    this.showAddUserModal = false;
  },
    async fetchUsers() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/users/');
        this.users = response.data;
      } catch (error) {
        alert('Error fetching users: ' + (error.response?.data?.detail || error.message));
        console.error('Error fetching users:', error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },
    openEditUserModal(user) {
      this.selectedUser = { ...user }; // Clone the user object
      this.showEditUserModal = true;
    },
    closeAddUserModal() {
      this.showAddUserModal = false;
    },
// In your UserManagement.vue component
editUser(user) {
    this.selectedUser = { ...user }; // Make sure the user object is passed with the correct ID
    this.showEditUserModal = true;
},
    closeEditUserModal() {
      this.showEditUserModal = false;
      this.selectedUser = null;
    },
    async confirmDelete(userId) {
      if (confirm('Are you sure you want to delete this user?')) {
        await this.deleteUser(userId);
      }
    },
    async deleteUser(userId) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/users/${userId}`);
        alert('User deleted successfully!');
        this.fetchUsers();
      } catch (error) {
        alert('Error deleting user: ' + (error.response?.data?.detail || error.message));
        console.error('Error deleting user:', error);
      }
    }
  },
  mounted() {
    this.fetchUsers();
  },
  watch: {
  user: {
    handler(newUser) {
      console.log("Received user data:", newUser); // Log user data received by the component
      if (newUser && newUser.user_id) {
        this.formData = { ...newUser };
      } else {
        console.error("Invalid user data", newUser);
      }
    },
    immediate: true
  }
},
};
</script>

  <style scoped>

.content-wrapper {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  overflow-y: auto;
}

.user-management {
  width: 100%;
}
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #333;

    margin-bottom: 20px;
  }
  
  .add-user-btn {
    background-color: #007BF6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .filters {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .search-box input,
  .filter-options select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .table-container {
  background: white;  /* Changed from rgb(0, 0, 0) */
  border-radius: 10px;
  color: #333;

  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
  
  .role-badge, .status-badge {
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .role-badge.student { background: #e3f2fd; color: #1565c0; }
  .role-badge.faculty { background: #f3e5f5; color: #7b1fa2; }
  .role-badge.admin { background: #fbe9e7; color: #d84315; }
  
  .status-badge.active { background: #e8f5e9; color: #2e7d32; }
  .status-badge.inactive { background: #ffebee; color: #c62828; }
  
  .actions {
    display: flex;
    gap: 5px;
  }
  
  .action-btn {
    padding: 8px;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-right: 10px;
  width: 35px;
  height: 35px;
  align-items: center;
  justify-content: center;
  }
  
  .action-btn.edit {
  color: #1976d2;
}

.action-btn.delete {
  color: #dc3545;
}
  
  .action-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.action-btn:active {
  background-color: rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  background-color: #004080;
}
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-content {
    background: white;
    padding: 20px;
    color:#333;
    border-radius: 10px;
    width: 500px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  .save-btn {
    background: #007BF6;
    color: white;
  }
  
  .cancel-btn {
    background: #6c757d;
    color: white;
  }
  </style>