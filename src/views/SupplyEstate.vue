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
      <div class="summary-label">Total Tonase</div>
      <div class="summary-value">{{ totalTonase }} Ton</div>
    </div>
    <div class="summary-icon">🚛</div>
  </div>

  <div class="summary-card">
    <div>
      <div class="summary-label">Total JJG</div>
      <div class="summary-value">{{ totalJJG }}</div>
    </div>
    <div class="summary-icon">📦</div>
  </div>

  <div class="summary-card">
    <div>
      <div class="summary-label">Jumlah Estate</div>
      <div class="summary-value">{{ totalEstate }}</div>
    </div>
    <div class="summary-icon">🌴</div>
  </div>
</div>

     <!-- TABLE -->
<div class="table-container">
  <table class="data-table">

    <thead>
      <tr>
        <th>Tanggal</th>
        <th>Estate</th>
        <th>Blok</th>
        <th>Tonase</th>
        <th>JJG</th>
        <th>Transport</th>
      </tr>
    </thead>

    <tbody>

      <tr
        v-for="(item, index) in filteredData"
        :key="index"
      >
        <td>{{ item.tanggal }}</td>
        <td>{{ item.estate }}</td>
        <td>{{ item.blok }}</td>
        <td>{{ item.tonase }}</td>
        <td>{{ item.jjg }}</td>
        <td>{{ item.transport }}</td>
      </tr>

      <tr v-if="filteredData.length === 0">
        <td colspan="6" class="empty-data">
          Tidak ada data
        </td>
      </tr>

    </tbody>

  </table>
</div>
</div>
</template>

<script setup>
import { ref, computed } from "vue"

// 🔹 Dummy data
const data = ref([
  {
    tanggal: "2026-04-15",
    estate: "Estate A",
    blok: "A1",
    tonase: 12,
    jjg: 150,
    transport: "KH 1234 AB"
  },
  {
    tanggal: "2026-04-15",
    estate: "Estate B",
    blok: "B2",
    tonase: 8,
    jjg: 100,
    transport: "KH 5678 CD"
  }
])

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
const filteredData = computed(() => {
  return data.value.filter(item => {
    return (
      (!filters.value.date || item.tanggal === filters.value.date) &&
      (!filters.value.estate || item.estate === filters.value.estate) &&
      (!filters.value.blok || item.blok.toLowerCase().includes(filters.value.blok.toLowerCase()))
    )
  })
})

// 🔹 Summary
const totalTonase = computed(() => {
  return filteredData.value.reduce((sum, d) => sum + d.tonase, 0)
})

const totalJJG = computed(() => {
  return filteredData.value.reduce((sum, d) => sum + d.jjg, 0)
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
</script>

<style scoped>
.filter-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.filter-container{
  display:flex;
  gap:15px;
  flex-wrap:nowrap;
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


.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 180px;
}

.filter-item label {
  margin-bottom: 6px;
  font-size: 14px;
  color: #666;
}

.filter-item input,
.filter-item select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.button-area {
  display: flex;
  align-items: end;
}

.button-area button {
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.summary-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.summary-title {
  color: #64748b;
  font-size: 13px;
}

.summary-card h2 {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 600;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
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
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.empty-data {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
}
</style>