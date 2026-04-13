<template>
  <div class="book-page">

    <h2>Book & Claim</h2>

    <!-- SUMMARY -->
    <div class="card">
      <h3>Summary</h3>

      <div class="summary-grid">
        <div>
          <p>Book CPO</p>
          <h2>{{ bookSummary.cpo }}</h2>
        </div>

        <div>
          <p>Claim CPO</p>
          <h2>{{ claimSummary.cpo }}</h2>
        </div>

        <div>
          <p>Balance CPO</p>
          <h2>{{ balance.cpo }}</h2>
        </div>

        <div>
          <p>Book Kernel</p>
          <h2>{{ bookSummary.kernel }}</h2>
        </div>

        <div>
          <p>Claim Kernel</p>
          <h2>{{ claimSummary.kernel }}</h2>
        </div>

        <div>
          <p>Balance Kernel</p>
          <h2>{{ balance.kernel }}</h2>
        </div>
      </div>
    </div>

    <!-- FILTER -->
    <div class="card">
      <h3>Filter</h3>

      <select v-model="selectedMill">
        <option value="">All Mill</option>
        <option v-for="m in millList" :key="m" :value="m">
          {{ m }}
        </option>
      </select>
    </div>

    <!-- FORM -->
    <div class="card">
      <h3>Input Claim</h3>

      <div class="form-grid">
        <input v-model="form.tanggal" type="date" />
        
        <select v-model="form.produk">
          <option value="">Pilih Produk</option>
          <option value="CPO">CPO</option>
          <option value="KERNEL">Kernel</option>
        </select>

        <input v-model.number="form.qty" type="number" placeholder="Qty" />
        <input v-model="form.buyer" type="text" placeholder="Buyer" />

        <button class="btn-add" @click="handleAddClaim">
          {{isEdit ? "Update Claim" : "Tambah Claim"}}
        </button>
      </div>
    </div>

    <!-- TABLE -->
    <div class="card">
      <h3>History Claim</h3>

      <table class="table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Produk</th>
            <th>Qty</th>
            <th>Buyer</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(c, i) in filteredClaim" :key="i">
            <td>{{ c.tanggal }}</td>
            <td>{{ c.produk }}</td>
            <td>{{ c.qty }}</td>
            <td>{{ c.buyer }}</td>
            <td>
              <button @click="handleEdit(c)">Edit</button>
              <button class="btn-delete" @click="deleteClaim(c)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted, watch } from "vue"

// STATE
const selectedMill = ref("")
const claimData = ref([])

const bookSummary = reactive({
  cpo: 0,
  kernel: 0
})

const claimSummary = reactive({
  cpo: 0,
  kernel: 0
})

const form = reactive({
  tanggal: "",
  produk: "",
  qty: 0,
  buyer: ""
})

// MILL LIST
const millList = computed(() => {
  const raw = JSON.parse(localStorage.getItem("produksi_data") || "[]")
  return [...new Set(raw.map(i => i.mill_code))]
})

// BOOK
function getBookFromProduksi(data){
  let filtered = data

  if(selectedMill.value){
    filtered = data.filter(i => i.mill_code === selectedMill.value)
  }

  bookSummary.cpo = filtered.reduce((s,i)=> s + (i.cpo || 0),0)
  bookSummary.kernel = filtered.reduce((s,i)=> s + (i.kernel || 0),0)
}

// CLAIM SUMMARY
function calculateClaim(){

  const data = selectedMill.value
    ? claimData.value.filter(c => c.mill_code === selectedMill.value)
    : claimData.value

  claimSummary.cpo = data
    .filter(i => i.produk === "CPO")
    .reduce((s,i)=> s + i.qty,0)

  claimSummary.kernel = data
    .filter(i => i.produk === "KERNEL")
    .reduce((s,i)=> s + i.qty,0)
}

function handleEdit(item){

  form.tanggal = item.tanggal
  form.produk = item.produk
  form.qty = item.qty
  form.buyer = item.buyer

  editIndex.value = claimData.value.findIndex(c => c === item)
  isEdit.value = true
}

// BALANCE
const balance = computed(() => ({
  cpo: bookSummary.cpo - claimSummary.cpo,
  kernel: bookSummary.kernel - claimSummary.kernel
}))

// FILTER + SORT
const filteredClaim = computed(() => {

  let data = claimData.value

  if (selectedMill.value) {
    data = data.filter(c => c.mill_code === selectedMill.value)
  }

  return [...data].reverse()
})

// ADD CLAIM
function handleAddClaim(){

  if(!form.produk || !form.qty){
    alert("Lengkapi data!")
    return
  }

  if(form.produk === "CPO" && form.qty > balance.value.cpo){
    alert("Claim CPO melebihi Book!")
    return
  }

  if(form.produk === "KERNEL" && form.qty > balance.value.kernel){
    alert("Claim Kernel melebihi Book!")
    return
  }

  // 🔥 INI BAGIAN EDIT / ADD
  if(isEdit.value){

    claimData.value[editIndex.value] = {
      ...form,
      mill_code: selectedMill.value
    }

    isEdit.value = false
    editIndex.value = null

  } else {

    claimData.value.push({
      ...form,
      mill_code: selectedMill.value
    })

  }

  localStorage.setItem("claim_data", JSON.stringify(claimData.value))

  calculateClaim()

  // reset
  form.tanggal = new Date().toISOString().slice(0,10)
  form.produk = ""
  form.qty = 0
  form.buyer = ""
}

// DELETE CLAIM
function deleteClaim(item){
  const index = claimData.value.findIndex(c => c === item)

  if(index !== -1){
    claimData.value.splice(index,1)
  }

  calculateClaim()
  localStorage.setItem("claim_data", JSON.stringify(claimData.value))
}

// WATCH
watch(selectedMill, () => {
  const raw = JSON.parse(localStorage.getItem("produksi_data") || "[]")
  getBookFromProduksi(raw)
  calculateClaim()
})

// INIT
onMounted(() => {
  form.tanggal = new Date().toISOString().slice(0,10)

  const produksi = JSON.parse(localStorage.getItem("produksi_data") || "[]")
  if(produksi.length){
    getBookFromProduksi(produksi)
  }

  const isEdit = ref(false)
  const editIndex = ref(null)
  const savedClaim = JSON.parse(localStorage.getItem("claim_data") || "[]")
  if(savedClaim.length){
    claimData.value = savedClaim
    calculateClaim()
  }
})
</script>

<style scoped>
.book-page{
  padding:0px;
}

.card{
  background:white;
  padding:20px;
  border-radius:12px;
  margin-bottom:20px;
}

.summary-grid{
  display:grid;
  grid-template-columns: repeat(3,1fr);
  gap:15px;
}

.form-grid{
  display:grid;
  grid-template-columns: repeat(5,1fr);
  gap:10px;
}

.btn-add {
  padding: 8px;
  border-radius: 6px;
  background: #2c3e50;
  color: white;
  border: none;
  cursor: pointer;
}

.btn-add:hover {
  background: #1a252f;
}

.btn-delete {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: #e74c3c;
  color: white;
  cursor: pointer;
}

.btn-delete:hover {
  background: #c0392b;
}
</style>