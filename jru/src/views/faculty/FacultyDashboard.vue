<template>
    <div class="dashboard-container">
        <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="dashboard-content">
            <SideBar :isCollapsed="isSidebarCollapsed" :courses="courses" />
            <main class="dashboard-main">
                <h1>Welcome back, {{ faculty?.name || 'Instructor' }}!</h1>
                
                <div v-if="isLoading" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
                
                <div v-else>
                    <div class="una-container">
                        <h2>Current Courses</h2>
                        <table v-if="courses.length > 0">
                            <thead>
                                <tr>
                                    <th>Course Name</th>
                                    <th>Section</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="course in courses" :key="course.course_id">
                                    <td>{{ course.course_name }}</td>
                                    <td>{{ course.section || 'N/A' }}</td>
                                    <td>
                                        <router-link :to="`/faculty/course/${course.course_id}`" class="view-link">View</router-link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div v-else class="no-data">
                            <p>You don't have any courses assigned yet.</p>
                        </div>
                    </div>

                    <div class="action-cards">
                        <router-link to="/faculty/courses" class="card">
                            <i class="pi pi-book"></i>
                            <h3>Manage Courses</h3>
                        </router-link>
                        <router-link to="/faculty/assignments" class="card">
                            <i class="pi pi-file"></i>
                            <h3>Assignments</h3>
                        </router-link>
                        <router-link to="/faculty/schedule" class="card">
                            <i class="pi pi-calendar"></i>
                            <h3>View Schedule</h3>
                        </router-link>
                        <router-link to="/faculty/calendar" class="card">
                            <i class="pi pi-calendar-plus"></i>
                            <h3>Calendar</h3>
                        </router-link>
                    </div>

                    <div class="side-by-side">
                        <div class="upcoming-class-container">
                            <h2>Upcoming Classes</h2>
                            <div v-if="upcomingEvents.length > 0">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="event in upcomingEvents" :key="event.event_id">
                                            <td>{{ event.course_name || event.title }}</td>
                                            <td>{{ formatDate(event.date) }}</td>
                                            <td>{{ formatTime(event.time) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div v-else class="no-data">
                                <p>No upcoming classes scheduled.</p>
                                <router-link to="/faculty/calendar" class="action-link">
                                    Add Class Schedule
                                </router-link>
                            </div>
                        </div>
                        
                        <div class="submissions-container">
                            <h2>Recent Submissions</h2>
                            <div v-if="recentSubmissions.length > 0">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Assignment</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="submission in recentSubmissions" :key="submission.id">
                                            <td>{{ submission.student_name }}</td>
                                            <td>{{ submission.assignment_title }}</td>
                                            <td>
                                                <span :class="getStatusClass(submission.status)">
                                                    {{ submission.status }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div v-else class="no-data">
                                <p>No recent submissions found.</p>
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
            recentSubmissions: []
        };
    },
    computed: {
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
                const response = await axios.get(`http://127.0.0.1:8000/api/courses?user_id=${this.faculty.user_id}`);
                this.courses = response.data;
            } catch (error) {
                console.error('Error fetching courses:', error);
                throw error;
            }
        },
        
        async fetchEvents() {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/events/');
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
        }
    }
};
</script>

<style scoped>
.dashboard-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f8f9fa;
}

.dashboard-content {
    display: flex;
    flex-grow: 1;
}

.dashboard-main {
    flex-grow: 1;
    padding: 20px;
    background-color: #f8f9fa;
}

.una-container {
    margin-bottom: 25px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    max-height: 300px;
    overflow-y: auto;
}

.una-container h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
    color: #2c3e50;
    font-size: 16px;
    font-weight: 600;
}

td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
    color: #3c4858;
    font-size: 14px;
}

tbody tr:hover {
    background-color: #f8f9fa;
}

.view-link {
    color: #007BF6;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s;
}

.view-link:hover {
    color: #0056b3;
    text-decoration: underline;
}

h1 {
    color: #2c3e50;
    margin-bottom: 25px;
}

.action-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 25px;
}

.card {
    flex: 1;
    min-width: 200px;
    padding: 20px;
    background-color: #007BF6;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    text-decoration: none;
    transition: transform 0.3s, box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.card i {
    font-size: 24px;
    color: white;
    margin-bottom: 10px;
}

.card h3 {
    color: white;
    margin: 0;
    font-size: 16px;
}

.side-by-side {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

@media (max-width: 768px) {
    .side-by-side {
        flex-direction: column;
    }
}

.upcoming-class-container, .submissions-container {
    flex: 1;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.upcoming-class-container h2, .submissions-container h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
}

.no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    color: #6c757d;
    font-style: italic;
}

.action-link {
    margin-top: 10px;
    color: #007BF6;
    font-weight: 600;
    text-decoration: none;
}

.action-link:hover {
    text-decoration: underline;
}

.status-submitted {
    color: #007BF6;
    font-weight: 600;
}

.status-graded {
    color: #28a745;
    font-weight: 600;
}

.status-pending {
    color: #ffc107;
    font-weight: 600;
}

.status-late {
    color: #dc3545;
    font-weight: 600;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 500px;
}

.loading-spinner {
    border: 4px solid #f3f3f3;
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
</style>