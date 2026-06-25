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

    <!-- SUMMARY CARD -->
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
          <div class="summary-value">
            {{ totalInternalSupply.toFixed(2) }} Ton
          </div>
        </div>
        <div class="summary-icon">🏢</div>
      </div>

      <div class="summary-card">
        <div>
          <div class="summary-label">Eksternal Supply</div>
          <div class="summary-value">
            {{ totalExternalSupply.toFixed(2) }} Ton
          </div>
        </div>
        <div class="summary-icon">🤝</div>
      </div>

      <div class="summary-card">
        <div>
          <div class="summary-label">Certified</div>
          <div class="summary-value">
            {{ totalCertified.toFixed(2) }} Ton
          </div>
        </div>
        <div class="summary-icon">📦</div>
      </div>

      <div class="summary-card">
        <div>
          <div class="summary-label">Non Certified</div>
          <div class="summary-value">
            {{ totalNonCertified.toFixed(2) }} Ton
          </div>
        </div>
        <div class="summary-icon">🌴</div>
      </div>

      <div class="summary-card">
        <div>
          <div class="summary-label">Jumlah Estate</div>
          <div class="summary-value">
            {{ totalEstate }} Estate
          </div>
        </div>
      </div>

    </div>

    <!-- TABLE ESTATE -->
    <div class="table-container">

      <div class="table-header">
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
            v-for="(item, index) in paginatedData"
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

      <div class="table-footer">

  <div class="entries-info">
    Showing
    {{ (currentPage - 1) * perPage + 1 }}
    to
    {{
      Math.min(
        currentPage * perPage,
        filteredData.length
      )
    }}
    of
    {{ filteredData.length }}
    entries
  </div>

  <div class="pagination">

    <button
      class="page-btn"
      @click="currentPage = 1"
      :disabled="currentPage === 1"
    >
      «
    </button>

    <button
      class="page-btn"
      @click="currentPage--"
      :disabled="currentPage === 1"
    >
      ‹
    </button>

    <button
      class="page-btn"
      @click="currentPage++"
      :disabled="currentPage === totalPages"
    >
      ›
    </button>

    <button
      class="page-btn"
      @click="currentPage = totalPages"
      :disabled="currentPage === totalPages"
    >
      »
    </button>

  </div>

  </div>

</div>

    </div>

    <!-- TABLE SUPPLIER -->
    <div class="table-container mt-4">

      <div class="table-header">
        <h3>🚛 Rekap Supply Berdasarkan Supplier</h3>
      </div>

      <table class="data-table supplier-table">

        <thead>
          <tr>
            <th>Supplier</th>
            <th>Type</th>
            <th>Category</th>
            <th>Status</th>
            <th>Total Tonase</th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="(item, index) in paginatedSupplierData"
            :key="index"
          >
            <td>{{ item.supplier_name }}</td>
            <td>{{ item.supplier_type }}</td>
            <td>
              <span :class="categoryClass(item.supplier_category)">
                {{ item.supplier_category }}
              </span>
            </td>
            <td>
              <span :class="statusClass(item.certified_status)">
                {{ item.certified_status }}
              </span>
            </td>
            <td>{{ item.total_tonase }}</td>
          </tr>

        </tbody>

      </table>

      <div class="table-footer">

  <div class="entries-info">
    Showing
    {{ (currentPageSupplier - 1) * perPageSupplier + 1 }}
    to
    {{
      Math.min(
        currentPageSupplier * perPageSupplier,
        supplierData.length
      )
    }}
    of
    {{ supplierData.length }}
    entries
  </div>

  <div class="pagination">

    <button
      class="page-btn"
      @click="currentPageSupplier = 1"
      :disabled="currentPageSupplier === 1"
    >
      «
    </button>

    <button
      class="page-btn"
      @click="currentPageSupplier--"
      :disabled="currentPageSupplier === 1"
    >
      ‹
    </button>

    <button
      class="page-btn"
      @click="currentPageSupplier++"
      :disabled="currentPageSupplier === totalPagesSupplier"
    >
      ›
    </button>

    <button
      class="page-btn"
      @click="currentPageSupplier = totalPagesSupplier"
      :disabled="currentPageSupplier === totalPagesSupplier"
    >
      »
    </button>

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

// ======================
// PAGINATION ESTATE
// ======================
const currentPage = ref(1)
const perPage = 10

const totalPages = computed(() => {
  return Math.ceil(
    filteredData.value.length / perPage
  )
})

const paginatedData = computed(() => {

  const start =
    (currentPage.value - 1) * perPage

  return filteredData.value.slice(
    start,
    start + perPage
  )

})

// ======================
// PAGINATION SUPPLIER
// ======================
const currentPageSupplier = ref(1)
const perPageSupplier = 10

const totalPagesSupplier = computed(() => {
  return Math.ceil(
    supplierData.value.length / perPageSupplier
  )
})

const paginatedSupplierData = computed(() => {

  const start =
    (currentPageSupplier.value - 1)
    * perPageSupplier

  return supplierData.value.slice(
    start,
    start + perPageSupplier
  )

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

// 🔹 Badge Category
const categoryClass = (category) => {
  switch (category) {
    case "INTI":
      return "badge-inti"

    case "AFILIASI":
      return "badge-afiliasi"

    case "PLASMA":
      return "badge-plasma"

    case "PEKEBUN":
      return "badge-pekebun"

    default:
      return "badge-default"
  }
}

// 🔹 Badge Status
const statusClass = (status) => {
  return status === "Certified"
    ? "badge-certified"
    : "badge-non-certified"
}


onMounted(() => {
  loadData()
  loadSupplierData()
})


</script>

<style scoped>
.table-footer{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-top:20px;
}

.pagination{
    display:flex;
    gap:8px;
}

.page-btn{
    width:40px;
    height:40px;
    border:none;
    border-radius:10px;
    cursor:pointer;
}

.page-btn:disabled{
    opacity:.4;
    cursor:not-allowed;
}

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
  flex: 0 0 calc((100% - 30px) / 3);
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-sizing: border-box;
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
  padding: 14px 16px;
  background: #b7c3db;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
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

.data-table th {
  text-align: left;
  font-weight: 600;
}

.data-table td {
  text-align: left;
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
  table-layout: auto;
}

/* biar ga ada gap aneh & fleksibel */
.supplier-table th,
.supplier-table td {
    padding: 10px 12px;
    text-align: left;
    vertical-align: middle;
}

.supplier-table td:first-child {
  white-space: normal;
}

/* alignment angka */
.supplier-table td:nth-child(5) {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* CATEGORY */
.badge-inti {
  background: #dcfce7;
  color: #166534;
}

.badge-afiliasi {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge-plasma {
  background: #ffedd5;
  color: #c2410c;
}

.badge-pekebun {
  background: #f3e8ff;
  color: #7e22ce;
}

/* STATUS */
.badge-certified {
  background: #dcfce7;
  color: #166534;
}

.badge-non-certified {
  background: #f1f5f9;
  color: #475569;
}

/* SHAPE BADGE */
.badge-inti,
.badge-afiliasi,
.badge-plasma,
.badge-pekebun,
.badge-certified,
.badge-non-certified,
.badge-default {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.badge-default {
  background: #f1f5f9;
  color: #64748b;
}

/* ================= ICON FIX ================= */

.summary-icon {
  font-size: 22px;
}

.summary-icon {
  font-size: 22px;
}
</style>