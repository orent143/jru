<template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Add New Quiz</h2>
      
      <label for="title">Quiz Title:</label>
      <input v-model="title" type="text" placeholder="Enter Title" required />

      <label for="description">Quiz Description:</label>
      <textarea v-model="description" placeholder="Enter Description"></textarea>

      <label for="quiz_date">Quiz Date:</label>
      <input v-model="quiz_date" type="date" required />

      <label for="duration">Duration (minutes):</label>
      <input v-model="duration" type="number" placeholder="Enter duration" required />

      <label for="file-upload">Upload File (Optional):</label>
      <input type="file" @change="handleFileUpload" />
      <p v-if="fileName" class="file-name">Selected File: {{ fileName }}</p>

      <label for="external_link">External Link (Optional):</label>
      <input v-model="link" type="text" placeholder="Enter external link (if any)" />

      <button @click="confirmAddQuiz" :disabled="isSubmitting">Add Quiz</button>
    </div>
  </div>

  <ConfirmationModal
    :show="showConfirmation"
    title="Add Quiz"
    message="Are you sure you want to add this quiz?"
    confirmText="Add"
    type="primary"
    @confirm="handleQuizSubmission"
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
    courseId: Number,
  },
  data() {
    return {
      title: "",
      description: "",
      quiz_date: "",
      duration: null,
      file: null,
      fileName: "",
      link: "",
      isSubmitting: false,
      showConfirmation: false,
      pendingQuiz: null
    };
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.fileName = this.file ? this.file.name : "";
    },

    confirmAddQuiz() {
      const toast = useToast();

      if (!this.courseId || !this.title || !this.description || !this.quiz_date || !this.duration) {
        toast.error('Please fill in all required fields.');
        return;
      }

      this.pendingQuiz = {
        title: this.title,
        description: this.description,
        quiz_date: this.quiz_date,
        duration: this.duration,
        file: this.file,
        link: this.link
      };

      this.showConfirmation = true;
    },

    async handleQuizSubmission() {
      this.showConfirmation = false;
      const toast = useToast();

      if (!this.validateForm()) {
        return;
      }

      this.isSubmitting = true;

      const formData = new FormData();
      formData.append("course_id", this.courseId);
      formData.append("title", this.pendingQuiz.title);
      formData.append("description", this.pendingQuiz.description);
      formData.append("quiz_date", this.pendingQuiz.quiz_date);
      formData.append("duration_minutes", this.pendingQuiz.duration);

      // Only one of file or external link should be provided
      let filePath = null;
      if (this.pendingQuiz.link) {
        formData.append("external_link", this.pendingQuiz.link);
        filePath = this.pendingQuiz.link;
      } else if (this.pendingQuiz.file) {
        formData.append("file", this.pendingQuiz.file);
        filePath = "File uploaded"; // Placeholder, will be replaced on refetch
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/quizzes', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success('Quiz added successfully!');
        
        // Add file_path to the response data if needed
        const quizData = response.data;
        if (!quizData.file_path && filePath) {
          quizData.file_path = filePath;
        }
        
        this.$emit("add-quiz", quizData);
        this.resetForm();
      } catch (error) {
        console.error("Error adding quiz:", error);
        toast.error('Failed to add quiz.');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    validateForm() {
      const toast = useToast();
      
      if (!this.courseId || !this.pendingQuiz.title || !this.pendingQuiz.description || 
          !this.pendingQuiz.quiz_date || !this.pendingQuiz.duration) {
        toast.error('Please fill in all required fields.');
        return false;
      }
      
      // Check if both file and external link are provided
      if (this.pendingQuiz.file && this.pendingQuiz.link) {
        toast.error('Please provide either a file OR an external link, not both.');
        return false;
      }
      
      return true;
    },

    resetForm() {
      this.title = "";
      this.description = "";
      this.quiz_date = "";
      this.duration = null;
      this.file = null;
      this.fileName = "";
      this.link = "";
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
  z-index: 1000;
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

.file-selector {
  margin-bottom: 10px;
}

.option-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.option-btn {
  flex: 1;
  padding: 8px;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.option-btn.active {
  background-color: #007BF6;
  color: white;
  border-color: #007BF6;
}
</style>
