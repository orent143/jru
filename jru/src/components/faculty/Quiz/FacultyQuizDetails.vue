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
  
        <div class="quiz-detail-container" v-if="currentQuiz">
          <button class="back-btn" @click="goBack">
            <i class="pi pi-arrow-left"></i> Back to Quizzes
          </button>
  
          <div class="quiz-content">
            <!-- Main Content -->
            <div class="main-content">
              <div class="quiz-header">
                <div class="header-content">
                  <h1>{{ currentQuiz.title }}</h1>
                  <button class="edit-btn" @click="editQuiz">
                    <i class="pi pi-pencil"></i> Edit
                  </button>
                </div>
  
                <div class="quiz-meta">
                  <span class="posted-date">
                    <i class="pi pi-calendar"></i>
                    Posted: {{ formatDate(currentQuiz.quiz_date) }}
                  </span>
                  <span class="duration">
                    <i class="pi pi-clock"></i>
                    Duration: {{ currentQuiz.duration_minutes }} mins
                  </span>
                </div>
              </div>
  
              <div class="content-section-instructions">
                <h2>Instructions:</h2>
                <p>{{ currentQuiz.description }}</p>
              </div>
  
              <!-- Quiz Materials -->
              <div
                class="content-section uploaded-materials"
                v-if="currentQuiz.external_link"
              >
                <h2>Quiz Materials:</h2>
                <div class="materials-list">
                  <div
                    class="material-item"
                    @click="openLink(currentQuiz.external_link)"
                  >
                    <i class="pi pi-link"></i>
                    <span>{{ getFileName(currentQuiz.external_link) }}</span>
                    <i class="pi pi-external-link"></i>
                  </div>
                </div>
              </div>
              
            </div>
  
            <!-- Side Content: Submissions -->
            <div class="side-content">
              <div class="submission-container" v-if="submissions.length">
                <div class="submission-header">
                  <h2>Submissions</h2>
                  <button class="view-all-btn" @click="viewAllSubmissions">
                    <i class="pi pi-list"></i> View All Submissions
                  </button>
                </div>
  
                <div class="submission-list">
                  <div
                    class="submission-item"
                    v-for="(submission, index) in submissions.slice(0, 3)"
                    :key="index"
                  >
                    <div class="student-info">
                      <span>{{ submission.studentName }}</span>
                      <span>{{ formatDate(submission.submissionDate) }}</span>
                      <span
                        :class="['status', submission.status.toLowerCase()]"
                      >
                        {{ submission.status }}
                      </span>
                    </div>
                  </div>
  
                  <div v-if="submissions.length > 3" class="view-more">
                    <button @click="viewAllSubmissions">
                      View {{ submissions.length - 3 }} more submissions...
                    </button>
                  </div>
                </div>
              </div>

                 <!-- Comments Section -->
                 <div class="comments-section">
              <h2>Comments</h2>
<!-- Loading -->
<div v-if="isLoadingComments" class="comments-loading">
                <div class="loading-spinner"></div>
                <p>Loading comments...</p>
              </div>

              <!-- No comments -->
              <div v-else-if="comments.length === 0" class="no-comments">
                <p>No comments yet.</p>
              </div>

              <!-- Comment List -->
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
              
              <!-- Input -->
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
            </div> <!-- end of side-content -->
          </div> <!-- end of quiz-content -->
        </div>
  
        <div v-else>
          <p>No quiz found.</p>
        </div>
      </div>
  
      <!-- Edit Modal -->
      <EditQuizModal
        v-if="showEditModal"
        :quiz="currentQuiz"
        @update-quiz="handleQuizUpdate"
        @close="showEditModal = false"
      />
    </div>
  </template>
  
<script>
import Header from '../../header.vue';
import Sidebar from '../SideBar.vue';
import axios from 'axios';
import EditQuizModal from './EditQuizModal.vue';
import { useToast } from 'vue-toastification';

export default {
    components: { 
        Header, 
        Sidebar,
        EditQuizModal
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
            currentQuiz: null,
            showEditModal: false,
            submissions: [
                {
                    studentName: 'John Doe',
                    submissionDate: '2025-03-25',
                    status: 'Submitted'
                },
                {
                    studentName: 'Jane Smith',
                    submissionDate: '2025-03-26',
                    status: 'Pending'
                }
            ],
            // Comments-related data
            comments: [],
            isLoadingComments: false,
            newComment: '',
            userId: null
        };
    },
    methods: {
        // Fetch quiz details
        async fetchQuiz() {
            try {
                const quizId = parseInt(this.$route.params.quizId); // Get quiz_id from route

                const response = await axios.get(`http://127.0.0.1:8000/api/quizzes/item/${quizId}`);
                this.currentQuiz = response.data; // Set current quiz with the fetched data
                
                // Fetch comments
                await this.fetchComments();
            } catch (error) {
                console.error("Error fetching quiz:", error);
                this.toast.error("Failed to load quiz details");
            }
        },

        // Comment-related methods
        async fetchComments() {
            try {
                if (!this.currentQuiz?.quiz_id) return;
                
                this.isLoadingComments = true;
                const response = await axios.get(
                    `http://127.0.0.1:8000/api/comments/quiz/${this.currentQuiz.quiz_id}`
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
            if (!this.newComment.trim() || !this.currentQuiz?.quiz_id) return;
            
            try {
                const commentData = {
                    user_id: this.userId,
                    entity_type: "quiz",
                    entity_id: this.currentQuiz.quiz_id,
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

        // Format the date for display
        formatDate(date) {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString();
        },

        // Extract the file name from the URL (external link)
        getFileName(fileUrl) {
            return fileUrl ? fileUrl.split('/').pop() : 'Unknown File';
        },

        // Open the external link in a new window/tab
        openLink(fileUrl) {
            window.open(fileUrl, '_blank');
        },

        // Navigate back to the quizzes list
        goBack() {
            this.$router.push({
                name: 'FacultyQuizContent',
                params: { courseId: this.$route.params.courseId }
            });
        },

        // Edit quiz details
        editQuiz() {
            this.showEditModal = true;
        },

        handleQuizUpdate(updatedQuiz) {
            this.currentQuiz = updatedQuiz;
            this.showEditModal = false;
        },

        viewAllSubmissions() {
            this.$router.push({
                name: 'QuizSubmissions',
                params: { 
                    courseId: this.$route.params.courseId,
                    quizId: this.$route.params.quizId 
                }
            });
        }
    },

    // Fetch quiz when the component is mounted
    mounted() {
        // Get user data for comments
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.userId = user.user_id;
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
        
        const quizId = this.$route.params.quizId;
        if (quizId) {
            this.fetchQuiz();
        }
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

.quiz-detail-container {
    flex: 1;
    padding: 1rem;
    max-width: 100%;
    margin: 0 auto;
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

.quiz-content {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 2rem;
    height: auto;
    margin-bottom: 5rem;
}

.main-content {
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    background-color: #D9D9D9;
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

.quiz-header {
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

.quiz-meta {
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
}
.submission-container{
    padding: 1.5rem;
    border-radius: 8px;
    min-height: 300px;
    background-color: #D9D9D9;
    color: #212121;
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

.view-more {
    text-align: center;
    margin-top: 1rem;
}

.view-more button {
    background: none;
    border: none;
    color: #007BF6;
    cursor: pointer;
    font-size: 0.9rem;
}

.view-more button:hover {
    text-decoration: underline;
}

/* Add comments section styles */
.comments-section {
    background-color: #D9D9D9;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
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
</style>
