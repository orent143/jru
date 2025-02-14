<template>
    <div class="dashboard-container">
        <Header @toggleSidebar="toggleSidebar" />
        <div class="dashboard-content">
            <SideBar :isCollapsed="isSidebarCollapsed" />
            <main class="dashboard-main">
                <div class="courses">
                    <div class="header">
                        <h1>Courses</h1>
                        <button @click="showCreateCourseForm = true" class="create-course-btn">Create Course</button>
                    </div>

                    <!-- Display loading state -->
                    <p v-if="loading">Loading courses...</p>

                    <!-- Display error message if fetching fails -->
                    <p v-if="error" class="error">{{ error }}</p>

                    <div class="course-cards" v-if="!loading && courses?.length">
                        <div 
                            v-for="course in courses" 
                            :key="course.course_id" 
                            class="course-card" 
                            @click="goToCourseContent(course.course_id)"
                        >
                            <div class="card-header">
                                <h2>{{ course.course_name }}</h2>
                                <p>Section: {{ course.section }}</p>
                                <div class="card-actions">
                                    <button @click.stop="editCourse(course.course_id)"><i class="pi pi-pencil"></i></button>
                                    <button @click.stop="deleteCourse(course.course_id)"><i class="pi pi-trash"></i></button>
                                </div>
                            </div>
                            <div class="schedule-container">
                                <p>Schedule: {{ course.class_schedule || 'Not specified' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Display when there are no courses -->
                    <p v-else-if="!loading && courses && courses.length === 0">No courses found.</p>
                    <p v-else>Loading courses...</p>
                    <!-- Create Course Modal -->
                    <div v-if="showCreateCourseForm" class="modal">
                        <div class="modal-content">
                            <span class="close" @click="closeModal">&times;</span>
                            <h2>Create Course</h2>
                            <form @submit.prevent="createCourse" class="course-form">
                                <label for="name">Course Name:</label>
                                <input type="text" v-model="newCourse.course_name" required>
                                
                                <label for="section">Section:</label>
                                <input type="text" v-model="newCourse.section" required>

                                <label for="class_schedule">Class Schedule:</label>
                                <input type="text" v-model="newCourse.class_schedule">

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
import Header from '@/components/faculty/header.vue';
import SideBar from '@/components/faculty/SideBar.vue';

export default {
    components: {
        Header,
        SideBar
    },
    data() {
        return {
            isSidebarCollapsed: false,
            courses: [],
            loading: false,
            error: null,
            showCreateCourseForm: false,
            newCourse: {
                course_name: '',
                section: '',
                class_schedule: ''
            },
            user: null // Store logged-in user data
        };
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        async fetchCourses() {
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
                this.courses = response.data;
            } catch (err) {
                this.error = 'Failed to fetch courses.';
            } finally {
                this.loading = false;
            }
        },
        async createCourse() {
            try {
                if (!this.user) return;
                
                const response = await axios.post('http://127.0.0.1:8000/api/courses/', {
                    course_name: this.newCourse.course_name,
                    section: this.newCourse.section,
                    class_schedule: this.newCourse.class_schedule,
                    user_id: this.user.user_id
                });
                
                this.courses.push({ ...this.newCourse, course_id: response.data.course_id });
                this.showCreateCourseForm = false;
                this.newCourse = { course_name: '', section: '', class_schedule: '' };
            } catch (err) {
                this.error = 'Failed to create course.';
            }
        },
        async deleteCourse(course_id) {
            try {
                if (!this.user) return;
                
                await axios.delete(`http://127.0.0.1:8000/api/courses/${course_id}`, {
                    params: { user_id: this.user.user_id }
                });
                
                this.courses = this.courses.filter(course => course.course_id !== course_id);
            } catch (err) {
                this.error = 'Failed to delete course.';
            }
        },
        goToCourseContent(course_id) {
            this.$router.push({ name: 'CourseContent', params: { courseId: course_id } });
        },

        closeModal() {
            this.showCreateCourseForm = false;
        }
    },
    mounted() {
        this.fetchCourses();
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
    overflow-y: auto; /* Allow vertical scrolling if the content is too long */
    max-height: 100vh; /* Make sure it doesn't overflow out of the screen */
}
.courses {
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

.create-course-btn {
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
    max-height: 80vh; /* Limit the height of the modal */
    overflow-y: auto; /* Enable vertical scrolling if content overflows */
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

.course-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.course-form input {
    padding: 10px;
    font-size: 14px;
    border-radius: 12px;
    width: 100%;
    border: 1px solid #ccc;
}

.course-form button {
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

.course-form button:hover {
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