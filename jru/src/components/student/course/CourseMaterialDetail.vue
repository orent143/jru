<template>
  <div class="course-content-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      
      <div class="material-detail-container" v-if="currentMaterial">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i> Back to Course
        </button>

        <div class="material-content">
          <div class="main-content">
            <div class="material-header">
              <h1>{{ currentMaterial.title }}</h1>
              <div class="material-meta">
                <span class="posted-date">
                  <i class="pi pi-calendar"></i> 
                  Posted: {{ formatDate(currentMaterial.created_at) }}
                </span>
              </div>
            </div>

            <div class="content-section instructions">
              <h2>Instructions</h2>
              <p>{{ currentMaterial.description }}</p>

              <div v-if="currentMaterial.file_path" class="attachments">
                <h3>Attachments</h3>
                <div class="attachment-item" @click="downloadAttachment(currentMaterial.file_path)">
                  <i class="pi pi-file"></i>
                  <span>{{ getFileName(currentMaterial.file_path) }}</span>
                  <i class="pi pi-download"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="side-content">
            <div class="content-section comments">
              <h2>Class Comments</h2>
              
              <div v-if="isLoadingComments" class="comments-loading">
                <div class="loading-spinner"></div>
                <p>Loading comments...</p>
              </div>
              
              <div v-else-if="comments.length === 0" class="no-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
              
              <div v-else class="comments-list">
                <div v-for="comment in comments" :key="comment.comment_id" class="comment">
                  <div class="comment-avatar">
                    <i class="pi pi-user"></i>
                  </div>
                  <div class="comment-content">
                    <div class="comment-header">
                      <h4>{{ comment.user_name }}</h4>
                      <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                      
                      <button 
                        v-if="comment.user_id === studentId" 
                        class="delete-comment-btn"
                        @click="deleteComment(comment.comment_id)"
                      >
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                    <p class="comment-text">{{ comment.content }}</p>
                  </div>
                </div>
              </div>
              
              <div class="comment-input">
                <textarea
                  v-model="newComment"
                  placeholder="Add a comment..."
                  rows="3"
                ></textarea>
                <button
                  class="post-comment-btn"
                  @click="addComment"
                  :disabled="!newComment.trim()"
                >
                  <i class="pi pi-send"></i> Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>  
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/header.vue';
import Sidebar from '../Sidebar.vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  name: 'CourseMaterialDetail',
  components: {
    Header,
    Sidebar
  },
  props: ['courseId', 'materialId'],
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      student: JSON.parse(localStorage.getItem("user")),
      courses: [],
      currentMaterial: null,
      newComment: "",
      comments: [],
      isLoadingComments: false
    };
  },
  async created() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'student') {
      this.studentId = storedUser.user_id;
      await this.fetchCourseMaterial();
      await this.fetchComments();
    }
  },
  methods: {
    async fetchCourseMaterial() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/student_course_content/${this.studentId}/${this.courseId}`);
        if (response.data.content) {
          this.currentMaterial = response.data.content.find(material => material.content_id === parseInt(this.materialId)) || null;
        } else {
          this.currentMaterial = null;
        }
      } catch (error) {
        console.error("Error fetching course material:", error);
        this.toast.error("Failed to load course material");
      }
    },
    async fetchComments() {
      try {
        this.isLoadingComments = true;
        const response = await axios.get(
          `http://127.0.0.1:8000/api/comments/material/${this.materialId}`
        );
        this.comments = response.data;
        this.isLoadingComments = false;
      } catch (error) {
        console.error("Error fetching comments:", error);
        this.toast.error("Failed to load comments");
        this.isLoadingComments = false;
      }
    },
    async addComment() {
      if (!this.newComment.trim()) return;
      
      try {
        const commentData = {
          user_id: this.studentId,
          entity_type: "material",
          entity_id: parseInt(this.materialId),
          content: this.newComment
        };
        
        const response = await axios.post(
          "http://127.0.0.1:8000/api/comments/",
          commentData
        );
        
        if (response.status === 200) {
          this.toast.success("Comment added successfully!");
          this.newComment = "";
          await this.fetchComments();
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        this.toast.error("Failed to add comment");
      }
    },
    async deleteComment(commentId) {
      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/comments/${commentId}?user_id=${this.studentId}`
        );
        
        if (response.status === 200) {
          this.toast.success("Comment deleted successfully!");
          await this.fetchComments();
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        this.toast.error("Failed to delete comment");
      }
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },
    downloadAttachment(filePath) {
      if (!filePath) return;
      
      try {
        // First check if it's an external URL (starting with http or https)
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
          this.openFileInNewTab(filePath);
          return;
        }
        
        // If it's a local file path
        let cleanPath = filePath.replace(/\\/g, '/');
        
        // Get the filename for download endpoints
        const fileName = this.getFileName(cleanPath);
        
        // Try multiple approaches to maximize chances of success
        // 1. Try the course-content download endpoint first
        this.tryDownloadMethods([
          `http://127.0.0.1:8000/api/course-content/download/${encodeURIComponent(fileName)}`,
          `http://127.0.0.1:8000/api/assignments/download/${encodeURIComponent(fileName)}`,
          `http://127.0.0.1:8000${cleanPath}`,
          `http://127.0.0.1:8000/uploads/${encodeURIComponent(fileName)}`
        ]);
      } catch (error) {
        console.error("Error downloading file:", error);
        this.toast.error("Error downloading file. Please try again later.");
      }
    },
    tryDownloadMethods(urls) {
      // Try the first URL
      if (urls.length > 0) {
        this.openFileInNewTab(urls[0]);
        
        // If the user needs to try another method, they can click again
        // For more advanced handling, we could implement fallback logic
        console.log("Tried download URL:", urls[0]);
        console.log("Alternative URLs if needed:", urls.slice(1));
      }
    },
    openFileInNewTab(url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    getFileName(filePath) {
      if (!filePath) return 'Unknown file';
      return filePath.split(/[\\/]/).pop();
    },
    goBack() {
      this.$router.go(-1);
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
  background-color: #f5f7fa;
}

.material-detail-container {
  flex: 1;
  padding: 1.5rem;
  max-width: 100%;
  margin: 0 auto;
  overflow-y: auto; 
  max-height: calc(100vh - 64px);
  background-color: #f5f7fa;
  position: relative; 
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  font-weight: 500;
  color: #4a5568;
}

.back-btn:hover {
  background-color: rgba(0, 123, 246, 0.8);
  color: #ffffff;
  transform: translateX(5px);
}
.material-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  padding-bottom: 2rem;
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

.material-header {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.material-header h1 {
  color: #1a202c;
  font-weight: 700;
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.material-meta {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  color: #718096;
}

.material-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content-section {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  min-height: 300px;
  color: #212121;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.content-section h2 {
  margin-bottom: 1.25rem;
  font-size: 1.25rem;
  color: #2d3748;
  font-weight: 600;
}

.content-section h3 {
  margin: 1.5rem 0 1rem;
  font-size: 1.1rem;
  color: #2d3748;
  font-weight: 600;
}

.content-section p {
  line-height: 1.6;
  color: #4a5568;
  font-size: 1rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #edf2f7;
}

.attachment-item:hover {
  background-color: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.attachment-item span {
  color: #4a5568;
  font-weight: 500;
  flex: 1;
}

.attachment-item i {
  color: #4a5568;
  font-size: 1.25rem;
}

.instruction-content {
  color: #4a5568;
  line-height: 1.6;
}

.upload-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #4299e1;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.comments-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 350px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.comments-section::-webkit-scrollbar {
  width: 6px;
}

.comments-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.comments-section::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.comments-section::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.comment-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
}

.comment-input textarea {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

.comment-input textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  background-color: white;
}

.post-comment-btn {
  align-self: flex-end;
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.post-comment-btn:hover:not(:disabled) {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.post-comment-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.comments-loading, .no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  color: #718096;
}

.loading-spinner {
  border: 3px solid #e2e8f0;
  border-top: 3px solid #4299e1;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.comment {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  margin-bottom: 0.75rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #edf2f7;
  transition: all 0.2s ease;
}

.comment:hover {
  background-color: #edf2f7;
}

.comment-avatar {
  width: 45px;
  height: 45px;
  background-color: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-avatar i {
  font-size: 20px;
  color: #718096;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.comment-header h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  margin-right: 0.75rem;
}

.comment-date {
  font-size: 0.85rem;
  color: #718096;
}

.delete-comment-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  opacity: 0.6;
  padding: 0.35rem;
  font-size: 0.85rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.delete-comment-btn:hover {
  opacity: 1;
  background-color: #fed7d7;
}

.comment-text {
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.comments-list {
  max-height: 350px;
  overflow-y: auto;
  margin-bottom: 1rem;
  border-radius: 8px;
  padding-right: 0.5rem;
}

.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
