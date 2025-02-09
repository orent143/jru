<template>
  <div v-if="showCreateCourseForm" class="modal">
    <div class="modal-content">
      <span class="close" @click="closeForm">&times;</span>
      <div class="modal-header">Add New Material</div>
      <div class="modal-body">
        <label for="subject">Material Name:</label>
        <input v-model="title" type="text" placeholder="Material Title" />

        <!-- New Label and Input for File Upload -->
        <label for="file-upload">Upload File:</label>
        <input type="file" @change="handleFileUpload" />
      </div>
      <div class="modal-buttons">
        <button class="submit" @click="addMaterial">Add</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: '',
      selectedFile: null, // To store the uploaded file
      showCreateCourseForm: true,
    };
  },
  methods: {
    // Handle file upload
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0]; // Store the selected file
    },

    addMaterial() {
      if (this.title.trim() && this.selectedFile) {
        // You can handle the file upload logic here or pass the file to the parent
        this.$emit('add-material', {
          id: Date.now(),
          title: this.title,
          file: this.selectedFile, // Pass the file along with other data
        });
        this.closeForm();
      } else {
        alert('Please provide both a title and a file.');
      }
    },
    closeForm() {
      this.showCreateCourseForm = false;
      this.$emit('close');
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
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  position: relative;
}

.modal-header {
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

.modal-body, label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  margin-bottom: 5px;
  color: #272727;
}

.modal-body input {
  padding: 10px;
  font-size: 14px;
  border-radius: 12px;
  width: 100%;
  border: 1px solid #ccc;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.modal-buttons button {
  padding: 8px 12px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.modal-buttons .submit {
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
}
</style>
  