<template>
    <div class="submissions-container">
        <Header :teacher="teacher" :searchQuery="searchQuery" :student="student" @toggleSidebar="toggleSidebar" />
        <div class="submissions-content">
            <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
            <div class="submissions-main" v-if="exam">
                <div class="header-section">
                    <button class="back-btn" @click="goBack">
                        <i class="pi pi-arrow-left"></i> Back to Exam
                    </button>
                    <h1>{{ exam.title }} - Submissions</h1>
                </div>

                <div class="submissions-list">
                    <div v-if="submissions.length === 0" class="no-submissions">
                        <p>No submissions yet.</p>
                    </div>
                    <div v-else class="submissions-grid">
                        <div v-for="submission in submissions" :key="submission.submission_id" class="submission-card">
                            <div class="student-info">
                                <h3>{{ submission.student_name }}</h3>
                                <p class="student-id">Student ID: {{ submission.student_id }}</p>
                                <p class="submission-date">Submitted: {{ formatDate(submission.submitted_at) }}</p>
                            </div>
                            <div class="submission-details">
                                <div class="status-badge" :class="submission.status ? submission.status.toLowerCase() : 'unknown'">
                                    {{ submission.status || 'Unknown' }}
                                </div>
                                <div class="score" v-if="submission.grade !== null">
                                    <span class="score-label">Score:</span>
                                    <span class="score-value">{{ submission.grade }} / {{ exam.total_points }}</span>
                                </div>
                            </div>
                            <div class="submission-actions">
                                <button class="view-btn" @click="viewSubmission(submission)">
                                    <i class="pi pi-eye"></i> View Details
                                </button>
                                <button class="grade-btn" @click="gradeSubmission(submission)" v-if="submission.status === 'Submitted'">
                                    <i class="pi pi-check"></i> Grade
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
import Header from '../../header.vue';
import Sidebar from '../SideBar.vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
    components: { Header, Sidebar },
    data() {
        return {
            exam: null,
            submissions: [],
            loading: false,
            error: null
        };
    },
    methods: {
        async fetchExamDetails() {
            this.loading = true;
            try {
                const examId = this.$route.params.examId;
                const response = await axios.get(`http://127.0.0.1:8000/api/exams/item/${examId}`);
                this.exam = response.data;
            } catch (error) {
                console.error("Error fetching exam details:", error);
                this.error = "Failed to load exam details";
            } finally {
                this.loading = false;
            }
        },

        async fetchSubmissions() {
            this.loading = true;
            try {
                const examId = this.$route.params.examId;
                const response = await axios.get(`http://127.0.0.1:8000/api/exam-submissions/${examId}`);
                this.submissions = response.data.submissions.map(submission => ({
                    ...submission,
                    status: submission.grade !== null ? 'Graded' : 'Submitted'
                }));
            } catch (error) {
                console.error("Error fetching submissions:", error);
                this.error = "Failed to load submissions";
                const toast = useToast();
                toast.error("Failed to load submissions");
            } finally {
                this.loading = false;
            }
        },

        async refreshSubmissions() {
            try {
                const examId = this.$route.params.examId;
                const response = await axios.get(`http://127.0.0.1:8000/api/exam-submissions/${examId}`);
                this.submissions = response.data.submissions.map(submission => ({
                    ...submission,
                    status: submission.grade !== null ? 'Graded' : 'Submitted'
                }));
            } catch (error) {
                console.error("Error refreshing submissions:", error);
                const toast = useToast();
                toast.error("Failed to refresh submissions");
            }
        },

        formatDate(date) {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        viewSubmission(submission) {
            this.$router.push({
                name: 'ExamSubmissionDetails',
                params: {
                    examId: this.$route.params.examId,
                    submissionId: submission.submission_id
                }
            });
        },

        gradeSubmission(submission) {
            this.$router.push({
                name: 'GradeExamSubmission',
                params: {
                    examId: this.$route.params.examId,
                    submissionId: submission.submission_id
                }
            });
        },

        goBack() {
            this.$router.push({
                name: 'FacultyExamDetails',
                params: { examId: this.$route.params.examId }
            });
        }
    },
    mounted() {
        this.fetchExamDetails();
        this.fetchSubmissions();
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            if (from.name === 'GradeExamSubmission') {
                vm.fetchSubmissions();
            }
        });
    }
};
</script>

<style scoped>
.submissions-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.submissions-content {
    display: flex;
    flex: 1;
}

.submissions-main {
    flex: 1;
    padding: 2rem;
    background-color: #fff;
    overflow-y: auto;
}

.header-section {
    margin-bottom: 2rem;
}

.header-section h1 {
    font-size: 1.8rem;
    color: #333;
    margin: 1rem 0;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    color: #007BF6;
}

.back-btn:hover {
    background-color: #f0f0f0;
}

.submissions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.submission-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
}

.submission-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.student-info h3 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
}

.student-id {
    color: #666;
    font-size: 0.9rem;
}

.submission-date {
    color: #666;
    font-size: 0.9rem;
    margin: 0.5rem 0;
}

.submission-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 4px;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-weight: 500;
    font-size: 0.9rem;
    display: inline-block;
}

.status-badge.submitted {
    background-color: #4CAF50;
    color: white;
}

.status-badge.pending {
    background-color: #FFDD57;
    color: black;
}

.status-badge.graded {
    background-color: #2196F3;
    color: white;
}

.status-badge.unknown {
    background-color: #666;
    color: white;
}

.score {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #333;
    font-weight: 500;
}

.score-label {
    color: #666;
    font-size: 0.9rem;
}

.score-value {
    font-weight: 600;
    color: #2196F3;
}

.submission-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.view-btn, .grade-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.view-btn {
    background-color: #007BF6;
    color: white;
}

.grade-btn {
    background-color: #4CAF50;
    color: white;
}

.view-btn:hover, .grade-btn:hover {
    opacity: 0.9;
}

.no-submissions {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-size: 1.1rem;
}

</style>
