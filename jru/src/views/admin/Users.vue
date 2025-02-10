
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
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Search users..."
          />
        </div>
        <div class="filter-options">
          <select v-model="roleFilter">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
          <select v-model="statusFilter">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
  
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['role-badge', user.role]">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', user.status]">
                  {{ user.status }}
                </span>
              </td>
              <td>{{ user.lastLogin }}</td>
              <td class="actions">
                <button class="edit-btn" @click="editUser(user)">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="view-btn" @click="viewUser(user)">
                  <i class="pi pi-eye"></i>
                </button>
                <button class="delete-btn" @click="confirmDelete(user)">
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
  </div>
      <!-- Add/Edit User Modal -->
      <div class="modal" v-if="showModal">
        <div class="modal-content">
          <h2>{{ isEditing ? 'Edit User' : 'Add New User' }}</h2>
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label>Name</label>
              <input type="text" v-model="userForm.name" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="userForm.email" required>
            </div>
            <div class="form-group">
              <label>Role</label>
              <select v-model="userForm.role" required>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="userForm.status" required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
  </template>
  
  <script>
    import Header from '@/components/admin/header.vue';
  import SideBar from '@/components/admin/sidebar.vue';
  
  export default {
    name: 'UserManagement',
    components: {
      Header,
      SideBar,
    },
    data() {
      return {
        searchQuery: '',
        roleFilter: '',
        isSidebarCollapsed: false,
        statusFilter: '',
        showModal: false,
        isEditing: false,
        userForm: {
          name: '',
          email: '',
          role: 'student',
          status: 'active'
        },
        users: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'student',
            status: 'active',
            lastLogin: '2024-03-20 10:30'
          },
          // Add more sample users
        ]
      }
    },
    computed: {
      filteredUsers() {
        return this.users.filter(user => {
          const matchesSearch = user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
          const matchesRole = !this.roleFilter || user.role === this.roleFilter
          const matchesStatus = !this.statusFilter || user.status === this.statusFilter
          return matchesSearch && matchesRole && matchesStatus
        })
      }
    },
    methods: {
      openAddUserModal() {
        this.isEditing = false
        this.userForm = {
          name: '',
          email: '',
          role: 'student',
          status: 'active'
        }
        this.showModal = true
      },
      editUser(user) {
        this.isEditing = true
        this.userForm = { ...user }
        this.showModal = true
      },
      viewUser(user) {
        // Implement view user details
      },
      confirmDelete(user) {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
          this.deleteUser(user)
        }
      },
      deleteUser(user) {
        // Implement delete functionality
        this.users = this.users.filter(u => u.id !== user.id)
      },
      saveUser() {
        if (this.isEditing) {
          // Update existing user
          const index = this.users.findIndex(u => u.id === this.userForm.id)
          this.users[index] = { ...this.userForm }
        } else {
          // Add new user
          this.users.push({
            id: this.users.length + 1,
            ...this.userForm,
            lastLogin: '-'
          })
        }
        this.closeModal()
      },
      closeModal() {
        this.showModal = false
        this.userForm = {
          name: '',
          email: '',
          role: 'student',
          status: 'active'
        }
      }
    }
  }
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
  
  .actions button {
    padding: 5px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .edit-btn { background: #ffd700; }
  .view-btn { background: #90caf9; }
  .delete-btn { background: #ff6b6b; }
  
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