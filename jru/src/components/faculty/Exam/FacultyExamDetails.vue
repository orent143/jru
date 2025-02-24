<template>
    <div class="course-content-container">
        <Header :teacher="teacher" :searchQuery="searchQuery" :student="student" @toggleSidebar="toggleSidebar" />
        <div class="course-content">
            <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
            <div class="exam-detail-container" v-if="currentExam">
                <button class="back-btn" @click="goBack">
                    <i class="pi pi-arrow-left"></i> Back to Exams
                </button>

                <div class="exam-content">
                    <div class="main-content">
                        <div class="exam-header">
                            <div class="header-content">
                                <h1>{{ currentExam.title }}</h1>
                                <button class="edit-btn" @click="editExam">
                                    <i class="pi pi-pencil"></i> Edit
                                </button>
                            </div>
                            <div class="exam-meta">
                                <span class="posted-date">
                                    <i class="pi pi-calendar"></i> 
                                    Posted: {{ formatDate(currentExam.exam_date) }}
                                </span>
                            </div>
                        </div>

                        <div class="content-section instructions">
                            <h2>Instructions</h2>
                            <p>{{ currentExam.description }}</p>
                        </div>

                        <div class="content-section uploaded-materials" v-if="currentExam.file_path">
                            <h2>Exam Materials</h2>
                            <div class="materials-list">
                                <div class="material-item" @click="downloadAttachment(currentExam.file_path)">
                                    <i class="pi pi-file"></i>
                                    <span>{{ getFileName(currentExam.file_path) }}</span>
                                    <i class="pi pi-download"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <p>No exam found.</p>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Header from '../header.vue';
import Sidebar from '../SideBar.vue';

export default {
    name: 'FacultyExamDetails',
    components: {
        Header,
        Sidebar
    },
    data() {
        return {
            courseId: this.$route.params.courseId,
            examId: this.$route.params.examId,
            currentExam: null
        };
    },
    methods: {
        async fetchExam() {
            try {
                const courseId = this.$route.params.courseId;
                const examId = parseInt(this.$route.params.examId);

                if (!courseId || !examId) {
                    console.error("Missing courseId or examId in route params.");
                    return;
                }

                const response = await axios.get(`http://127.0.0.1:8000/api/exams/${courseId}`);
                console.log("Fetched exams:", response.data);

                this.currentExam = response.data.exams.find(exam => exam.exam_id === examId);

                if (!this.currentExam) {
                    console.error("Exam not found for given examId:", examId);
                }
            } catch (error) {
                console.error('Error fetching exam:', error);
            }
        },
        goBack() {
            this.$router.push({ 
                name: 'FacultyExamContent', 
                params: { courseId: this.$route.params.courseId } 
            });
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        },
        getFileName(filePath) {
            return filePath ? filePath.split('/').pop() : 'Unknown File';
        },
        downloadAttachment(filePath) {
            window.open(filePath, '_blank');
        },
        editExam() {
            this.$router.push(`/edit-exam/${this.currentExam.exam_id}`);
        }
    },
    mounted() {
        this.fetchExam();
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

.exam-detail-container {
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

.exam-content {
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

.exam-header {
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