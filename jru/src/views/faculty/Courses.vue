<template>
    <div class="dashboard-container">
        <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="dashboard-content">
            <SideBar :isCollapsed="isSidebarCollapsed" />
            <main class="dashboard-main">
                <div class="courses">
                    <div class="header">
                        <h1>Courses</h1>
                        <button @click="showCreateCourseForm = true" class="create-course-btn">Create Course</button>
                    </div>
                    <div class="course-cards">
                        <div v-for="course in courses" :key="course.id" class="course-card" @click="goToCourseContent(course.id)">
                            <div class="card-header">
                                <h2>{{ course.subject }}</h2>
                                <p>{{ course.section }}</p>
                                <div class="card-actions">
                                    <button @click.stop="editCourse(course.id)"><i class="pi pi-pencil"></i></button>
                                    <button @click.stop="deleteCourse(course.id)"><i class="pi pi-trash"></i></button>
                                </div>
                            </div>
                            <div class="schedule-container">
                                <p>Class Schedule: {{ course.schedule }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-if="showCreateCourseForm" class="modal">
                        <div class="modal-content">
                            <span class="close" @click="showCreateCourseForm = false">&times;</span>
                            <h2>Create Course</h2>
                            <form @submit.prevent="createCourse" class="course-form">
                                <label for="subject">Subject:</label>
                                <input type="text" v-model="newCourse.subject" required>
                                <label for="section">Section:</label>
                                <input type="text" v-model="newCourse.section" required>
                                <label for="schedule">Schedule:</label>
                                <input type="text" v-model="newCourse.schedule" required>
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
    name: 'FacultyDashboard',
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
            showCreateCourseForm: false,
            newCourse: {
                subject: '',
                section: '',
                schedule: ''
            }
        };
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        createCourse() {
            const newId = this.courses.length + 1;
            this.courses.push({ id: newId, ...this.newCourse });
            this.newCourse.subject = '';
            this.newCourse.section = '';
            this.newCourse.schedule = '';
            this.showCreateCourseForm = false;
        },
        editCourse(id) {
            // Implement edit functionality
        },
        deleteCourse(id) {
            this.courses = this.courses.filter(course => course.id !== id);
        },
        goToCourseContent(courseId) {
            this.$router.push({ name: 'FacultyCourseContent', params: { courseId } });
        }
    }
};
</script>

<style scoped>
.dashboard-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.dashboard-content {
    display: flex;
    flex-grow: 1;
}

.dashboard-main {
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
.header h1{

    color: #000;
}

.course-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 items per row */
    gap: 4rem; /* Adds space between cards */
}

.course-card {
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

.course-card:hover {
    transform: scale(1.05); /* Slightly increase the size of the card on hover */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Add a shadow to the card on hover */
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

.schedule-container {
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

.schedule-container p {
    color: #000;
}

.create-course-btn{
    background-color: #007BF6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
}
.modal {
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

.modal-content {
  justify-content: space-between;
  align-items: center;
}

.modal-content h2{
    font-size: 25px;
  font-family: 'Arial', sans-serif;
  font-weight: 1000;
  color: #000000;
}

.modal-content label{
    font-weight: 600;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
  color: #272727;
}
.course-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.course-form input{
    padding: 10px;
  font-size: 14px;
  border-radius: 12px;
  width: 100%;
  border: 1px solid #ccc;
}
.course-form button{
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