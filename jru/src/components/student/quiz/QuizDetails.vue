<template>
    <div class="quiz-details-container">
        <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="quiz-detail">
            <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
            <div class="quiz-detail-container" v-if="currentQuiz">
                <button class="back-btn" @click="goBack">
                    <i class="pi pi-arrow-left"></i> Back to Course
                </button>

                <div class="quiz-content">
                    <div class="main-content">
                        <div class="quiz-header">
                            <div class="header-content">
                                <h1>{{ currentQuiz.title }}</h1>
                                <div class="quiz-meta">
                                    <span class="posted-date">
                                        <i class="pi pi-calendar"></i>
                                        Posted: {{ formatDate(currentQuiz.quiz_date) }}
                                    </span>
                                    <span class="status" :class="getQuizStatus(currentQuiz)">
                                        {{ getQuizStatus(currentQuiz) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="content-section instructions">
                            <h2>Instructions</h2>
                            <div class="instruction-content">
                                <p>{{ currentQuiz.description }}</p>
                                <div class="attachments" v-if="currentQuiz.external_link">
                                    <h3>External Link</h3>
                                    <div class="attachment-item" @click="openExternalLink(currentQuiz.external_link)">
                                        <i class="pi pi-link"></i>
                                        <span>{{ currentQuiz.external_link }}</span>
                                        <i class="pi pi-external-link"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="side-content">
                        <div class="content-section submission">
                            <h2>Your Work</h2>
                            <div class="submission-area">
                                <div class="submission-status">
                                    <div class="status-indicator" :class="getQuizStatus(currentQuiz)">
                                        {{ getQuizStatus(currentQuiz) }}
                                    </div>
                                </div>
                                <div class="submission-actions">
                                    <button class="upload-btn primary" @click="submitQuiz">
                                        <i class="pi pi-upload"></i> Submit Quiz
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="content-section comments">
                            <h2>Class Comments</h2>
                            <div class="comments-section">
                                <div class="comment-input">
                                    <input 
                                        type="text" 
                                        v-model="newComment" 
                                        placeholder="Add class comment..." 
                                        @keyup.enter="addComment" 
                                    />
                                    <button class="send-btn" @click="addComment">
                                        <i class="pi pi-send"></i>
                                    </button>
                                </div>
                                <div class="comments-list">
                                    <div v-for="comment in comments" :key="comment.id" class="comment">
                                        <img :src="comment.authorAvatar" :alt="comment.author" />
                                        <div class="comment-content">
                                            <div class="comment-header">
                                                <h4>{{ comment.author }}</h4>
                                                <span class="comment-date">{{ formatDate(comment.date) }}</span>
                                            </div>
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
    </div>
</template>


<script>
import Header from '../Header.vue';
import Sidebar from '../Sidebar.vue';
import axios from 'axios';

export default {
    name: 'QuizDetails',
    components: {
        Header,
        Sidebar
    },
    data() {
        return {
            student: { id: 27, name: 'John Doe' }, // Adjust to your current student ID
            searchQuery: '',
            isSidebarCollapsed: false,
            courses: [],
            currentQuiz: null,
            comments: [],
            newComment: ''
        };
    },
    async created() {
        await this.fetchQuizDetails();
    },
    methods: {
        // ✅ Fetch quizzes for the current student and course
        async fetchQuizDetails() {
            try {
                const studentId = this.student.id;
                const courseId = parseInt(this.$route.params.courseId);
                
                const response = await axios.get(`http://127.0.0.1:8000/api/student_quizzes/${studentId}/${courseId}`);

                if (response.status === 200) {
                    const quizId = parseInt(this.$route.params.quizId);
                    const data = response.data;

                    // Map quizzes to courses
                    this.courses = [{
                        id: courseId,
                        name: data.course_name,
                        quizzes: data.quizzes
                    }];

                    // Find the specific quiz by ID
                    this.currentQuiz = data.quizzes.find(q => q.quiz_id === quizId);

                    if (!this.currentQuiz) {
                        console.error('Quiz not found');
                    }
                }
            } catch (error) {
                console.error('Error fetching quiz details:', error);
            }
        },

        // ✅ Handle quiz submission
        async submitQuiz() {
            try {
                const submission = {
                    student_id: this.student.id,
                    quiz_id: this.currentQuiz.quiz_id,
                    answers: {}  // Send actual quiz answers here
                };

                const response = await axios.post('http://127.0.0.1:8000/api/quiz_submissions/', submission);

                if (response.status === 200) {
                    alert('Quiz submitted successfully!');
                }
            } catch (error) {
                console.error('Error submitting quiz:', error);
            }
        },

        openExternalLink(url) {
            window.open(url, '_blank');
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

        goBack() {
            this.$router.push({
                name: 'QuizContent',
                params: { courseId: this.$route.params.courseId }
            });
        },

        getQuizStatus(quiz) {
            // Example status logic (you can modify as needed)
            return quiz ? 'Not Submitted' : 'Submitted';
        },

        addComment() {
            if (this.newComment.trim()) {
                const newCommentObj = {
                    id: Date.now(),
                    author: this.student.name,
                    authorAvatar: '/avatar.png',
                    text: this.newComment,
                    date: new Date().toISOString()
                };
                this.comments.unshift(newCommentObj);
                this.newComment = '';
            }
        }
    }
};
</script>


<style scoped>
.quiz-details-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.quiz-detail {
    display: flex;
    flex: 1;
}

.quiz-detail-container {
    flex: 1;
    padding: 1rem;
    max-width: 100%;
    margin: 0 auto;
    overflow-y: auto; /* This will enable vertical scrolling */
    max-height: 100%;
    background-color: #fff;
    /* Set a maximum height for the container */
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

.quiz-header {
    background-color: #D9D9D9;
    padding: 2rem;
    border-radius: 8px;
}

.quiz-header h1 {
    color: #333;
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