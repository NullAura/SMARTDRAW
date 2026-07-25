<template>
  <div class="image-component" :style="style">
    <div v-if="isEditing" class="edit-mode">
      <input type="file" accept="image/*" @change="handleFileChange">
      <input type="text" v-model="localUrl" placeholder="输入图片URL" @blur="finishEdit">
    </div>
    <div v-else class="display-mode" @dblclick="startEdit">
      <img :src="url" alt="商品图片" @error="handleImageError">
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageComponent',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isEditing: false,
      localUrl: this.data.url || '',
      error: false
    }
  },
  computed: {
    url() {
      return this.data.url || ''
    },
    style() {
      return {
        objectFit: this.data.fit || 'contain'
      }
    }
  },
  methods: {
    startEdit() {
      this.isEditing = true
      this.localUrl = this.url
    },
    finishEdit() {
      this.isEditing = false
      this.$emit('update:data', {
        ...this.data,
        url: this.localUrl
      })
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.localUrl = e.target.result
          this.finishEdit()
        }
        reader.readAsDataURL(file)
      }
    },
    handleImageError() {
      this.error = true
      this.localUrl = ''
      this.finishEdit()
    }
  }
}
</script>

<style scoped>
.image-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-mode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}

.edit-mode input[type="file"],
.edit-mode input[type="text"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.display-mode {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.display-mode img {
  max-width: 100%;
  max-height: 100%;
}
</style> 