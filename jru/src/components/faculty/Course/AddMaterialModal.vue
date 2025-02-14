<template>
  <div class="modal-container">
    <div class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>Add New Material</h2>
        
        <label for="title">Material Title:</label>
        <input v-model="title" type="text" placeholder="Enter Title" required />

        <label for="content">Material Content:</label>
        <textarea v-model="content" placeholder="Enter Content"></textarea>

        <label for="file-upload">Upload File:</label>
        <input type="file" @change="handleFileUpload" />

        <button @click="addMaterial" :disabled="isSubmitting">Add Material</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    courseId: Number, // Ensure the parent component passes the courseId
  },
  data() {
    return {
      title: "",
      content: "",
      file: null,
      isSubmitting: false,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    async addMaterial() {
      if (!this.courseId || !this.title || !this.content) {
        alert("Please fill in all required fields.");
        return;
      }

      this.isSubmitting = true;

      const formData = new FormData();
      formData.append("course_id", this.courseId);
      formData.append("title", this.title);
      formData.append("content", this.content);
      if (this.file) {
        formData.append("file", this.file);
      }

      try {
        const response = await axios.post("http://127.0.0.1:8000/api/course-content", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("Material added successfully!");
        this.$emit("add-material", response.data);
        this.resetForm();
      } catch (error) {
        console.error("Error adding material:", error);
        alert("Failed to add material.");
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.title = "";
      this.content = "";
      this.file = null;
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

.modal-content {
  font-size: 25px;
  font-family: 'Arial', sans-serif;
  font-weight: 1000;
  color: #000000;
  padding-right: 30px;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #000000;
  font-size: 25px;
}

.modal-content label  {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  margin-bottom: 5px;
  color: #272727;
}

.modal-content input,
.modal-content textarea{
  padding: 10px;
  font-size: 14px;
  border-radius: 12px;
  width: 100%;
  border: 1px solid #ccc;
}

.modal-content button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.modal-content button{
  padding: 8px 12px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.modal-content button {
  padding: 10px 20px;
  background-color: #007BF6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  display: flex;          /* Add this */
  justify-content: center; /* Add this */
}

</style>
  