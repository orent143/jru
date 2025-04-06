<template>
  <div id="app">
    <!-- Header Section -->
    <header class="header">
      <div class="logo">
        <span class="logo-text">JRU</span>
      </div>

      <div class="sign-in-container">
        <div class="sign-in-button">
          <button class="sign-in-btn" @click="navigateToLogin">Sign In</button>
        </div>
      </div>

      <nav class="nav">
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#privacy">Privacy Policy</a></li>
          <li><a href="#terms">Terms & Conditions</a></li>
          <li><a href="#contact">Contact Us</a></li>
        </ul>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero">

    </section>

    <!-- About Section -->
    <section id="about" class="info-section">
      <div class="section-container">
        <h2 class="section-title">About Us</h2>
        <div class="section-content">
          <div class="about-grid">
            <div class="about-card">
              <i class="pi pi-users card-icon"></i>
              <h3>Our Community</h3>
              <p>8,000+ students and 350+ faculty members creating a vibrant learning environment.</p>
            </div>
            <div class="about-card">
              <i class="pi pi-book card-icon"></i>
              <h3>Academic Excellence</h3>
              <p>Pioneering programs including Psychology, Business, Computer Science, and more.</p>
            </div>
            <div class="about-card">
              <i class="pi pi-globe card-icon"></i>
              <h3>Digital Innovation</h3>
              <p>Embracing modern e-learning platforms for hybrid and accessible education.</p>
            </div>
          </div>
          <div class="about-text">
            <p>
              Established in 1965 by visionary educator Juanito "Jack" Roberto, J. Roberto University (JRU) stands as a beacon of progressive education in the Philippines. Our commitment to critical inquiry, social awareness, and academic innovation has shaped generations of leaders.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Privacy Policy Section -->
    <section id="privacy" class="info-section accent-bg">
      <div class="section-container">
        <h2 class="section-title">Privacy Policy</h2>
        <div class="policy-grid">
          <div class="policy-card">
            <i class="pi pi-shield card-icon"></i>
            <h3>Data Protection</h3>
            <p>We implement robust security measures to protect your personal information.</p>
          </div>
          <div class="policy-card">
            <i class="pi pi-user card-icon"></i>
            <h3>Your Rights</h3>
            <p>Access, correct, and control your personal data at any time.</p>
          </div>
          <div class="policy-card">
            <i class="pi pi-lock card-icon"></i>
            <h3>Security First</h3>
            <p>Advanced encryption and regular security audits to keep your data safe.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Terms & Conditions Section -->
    <section id="terms" class="info-section">
      <div class="section-container">
        <h2 class="section-title">Terms & Conditions</h2>
        <div class="terms-grid">
          <div class="terms-card">
            <h3><i class="pi pi-check-circle"></i> Acceptable Use</h3>
            <ul>
              <li>Academic and university-related activities only</li>
              <li>Respect intellectual property rights</li>
              <li>No cheating or plagiarism</li>
            </ul>
          </div>
          <div class="terms-card">
            <h3><i class="pi pi-user-plus"></i> User Responsibilities</h3>
            <ul>
              <li>Keep login credentials confidential</li>
              <li>Report unauthorized access</li>
              <li>Maintain academic integrity</li>
            </ul>
          </div>
          <div class="terms-card">
            <h3><i class="pi pi-file"></i> Content Policy</h3>
            <ul>
              <li>All materials are JRU property</li>
              <li>No unauthorized distribution</li>
              <li>Regular policy updates</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Us Section -->
    <section id="contact" class="info-section accent-bg">
      <div class="section-container">
        <h2 class="section-title">Contact Us</h2>
        <div class="contact-grid">
          <div class="contact-card">
            <i class="pi pi-envelope card-icon"></i>
            <h3>Email Us</h3>
            <p>support@jru.edu.ph</p>
          </div>
          <div class="contact-card">
            <i class="pi pi-phone card-icon"></i>
            <h3>Call Us</h3>
            <p>+63 912 345 6789</p>
          </div>
          <div class="contact-card">
            <i class="pi pi-map-marker card-icon"></i>
            <h3>Visit Us</h3>
            <p>Metro Manila, Philippines</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Meet the Team Section -->
    <section id="team" class="team-section">
      <div class="section-container">
        <h2 class="section-title">Meet the Team</h2>
        <div class="team-grid">
          <div class="team-card" v-for="(member, index) in teamMembers" :key="index">
  <div class="member-photo">
    <i class="pi pi-user"></i>
  </div>
  <div class="member-info">
    <h3>{{ member.name }}</h3>
    <p class="member-role">{{ member.role }}</p>
    <div class="member-social">
      <i class="pi pi-linkedin"></i>
      <i class="pi pi-twitter"></i>
      <i class="pi pi-envelope"></i>
    </div>
  </div>
</div>

        </div>
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
      teamMembers: [
      { name: "Geric Gultiano", role: "Frontend Developer" },
      { name: "Myk Palado", role: "Lead Developer" },
      { name: "Angelo Yaco", role: "Backend Developer" },
      { name: "Gi Linghon", role: "Project Manager" },
      { name: "Lorenz Papacoy", role: "QA Specialist" }
    ],
      // Add more team members as needed
    };
  },
  methods: {
    navigateToLogin() {
      this.$router.push('/login'); // Navigate to the login page
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
  box-shadow: 0 4px 8px rgb(0, 0, 0);
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.518);
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
/* Info Sections */
.info-section {
  padding: 60px 20px;
  text-align: center;
  background-color: #f9f9f9;
  color: #002244;
}

.info-section h2 {
  font-size: 32px;
  margin-bottom: 20px;
  font-weight: bold;
}

.info-section p {
  font-size: 18px;
  max-width: 800px;
  margin: 0 auto;
}

/* Meet the Team Section */
.team-section {
  background-color: #ffffff;
  padding: 60px 20px;
  text-align: center;
  color: #002244;
}

.team-section h2 {
  font-size: 32px;
  margin-bottom: 40px;
  font-weight: bold;
}

.team-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
}

.team-member {
  background-color: #f1f1f1;
  border-radius: 15px;
  padding: 20px;
  width: 200px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.member-photo {
  background-color: #d9d9d9;
  height: 150px;
  width: 150px;
  border-radius: 50%;
  margin: 0 auto 15px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.team-member h3 {
  margin: 10px 0 5px;
  font-size: 20px;
  font-weight: 600;
}

.team-member p {
  font-size: 16px;
  color: #555;
}

/* Updated Section Styles */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 3rem;
  color: #002244;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: #007BF6;
  border-radius: 2px;
}

.accent-bg {
  background-color: #f8f9fa;
}

/* About Section */
.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.about-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.about-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  font-size: 2.5rem;
  color: #007BF6;
  margin-bottom: 1rem;
}

.about-text {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
}

/* Policy Grid */
.policy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.policy-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.policy-card:hover {
  transform: translateY(-5px);
}

/* Terms Grid */
.terms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.terms-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.terms-card h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #007BF6;
  margin-bottom: 1rem;
}

.terms-card ul {
  list-style: none;
  padding: 0;
}

.terms-card li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.terms-card li::before {
  content: "•";
  color: #007BF6;
  position: absolute;
  left: 0;
}

/* Contact Grid */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.contact-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
}

/* Team Grid */
.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  justify-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.team-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  width: 100%;
  max-width: 300px;
}

/* Position the last two cards in the center */
.team-card:nth-child(4),
.team-card:nth-child(5) {
  grid-column: auto;
}

/* Create a new row for the last two cards */
.team-grid::after {
  content: "";
  grid-column: 1 / -1;
  height: 2rem;
}

/* Container for the last two cards */
.team-grid .team-card:nth-child(n+4) {
  grid-row: 2;
}

/* Adjust the last two cards positioning with proper gaps */
.team-grid .team-card:nth-child(4) {
  grid-column: 1 / 2;
  justify-self: end;
  margin-right: -4rem;
}

.team-grid .team-card:nth-child(5) {
  grid-column: 3 / 4;
  justify-self: start;
  margin-left: -4rem;
}

/* Add hover effect */
.team-card:hover {
  transform: translateY(-5px);
}

.member-photo {
  height: 200px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-photo i {
  font-size: 4rem;
  color: #007BF6;
}

.member-info {
  padding: 1.5rem;
  text-align: center;
}

.member-role {
  color: #666;
  margin: 0.5rem 0;
}

.member-social {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.member-social i {
  font-size: 1.2rem;
  color: #007BF6;
  cursor: pointer;
  transition: color 0.3s ease;
}

.member-social i:hover {
  color: #002244;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .team-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .team-grid .team-card:nth-child(n+4) {
    grid-row: auto;
  }

  .team-grid .team-card:nth-child(4),
  .team-grid .team-card:nth-child(5) {
    grid-column: 1;
    justify-self: center;
    margin: 0;
  }
}
</style>
