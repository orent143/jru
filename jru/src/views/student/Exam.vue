<template>
    <div class="dashboard-container">
      <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
      <div class="dashboard-content">
        <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
        <main class="dashboard-main">
          <!-- Header for Exams -->
          <div class="course-header">
            <h2>Exams: <span>{{ totalExams }}</span></h2>
            
            <!-- Course Sections -->
            <div class="course-sections">
              <ul>
                <li v-for="section in courses[0].sections" :key="section.id">
                  {{ section.name }}
                </li>
              </ul>
            </div>
          </div>
  
          <div class="course-cards">
            <!-- Looping through courses -->
            <div 
              class="course-card" 
              v-for="course in courses" 
              :key="course.id" 
              @click="navigateToExams(course.id)" 
              :class="{ 'has-exams': course.exams.length > 0 }"
            >
              <div class="course-info">
                <i class="pi pi-file-edit course-logo"></i>
                <h4 class="course-name">{{ course.name }}</h4>
              </div>
  
              <!-- Display first exam -->
              <div class="exams-list" v-if="course.exams.length > 0">
                <ul>
                  <li 
                    @click.stop="navigateToExamDetail(course.id, course.exams[0].id)"
                  >
                    <span class="exam-name">{{ course.exams[0].name }}</span>
                    <span class="exam-date">Date: {{ course.exams[0].date }}</span>
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
  
  export default {
    components: {
      Header,
      Sidebar
    },
    data() {
      return {
        student: {
          name: 'John Doe',
        },
        courses: [
          {
            id: 1,
            name: 'ITELECT4',
            sections: [{ id: 1, name: 'BSCS-3A' }], 
            exams: [
              { id: 1, name: 'Midterm Exam', date: '2024-03-01' },
              { id: 2, name: 'Final Exam', date: '2024-05-01' }
            ]
          },
          {
            id: 2,
            name: 'GEC010',
            sections: [{ id: 1, name: 'BSCS-3A' }],
            exams: [
              { id: 1, name: 'Midterm Exam', date: '2024-03-10' }
            ]
          },
          {
            id: 3,
            name: "CC321",
            exams: [
              { id: 1, name: "Midterm Exam", date: "2024-03-15" },
            ],
          },
        ],
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
  
      navigateToExams(courseId) {
        // Navigate to the ExamContent page for the selected course
        this.$router.push({
          name: 'ExamContent', 
          params: { courseId: courseId.toString() }
        });
      },
  
      navigateToExamDetail(courseId, examId) {
        // Navigate to the exam details page
        this.$router.push({
          name: 'ExamDetail', 
          params: { courseId: courseId.toString(), examId: examId.toString() }
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .dashboard-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  
  .dashboard-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .dashboard-main {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
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