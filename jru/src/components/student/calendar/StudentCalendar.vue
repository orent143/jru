<template>
  <div class="calendar-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="main-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />

      <div class="calendar-content-wrapper">
        <div class="calendar-header">
          <h1>{{ course ? course.course_name : 'Academic Calendar' }}</h1>
          <div class="current-date">
            <i class="pi pi-calendar"></i>
            <span>{{ formattedCurrentDate }}</span>
          </div>
        </div>

        <div class="calendar-content">
          <!-- Loading and Error States -->
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading your calendar...</p>
          </div>
          
          <div v-else-if="loadingError" class="error-container">
            <i class="pi pi-exclamation-triangle"></i>
            <p>{{ loadingError }}</p>
            <button @click="initializeData" class="retry-btn">
              <i class="pi pi-refresh"></i> Retry
            </button>
          </div>
          
          <div v-else class="calendar-layout">
            <div class="calendar-sidebar">
              <div class="date-info">
                <h3>Today's Date</h3>
                <div class="date-display">
                  <div class="day">{{ currentDay }}</div>
                  <div class="month-year">
                    <div class="month">{{ currentMonth }}</div>
                    <div class="year">{{ currentYear }}</div>
                  </div>
                </div>
              </div>

              <div class="event-list">
                <h3>Upcoming Events</h3>
                <div v-if="upcomingEvents.length === 0" class="no-events">
                  No upcoming events
                </div>
                <div v-else class="event-items">
                  <div v-for="event in upcomingEvents" :key="event.event_id" class="event-item" :class="event.type || 'other'">
                    <div class="event-date">{{ formatEventDate(event.date) }}</div>
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-course" v-if="event.course_name">{{ event.course_name }}</div>
                    <div class="event-type">{{ formatEventType(event.type || 'other') }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="calendar-main">
              <div class="calendar-controls">
                <button @click="previousMonth" class="nav-btn">
                  <i class="pi pi-chevron-left"></i>
                </button>
                <h3>{{ displayMonth }} {{ displayYear }}</h3>
                <button @click="nextMonth" class="nav-btn">
                  <i class="pi pi-chevron-right"></i>
                </button>
              </div>

              <div class="calendar-grid">
                <div class="calendar-weekdays">
                  <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
                </div>
                <div class="calendar-days">
                  <div 
                    v-for="(day, index) in calendarDays" 
                    :key="index" 
                    class="calendar-day"
                    :class="{
                      'other-month': day.otherMonth,
                      'today': day.isToday,
                      'has-event': day.hasEvent
                    }"
                    @click="showDayEvents(day)"
                  >
                    <span class="day-number">{{ day.date }}</span>
                    <div v-if="day.hasEvent" class="event-indicator-container">
                      <div class="event-indicator"></div>
                      <div class="event-tooltip">
                        {{ getEventCountForDate(day.fullDate) }} event{{ getEventCountForDate(day.fullDate) !== 1 ? 's' : '' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Details Modal -->
      <div v-if="showEventDetailsModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeEventDetailsModal">&times;</span>
          <h2>Events on {{ selectedDateFormatted }}</h2>
          
          <div v-if="selectedDateEvents.length === 0" class="no-events">
            No events on this date
          </div>
          <div v-else class="selected-date-events">
            <div v-for="event in selectedDateEvents" :key="event.event_id" class="event-detail-item" :class="event.type || 'other'">
              <div class="event-detail-header">
                <h3>{{ event.title }}</h3>
                <span class="event-type-badge">{{ formatEventType(event.type || 'other') }}</span>
              </div>
              <div class="event-detail-course" v-if="event.course_name">
                <i class="pi pi-book"></i> {{ event.course_name }}
              </div>
              <div class="event-detail-time" v-if="event.time">
                <i class="pi pi-clock"></i> {{ formatEventTime(event.time) }}
              </div>
              <div class="event-detail-description" v-if="event.description">
                {{ event.description }}
              </div>
              <div class="event-detail-created-by" v-if="event.user_name">
                Posted by: {{ event.user_name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/header.vue';
import Sidebar from '@/components/student/Sidebar.vue';
import axios from "axios";
import { useToast } from 'vue-toastification';

export default {
  name: 'StudentCalendar',
  components: { 
    Header, 
    Sidebar 
  },
  props: {
    courseId: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      student: null,
      searchQuery: '',
      isSidebarCollapsed: false,
      courses: [],
      course: null,
      currentDate: new Date(),
      displayDate: new Date(),
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      events: [],
      courseEvents: [],
      showEventDetailsModal: false,
      selectedDate: null,
      selectedDateEvents: [],
      isLoading: false,
      loadingError: null
    };
  },
  computed: {
    formattedCurrentDate() {
      return this.currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    currentDay() {
      return this.currentDate.getDate();
    },
    currentMonth() {
      return this.currentDate.toLocaleDateString('en-US', { month: 'long' });
    },
    currentYear() {
      return this.currentDate.getFullYear();
    },
    displayMonth() {
      return this.displayDate.toLocaleDateString('en-US', { month: 'long' });
    },
    displayYear() {
      return this.displayDate.getFullYear();
    },
    calendarDays() {
      const year = this.displayDate.getFullYear();
      const month = this.displayDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const firstDayOfWeek = firstDay.getDay();
      
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      
      const days = [];
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = prevMonthLastDay - i;
        days.push({
          date,
          otherMonth: true,
          isToday: false,
          hasEvent: this.hasEventOnDate(new Date(year, month - 1, date)),
          fullDate: new Date(year, month - 1, date)
        });
      }
      
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const isToday = this.isToday(new Date(year, month, i));
        days.push({
          date: i,
          otherMonth: false,
          isToday,
          hasEvent: this.hasEventOnDate(new Date(year, month, i)),
          fullDate: new Date(year, month, i)
        });
      }
      
      const remainingDays = 42 - days.length; 
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: i,
          otherMonth: true,
          isToday: false,
          hasEvent: this.hasEventOnDate(new Date(year, month + 1, i)),
          fullDate: new Date(year, month + 1, i)
        });
      }
      
      return days;
    },
    upcomingEvents() {
      const now = new Date();
      return this.courseEvents
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= new Date(now.setHours(0, 0, 0, 0));
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5); 
    },
    selectedDateFormatted() {
      if (!this.selectedDate) return '';
      
      return this.selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  mounted() {
    this.loadUserData();
    
    if (!this.student) {
      setTimeout(() => {
        this.loadUserData();
        this.initializeData();
      }, 500);
    } else {
      this.initializeData();
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    },
    hasEventOnDate(date) {
      return this.courseEvents.some(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === date.getDate() &&
               eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
      });
    },
    previousMonth() {
      this.displayDate = new Date(
        this.displayDate.getFullYear(),
        this.displayDate.getMonth() - 1,
        1
      );
    },
    nextMonth() {
      this.displayDate = new Date(
        this.displayDate.getFullYear(),
        this.displayDate.getMonth() + 1,
        1
      );
    },
    showDayEvents(day) {
      if (day.otherMonth) return;
      
      this.selectedDate = day.fullDate;
      
      this.selectedDateEvents = this.courseEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === day.fullDate.getDate() &&
               eventDate.getMonth() === day.fullDate.getMonth() &&
               eventDate.getFullYear() === day.fullDate.getFullYear();
      });
      
      this.showEventDetailsModal = true;
    },
    closeEventDetailsModal() {
      this.showEventDetailsModal = false;
      this.selectedDateEvents = [];
    },
    formatEventDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    },
    formatEventTime(timeString) {
      if (!timeString) return '';
      
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      
      return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
    },
    formatEventType(type) {
      const typeMap = {
        'class': 'Class',
        'exam': 'Exam',
        'quiz': 'Quiz',
        'assignment': 'Assignment',
        'meeting': 'Meeting',
        'holiday': 'Holiday',
        'deadline': 'Deadline',
        'other': 'Event'
      };
      
      return typeMap[type] || 'Event';
    },
    loadUserData() {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.student = JSON.parse(userData);
      }
    },
    async fetchCourses() {
      const toast = useToast();
      try {
        if (!this.student || !this.student.user_id) {
          console.log('Student data not available yet');
          return;
        }
        
        const response = await axios.get(`http://127.0.0.1:8000/api/student_courses/${this.student.user_id}`);
        
        if (response.data && response.data.courses) {
          this.courses = response.data.courses;
          console.log('Fetched student courses:', this.courses);
        } else {
          console.error('Unexpected response format:', response.data);
          this.courses = [];
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
        this.courses = [];
      }
    },
    async fetchCourseDetails() {
      if (!this.courseId) {
        console.log('No course ID provided, skipping course details fetch');
        return;
      }
      
      const toast = useToast();
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/courses/${this.courseId}`);
        this.course = response.data;
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast.error('Failed to load course details');
      }
    },
    async fetchEvents() {
      const toast = useToast();
      try {
        let allEvents = [];
        
        if (this.courseId) {
          const response = await axios.get(`http://127.0.0.1:8000/api/events/course/${this.courseId}`);
          allEvents = response.data;
        } else if (this.courses && this.courses.length > 0) {
          const eventPromises = this.courses.map(course => 
            axios.get(`http://127.0.0.1:8000/api/events/course/${course.course_id}`)
              .then(response => response.data)
              .catch(error => {
                console.error(`Error fetching events for course ${course.course_id}:`, error);
                return []; 
              })
          );
          
          const eventsArrays = await Promise.all(eventPromises);
          
          allEvents = eventsArrays.flat();
        }
        
        this.courseEvents = allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log('Fetched and processed events:', this.courseEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
        this.courseEvents = [];
      }
    },
    async initializeData() {
      this.isLoading = true;
      this.loadingError = null;
      
      try {
        await this.fetchCourses();
        
        if (this.courseId) {
          await this.fetchCourseDetails();
        }
        
        await this.fetchEvents();
      } catch (error) {
        console.error('Error initializing data:', error);
        const toast = useToast();
        toast.error('Failed to initialize calendar data');
        this.loadingError = 'Failed to load calendar data. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    getEventCountForDate(date) {
      let count = 0;
      this.courseEvents.forEach(event => {
        const eventDate = new Date(event.date);
        if (eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()) {
          count++;
        }
      });
      return count;
    }
  }
};
</script>

<style scoped>
.calendar-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  display: flex;
  flex: 1;
  position: relative;
}

.calendar-content-wrapper {
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
}

.calendar-content-wrapper.sidebar-collapsed {
  margin-left: 0;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h1 {
  color: #2c3e50;
}

.current-date {
  display: flex;
  align-items: center;
  background-color: #007BF6;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 600;
}

.current-date i {
  margin-right: 10px;
  font-size: 18px;
}

.calendar-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.calendar-layout {
  display: flex;
  gap: 20px;
  width: 100%;
}

.calendar-sidebar {
  width: 300px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.date-info {
  margin-bottom: 30px;
}

.date-info h3, .event-list h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.date-display {
  display: flex;
  align-items: center;
}

.day {
  font-size: 48px;
  font-weight: 700;
  color: #007BF6;
  margin-right: 10px;
}

.month-year {
  display: flex;
  flex-direction: column;
}

.month {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.year {
  font-size: 14px;
  color: #6c757d;
}

.event-list {
  margin-top: 30px;
}

.no-events {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 10px;
}

.event-items {
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: #f8f9fa;
  border-left: 5px solid #007BF6;
}

.event-item.class {
  border-left-color: #007BF6;
}

.event-item.exam {
  border-left-color: #dc3545;
}

.event-item.quiz {
  border-left-color: #fd7e14;
}

.event-item.assignment {
  border-left-color: #28a745;
}

.event-item.meeting {
  border-left-color: #6610f2;
}

.event-item.other {
  border-left-color: #6c757d;
}

.event-date {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.event-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.event-course {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.event-type {
  font-size: 12px;
  font-weight: 600;
  color: #007BF6;
}

.event-item.exam .event-type {
  color: #dc3545;
}

.event-item.quiz .event-type {
  color: #fd7e14;
}

.event-item.assignment .event-type {
  color: #28a745;
}

.event-item.meeting .event-type {
  color: #6610f2;
}

.event-item.other .event-type {
  color: #6c757d;
}

.calendar-main {
  flex: 1;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-controls h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #007BF6;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-btn:hover {
  background-color: #f0f0f0;
}

.calendar-grid {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.weekday {
  padding: 10px;
  text-align: center;
  font-weight: 600;
  color: #6c757d;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
}

.calendar-day {
  position: relative;
  height: 100px;
  padding: 10px;
  border-right: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.3s;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.day-number {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.other-month .day-number {
  color: #adb5bd;
}

.today {
  background-color: #e6f2ff;
}

.today .day-number {
  background-color: #007BF6;
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.event-indicator-container {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
}

.event-indicator {
  width: 6px;
  height: 6px;
  background-color: #007BF6;
  border-radius: 50%;
}

.event-tooltip {
  visibility: hidden;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #007BF6;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s, visibility 0.3s;
}

.calendar-day:hover .event-tooltip {
  visibility: visible;
  opacity: 1;
}

/* Modal Styles */
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
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-content h2 {
  font-size: 22px;
  font-weight: bold;
  color: #000;
  margin-bottom: 20px;
  text-align: center;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #000;
  font-size: 25px;
}

.selected-date-events {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-detail-item {
  padding: 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border-left: 5px solid #007BF6;
}

.event-detail-item.class {
  border-left-color: #007BF6;
}

.event-detail-item.exam {
  border-left-color: #dc3545;
}

.event-detail-item.quiz {
  border-left-color: #fd7e14;
}

.event-detail-item.assignment {
  border-left-color: #28a745;
}

.event-detail-item.meeting {
  border-left-color: #6610f2;
}

.event-detail-item.other {
  border-left-color: #6c757d;
}

.event-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.event-detail-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.event-type-badge {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: #007BF6;
  color: white;
}

.event-detail-item.exam .event-type-badge {
  background-color: #dc3545;
}

.event-detail-item.quiz .event-type-badge {
  background-color: #fd7e14;
}

.event-detail-item.assignment .event-type-badge {
  background-color: #28a745;
}

.event-detail-item.meeting .event-type-badge {
  background-color: #6610f2;
}

.event-detail-item.other .event-type-badge {
  background-color: #6c757d;
}

.event-detail-course {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.event-detail-course i {
  margin-right: 5px;
}

.event-detail-time {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.event-detail-time i {
  margin-right: 5px;
}

.event-detail-description {
  margin-bottom: 10px;
  color: #2c3e50;
  line-height: 1.5;
}

.event-detail-created-by {
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 768px) {
  .calendar-content {
    flex-direction: column;
  }
  
  .calendar-sidebar {
    width: 100%;
  }
  
  .calendar-day {
    height: 80px;
  }
}

/* Add styles for loading and error states */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  height: 300px;
  width: 100%;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007BF6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container i {
  font-size: 40px;
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-container p {
  margin-bottom: 1rem;
  text-align: center;
  color: #6c757d;
}

.retry-btn {
  background-color: #007BF6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.retry-btn:hover {
  background-color: #0069d9;
}
</style> 