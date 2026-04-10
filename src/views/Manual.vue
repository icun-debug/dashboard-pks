<template>
  <div class="page-container">
    <h1 class="page-title"> Input Manual</h1>

    <div class="filter-card">

  <div class="filter-container">

    <!-- DATE -->
    <input 
      type="text"
      class="date-range"
      placeholder="Pilih Tanggal"
    />

    <!-- COMPANY -->
    <select v-model="selectedPT">
      <option value="">All Company</option>
      <option 
        v-for="c in companyData" 
        :key="c.company_code" 
        :value="c.company_code"
      >
        {{ c.company_name }}
      </option>
    </select>

    <!-- MILL -->
    <select v-model="selectedMill">
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

<div class="filter-info" v-if="selectedPT || selectedMill || start_date">
  <span v-if="start_date">
    📅 {{ start_date }} - {{ end_date }}
  </span>
  <span v-if="company_code">
    🏢 {{ getCompanyName(selectedPT) }}
  </span>
  <span v-if="mill_code">
    🏭 {{ getMillName(selectedMill) }}
  </span>
</div>

    <div class="action-bar">
      <button class="btn-primary" @click="openModal">
        + Input Pengiriman
      </button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>PT</th>
            <th>Mill</th>
            <th>Tanggal</th>
            <th>Produk</th>
            <th>Qty</th>
            <th>Tujuan</th>
            <th>No DO</th>
            <th>RSPO</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in shipments" :key="item.id">
            <td>{{ companyMap[item.company_code] || item.company_code }}</td>
            <td>{{ companyMap[item.mill_code] || item.mill_code }}</td>
            <td>{{ formatDate(item.tanggal) }}</td>
            <td>{{ item.produk }}</td>
            <td>{{ formatNumber(item.jumlah) }}</td>
            <td>{{ item.tujuan }}</td>
            <td>{{ item.no_do }}</td>
            <td>{{ item.rspo || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Input Pengiriman</h3>

        <!-- 🔥 PT -->
        <div class="form-group">
          <label>PT</label>
          <select v-model="selectedPT">
            <option disabled value="">Pilih PT</option>
            <option 
              v-for="c in companyData" 
              :key="c.company_code" 
              :value="c.company_code"
            >
              {{ c.company_name }}
            </option>
          </select>
        </div>

        <!-- 🔥 MILL -->
        <div class="form-group">
          <label>Mill</label>
          <select v-model="selectedMill">
            <option disabled value="">Pilih Mill</option>
            <option 
              v-for="m in getMillList()" 
              :key="m.mill_code" 
              :value="m.mill_code"
            >
              {{ m.mill_name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Tanggal</label>
          <input type="date" v-model="form.date" />
        </div>

        <div class="form-group">
          <label>Produk</label>
          <select v-model="form.product">
            <option value="CPO">CPO</option>
            <option value="PK">PK</option>
          </select>
        </div>

        <div class="form-group">
          <label>RSPO</label>
          <select v-model="form.rspo">
            <option value="">Pilih RSPO</option>
            <option value="CERTIFIED">Certified</option>
            <option value="NON">Non-RSPO</option>
          </select>
        </div>

        <div class="form-group">
          <label>Jumlah (Kg)</label>
          <input type="number" v-model="form.qty" />
        </div>

        <div class="form-group">
          <label>Tujuan</label>
          <input type="text" v-model="form.destination" />
        </div>

        <div class="form-group">
          <label>No DO</label>
          <input type="text" v-model="form.do_number" />
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="closeModal">Batal</button>
          <button 
            class="btn-primary" 
            @click="submitData"
            :disabled="loading"
            >
            {{ loading ? "⏳ Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "flatpickr/dist/flatpickr.css"
import flatpickr from "flatpickr";
export default {
  name: "Pengiriman",

  data() {
    return {
      start_date: "",
      end_date: "",

      shipments: [],
      showModal: false,
      loading: false,

      companyData: [],
      selectedPT: "",
      selectedMill: "",

      form: {
        date: "",
        product: "CPO",
        qty: 0,
        destination: "",
        do_number: "",
        rspo: ""
      }
    }
  },

  async mounted() {
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

  try {
    const [companyRes, shipmentRes] = await Promise.all([
      fetch("http://127.0.0.1:8000/company-mill"),
      fetch("http://127.0.0.1:8000/shipments")
    ])

    const companyData = await companyRes.json()
    const shipmentData = await shipmentRes.json()

    this.companyData = companyData

    this.shipments = shipmentData.map(item => ({
      id: item.id,
      company_code: item.pt || item.company_code,
      mill_code: item.mill || item.mill_code,
      tanggal: item.date || item.tanggal,
      produk: item.product || item.produk,
      jumlah: item.qty || item.jumlah,
      tujuan: item.destination || item.tujuan,
      no_do: item.do_number || item.no_do,
      rspo: item.rspo_type
    }))

  } catch (err) {
    console.error("❌ INIT ERROR:", err)
  }
},

watch: {
  selectedPT() {
    this.selectedMill = ""
  }
},

computed: {
  companyMap() {
    const map = {}
    this.companyData.forEach(c => {
      map[c.company_code] = c.company_name
      c.mills.forEach(m => {
        map[m.mill_code] = m.mill_name
      })
    })
    return map
  },
  filteredMillList() {
    if (!this.selectedPT) return this.companyData.flatMap(c => c.mills)

    const selected = this.companyData.find(c => c.company_code === this.selectedPT)
    return selected ? selected.mills : []
  }
},

  methods: {

    applyFilter(){
      this.fetchData()
    },
    // 🔥 ambil company & mill
    async fetchCompany() {
    try {
      // ✅ DEBUG TARUH DI SINI
      console.log("PT:", this.selectedPT)
      console.log("MILL:", this.selectedMill)
      console.log("DATE:", this.start_date, this.end_date)

      const res = await fetch("http://127.0.0.1:8000/company-mill")
      const data = await res.json()

      console.log("🏢 COMPANY:", data)

      this.companyData = data

      } catch (err) {
        console.error("❌ COMPANY ERROR:", err)
      }
    },

    // 🔥 ambil shipment
      async fetchData() {
      try {

    // 🔥 BASE URL
    let url = "http://127.0.0.1:8000/shipments?"

    // 🔥 FILTER PT
    if (this.selectedPT) {
      url += `company_code=${this.selectedPT}&`
    }

    // 🔥 FILTER MILL
    if (this.selectedMill) {
      url += `mill_code=${this.selectedMill}&`
    }

    // 🔥 FILTER TANGGAL
    if (this.start_date && this.end_date) {
      url += `start_date=${this.start_date}&end_date=${this.end_date}&`
    }

    console.log("🌐 FINAL URL:", url)

    // 🔥 FETCH DARI URL YANG SUDAH DIFILTER
    const res = await fetch(url)
    const data = await res.json()

    console.log("🔥 RAW API:", data)

    // 🔥 NORMALISASI DATA
    this.shipments = data.map(item => ({
      id: item.id,
      company_code: item.pt || item.company_code,
      mill_code: item.mill || item.mill_code,
      tanggal: item.date || item.tanggal,
      produk: item.product || item.produk,
      jumlah: item.qty || item.jumlah,
      tujuan: item.destination || item.tujuan,
      no_do: item.do_number || item.no_do,
      rspo: item.rspo_type
    }))

  } catch (err) {
    console.error("❌ ERROR FETCH:", err)
  }
  },

    // 🔥 TAMBAH DI SINI
    
    getCompanyName(code) {
        const c = this.companyData.find(i => i.company_code === code)
        return c ? c.company_name : code
    },

    getMillName(code) {
        for (const c of this.companyData) {
        const m = c.mills.find(i => i.mill_code === code)
        if (m) return m.mill_name
        }
        return code
    },

    openModal() {
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.resetForm()
    },

    resetForm() {
      this.form = {
        date: "",
        product: "CPO",
        qty: 0,
        destination: "",
        do_number: "",
        rspo: ""
      }
      this.selectedPT = ""
      this.selectedMill = ""
    },

    async submitData() {
      if (!this.form.date || !this.form.qty || !this.selectedPT || !this.selectedMill) {
        alert("Semua field wajib diisi")
        return
      }

      try {

        // 🔥 SIMPAN SHIPMENT
        await fetch("http://127.0.0.1:8000/shipments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            date: this.form.date,
            product: this.form.product,
            qty: this.form.qty,
            destination: this.form.destination,
            do_number: this.form.do_number,
            pt: this.selectedPT,
            mill: this.selectedMill,
            rspo: this.form.rspo
          })
        })

        // 🔥 STOCK OUT
        await fetch("http://127.0.0.1:8000/stock-movement", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            tanggal: this.form.date,
            produk: this.form.product,
            tipe: "OUT",
            jumlah: this.form.qty,
            pt: this.selectedPT,
            mill: this.selectedMill
          })
        })

        this.closeModal()
        await this.fetchData()

      } catch (err) {
        console.error(err)
      } finally {
        
      }
    },

    getMillList() {
        // 🔥 TARUH DI SINI
        console.log("SELECTED PT:", this.selectedPT)
        
        const selected = this.companyData.find(
        c => c.company_code === this.selectedPT
    )
    return selected ? selected.mills : []
    },

    formatNumber(val) {
      return new Intl.NumberFormat().format(val)
    },

    formatDate(val) {
      return new Date(val).toLocaleDateString("id-ID")
    }
  }
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}
.page-container {
  padding: 0px;
}

.page-title {
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 15px;
}

.card {
  background: #1e293b;
  padding: 15px;
  border-radius: 10px;
}

.table {
  width: 100%;
  color: black;
}

.table th, .table td {
  padding: 10px;
  text-align: left;
  color: #334155;
  font-weight: 500;

}

/* BUTTON STYLE */
.btn-primary {
  background: #22c55e;
  border: none;
  padding: 8px 16px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background: #16a34a;
}

.btn-secondary {
  background: #94a3b8;
  border: none;
  padding: 8px 16px;
  color: white;
  border-radius: 8px;
}

/* MODAL */
.modal {
  background: white;
  color: #1e293b;
  padding: 28px;
  width: 420px;
  margin: 80px auto;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(3px);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* TITLE */
.modal h3 {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}

/* FORM GROUP */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
  gap: 4px;
}

.form-group label {
  font-size: 13px;
  margin-bottom: 5px;
  color: #64748b;
}

/* INPUT + SELECT */
.form-group input,
.form-group select {
  height: 38px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: 0.2s;
}

/* FOCUS EFFECT */
.form-group input:focus,
.form-group select:focus {
  border-color: #22c55e;
  outline: none;
  box-shadow: 0 0 0 2px rgba(34,197,94,0.15);
}


</style>