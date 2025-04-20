<template>
  <div class="course-content-container">
    <Header :student="student" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="course-main" v-if="course">
        <div class="page-header">
          <div class="header-content">
            <h1>{{ course.course_name }}</h1>
            <p class="course-subtitle"> Access all announcements, activities, and materials for this course in one place.</p>
          </div>
          <div class="header-actions">
            <button class="action-btn">
              <i class="pi pi-calendar"></i>
              Schedule
            </button>
            <button class="action-btn">
              <i class="pi pi-envelope"></i>
              Contact Instructor
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="loading-container">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Loading course content...</p>
        </div>

        <div v-else class="content-grid">
          <div class="content-column-left">
            <section class="announcements-section">
              <div class="section-header">
                <h2>
                  <i class="pi pi-bell section-icon"></i>
                  Announcements
                </h2>
                <span class="last-updated">Last updated: {{ formattedDate }}</span>
              </div>
              <div v-if="announcements.length === 0" class="empty-state">
                <i class="pi pi-info-circle"></i>
                <p>No announcements available</p>
              </div>
              <ul v-else class="announcements-list">
                <li v-for="(announcement, index) in announcements" :key="index" class="announcement-item">
                  <div class="announcement-header">
                    <h3>{{ announcement.title }}</h3>
                    <span class="announcement-date">{{ formatDate(announcement.date) }}</span>
                  </div>
                  <p class="announcement-content">{{ announcement.content }}</p>
                </li>
              </ul>
            </section>

            <section class="activities-section">
              <div class="section-header">
                <h2>
                  <i class="pi pi-chart-bar section-icon"></i>
                  Recent Activities
                </h2>
              </div>
              <div class="activity-timeline">
                <div class="timeline-item" v-for="(activity, index) in recentActivities" :key="index">
                  <div class="timeline-icon" :class="activity.type">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <h3>{{ activity.title }}</h3>
                      <span class="timeline-date">{{ formatDate(activity.date) }}</span>
                    </div>
                    <p>{{ activity.description }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="content-column-right">
            <section class="materials-section">
              <div class="section-header">
                <h2>
                  <i class="pi pi-book section-icon"></i>
                  Course Materials
                </h2>
                <button class="view-all-btn">View All</button>
              </div>
              <div v-if="courseMaterials.length === 0" class="empty-state">
                <i class="pi pi-folder"></i>
                <p>No materials available</p>
              </div>
              <div v-else class="materials-grid">
                <div 
                  v-for="material in courseMaterials" 
                  :key="material.content_id"
                  class="material-card"
                  @click="navigateToMaterial(material.content_id)"
                >
                  <div class="material-icon">
                    <i :class="getMaterialIcon(material.type)"></i>
                  </div>
                  <div class="material-info">
                    <h3>{{ material.title }}</h3>
                    <div class="material-meta">
                      <span class="material-type">{{ material.type || 'Document' }}</span>
                      <span class="material-date">{{ formatDate(material.upload_date) }}</span>
                    </div>
                    <p class="material-description">{{ material.description || 'No description available' }}</p>
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
import Header from '@/components/header.vue';
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
      student: JSON.parse(localStorage.getItem("user")),
      courses: [],
      course: null,
      courseMaterials: [],
      announcements: [],
      recentActivities: [],
      studentId: null,
      isLoading: true
    };
  },
  computed: {
    formattedDate() {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  async created() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'student') {
      this.studentId = storedUser.user_id;
      await this.fetchCourseMaterials();
      this.generateMockData(); // For demonstration purposes
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
      this.isLoading = true;
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/student_course_content/${this.studentId}/${this.courseId}`
        );

        console.log("Fetched Data:", response.data); 

        this.courseMaterials = response.data.content || []; 
        this.course = response.data.course || { course_name: `Course ${this.courseId}` }; 
      } catch (error) {
        console.error("Error fetching course content:", error);
      } finally {
        this.isLoading = false;
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
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Date not available';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    // Mock data generation for UI demonstration
    generateMockData() {
      // Generate mock announcements
      this.announcements = [
        {
          title: 'Midterm Exam Schedule Updated',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          content: 'The midterm exam has been rescheduled to next Monday. Please prepare accordingly and review the materials provided in the course content section.'
        },
        {
          title: 'Week 5 Assignment Posted',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          content: 'The new assignment for Week 5 has been posted. Please check the assignments section and submit your work by the deadline.'
        }
      ];
      
      // Generate mock recent activities
      this.recentActivities = [
        {
          type: 'material',
          title: 'Material Accessed',
          date: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          description: 'You accessed "Week 4 Lecture Notes"'
        },
        {
          type: 'assignment',
          title: 'Assignment Submitted',
          date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          description: 'You submitted "Data Analysis Project"'
        },
        {
          type: 'quiz',
          title: 'Quiz Completed',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          description: 'You scored 85% on "Chapter 3 Quiz"'
        }
      ];
    },
    
    getMaterialIcon(type) {
      const typeMap = {
        'pdf': 'pi pi-file-pdf',
        'document': 'pi pi-file-word',
        'presentation': 'pi pi-file-powerpoint',
        'spreadsheet': 'pi pi-file-excel',
        'video': 'pi pi-video',
        'audio': 'pi pi-volume-up',
        'image': 'pi pi-image',
        'link': 'pi pi-link'
      };
      
      return typeMap[type?.toLowerCase()] || 'pi pi-file';
    },
    
    getActivityIcon(type) {
      const typeMap = {
        'material': 'pi pi-book',
        'assignment': 'pi pi-file-edit',
        'quiz': 'pi pi-check-square',
        'exam': 'pi pi-file',
        'discussion': 'pi pi-comments'
      };
      
      return typeMap[type] || 'pi pi-info-circle';
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
  overflow: hidden;
}

.course-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: #f8f9fa;
  overflow-y: auto;
  max-height: calc(100vh - 64px); /* Adjust based on header height */
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.header-content h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.course-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0.25rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #007BF6;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #0069d9;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-container i {
  font-size: 2.5rem;
  color: #007BF6;
  margin-bottom: 1rem;
}

.loading-container p {
  color: #6c757d;
  font-size: 1rem;
}

.content-grid {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

.content-column-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 60%;
}
.content-column-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  height: 100%;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.75rem;
}

.section-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  color: #007BF6;
}

.last-updated, 
.view-all-btn {
  font-size: 0.85rem;
  color: #6c757d;
}

.view-all-btn {
  background: none;
  border: none;
  color: #007BF6;
  cursor: pointer;
  font-weight: 500;
}

.view-all-btn:hover {
  text-decoration: underline;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
  text-align: center;
}

.empty-state i {
  font-size: 2rem;
  color: #adb5bd;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
  margin: 0;
}

/* Announcements Section */
.announcements-section {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-height: 250px;
  overflow-y: auto;
}

.announcements-list {
  list-style-type: none;
  padding: 20px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.announcement-item {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007BF6;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.announcement-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.announcement-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.announcement-content {
  font-size: 0.9rem;
  color: #495057;
  margin: 0;
  line-height: 1.5;
}

/* Materials Section */
.materials-section {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-height: 600px;
  overflow-y: auto;
}

.materials-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.material-card {
  display: flex;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.material-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f4f9;
}

.material-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e6f2ff;
  color: #007BF6;
  border-radius: 8px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.material-icon i {
  font-size: 1.2rem;
}

.material-info {
  flex: 1;
  overflow: hidden;
}

.material-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.material-type,
.material-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.material-type {
  background-color: #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.material-description {
  font-size: 0.85rem;
  color: #495057;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Activities Section */
.activities-section {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-height: 250px;
  overflow-y: auto;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.activity-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 20px;
  width: 2px;
  background-color: #e9ecef;
  z-index: 0;
}

.timeline-item {
  display: flex;
  position: relative;
  z-index: 1;
  padding-left: 15px;
}

.timeline-icon {
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  z-index: 2;
  border: 3px solid white;
}

.timeline-icon i {
  font-size: 1rem;
  color: #495057;
}

.timeline-icon.material {
  background-color: #e6f2ff;
}

.timeline-icon.material i {
  color: #007BF6;
}

.timeline-icon.assignment {
  background-color: #e6fff2;
}

.timeline-icon.assignment i {
  color: #28a745;
}

.timeline-icon.quiz {
  background-color: #fff2e6;
}

.timeline-icon.quiz i {
  color: #fd7e14;
}

.timeline-content {
  flex: 1;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.timeline-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.timeline-content p {
  font-size: 0.9rem;
  color: #495057;
  margin: 0;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>