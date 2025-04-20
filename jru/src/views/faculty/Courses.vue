<template>
    <div class="dashboard-container">
        <Header @toggleSidebar="toggleSidebar" />
        <div class="dashboard-content">
            <SideBar :isCollapsed="isSidebarCollapsed" />
            <main class="dashboard-main">
                <div class="page-header">
                    <div class="page-header-content">
                        <h1>My Courses</h1>
                        <p class="page-subtitle">Manage and organize your teaching courses. Create, edit, and access all your course materials in one place.</p>
                    </div>
                    <div class="header-actions">
                        <button @click="showCreateCourseForm = true" class="create-course-btn">
                            <i class="pi pi-plus"></i>
                            Create Course
                        </button>
                    </div>
                </div>

                <div v-if="loading" class="loading-container">
                    <i class="pi pi-spin pi-spinner"></i>
                    <p>Loading your courses...</p>
                </div>
                
                <div v-if="error" class="error-container">
                    <i class="pi pi-exclamation-triangle"></i>
                    <p>{{ error }}</p>
                </div>

                <div v-else-if="!loading && courses.length === 0" class="empty-state">
                    <i class="pi pi-book"></i>
                    <h3>No Courses Available</h3>
                    <p>You haven't created any courses yet.</p>
                </div>

                <section v-else class="course-grid">
                    <div 
                        v-for="course in courses" 
                        :key="course.course_id" 
                        class="course-card" 
                        @click="goToCourseContent(course.course_id)"
                    >
                        <div class="course-color-indicator" :style="getRandomColorStyle()"></div>
                        <div class="card-content">
                            <div class="course-icon-container">
                            <div class="course-icon">
                                <i class="pi pi-book"></i>
                            </div>
                            <div class="card-header-contents">
                                <div class="card-header-desc">
                                    <h4>20 Lessons</h4>
                                    <h4>30 Students</h4>
                                </div>
                            <h3>{{ course.course_name }}</h3>
                        </div>
                        </div>
                            <div class="card-header">
                                <span class="course-code">{{ getCourseCode(course.course_name) }}</span>
                            </div>
                            <div class="card-details">
                                <div class="detail-item">
                                    <i class="pi pi-users"></i>
                                    <span>{{ course.section || 'No section' }}</span>
                                </div>
                                <div class="detail-item">
                                    <i class="pi pi-calendar"></i>
                                    <span>{{ course.class_schedule || 'Schedule not available' }}</span>
                                </div>
                            </div>
                            <div class="card-actions">
                                <button @click.stop="editCourse(course.course_id)" class="action-button edit">
                                    <i class="pi pi-pencil"></i>
                                </button>
                                <button @click.stop="confirmDeleteCourse(course.course_id)" class="action-button delete">
                                    <i class="pi pi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>

    <div v-if="showCreateCourseForm" class="modal">
        <div class="modal-content">
            <span class="close" @click="closeModal">&times;</span>
            <h2>Create Course</h2>
            <form @submit.prevent="confirmCreateCourse" class="course-form">
                <div class="form-group">
                    <label for="name">Course Name</label>
                    <input type="text" id="name" v-model="newCourse.course_name" required>
                </div>
                  
                <div class="form-group">
                    <label for="section">Section</label>
                    <input type="text" id="section" v-model="newCourse.section" required>
                </div>

                <div class="form-group">
                    <label for="class_schedule">Class Schedule</label>
                    <input type="text" id="class_schedule" v-model="newCourse.class_schedule">
                </div>

                <button type="submit" class="submit-btn">Create Course</button>
            </form>
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
            courseToEdit: null,
            colorPalette: [
                '#4285F4', '#EA4335', '#FBBC05', '#34A853',
                '#1877F2', '#45BD62', '#F02849',
                '#0077B5', '#00A0DC',
                '#007BF6', '#6c5ce7', '#00cec9', '#e84393', '#00b894', '#6ab04c'
            ]
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
        },

        getRandomColorStyle() {
            const colorIndex = Math.floor(Math.random() * this.colorPalette.length);
            return { backgroundColor: this.colorPalette[colorIndex] };
        },

        getCourseCode(courseName) {
            if (!courseName) return 'N/A';
            
            // Generate a code from course name, e.g. "Web Development" -> "WD101"
            const words = courseName.split(' ');
            let code = '';
            
            // Get first letter of each word
            words.forEach(word => {
                if (word.length > 0) {
                    code += word[0].toUpperCase();
                }
            });
            
            // Add random number
            code += Math.floor(Math.random() * 899 + 100);
            
            return code;
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
    overflow: hidden;
}

.dashboard-content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.dashboard-main {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    background-color: #f8f9fa;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
}

.page-header-content {
    display: flex;
    flex-direction: column;
}

.page-header h1 {
    color: #2c3e50;
    font-weight: 700;
    font-size: 1.8rem;
    margin: 0;
}

.page-subtitle {
    color: #6c757d;
    font-size: 1rem;
}

.header-actions {
    display: flex;
    align-items: center;
}

.create-course-btn {
    background-color: #007BF6;
    color: white;
    border: none;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
}

.create-course-btn:hover {
    background-color: #0066cc;
}

.create-course-btn i {
    font-size: 0.9rem;
}

.loading-container, .empty-state, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    text-align: center;
}

.loading-container i, .empty-state i, .error-container i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.loading-container i, .empty-state i {
    color: #007BF6;
}

.error-container i {
    color: #dc3545;
}

.empty-state h3, .error-container h3 {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
}

.empty-state p, .loading-container p, .error-container p {
    color: #6c757d;
    margin: 0;
}

.course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.course-card {
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    height: 100%;
    position: relative;
}

.course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.course-color-indicator {
    height: 8px;
    width: 100%;
}

.card-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    height: 100%;
}
.course-icon-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.card-header-contents {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.card-header-desc {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.card-header-desc h4 {
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 500;
}
.course-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background-color: #f0f4f9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.course-icon i {
    font-size: 1.5rem;
    color: #007BF6;
}

.card-header {
    margin-bottom: 1.25rem;
}

.course-icon-container h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.25rem 0;
    line-height: 1.4;
}

.course-code {
    font-size: 0.85rem;
    color: #6c757d;
    font-weight: 500;
}

.card-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex: 1;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.detail-item i {
    color: #6c757d;
    font-size: 0.9rem;
    width: 16px;
}

.detail-item span {
    font-size: 0.9rem;
    color: #495057;
}

.card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.action-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
}

.action-button.edit {
    background-color: #f8f9fa;
    color: #0d6efd;
}

.action-button.edit:hover {
    background-color: #e2e6ea;
}

.action-button.delete {
    background-color: #f8f9fa;
    color: #dc3545;
}

.action-button.delete:hover {
    background-color: #e2e6ea;
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
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    position: relative;
    width: 400px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-content h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1.5rem;
}

.close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    color: #6c757d;
    cursor: pointer;
    transition: color 0.2s;
}

.close:hover {
    color: #343a40;
}

.course-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #495057;
}

.form-group input {
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
    outline: none;
    border-color: #007BF6;
    box-shadow: 0 0 0 3px rgba(0, 123, 246, 0.25);
}

.submit-btn {
    background-color: #007BF6;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 0.5rem;
}

.submit-btn:hover {
    background-color: #0066cc;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .course-grid {
        grid-template-columns: 1fr;
    }
}
</style>