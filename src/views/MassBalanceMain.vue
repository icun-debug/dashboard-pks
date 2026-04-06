<template>
  <div class="container">

    <h1>Mass Balance</h1>

    <!-- FILTER -->
    <div class="filter-card">

  <div class="filter-grid">

    <!-- DATE -->
    <input 
      type="text" 
      ref="dateRange" 
      class="input"
      placeholder="Pilih Tanggal"
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
    <button class="btn-apply" @click="fetchData">
      Apply Filter
    </button>

  </div>

</div>
    <!-- KPI -->
    <div class="kpi-grid">

  <div class="card green">
    <span>TBS Masuk</span>
    <h2>{{ total.tbs_masuk.toLocaleString() }}</h2>
  </div>

  <div class="card green">
    <span>TBS Olah</span>
    <h2>{{ total.tbs_olah.toLocaleString() }}</h2>
  </div>

  <div class="card orange">
    <span>CPO</span>
    <h2>{{ total.cpo.toLocaleString() }}</h2>
  </div>

  <div class="card purple">
    <span>Kernel</span>
    <h2>{{ total.kernel.toLocaleString() }}</h2>
  </div>

  <div class="card red">
    <span>Restan</span>
    <h2>{{ total.restan.toLocaleString() }}</h2>
  </div>

</div>

    <!-- TABLE -->
    <table class="table">
  <thead>
    <tr>
      <th>Tanggal</th>
      <th>Mill</th>
      <th>TBS Masuk</th>
      <th>TBS Olah</th>
      <th>CPO</th>
      <th>Kernel</th>
      <th>Restan</th>
      <th>OER</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="row in data" :key="row.tanggal + row.mill_code">
      <td>{{ row.tanggal }}</td>
      <td>{{ row.mill_code }}</td>
      <td>{{ row.tbs_masuk }}</td>
      <td>{{ row.tbs_olah }}</td>
      <td>{{ row.cpo }}</td>
      <td>{{ row.kernel }}</td>
      <td>{{ row.restan.toFixed(2) }}</td>
      <td>{{ row.oer_calc.toFixed(2) }}%</td>
    </tr>
  </tbody>
    </table>

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

      // 🔥 date range (SAMAIN DASHBOARD)
      startDate: "",
      endDate: "",

      filter: {
        company_code: "",
        mill_code: ""
      },

      total: {
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
      try {
        const res = await axios.get("http://127.0.0.1:8000/mass-balance", {
          params: {
            company_code: this.filter.company_code,
            mill_code: this.filter.mill_code,
            start_date: this.startDate,
            end_date: this.endDate
          }
        })

        this.data = res.data
        this.calculateTotal()

      } catch (err) {
        console.error("Mass Balance API Error:", err)
      }
    },

    async getCompanyMill() {
    const res = await axios.get("http://127.0.0.1:8000/company-mill")
    this.companies = res.data
    },

    calculateTotal() {
      this.total = {
        tbs_masuk: 0,
        tbs_olah: 0,
        cpo: 0,
        kernel: 0,
        restan: 0
      }

      this.data.forEach(d => {
        this.total.tbs_masuk += d.tbs_masuk
        this.total.tbs_olah += d.tbs_olah
        this.total.cpo += d.cpo
        this.total.kernel += d.kernel
        this.total.restan += d.restan
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

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 12px;
}

.input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.btn-apply {
  background: #1f2937;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
