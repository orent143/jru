<template>
    <div class="dashboard-container">
      <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
      <div class="dashboard-content">
        <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
        <main class="dashboard-main">
          <div class="page-header">
            <div class="page-header-content">
            <h1>My Courses</h1>
            <p class="page-subtitle">Browse and manage the courses you're currently enrolled in.</p>
          </div>
            <div class="header-actions">
              <div class="search-container">
                <i class="pi pi-search search-icon"></i>
                <input 
                  type="text" 
                  class="search-input" 
                  placeholder="Search courses..." 
                  v-model="searchQuery"
                />
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="loading-container">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Loading your courses...</p>
          </div>
          
          <div v-else-if="courses.length === 0" class="empty-state">
            <i class="pi pi-book"></i>
            <h3>No Courses Available</h3>
            <p>You are not enrolled in any courses yet.</p>
          </div>
          
          <section v-else class="course-grid">
            <div class="course-card" 
                 v-for="course in filteredCourses" 
                 :key="course.course_id" 
                 @click="navigateToCourse(course.course_id)">
              <div class="course-color-indicator" :style="getRandomColorStyle()"></div>
              <div class="card-content">
                <div class="course-icon">
                  <i class="pi pi-book"></i>
                </div>
                <div class="card-header">
                  <h3>{{ course.course_name }}</h3>
                  <span class="course-code">{{ course.course_code || getCourseCode(course.course_name) }}</span>
                </div>
                <div class="card-details">
                  <div class="detail-item">
                    <i class="pi pi-users"></i>
                    <span>{{ course.section || 'No section' }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="pi pi-calendar"></i>
                    <span>{{ course.class_schedule || 'Schedule not available' }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="pi pi-user"></i>
                    <span>{{ course.instructor_name || 'Instructor not assigned' }}</span>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="progress-bar">
                    <div class="progress" :style="{ width: getRandomProgress() }"></div>
                  </div>
                  <span class="progress-text">Course Progress</span>
                </div>
              </div>
            </div>
          </section>
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
      Sidebar
    },
    data() {
      return {
        courses: [],
        studentId: null,
        isSidebarCollapsed: false,
        searchQuery: '',
        isLoading: true,
        colorPalette: [
          '#4285F4', '#EA4335', '#FBBC05', '#34A853', // Google colors
          '#1877F2', '#45BD62', '#F02849', // Facebook colors
          '#0077B5', '#00A0DC', // LinkedIn colors
          '#007BF6', '#6c5ce7', '#00cec9', '#e84393', '#00b894', '#6ab04c'
        ]
      };
    },
    computed: {
      filteredCourses() {
        if (!this.searchQuery) return this.courses;
        
        const query = this.searchQuery.toLowerCase();
        return this.courses.filter(course => {
          return course.course_name.toLowerCase().includes(query) || 
                 (course.section && course.section.toLowerCase().includes(query)) ||
                 (course.instructor_name && course.instructor_name.toLowerCase().includes(query));
        });
      }
    },
    async created() {
      await this.fetchStudentCourses();
    },
    methods: {
      async fetchStudentCourses() {
        try {
          this.isLoading = true;
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser && storedUser.role === 'student') {
            this.studentId = storedUser.user_id;
            const token = storedUser.access_token;
            
            if (!token) {
              throw new Error('No access token available');
            }
            
            const response = await axios.get(
              `http://127.0.0.1:8000/api/student_courses/${this.studentId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            this.courses = response.data.courses || [];
          } else {
            console.error("User is not authenticated or not a student");
            this.logout();
          }
        } catch (error) {
          console.error("Error fetching student courses:", error);
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            this.logout();
          }
        } finally {
          this.isLoading = false;
        }
      },
      navigateToCourse(courseId) {
        this.$router.push({ name: 'StudentCourseContent', params: { courseId } });
      },
      logout() {
        localStorage.removeItem('user');
        this.$router.push('/login');
      },
      toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      },
      getRandomColorStyle() {
        const colorIndex = Math.floor(Math.random() * this.colorPalette.length);
        return { backgroundColor: this.colorPalette[colorIndex] };
      },
      getRandomProgress() {
        return Math.floor(Math.random() * 80 + 20) + '%';
      },
      getCourseCode(courseName) {
        if (!courseName) return 'N/A';
        
        // Generate a code from course name, e.g. "Web Development" -> "WD101"
        const words = courseName.split(' ');
        let code = '';
        
        // Get first letter of each word
        words.forEach(word => {
          if (word.length > 0) {
            code += word[0].toUpperCase();
          }
        });
        
        // Add random number
        code += Math.floor(Math.random() * 899 + 100);
        
        return code;
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
    background-color: #f8f9fa;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
  }
  .page-header-content {
    display: flex;
    flex-direction: column;
  }
  

  .page-header h1 {
    color: #2c3e50;
    font-weight: 700;
    font-size: 1.8rem;
    margin: 0;
  }
  .page-subtitle {
  margin-top: 0.25rem;
  margin-bottom: 1rem;
  color: #6c757d; /* soft gray for subtlety */
  font-size: 1rem;
}

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .search-container {
    position: relative;
    width: 300px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
  }

  .search-input {
    width: 100%;
    padding: 0.6rem 1rem 0.6rem 2.5rem;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 0.9rem;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #007BF6;
    box-shadow: 0 0 0 3px rgba(0, 123, 246, 0.25);
  }
  
  .loading-container, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    text-align: center;
  }

  .loading-container i, .empty-state i {
    font-size: 3rem;
    color: #007BF6;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
  }

  .empty-state p {
    color: #6c757d;
    margin: 0;
  }

  .loading-container p {
    color: #6c757d;
  }

  .course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }
  
  .course-card {
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }
  
  .course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  .course-color-indicator {
    height: 8px;
    width: 100%;
  }

  .card-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .course-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background-color: #f0f4f9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .course-icon i {
    font-size: 1.5rem;
    color: #007BF6;
  }
  
  .card-header {
    margin-bottom: 1.25rem;
  }
  
  .card-header h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.25rem 0;
    line-height: 1.4;
  }

  .course-code {
    font-size: 0.85rem;
    color: #6c757d;
    font-weight: 500;
  }
  
  .card-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex: 1;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .detail-item i {
    color: #6c757d;
    font-size: 0.9rem;
    width: 16px;
  }

  .detail-item span {
    font-size: 0.9rem;
    color: #495057;
  }

  .card-footer {
    margin-top: auto;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress {
    height: 100%;
    background-color: #007BF6;
    border-radius: 4px;
  }

  .progress-text {
    font-size: 0.8rem;
    color: #6c757d;
  }
  
  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .header-actions, .search-container {
      width: 100%;
    }

    .course-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>