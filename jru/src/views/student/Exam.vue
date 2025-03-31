<template>
  <div class="exam-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="exam-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="exam-main">
        <div class="course-header">
          <h2>Exams: <span>{{ totalExams }}</span></h2>
        </div>

        <div class="course-cards">
          <div 
            class="course-card" 
            v-for="course in courses" 
            :key="course.course_id" 
            @click="navigateToExams(course.course_id)" 
            :class="{ 'has-exams': course.exams.length > 0 }"
          >
            <div class="course-info">
              <i class="pi pi-file-edit course-logo"></i>
              <h4 class="course-name">{{ course.course_name }}</h4>
            </div>

            <div class="exams-list" v-if="course.exams.length > 0">
              <ul>
                <li 
                  v-for="exam in course.exams" 
                  :key="exam.exam_id"
                  @click.stop="navigateToExamDetail(course.course_id, exam.exam_id)"
                >
              
                </li>
              </ul>
            </div>
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
  data() {
    return {
      student: null,
      courses: [],
      searchQuery: '',
      isSidebarCollapsed: false,
    };
  },
  computed: {
    totalExams() {
      return this.courses.reduce((total, course) => total + course.exams.length, 0);
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },

    async fetchExams() {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.role === 'student') {
          this.student = storedUser;
          const response = await axios.get(`http://127.0.0.1:8000/api/student_courses/${this.student.user_id}`);
          const courses = response.data.courses;

          for (const course of courses) {
            const examResponse = await axios.get(`http://127.0.0.1:8000/api/student_exams/${this.student.user_id}/${course.course_id}`);
            course.exams = examResponse.data.exams;
          }

          this.courses = courses;
          console.log('Courses with exams:', this.courses); // Debugging log
        } else {
          console.error("User is not authenticated or not a student");
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    },

    navigateToExams(courseId) {
      this.$router.push({
        name: 'ExamContent',
        params: { courseId: courseId.toString() }
      });
    },

    navigateToExamDetail(courseId, examId) {
      this.$router.push({
        name: 'ExamDetail',
        params: { courseId: courseId.toString(), examId: examId.toString() }
      });
    }
  },
  mounted() {
    this.fetchExams();
  }
};
</script>

<style scoped>
.exam-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.exam-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.exam-main {
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
  color: #000000;
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

.course-card.has-exams {
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

.course-card:not(.has-exams) .course-name {
  color: black;
}

.course-card:not(.has-exams) .course-logo {
  color: black;
}

.course-name {
  font-size: 20px;
  font-weight: 650;
}

.exams-list {
  margin-top: 1rem;
}

.exams-list ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.exam-name {
  font-size: 1rem;
  font-weight: bold;
}

.exam-date {
  font-size: 0.9rem;
  color: #888;
}
</style>