<template>
  <div class="course-content-container">
    <Header :student="student" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="course-main" v-if="course">
        <div class="course-header">
          <h2>{{ course.course_name }} - Course Content</h2>
        </div>

        <div class="course-hero">
          <div class="content-left">
            <section class="announcements">
              <h3>Announcements</h3>
              <ul>
                
              </ul>
            </section>
          </div>
          <div class="content-right">
            <section class="course-materials">
              <h3>Course Materials</h3>
              <div class="material-cards">
                <div v-for="material in courseMaterials" 
                     :key="material.content_id"
                     class="material-card"
                     @click="navigateToMaterial(material.content_id)">
                  <div class="card-header">
                    <h4>{{ material.title }}</h4>
                    <p>{{ material.description }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Header from '@/components/student/Header.vue';
import Sidebar from '@/components/student/Sidebar.vue';
import axios from 'axios';

export default {
  components: {
    Header,
    Sidebar
  },
  props: ['courseId'],
  data() {
    return {
      student: {},
      courses: [],
      course: null,
      courseMaterials: [],
      studentId: null
    };
  },
  async created() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'student') {
      this.studentId = storedUser.user_id;
      await this.fetchCourseMaterials();
    }
  },
  watch: {
    courseId: {
      handler() {
        this.fetchCourseMaterials();
      },
      immediate: true
    }
  },
  methods: {
    async fetchCourseMaterials() {
      if (!this.studentId || !this.courseId) return;
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/student_course_content/${this.studentId}/${this.courseId}`
        );

        console.log("Fetched Data:", response.data); // Debugging

        this.courseMaterials = response.data.content || []; // ✅ Use `content` from API
        this.course = response.data.course || { course_name: `Course ${this.courseId}` }; // ✅ Ensure `course` is assigned properly
      } catch (error) {
        console.error("Error fetching course content:", error);
      }
    },
  
    navigateToMaterial(materialId) {
      console.log("Navigating to Material:", materialId, "Course:", this.courseId);
      this.$router.push({ 
        name: 'StudentMaterialDetail', 
        params: { courseId: this.courseId, materialId } 
      });
    },
    getMaterialUrl(filePath) {
      return `http://127.0.0.1:8000/${filePath}`;
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

.course-header {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 20px;
  background-color: #D9D9D9;
}

.course-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #000000;
}

.course-hero {
  display: flex;
  flex: 1;
  overflow: auto;
  max-height: 60vh;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  width: 50%;
  padding-right: 2rem;
  overflow: auto;
}

.announcements {
  background-color: #D9D9D9;
  padding: 1rem;
  border-radius: 8px;
}

.announcements h3 {
  font-size: 1.5rem;
  color: #333;
}

.announcements ul {
  list-style-type: none;
  padding-left: 0;
}

.announcements li {
  margin-bottom: 1rem;
}

.announcements h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.announcements p {
  font-size: 1rem;
  color: #666;
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 2;
  width: 50%;
  padding-left: 2rem;
  overflow: auto;
}

.course-materials {
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
  flex-direction: row;
  padding: 1rem;
  display: flex;
  align-items: center;
}

.material-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  color: #333;
}

.card-header h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.card-body {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

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