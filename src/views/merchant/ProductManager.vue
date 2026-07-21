<template>
  <div class="product-manager">
    <div class="page-header">
      <h2>商品管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showImportDialog">
          <el-icon><Upload /></el-icon>
          导入商品
        </el-button>
        <el-button type="success" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filter-area">
      <el-input
        v-model="searchQuery"
        placeholder="搜索商品名称"
        class="search-input"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="categoryFilter" placeholder="商品分类" clearable @change="filterProducts">
        <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
      </el-select>

      <el-select v-model="statusFilter" placeholder="商品状态" clearable @change="filterProducts">
        <el-option label="上架中" value="active" />
        <el-option label="已下架" value="inactive" />
        <el-option label="待审核" value="pending" />
      </el-select>
    </div>

    <!-- 商品列表 -->
    <el-table :data="filteredProducts" style="width: 100%" v-loading="loading">
      <el-table-column label="商品图片" width="100">
        <template #default="scope">
          <el-image
            style="width: 80px; height: 80px"
            :src="scope.row.imageUrl || 'https://placehold.co/80x80/f0f0f0/cccccc?text=IMG'"
            fit="cover"
            :preview-src-list="scope.row.imageUrl ? [scope.row.imageUrl] : []"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="price" label="价格" width="120">
        <template #default="scope">
          ¥{{ scope.row.price }}.{{ scope.row.priceDecimal.toString().padStart(2, '0') }}
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" @click="editProduct(scope.row)">编辑</el-button>
          <el-button
            size="small"
            :type="scope.row.status === 'active' ? 'danger' : 'success'"
            @click="toggleProductStatus(scope.row)"
          >
            {{ scope.row.status === 'active' ? '下架' : '上架' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteProduct(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalProducts"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 导入商品对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入商品" width="580px">
      <div class="import-dialog-content">
        <div class="import-methods">
          <div class="method-title">选择导入方式：</div>
          <div class="method-options">
            <el-radio-group v-model="importMethod">
              <el-radio :value="'csv'">CSV文件导入</el-radio>
              <el-radio :value="'excel'">Excel文件导入</el-radio>
              <el-radio :value="'manual'">手动输入</el-radio>
            </el-radio-group>
          </div>
        </div>

        <!-- 文件导入区域 -->
        <template v-if="importMethod === 'csv' || importMethod === 'excel'">
          <div class="file-upload-area">
            <el-upload
              class="upload-demo"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
              :multiple="false"
              :accept="importMethod === 'csv' ? '.csv' : '.xlsx,.xls'"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  {{ importMethod === 'csv' ? 'CSV文件格式：商品名称,价格,描述,分类,图片URL,库存' : 'Excel文件' }}
                </div>
              </template>
            </el-upload>

            <div class="template-download">
              <a href="#" @click.prevent="downloadTemplate">下载模板</a>
            </div>
          </div>
        </template>

        <!-- 手动输入区域 -->
        <template v-if="importMethod === 'manual'">
          <div class="manual-input-area">
            <el-form :model="manualProduct" label-width="80px">
              <el-form-item label="商品名称">
                <el-input v-model="manualProduct.name" placeholder="输入商品名称"></el-input>
              </el-form-item>
              <el-form-item label="价格">
                <el-input-number v-model="manualProduct.price" :precision="2" :step="0.01" :min="0"></el-input-number>
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="manualProduct.description" type="textarea" placeholder="输入商品描述"></el-input>
              </el-form-item>
              <el-form-item label="分类">
                <el-select v-model="manualProduct.category" placeholder="选择分类">
                  <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="图片URL">
                <el-input v-model="manualProduct.imageUrl" placeholder="输入图片URL"></el-input>
              </el-form-item>
              <el-form-item label="库存">
                <el-input-number v-model="manualProduct.stock" :min="0" :step="1"></el-input-number>
              </el-form-item>
            </el-form>
          </div>
        </template>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importProducts">
            导入
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      v-model="productDialogVisible"
      :title="editingProduct.id ? '编辑商品' : '添加商品'"
      width="580px"
    >
      <el-form :model="editingProduct" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="editingProduct.name" placeholder="输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="价格">
          <div class="price-input">
            <el-input-number
              v-model="editingProduct.price"
              :min="0"
              :precision="0"
              style="width: 150px;"
            ></el-input-number>
            <span class="price-separator">.</span>
            <el-input-number
              v-model="editingProduct.priceDecimal"
              :min="0"
              :max="99"
              :precision="0"
              style="width: 100px;"
            ></el-input-number>
          </div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editingProduct.description"
            type="textarea"
            placeholder="输入商品描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editingProduct.category" placeholder="选择分类">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload
            class="product-image-uploader"
            action="#"
            :show-file-list="false"
            :on-change="handleImageChange"
            :auto-upload="false"
          >
            <img v-if="editingProduct.imageUrl" :src="editingProduct.imageUrl" class="product-image" />
            <el-icon v-else class="product-image-uploader-icon"><plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="editingProduct.stock" :min="0" :step="1"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editingProduct.status">
            <el-radio :value="'active'">上架</el-radio>
            <el-radio :value="'inactive'">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="productDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveProduct">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 提示框 -->
    <el-dialog v-model="confirmDialogVisible" title="确认操作" width="300px">
      <span>{{ confirmMessage }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAction">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Search,
  UploadFilled,
  Upload
} from '@element-plus/icons-vue'

// 模拟分类数据
const categories = [
  { id: 'storage', name: '储物和收纳' },
  { id: 'sofa', name: '沙发和扶手椅' },
  { id: 'bed', name: '床和床垫' },
  { id: 'textile', name: '纺织品' },
  { id: 'dining', name: '餐桌和餐椅' },
  { id: 'kitchenware', name: '餐具和厨具' },
  { id: 'cleaning', name: '清洁及晾晒用品' },
  { id: 'desk', name: '书桌和书桌椅' },
  { id: 'bathroom', name: '浴室家具和收纳' },
  { id: 'outdoor', name: '户外产品' }
]

// 状态显示辅助函数
const getStatusType = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'info'
    case 'pending': return 'warning'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'active': return '上架中'
    case 'inactive': return '已下架'
    case 'pending': return '待审核'
    default: return '未知'
  }
}

// 列表数据
const products = ref([
  {
    id: '1',
    name: 'DUKTIG 杜克迪',
    description: '玩具厨房, 72x40x109 厘米',
    price: 699,
    priceDecimal: 0,
    category: 'kitchenware',
    categoryName: '餐具和厨具',
    status: 'active',
    stock: 100,
    imageUrl: 'https://placehold.co/400x400/e8d9c5/3c2913?text=D'
  },
  {
    id: '2',
    name: 'BYGGLEK 比格列克',
    description: '积木 201件套',
    price: 69,
    priceDecimal: 99,
    category: 'storage',
    categoryName: '储物和收纳',
    status: 'active',
    stock: 50,
    imageUrl: 'https://placehold.co/400x400/c5d9e8/131f3c?text=B'
  },
  {
    id: '3',
    name: 'KIVIK 奇维',
    description: '三人沙发, 布罗福尔斯 灰色',
    price: 3999,
    priceDecimal: 0,
    category: 'sofa',
    categoryName: '沙发和扶手椅',
    status: 'active',
    stock: 10,
    imageUrl: 'https://placehold.co/400x400/d9c5e8/3c1339?text=K'
  }
])

// 页面状态
const loading = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalProducts = ref(products.value.length)

// 导入相关状态
const importDialogVisible = ref(false)
const importMethod = ref('csv')
const fileList = ref([])
const manualProduct = ref({
  name: '',
  price: 0,
  description: '',
  category: '',
  imageUrl: '',
  stock: 0
})

// 编辑相关状态
const productDialogVisible = ref(false)
const editingProduct = ref({
  id: '',
  name: '',
  price: 0,
  priceDecimal: 0,
  description: '',
  category: '',
  imageUrl: '',
  status: 'active',
  stock: 0
})

// 确认对话框
const confirmDialogVisible = ref(false)
const confirmMessage = ref('')
const confirmCallback = ref(null)

// 过滤的商品
const filteredProducts = computed(() => {
  let result = [...products.value]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }

  // 分类过滤
  if (categoryFilter.value) {
    result = result.filter(p => p.category === categoryFilter.value)
  }

  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(p => p.status === statusFilter.value)
  }

  return result
})

// 方法
const handleSearch = () => {
  // 搜索逻辑
  currentPage.value = 1
}

const filterProducts = () => {
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 导入相关方法
const showImportDialog = () => {
  importDialogVisible.value = true
  importMethod.value = 'csv'
  fileList.value = []
  resetManualProduct()
}

const resetManualProduct = () => {
  manualProduct.value = {
    name: '',
    price: 0,
    description: '',
    category: '',
    imageUrl: '',
    stock: 0
  }
}

const handleFileChange = (file) => {
  fileList.value = [file]
}

const downloadTemplate = () => {
  if (importMethod.value === 'csv') {
    const template = '商品名称,价格,描述,分类,图片URL,库存\n智能灯泡,99.99,智能可调光灯泡,kitchenware,http://example.com/light.jpg,100'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '商品导入模板.csv'
    a.click()
    URL.revokeObjectURL(url)
  } else {
    ElMessage.info('Excel模板下载功能开发中...')
  }
}

const importProducts = () => {
  if (importMethod.value === 'manual') {
    // 手动导入
    if (!manualProduct.value.name) {
      ElMessage.warning('请输入商品名称')
      return
    }

    // 计算价格整数和小数部分
    const fullPrice = manualProduct.value.price
    const priceInt = Math.floor(fullPrice)
    const priceDecimal = Math.round((fullPrice - priceInt) * 100)

    const newProduct = {
      id: Date.now().toString(),
      name: manualProduct.value.name,
      price: priceInt,
      priceDecimal: priceDecimal,
      description: manualProduct.value.description,
      category: manualProduct.value.category,
      imageUrl: manualProduct.value.imageUrl || `https://placehold.co/400x400/${getRandomColor()}/${getTextColor()}?text=${manualProduct.value.name.charAt(0)}`,
      status: 'active',
      stock: manualProduct.value.stock,
      categoryName: categories.find(c => c.id === manualProduct.value.category)?.name || ''
    }

    products.value.push(newProduct)
    ElMessage.success('商品添加成功')
    importDialogVisible.value = false
    resetManualProduct()
  } else {
    // 文件导入
    if (fileList.value.length === 0) {
      ElMessage.warning('请选择要导入的文件')
      return
    }

    ElMessage.success('文件导入功能开发中，暂时只支持手动导入')
    importDialogVisible.value = false
  }
}

// 添加/编辑商品相关方法
const showAddDialog = () => {
  editingProduct.value = {
    id: '',
    name: '',
    price: 0,
    priceDecimal: 0,
    description: '',
    category: '',
    imageUrl: '',
    status: 'active',
    stock: 0
  }
  productDialogVisible.value = true
}

const editProduct = (product) => {
  editingProduct.value = {
    ...product,
    price: Number(product.price),
    priceDecimal: Number(product.priceDecimal)
  }
  productDialogVisible.value = true
}

const handleImageChange = (file) => {
  // 在实际应用中，这里应该上传图片到服务器
  // 这里我们模拟本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    editingProduct.value.imageUrl = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const saveProduct = () => {
  if (!editingProduct.value.name) {
    ElMessage.warning('请输入商品名称')
    return
  }

  if (editingProduct.value.id) {
    // 更新已有商品
    const index = products.value.findIndex(p => p.id === editingProduct.value.id)
    if (index !== -1) {
      // 设置分类名称
      editingProduct.value.categoryName = categories.find(c => c.id === editingProduct.value.category)?.name || ''
      products.value[index] = { ...editingProduct.value }
      ElMessage.success('商品更新成功')
    }
  } else {
    // 添加新商品
    const newProduct = {
      ...editingProduct.value,
      id: Date.now().toString(),
      categoryName: categories.find(c => c.id === editingProduct.value.category)?.name || '',
      // 如果没有设置图片，添加默认图片
      imageUrl: editingProduct.value.imageUrl || `https://placehold.co/400x400/${getRandomColor()}/${getTextColor()}?text=${editingProduct.value.name.charAt(0)}`
    }
    products.value.push(newProduct)
    ElMessage.success('商品添加成功')
  }

  productDialogVisible.value = false
}

// 生成随机背景色
const getRandomColor = () => {
  const colors = ['e8d9c5', 'c5d9e8', 'd9c5e8', 'c5e8d9', 'e8c5d9', 'd9e8c5']
  return colors[Math.floor(Math.random() * colors.length)]
}

// 生成文字颜色
const getTextColor = () => {
  return '333333'
}

// 商品操作相关方法
const toggleProductStatus = (product) => {
  confirmMessage.value = `确定要${product.status === 'active' ? '下架' : '上架'}该商品吗？`
  confirmCallback.value = () => {
    const index = products.value.findIndex(p => p.id === product.id)
    if (index !== -1) {
      products.value[index].status = product.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`商品已${products.value[index].status === 'active' ? '上架' : '下架'}`)
    }
    confirmDialogVisible.value = false
  }
  confirmDialogVisible.value = true
}

const deleteProduct = (product) => {
  confirmMessage.value = '确定要删除该商品吗？此操作不可恢复。'
  confirmCallback.value = () => {
    products.value = products.value.filter(p => p.id !== product.id)
    ElMessage.success('商品已删除')
    confirmDialogVisible.value = false
  }
  confirmDialogVisible.value = true
}

const confirmAction = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
}

// 生命周期钩子
onMounted(() => {
  // 在实际应用中，这里应该从API获取商品数据
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.product-manager {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-area {
  display: flex;
  margin-bottom: 20px;
  gap: 15px;
}

.search-input {
  width: 250px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.import-dialog-content {
  padding: 10px 0;
}

.method-title {
  margin-bottom: 10px;
  font-weight: bold;
}

.method-options {
  margin-bottom: 20px;
}

.template-download {
  margin-top: 10px;
  text-align: right;
}

.product-image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-image-uploader:hover {
  border-color: #409EFF;
}

.product-image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.product-image {
  width: 178px;
  height: 178px;
  display: block;
}

.price-input {
  display: flex;
  align-items: center;
}

.price-separator {
  margin: 0 5px;
  font-size: 18px;
}

.manual-input-area {
  margin-top: 15px;
}
</style>
