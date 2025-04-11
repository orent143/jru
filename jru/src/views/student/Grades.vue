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
                        <p>Student ID: {{ student.id }}</p>
                        <p>Name: {{ student.name }}</p>
                        <p>Degree: {{ studentDegree }}</p>
                        <div class="school-year-selector">
                        <label for="school-year">School Year:</label>
                        <select id="school-year" v-model="selectedSchoolYear">
                            <option value="">All School Years</option>
                            <option v-for="year in schoolYears" :key="year" :value="year">{{ year }}</option>
                        </select>
                    </div>

                        <div class="semester-selector">
                        <label for="semester">Semester:</label>
                        <select id="semester" v-model="selectedSemester">
                            <option value="">All Semesters</option>
                            <option value="1st">1st Semester</option>
                            <option value="2nd">2nd Semester</option>
                        </select>
                    </div>
                    </div>
                    

                    
                    <div class="grade-details">
                        <h2>Grade Details</h2>
                        
                        <div v-if="loading" class="loading-message">
                            <i class="pi pi-spin pi-spinner"></i>
                            <p>Loading grades...</p>
                        </div>
                        
                        <div v-else-if="filteredGrades.length === 0" class="no-grades-message">
                            <i class="pi pi-info-circle"></i>
                            <p>No grades found for the selected filters.</p>
                        </div>
                        
                        <table v-else>
                            <thead>
                                <tr>
                                    <th>Course/Subject</th>
                                    <th>School Year</th>
                                    <th>Semester</th>
                                    <th>Prelim Grade</th>
                                    <th>Midterm Grade</th>
                                    <th>Finals Grade</th>
                                    <th>Overall Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="grade in filteredGrades" :key="grade.grade_id">
                                    <td>{{ getCourseTitle(grade.course_id) }}</td>
                                    <td>{{ grade.school_year }}</td>
                                    <td>{{ grade.semester }}</td>
                                    <td :class="getGradeClass(grade.prelim_grade)">{{ grade.prelim_grade }}</td>
                                    <td :class="getGradeClass(grade.midterm_grade)">{{ grade.midterm_grade }}</td>
                                    <td :class="getGradeClass(grade.finals_grade)">{{ grade.finals_grade }}</td>
                                    <td :class="getGradeClass(grade.overall_grade)">{{ grade.overall_grade }}</td>
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
import axios from 'axios';
import { useToast } from "vue-toastification";

export default {
    components: {
        Header,
        Sidebar,
    },
    setup() {
        const toast = useToast();
        return { toast };
    },
    data() {
        return {
            student: JSON.parse(localStorage.getItem("user")) || {},
            studentName: '',
            studentDegree: '',
            isSidebarCollapsed: false,
            courses: [],
            courseMap: {},
            grades: [],
            loading: true,
            selectedSchoolYear: '',
            selectedSemester: '',
            schoolYears: []
        };
    },
    computed: {
        filteredGrades() {
            let filtered = [...this.grades];
            
            if (this.selectedSchoolYear) {
                filtered = filtered.filter(grade => grade.school_year === this.selectedSchoolYear);
            }
            
            if (this.selectedSemester) {
                filtered = filtered.filter(grade => grade.semester === this.selectedSemester);
            }
            
            return filtered;
        }
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        async fetchStudentData() {
            try {
                const studentData = this.student;
                if (!studentData) {
                    this.toast.error("User information not found");
                    return;
                }
                
                const studentId = studentData.user_id;
                if (!studentId) {
                    this.toast.error("Student ID not found");
                    return;
                }
                
                this.studentName = studentData.name || 'Student';
                
                // Fetch student details to get degree
                try {
                    const studentDetailsResponse = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}`);
                    if (studentDetailsResponse.data) {
                        this.studentDegree = studentDetailsResponse.data.degree || 'Not specified';
                    }
                } catch (detailsError) {
                    console.error("Error fetching student details:", detailsError);
                    this.studentDegree = studentData.degree || 'Not specified';
                }
                
                // Fetch student courses
                const coursesResponse = await axios.get(`http://127.0.0.1:8000/api/student_courses/${studentId}`);
                this.courses = coursesResponse.data.courses || [];
                
                // Create a mapping of course IDs to course titles
                this.courseMap = {};
                this.courses.forEach(course => {
                    this.courseMap[course.course_id] = course.course_name || `Course ${course.course_id}`;
                });
                
                // Fetch student grades (from all courses)
                await this.fetchGrades();
            } catch (error) {
                console.error("Error fetching student data:", error);
                this.toast.error("Failed to load student data: " + (error.response?.data?.detail || error.message));
            }
        },
        async fetchGrades() {
            this.loading = true;
            try {
                // Fetch grades from all courses
                const studentId = this.student.user_id;
                if (!studentId) {
                    this.toast.error("Student ID not found");
                    this.loading = false;
                    return;
                }
                
                const gradesResponse = await axios.get(`http://127.0.0.1:8000/api/student/${studentId}/grades`);
                const responseData = gradesResponse.data;
                
                // Update grades and degree
                this.grades = responseData.grades || [];
                if (responseData.student_degree && !this.studentDegree) {
                    this.studentDegree = responseData.student_degree;
                }
                
                // Extract unique school years for the filter
                this.schoolYears = [...new Set(this.grades.map(grade => grade.school_year))].sort().reverse();
                
                // Set default filters if available
                if (this.schoolYears.length > 0 && !this.selectedSchoolYear) {
                    this.selectedSchoolYear = this.schoolYears[0]; // Most recent school year
                }
            } catch (error) {
                console.error("Error fetching grades:", error);
                this.toast.error("Failed to load grades: " + (error.response?.data?.detail || error.message));
            } finally {
                this.loading = false;
            }
        },
        getCourseTitle(courseId) {
            if (this.courseMap[courseId]) {
                return this.courseMap[courseId];
            }
            
            // If the course is not in the map, get it from the grade's course_title if available
            const grade = this.grades.find(g => g.course_id === courseId);
            return grade?.course_title || `Course ID: ${courseId}`;
        },
        getGradeClass(grade) {
            if (grade === null) return "";
            if (grade >= 90) return 'grade-excellent';
            if (grade >= 80) return 'grade-good';
            if (grade >= 75) return 'grade-fair';
            if (grade >= 70) return 'grade-poor';
            return 'grade-failing';
        }
    },
    async mounted() {
        await this.fetchStudentData();
    }
};
</script>

<style scoped>
.container {
    display: flex;
    margin: 0 auto;
    overflow-x: auto;
    height: 100vh;
}

.content {
    flex: 1;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    height: calc(100vh - 50px);
}

.academic-records-container {
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    max-height: calc(100vh - 100px);
}

.student-info {
    margin-bottom: 20px;
    background-color: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.school-year-selector {
    display: flex;
    margin-bottom: 10px;
}
.semester-selector {
    display: flex;
}
.school-year-selector label {
    color:#333;
    margin-right: 0.5rem;
}
.semester-selector label {
    color:#333;
    margin-right: 0.5rem;
}
.school-year-selector select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: white;
}
.semester-selector select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: white;
}

.grade-details {
    background-color: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.grade-details table {
    width: 100%;
    border-collapse: collapse;
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

.loading-message, .no-grades-message {
    text-align: center;
    padding: 3rem;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.loading-message i, .no-grades-message i {
    font-size: 2rem;
    color: #2c3e50;
}

h1, h2, p {
    color: #333;
    margin: 0 0 10px;
}

h1 {
    color: #2c3e50;
    font-size: 24px;
}

h2 {
    font-size: 20px;
}

.grade-excellent { color: #28a745; font-weight: 600; }
.grade-good { color: #17a2b8; font-weight: 600; }
.grade-fair { color: #ffc107; font-weight: 600; }
.grade-poor { color: #fd7e14; font-weight: 600; }
.grade-failing { color: #dc3545; font-weight: 600; }
</style>
