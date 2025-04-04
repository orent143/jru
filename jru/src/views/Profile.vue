<template>
  <div class="profile-section">
    <!-- Modal Overlay -->
    <div v-if="isProfileModalOpen" class="modal-overlay" @click="$emit('close')"></div>

    <!-- Profile Modal -->
    <div v-if="isProfileModalOpen" class="profile-modal">
      <div class="profile-header">
        <div class="profile-avatar">
          <i class="pi pi-user"></i>
        </div>
        <div class="profile-info">
          <h1>{{ user?.name || 'User Name' }}</h1>
          <p class="role">{{ user?.role || 'Role' }}</p>
        </div>
        <button class="close-modal" @click="$emit('close')">X</button>
      </div>

      <div class="profile-details">
        <div class="detail-card">
          <h2>Personal Information</h2>
          <div class="detail-item">
            <label>Email:</label>
            <span>{{ user?.email || 'Not provided' }}</span>
          </div>
          <div class="detail-item">
            <label>Role:</label>
            <span>{{ user?.role || 'Not specified' }}</span>
          </div>
          <div class="detail-item">
            <label>User ID:</label>
            <span>{{ user?.user_id || 'Not available' }}</span>
          </div>
        </div>

        <div class="detail-card">
          <h2>Account Settings</h2>
          <div class="settings-form">
            <div class="form-group">
              <label>Current Password</label>
              <input type="password" v-model="currentPassword" placeholder="Enter current password" :disabled="loading" />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input type="password" v-model="newPassword" placeholder="Enter new password" :disabled="loading" />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" v-model="confirmPassword" placeholder="Confirm new password" :disabled="loading" />
            </div>
            <div v-if="error" class="error-message">{{ error }}</div>
            <div class="button-group">
                  <button 
                    @click="updatePassword" 
                    class="update-btn"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="loading-spinner"></span>
                    {{ loading ? 'Updating...' : 'Update Password' }}
                  </button>
                  <button 
                    @click="handleLogout" 
                    class="logout-btn"
                  >
                    <i class="pi pi-sign-out"></i>
                    Logout
                  </button>
                </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProfileModal',
  props: {
    user: Object,
    isProfileModalOpen: Boolean,
  },
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      loading: false,
      error: null,
    };
  },
  methods: {
    async updatePassword() {
      this.error = null;
      if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
        this.error = 'All fields are required';
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.error = 'New passwords do not match';
        return;
      }

      if (this.newPassword.length < 8) {
        this.error = 'New password must be at least 8 characters long';
        return;
      }

      this.loading = true;

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/update-password/', {
          user_id: this.user.user_id,
          new_password: this.newPassword
        });

        if (response.data.message === 'Password updated successfully') {
          alert('Password updated successfully');
        }
      } catch (err) {
        this.error = err.response?.data?.detail || 'Failed to update password';
      } finally {
        this.loading = false;
      }
    },
    handleLogout() {
      localStorage.removeItem('user');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.profile-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 80%;
  max-width: 900px;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  background: none;
  border: none;
  cursor: pointer;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}


.profile-avatar {
  width: 100px;
  height: 100px;
  background-color: #007BF6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar i {
  font-size: 3rem;
  color: white;
}

.profile-info h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.profile-info .role {
  margin: 0.5rem 0 0;
  color: #666;
  font-size: 1.1rem;
}

.profile-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.detail-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.detail-card h2 {
  margin: 0 0 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.detail-item {
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.detail-item label {
  font-weight: bold;
  width: 120px;
  color: #666;
}

.detail-item span {
  color: #333;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #666;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  font-size: 0.9rem;
  padding: 0.5rem;
  background-color: #f8d7da;
  border-radius: 4px;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  width: 100%;
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #007BF6;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.update-btn {
  background-color: #007BF6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.logout-btn:hover {
  background-color: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 53, 69, 0.2);
}

.logout-btn:active {
  transform: translateY(0);
}

.logout-btn i {
  font-size: 18px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style> 