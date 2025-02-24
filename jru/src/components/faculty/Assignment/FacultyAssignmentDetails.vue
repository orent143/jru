<template>
    <div class="course-content-container">
      <Header :teacher="teacher" :searchQuery="searchQuery" :student="student" @toggleSidebar="toggleSidebar" />
      <div class="course-content">
        <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
        <div class="assignment-detail-container" v-if="currentAssignment">
          <button class="back-btn" @click="goBack">
            <i class="pi pi-arrow-left"></i> Back to Assignments
          </button>
  
          <div class="assignment-content">
            <div class="main-content">
              <div class="assignment-header">
                <div class="header-content">
                  <h1>{{ currentAssignment.title }}</h1>
                  <button class="edit-btn" @click="editAssignment">
                    <i class="pi pi-pencil"></i> Edit
                  </button>
                </div>
                <div class="assignment-meta">
                  <!-- If you have a created_at field, use it; otherwise, adjust as needed -->
                  <span class="posted-date">
                    <i class="pi pi-calendar"></i> Posted: {{ formatDate(currentAssignment.created_at) }}
                  </span>
                  <span class="due-date">
                    <i class="pi pi-clock"></i> Due: {{ formatDate(currentAssignment.due_date) }}
                  </span>
                </div>
              </div>
  
              <div class="content-section instructions">
                <h2>Instructions</h2>
                <p>{{ currentAssignment.description }}</p>
              </div>
  
              <div class="content-section uploaded-materials" v-if="currentAssignment.file_url">
                <h2>Assignment Materials</h2>
                <div class="materials-list">
                  <div class="material-item" @click="downloadAttachment(currentAssignment.file_url)">
                    <i class="pi pi-file"></i>
                    <span>{{ getFileName(currentAssignment.file_url) }}</span>
                    <i class="pi pi-download"></i>
                  </div>
                </div>
              </div>
            </div>
            <!-- Optionally, include side content such as submission stats -->
          </div>
        </div>
        <div v-else>
          <p>No assignment found.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import Header from '../header.vue';
  import Sidebar from '../SideBar.vue';
  
  export default {
    name: 'FacultyAssignmentDetails',
    components: {
      Header,
      Sidebar
    },
    data() {
      return {
        teacher: {},
        searchQuery: '',
        isSidebarCollapsed: false,
        courses: [],
        currentAssignment: null
      };
    },
    methods: {
      async fetchAssignment() {
        try {
          // Extract assignmentId from route params. Ensure your route is configured with assignmentId
          const assignmentId = this.$route.params.assignmentId;
          const response = await axios.get(`http://127.0.0.1:8000/api/assignments/item/${assignmentId}`);
          this.currentAssignment = response.data;
        } catch (error) {
          console.error("Error fetching assignment:", error);
        }
      },
      formatDate(date) {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
      getFileName(fileUrl) {
        return fileUrl ? fileUrl.split('/').pop() : 'Unknown File';
      },
      downloadAttachment(fileUrl) {
        window.open(fileUrl, '_blank');
      },
      goBack() {
        // Navigate back to the assignment list for the current course.
        this.$router.push({ 
          name: 'FacultyAssignmentContent', 
          params: { courseId: this.$route.params.courseId } 
        });
      },
      editAssignment() {
        // Navigate to the assignment edit page.
        this.$router.push(`/edit-assignment/${this.currentAssignment.assignment_id}`);
      }
    },
    mounted() {
      this.fetchAssignment();
    }
  };
  </script>
  
<style scoped>
.course-content-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.course-content {
    display: flex;
    flex: 1;
}

.assignment-detail-container {
    flex: 1;
    padding: 1rem;
    max-width: 100%;
    margin: 0 auto;
    max-height: 100%;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
}

.back-btn:hover {
    background-color: #f0f0f0;
}

.assignment-content {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 2rem;
    height: 100%;
    margin-bottom: 5rem;
}

.main-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.side-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 2rem;
}

.assignment-header {
    background-color: #D9D9D9;
    padding: 2rem;
    border-radius: 8px;
    position: relative;
}

.header-content h1 {
    color: #333;
}

.edit-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
}

.assignment-meta {
    display: flex;
    gap: 2rem;
    margin-top: 1rem;
    color: #666;
}

.content-section {
    background-color: #D9D9D9;
    padding: 1.5rem;
    border-radius: 8px;
    min-height: 300px;
    color: #212121;
}

.content-section h2 {
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    color: #333;
}

.material-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    cursor: pointer;
}

.submission-stats {
    background-color: #D9D9D9;
}

.stats {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background-color: #fff;
    border-radius: 4px;
}

.submission-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
}

.submission-item {
    background-color: #fff;
    padding: 0.75rem;
    border-radius: 4px;
}

.student-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status {
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-weight: 500;
}

.status.submitted {
    background-color: #4CAF50;
    color: white;
}

.status.pending {
    background-color: #FFDD57;
    color: black;
}
</style>
