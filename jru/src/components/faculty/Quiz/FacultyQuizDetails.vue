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
                  When: {{ formatDate(currentQuiz.quiz_date) }}
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

            <div
              class="content-section uploaded-materials"
              v-if="currentQuiz.file_path"
            >
              <h2>Quiz Materials:</h2>
              <div class="materials-list">
                <div
                  v-if="isExternalLink(currentQuiz.file_path)"
                  class="material-item"
                >
                  <i class="pi pi-link"></i>
                  <a :href="currentQuiz.file_path" target="_blank">
                    {{ currentQuiz.file_path }}
                  </a>
                </div>
                <div
                  v-else
                  class="material-item"
                  @click="downloadFile(currentQuiz.file_path)"
                >
                  <i class="pi pi-file"></i>
                  <span>{{ getFileName(currentQuiz.file_path) }}</span>
                  <i class="pi pi-download"></i>
                </div>
              </div>
            </div>
          </div>

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
                  :key="submission.submissionId"
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

      <div v-else>
        <p>No quiz found.</p>
      </div>
    </div>

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
            submissions: [],
            comments: [],
            isLoadingComments: false,
            newComment: '',
            userId: null
        };
    },
    methods: {
        async fetchQuiz() {
            try {
                const quizId = parseInt(this.$route.params.quizId); 

                const response = await axios.get(`http://127.0.0.1:8000/api/quizzes/item/${quizId}`);
                this.currentQuiz = response.data; 
                
                await this.fetchComments();
                await this.fetchSubmissions();
            } catch (error) {
                console.error("Error fetching quiz:", error);
                this.toast.error("Failed to load quiz details");
            }
        },

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

        async fetchSubmissions() {
            try {
                if (!this.currentQuiz?.quiz_id) return;
                
                try {
                    const response = await axios.get(
                        `http://127.0.0.1:8000/api/quiz_submissions/${this.currentQuiz.quiz_id}`
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
                    // Handle 404 error (no submissions) by setting empty array
                    if (error.response && error.response.status === 404) {
                        this.submissions = [];
                        console.log("No submissions found for this quiz");
                    } else {
                        throw error; // Re-throw other errors
                    }
                }
            } catch (error) {
                console.error("Error fetching submissions:", error);
                this.toast.error("Failed to load quiz submissions");
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

        formatDate(date) {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString();
        },

        getFileName(fileUrl) {
            if (!fileUrl) return 'Unknown File';
            if (this.isExternalLink(fileUrl)) return fileUrl;
            return fileUrl.split('/').pop();
        },

        openLink(fileUrl) {
            window.open(fileUrl, '_blank');
        },

        downloadFile(filePath) {
            if (this.isExternalLink(filePath)) {
                this.openLink(filePath);
                return;
            }
            
            const fileName = this.getFileName(filePath);
            if (fileName) {
                window.open(`http://127.0.0.1:8000/api/quizzes/download/${fileName}`, '_blank');
            }
        },

        goBack() {
            this.$router.push({
                name: 'FacultyQuizContent',
                params: { courseId: this.$route.params.courseId }
            });
        },

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
        },

        isExternalLink(path) {
            return path && (path.startsWith('http://') || path.startsWith('https://'));
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
    overflow: hidden;
    font-family: 'Roboto', sans-serif;
}

.course-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    background-color: #f5f7fa;
}

.quiz-detail-container {
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

.quiz-content {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 2rem;
    padding-bottom: 2rem;
}

.main-content {
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    background-color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.content-section-instructions {
    padding: 2rem;
    min-height: 300px;
    color: #212121;
}

.content-section-instructions h2 {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

.content-section-instructions p {
    line-height: 1.6;
    color: #4a5568;
}

.side-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 2rem;
}

.quiz-header {
    background-color: #ffffff;
    padding: 2rem;
    position: relative;
    border-bottom: 1px solid #edf2f7;
}

.header-content h1 {
    color: #1a202c;
    font-weight: 700;
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
}

.edit-btn {
    position: absolute;
    top: 2rem;
    right: 2rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #4299e1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.edit-btn:hover {
    background-color: #ebf8ff;
}

.quiz-meta {
    display: flex;
    gap: 2rem;
    margin-top: 1rem;
    color: #718096;
}

.quiz-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.content-section {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 8px;
    min-height: 300px;
    color: #212121;
}

.content-section h2 {
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    color: #2d3748;
    font-weight: 600;
}

.material-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background-color: #f9fafb;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    cursor: pointer;
    color: #212121;
    transition: all 0.2s ease;
    border: 1px solid #edf2f7;
}

.material-item:hover {
    background-color: #edf2f7;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.material-item a {
    color: #3182ce;
    text-decoration: none;
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.material-item a:hover {
    text-decoration: underline;
}

.material-item span {
    color: #4a5568;
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.material-item i {
    color: #4a5568;
    font-size: 1.25rem;
}

.content-section.uploaded-materials h2 {
    font-weight: 600;
    color: #2d3748;
}

.submission-container {
    padding: 1.5rem;
    border-radius: 12px;
    min-height: 200px;
    max-height: 400px;
    background-color: #ffffff;
    color: #212121;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.submission-container h2 {
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2d3748;
    font-size: 1.25rem;
}

.submission-stats {
    background-color: #ffffff;
}

.stats {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: 8px;
    border: 1px solid #edf2f7;
}

.submission-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    padding-right: 0.5rem;
    max-height: 300px;
}

.submission-list::-webkit-scrollbar {
    width: 6px;
}

.submission-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.submission-list::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 10px;
}

.submission-list::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
}

.submission-item {
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #edf2f7;
    transition: all 0.2s ease;
}

.submission-item:hover {
    background-color: #edf2f7;
    transform: translateX(2px);
}

.student-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status {
    padding: 0.35rem 0.85rem;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.85rem;
}

.status.submitted {
    background-color: #48bb78;
    color: white;
}

.status.pending {
    background-color: #ecc94b;
    color: #744210;
}

.status.graded {
    background-color: #4299e1;
    color: white;
}

.submission-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
}

.view-all-btn {
    background-color: #4299e1;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.view-all-btn:hover {
    background-color: #3182ce;
    transform: translateY(-1px);
}

.view-more {
    text-align: center;
    margin-top: 1rem;
}

.view-more button {
    background: none;
    border: none;
    color: #4299e1;
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.view-more button:hover {
    background-color: #ebf8ff;
    text-decoration: none;
}

.comments-section {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.comments-section h2 {
    margin-bottom: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    font-size: 1.25rem;
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
