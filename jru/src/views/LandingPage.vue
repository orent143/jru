<template>
  <div id="app">
    <!-- Header Section -->
    <header class="header">
      <div class="logo">
        <span class="logo-text">JRU</span> <!-- Logo Text -->
      </div>

      <!-- Sign In Button with Hover-Based Role Options -->
      <div class="sign-in-container">
        <div class="sign-in-button">
          <button class="sign-in-btn" @click="toggleDropdown">Sign In</button>
          <!-- Hover-based Role Selection -->
          <div class="role-options" v-if="showDropdown">
            <a href="#student" class="role-option" @click.prevent="selectRole('student')">Student</a>
            <a href="#faculty" class="role-option" @click.prevent="selectRole('faculty')">Faculty</a>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="nav">
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#programs">Privacy Policy</a></li>
          <li><a href="#admissions">Terms & Conditions</a></li>
          <li><a href="#contact">Contact Us</a></li>
        </ul>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
      </div>
    </section>
  </div>
</template>


<script>
export default {
  name: "App",
  data() {
    return {
      showDropdown: false, // Controls the visibility of the role options
      roleSelected: null,
      email: "",
      password: "",
    };
  },
  methods: {
  toggleDropdown() {
    this.showDropdown = !this.showDropdown; // Toggle the dropdown visibility
  },
  selectRole(role) {
    this.roleSelected = role; // Set the selected role
    this.showDropdown = false; // Hide the dropdown after selecting a role

    if (role === 'student') {
      this.$router.push({ name: 'StudentDashboard' }); // Navigate to student dashboard
    }
  },

    scrollToAdmissions() {
      document.getElementById("admissions").scrollIntoView({ behavior: "smooth" });
    },
    handleSignIn() {
      console.log(`Signed in as ${this.roleSelected} with`, this.email, this.password);
      // Here you can add authentication logic
      this.showDropdown = false;  // Hide dropdown after sign-in
    }
  }
};
</script>


<style scoped>
/* General Styles */
/* General Styles */

ul {
  list-style: none;
  padding: 0;
}

button {
  background-color: #F5F5F5;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 10px;
}

button:hover {
  background-color: #F5F5F5;
}

/* Header Section */
/* Header Section */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: 
    url('@/assets/Untitled design (2).jpg') no-repeat top center, /* Top half image */
    #002244; /* Bottom half color */
  background-size: 100% 50%; /* Image takes the top half */
  background-position: top; /* Position the image at the top */
  color: white;
  width: 100%;
  position: relative;
}

/* Logo Styling */
.logo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%; /* Ensure the logo container doesn't affect the header size */
}

.logo-text {
  font-family: 'Inknut Antiqua', serif;
  font-size: 50px; /* Increase the font size to make the logo text bigger */
  font-weight: bolder;
  color: white;
  text-shadow: 
    1px 1px 0 #034694, 
    -1px 1px 0 #034694,
    1px -1px 0 #034694,
    -1px -1px 0 #034694,
    0px 1px 0 #034694,
    0px -1px 0 #034694,
    1px 0px 0 #034694,
    -1px 0px 0 #034694;
  line-height: 1.2; /* Adjust line-height for better spacing */
}


/* Sign In Button */
.sign-in-container {
  position: relative;
  z-index: 2; /* Ensure sign-in button is above the overlay */
}
.sign-in-button {
  position: relative;
  z-index: 3; /* Make sure sign-in button is above the overlay */
}

.sign-in-btn {
  padding: 7px 40px;
  font-size: 17px;
  color: #002244;
  font-weight:bolder;
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.sign-in-btn:hover{
  background-color: #007BF6;
  color: #ffffff;
}
.role-options {
  display: none; /* Initially hidden */
  position: absolute;
  top: 40px; /* Position options below the button */
  left: 0;
  background-color: #D9D9D9;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 10px;
  width: 100%;
  text-align: center;
}

.sign-in-button:hover .role-options {
  display: block; /* Show options on hover */
}

.role-options {
  display: block; /* Will only show when `showDropdown` is true */
}

.role-option {
  display: block;
  padding: 5px;
  font-size: 15px;
  cursor: pointer;
  font-weight: 700;
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: background-color 0.3s ease;
  color: #002244;
}

.role-option:hover {
  background-color: #007bff00;
  color: #007BF6;
}

/* Navigation Styling */
.nav {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  font-weight: bolder;
}

.nav ul {
  display: flex;
  gap: 50px;
  margin-bottom: 4px;
}

.nav li {
  font-size: 18px;
  font-weight: 900;
  font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif
}

.nav a {
  color: white;
  text-decoration: none;
}

.nav a:hover {
  color: #007BF6; /* Change the color on hover */
}
.hero {
  position: relative;
  background: url('@/assets/Untitled design (3).jpg') no-repeat center center;
  background-size: cover;
  height: 100vh;
  color: white;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}


.hero .hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  padding: 20px; /* Add some padding to ensure content doesn't overlap */
}


.icon-container {
  font-size: 80px; /* You can adjust the size to fit your design */
  color: white;
  margin-bottom: 20px;
  z-index: 2; /* Ensure it is on top of any overlay */
  display: flex;
  justify-content: center; /* Align the icon in the center */
  align-items: center;
}


.hero h1 {
  font-family: 'Verdana', sans-serif;
  font-size: 50px;
  font-weight: bolder;
  text-shadow: 1px 1px 0 #034694, -1px 1px 0 #034694, 1px -1px 0 #034694, -1px -1px 0 #034694, 0px 1px 0 #034694, 0px -1px 0 #034694, 1px 0px 0 #034694, -1px 0px 0 #034694;
}

.hero p {
  font-size: 20px;
  margin-bottom: 20px;
  font-family: 'Verdana', sans-serif;
  font-weight: 500;
}

.hero button {
  padding: 15px 30px;
  font-size: 18px;
}

/* Form Container Styling */
.form-container {
  margin-top: 20px;
  text-align: center;
}

.form-container form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container input {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-container button {
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.form-container button:hover {
  background-color: #0056b3;
}

</style>
