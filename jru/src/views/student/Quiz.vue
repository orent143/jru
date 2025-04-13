<template>
  <div class="quiz-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="quiz-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="quiz-main">
        <div class="course-header">
          <h2>Quizzes: <span>{{ totalQuizzes }}</span></h2>
        </div>

        <div class="course-cards">
          <div
            class="course-card"
            v-for="course in courses"
            :key="course.course_id"
            @click="navigateToQuizzes(course.course_id)"
            :class="{ 'has-quizzes': course.quizzes.length > 0 }"
          >
            <div class="course-info">
              <i class="pi pi-file-edit course-logo"></i>
              <h4 class="course-name">{{ course.course_name }}</h4>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Header from '@/components/header.vue';
import Sidebar from '@/components/student/Sidebar.vue';
import axios from 'axios';

export default {
  components: {
    Header,
    Sidebar,
  },
  data() {
    return {
      student: null,
      courses: [],
      searchQuery: '',
      isSidebarCollapsed: false,
    };
  },
  computed: {
    totalQuizzes() {
      return this.courses.reduce((total, course) => total + (course.quizzes ? course.quizzes.length : 0), 0);
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },

    async fetchQuizzes() {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.role === 'student') {
          this.student = storedUser;
          const response = await axios.get(`http://127.0.0.1:8000/api/student_courses/${this.student.user_id}`);
          const courses = response.data.courses;

          for (const course of courses) {
            const quizResponse = await axios.get(`http://127.0.0.1:8000/api/student_quizzes/${this.student.user_id}/${course.course_id}`);
            course.quizzes = quizResponse.data.quizzes || [];  
          }

          this.courses = courses;
        } else {
          console.error("User is not authenticated or not a student");
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    },

    navigateToQuizzes(courseId) {
      this.$router.push({
        name: 'QuizContent',
        params: { courseId: courseId.toString() }, 
      });
    },

    navigateToQuizDetail(courseId, quizId) {
      this.$router.push({
        name: 'QuizDetails',
        params: { courseId: courseId.toString(), quizId: quizId.toString() },
      });
    },
  },
  mounted() {
    this.fetchQuizzes();
  },
};
</script>

<style scoped>
.quiz-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.quiz-content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.quiz-main {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    background-color: #fff;
  }

.course-header {
    background-color: #D9D9D9;
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 2rem;
}

.course-header h2 {
    font-size: 24px;
    font-weight: bold;
    color: #2c3e50;
}

.course-sections ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
}

.course-sections li {
    font-size: 1rem;
    color: #555;
}

.course-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
}

.course-card {
    background-color: #D9D9D9ff;
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    padding: 20px;
    height: auto;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.course-card.has-quizzes {
    background-color: #007BF6;
    color: #ffffff;
}

.course-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.course-logo {
    font-size: 20px;
    color: inherit;
}

.course-card:not(.has-quizzes) .course-name {
    color: black;
}

.course-card:not(.has-quizzes) .course-logo {
    color: black;
}

.course-name {
    font-size: 20px;
    font-weight: 650;
}

.quizzes-list {
    margin-top: 1rem;
}

.quizzes-list ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
}

.quiz-name {
    font-size: 1rem;
    font-weight: bold;
}

.quiz-date {
    font-size: 0.9rem;
    color: #888;
}
</style>