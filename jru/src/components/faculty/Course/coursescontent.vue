<template>
  <div class="course-content-container">
    <!-- Header Section -->
    <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />

    <div class="course-content">
      <!-- Sidebar Section -->
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />

      <!-- Main Course Content Section -->
      <main class="course-main">
        <div class="course-header">
          <h2>{{ courseName || "Loading..." }} - Course Content</h2> 
          <button class="add-btn" @click="openAddMaterialModal">+</button>
        </div>

        <div class="course-hero">
          <div class="content-left">
            <section class="announcements">
              <h3>Students Enrolled:</h3>
              <button class="view-btn" @click="viewStudents">View All</button>
            </section>
          </div>

          <div class="content-right">
            <section class="course-materials">
              <h3>Course Materials</h3>

              <div v-if="loading">
                <p>Loading materials...</p>
              </div>

              <div v-else-if="courseContent.length === 0">
                <p>No materials available.</p>
              </div>

              <!-- ✅ Clicking a material now redirects to MaterialDetail.vue -->
              <div v-for="(material, index) in courseContent" 
                   :key="index" 
                   class="material-card" 
                   @click="viewMaterial(material)">

                <h4>{{ material.user_name }} posted a material:</h4>
                <p>{{ material.title }}</p>

              </div>
            </section>
          </div>
        </div>
      </main>
    </div>

    <!-- Add Material Modal -->
    <AddMaterialModal 
      :courseId="courseId"  
      v-if="showAddMaterialModal" 
      @close="showAddMaterialModal = false" 
      @add-material="addMaterial" 
    />
  </div>
</template>

<script>
import axios from "axios";
import Header from "@/components/faculty/header.vue";
import Sidebar from "@/components/faculty/SideBar.vue";
import AddMaterialModal from "@/components/faculty/Course/AddMaterialModal.vue";

export default {
  components: {
    Header,
    Sidebar,
    AddMaterialModal
  },
  data() {
    return {
      courseId: this.$route.params.courseId,
      courseName: "",
      courseContent: [],
      loading: true,
      isSidebarCollapsed: false,
      showAddMaterialModal: false
    };
  },
  methods: {
  async fetchCourseContent() {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/course_materials/${this.courseId}`);
      this.courseName = response.data.course_name;
      this.courseContent = response.data.materials;
      this.loading = false;
    } catch (error) {
      console.error("Error fetching course content:", error);
      this.loading = false;
    }
  },
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  },
  openAddMaterialModal() {
    this.showAddMaterialModal = true;
  },
  addMaterial(newMaterial) {
    this.courseContent.push(newMaterial);
  },
  viewMaterial(material) {
    console.log("Material object:", material); // Debug log

    if (!material || !material.content_id) {
      console.error("Error: materialId is missing", material);
      return;
    }

    this.$router.push({
      name: "MaterialDetail",
      params: { courseId: this.courseId, materialId: material.content_id }
    });
  },
  viewStudents() {
    this.$router.push({ name: "StudentList", params: { courseId: this.courseId } });
  }
  },
  mounted() {
    this.fetchCourseContent();
  }
};
</script>

<style scoped>
.course-content-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.course-content {
  display: flex;
  flex: 1;
}

.course-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Course Header */
.course-header {
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 20px;
  background-color: #D9D9D9;
  position: relative;
}
/* Add Material Button */
.add-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background-color: #2c3e50;
  color: white;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-btn:hover {
  background-color: #1a252f;
}

.course-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
}

.course-sections ul {
  list-style: none;
  padding-left: 0;
}

.course-sections li {
  font-size: 1.1rem;
  color: #181818;
  margin-bottom: 0.5rem;
}

/* Main Content Layout */
.course-hero {
  display: flex;
  flex: 1;
  overflow: auto; /* Allow scrolling in the course-hero section */
  max-height: 60vh; /* Adjust as needed */
}

/* Left Panel */
.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  width: 25%;
  overflow: auto;
}

/* Right Panel */
.content-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 2;
  width: 50%;
  padding-left: 2rem;
  overflow: auto;
}

/* Course Materials */
.course-materials {
  display: flex;
  flex-direction: column;
}

.material-cards {
  display: grid;
  gap: 1.5rem;
}

.material-card {
  background-color: #D9D9D9;
  border-radius: 8px;
  height: 80px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 7px;

}
.material-card h4 {
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}
.material-card p {
  font-size: 1rem;
  color: #666;
}
.material-card:hover {
  transform: translateY(-5px);
}

.material-card i {
  font-size: 1.5rem;
  color: #2c3e50;
}

/* Announcements & Assignments */
.announcements {
  background-color: #D9D9D9;
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  color: #333;
}

.card-header h4 {
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.card-body {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

.announcements h3,
.assignments h3 {
  font-size: 17px;
  font-weight: 600;
  color: #000000d2;
}

.announcements ul,
.assignments ul {
  list-style: none;
  padding-left: 0;
  
}

.announcements li,
.assignments li {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 0.5rem;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.3rem;
  color: #333;
}

.form-group input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group input::placeholder {
  color: #aaa;
}

/* Section Titles */
.course-materials h3,
.quizzes h3 {
  font-size: 1.5rem;
  color: #2c3e50;
}
.student-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-btn {
  background-color: #2c3e50;
  color: rgb(255, 255, 255);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
}

.view-btn:hover {
  background-color: #1a252f;
}
/* Responsive Design */
@media (max-width: 768px) {
  .course-content {
    flex-direction: column;
  }

  .content-left,
  .content-right {
    padding-left: 0;
    padding-right: 0;
    flex: none;
  }

  .content-right {
    padding-left: 0;
  }
}
</style>