<template>
  <div class="modal-container">
    <div class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>Edit Course</h2>
        
        <label for="course_name">Course Name:</label>
        <input v-model="course_name" type="text" placeholder="Enter Course Name" required />

        <label for="section">Section:</label>
        <input v-model="section" type="text" placeholder="Enter Section" required />

        <label for="class_schedule">Class Schedule:</label>
        <input v-model="class_schedule" type="text" placeholder="Enter Class Schedule" />

        <button @click="confirmEditCourse" :disabled="isSubmitting">Update Course</button>
      </div>
    </div>
  </div>

  <ConfirmationModal
    :show="showConfirmation"
    title="Update Course"
    message="Are you sure you want to update this course?"
    confirmText="Update"
    type="primary"
    @confirm="handleCourseUpdate"
    @cancel="showConfirmation = false"
  />
</template>

<script>
import axios from "axios";
import { useToast } from 'vue-toastification';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

export default {
  components: {
    ConfirmationModal
  },
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      course_name: "",
      section: "",
      class_schedule: "",
      isSubmitting: false,
      showConfirmation: false,
      pendingCourse: null
    };
  },
  watch: {
    course: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.course_name = newVal.course_name;
          this.section = newVal.section;
          this.class_schedule = newVal.class_schedule || "";
        }
      }
    }
  },
  methods: {
    confirmEditCourse() {
      const toast = useToast();

      if (!this.course_name || !this.section) {
        toast.error('Please fill in all required fields.');
        return;
      }

      this.pendingCourse = {
        course_name: this.course_name,
        section: this.section,
        class_schedule: this.class_schedule
      };

      this.showConfirmation = true;
    },

    async handleCourseUpdate() {
      this.showConfirmation = false;
      const toast = useToast();
      this.isSubmitting = true;

      try {
        const user = JSON.parse(localStorage.getItem('user'));
        await axios.put(
          `http://127.0.0.1:8000/api/courses/${this.course.course_id}`,
          this.pendingCourse,
          {
            params: { user_id: user.user_id }
          }
        );

        toast.success('Course updated successfully!');
        this.$emit("update-course", {
          ...this.course,
          ...this.pendingCourse
        });
        this.closeModal();
      } catch (error) {
        console.error("Error updating course:", error);
        toast.error('Failed to update course.');
      } finally {
        this.isSubmitting = false;
      }
    },

    closeModal() {
      this.$emit("close");
    }
  }
};
</script>

<style scoped>
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
  position: relative;
}

.modal-content h2 {
  font-size: 25px;
  font-weight: bold;
  color: #000;
  margin-bottom: 15px;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #000;
  font-size: 25px;
}

.modal-content label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
  color: #272727;
}

.modal-content input {
  padding: 10px;
  font-size: 14px;
  border-radius: 12px;
  width: 100%;
  border: 1px solid #ccc;
  margin-bottom: 15px;
}

.modal-content button {
  padding: 12px 20px;
  background-color: #007BF6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.modal-content button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.modal-content button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style> 