<template>
    <div class="assignment-container">
        <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="assignment-content">
            <SideBar :isCollapsed="isSidebarCollapsed" />
            <main class="assignment-main">
                <div class="assignments">
                    <div class="header">
                        <h1>Assignments</h1>
                        <button @click="showCreateAssignmentForm = true" class="create-assignment-btn">Create Assignment</button>
                    </div>
                    <div class="assignment-cards">
                        <div v-for="assignment in assignments" :key="assignment.id" class="assignment-card" @click="startAssignment(assignment.id, assignment.courseId)">
                            <div class="card-header">
                                <h2>{{ assignment.courseName }}</h2>
                                <p>{{ assignment.courseSection }}</p>
                                <div class="card-actions">
                                    <button @click.stop="editAssignment(assignment.id)"><i class="pi pi-pencil"></i></button>
                                    <button @click.stop="deleteAssignment(assignment.id)"><i class="pi pi-trash"></i></button>
                                </div>
                            </div>
                            <div class="assignment-details">
                                <p>Due Date: {{ assignment.dueDate }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-if="showCreateAssignmentForm" class="modal">
                        <div class="modal-content">
                            <span class="close" @click="showCreateAssignmentForm = false">&times;</span>
                            <h2>Create Assignment</h2>
                            <form @submit.prevent="createAssignment" class="assignment-form">
                                <label for="courseName">Course Name:</label>
                                <input type="text" v-model="newAssignment.courseName" required>
                                <label for="courseSection">Course Section:</label>
                                <input type="text" v-model="newAssignment.courseSection" required>
                                <label for="dueDate">Due Date:</label>
                                <input type="date" v-model="newAssignment.dueDate" required>
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
    name: 'FacultyAssignment',
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
            courses: [
                { id: 1, subject: 'ITELECT4', section: 'BSCS-3A', schedule: 'Mon 9-11 AM' },
                { id: 2, subject: 'ITELECT4', section: 'BSCS-3B', schedule: 'Tue 10-12 AM' }
            ],
            assignments: [
                { id: 1, courseId: 1, courseName: 'ITELECT4', courseSection: 'BSCS-3A', dueDate: '2022-12-31' },
                { id: 2, courseId: 2, courseName: 'ITELECT4', courseSection: 'BSCS-3B', dueDate: '2022-12-31' }
            ],
            showCreateAssignmentForm: false,
            newAssignment: {
                courseName: '',
                courseSection: '',
                dueDate: null
            }
        };
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        createAssignment() {
            const newId = this.assignments.length + 1;
            const newCourseId = this.courses.length + 1; // Assuming you have a courses array
            this.assignments.push({ id: newId, courseId: newCourseId, ...this.newAssignment });
            this.newAssignment.courseName = '';
            this.newAssignment.courseSection = '';
            this.newAssignment.dueDate = null;
            this.showCreateAssignmentForm = false;
        },
        editAssignment(id) {
            // Implement edit functionality
        },
        deleteAssignment(id) {
            this.assignments = this.assignments.filter(assignment => assignment.id !== id);
        },
        startAssignment(assignmentId, courseId) {
            this.$router.push({ 
                name: 'FacultyAssignmentContent', 
                params: { assignmentId, courseId } 
            });
        }
    }
};
</script>

<style scoped>
.assignment-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.assignment-content {
    display: flex;
    flex-grow: 1;
}

.assignment-main {
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

.assignment-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
}

.assignment-card {
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

.assignment-card:hover {
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

.assignment-details {
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

.assignment-details p {
    color: #000;
}

.create-assignment-btn {
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

.assignment-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.assignment-form input {
    padding: 10px;
    font-size: 14px;
    border-radius: 12px;
    width: 100%;
    border: 1px solid #ccc;
}

.assignment-form button {
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