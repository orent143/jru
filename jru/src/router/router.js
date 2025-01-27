import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import StudentDashboard from '@/views/StudentDashboard.vue';
import CourseContent from '@/components/student/CourseContent.vue'; // Import the CourseContent view
import AssignmentDetailsVue from '@/components/student/AssignmentDetails.vue';


const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },
  {
    path: '/student-dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
  },
  {
    path: '/course/:courseId', // Dynamic route for course details
    name: 'CourseContent',
    component: CourseContent,
    props: true, // Pass the route params as props to the component
  },
  {
    path: '/course/:courseId/assignment/:assignmentId', // Dynamic route for assignment details
    name: 'AssignmentDetails',
    component: AssignmentDetailsVue,
    props: true, // Pass the route params as props to the component
  },
  // Add other routes as needed
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;