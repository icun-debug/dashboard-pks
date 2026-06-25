<template>
  <div class="container">

    <h1>Mass Balance</h1>

    <!-- FILTER -->
    <div class="filter-card">

      <div class="filter-container">

      <!-- DATE -->
        <input 
          type="text"  
          class="input"
          placeholder="Pilih Tanggal"
          ref="dateRange"
          />

    <!-- COMPANY -->
        <select 
          v-model="filter.company_code" 
          class="input"
          @change="updateMill"
        >
          <option value="">All Company</option>
          <option v-for="c in companies" :key="c.company_code" :value="c.company_code">
            {{ c.company_name }}
          </option>
        </select>

        <!-- MILL -->
        <select 
          v-model="filter.mill_code" 
          class="input"
          :disabled="!filter.company_code"
        >
          <option value="">All Mill</option>
          <option v-for="m in mills" :key="m.mill_code" :value="m.mill_code">
            {{ m.mill_name }}
          </option>
        </select>

        <!-- BUTTON -->
        <button class="apply-btn" @click="fetchData">
          🔍 Apply Filter
        </button>

        </div>

</div>

<div v-if="loading">
  Loading Mass Balance...
</div>

    <!-- CERTIFIED -->
<h2 class="section-title certified-title">Certified</h2>

<div class="kpi-grid">

  <div class="card certified">
    <span>TBS Masuk</span>
    <h2>{{ totalCertified.tbs_masuk.toLocaleString() }}</h2>
    <small>Ton</small>
  </div>

  <div class="card certified">
    <span>TBS Olah</span>
    <h2>{{ totalCertified.tbs_olah.toLocaleString() }}</h2>
    <small>Ton</small>
  </div>

  <div class="card certified">
    <span>CPO</span>
    <h2>{{ totalCertified.cpo.toLocaleString() }}</h2>
    <small>Ton</small>
  </div>

  <div class="card certified">
    <span>Kernel</span>
    <h2>{{ totalCertified.kernel.toLocaleString() }}</h2>
    <small>Ton</small>
  </div>

  <div class="card certified-restan">
    <span>Restan (Certified)</span>
    <h2>{{ totalCertified.restan.toLocaleString() }}</h2>
    <small>Ton</small>
  </div>

</div>


<!-- NON CERTIFIED -->
<h2 class="section-title noncert-title">Non Certified</h2>

<div class="kpi-grid">

  <div class="card noncert">
    <span>TBS Masuk</span>
    <h2>{{ totalNonCertified.tbs_masuk.toLocaleString() }}</h2>
    <small>Ton</small>
  </div>

  <div class="card noncert">
    <span>TBS Olah</span>
    <h2>{{ totalNonCertified.tbs_olah.toLocaleString() }}</h2>
    <small>Ton</small>
  </div>

  <div class="card noncert">
    <span>CPO</span>
    <h2>{{ totalNonCertified.cpo.toLocaleString() }}</h2>
    <small>Ton</small>
  </div>

  <div class="card noncert">
    <span>Kernel</span>
    <h2>{{ totalNonCertified.kernel.toLocaleString() }}</h2>
    <small>Ton</small>
  </div>

  <div class="card noncert-restan">
    <span>Restan (Non Certified)</span>
    <h2>{{ totalNonCertified.restan.toLocaleString() }}</h2>
    <small>Ton</small>
  </div>

</div>

    <!-- TABLE -->
    <table class="table">
  <thead>
    <tr>
      <th>Tanggal</th>
      <th>Mill</th>
      <th>Certified Status</th>
      <th>TBS Masuk</th>
      <th>TBS Olah</th>
      <th>CPO</th>
      <th>Kernel</th>
      <th>Restan</th>
      <th>OER</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="row in paginatedData" :key="row.tanggal + row.mill_code + row.certified_status">
      <td>{{ row.tanggal }}</td>
      <td>{{ row.mill_code }}</td>
      <td>
        <span
          :class="row.certified_status === 'Certified'
            ? 'badge-certified'
            : 'badge-noncert'"
        >
          {{ row.certified_status }}
        </span>
      </td>
      <td>{{ row.tbs_masuk }}</td>
      <td>{{ row.tbs_olah }}</td>
      <td>{{ row.cpo }}</td>
      <td>{{ row.kernel }}</td>
      <td>{{ row.restan.toFixed(2) }}</td>
      <td>{{ row.oer_calc.toFixed(2) }}%</td>
    </tr>
    </tbody>
    </table>

      <div class="table-footer">

  <div class="entries-info">
    Showing
    {{ (currentPage - 1) * perPage + 1 }}
    to
    {{ Math.min(currentPage * perPage, data.length) }}
    of
    {{ data.length }}
    entries
  </div>

  <div class="pagination">

    <!-- First -->
    <button
      class="page-btn"
      @click="currentPage = 1"
      :disabled="currentPage === 1"
    >
      «
    </button>

    <!-- Previous -->
    <button
      class="page-btn"
      @click="currentPage--"
      :disabled="currentPage === 1"
    >
      ‹
    </button>

    <!-- Number -->
    <button
      v-for="page in visiblePages"
      :key="page"
      class="page-btn"
      :class="{ active: currentPage === page }"
      @click="currentPage = page"
    >
      {{ page }}
    </button>

    <!-- Next -->
    <button
      class="page-btn"
      @click="currentPage++"
      :disabled="currentPage === totalPages"
    >
      ›
    </button>

    <!-- Last -->
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
</template>

<script>
import axios from "axios"
import flatpickr from "flatpickr"
import "flatpickr/dist/flatpickr.css"

export default {
  data() {
    return {
      data: [],
      companies: [],
      mills: [],

      currentPage: 1,
      perPage: 10,
      loading: true,

      // 🔥 date range (SAMAIN DASHBOARD)
      startDate: "",
      endDate: "",

      filter: {
        company_code: "",
        mill_code: ""
      },

      totalCertified: {
          tbs_masuk: 0,
          tbs_olah: 0,
          cpo: 0,
          kernel: 0,
          restan: 0
        },

        totalNonCertified: {
          tbs_masuk: 0,
          tbs_olah: 0,
          cpo: 0,
          kernel: 0,
          restan: 0
        }
    }
  },

    mounted() {
      this.initDatePicker()
      this.fetchData()
      this.getCompanyMill()
    },

    computed: {

  paginatedData() {
    const start = (this.currentPage - 1) * this.perPage
    const end = start + this.perPage
    return this.data.slice(start, end)
  },

  totalPages() {
    return Math.ceil(this.data.length / this.perPage)
  },

  visiblePages() {

    let pages = []

    let start = Math.max(1, this.currentPage - 2)
    let end = Math.min(this.totalPages, start + 4)

    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

},

  methods: {

    // 🔥 DATE PICKER (COPY DASHBOARD STYLE)
    initDatePicker() {
      this.$nextTick(() => {
        if (this.$refs.dateRange) {
          flatpickr(this.$refs.dateRange, {
            mode: "range",
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d M Y",

            locale: {
              rangeSeparator: " - "
            },

            onChange: (selectedDates) => {
              if (selectedDates.length === 2) {

                const formatDate = (date) => {
                  const y = date.getFullYear()
                  const m = String(date.getMonth() + 1).padStart(2, "0")
                  const d = String(date.getDate()).padStart(2, "0")
                  return `${y}-${m}-${d}`
                }

                this.startDate = formatDate(selectedDates[0])
                this.endDate = formatDate(selectedDates[1])

              }
            }
          })
        }
      })
    },

    // 🔥 FETCH DATA (SUDAH CONNECT DATE FILTER)
    async fetchData() {

      loading: true

      try { 

        const res = await axios.get("http://127.0.0.1:8000/mass-balance", {
          params: {
            company_code: this.filter.company_code,
            mill_code: this.filter.mill_code,
            start_date: this.startDate,
            end_date: this.endDate
          }
        })

        console.log("API RESULT =", res.data)
        console.log("TOTAL ROW =", res.data.length)

        this.data = res.data
        this.calculateTotal()
        this.currentPage = 1

      } catch (err) {
        console.error("Mass Balance API Error:", err)
      } finally {
        this.loading = false
      }
    },

    async getCompanyMill() {
    const res = await axios.get("http://127.0.0.1:8000/company-mill")
    this.companies = res.data
    },

    calculateTotal(){

    this.totalCertified = {
    tbs_masuk:0,
    tbs_olah:0,
    cpo:0,
    kernel:0,
    restan:0
    }

    this.totalNonCertified = {
      tbs_masuk:0,
      tbs_olah:0,
      cpo:0,
      kernel:0,
      restan:0
    }

    this.data.forEach(d=>{

    if(d.certified_status === "Certified"){

      this.totalCertified.tbs_masuk += d.tbs_masuk
      this.totalCertified.tbs_olah += d.tbs_olah
      this.totalCertified.cpo += d.cpo
      this.totalCertified.kernel += d.kernel
      this.totalCertified.restan += d.restan

      }else{

        this.totalNonCertified.tbs_masuk += d.tbs_masuk
        this.totalNonCertified.tbs_olah += d.tbs_olah
        this.totalNonCertified.cpo += d.cpo
        this.totalNonCertified.kernel += d.kernel
        this.totalNonCertified.restan += d.restan

      }

    })

    },

    updateMill() {
    const selected = this.companies.find(
      c => c.company_code === this.filter.company_code
    )

    this.mills = selected ? selected.mills : []
    this.filter.mill_code = ""
    }

  }

}
</script>

<style>
.section-title{
    margin:20px 0 10px;
    font-size:28px;
    font-weight:700;
}

.certified-title{
    color:#22c55e;
}

.noncert-title{
    color:#ef4444;
}

.certified{
    border-top:3px solid #22c55e;
}

.noncert{
    border-top:3px solid #ef4444;
}

.certified-restan{
    border:1px solid #22c55e;
}

.noncert-restan{
    border:1px solid #ef4444;
}

.badge-certified{
    background:#dcfce7;
    color:#15803d;
    padding:6px 12px;
    border-radius:20px;
}

.badge-noncert{
    background:#fee2e2;
    color:#dc2626;
    padding:6px 12px;
    border-radius:20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.table th {
  background: #f1f5f9;
  text-align: left;
  padding: 10px;
}

.table td {
  padding: 10px;
  border-top: 1px solid #eee;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.card {
  padding: 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.green { border-top: 4px solid #22c55e; }
.orange { border-top: 4px solid #f59e0b; }
.purple { border-top: 4px solid #8b5cf6; }
.red { border-top: 4px solid #ef4444; }

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

.pagination button{
    width:40px;
    height:40px;
    border:none;
    background:#fff;
    border-radius:10px;
    cursor:pointer;
    box-shadow:0 2px 8px rgba(0,0,0,.08);
}

.pagination button.active{
    background:#1e293b;
    color:white;
}

.pagination button:disabled{
    opacity:.4;
    cursor:not-allowed;
}
</style>
