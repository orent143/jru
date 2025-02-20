<template>
    <div class="course-content-container">
      <Header :teacher="teacher" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
      <div class="course-content">
        <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
        <main class="course-main" v-if="course">
          <div class="course-header">
            <h2>{{ course.name }} - Examinations</h2>
            <button class="add-btn" @click="showAddExamModal = true">+</button>
          </div>
  
          <div class="course-hero">
            <div class="content-left">
              <section class="exam-summary">
                <h3>Upcoming Exams:</h3>
                <ul>
                  <li v-for="exam in upcomingExams" :key="exam.exam_id">
                    {{ exam.title }} - Date: {{ exam.exam_date }}
                  </li>
                </ul>
              </section>
            </div>
  
            <div class="content-right">
              <section class="exams">
                <h3>All Examinations</h3>
                <div class="material-cards">
                  <div v-for="exam in course.exams" :key="exam.exam_id"
                       class="material-card" @click="navigateToExam(exam)">
                    <div class="card-header">
                      <i class="pi pi-file"></i>
                      <h4>{{ exam.title }}</h4>
                    </div>
                    <div class="card-status">
                      Scheduled for: {{ exam.exam_date }}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
  
      <!-- ✅ Add Exam Modal -->
      <AddExamModal v-if="showAddExamModal"
                    :courseId="this.$route.params.courseId"
                    @close="showAddExamModal = false"
                    @add-exam="fetchExams" />
    </div>
  </template>
  
  <script>
  import Header from '../header.vue';
  import Sidebar from '../SideBar.vue';
  import AddExamModal from '@/components/faculty/Exam/AddExamModal.vue';
  import axios from 'axios';
  
  export default {
    components: { Header, Sidebar, AddExamModal },
    data() {
      return {
        teacher: {},
        searchQuery: '',
        isSidebarCollapsed: false,
        course: null,
        showAddExamModal: false,
        upcomingExams: [],
      };
    },
    async created() {
      await this.fetchExams();
    },
    methods: {
      async fetchExams() {
        try {
          const courseId = this.$route.params.courseId; // Get course ID from route
          const response = await axios.get(`http://127.0.0.1:8000/api/exams/${courseId}`);
          
          this.course = {
            name: response.data.course_name,
            exams: response.data.exams,
          };
  
          // Filter upcoming exams (example: filter by future dates)
          this.upcomingExams = this.course.exams.filter(exam => {
            return new Date(exam.exam_date) >= new Date();
          });
        } catch (error) {
          console.error('Error fetching exams:', error);
        }
      },
      navigateToExam(exam) {
        this.$router.push(`/exam/${exam.exam_id}`);
      },
    },
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

/* Course Hero Layout */
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
    width: 25%;
    overflow: auto;
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

/* Material Cards */
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

.exam-summary {
    background-color: #D9D9D9;
    padding: 1rem;
    border-radius: 8px;
    width: 100%;
    position: relative;
}

.exam-summary h3 {
    font-size: 17px;
    font-weight: 600;
    color: #000000d2;
}

.exam-summary ul {
    list-style: none;
    padding-left: 0;
}

.exam-summary li {
    font-size: 1.1rem;
    color: #444;
    margin-bottom: 0.5rem;
}

/* Status Classes */
.card-status {
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.9rem;
}

.status-scheduled {
    background-color: #4CAF50;
    color: white;
}

.status-draft {
    background-color: #FFDD57;
    color: black;
}

.status-completed {
    background-color: #2c3e50;
    color: white;
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
