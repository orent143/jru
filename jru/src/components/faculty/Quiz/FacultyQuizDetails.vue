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

                        <div class="content-section uploaded-materials" v-if="currentQuiz.external_link">
                            <h2>Quiz Materials:</h2>
                            <div class="materials-list">
                                <div class="material-item" @click="openLink(currentQuiz.external_link)">
                                    <i class="pi pi-link"></i>
                                    <span>{{ getFileName(currentQuiz.external_link) }}</span>
                                    <i class="pi pi-external-link"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                
                    <div class="submission-container" v-if="submissions.length">
                        <h2>Submissions:</h2>
                        <div class="submission-list">
                            <div class="submission-item" v-for="(submission, index) in submissions" :key="index">
                                <div class="student-info">
                                    <span>{{ submission.studentName }}</span>
                                    <span>{{ formatDate(submission.submissionDate) }}</span>
                                    <span :class="['status', submission.status.toLowerCase()]">{{ submission.status }}</span>
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
import axios from 'axios';

export default {
    components: { Header, Sidebar },
    data() {
        return {
            currentQuiz: null,
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
            ]
        };
    },
    methods: {
        // Fetch quiz details
        async fetchQuiz() {
            try {
                const quizId = parseInt(this.$route.params.quizId); // Get quiz_id from route

                const response = await axios.get(`http://127.0.0.1:8000/api/quizzes/item/${quizId}`);
                this.currentQuiz = response.data; // Set current quiz with the fetched data
            } catch (error) {
                console.error("Error fetching quiz:", error);
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
            this.$router.push(`/edit-quiz/${this.currentQuiz.quiz_id}`);
        }
    },

    // Fetch quiz when the component is mounted
    mounted() {
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
</style>
