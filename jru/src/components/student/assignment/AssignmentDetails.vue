<template>
  <div class="assignmentdetail-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="assignment-detail">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <div class="assignment-detail-container" v-if="currentAssignment">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i> Back to Course
        </button>

        <div class="assignment-content">
          <div class="main-content">
            <div class="assignment-header">
              <h1>{{ currentAssignment.title }}</h1>
              <div class="assignment-meta">
                <span class="posted-date">
                  <i class="pi pi-calendar"></i> 
                  Posted: {{ formatDate(currentAssignment.created_at) }}
                </span>
                <span class="due-date">
                  <i class="pi pi-clock"></i> 
                  Due: {{ formatDate(currentAssignment.due_date) }}
                </span>
                <span v-if="currentAssignment.status" class="status" :class="currentAssignment.status.toLowerCase()">
                  {{ currentAssignment.status }}
                </span>
              </div>
            </div>

            <div class="content-section instructions">
              <h2>Instructions</h2>
              <p>{{ currentAssignment.description }}</p>

              <!-- Attachments Section -->
              <div v-if="currentAssignment.file_path || currentAssignment.external_link" class="attachments">
                <h3>Attachments</h3>
                
                <!-- Local File Attachment -->
                <div v-if="currentAssignment.file_path" class="attachment-item" @click="downloadAttachment(currentAssignment.file_path)">
                  <i class="pi pi-file"></i>
                  <span>{{ getFileName(currentAssignment.file_path) }}</span>
                  <i class="pi pi-download"></i>
                </div>
                
                <!-- External Link -->
                <div v-if="currentAssignment.external_link" class="attachment-item">
                  <i class="pi pi-link"></i>
                  <a :href="currentAssignment.external_link" target="_blank">{{ getFileName(currentAssignment.external_link) }}</a>
                </div>
              </div>
            </div>

            <!-- Download Section -->
          </div>

          <div class="side-content">
            <div class="content-section comments">
              <h2>Class Comments</h2>
              <div class="comment-input">
                <input type="text" v-model="newComment" placeholder="Add class comment..." @keyup.enter="addComment" />
                <button class="send-btn" @click="addComment">
                  <i class="pi pi-send"></i>
                </button>
              </div>
              <div class="comments-list">
                <div v-for="comment in currentAssignment.comments" :key="comment.id" class="comment">
                  <img :src="comment.authorAvatar" :alt="comment.author" />
                  <div class="comment-content">
                    <h4>{{ comment.author }}</h4>
                    <span class="comment-date">{{ formatDate(comment.date) }}</span>
                    <p>{{ comment.text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>  
      </div>
    </div>
  </div>
</template>

<script>
import Header from '../Header.vue';
import Sidebar from '../Sidebar.vue';
import axios from 'axios';

export default {
  name: 'AssignmentDetail',
  components: { Header, Sidebar },
  props: ['courseId', 'assignmentId'],
  data() {
    return {
      student: {},
      courses: [],
      currentAssignment: null,
      newComment: "",
    };
  },
  async created() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'student') {
      this.studentId = storedUser.user_id;
      await this.fetchAssignmentDetail();
    }
  },
  methods: {
    async fetchAssignmentDetail() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/student_assignments/${this.studentId}/${this.courseId}`);
        if (response.data.assignments) {
          this.currentAssignment = response.data.assignments.find(assignment => assignment.assignment_id === parseInt(this.assignmentId)) || null;
        } else {
          this.currentAssignment = null;
        }
      } catch (error) {
        console.error("Error fetching assignment details:", error);
      }
    },

    formatDate(date) {
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },

    downloadAttachment(filePath) {
  const formattedPath = filePath.replace(/\\/g, '/'); 

  if (formattedPath.startsWith('http')) {
    window.open(formattedPath, "_blank"); 
  } else {
    // Extract only the file name without "uploads/" prefix
    const cleanedPath = formattedPath.split('/').pop();
    window.open(`http://127.0.0.1:8000/api/assignments/download/${cleanedPath}`, "_blank");
  }
}
,

    getFileName(filePath) {
      return filePath.split(/[\\/]/).pop(); // Extract the file name from the file path
    },

    addComment() {
      if (!this.newComment.trim()) return;
      this.currentAssignment.comments = this.currentAssignment.comments || [];
      this.currentAssignment.comments.push({
        id: Date.now(),
        author: "You",
        authorAvatar: "/default-avatar.png",
        text: this.newComment,
        date: new Date().toISOString(),
      });
      this.newComment = "";
    },

    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.assignment-detail-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.assignment-detail {
  display: flex;
  flex: 1;
}

.assignment-detail-container {
  flex: 1;
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
  overflow-y: auto;
  max-height: 100%;
  background-color: #fff;

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
}

.assignment-header h1 {
  color: #333;
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

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.attachment-item i {
  font-size: 1.25rem;
}

.comments-section {
  display: flex;
  flex-direction: column;
}

.comment-input {
  display: flex;
  gap: 0.5rem;
}

.comment-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.send-btn {
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
}

.send-btn:hover {
  background-color: #45a049;
}

.comments-list {
  margin-top: 1rem;
}

.comment {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.comment-content {
  display: flex;
  flex-direction: column;
}

.comment-header h4 {
  font-size: 1rem;
  margin-bottom: 0.2rem;
  color: #333;
}

.comment-date {
  font-size: 0.875rem;
  color: #888;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 12px;
}

.primary {
  background-color: #007bff;
}

.status.indicator {
  background-color: #f39c12;
}

.submission-actions button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 20px;
  font-size: 100%;
  font-weight: 800;
  background-color: #F5F5F5;
  color: rgba(0, 0, 0, 0.781);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
</style>
