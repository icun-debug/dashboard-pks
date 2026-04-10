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

    <!-- FORM CLAIM -->
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

        <button @click="handleAddClaim">Tambah Claim</button>
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
          </tr>
        </thead>

        <tbody>
          <tr v-for="(c, i) in claimData" :key="i">
            <td>{{ c.tanggal }}</td>
            <td>{{ c.produk }}</td>
            <td>{{ c.qty }}</td>
            <td>{{ c.buyer }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { reactive, computed, ref } from "vue"
import { onMounted } from "vue"

  const bookSummary = reactive({
    cpo: 0,
    kernel: 0
  })

  const claimSummary = reactive({
    cpo:0,
    kernel:0
  })
  const claimData = ref([])

  function getBookFromProduksi(data){
    const cpo = data.reduce((s,i)=> s + (i.cpo || 0),0)
    const kernel = data.reduce((s,i)=> s + (i.kernel || 0),0)

    bookSummary.cpo = cpo
    bookSummary.kernel = kernel
  }

  onMounted(() => {
  const raw = localStorage.getItem("produksi_data")
  console.log("RAW LS:", raw)
  const data = JSON.parse(raw || "[]")
  console.log("PARSED DATA:", data)

  if (data.length) {
    getBookFromProduksi(data)
  }
})

  const form = reactive({
    tanggal: "",
    produk: "",
    qty: 0,
    buyer: ""
  })

// HITUNG CLAIM
function calculateClaim(){
  claimSummary.cpo = claimData.value
    .filter(i => i.produk === "CPO")
    .reduce((s,i)=> s + i.qty,0)

  claimSummary.kernel = claimData.value
    .filter(i => i.produk === "KERNEL")
    .reduce((s,i)=> s + i.qty,0)
    }

  // BALANCE
  const balance = computed(() => ({
    cpo: bookSummary.cpo - claimSummary.cpo,
    kernel: bookSummary.kernel - claimSummary.kernel
  }))

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

  claimData.value.push({...form})
  calculateClaim()

  // reset form
  form.tanggal = ""
  form.produk = ""
  form.qty = 0
  form.buyer = ""
}
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
</style>