<template>
    <div class="grades">
        <Header :student="studentName" @toggleSidebar="toggleSidebar" />
        <div class="container">
            <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
            <div class="content">
                <div class="academic-records-container">
                    <h1>Academic Records</h1>
                    <div class="student-info">
                        <h2>Student Information</h2>
                        <p>Student Number: {{ studentNumber }}</p>
                        <p>Name: {{ studentName }}</p>
                        <p>Degree Program: {{ degreeProgram }}</p>
                        <p>Type of Semester: {{ semesterType }}</p>
                    </div>
                    <div class="grade-details">
                        <h2>Grade Details</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Course/Subject</th>
                                    <th>Units</th>
                                    <th>Prelim Grade</th>
                                    <th>Midterm Grade</th>
                                    <th>Finals Grade</th>
                                    <th>Units Earned</th>
                                    <th>Section</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="grade in gradeDetails" :key="grade.course">
                                    <td>{{ grade.course }}</td>
                                    <td>{{ grade.units }}</td>
                                    <td>{{ grade.prelimGrade }}</td>
                                    <td>{{ grade.midtermGrade }}</td>
                                    <td>{{ grade.finalsGrade }}</td>
                                    <td>{{ grade.unitsEarned }}</td>
                                    <td>{{ grade.section }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/header.vue';

import Sidebar from '@/components/student/Sidebar.vue';

export default {
    components: {
        Header,
        Sidebar,
    },
    data() {
        return {
            studentNumber: '123456',
            studentName: 'Geric Gultiano',
            degreeProgram: 'Computer Science',
            semesterType: 'Second Semester 2024-2025',
            isSidebarCollapsed: false,
            courses: [
                'ITELECT4',
                'GEC010',
                'CC321',
                'ITELECT3',
                'IT321',
                'ITFELECT1',
                'ELEC026',
                'CC311',
                'CC313'
            ],
            gradeDetails: [
                { course: 'ITELECT4', units: 3, prelimGrade: '40', midtermGrade: '40', finalsGrade: '40', unitsEarned: 3, section: 'BSCS-3A' },
                { course: 'GEC010', units: 3, prelimGrade: '40', midtermGrade: '40', finalsGrade: '40', unitsEarned: 3, section: 'BSCS-3A' },
                { course: 'CC321', units: 4, prelimGrade: '40', midtermGrade: '40', finalsGrade: '40', unitsEarned: 4, section: 'BSCS-3A' },
                { course: 'ITELECT3', units: 3, prelimGrade: '40', midtermGrade: '40', finalsGrade: '40', unitsEarned: 3, section: 'BSCS-3A' },
                { course: 'IT321', units: 3, prelimGrade: '40', midtermGrade: '40', finalsGrade: '40', unitsEarned: 3, section: 'BSCS-3A' },
                { course: 'ITFELECT1', units: 3, prelimGrade: '40', midtermGrade: '40', finalsGrade: '40', unitsEarned: 3, section: 'BSCS-3A' },
                { course: 'ELEC026', units: 2, prelimGrade: '40', midtermGrade: '40', finalsGrade: '40', unitsEarned: 2, section: 'BSCS-3A' },
                { course: 'CC311', units: 4, prelimGrade: '40', midtermGrade: '40', finalsGrade: '40', unitsEarned: 4, section: 'BSCS-3A' },
                { course: 'CC313', units: 3, prelimGrade: '40', midtermGrade: '40', finalsGrade: '40', unitsEarned: 3, section: 'BSCS-3A' }
            ]
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
.container {
    display: flex;
    margin: 0 auto;
    overflow-x: auto; /* Enable horizontal scrolling for the entire container */
    height: 100vh; /* Full height for the container */
}

.content {
    flex: 1;
    padding: 20px;
    background-color: #fff;

    overflow-y: auto; /* Enable vertical scrolling for the content */
    height: calc(100vh - 50px); /* Adjust height considering the header */
}

.academic-records-container {
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow-y: auto; /* Allow vertical scrolling within the container if content overflows */
    max-height: calc(100vh - 100px); /* Max height for scrolling */
}

.student-info {
    margin-bottom: 20px;
    background-color: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.grade-details table {
    width: 100%;
    border-collapse: collapse;
    overflow-x: auto; /* Allow horizontal scrolling in the table */
    table-layout: auto;
}

.grade-details th,
.grade-details td {
    padding: 12px;
    text-align: left;
    color: #333;
    border-bottom: 1px solid #ddd;
}

.grade-details th {
    background-color: #e0e0e0;
    font-weight: bold;
}

h1, h2, p {
    color: #333;
    margin: 0 0 10px;
}

h1 {
    font-size: 24px;
}

h2 {
    font-size: 20px;
}
</style>
