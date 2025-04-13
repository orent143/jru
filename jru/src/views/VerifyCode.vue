<template>
    <div class="verify-container">
        <div class="verify-box">
            <div class="logo">
                <span class="logo-text">JRU</span>
            </div>
            <h2>Verify Your Login</h2>
            <p class="instruction">Please enter the verification code sent to your email</p>
            <form @submit.prevent="handleVerification">
                <div class="form-group">
                    <input 
                        type="text" 
                        v-model="verificationCode" 
                        placeholder="Enter 6-digit code"
                        maxlength="6"
                        pattern="[0-9]*"
                        required
                    >
                </div>
                <button type="submit" class="verify-btn" :disabled="loading">
                    {{ loading ? "Verifying..." : "Verify Code" }}
                </button>
            </form>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <div class="timer" v-if="countdown > 0">
                Code expires in: {{ countdown }} seconds
            </div>
            <div class="back-login">
                <a href="#" @click.prevent="goBackToLogin">Back to Login</a>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { useToast } from "vue-toastification";  

export default {
    name: 'VerifyCode',
    data() {
        return {
            verificationCode: '',
            loading: false,
            errorMessage: '',
            countdown: 300, 
            timer: null,
            email: this.$route.query.email || ''
        };
    },
    created() {
        if (!this.email) {
            this.errorMessage = "Missing email. Please go back and log in again.";
            return;
        }
        this.startCountdown();
    },
    beforeUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    methods: {
        startCountdown() {
            this.timer = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                } else {
                    clearInterval(this.timer);
                    this.errorMessage = 'Verification code has expired. Please login again.';
                    this.verificationCode = '';
                }
            }, 1000);
        },
        async handleVerification() {
            if (!this.email) {
                this.errorMessage = "Email is missing. Please log in again.";
                return;
            }

            const code = this.verificationCode.trim();
            if (!/^[0-9]{6}$/.test(code)) {
                this.errorMessage = 'Please enter a valid 6-digit code.';
                return;
            }

            this.loading = true;
            this.errorMessage = '';

            try {
                const response = await axios.post(
                    `http://127.0.0.1:8000/api/verify-code/`, 
                    { email: this.email, code: parseInt(code, 10) }
                );

                if (response.data.message === "Verification successful") {
                    let userData = JSON.parse(localStorage.getItem('tempUserData'));
                    if (!userData) {
                        this.errorMessage = "Session expired. Please log in again.";
                        this.$router.push('/login');
                        return;
                    }

                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.removeItem('tempUserData');

                    switch (userData.role) {
                        case 'student': this.$router.push('/student-dashboard'); break;
                        case 'faculty': this.$router.push('/faculty-dashboard'); break;
                        case 'admin': this.$router.push('/admin-dashboard'); break;
                        default: this.$router.push('/');
                    }

                    this.toast.success("Verification successful!");
                }
            } catch (error) {
                this.errorMessage = error.response?.data?.detail || "Verification failed. Please try again.";

                this.toast.error("Verification failed. Please try again.");
            } finally {
                this.loading = false;
            }
        },
        goBackToLogin() {
            localStorage.removeItem('tempUserData'); 
            this.$router.push('/login');
        }
    },
    mounted() {
        console.log("Email from query:", this.$route.query.email);
    },
    setup() {
        const toast = useToast();  
        return { toast };  
    }
};
</script>


<style scoped>
.verify-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to bottom, #002244 50%, #ffffff 50%);
}

.verify-box {
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
    margin-bottom: 1rem;
}

.instruction {
    color: #666;
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
    text-align: center;
    letter-spacing: 4px;
}

.verify-btn {
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

.verify-btn:hover {
    background-color: #007BF6;
}

.verify-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.error-message {
    color: #dc3545;
    margin-top: 1rem;
}

.timer {
    color: #666;
    margin-top: 1rem;
    font-size: 0.9rem;
}

.back-login {
    margin-top: 1rem;
}

.back-login a {
    color: #002244;
    text-decoration: none;
}

.back-login a:hover {
    color: #007BF6;
}
</style> 