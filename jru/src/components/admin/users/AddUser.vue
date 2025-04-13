<template>
    <div class="modal" v-if="isVisible" @click.self="closeModal">
        <div class="modal-content">
            <h2>Add New User</h2>
            <form @submit.prevent="confirmSubmit">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        v-model="formData.name"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        v-model="formData.email"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        v-model="formData.password"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="role">Role</label>
                    <select 
                        id="role" 
                        v-model="formData.role"
                        required
                    >
                        <option value="">Select a role</option>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div class="form-group" v-if="formData.role === 'student'">
                    <label for="degree">Degree</label>
                    <input 
                        type="text" 
                        id="degree" 
                        v-model="formData.degree"
                        required
                    >
                </div>
                <div class="modal-actions">
                    <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
                    <button type="submit" class="save-btn">Add User</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
        :show="showConfirmModal"
        title="Confirm User Addition"
        :message="`Are you sure you want to add ${formData.name} as a ${formData.role}?`"
        confirm-text="Add User"
        type="primary"
        @confirm="handleSubmit"
        @cancel="showConfirmModal = false"
    />
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

export default {
    name: 'AddUser',
    components: {
        ConfirmationModal
    },
    props: {
        isVisible: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            formData: {
                name: '',
                email: '',
                password: '',
                role: '',
                degree: ''
            },
            showConfirmModal: false,
            isSubmitting: false
        };
    },
    setup() {
        const toast = useToast();
        return { toast };
    },
    methods: {
        confirmSubmit() {
            if (!this.validateForm()) return;
            this.showConfirmModal = true;
        },
        validateForm() {
            if (!this.formData.name.trim()) {
                this.toast.error('Name is required');
                return false;
            }
            if (!this.formData.email.trim()) {
                this.toast.error('Email is required');
                return false;
            }
            if (!this.formData.password) {
                this.toast.error('Password is required');
                return false;
            }
            if (!this.formData.role) {
                this.toast.error('Role is required');
                return false;
            }
            if (this.formData.role === 'student' && !this.formData.degree.trim()) {
                this.toast.error('Degree is required for students');
                return false;
            }
            return true;
        },
        async handleSubmit() {
            if (this.isSubmitting) return;
            this.isSubmitting = true;
            
            try {
                const payload = {
                    name: this.formData.name.trim(),
                    email: this.formData.email.trim(),
                    password: this.formData.password,
                    role: this.formData.role
                };

                if (this.formData.role === 'student') {
                    payload.degree = this.formData.degree?.trim();
                }

                const response = await axios.post('http://127.0.0.1:8000/api/users/', payload);

                this.toast.success(`${this.formData.name} has been added successfully as a ${this.formData.role}!`);
                this.$emit('user-added');
                this.closeModal();
                this.resetForm();
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 422) {
                        const validationErrors = error.response.data.detail;
                        this.toast.error(`Validation Error: ${validationErrors.map(err => err.msg).join(', ')}`);
                    } else if (error.response.status === 409) {
                        this.toast.error(`A user with this email already exists.`);
                    } else {
                        this.toast.error(`Error: ${error.response.data.detail || 'An unexpected error occurred.'}`);
                    }
                } else {
                    this.toast.error('Failed to connect to the server. Please try again.');
                }
                console.error('Error adding user:', error);
            } finally {
                this.isSubmitting = false;
                this.showConfirmModal = false;
            }
        },
        closeModal() {
            this.$emit('close');
            this.resetForm();
        },
        resetForm() {
            this.formData = {
                name: '',
                email: '',
                password: '',
                role: '',
                degree: ''
            };
            this.showConfirmModal = false;
        }
    }
};
</script>


<style scoped>
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
    z-index: 1000;
}

.modal-content {
    background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  position: relative;
  
}

.modal-content h2 {
    font-size: 25px;
  font-family: 'Arial', sans-serif;
  font-weight: 1000;
  color: #000000;
  padding-right: 30px;
}

.form-group label {
    display: flex;
  flex-direction: column;
  font-weight: 600;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  margin-bottom: 5px;
  color: #272727;
}

.form-group input,
.form-group select {
    padding: 10px;
  font-size: 14px;
  border-radius: 12px;
  width: 100%;
  border: 1px solid #ccc;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 30px;
}

.modal-actions button {
    padding: 8px 12px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  
}

.save-btn {
    padding: 10px 20px;
  background-color: #007BF6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.save-btn:hover {
    background: #0056b3;
}

.cancel-btn {
    padding: 10px 20px;
  background-color:#5a6268;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.cancel-btn:hover {
    background: #272727;
}
</style>