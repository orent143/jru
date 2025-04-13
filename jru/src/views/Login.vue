<template>
    <div class="login-container">
        <div class="login-box">
            <div class="logo">
                <span class="logo-text">JRU</span>
            </div>
            <h2>Login</h2>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <input 
                        type="email" 
                        v-model="email" 
                        placeholder="Email"
                        required
                        :disabled="loading"
                    >
                </div>
                <div class="form-group">
                    <input 
                        type="password" 
                        v-model="password" 
                        placeholder="Password"
                        required
                        :disabled="loading"
                    >
                </div>
                <button type="submit" class="login-btn" :disabled="loading">
                    <span v-if="loading" class="loading-spinner"></span>
                    {{ loading ? "Please wait..." : "Login" }}
                </button>
            </form>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <div class="forgot-password">
                <a href="#">Forgot Password?</a>
            </div>
            <div class="back-home">
                <router-link to="/">Back to Home</router-link>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'Login',
    data() {
        return {
            email: '',
            password: '',
            loading: false,
            errorMessage: ''
        }
    },
    methods: {
        async handleLogin() {
            this.loading = true;
            this.errorMessage = '';

            try {
                const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                    email: this.email,
                    password: this.password
                });

                console.log("🔹 Backend Response:", response.data);

                if (response.data.access_token) {
                    console.log("Login successful, storing user data...");

                    localStorage.setItem('tempUserData', JSON.stringify({
                        user_id: response.data.user_id,
                        name: response.data.name,
                        email: response.data.email,
                        role: response.data.role,
                        access_token: response.data.access_token,
                        courses: response.data.courses
                    }));

                    this.$router.push({
                        name: 'VerifyCode',
                        query: { email: this.email }
                    }).catch(err => console.error("Navigation Error:", err));
                } else {
                    console.log("Unexpected response:", response.data);
                    this.errorMessage = "Unexpected response. Please try again.";
                }
            } catch (error) {
                console.error(" Login error:", error.response ? error.response.data : error);
                this.errorMessage = error.response?.data?.detail || "Invalid email or password";
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to bottom, #002244 50%, #ffffff 50%);
}

.login-box {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
}

.logo-text {
    font-family: 'Inknut Antiqua', serif;
    font-size: 40px;
    font-weight: bolder;
    color: #002244;
    margin-bottom: 1rem;
    display: block;
}

h2 {
    color: #002244;
    margin-bottom: 2rem;
}

.form-group {
    margin-bottom: 1rem;
}

input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    margin-bottom: 1rem;
}

input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.login-btn {
    width: 100%;
    padding: 12px;
    background-color: #002244;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
    position: relative;
}

.login-btn:hover {
    background-color: #007BF6;
}

.login-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error-message {
    color: #dc3545;
    margin-top: 1rem;
}

.forgot-password {
    margin-top: 1rem;
}

.forgot-password a {
    color: #007BF6;
    text-decoration: none;
}

.back-home {
    margin-top: 1rem;
}

.back-home a {
    color: #002244;
    text-decoration: none;
}

.back-home a:hover {
    color: #007BF6;
}
</style>
