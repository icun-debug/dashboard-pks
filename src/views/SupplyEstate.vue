<template>
  <div>

    <!-- 🔹 Header -->
    <h1 class="text-2xl font-bold mb-4">
      🌴 Supply Estate
    </h1>

    <!-- FILTER -->
    <div class="filter-card">

      <div class="filter-container">

    <!-- DATE -->
    <input
      type="date"
      v-model="filters.date"
      class="input"
    />

    <!-- ESTATE -->
    <select
      v-model="filters.estate"
      class="input"
    >
      <option value="">All Estate</option>
      <option
        v-for="e in estates"
        :key="e"
        :value="e"
      >
        {{ e }}
      </option>
    </select>

    <!-- BLOK -->
    <input
      type="text"
      v-model="filters.blok"
      placeholder="Cari Blok"
      class="input"
    />

    <!-- BUTTON -->
    <button
      class="apply-btn"
      @click="loadData"
    >
      🔍 Apply Filter
    </button>

  </div>

  </div>

    <!-- Summary Card -->
  <div class="summary-container">

  <div class="summary-card">
    <div>
      <div class="summary-label">Total Supply</div>
      <div class="summary-value">{{ totalTonase.toFixed(2) }} Ton</div>
    </div>
    <div class="summary-icon">🚛</div>
  </div>

  <div class="summary-card">
      <div>
        <div class="summary-label">Internal Supply</div>
        <div class="summary-value">{{ totalInternalSupply.toFixed(2) }}</div>
      </div>
      <div class="summary-icon">🏢</div>
    </div>

  <div class="summary-card">
    <div>
      <div class="summary-label">Eksternal Supply</div>
      <div class="summary-value">{{ totalExternalSupply.toFixed(2) }} Ton</div>
    </div>
      <div class="sumaary-icon">🤝</div>

  </div>

  <div class="summary-card">
    <div>
      <div class="summary-label">Certified</div>
      <div class="summary-value">{{ totalCertified.toFixed(2) }}</div>
    </div>
    <div class="summary-icon">📦</div>
  </div>

  <div class="summary-card">
    <div>
      <div class="summary-label">Non Certified</div>
      <div class="summary-value">{{ totalNonCertified.toFixed(2) }}</div>
    </div>
    <div class="summary-icon">🌴</div>
  </div>

  <div class="summary-card">
    <div>
      <div class="summary-label">Jumlah Estate</div>
      <div class="summary-value">{{ totalEstate }}</div>
    </div>
  </div>
</div>

     <!-- TABLE -->
    <div class="table-container">

      <div class=" table-header">
        <h3>📊 Rekap Supply TBS Per Estate</h3>
      </div>

      <table class="data-table">
      <thead>
        <tr>
          <th>Estate</th>
          <th>Certified</th>
          <th>Non Certified</th>
          <th>Total Tonase</th>
        </tr>
      </thead>

      <tbody>

      <tr
        v-for="(item, index) in filteredData"
        :key="index"
      >
        <td>{{ item.estate }}</td>
        <td>{{ item.certified }}</td>
        <td>{{ item.non_certified }}</td>
        <td>{{ item.total_tonase }}</td>
      </tr>

      <tr v-if="filteredData.length === 0">
        <td colspan="4" class="empty-data">
          Tidak ada data
        </td>
      </tr>

    </tbody>

  </table>

    <div class="table-container mt-4">

  <div class="table-header">
    <h3>🚛 Rekap Supply Berdasarkan Supplier</h3>
  </div>

  <table class="data-table supplier-table">

    <thead>
      <tr>
        <th style="width: 60%;">Supplier</th>
        <th style="width: 20%;">Type</th>
        <th style="width: 20%;">Total Tonase</th>
      </tr>
    </thead>

    <tbody>

      <tr
        v-for="(item,index) in supplierData"
        :key="index"
      >
        <td>{{ item.supplier_name }}</td>
        <td>{{ item.supplier_type }}</td>
        <td>{{ item.total_tonase }}</td>
      </tr>

    </tbody>

  </table>

</div>

</div>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import axios from 'axios'

// 🔹 Dummy data
const data = ref([])
const supplierData = ref([])

const loadSupplierData = async () => {
  try {

    const res = await axios.get(
      "http://127.0.0.1:8000/supply_estate_supplier"
    )

    supplierData.value = res.data

  } catch (err) {
    console.error(err)
  }
}

const loadData = async () => {
  try {

    const res = await axios.get(
      "http://127.0.0.1:8000/supply_estate"
    )

    data.value = res.data

    console.log("Supply Estate:", data.value)

  } catch (err) {
    console.error("Supply Estate API Error:", err)
  }
}

// 🔹 Filter state
const filters = ref({
  date: "",
  estate: "",
  blok: ""
})

// 🔹 Estate list (auto generate)
const estates = computed(() => {
  return [...new Set(data.value.map(d => d.estate))]
})

// 🔹 Filter logic
// 🔹 Filter logic
const filteredData = computed(() => {
  return data.value.filter(item => {
    return (
      !filters.value.estate ||
      item.estate === filters.value.estate
    )
  })
})

// 🔹 Summary
const totalTonase = computed(() => {
  return filteredData.value.reduce(
    (sum, d) => sum + d.total_tonase,
    0
  )
})

const totalCertified = computed(() => {
  return filteredData.value.reduce(
    (sum, d) => sum + d.certified,
    0
  )
})

const totalNonCertified = computed(() => {
  return filteredData.value.reduce(
    (sum, d) => sum + d.non_certified,
    0
  )
})

const totalInternalSupply = computed(() => {
  return filteredData.value.reduce(
    (sum, d) => sum + d.internal_supply,
    0
  )
})

const totalExternalSupply = computed(() => {
  return filteredData.value.reduce(
    (sum, d) => sum + d.external_supply,
    0
  )
})

const totalEstate = computed(() => {
  return new Set(filteredData.value.map(d => d.estate)).size
})

// 🔹 Reset filter
const resetFilter = () => {
  filters.value = {
    date: "",
    estate: "",
    blok: ""
  }
}

onMounted(() => {
  loadData()
  loadSupplierData()
})
</script>

<style scoped>
.filter-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  gap: 15px;
  flex-wrap: nowrap;
  align-items: center;
}

.input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.apply-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.summary-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.summary-card {
  flex: 1;
  min-width: 180px;
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.summary-label {
  color: #64748b;
  font-size: 13px;
}

.summary-value {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 600;
}

/* ================= TABLE ================= */

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  margin-top: 12px;
}

.table-header {
  padding: 14px 18px;
  background: #b7c3db;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1c1f;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8fafc;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

/* hover biar enak dilihat */
.data-table tbody tr:hover {
  background: #f8fafc;
}

/* empty state */
.empty-data {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
}

/* ================= SUPPLIER TABLE ================= */

.supplier-table {
  width: 100%;
}

/* biar ga ada gap aneh & fleksibel */
.supplier-table th,
.supplier-table td {
  white-space: nowrap;
}

.supplier-table td:first-child {
  white-space: normal;
}

/* alignment angka */
.supplier-table td:nth-child(3) {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ================= ICON FIX ================= */

.summary-icon {
  font-size: 22px;
}

.summary-icon {
  font-size: 22px;
}
</style>