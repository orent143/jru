<template>
  <div class="course-content-container">
    <Header
      :teacher="teacher"
      :searchQuery="searchQuery"
      :student="student"
      @toggleSidebar="toggleSidebar"
    />

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
                <button class="edit-btn" @click="showEditModal = true">
                  <i class="pi pi-pencil"></i> Edit
                </button>
              </div>

              <div class="assignment-meta">
                <span class="posted-date">
                  <i class="pi pi-calendar"></i> Posted: {{ formatDate(currentAssignment.created_at) }}
                </span>
                <span class="due-date">
                  <i class="pi pi-clock"></i> Due: {{ formatDate(currentAssignment.due_date) }}
                </span>
              </div>
            </div>

            <div class="content-section-instructions">
              <h2>Instructions:</h2>
              <p>{{ currentAssignment.description }}</p>
            </div>

            <div
              class="content-section uploaded-materials"
              v-if="currentAssignment.file_path"
            >
              <h2>Assignment Materials:</h2>
              <div class="materials-list">
                <div
                  v-if="isExternalLink(currentAssignment.file_path)"
                  class="material-item"
                >
                  <i class="pi pi-link"></i>
                  <a :href="currentAssignment.file_path" target="_blank">
                    {{ currentAssignment.file_path }}
                  </a>
                </div>
                <div
                  v-else
                  class="material-item"
                  @click="downloadAttachment(currentAssignment.file_path)"
                >
                  <i class="pi pi-file"></i>
                  <span>{{ getFileName(currentAssignment.file_path) }}</span>
                  <i class="pi pi-download"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="side-content">
            <div class="submission-container" v-if="submissions.length">
              <div class="submission-header">
                <h2>Submissions:</h2>
                <button class="view-all-btn" @click="viewAllSubmissions">
                  <i class="pi pi-list"></i> View All Submissions
                </button>
              </div>

              <div class="submission-list">
                <div
                  class="submission-item"
                  v-for="(submission, index) in submissions"
                  :key="submission.submissionId"
                >
                  <div class="student-info">
                    <span>{{ submission.studentName }}</span>
                    <span>{{ formatDate(submission.submissionDate) }}</span>
                    <span :class="['status', submission.status.toLowerCase()]">
                      {{ submission.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="comments-section">
              <h2>Comments</h2>
<div v-if="isLoadingComments" class="comments-loading">
                <div class="loading-spinner"></div>
                <p>Loading comments...</p>
              </div>

              <div v-else-if="comments.length === 0" class="no-comments">
                <p>No comments yet.</p>
              </div>

              <div v-else class="comments-list">
                <div
                  v-for="comment in comments"
                  :key="comment.comment_id"
                  class="comment"
                >
                  <div class="comment-avatar">
                    <i class="pi pi-user"></i>
                  </div>

                  <div class="comment-content">
                    <div class="comment-header">
                      <h4>{{ comment.user_name }}</h4>
                      <span class="comment-date">{{ formatDate(comment.created_at) }}</span>

                      <button
                        v-if="comment.user_id === userId"
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
                  @click="postComment"
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

    <EditAssignmentModal
      v-if="showEditModal"
      :assignment="currentAssignment"
      @update-assignment="handleAssignmentUpdate"
      @close="showEditModal = false"
    />
  </div>
</template>

<script>
import axios from 'axios';
import Header from '../../header.vue';
import Sidebar from '../SideBar.vue';
import EditAssignmentModal from './EditAssignmentModal.vue';
import { useToast } from 'vue-toastification';

export default {
  name: 'FacultyAssignmentDetails',
  components: {
    Header,
    Sidebar,
    EditAssignmentModal
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      teacher: {},
      searchQuery: '',
      isSidebarCollapsed: false,
      courses: [],
      currentAssignment: null,
      showEditModal: false,
      submissions: [],
      comments: [],
      isLoadingComments: false,
      newComment: '',
      userId: null
    };
  },
  methods: {
    async fetchAssignment() {
      try {
        const assignmentId = this.$route.params.assignmentId;
        const response = await axios.get(`http://127.0.0.1:8000/api/assignments/item/${assignmentId}`);
        this.currentAssignment = response.data;
        if (this.currentAssignment.file_path) {
          this.currentAssignment.file_path = this.currentAssignment.file_path.replace(/\\+/g, '/');
        }
        
        await this.fetchComments();
        await this.fetchSubmissions();
      } catch (error) {
        console.error('Error fetching assignment:', error);
        this.toast.error('Failed to load assignment details');
      }
    },
    
    async fetchSubmissions() {
      try {
        if (!this.currentAssignment?.assignment_id) return;
        
        const response = await axios.get(
          `http://127.0.0.1:8000/api/assignment_submissions/${this.currentAssignment.assignment_id}`
        );
        
        this.submissions = response.data.submissions.map(sub => ({
          submissionId: sub.submission_id,
          studentId: sub.student_id,
          studentName: sub.student_name,
          submissionDate: sub.submitted_at,
          status: sub.grade !== null ? 'Graded' : 'Submitted',
          grade: sub.grade,
          feedback: sub.feedback
        }));
      } catch (error) {
        console.error("Error fetching submissions:", error);
        this.toast.error("Failed to load assignment submissions");
      }
    },
    
    async fetchComments() {
      try {
        if (!this.currentAssignment?.assignment_id) return;
        
        this.isLoadingComments = true;
        const response = await axios.get(
          `http://127.0.0.1:8000/api/comments/assignment/${this.currentAssignment.assignment_id}`
        );
        this.comments = response.data;
        this.isLoadingComments = false;
      } catch (error) {
        console.error("Error fetching comments:", error);
        this.toast.error("Failed to load comments");
        this.isLoadingComments = false;
      }
    },
    
    async postComment() {
      if (!this.newComment.trim() || !this.currentAssignment?.assignment_id) return;
      
      try {
        const commentData = {
          user_id: this.userId,
          entity_type: "assignment",
          entity_id: this.currentAssignment.assignment_id,
          content: this.newComment
        };
        
        const response = await axios.post(
          "http://127.0.0.1:8000/api/comments/",
          commentData
        );
        
        if (response.status === 200) {
          this.toast.success("Comment posted successfully");
          this.newComment = "";
          await this.fetchComments();
        }
      } catch (error) {
        console.error("Error posting comment:", error);
        this.toast.error("Failed to post comment");
      }
    },
    
    async deleteComment(commentId) {
      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/comments/${commentId}?user_id=${this.userId}`
        );
        
        if (response.status === 200) {
          this.toast.success("Comment deleted successfully");
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
    getFileName(fileUrl) {
      return fileUrl ? fileUrl.split('/').pop() : 'Unknown File';
    },
    isExternalLink(filePath) {
      return filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'));
    },
    downloadAttachment(fileUrl) {
      if (this.isExternalLink(fileUrl)) {
        window.open(fileUrl, '_blank');
      } else {
        const downloadUrl = `http://127.0.0.1:8000/api/assignments/download/${encodeURIComponent(fileUrl.split('/').pop())}`;
        window.open(downloadUrl, '_blank');
      }
    },
    goBack() {
      this.$router.push({ name: 'FacultyAssignmentContent', params: { courseId: this.$route.params.courseId } });
    },
    editAssignment() {
      this.$router.push(`/edit-assignment/${this.currentAssignment.assignment_id}`);
    },
    viewAllSubmissions() {
      this.$router.push({
        name: 'FacultyAssignmentSubmissions',
        params: {
          courseId: this.$route.params.courseId,
          assignmentId: this.$route.params.assignmentId
        }
      });
    },
    handleAssignmentUpdate(updatedAssignment) {
      this.currentAssignment = updatedAssignment;
      this.showEditModal = false;
    }
  },
  mounted() {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userId = user.user_id;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
    this.fetchAssignment();
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

.assignment-detail-container {
    flex: 1;
    padding: 1rem;
    max-width: 100%;
    margin: 0 auto;
    overflow-y: auto;
    max-height: calc(100vh - 64px);
    background-color: #fff;
    position: relative;
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
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.9);
}

.back-btn:hover {
    background-color: #f0f0f0;
}

.assignment-content {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 2rem;
    padding-bottom: 2rem;
}

.main-content {
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    background-color: #D9D9D9;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.274);
}
.content-section-instructions{
    padding: 1.5rem;
    border-radius: 8px;
    min-height: 300px;
    color: #212121;
}

.content-section-instructions h2{
  font-weight: bold;
    color: #212121;
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
    font-weight: bold;
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
    font-weight: bold;
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
    color: #212121;
}

.material-item a {
    color: #007BF6;
    text-decoration: none;
    font-weight: 500;
}

.material-item a:hover {
    text-decoration: underline;
}

.material-item span {
    color: #212121;
    font-weight: 500;
}

.material-item i {
    color: #444;
    font-size: 1.25rem;
}

.content-section.uploaded-materials h2 {
    font-weight: bold;
    color: #212121;
}

.submission-container{
    padding: 1.5rem;
    border-radius: 8px;
    min-height: 200px;
    max-height: 400px;
    background-color: #D9D9D9;
    color: #212121;
    overflow-y: auto;
    
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.274);
}

.submission-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.view-all-btn {
    background-color: #007BF6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.view-all-btn:hover {
    background-color: #005bb5;
}

.submission-container h2{
  font-weight: bold;
  margin-bottom:10px;
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

.status.graded {
    background-color: #007BF6;
    color: white;
}

.comments-section {
  background-color: #D9D9D9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
  
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.274);
}

.comments-section h2 {
  margin-bottom: 1rem;
  font-weight: bold;
  color: #212121;
}

.comment-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.comment-input textarea {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  background-color: white;
}

.comment-input textarea:focus {
  outline: none;
  border-color: #007BF6;
  box-shadow: 0 0 0 2px rgba(0, 123, 246, 0.1);
}

.post-comment-btn {
  align-self: flex-end;
  background-color: #007BF6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.post-comment-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.post-comment-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.comments-loading, .no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007BF6;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.comment {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 0.5rem;
  background-color: white;
  border-radius: 8px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-avatar i {
  font-size: 20px;
  color: #6c757d;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-header h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  margin-right: 0.5rem;
}

.comment-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.delete-comment-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  opacity: 0.5;
  padding: 0.25rem;
  font-size: 0.8rem;
}

.delete-comment-btn:hover {
  opacity: 1;
}

.comment-text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.comments-list {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 1rem;
    border-radius: 8px;
}
</style>
