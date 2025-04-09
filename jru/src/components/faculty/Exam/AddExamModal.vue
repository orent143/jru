<template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Add New Exam</h2>
      
      <label for="title">Exam Title:</label>
      <input v-model="title" type="text" placeholder="Enter Title" required />

      <label for="description">Exam Description:</label>
      <textarea v-model="description" placeholder="Enter Description"></textarea>

      <label for="exam_date">Exam Date:</label>
      <input v-model="exam_date" type="date" required />

      <label for="duration">Duration (minutes):</label>
      <input v-model="duration" type="number" placeholder="Enter duration" required />

      <label for="file-upload">Upload File (Optional):</label>
      <input type="file" @change="handleFileUpload" />
      <p v-if="fileName" class="file-name">Selected File: {{ fileName }}</p>

      <label for="external_link">External Link (Optional):</label>
      <input v-model="externalLink" type="text" placeholder="Enter external link (if any)" />

      <button @click="confirmAddExam" :disabled="isSubmitting">Add Exam</button>
    </div>
  </div>

  <ConfirmationModal
    :show="showConfirmation"
    title="Add Exam"
    message="Are you sure you want to add this exam?"
    confirmText="Add"
    type="primary"
    @confirm="handleExamSubmission"
    @cancel="showConfirmation = false"
  />
</template>

<script>
import axios from "axios";
import { useToast } from 'vue-toastification'; // Import the toast module
import ConfirmationModal from '@/components/ConfirmationModal.vue';

export default {
  components: {
    ConfirmationModal
  },
  props: {
    courseId: Number,
  },
  data() {
    return {
      title: "",
      description: "",
      exam_date: "",
      duration: null,
      file: null,
      fileName: "",
      externalLink: "",
      isSubmitting: false,
      showConfirmation: false,
      pendingExam: null
    };
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.fileName = this.file ? this.file.name : "";
    },

    confirmAddExam() {
      const toast = useToast();

      if (!this.courseId || !this.title || !this.description || !this.exam_date || !this.duration) {
        toast.error('Please fill in all required fields.');
        return;
      }

      this.pendingExam = {
        title: this.title,
        description: this.description,
        exam_date: this.exam_date,
        duration: this.duration,
        file: this.file,
        externalLink: this.externalLink
      };

      this.showConfirmation = true;
    },

    async handleExamSubmission() {
      this.showConfirmation = false;
      const toast = useToast();

      this.isSubmitting = true;

      const formData = new FormData();
      formData.append("course_id", this.courseId);
      formData.append("title", this.pendingExam.title);
      formData.append("description", this.pendingExam.description);
      formData.append("exam_date", this.pendingExam.exam_date);
      formData.append("duration_minutes", this.pendingExam.duration);

      if (this.pendingExam.externalLink) {
        formData.append("external_link", this.pendingExam.externalLink);
      }

      if (this.pendingExam.file) {
        formData.append("file", this.pendingExam.file);
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/exams', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success('Exam added successfully!');
        this.$emit("add-exam", response.data);
        this.resetForm();
      } catch (error) {
        console.error("Error adding exam:", error);
        toast.error('Failed to add exam.');
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.title = "";
      this.description = "";
      this.exam_date = "";
      this.duration = null;
      this.file = null;
      this.fileName = "";
      this.externalLink = "";
      this.$emit("close");
    },
    closeModal() {
      this.resetForm();
    },
  },
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
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
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

.modal-content input,
.modal-content textarea {
  padding: 10px;
  font-size: 14px;
  border-radius: 12px;
  width: 100%;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.file-name {
  font-size: 14px;
  color: #007BF6;
  margin-bottom: 10px;
}

.modal-content button {
  padding: 10px 20px;
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
}
</style>
