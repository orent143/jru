<template>
  <div class="course-content-container">
    <Header :teacher="teacher" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="course-main" v-if="course">
        <div class="course-header">
          <h2>{{ course.name }} - Quizzes</h2>
          <button class="add-btn" @click="showAddQuizModal = true">+</button>
        </div>

        <div class="course-hero">
          <div class="content-left">
            <section class="quiz-summary">
              <h3>Upcoming Quizzes:</h3>
              <ul>
                <li v-for="quiz in upcomingQuizzes" :key="quiz.quiz_id">
                  {{ quiz.title }} - Date: {{ quiz.quiz_date }}
                </li>
              </ul>
            </section>
          </div>

          <div class="content-right">
            <section class="quizzes">
              <h3>All Quizzes</h3>
              <div class="material-cards">
                <div
                  v-for="quiz in course.quizzes"
                  :key="quiz.quiz_id"
                  class="material-card"
                  @click="navigateToQuiz(quiz)"
                >
                  <div class="card-header">
                    <i class="pi pi-file-edit"></i>
                    <h4>{{ quiz.title }}</h4>
                    <i
                      class="pi pi-trash"
                      @click.stop="confirmDeleteQuiz(quiz.quiz_id)"
                      style="cursor: pointer; margin-left: auto;"
                    ></i>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>

    <AddQuizModal
      v-if="showAddQuizModal"
      :courseId="$route.params.courseId"
      @close="showAddQuizModal = false"
      @add-quiz="fetchQuizzes"
    />

    <ConfirmationModal
      :show="showDeleteConfirmation"
      title="Delete Quiz"
      message="Are you sure you want to delete this quiz?"
      confirmText="Delete"
      type="danger"
      @confirm="performDeleteQuiz"
      @cancel="cancelDeleteQuiz"
    />
  </div>
</template>

<script>
import axios from "axios";
import Header from "../../header.vue";
import Sidebar from "../SideBar.vue";
import AddQuizModal from "@/components/faculty/Quiz/AddQuizModal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue"; 

export default {
  components: { Header, Sidebar, AddQuizModal, ConfirmationModal },
  data() {
    return {
      teacher: {},
      searchQuery: "",
      isSidebarCollapsed: false,
      course: null,
      showAddQuizModal: false,
      upcomingQuizzes: [],
      showDeleteConfirmation: false,
      pendingDeleteQuizId: null,
    };
  },
  async created() {
    await this.fetchQuizzes();
  },
  methods: {
    async fetchQuizzes() {
      try {
        const courseId = this.$route.params.courseId;
        const response = await axios.get(`http://127.0.0.1:8000/api/quizzes/quizzes/${courseId}`);
        this.course = {
          name: response.data.course_name,
          quizzes: response.data.quizzes,
        };
        this.upcomingQuizzes = this.course.quizzes.filter(quiz => {
          return new Date(quiz.quiz_date) >= new Date();
        });
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    },
    navigateToQuiz(quiz) {
      this.$router.push({
        name: "FacultyQuizDetails",
        params: { courseId: this.$route.params.courseId, quizId: quiz.quiz_id },
      });
    },
    confirmDeleteQuiz(quizId) {
      this.pendingDeleteQuizId = quizId;
      this.showDeleteConfirmation = true;
    },
    async performDeleteQuiz() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/quizzes/${this.pendingDeleteQuizId}`);
        this.course.quizzes = this.course.quizzes.filter(
          quiz => quiz.quiz_id !== this.pendingDeleteQuizId
        );
        this.upcomingQuizzes = this.upcomingQuizzes.filter(
          quiz => quiz.quiz_id !== this.pendingDeleteQuizId
        );
      } catch (error) {
        console.error("Failed to delete quiz:", error);
      } finally {
        this.showDeleteConfirmation = false;
        this.pendingDeleteQuizId = null;
      }
    },
    cancelDeleteQuiz() {
      this.showDeleteConfirmation = false;
      this.pendingDeleteQuizId = null;
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
  background-color: #fff;
}

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
  position: relative;
}

.material-card:hover {
  transform: translateY(-5px);
}

.material-card i {
  font-size: 1.5rem;
  color: #2c3e50;
}

/* Announcements & Assignments */
.quiz-summary {
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
  width: 100%;
  position: relative;  /* Add this if not already present */
  z-index: 1;  /* Ensure it's on top of other elements */
}


.card-header h4 {
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}
.card-header i.pi-trash {
  font-size: 15px;
  color: #e74c3c;
  cursor: pointer;
  z-index: 2;  /* Ensure it's above other content */
}

.card-body {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

.quiz-summary h3 {
  font-size: 17px;
  font-weight: 600;
  color: #000000d2;
}

.quiz-summary ul {
  list-style: none;
  padding-left: 0;
  
}

.quiz-summary li {
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
.confirmation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirmation-modal {
  background: white;
  padding: 20px 30px;
  border-radius: 10px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.modal-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: space-evenly;
}

.modal-buttons button {
  padding: 8px 15px;
  font-weight: bold;
  cursor: pointer;
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