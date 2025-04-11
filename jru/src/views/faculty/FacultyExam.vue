<template>
    <div class="exam-container">
        <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="exam-content">
            <SideBar :isCollapsed="isSidebarCollapsed" />
            <main class="exam-main">
                <div class="exams">
                    <div class="header">
                        <h1>Exams</h1>
                    </div>

                    <!-- Show loading message -->
                    <p v-if="loading">Loading exams...</p>

                    <!-- Show error message if request fails -->
                    <p v-if="error" class="error">{{ error }}</p>

                    <div v-if="!loading && exams.length" class="exam-cards">
                        <div v-for="exam in exams" :key="exam.id" class="exam-card" @click="startExam(exam.id, exam.course_id)">
                            <div class="card-header">
                                <h2>{{ getCourseName(exam.course_id) }}</h2>
                                <p>Section: {{ getCourseSection(exam.course_id) }}</p>
                                
                            </div>
                            <div class="exam-details">
                                <p>Duration: {{ exam.duration }} minutes</p>
                            </div>
                        </div>
                    </div>

                    <div v-if="showCreateExamForm" class="modal">
                        <div class="modal-content">
                            <span class="close" @click="showCreateExamForm = false">&times;</span>
                            <h2>Create Exam</h2>
                            <form @submit.prevent="createExam" class="exam-form">
                                <label for="courseName">Course Name:</label>
                                <input type="text" v-model="newExam.courseName" required>
                                <label for="courseSection">Course Section:</label>
                                <input type="text" v-model="newExam.courseSection" required>
                                <label for="duration">Duration (minutes):</label>
                                <input type="number" v-model="newExam.duration" required>
                                <button type="submit">Create</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
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
            exams: [],
            courses: [],
            loading: false,
            error: null,
            showCreateExamForm: false,
            newExam: {
                courseName: '',
                courseSection: '',
                duration: ''
            },
            user: null // Store logged-in user data
        };
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        async fetchExams() {
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
                this.exams = response.data;
            } catch (err) {
                this.error = 'Failed to fetch exams.';
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
        async createExam() {
            try {
                if (!this.user) return;
                
                const response = await axios.post('http://127.0.0.1:8000/api/exams/', {
                    courseName: this.newExam.courseName,
                    courseSection: this.newExam.courseSection,
                    duration: this.newExam.duration,
                    user_id: this.user.user_id
                });
                
                this.exams.push({ ...this.newExam, id: response.data.id });
                this.showCreateExamForm = false;
                this.newExam = { courseName: '', courseSection: '', duration: '' };
            } catch (err) {
                this.error = 'Failed to create exam.';
            }
        },
        async deleteExam(exam_id) {
            try {
                if (!this.user) return;
                
                await axios.delete(`http://127.0.0.1:8000/api/exams/${exam_id}`, {
                    params: { user_id: this.user.user_id }
                });
                
                this.exams = this.exams.filter(exam => exam.id !== exam_id);
            } catch (err) {
                this.error = 'Failed to delete exam.';
            }
        },
        async editExam(exam_id) {
            // Placeholder for edit function (modal or inline editing can be added)
            console.log(`Edit exam ${exam_id}`);
        },
        startExam(examId, courseId) {
            this.$router.push({ 
                name: 'FacultyExamContent', 
                params: { examId, courseId } 
            });
        },
        closeModal() {
            this.showCreateExamForm = false;
        }
    },
    mounted() {
        this.fetchExams();
        this.fetchCourses();
    }
};
</script>

<style scoped>
.exam-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.exam-content {
    display: flex;
    flex-grow: 1;
}

.exam-main {
    flex-grow: 1;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto; /* Allow vertical scrolling if the content is too long */
    max-height: 100vh; /* Make sure it doesn't overflow out of the screen */
}
.exams {
margin-bottom: 5rem;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
}

.header h1 {
    color: #2c3e50;
}

.exam-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
}

.exam-card {
    background-color: #D9D9D9ff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    width: 95%;
    height: auto;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.exam-card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-header {
    position: relative;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
}

.card-header h2 {
    font-size: 25px;
    font-weight: 900;
    color: #000;
}

.card-header p {
    font-size: 16px;
    color: #666;
}

.card-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 0.5rem;
}

.card-actions button {
    background: none;
    border: none;
    cursor: pointer;
}

.exam-details {
    background-color: #F5F5F5;
    padding: 1rem;
    padding-top: 0%;
    border-radius: 8px;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
    display: flex;
    flex-direction: column;
    min-height: 100px;
}

.exam-details p {
    color: #000;
}

.create-exam-btn {
    background-color: #007BF6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
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
}

.modal-content {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.459);
    position: fixed;
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 400px;
    max-width: 100%;
    z-index: 1000;
}

.modal-content h2 {
    font-size: 25px;
    font-weight: 1000;
    color: #000000;
}

.modal-content label {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 5px;
    display: block;
    color: #272727;
}

.exam-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.exam-form input {
    padding: 10px;
    font-size: 14px;
    border-radius: 12px;
    width: 100%;
    border: 1px solid #ccc;
}

.exam-form button {
    padding: 10px 20px;
    background-color: #007BF6;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}

.close {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    color: #000000;
    font-size: 25px;
}
</style>