<template>
  <div class="admin-layout">
    <Header :user="user" :searchQuery="searchQuery" @update:searchQuery="searchQuery = $event" @toggleSidebar="toggleSidebar" />
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
                  <td>
                    <span :class="['role-badge', user.role]">{{ user.role }}</span>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <button class="action-btn edit" @click="editUser(user)">
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

    <AddUser 
      :isVisible="showAddUserModal" 
      @close="closeAddUserModal" 
      @user-added="fetchUsers"
    />

    <EditUser 
      :show="showEditUserModal" 
      :user="selectedUser" 
      @close="closeEditUserModal" 
      @update="fetchUsers"
    />
    
    <ConfirmationModal
      :show="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :confirm-text="confirmModalButton"
      :type="confirmModalType"
      @confirm="handleConfirmAction"
      @cancel="cancelConfirmAction"
    />
  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';
import Header from '@/components/header.vue';
import SideBar from '@/components/admin/sidebar.vue';
import AddUser from '@/components/admin/users/AddUser.vue';
import EditUser from '@/components/admin/users/EditUser.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

export default {
  name: 'UserManagement',
  components: { 
    Header, 
    SideBar, 
    AddUser, 
    EditUser,
    ConfirmationModal 
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      searchQuery: '',
      roleFilter: '',
      users: [],
      user: {
        name: 'Admin User',
        role: 'admin'
      },
      isSidebarCollapsed: false,
      showAddUserModal: false,
      showEditUserModal: false,
      selectedUser: null,
      showConfirmModal: false,
      confirmModalTitle: '',
      confirmModalMessage: '',
      confirmModalButton: '',
      confirmModalType: 'primary',
      pendingAction: null,
      pendingActionData: null
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        return (
          (this.searchQuery === '' || 
           user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
          ) && 
          (!this.roleFilter || user.role === this.roleFilter)
        );
      });
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
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
        this.toast.error('Error fetching users: ' + (error.response?.data?.detail || error.message));
        console.error('Error fetching users:', error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },
    editUser(user) {
      this.selectedUser = { ...user };
      this.showEditUserModal = true;
    },
    closeEditUserModal() {
      this.showEditUserModal = false;
      this.selectedUser = null;
    },
    confirmDelete(userId) {
      this.pendingAction = 'deleteUser';
      this.pendingActionData = userId;
      this.confirmModalTitle = 'Delete User';
      this.confirmModalMessage = 'Are you sure you want to delete this user? This action cannot be undone.';
      this.confirmModalButton = 'Delete';
      this.confirmModalType = 'danger';
      this.showConfirmModal = true;
    },
    handleConfirmAction() {
      if (this.pendingAction === 'deleteUser') {
        this.deleteUser(this.pendingActionData);
      }
      this.showConfirmModal = false;
    },
    cancelConfirmAction() {
      this.pendingAction = null;
      this.pendingActionData = null;
      this.showConfirmModal = false;
    },
    async deleteUser(userId) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/users/${userId}`);
        this.toast.success('User deleted successfully!');
        this.fetchUsers();
      } catch (error) {
        this.toast.error('Error deleting user. Please try again.');
        console.error('Error deleting user:', error);
      }
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
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
  color: #2c3e50;
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
  transition: background-color 0.2s;
}

.add-user-btn:hover {
  background-color: #0056b3;
}
  
.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
  
.filters select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: white;
  font-size: 14px;
}
  
.table-container {
  background: white;
  border-radius: 8px;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
  
table {
  width: 100%;
  border-collapse: collapse;
}
  
th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
  
th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}
  
.role-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}
  
.role-badge.student { background: #e3f2fd; color: #1565c0; }
.role-badge.faculty { background: #f3e5f5; color: #7b1fa2; }
.role-badge.admin { background: #fbe9e7; color: #d84315; }
  
.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  margin-right: 5px;
}
  
.action-btn.edit { color: #1976d2; }
.action-btn.delete { color: #dc3545; }
  
.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.action-btn:active {
  background-color: rgba(0, 0, 0, 0.1);
}
</style> 