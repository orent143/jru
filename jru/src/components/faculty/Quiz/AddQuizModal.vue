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

      <!-- URL Input for external link -->
      <label for="external-link">External Link (Optional):</label>
      <input v-model="link" type="url" placeholder="Enter a URL" />

      <!-- Display the file URL after successful upload -->
      <div v-if="fileUrl">
        <p>Uploaded File:</p>
        <a :href="fileUrl" target="_blank">Download File</a>
      </div>

      <!-- Display the entered URL after successful submission -->
      <div v-if="link">
        <p>External Link:</p>
        <a :href="link" target="_blank">{{ link }}</a>
      </div>

      <button @click="addQuiz" :disabled="isSubmitting">Add Quiz</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useToast } from 'vue-toastification'; // Importing toast for notifications

export default {
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
      fileUrl: "", // Store the file URL once uploaded
      link: "", // Store the entered external link
      isSubmitting: false,
    };
  },
  methods: {
    // Handle file selection
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.fileName = this.file ? this.file.name : "";
    },

    // Add quiz and handle the file upload and external link
    async addQuiz() {
      const toast = useToast(); // Initialize toast notifications

      // Validation check
      if (!this.courseId || !this.title || !this.description || !this.quiz_date || !this.duration) {
        toast.error('Please fill in all required fields.'); // Error toast for missing fields
        return;
      }

      this.isSubmitting = true;

      const formData = new FormData();
      formData.append("course_id", this.courseId);
      formData.append("title", this.title);
      formData.append("description", this.description);
      formData.append("quiz_date", this.quiz_date);
      formData.append("duration_minutes", this.duration);
      if (this.file) {
        formData.append("file", this.file);
      }
      if (this.link) {
        formData.append("external_link", this.link); // Add the external link if provided
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/quizzes', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success('Quiz added successfully!'); // Success toast
        this.$emit("add-quiz", response.data);

        // If a file was uploaded, get the file URL from the response
        if (response.data.file_url) {
          this.fileUrl = response.data.file_url;
        }

        // If an external link was provided, display it
        if (response.data.external_link) {
          this.link = response.data.external_link;
        }

        this.resetForm();
      } catch (error) {
        console.error("Error adding quiz:", error);
        toast.error('Failed to add quiz.'); // Error toast for failure
      } finally {
        this.isSubmitting = false;
      }
    },

    // Reset the form fields
    resetForm() {
      this.title = "";
      this.description = "";
      this.quiz_date = "";
      this.duration = null;
      this.file = null;
      this.fileName = "";
      this.fileUrl = ""; // Reset the file URL
      this.link = ""; // Reset the link
      this.$emit("close");
    },

    // Close the modal
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
</style>
