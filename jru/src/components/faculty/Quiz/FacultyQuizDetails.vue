<template>
    <div class="course-content-container">
        <Header :teacher="teacher" :searchQuery="searchQuery" :student="student" @toggleSidebar="toggleSidebar" />
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
                                    Posted: {{ formatDate(currentQuiz.datePosted) }}
                                </span>
                                <span class="due-date">
                                    <i class="pi pi-clock"></i>
                                    Due: {{ formatDate(currentQuiz.dueDate) }}
                                </span>
                            </div>
                        </div>

                        <div class="content-section instructions">
                            <h2>Instructions</h2>
                            <p>{{ currentQuiz.description }}</p>
                        </div>

                        <div class="content-section uploaded-materials">
                            <h2>Quiz Materials</h2>
                            <div class="materials-list">
                                <div v-for="file in currentQuiz.attachments" 
                                         :key="file.id"
                                         class="material-item"
                                         @click="downloadAttachment(file)">
                                    <i :class="getFileIcon(file.type)"></i>
                                    <span>{{ file.name }}</span>
                                    <i class="pi pi-download"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="side-content">
                        <div class="content-section submission-stats">
                            <h2>Submission Status</h2>
                            <div class="stats">
                                <div class="stat-item">
                                    <span>Submitted</span>
                                    <span class="count">{{ submittedCount }}/{{ totalStudents }}</span>
                                </div>
                                <div class="stat-item">
                                    <span>Pending</span>
                                    <span class="count">{{ pendingCount }}/{{ totalStudents }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="content-section student-submissions">
                            <h2>Student Submissions</h2>
                            <div class="submission-list">
                                <div v-for="submission in studentSubmissions" 
                                         :key="submission.studentId"
                                         class="submission-item">
                                    <div class="student-info">
                                        <span>{{ submission.studentName }}</span>
                                        <span :class="['status', submission.status.toLowerCase()]">
                                            {{ submission.status }}
                                        </span>
                                    </div>
                                    <div class="submission-date" v-if="submission.submittedDate">
                                        Submitted: {{ formatDate(submission.submittedDate) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <p>No quiz found.</p>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '../header.vue';
import Sidebar from '../SideBar.vue';

export default {
    name: 'FacultyQuizDetails',
    components: {
        Header,
        Sidebar
    },
    data() {
        return {
            teacher: { name: 'Professor Smith' },
            searchQuery: '',
            isSidebarCollapsed: false,
            student: {
                name: 'John Doe',
                id: '12345'
            },
            courses: [
                {
                    id: 1,
                    name: 'ITELECT4',
                    sections: [{ id: 1, name: 'BSCS-3A' }],
                    quizzes: [
                        {
                            id: 1,
                            title: 'Quiz 1',
                            description: 'This is the first quiz.',
                            datePosted: '2024-02-01',
                            dueDate: '2024-02-15',
                            attachments: [
                                { id: 1, name: 'quiz_specs.pdf', type: 'pdf' }
                            ],
                            studentSubmissions: [
                                {
                                    studentId: 1,
                                    studentName: 'John Smith',
                                    status: 'Submitted',
                                    submittedDate: '2024-02-14'
                                },
                                {
                                    studentId: 2,
                                    studentName: 'Alice Johnson',
                                    status: 'Pending',
                                    submittedDate: null
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    },
    computed: {
        currentQuiz() {
            if (!this.course) return null;
            const quizId = parseInt(this.$route.params.quizId);
            return this.course.quizzes.find(q => q.id === quizId) || null;
        },
        course() {
            const courseId = parseInt(this.$route.params.courseId);
            return this.courses.find(c => c.id === courseId);
        },
        submittedCount() {
            return this.currentQuiz?.studentSubmissions.filter(s => s.status === 'Submitted').length || 0;
        },
        pendingCount() {
            return this.currentQuiz?.studentSubmissions.filter(s => s.status === 'Pending').length || 0;
        },
        totalStudents() {
            return this.currentQuiz?.studentSubmissions.length || 0;
        },
        studentSubmissions() {
            return this.currentQuiz?.studentSubmissions || [];
        }
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        goBack() {
            if (this.course) {
                this.$router.push({
                    name: 'FacultyQuiz',
                    params: { courseId: this.$route.params.courseId }
                });
            } else {
                this.$router.push({ name: 'Home' });
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        getFileIcon(type) {
            const icons = {
                pdf: 'pi pi-file-pdf',
                docx: 'pi pi-file-word',
                zip: 'pi pi-file-export',
                default: 'pi pi-file'
            };
            return icons[type] || icons.default;
        },
        editQuiz() {
            // Implement edit quiz logic
        },
        downloadAttachment(file) {
            // Implement download logic
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

.quiz-header {
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