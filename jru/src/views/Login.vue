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
                    >
                </div>
                <div class="form-group">
                    <input 
                        type="password" 
                        v-model="password" 
                        placeholder="Password"
                        required
                    >
                </div>
                <button type="submit" class="login-btn" :disabled="loading">
                    {{ loading ? "Logging in..." : "Login" }}
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

    console.log("🔍 Sending login request:", this.email, this.password);  // Debugging

    try {
        const response = await axios.post('http://127.0.0.1:8000/api/login/', {
            email: this.email,
            password: this.password
        });

        console.log("✅ Login successful, user data:", response.data); // Debugging

        localStorage.setItem('user', JSON.stringify(response.data));
        switch (response.data.role) {
            case 'student': this.$router.push('/student-dashboard'); break;
            case 'faculty': this.$router.push('/faculty-dashboard'); break;
            case 'admin': this.$router.push('/admin-dashboard'); break;
            default: this.$router.push('/dashboard');
        }
    } catch (error) {
        console.error("❌ Login error:", error.response ? error.response.data : error);
        this.errorMessage = "Invalid email or password";
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
}

.login-btn:hover {
    background-color: #007BF6;
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
