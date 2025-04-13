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

                    <p v-if="loading">Loading courses...</p>
                    <p v-if="error" class="error">{{ error }}</p>

                    <div class="course-cards" v-if="!loading && courses.length">
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
                                    <button @click.stop="confirmDeleteCourse(course.course_id)"><i class="pi pi-trash"></i></button>
                                </div>
                            </div>
                            <div class="schedule-container">
                                <p>Schedule: {{ course.class_schedule || 'Not specified' }}</p>
                            </div>
                        </div>
                    </div>

                    <p v-else-if="!loading && courses.length === 0">No courses found.</p>

                    <div v-if="showCreateCourseForm" class="modal">
                        <div class="modal-content">
                            <span class="close" @click="closeModal">&times;</span>
                            <h2>Create Course</h2>
                            <form @submit.prevent="confirmCreateCourse" class="course-form">
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

    <ConfirmationModal
        :show="showCreateConfirmation"
        title="Create Course"
        message="Are you sure you want to create this course?"
        confirmText="Create"
        type="primary"
        @confirm="handleCreateCourse"
        @cancel="showCreateConfirmation = false"
    />

    <ConfirmationModal
        :show="showDeleteConfirmation"
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        @confirm="handleDeleteCourse"
        @cancel="showDeleteConfirmation = false"
    />

    <EditCourseModal
        v-if="showEditCourseModal"
        :course="courseToEdit"
        @close="showEditCourseModal = false"
        @update-course="handleCourseUpdate"
    />
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';
import Header from '@/components/header.vue';
import SideBar from '@/components/faculty/SideBar.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import EditCourseModal from '@/components/faculty/Course/EditCourseModal.vue';

export default {
    components: { 
        Header, 
        SideBar,
        ConfirmationModal,
        EditCourseModal
    },
    data() {
        return {
            isSidebarCollapsed: false,
            courses: [],
            loading: false,
            error: null,
            showCreateCourseForm: false,
            newCourse: { course_name: '', section: '', class_schedule: '' },
            user: JSON.parse(localStorage.getItem('user')) || null,
            showCreateConfirmation: false,
            showDeleteConfirmation: false,
            pendingCourse: null,
            courseToDelete: null,
            showEditCourseModal: false,
            courseToEdit: null
        };
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },

        async fetchCourses() {
            if (!this.user || !this.user.user_id || this.user.role !== 'faculty') {
                console.error("Invalid user data:", this.user);
                this.error = "Unauthorized or missing user information.";
                return;
            }

            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get("http://127.0.0.1:8000/api/courses/", {
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.user.access_token}`
                    },
                    params: { user_id: this.user.user_id }
                });

                this.courses = response.data;

            } catch (err) {
                console.error("Error fetching courses:", err.response?.data || err.message);
                this.error = err.response?.data?.detail || "Failed to fetch courses.";
            } finally {
                this.loading = false;
            }
        },

        confirmCreateCourse() {
            if (!this.newCourse.course_name || !this.newCourse.section) {
                this.toast.error("Please fill in all required fields");
                return;
            }
            this.pendingCourse = { ...this.newCourse };
            this.showCreateConfirmation = true;
        },

        async handleCreateCourse() {
            this.showCreateConfirmation = false;
            const toast = useToast();

            if (!this.user) return;

            try {
                const response = await axios.post('http://127.0.0.1:8000/api/courses/', {
                    ...this.pendingCourse,
                    user_id: this.user.user_id
                });

                this.courses.push({ ...this.pendingCourse, course_id: response.data.course_id });
                toast.success('Course created successfully!');
                this.closeModal();
                this.resetNewCourseForm();
            } catch (err) {
                console.error('Error creating course:', err);
                toast.error(err.response?.data?.detail || 'Failed to create course.');
            }
        },

        confirmDeleteCourse(course_id) {
            this.courseToDelete = course_id;
            this.showDeleteConfirmation = true;
        },

        async handleDeleteCourse() {
            this.showDeleteConfirmation = false;
            const toast = useToast();

            if (!this.user) return;

            try {
                await axios.delete(`http://127.0.0.1:8000/api/courses/${this.courseToDelete}`, {
                    params: { user_id: this.user.user_id }
                });

                this.courses = this.courses.filter(course => course.course_id !== this.courseToDelete);
                toast.success('Course deleted successfully!');
            } catch (err) {
                console.error('Error deleting course:', err);
                toast.error(err.response?.data?.detail || 'Failed to delete course.');
            }
        },

        goToCourseContent(course_id) {
            this.$router.push({ 
                name: 'FacultyCourseContent', 
                params: { courseId: course_id } 
            });
        },

        closeModal() {
            this.showCreateCourseForm = false;
        },

        resetNewCourseForm() {
            this.newCourse = { course_name: '', section: '', class_schedule: '' };
        },

        editCourse(course_id) {
            this.courseToEdit = this.courses.find(course => course.course_id === course_id);
            this.showEditCourseModal = true;
        },

        handleCourseUpdate(updatedCourse) {
            const index = this.courses.findIndex(course => course.course_id === updatedCourse.course_id);
            if (index !== -1) {
                this.courses[index] = updatedCourse;
            }
            this.showEditCourseModal = false;
        }
    },

    mounted() {
        setTimeout(() => {
            this.fetchCourses();
        }, 500);
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
    overflow-y: auto;
    max-height: 100vh;
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
    color: #2c3e50;
}

.course-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
}

.course-card {
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

.course-card:hover {
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
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.459);
    position: fixed; 
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 400px;
    max-width: 100%;
    z-index: 1000; 
    max-height: 80vh;
    overflow-y: auto;
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