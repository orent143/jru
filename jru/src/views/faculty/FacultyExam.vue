<template>
    <div class="exam-container">
        <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="exam-content">
            <SideBar :isCollapsed="isSidebarCollapsed" />
            <main class="exam-main">
                <div class="exams">
                    <div class="header">
                        <h1>Exams</h1>
                        <button @click="showCreateExamForm = true" class="create-exam-btn">Create Exam</button>
                    </div>
                    <div class="exam-cards">
                        <div v-for="exam in exams" :key="exam.id" class="exam-card" @click="startExam(exam.id)">
                            <div class="card-header">
                                <h2>{{ exam.courseName }}</h2>
                                <p>{{ exam.courseSection }}</p>
                                <div class="card-actions">
                                    <button @click.stop="editExam(exam.id)"><i class="pi pi-pencil"></i></button>
                                    <button @click.stop="deleteExam(exam.id)"><i class="pi pi-trash"></i></button>
                                </div>
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
                                <label for="title">Course Name:</label>
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
import Header from '@/components/faculty/header.vue';
import SideBar from '@/components/faculty/SideBar.vue';

export default {
    name: 'FacultyExam',
    components: {
        Header,
        SideBar,
    },
    data() {
        return {
            searchQuery: '',
            student: {
                name: 'John Doe',
                id: '12345'
            },
            isSidebarCollapsed: false,
            exams: [
                { id: 1, title: 'Exam 1', courseName: 'Math', courseSection: 'Section A', duration: 30 },
                { id: 2, title: 'Exam 2', courseName: 'Science', courseSection: 'Section B', duration: 45 }
            ],
            showCreateExamForm: false,
            newExam: {
                courseName: '',
                courseSection: '',
                duration: null
            }
        };
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        createExam() {
            const newId = this.exams.length + 1;
            this.exams.push({ id: newId, ...this.newExam });
            this.newExam.courseName = '';
            this.newExam.courseSection = '';
            this.newExam.duration = null;
            this.showCreateExamForm = false;
        },
        editExam(id) {
            // Implement edit functionality
        },
        deleteExam(id) {
            this.exams = this.exams.filter(exam => exam.id !== id);
        },
        startExam(examId) {
            this.$router.push({ name: 'Exam', params: { examId } });
        }
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
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
}

.header h1 {
    color: #000;
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
    font-family: 'Arial', sans-serif;
    font-weight: 1000;
    color: #000000;
}

.modal-content label {
    font-weight: 600;
    font-family: 'Arial', sans-serif;
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