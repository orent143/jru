<template>
    <div class="dashboard-container">
        <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="dashboard-content">
            <SideBar :isCollapsed="isSidebarCollapsed" />
            <main class="dashboard-main">
                <h1>Greeting</h1>
                <!-- Greeting component goes here -->

                <div class="una-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Current Courses</th>
                                <th>Course & Section</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>ITELECT4</td>
                                <td>BSCS-3A</td>
                                <td><router-link to="/view-course-1">View</router-link></td>
                            </tr>
                            <tr>
                                <td>ITELECT4</td>
                                <td>BSCS-3B</td>
                                <td><router-link to="/view-course-2">View</router-link></td>
                            </tr>
                            <tr>
                                <td>ITELECT4</td>
                                <td>BSCS-3C</td>
                                <td><router-link to="/view-course-3">View</router-link></td>
                            </tr>
                            <!-- Add more rows as needed -->
                        </tbody>
                    </table>
                </div>

                <div class="action-cards">
                    <router-link to="/faculty-courses" class="card">
                        <h3>View Courses</h3>
                    </router-link>
                    <router-link to="/faculty-assignments" class="card">
                        <h3>Create Assignment</h3>
                    </router-link>
                    <router-link to="/view-submissions" class="card">
                        <h3>View Submissions</h3>
                    </router-link>
                    <router-link to="/add-class-schedule" class="card">
                        <h3>Add Class Schedule</h3>
                    </router-link>
                </div>

                <div class="side-by-side">
                    <div class="upcoming-class-container">
                        <h2>Upcoming Class</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Class Name</th>
                                    <th>Time</th>
                                    <th>Room</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>ITELECT4</td>
                                    <td>9:00 AM - 10:30 AM</td>
                                    <td>Room 102</td>
                                </tr>
                                <tr>
                                    <td>ENG101</td>
                                    <td>10:45 AM - 12:15 PM</td>
                                    <td>Room 205</td>
                                </tr>
                                <tr>
                                    <td>MATH203</td>
                                    <td>1:00 PM - 2:30 PM</td>
                                    <td>Room 308</td>
                                </tr>
                                <!-- Add more upcoming classes as needed -->
                            </tbody>
                        </table>
                    </div>
                    <div class="submissions-container">
                        <h2>Submissions</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Assignment</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Lorenz Papacoy</td>
                                    <td>Assignment 1</td>
                                    <td>Submitted</td>
                                </tr>
                                <tr>
                                    <td>GI Linghon</td>
                                    <td>Assignment 2</td>
                                    <td>Submitted</td>
                                </tr>
                                <tr>
                                    <td>Angelo Yaco</td>
                                    <td>Assignment 3</td>
                                    <td>Submitted</td>
                                </tr>
                                <!-- Add more student submissions as needed -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
import Header from '@/components/faculty/header.vue'; // Header component import
import SideBar from '@/components/faculty/SideBar.vue'; // Sidebar component import

export default {
    name: 'FacultyDashboard',
    components: {
        Header, // Register Header component
        SideBar, // Register Sidebar component
    },
    data() {
        return {
            // Add component data here
            searchQuery: '', // Example search query
            student: { // Example student data
                name: 'John Doe',
                id: '12345'
            },
            isSidebarCollapsed: false, // Sidebar collapsed state
        };
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
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

.container {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.una-container {
    margin-bottom: 40px;
    background-color: #D9D9D9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.una-container table {
    width: 100%;
    border-collapse: collapse;
}

.una-container th {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #000000;
    font-size: 23px;
    font-weight: bold;
}
.una-container td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #000000e1;
    font-size: 17px;
}
a, .green {
    text-decoration: none;
    color: #007BF6;
    transition: 0.4s;
    padding: 3px;
}
tbody  {
    background-color: #ffffff;
    border-radius: 20px;
}
h1, h2 {
    color: #333;
    display: flex;
}

.action-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 40px;
}

.card {
    flex: 1;
    min-width: 200px;
    padding: 17px;
    background-color: #007BF6;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    text-decoration: none;
}

.card h3 {
    color: #fff;
}

.side-by-side {
    display: flex;
    gap: 20px;
}

.upcoming-class-container, .submissions-container {
    flex: 1;
    background-color: #D9D9D9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.upcoming-class-container table,
.submissions-container table {
    width: 100%;
    border-collapse: collapse;
}
.upcoming-class-container, .submissions-container, h2{
    margin-left: 15px;
}
.upcoming-class-container th,
.submissions-container th {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #000;
    font-size: 18px;
    font-weight: bold;
}

.upcoming-class-container td,
.submissions-container td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #333;
    font-size: 16px;
}

.upcoming-class-container tbody,
.submissions-container tbody {
    background-color: #fff;
}

</style>