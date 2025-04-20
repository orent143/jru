<template>
    <div class="dashboard-container">
        <Header @toggleSidebar="toggleSidebar" />
        <div class="dashboard-content">
            <SideBar :isCollapsed="isSidebarCollapsed" />
            <main class="dashboard-main">
                <div class="page-header">
                    <div class="page-header-content">
                        <h1>Quizzes</h1>
                        <p class="page-subtitle">Create and manage quizzes for your courses. Set time limits, add questions, and evaluate student performance with detailed analytics.</p>
                    </div>
                    <div class="header-actions">
                        <button @click="showCreateQuizForm = true" class="create-btn">
                            <i class="pi pi-plus"></i>
                            Create Quiz
                        </button>
                    </div>
                </div>

                <div v-if="loading" class="loading-container">
                    <i class="pi pi-spin pi-spinner"></i>
                    <p>Loading your quizzes...</p>
                </div>
                
                <div v-if="error" class="error-container">
                    <i class="pi pi-exclamation-triangle"></i>
                    <p>{{ error }}</p>
                </div>

                <div v-else-if="!loading && quizzes.length === 0" class="empty-state">
                    <i class="pi pi-file-excel"></i>
                    <h3>No Quizzes Available</h3>
                    <p>You haven't created any quizzes yet.</p>
                </div>

                <section v-else class="item-grid">
                    <div 
                        v-for="quiz in quizzes" 
                        :key="quiz.id" 
                        class="item-card" 
                        @click="startQuiz(quiz.id, quiz.course_id)"
                    >
                        <div class="course-color-indicator" :style="getRandomColorStyle()"></div>
                        <div class="card-content">
                            <div class="course-icon-container">
                            <div class="course-icon">
                                <i class="pi pi-check-square"></i>
                            </div>
                            <div class="card-header-contents">
                                <div class="card-header-desc">
                                    <h4>20 Lessons</h4>
                                    <h4>30 Students</h4>
                                </div>
                            <h3>{{ getCourseName(quiz.course_id) }}</h3>
                        </div>
                        </div>
                            <div class="card-header">
                                <span class="course-code">{{ getCourseSection(quiz.course_id) }}</span>
                            </div>
                            <div class="card-details">
                                <div class="detail-item">
                                    <i class="pi pi-clock"></i>
                                    <span>Duration: {{ quiz.duration || '30' }} minutes</span>
                                </div>
                                <div class="detail-item">
                                    <i class="pi pi-question"></i>
                                    <span>{{ quiz.questions_count || '0' }} Questions</span>
                                </div>
                            </div>
                            <div class="card-actions">
                                <button @click.stop="editQuiz(quiz.id)" class="action-button edit">
                                    <i class="pi pi-pencil"></i>
                                </button>
                                <button @click.stop="confirmDeleteQuiz(quiz.id)" class="action-button delete">
                                    <i class="pi pi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>

    <div v-if="showCreateQuizForm" class="modal">
        <div class="modal-content">
            <span class="close" @click="closeModal">&times;</span>
            <h2>Create Quiz</h2>
            <form @submit.prevent="createQuiz" class="form">
                <div class="form-group">
                    <label for="course">Course</label>
                    <select id="course" v-model="newQuiz.course_id" required>
                        <option value="" disabled selected>Select a course</option>
                        <option v-for="course in courses" :key="course.course_id" :value="course.course_id">
                            {{ course.course_name }} ({{ course.section }})
                        </option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="title">Quiz Title</label>
                    <input type="text" id="title" v-model="newQuiz.title" required>
                </div>
                
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" v-model="newQuiz.description" rows="3"></textarea>
                </div>
                  
                <div class="form-group">
                    <label for="duration">Duration (minutes)</label>
                    <input type="number" id="duration" v-model="newQuiz.duration" min="5" required>
                </div>

                <button type="submit" class="submit-btn">Create Quiz</button>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Header from '@/components/header.vue';
import SideBar from '@/components/faculty/SideBar.vue';

export default {
    components: {
        Header,
        SideBar
    },
    data() {
        return {
            isSidebarCollapsed: false,
            quizzes: [],
            courses: [],
            loading: false,
            error: null,
            showCreateQuizForm: false,
            newQuiz: {
                course_id: '',
                title: '',
                description: '',
                duration: 30
            },
            user: null,
            colorPalette: [
                '#4285F4', '#EA4335', '#FBBC05', '#34A853',
                '#1877F2', '#45BD62', '#F02849',
                '#0077B5', '#00A0DC',
                '#007BF6', '#6c5ce7', '#00cec9', '#e84393', '#00b894', '#6ab04c'
            ]
        };
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        async fetchQuizzes() {
            this.loading = true;
            this.error = null;
            
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    this.user = JSON.parse(storedUser);
                }

                if (!this.user || this.user.role !== 'faculty') {
                    this.error = "Unauthorized access.";
                    return;
                }

                const response = await axios.get(`http://127.0.0.1:8000/api/courses/?user_id=${this.user.user_id}`);
                this.quizzes = response.data;
            } catch (err) {
                this.error = 'Failed to fetch quizzes.';
            } finally {
                this.loading = false;
            }
        },
        async fetchCourses() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/courses/?user_id=${this.user.user_id}`);
                this.courses = response.data;
            } catch (err) {
                this.error = 'Failed to fetch courses.';
            } finally {
                this.loading = false;
            }
        },
        getCourseName(course_id) {
            const course = this.courses.find(course => course.course_id === course_id);
            return course ? course.course_name : 'Unknown Course';
        },
        getCourseSection(course_id) {
            const course = this.courses.find(course => course.course_id === course_id);
            return course ? course.section : 'Unknown Section';
        },
        async createQuiz() {
            try {
                if (!this.user) return;
                
                const response = await axios.post('http://127.0.0.1:8000/api/quizzes/', {
                    title: this.newQuiz.title,
                    description: this.newQuiz.description,
                    duration: this.newQuiz.duration,
                    course_id: this.newQuiz.course_id,
                    user_id: this.user.user_id
                });
                
                this.quizzes.push({ ...this.newQuiz, id: response.data.id });
                this.showCreateQuizForm = false;
                this.resetForm();
            } catch (err) {
                this.error = 'Failed to create quiz.';
            }
        },
        editQuiz(quizId) {
            console.log(`Edit quiz ${quizId}`);
        },
        confirmDeleteQuiz(quizId) {
            console.log(`Confirm delete quiz ${quizId}`);
        },
        startQuiz(quizId, courseId) {
            this.$router.push({ 
                name: 'FacultyQuizContent', 
                params: { quizId, courseId } 
            });
        },
        closeModal() {
            this.showCreateQuizForm = false;
        },
        resetForm() {
            this.newQuiz = {
                course_id: '',
                title: '',
                description: '',
                duration: 30
            };
        },
        getRandomColorStyle() {
            const colorIndex = Math.floor(Math.random() * this.colorPalette.length);
            return { backgroundColor: this.colorPalette[colorIndex] };
        }
    },
    mounted() {
        this.fetchQuizzes();
        this.fetchCourses();
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
    color: #6c757d;
    font-size: 1rem;
}

.header-actions {
    display: flex;
    align-items: center;
}

.create-btn {
    background-color: #007BF6;
    color: white;
    border: none;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
}

.create-btn:hover {
    background-color: #0066cc;
}

.create-btn i {
    font-size: 0.9rem;
}

.loading-container, .empty-state, .error-container {
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

.loading-container i, .empty-state i, .error-container i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.loading-container i, .empty-state i {
    color: #007BF6;
}

.error-container i {
    color: #dc3545;
}

.empty-state h3, .error-container h3 {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
}

.empty-state p, .loading-container p, .error-container p {
    color: #6c757d;
    margin: 0;
}

.item-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.item-card {
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    height: 100%;
    position: relative;
}

.item-card:hover {
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
.course-icon-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.card-header-contents {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.card-header-desc {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.card-header-desc h4 {
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 500;
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

.course-icon-container h3 {
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

.card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.action-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
}

.action-button.edit {
    background-color: #f8f9fa;
    color: #0d6efd;
}

.action-button.edit:hover {
    background-color: #e2e6ea;
}

.action-button.delete {
    background-color: #f8f9fa;
    color: #dc3545;
}

.action-button.delete:hover {
    background-color: #e2e6ea;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    position: relative;
    width: 400px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-content h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1.5rem;
}

.close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    color: #6c757d;
    cursor: pointer;
    transition: color 0.2s;
}

.close:hover {
    color: #343a40;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #007BF6;
    box-shadow: 0 0 0 3px rgba(0, 123, 246, 0.25);
}

.submit-btn {
    background-color: #007BF6;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 0.5rem;
}

.submit-btn:hover {
    background-color: #0066cc;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .item-grid {
        grid-template-columns: 1fr;
    }
}
</style>