<template>
    <div class="exam-details-container">
      <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
  
      <div class="exam-detail">
        <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
  
        <div class="exam-detail-container" v-if="currentExam">
          <button class="back-btn" @click="goBack">
            <i class="pi pi-arrow-left"></i> Back to Course
          </button>
  
          <div class="exam-content">
            <div class="main-content">
              <div class="exam-header">
                <h1>{{ currentExam.title }}</h1>
                <div class="exam-meta">
                  <span class="posted-date">
                    <i class="pi pi-calendar"></i> Posted: {{ formatDate(currentExam.exam_date) }}
                  </span>
                </div>
              </div>
  
              <div class="content-section instructions">
                <h2>Instructions</h2>
                <p>{{ currentExam.description }}</p>
  
                <!-- Attachments Section -->
                <div v-if="currentExam.file_url || currentExam.external_link" class="attachments">
                  <h3>Attachments</h3>
  
                  <!-- Local File Attachment -->
                  <div v-if="currentExam.file_url" class="attachment-item" @click="downloadFile(currentExam.file_url)">
                    <i class="pi pi-file"></i>
                    <span>{{ getFileName(currentExam.file_url) }}</span>
                    <i class="pi pi-download"></i>
                  </div>
  
                  <!-- External Link -->
                  <div v-if="currentExam.external_link" class="attachment-item">
                    <i class="pi pi-link"></i>
                    <a :href="currentExam.external_link" target="_blank">{{ getFileName(currentExam.external_link) }}</a>
                </div>
                </div>
              </div>
            </div>
  
            <div class="side-content">
              <div class="content-section submission">
                <h2>Your Work</h2>
                <div class="submission-area">
                  <div class="submission-actions">
                    <button class="upload-btn primary">
                      <i class="pi pi-upload"></i> Add or create
                    </button>
                  </div>
                </div>
              </div>
  
              <div class="content-section comments">
                <h2>Class Comments</h2>
                <div class="comments-section">
                  <div class="comment-input">
                    <input type="text" v-model="newComment" placeholder="Add class comment..."
                           @keyup.enter="addComment" />
                    <button class="send-btn" @click="addComment">
                      <i class="pi pi-send"></i>
                    </button>
                  </div>
                  <div class="comments-list" v-if="currentExam.comments?.length">
                    <div v-for="comment in currentExam.comments" :key="comment.id" class="comment">
                      <img :src="comment.authorAvatar || '/default-avatar.png'" :alt="comment.author" />
                      <div class="comment-content">
                        <div class="comment-header">
                          <h4>{{ comment.author }}</h4>
                          <span class="comment-date">{{ formatDate(comment.date) }}</span>
                        </div>
                        <p>{{ comment.text }}</p>
                      </div>
                    </div>
                  </div>
                  <p v-else>No comments yet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div v-else class="loading">Loading exam details...</div>
      </div>
    </div>
  </template>
  
  <script>
  import Header from '../Header.vue';
  import Sidebar from '../Sidebar.vue';
  import axios from 'axios';
  
  export default {
    name: 'ExamDetails',
    components: {
      Header,
      Sidebar
    },
    data() {
      return {
        student: {},
        searchQuery: '',
        isSidebarCollapsed: false,
        courses: [],
        currentExam: null,
        newComment: '',
      };
    },
    methods: {
      async fetchData() {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser && storedUser.role === 'student') {
            this.student = {
              id: storedUser.user_id,
              name: storedUser.name
            };
          } else {
            console.error('No valid student data found');
            return;
          }
  
          const courseId = parseInt(this.$route.params.courseId);
          const examId = parseInt(this.$route.params.examId);
  
          const res = await axios.get(`http://127.0.0.1:8000/api/student_exams/${this.student.id}/${courseId}`);
          if (res.status === 200) {
            const exams = res.data.exams;
            this.currentExam = exams.find(exam => exam.exam_id === examId) || null;
          }
        } catch (error) {
          console.error('Error fetching exam data:', error);
        }
      },
  
      // Helper function to extract the file name from the URL
      getFileName(fileUrl) {
        return fileUrl.split('/').pop();
      },
  
      downloadFile(fileUrl) {
  const formattedUrl = fileUrl.replace(/\\/g, '/'); // In case the file path uses backslashes
  
  if (formattedUrl.startsWith('http')) {
    // Open the URL in a new tab
    window.open(formattedUrl, '_blank'); 
  } else {
    // Extract the file name and open the download link in a new tab
    const fileName = this.getFileName(formattedUrl);
    window.open(`http://127.0.0.1:8000/api/assignments/download/${fileName}`, '_blank');
  }
},
      toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      },
  
      formatDate(date) {
        return date ? new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A';
      },
  
      async addComment() {
        if (!this.newComment.trim()) return;
  
        try {
          const res = await axios.post(`http://127.0.0.1:8000/api/exam/${this.currentExam.exam_id}/comments`, {
            text: this.newComment,
            author: this.student.name
          });
  
          if (res.status === 201) {
            this.currentExam.comments.push({
              id: res.data.id,
              text: this.newComment,
              author: this.student.name,
              date: new Date().toISOString()
            });
            this.newComment = '';
          }
        } catch (error) {
          console.error('Error adding comment:', error);
        }
      },
  
      goBack() {
        this.$router.go(-1);
      }
    },
    async mounted() {
      await this.fetchData();
    }
  };
  </script>

<style scoped>
.exam-details-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.exam-detail {
    display: flex;
    flex: 1;
}

.exam-detail-container {
    flex: 1;
    padding: 1rem;
    max-width: 100%;
    margin: 0 auto;
    overflow-y: auto; /* This will enable vertical scrolling */
    max-height: 100%; /* Set a maximum height for the container */
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

.exam-content {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 2rem;
    height: 100%; /* Ensure content takes up full height */
    margin-bottom: 5rem; /* Add bottom margin here */
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
    margin-bottom: 2rem; /* Add bottom margin here */
}

.exam-header {
    background-color: #D9D9D9;
    padding: 2rem;
    border-radius: 8px;
}

.exam-header h1 {
    color: #333;
}

.exam-meta {
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
    display: flex
;
    font-family: 'Inter', sans-serif;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}
</style>