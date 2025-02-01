<template>
    <div class="dashboard-container">
        <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="dashboard-content">
            <SideBar :isCollapsed="isSidebarCollapsed" />
            <main class="dashboard-main">
                <h1>Greeting</h1>
                <!-- Greeting component goes here -->

                <div class="una-container">
                    <h2>Current Courses</h2>
                    <!-- Course & Section component goes here -->

                    <h2>Actions</h2>
                    <!-- Actions component goes here -->
                </div>

                    <div class="action-cards">
                        <div class="card">
                            <h3>View Courses</h3>
                            <!-- View Courses component goes here -->
                        </div>
                        <div class="card">
                            <h3>Create Assignment</h3>
                            <!-- Create Assignment component goes here -->
                        </div>
                        <div class="card">
                            <h3>View Submissions</h3>
                            <!-- View Submissions component goes here -->
                        </div>
                        <div class="card">
                            <h3>Add Class Schedule</h3>
                            <!-- Add Class Schedule component goes here -->
                        </div>
                    </div>

                    <div class="side-by-side">
                        <div class="upcoming-class-container">
                            <h2>Upcoming Class</h2>
                            <!-- Upcoming Class component goes here -->
                        </div>
                        <div class="submissions-container">
                            <h2>Submissions</h2>
                            <!-- Submissions component goes here -->
                        </div>
                    </div>
            </main>
        </div>
    </div>
</template>

<script>
import Header from '@/components/faculty/Header.vue'; // Header component import
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
.una-container{
    display: flex;
    flex-direction: row;
    gap: 20px;
    margin-bottom: 40px;
    padding: 20px;
    background-color: #D9D9D9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
}

.card h3{
    color: #fff;
    
}

.side-by-side {
    display: flex;
    gap: 20px;
}

.upcoming-class-container, .submissions-container {
    flex: 1;
    padding: 20px;
    background-color: #D9D9D9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>