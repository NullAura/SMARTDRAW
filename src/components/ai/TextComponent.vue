<template>
  <div class="text-component" :style="style">
    <div v-if="isEditing" class="edit-mode">
      <textarea v-model="localContent" @blur="finishEdit"></textarea>
    </div>
    <div v-else class="display-mode" @dblclick="startEdit">
      {{ content }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextComponent',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isEditing: false,
      localContent: this.data.content || ''
    }
  },
  computed: {
    content() {
      return this.data.content || ''
    },
    style() {
      return {
        fontSize: `${this.data.fontSize || 14}px`,
        color: this.data.color || '#333',
        fontWeight: this.data.bold ? 'bold' : 'normal',
        fontStyle: this.data.italic ? 'italic' : 'normal',
        textAlign: this.data.align || 'left'
      }
    }
  },
  methods: {
    startEdit() {
      this.isEditing = true
      this.localContent = this.content
    },
    finishEdit() {
      this.isEditing = false
      this.$emit('update:data', {
        ...this.data,
        content: this.localContent
      })
    }
  }
}
</script>

<style scoped>
.text-component {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.edit-mode textarea {
  width: 100%;
  height: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  resize: none;
  font-family: inherit;
}

.display-mode {
  width: 100%;
  height: 100%;
  overflow: hidden;
  word-break: break-all;
}
</style> 