<template>
    <div class="modal" v-if="isVisible" @click.self="closeModal">
        <div class="modal-content">
            <h2>Add New User</h2>
            <form @submit.prevent="handleSubmit">
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
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification'; // Import toast

export default {
    name: 'AddUser',
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
                degree: ''  // ✅ Added here
            }
        };
    },
    setup() {
        const toast = useToast(); // Initialize toast

        return { toast };
    },
    methods: {
        async handleSubmit() {
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

                this.toast.success('User added successfully!'); // Success toast
                this.$emit('user-added');
                this.closeModal();
                this.resetForm();
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 422) {
                        const validationErrors = error.response.data.detail;
                        this.toast.error(`Validation Error: ${validationErrors.map(err => err.msg).join(', ')}`); // Error toast
                    } else {
                        this.toast.error(`Error: ${error.response.data.detail || 'An unexpected error occurred.'}`); // Error toast
                    }
                } else {
                    this.toast.error('Failed to connect to the server. Please try again.'); // Error toast
                }
                console.error('Error adding user:', error);
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
                degree: ''  // ✅ Reset degree too

            };
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