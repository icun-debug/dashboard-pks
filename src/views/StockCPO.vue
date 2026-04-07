<template>
<div class="container">

<h1>Stock CPO</h1>

<div class="filter-card">

  <div class="filter-container">

    <!-- DATE -->
    <input 
      type="text"
      class="date-range"
      placeholder="Pilih Tanggal"
    />

    <!-- COMPANY -->
    <select v-model="company_code">
      <option value="">All Company</option>
      <option 
        v-for="c in companyList" 
        :key="c.company_code" 
        :value="c.company_code"
      >
        {{ c.company_name }}
      </option>
    </select>

    <!-- MILL -->
    <select v-model="mill_code">
      <option value="">All Mill</option>
      <option 
        v-for="m in filteredMillList" 
        :key="m.mill_code" 
        :value="m.mill_code"
      >
        {{ m.mill_name }}
      </option>
    </select>

    <!-- BUTTON -->
    <button class="apply-btn" @click="applyFilter">
      🔍 Apply Filter
    </button>

  </div>

</div>

<div class="filter-info" v-if="company_code || mill_code || start_date">
  <span v-if="start_date">
    📅 {{ start_date }} - {{ end_date }}
  </span>
  <span v-if="company_code">
    🏢 {{ getCompanyName(company_code) }}
  </span>
  <span v-if="mill_code">
    🏭 {{ getMillName(mill_code) }}
  </span>
</div>

<!-- CHART + KPI -->
<div class="card">
  <div class="chart-header">
    <h3>Stock Movement</h3>
    <span class="chart-info">Menampilkan 7 hari terakhir</span>
  </div>
  <!-- 🔥 TAMBAH INI -->
  <div v-if="stockData.length" class="chart-wrapper">
    <canvas ref="chartStock"></canvas>
  </div>
  <!-- 🔥 EMPTY STATE -->
  <div v-else class="empty-state">
    <p>📭 Tidak ada data</p>
    <small>Coba ubah filter tanggal / PT / Mill</small>
  </div>
  <div class="kpi-bar">
  <div class="kpi-box">
    <h3>Total Stock CPO</h3>
    <p>{{ stockData.length ? formatNumber(totalCPO) : '-' }}</p>
  </div>
  <div class="divider"></div>
  <div class="kpi-box">
    <h3>Total Stock Kernel</h3>
    <p>{{ stockData.length ? formatNumber(totalPK) : '-' }}</p>
  </div>
</div>

</div>

<!-- TABLE -->
<div class="card">
  <h3 class="table-title">Recent Movement</h3>

  <div style="overflow-x:auto;">
    <table class="table">
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Produk</th>
          <th>Tipe</th>
          <th>Jumlah</th>
          <th>Stock</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in stockData.slice(-10)" :key="item.id">
          <td>{{ item.tanggal }}</td>

          <td>
            <span :class="['badge', item.produk === 'CPO' ? 'cpo' : 'pk']">
              {{ item.produk }}
            </span>
          </td>

          <!-- 🔥 Tipe (badge IN/OUT) -->
          <td>
            <span :class="['badge', item.tipe === 'IN' ? 'in' : 'out']">
              {{ item.tipe }}
            </span>
          </td>

          <!-- 🔥 Jumlah (+ / -) -->
          <td>
            <span :class="item.tipe === 'IN' ? 'plus' : 'minus'">
              {{ item.tipe === 'IN' ? '+' : '-' }}{{ formatNumber(item.jumlah) }}
            </span>
          </td>

          <td class="stock">
            {{ formatNumber(item.running_stock) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</div>

</template>

<script>
import { Chart } from "chart.js/auto";
import flatpickr from "flatpickr"
import "flatpickr/dist/flatpickr.css"

export default {

data(){
return{
    stockData: [],
    dateRange: "",
    company_code: "",
    mill_code: "",
    start_date: "",
    end_date: "",
    chart: null,

    companyList: [],
    millList: []
  }
},
computed: {
  totalCPO() {
    const cpo = this.stockData.filter(i => i.produk === "CPO")
    return cpo.length ? cpo[cpo.length - 1].running_stock : 0
  },
  totalPK() {
    const pk = this.stockData.filter(i => i.produk === "PK")
    return pk.length ? pk[pk.length - 1].running_stock || 0 : 0
  },

  filteredMillList() {
    if (!this.company_code) return this.millList

    return this.millList.filter(
      m => m.company_code === this.company_code
    )
  }
},
mounted(){
    this.fetchCompany()
    this.fetchMill()
    this.fetchStock()

    flatpickr(".date-range", {
    mode: "range",
    dateFormat: "Y-m-d",
    onClose: (selectedDates) => {
      if (selectedDates.length === 2) {
        this.start_date = selectedDates[0].toISOString().split("T")[0]
        this.end_date = selectedDates[1].toISOString().split("T")[0]
      }
    }
  })
  },
watch: {
  selectedCompany() {
    this.selectedMill = null
  }
},
methods:{
  getCompanyName(code) {
    const c = this.companyList.find(i => i.company_code === code)
    return c ? c.company_name : code
  },

  getMillName(code) {
    const m = this.millList.find(i => i.mill_code === code)
    return m ? m.mill_name : code
  },
  applyFilter() {
    console.log("PT:", this.selectedCompany)
    console.log("Mill:", this.selectedMill)
    console.log("Date:", this.dateRange)
    this.fetchStock()
  },
  formatNumber(v) {
    return Number(v).toLocaleString("id-ID")
  },
  async fetchStock() {
  try {
    let url = "http://127.0.0.1:8000/stock-final?"

    // ✅ COMPANY
    if (this.selectedCompany && this.selectedCompany !== "All Company") {
      url += `company_code=${encodeURIComponent(this.selectedCompany)}&`
    }

    // ✅ MILL
    if (this.selectedMill && this.selectedMill !== "All Mill") {
      url += `mill_code=${encodeURIComponent(this.selectedMill)}&`
    }

    // ✅ DATE
    if (this.dateRange) {
      const [start, end] = this.dateRange.split(" to ")
      url += `start_date=${start}&end_date=${end}`
    }

    console.log("FINAL URL:", url) // 🔥 debug penting

    const res = await fetch(url)
    const data = await res.json()

    this.stockData = data

    this.$nextTick(() => {
      this.createChart()
    })

  } catch (err) {
    console.error(err)
  }
  },
  async fetchCompany() {
    const res = await fetch("http://127.0.0.1:8000/company")
    this.companyList = await res.json()
  },
  async fetchMill() {
    const res = await fetch("http://127.0.0.1:8000/mill")
    this.millList = await res.json()
  },
  createChart() {
  if (!this.$refs.chartStock) return

  if (!this.stockData.length) {
    if (this.chart) this.chart.destroy()
    return
  }

  if (this.chart) {
    this.chart.destroy()
  }
  const ctx = this.$refs.chartStock.getContext("2d")
  const grouped = {}
  this.stockData.forEach(item => {
    if (item.produk === "CPO") {
      grouped[item.tanggal] = item.running_stock
    }
  })
  const labels = Object.keys(grouped).slice(-7)
  const values = Object.values(grouped).slice(-7)
  this.chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Stock CPO",
        data: values,
        backgroundColor: "#16a34a",
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })

  setTimeout(() => {
    window.dispatchEvent(new Event("resize"))
  }, 100)
}
}
}
</script>

<style scoped>

.content {
  padding: 30px 40px; /* jangan 0 */
  }

.container{
  padding:20px 40px;
  max-width:1500px;
  margin:auto;
  }

.filter-info {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  }

.filter-grid{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  }

.date-range{
  height:40px;
  padding:0 10px;
  border-radius:8px;
  border:1px solid #ddd;
  }

.btn-add{
  margin:10px 0;
  background:#16a34a;color:white;
  padding:8px;
  border-radius:6px;
  }

.card{
  background:white;
  padding:20px;
  border-radius:12px;
  box-shadow:0 2px 6px rgba(0,0,0,0.05);
  margin-bottom: 40px; /* biar gak numpuk */
  }

.chart-subtitle {
  color: #888;
  font-size: 12px;
}

.chart-wrapper {
  width: 100%;
  height: 300px; /* sebelumnya 350 */
}

.chart-info {
  font-size: 12px;
  color: #888;
}

.chart-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:10px;
  }

.dropdown-mill{
  height:36px;
  padding:0 10px;
  border:1px solid #ddd;
  border-radius:8px;
  }

.badge.in {
  background: #dcfce7;
  color: #16a34a;
}

.badge.out {
  background: #fee2e2;
  color: #dc2626;
}

.kpi-bar{
  position: relative;
  z-index: 2;
  display:flex;
  justify-content:center;
  gap:40px;
  margin-top:20px;
  border-top:1px solid #eee;
  padding-top:10px;
  }

.kpi-box{
  text-align:center;
  }

.divider{
  width:1px;
  height:40px;
  background:#eee;
  }

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.table th {
  background: #f9fafb;
  text-align: left;
  padding: 12px;
  font-size: 13px;
  color: #555;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.table tr:hover {
  background: #f3f6fa;
}

.no-data {
  color: #999;
  font-style: italic;
}

/* badge produk */
.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge.cpo {
  background: #dcfce7;
  color: #16a34a;
}

.badge.pk {
  background: #fef3c7;
  color: #d97706;
}

.empty-state {
  text-align: center;
  padding: 50px;
  color: #999;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 5px;
}

/* stock highlight */
.stock {
  font-weight: bold;
  color: #16a34a;
}

.modal-overlay{
  position:fixed;top:0;left:0;width:100%;height:100%;
  background:rgba(0,0,0,0.4);
  display:flex;justify-content:center;align-items:center;
  }

.modal{
  background:white;
  padding:20px;
  border-radius:10px;
  width:600px;
  }

.input-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
  }

.modal-action{
  margin-top:10px;
  text-align:right;
  }

  .plus {
  color: #16a34a;
  font-weight: 600;
}

.minus {
  color: #dc2626;
  font-weight: 600;
}

</style>
