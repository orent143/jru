<template>
    <div class="assignment-container">
        <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="assignment-content">
            <SideBar :isCollapsed="isSidebarCollapsed" />
            <main class="assignment-main">
                <div class="assignments">
                    <div class="header">
                        <h1>Assignments</h1>
                    </div>

                    <!-- Show loading message -->
                    <p v-if="loading">Loading assignments...</p>

                    <!-- Show error message if request fails -->
                    <p v-if="error" class="error">{{ error }}</p>

                    <div v-if="!loading && assignments.length" class="assignment-cards">
    <div 
        v-for="assignment in assignments" 
        :key="assignment.assignment_id" 
        class="assignment-card" 
        @click="startAssignment(assignment.assignment_id, assignment.course_id)"
    >
        <div class="card-header">
            <h2>{{ getCourseName(assignment.course_id) }} </h2>
            <p>Section: {{ getCourseSection(assignment.course_id) }}</p>

        </div>
        <div class="assignment-details">
            <p><strong>Description:</strong> {{ assignment.description }}</p>
        </div>
    </div>
</div>


                    <div v-if="showCreateAssignmentForm" class="modal">
                        <div class="modal-content">
                            <span class="close" @click="showCreateAssignmentForm = false">&times;</span>
                            <h2>Create Assignment</h2>
                            <form @submit.prevent="createAssignment" class="assignment-form">
                                <label for="title">Assignment Title:</label>
                                <input type="text" v-model="newAssignment.title" required>
                                <label for="dueDate">Due Date:</label>
                                <input type="date" v-model="newAssignment.due_date" required>
                                <label for="course">Select Course:</label>
                                <select v-model="newAssignment.course_id" required>
                                    <option v-for="course in courses" :key="course.course_id" :value="course.course_id">
                                        {{ course.name }} ({{ course.section }})
                                    </option>
                                </select>
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
            assignments: [],
            courses: [],
            loading: false,
            error: null,
            showCreateAssignmentForm: false,
            newAssignment: {
                title: '',
                due_date: '',
                course_id: null
            },
            user: null // Store logged-in user data
        };
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        async fetchAssignments() {
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
                this.assignments = response.data;
            } catch (err) {
                this.error = 'Failed to fetch assignments.';
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
        async createAssignment() {
            try {
                if (!this.user) return;
                
                const response = await axios.post('http://127.0.0.1:8000/api/assignments/', {
                    title: this.newAssignment.title,
                    due_date: this.newAssignment.due_date,
                    course_id: this.newAssignment.course_id,
                    user_id: this.user.user_id
                });
                
                this.assignments.push({ ...this.newAssignment, assignment_id: response.data.assignment_id });
                this.showCreateAssignmentForm = false;
                this.newAssignment = { title: '', due_date: '', course_id: null };
            } catch (err) {
                this.error = 'Failed to create assignment.';
            }
        },
        async deleteAssignment(assignment_id) {
            try {
                if (!this.user) return;
                
                await axios.delete(`http://127.0.0.1:8000/api/assignments/${assignment_id}`, {
                    params: { user_id: this.user.user_id }
                });
                
                this.assignments = this.assignments.filter(assignment => assignment.assignment_id !== assignment_id);
            } catch (err) {
                this.error = 'Failed to delete assignment.';
            }
        },
        async editAssignment(assignment_id) {
            // Placeholder for edit function (modal or inline editing can be added)
            console.log(`Edit assignment ${assignment_id}`);
        },
        startAssignment(assignmentId, courseId) {
            this.$router.push({ 
                name: 'FacultyAssignmentContent', 
                params: { assignmentId, courseId } 
            });
        },
        closeModal() {
            this.showCreateAssignmentForm = false;
        }
    },
    mounted() {
        this.fetchAssignments();
        this.fetchCourses();
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
    overflow-y: auto; /* Allow vertical scrolling if the content is too long */
    max-height: 100vh; /* Make sure it doesn't overflow out of the screen */
}
.assignments {
    margin-bottom: 5rem;
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
    grid-template-columns: repeat(3, 1fr); /* 3 items per row */
    gap: 4rem; /* Adds space between cards */
}

.assignment-card {
    background-color: #D9D9D9ff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 95%;
  height: auto;
  cursor: pointer; /* Change the cursor to a pointer to indicate the card is clickable */
  transition: transform 0.2s, box-shadow 0.2s; /* Add a transition effect for hover */
}

.assignment-card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-header {
    position: relative; /* Needed for absolute positioning of card actions */
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
    position: absolute; /* Position the actions at the top-right corner */
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
    display: flex
;
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

.create-assignment-btn:hover {
    background-color: #005bb5;
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
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.459);
    width: 400px;
    max-width: 100%;
    text-align: center;
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

.assignment-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.assignment-form input,
.assignment-form select {
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

.assignment-form button:hover {
    background-color: #005bb5;
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