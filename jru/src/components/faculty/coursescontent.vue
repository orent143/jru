<template>
  <div class="course-content-container">
    <Header :teacher="teacher" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="course-main" v-if="course">
        <!-- Course Header -->
        <div class="course-header">
          <h2>{{ course.name }} - Course Content</h2>
          <button class="add-btn" @click="showAddMaterialModal = true">+</button>
          <div class="course-sections">
            <ul>
              <li v-for="section in course.sections" :key="section.id">
                {{ section.name }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Course Hero Section -->
        <div class="course-hero">
          <div class="content-left">
            <section class="announcements">
              <h3>Students Enrolled:</h3>
              <ul>
                <li v-for="student in course.students" :key="student.id">
                  {{ student.name }}
                </li>
              </ul>
            </section>
          </div>

          <div class="content-right">
            <section class="course-materials">
              <h3>Course Materials</h3>
              <div class="material-cards">
                <div v-for="material in course.materials" :key="material.id" class="material-card" @click="navigateToMaterial(material)">
                  <div class="card-header">
                    <i class="pi pi-clipboard"></i>
                    <h4>Teacher posted a new material:</h4>
                    {{ material.title }}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>

    <!-- Add Material Modal -->
    <AddMaterialModal v-if="showAddMaterialModal" @close="showAddMaterialModal = false" @add-material="addMaterial" />
  </div>
</template>

<script>
import Header from './header.vue';
import Sidebar from './SideBar.vue';
import AddMaterialModal from './AddMaterialModal.vue';

export default {
  components: {
    Header,
    Sidebar,
    AddMaterialModal
  },
  data() {
    return {
      teacher: { name: 'Professor Smith' },
      searchQuery: '',
      isSidebarCollapsed: false,
      showAddMaterialModal: false,
      courses: [
        {
          id: 1,
          name: 'ITELECT4',
          sections: [{ id: 1, name: 'BSCS-3A' }],
          materials: [
            {
              id: 1,
              title: 'Introduction to Programming',
              description: 'Basic programming concepts and logic building',
              datePosted: '2024-02-01',
              dueDate: '2024-02-15',
              status: 'Not started',
              attachments: [{ id: 1, name: 'intro_programming.pdf', type: 'pdf' }],
              submittedFiles: [],
              comments: []
            },
            {
              id: 2,
              title: 'Data Types and Variables',
              description: 'Understanding primitive data types',
              datePosted: '2024-02-03',
              dueDate: '2024-02-17',
              status: 'Not submitted',
              attachments: [],
              submittedFiles: [],
              comments: []
            }
          ],
          
          students: [
            { id: 1, name: 'John Smith' },
            { id: 2, name: 'Alice Johnson' }
          ]
        },
        {
          id: 2,
          name: 'ITELECT4',
          sections: [{ id: 2, name: 'BSCS-3B' }],
          materials: [
            {
              id: 1,
              title: 'Introduction to Programming',
              description: 'Basic programming concepts and logic building',
              datePosted: '2024-02-01',
              dueDate: '2024-02-15',
              status: 'Not started',
              attachments: [{ id: 1, name: 'intro_programming.pdf', type: 'pdf' }],
              submittedFiles: [],
              comments: []
            },
            {
              id: 2,
              title: 'Data Types and Variables',
              description: 'Understanding primitive data types',
              datePosted: '2024-02-03',
              dueDate: '2024-02-17',
              status: 'Not submitted',
              attachments: [],
              submittedFiles: [],
              comments: []
            }
          ],
          
          students: [
            { id: 1, name: 'John Smith' },
            { id: 2, name: 'Alice Johnson' }
          ]
        }
      ]
    };
  },
  computed: {
    course() {
      const courseId = parseInt(this.$route.params.courseId);
      const foundCourse = this.courses.find(c => c.id === courseId);

      if (!foundCourse) {
        this.$router.push('/faculty-dashboard'); // Redirect to faculty dashboard if course is not found
        return null;
      }
      return foundCourse;
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    navigateToMaterial(material) {
      this.$router.push({
        name: 'FacultyCourseMaterialDetail',
        params: {
          courseId: this.$route.params.courseId,
          materialId: material.id.toString()
        }
      });
    },
    addMaterial(newMaterial) {
      this.course.materials.push(newMaterial);
      this.showAddMaterialModal = false; // Close the modal after adding the material
    }
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
}

.material-card:hover {
  transform: translateY(-5px);
}

.material-card i {
  font-size: 1.5rem;
  color: #2c3e50;
}

/* Announcements & Assignments */
.announcements,
.assignments {
  background-color: #D9D9D9;
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
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