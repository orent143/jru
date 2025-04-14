import { createRouter, createWebHistory } from 'vue-router'; 

// Common Views
import LandingPage from '@/views/LandingPage.vue';
import Login from '@/views/Login.vue';

// Student Views
import StudentDashboard from '@/views/student/StudentDashboard.vue';
import CourseContent from '@/components/student/course/CourseContent.vue'; 
import CourseMaterialDetail from '@/components/student/course/CourseMaterialDetail.vue';
import AssignmentDashboard from '@/views/student/Assignment.vue';
import AssignmentContent from '@/components/student/assignment/AssignmentContent.vue';
import AssignmentDetails from '@/components/student/assignment/AssignmentDetails.vue';
import ExamDashboard from '@/views/student/Exam.vue';
import ExamContent from '@/components/student/exam/ExamContent.vue';
import ExamDetails from '@/components/student/exam/ExamDetails.vue';
import QuizDashboard from '@/views/student/Quiz.vue';
import QuizContent from '@/components/student/quiz/QuizContent.vue';
import QuizDetails from '@/components/student/quiz/QuizDetails.vue';
import GradeDashboard from '@/views/student/Grades.vue';
import StudentCalendar from '@/components/student/calendar/StudentCalendar.vue';

// Faculty Views
import FacultyDashboard from '@/views/faculty/FacultyDashboard.vue';
import FacultyCourses from '@/views/faculty/Courses.vue';
import FacultyCourseContent from '@/components/faculty/Course/coursescontent.vue';
import FacultyCourseMaterialDetail from '@/components/faculty/Course/FacultyCourseMaterial.vue';
import StudentList from '@/components/faculty/Course/StudentList.vue';
import GradeCreation from '@/components/faculty/Course/GradeCreation.vue';
import FacultyQuiz from '@/views/faculty/FacultyQuiz.vue';
import FacultyQuizContent from '@/components/faculty/Quiz/FacultyQuizContent.vue';
import FacultyQuizDetails from '@/components/faculty/Quiz/FacultyQuizDetails.vue';
import FacultyExam from '@/views/faculty/FacultyExam.vue';
import FacultyExamContent from '@/components/faculty/Exam/FacultyExamContent.vue';
import FacultyExamDetails from '@/components/faculty/Exam/FacultyExamDetails.vue';
import FacultyAssignment from '@/views/faculty/FacultyAssignment.vue';
import FacultyAssignmentContent from '@/components/faculty/Assignment/FacultyAssContent.vue';
import FacultyAssignmentDetails from '@/components/faculty/Assignment/FacultyAssignmentDetails.vue';
import QuizSubmissions from '@/components/faculty/Quiz/QuizSubmissions.vue';
import ExamSubmissions from '@/components/faculty/Exam/ExamSubmissions.vue';
import FacultyAssignmentSubmissions from '@/components/faculty/Assignment/AssignmentSubmission.vue';
import AssignmentSubmissionDetails from '@/components/faculty/Assignment/AssignmentSubmissionDetails.vue';
import QuizSubmissionDetails from '@/components/faculty/Quiz/QuizSubmissionDetails.vue';
import ExamSubmissionDetails from '@/components/faculty/Exam/ExamSubmissionDetails.vue';
import CalendarView from '@/components/faculty/Calendar/CalendarView.vue';
import ScheduleView from '@/components/faculty/Calendar/ScheduleView.vue';

// Admin Views
import AdminDashboard from '@/views/admin/Home.vue';
import Users from '@/views/admin/Users.vue';
import Reports from '@/views/admin/Reports.vue';
import Settings from '@/views/admin/Settings.vue';

const routes = [
  // Common Routes
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/login', name: 'Login', component: Login },

  // Student Routes
  { path: '/student-dashboard', name: 'StudentDashboard', component: StudentDashboard },
  { path: '/student/course/:courseId', name: 'StudentCourseContent', component: CourseContent, props: true },
  { path: '/course/:courseId/material/:materialId', name: 'StudentMaterialDetail', component: CourseMaterialDetail, props: true },
  { path: '/student/course/:courseId/assignments', name: 'AssignmentContent', component: AssignmentContent, props: true },
  { path: '/student/course/:courseId/assignment/:assignmentId', name: 'AssignmentDetails', component: AssignmentDetails, props: true },
  { path: '/student/assignment-dashboard', name: 'AssignmentDashboard', component: AssignmentDashboard },
  { path: '/student/exam-dashboard', name: 'ExamDashboard', component: ExamDashboard },
  { path: '/student/course/:courseId/exams', name: 'ExamContent', component: ExamContent, props: true },
  { path: '/student/course/:courseId/exam/:examId', name: 'ExamDetails', component: ExamDetails, props: true },
  { path: '/student/quiz-dashboard', name: 'QuizDashboard', component: QuizDashboard },
  { path: '/student/course/:courseId/quizzes', name: 'QuizContent', component: QuizContent, props: true },
  { path: '/student/course/:courseId/quiz/:quizId', name: 'QuizDetails', component: QuizDetails, props: true },
  { path: '/student/grade-dashboard', name: 'GradeDashboard', component: GradeDashboard },
  { path: '/student/calendar/:courseId', name: 'StudentCalendarCourse', component: StudentCalendar, props: true },
  { path: '/student/calendar', name: 'StudentCalendar', component: StudentCalendar },

  // Faculty Routes
  { path: '/faculty-dashboard', name: 'FacultyDashboard', component: FacultyDashboard },
  { path: '/faculty/courses', name: 'FacultyCourses', component: FacultyCourses },
  { path: '/faculty/course/:courseId', name: 'FacultyCourseContent', component: FacultyCourseContent },
  { path: '/faculty/course/:courseId/material/:materialId', name: 'FacultyMaterialDetail', component: FacultyCourseMaterialDetail, props: true },
  { path: '/faculty/course/:courseId/students', name: 'StudentList', component: StudentList, props: true },
  { path: '/faculty/course/:courseId/grades', name: 'GradeCreation', component: GradeCreation, props: true },
  { path: '/faculty/quizzes', name: 'FacultyQuiz', component: FacultyQuiz },
  { path: '/faculty/course/:courseId/quizzes', name: 'FacultyQuizContent', component: FacultyQuizContent, props: true },
  { path: '/faculty/course/:courseId/quiz/:quizId', name: 'FacultyQuizDetails', component: FacultyQuizDetails, props: true },
  { path: '/faculty/course/:courseId/quiz/:quizId/submissions', name: 'QuizSubmissions', component: QuizSubmissions, meta: { requiresAuth: true, role: 'faculty' } },
  { path: '/faculty/course/:courseId/quiz/:quizId/submission/:submissionId', name: 'QuizSubmissionDetails', component: QuizSubmissionDetails, meta: { requiresAuth: true, role: 'faculty' } },
  { path: '/faculty/exams', name: 'FacultyExam', component: FacultyExam },
  { path: '/faculty/course/:courseId/exams', name: 'FacultyExamContent', component: FacultyExamContent, props: true },
  { path: '/faculty/course/:courseId/exam/:examId', name: 'FacultyExamDetails', component: FacultyExamDetails, props: true },
  { path: '/faculty/course/:courseId/exam/:examId/submissions', name: 'ExamSubmissions', component: ExamSubmissions, props: true },
  { path: '/faculty/course/:courseId/exam/:examId/submission/:submissionId', name: 'ExamSubmissionDetails', component: ExamSubmissionDetails, meta: { requiresAuth: true, role: 'faculty' } },
  { path: '/faculty/assignments', name: 'FacultyAssignment', component: FacultyAssignment },
  { path: '/faculty/course/:courseId/assignments', name: 'FacultyAssignmentContent', component: FacultyAssignmentContent, props: true },
  { path: '/faculty/course/:courseId/assignment/:assignmentId', name: 'FacultyAssignmentDetails', component: FacultyAssignmentDetails, props: true },
  { path: '/faculty/course/:courseId/assignment/:assignmentId/submissions', name: 'FacultyAssignmentSubmissions', component: FacultyAssignmentSubmissions, props: true },
  { path: '/faculty/course/:courseId/assignment/:assignmentId/submission/:submissionId', name: 'AssignmentSubmissionDetails', component: AssignmentSubmissionDetails, meta: { requiresAuth: true, role: 'faculty' } },
  { path: '/faculty/calendar', name: 'CalendarView', component: CalendarView },
  { path: '/faculty/schedule', name: 'ScheduleView', component: ScheduleView },

  // Admin Routes
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard },
  { path: '/users', name: 'Users', component: Users },
  { path: '/reports', name: 'Reports', component: Reports },
  { path: '/settings', name: 'Settings', component: Settings },

  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/',
    name: 'NotFound'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userData = localStorage.getItem('user');
  const isAuthenticated = !!userData;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      const user = JSON.parse(userData);
      const userRole = user.role;
      const routeRole = to.meta.role;

      if (routeRole && userRole !== routeRole) {
        switch (userRole) {
          case 'student':
            next('/student-dashboard');
            break;
          case 'faculty':
            next('/faculty-dashboard');
            break;
          case 'admin':
            next('/admin-dashboard');
            break;
          default:
            next('/');
        }
      } else {
        next();
      }
    }
  } else {
    if (isAuthenticated && to.path === '/login') {
      const user = JSON.parse(userData);
      switch (user.role) {
        case 'student':
          next('/student-dashboard');
          break;
        case 'faculty':
          next('/faculty-dashboard');
          break;
        case 'admin':
          next('/admin-dashboard');
          break;
        default:
          next('/');
      }
    } else {
      next();
    }
  }
});

export default router;
