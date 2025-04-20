<template>
    <div class="dashboard-container">
        <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="dashboard-content">
            <SideBar :isCollapsed="isSidebarCollapsed" :courses="courses" />
            <main class="dashboard-main">
                <div class="scrollable-content">
                    <div class="welcome-section">
                        <div class="welcome-text">
                            <h1>Welcome back, <span class="highlight">{{ faculty?.name || 'Instructor' }}!</span></h1>
                            <p>{{ currentDate }}</p>
                        </div>
                        <div class="quick-stats">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="pi pi-book"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-value">{{ courses.length }}</span>
                                    <span class="stat-label">Courses</span>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="pi pi-users"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-value">{{ totalStudents }}</span>
                                    <span class="stat-label">Students</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div v-if="isLoading" class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>Loading your dashboard...</p>
                    </div>
                    
                    <div v-else class="dashboard-grid">
                        <div class="action-cards">
                            <router-link to="/faculty/courses" class="card">
                                <i class="pi pi-book"></i>
                                <h3>Manage Courses</h3>
                                <p>View and manage your course content</p>
                            </router-link>
                            <router-link to="/faculty/assignments" class="card">
                                <i class="pi pi-file"></i>
                                <h3>Assignments</h3>
                                <p>Create and grade assignments</p>
                            </router-link>
                            <router-link to="/faculty/schedule" class="card">
                                <i class="pi pi-calendar"></i>
                                <h3>View Schedule</h3>
                                <p>Check your teaching schedule</p>
                            </router-link>
                            <router-link to="/faculty/calendar" class="card">
                                <i class="pi pi-calendar-plus"></i>
                                <h3>Calendar</h3>
                                <p>Manage important dates and events</p>
                            </router-link>
                        </div>

                        <div class="courses-container panel">
                            <div class="panel-header">
                                <h2><i class="pi pi-book"></i> Current Courses</h2>
                                <router-link to="/faculty/courses" class="view-all">View All</router-link>
                            </div>
                            <div class="panel-content">
                                <table v-if="courses.length > 0">
                                    <thead>
                                        <tr>
                                            <th>Course Name</th>
                                            <th>Section</th>
                                            <th>Schedule</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="course in courses.slice(0, 3)" :key="course.course_id">
                                            <td>{{ course.course_name }}</td>
                                            <td>{{ course.section || 'N/A' }}</td>
                                            <td>{{ course.class_schedule || 'Not set' }}</td>
                                            <td>
                                                <router-link :to="`/faculty/course/${course.course_id}`" class="view-link">
                                                    <i class="pi pi-external-link"></i> View
                                                </router-link>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div v-else class="no-data">
                                    <i class="pi pi-info-circle"></i>
                                    <p>You don't have any courses assigned yet.</p>
                                </div>
                            </div>
                        </div>

                        <div class="side-by-side">
                            <div class="upcoming-class-container panel">
                                <div class="panel-header">
                                    <h2><i class="pi pi-calendar"></i> Upcoming Classes</h2>
                                    <router-link to="/faculty/calendar" class="view-all">View All</router-link>
                                </div>
                                <div class="panel-content">
                                    <div v-if="upcomingEvents.length > 0">
                                        <div class="event-list">
                                            <div v-for="event in upcomingEvents" :key="event.event_id" class="event-item">
                                                <div class="event-date">
                                                    <span class="event-day">{{ getEventDay(event.date) }}</span>
                                                    <span class="event-month">{{ getEventMonth(event.date) }}</span>
                                                </div>
                                                <div class="event-details">
                                                    <h4>{{ event.course_name || event.title }}</h4>
                                                    <p><i class="pi pi-clock"></i> {{ formatTime(event.time) }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="no-data">
                                        <i class="pi pi-calendar-times"></i>
                                        <p>No upcoming classes scheduled.</p>
                                        <router-link to="/faculty/calendar" class="action-link">
                                            <i class="pi pi-plus-circle"></i> Add Class Schedule
                                        </router-link>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="submissions-container panel">
                                <div class="panel-header">
                                    <h2><i class="pi pi-inbox"></i> Recent Submissions</h2>
                                    <router-link to="/faculty/assignments" class="view-all">View All</router-link>
                                </div>
                                <div class="panel-content">
                                    <div v-if="recentSubmissions.length > 0">
                                        <div class="submission-list">
                                            <div v-for="submission in recentSubmissions" :key="submission.id" class="submission-item">
                                                <div class="submission-avatar">
                                                    <i class="pi pi-user"></i>
                                                </div>
                                                <div class="submission-details">
                                                    <h4>{{ submission.student_name }}</h4>
                                                    <p>{{ submission.assignment_title }}</p>
                                                    <span :class="['status-badge', getStatusClass(submission.status)]">
                                                        {{ submission.status }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="no-data">
                                        <i class="pi pi-inbox"></i>
                                        <p>No recent submissions found.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
import Header from '@/components/header.vue';
import SideBar from '@/components/faculty/SideBar.vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
    name: 'FacultyDashboard',
    components: {
        Header,
        SideBar,
    },
    data() {
        return {
            searchQuery: '',
            faculty: null,
            isSidebarCollapsed: false,
            isLoading: true,
            courses: [],
            events: [],
            recentSubmissions: [],
            totalStudents: 0
        };
    },
    computed: {
        currentDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date().toLocaleDateString('en-US', options);
        },
        upcomingEvents() {
            const today = new Date();
            return this.events
                .filter(event => {
                    const eventDate = new Date(event.date);
                    const sevenDaysLater = new Date();
                    sevenDaysLater.setDate(today.getDate() + 7);
                    
                    return (
                        event.type === 'class' && 
                        eventDate >= today && 
                        eventDate <= sevenDaysLater
                    );
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5);
        }
    },
    async mounted() {
        this.loadUserData();
        await this.fetchData();
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        
        loadUserData() {
            const userData = localStorage.getItem("user");
            if (userData) {
                this.faculty = JSON.parse(userData);
            }
        },
        
        async fetchData() {
            this.isLoading = true;
            
            try {
                await Promise.all([
                    this.fetchCourses(),
                    this.fetchEvents(),
                    this.fetchSubmissions()
                ]);
                
                // Mock data for total students
                this.totalStudents = Math.floor(Math.random() * 80) + 20;
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                const toast = useToast();
                toast.error('Failed to load dashboard data');
            } finally {
                this.isLoading = false;
            }
        },
        
        async fetchCourses() {
            if (!this.faculty || !this.faculty.user_id) return;
            
            try {
                const token = this.faculty.access_token;
                if (!token) {
                    throw new Error('No access token available');
                }
                
                const response = await axios.get(
                    `http://127.0.0.1:8000/api/courses?user_id=${this.faculty.user_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                this.courses = response.data;
            } catch (error) {
                console.error('Error fetching courses:', error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    this.logout();
                }
                throw error;
            }
        },
        
        async fetchEvents() {
            try {
                const token = this.faculty?.access_token;
                if (!token) {
                    throw new Error('No access token available');
                }
                
                const response = await axios.get(
                    'http://127.0.0.1:8000/api/events/',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                if (this.faculty && this.faculty.user_id) {
                    this.events = response.data.filter(event => 
                        event.user_id === this.faculty.user_id || 
                        this.courses.some(course => course.course_id === event.course_id)
                    );
                } else {
                    this.events = [];
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    this.logout();
                }
                throw error;
            }
        },
        
        async fetchSubmissions() {
            try {
                this.recentSubmissions = [
                    { id: 1, student_name: 'John Doe', assignment_title: 'Assignment 1', status: 'Submitted' },
                    { id: 2, student_name: 'Jane Smith', assignment_title: 'Quiz 1', status: 'Graded' },
                    { id: 3, student_name: 'Bob Johnson', assignment_title: 'Assignment 2', status: 'Pending' }
                ];
            } catch (error) {
                console.error('Error fetching submissions:', error);
                throw error;
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        },
        
        getEventDay(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.getDate();
        },
        
        getEventMonth(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short' });
        },
        
        formatTime(timeString) {
            if (!timeString) return 'All Day';
            
            try {
                const [hours, minutes] = timeString.split(':');
                const hour = parseInt(hours, 10);
                const minute = parseInt(minutes, 10);
                
                if (isNaN(hour) || isNaN(minute)) return timeString;
                
                const period = hour >= 12 ? 'PM' : 'AM';
                const formattedHour = hour % 12 || 12;
                
                return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
            } catch (error) {
                return timeString;
            }
        },
        
        getStatusClass(status) {
            const statusMap = {
                'Submitted': 'status-submitted',
                'Graded': 'status-graded',
                'Pending': 'status-pending',
                'Late': 'status-late'
            };
            
            return statusMap[status] || '';
        },
        
        logout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
            const toast = useToast();
            toast.info('Your session has expired. Please login again.');
        }
    }
};
</script>

<style scoped>
.dashboard-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f2f5;
    color: #333;
    overflow: hidden;
}

.dashboard-content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.dashboard-main {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.scrollable-content {
    height: 100%;
    overflow-y: auto;
    padding: 30px;
    scrollbar-width: thin;
    scrollbar-color: #bcc3ce #f0f2f5;
}

.scrollable-content::-webkit-scrollbar {
    width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
    background: #f0f2f5;
}

.scrollable-content::-webkit-scrollbar-thumb {
    background-color: #bcc3ce;
    border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
    background-color: #a0a8b5;
}

.dashboard-grid {
    display: grid;
    gap: 25px;
    padding-bottom: 30px; /* Add padding to ensure last element is fully visible when scrolled */
}

/* Welcome Section */
.welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    background: linear-gradient(135deg, #007BF6, #0056b3);
    padding: 25px;
    border-radius: 12px;
    color: white;
    box-shadow: 0 10px 8px #0000003b;
}

.welcome-text h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 5px 0;
}

.welcome-text p {
    font-size: 14px;
    margin: 0;
    opacity: 0.9;
}

.highlight {
    color: #fff;
    font-weight: 700;
}

.quick-stats {
    display: flex;
    gap: 15px;
}

.stat-card {
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    padding: 15px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    min-width: 150px;
}

.stat-icon {
    background-color: rgba(255, 255, 255, 0.2);
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
}

.stat-icon i {
    font-size: 18px;
    color: white;
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
}

.stat-label {
    font-size: 12px;
    opacity: 0.9;
}

/* Panel Styles */
.panel {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.panel-header h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    color: #333;
}

.panel-header h2 i {
    margin-right: 10px;
    color: #007BF6;
}

.panel-content {
    padding: 20px;
}

.view-all {
    color: #007BF6;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
}

.view-all:hover {
    text-decoration: underline;
}

/* Courses Container */
.courses-container {
    margin-bottom: 25px;
}

/* Action Cards */
.action-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 25px;
}

.card {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    padding: 25px 20px;
    text-align: center;
    text-decoration: none;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-top: 4px solid #007BF6;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card i {
    font-size: 28px;
    color: #007BF6;
    margin-bottom: 15px;
    background-color: rgba(0, 123, 246, 0.1);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card h3 {
    color: #333;
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
}

.card p {
    color: #777;
    margin: 0;
    font-size: 13px;
}

/* Side by Side Panels */
.side-by-side {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
    margin-bottom: 25px;
}

/* Table Styles */
table {
    width: 100%;
    border-collapse: collapse;
}

th {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
    color: #555;
    font-size: 14px;
    font-weight: 600;
}

td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
    color: #333;
    font-size: 14px;
}

tbody tr:hover {
    background-color: #f9f9f9;
}

.view-link {
    color: #007BF6;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.view-link:hover {
    color: #0056b3;
}

/* Event List */
.event-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.event-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 8px;
    background-color: #f9f9f9;
    transition: all 0.2s;
}

.event-item:hover {
    background-color: #f0f2f5;
}

.event-date {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #007BF6;
    color: white;
    min-width: 50px;
    height: 50px;
    border-radius: 8px;
    margin-right: 15px;
}

.event-day {
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
}

.event-month {
    font-size: 12px;
    text-transform: uppercase;
}

.event-details {
    flex: 1;
}

.event-details h4 {
    margin: 0 0 5px 0;
    font-size: 15px;
    font-weight: 600;
    color: #333;
}

.event-details p {
    margin: 0;
    font-size: 13px;
    color: #777;
    display: flex;
    align-items: center;
    gap: 5px;
}

/* Submission List */
.submission-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.submission-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 8px;
    background-color: #f9f9f9;
    transition: all 0.2s;
}

.submission-item:hover {
    background-color: #f0f2f5;
}

.submission-avatar {
    background-color: #e6e6e6;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
}

.submission-avatar i {
    color: #777;
    font-size: 16px;
}

.submission-details {
    flex: 1;
}

.submission-details h4 {
    margin: 0 0 5px 0;
    font-size: 15px;
    font-weight: 600;
    color: #333;
}

.submission-details p {
    margin: 0 0 5px 0;
    font-size: 13px;
    color: #777;
}

.status-badge {
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 500;
    display: inline-block;
}

.status-submitted {
    background-color: rgba(0, 123, 246, 0.1);
    color: #007BF6;
}

.status-graded {
    background-color: rgba(40, 167, 69, 0.1);
    color: #28a745;
}

.status-pending {
    background-color: rgba(255, 193, 7, 0.1);
    color: #ffc107;
}

.status-late {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

/* Empty States */
.no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 25px;
    color: #777;
    text-align: center;
}

.no-data i {
    font-size: 24px;
    color: #aaa;
    margin-bottom: 10px;
}

.no-data p {
    margin: 0 0 10px 0;
}

.action-link {
    color: #007BF6;
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.action-link:hover {
    text-decoration: underline;
}

/* Loading */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: #777;
}

.loading-spinner {
    border: 4px solid rgba(0, 123, 246, 0.1);
    border-top: 4px solid #007BF6;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive Styles */
@media (max-width: 1200px) {
    .action-cards {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 992px) {
    .welcome-section {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .quick-stats {
        margin-top: 20px;
        width: 100%;
    }
    
    .stat-card {
        flex: 1;
    }
    
    .side-by-side {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .dashboard-main {
        padding: 20px;
    }
    
    .action-cards {
        grid-template-columns: 1fr;
    }
    
    .welcome-section {
        padding: 20px;
    }
    
    .panel-header, .panel-content {
        padding: 15px;
    }
    
    .quick-stats {
        flex-direction: column;
    }
}
</style>