<template>
<div class="container">

<h1>Stock CPO</h1>

<!-- FILTER -->
<div class="filter-card">
  <div class="filter-grid">

    <input ref="dateRange" class="date-range" placeholder="Pilih rentang tanggal"/>

    <button @click="setQuickFilter(7)">7D</button>
    <button @click="setQuickFilter(30)">30D</button>
    <button @click="setQuickFilter(90)">3M</button>

    <button class="btn-filter" @click="applyFilter">
      Apply
    </button>

  </div>
</div>

<!-- BUTTON INPUT -->
<button class="btn-add" @click="showModal = true">
  + Input Stock
</button>

<!-- CHART + KPI -->
<div class="card">

  <div class="chart-header">
    <h3>Stock Movement</h3>

    <select v-model="selectedMillChart" class="dropdown-mill">
      <option value="">All (Total)</option>
      <option v-for="m in millListAll" :key="m" :value="m">
        {{ m }}
      </option>
    </select>
  </div>

  <div class="chart-wrapper">
    <canvas ref="chartStock"></canvas>
  </div>

  <div class="kpi-bar">
    <div class="kpi-box">
      <h3>Total Stock CPO</h3>
      <p>{{ formatNumber(totalCPO) }}</p>
    </div>

    <div class="divider"></div>

    <div class="kpi-box">
      <h3>Total Stock Kernel</h3>
      <p>{{ formatNumber(totalKernel) }}</p>
    </div>
  </div>

</div>

<!-- TABLE -->
<div class="card">
  <table class="table">
    <thead>
      <tr>
        <th>PT</th>
        <th>Mill</th>
        <th>Tanggal</th>
        <th>Produk</th>
        <th>Tipe</th>
        <th>Jumlah</th>
        <th>Balance</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(row,i) in displayData" :key="i">
        <td>{{ row.pt }}</td>
        <td>{{ row.mill }}</td>
        <td>{{ row.tanggal }}</td>
        <td>{{ row.produk }}</td>
        <td>{{ row.tipe }}</td>
        <td>{{ formatNumber(row.jumlah) }}</td>
        <td>{{ formatNumber(row.balance || 0) }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- MODAL INPUT -->
<div v-if="showModal" class="modal-overlay">
<div class="modal">

<h3>Input Stock</h3>

<div class="input-grid">

<select v-model="form.pt">
<option disabled value="">PT</option>
<option v-for="pt in ptList" :key="pt.name" :value="pt.name">
{{ pt.name }}
</option>
</select>

<select v-model="form.mill">
<option disabled value="">Mill</option>
<option v-for="m in millList" :key="m" :value="m">
{{ m }}
</option>
</select>

<input type="date" v-model="form.tanggal">

<select v-model="form.produk">
<option>CPO</option>
<option>KERNEL</option>
</select>

<select v-model="form.tipe">
<option>IN</option>
<option>OUT</option>
<option>ADJ</option>
</select>

<input type="number" v-model="form.jumlah" placeholder="Jumlah">
<input v-model="form.keterangan" placeholder="Keterangan">

</div>

<div class="modal-action">
<button @click="showModal=false">Batal</button>
<button @click="submitStock">Simpan</button>
</div>

</div>
</div>

</div>
</template>

<script>
import Chart from "chart.js/auto"
import flatpickr from "flatpickr"
import "flatpickr/dist/flatpickr.css"

export default {

data(){
return{
  stock:[],
  allData:[],
  startDate:"",
  endDate:"",

  selectedMillChart:"",
  millListAll:[],

  totalCPO:0,
  totalKernel:0,

  chart:null,

  showModal:false,

  form:{
    pt:"",
    mill:"",
    tanggal:"",
    produk:"CPO",
    tipe:"IN",
    jumlah:"",
    keterangan:""
  },

  ptList:[
    { name:"PT SAWIT SUMBERMAS SARANA TBK", mills:["SELANGKUN MILL"] },
    { name:"PT SAWIT MANDIRI LESTARI", mills:["SUNGAI KUNING MILL"] },
    { name:"PT SAWIT MANDIRI LESTARI", mills:["SUJA MILL"] },
    { name:"PT MENTENG KENCANA MAS", mills:["KANAMIT MILL"]},
    { name:"PT MIRZA PRATAMA PUTRA", mills:["SUMBER CAHAYA MILL"]},
    { name:"PT SAWIT SUMBERMAS SARANA TBK", mills:["SULUNG MILL"]},
    { name:"PT BORNEO SAWIT GEMILANG", mills:["PANGKOH MILL"]},
    { name:"PT KALIMANTAN SAWIT ABADI", mills:["NATAI BARU MILL"]},
    { name:"PT MITRA MENDAWI SEJATI", mills:["SUAYAP MILL"]},
    { name:"PT MITRA MENDAWI SEJATI", mills:["SUAYAP MILL"]},
    { name:"PT MITRA MENDAWI SEJATI", mills:["SUAYAP MILL PKO"]},
    { name:"PT SAWIT MULTI UTAMA", mills:["NANGA KIU MILL"] },
    { name:"PT SAWIT MANDIRI LESTARI", mills:["SUNGAI KUNING MILL"] },
    { name:"PT TANJUNG SAWIT ABADI", mills:["MALATA MILL"] }
  ],

  millList:[]
}
},

computed:{
  displayData(){
    return this.stock.slice(-20)
  }
},

watch:{
  selectedMillChart(){
    this.createChart()
  },
  "form.pt"(val){
    const p = this.ptList.find(i=>i.name===val)
    this.millList = p ? p.mills : []
    this.form.mill=""
  }
},

mounted(){

this.loadData().then(()=>{
  this.setQuickFilter(30)
})

this.$nextTick(()=>{
flatpickr(this.$refs.dateRange,{
mode:"range",
  dateFormat:"Y-m-d",
  onChange:(dates)=>{
    if(dates.length === 2){
      this.startDate = dates[0].toISOString().slice(0,10)
      this.endDate = dates[1].toISOString().slice(0,10)
    }
  }
})
})

},

methods:{

async loadData(){
  const res = await fetch("http://127.0.0.1:8000/stock-combined")
  const data = await res.json()

  this.allData = data
  this.millListAll = [...new Set(data.map(i => i.mill).filter(Boolean))]
},

setQuickFilter(days){
  if(!this.allData.length) return

  const maxDate = Math.max(...this.allData.map(i => new Date(i.tanggal)))
  
  const end = new Date(maxDate)
  const start = new Date(end)
  start.setDate(start.getDate() - days)

  this.startDate = start.toISOString().slice(0,10)
  this.endDate = end.toISOString().slice(0,10)

  this.applyFilter()
},

applyFilter(){

  const filtered = this.allData.filter(i=>{
    return i.tanggal >= this.startDate && i.tanggal <= this.endDate
  })

  this.stock = filtered

  this.totalCPO = this.stock
    .filter(i => i.produk === "CPO")
    .reduce((a,b)=>{
      const jumlah = Number(String(b.jumlah).replace(/\./g,'')) || 0
      return b.tipe === "OUT" ? a - jumlah : a + jumlah
    },0)

  this.totalKernel = this.stock
    .filter(i => i.produk === "KERNEL")
    .reduce((a,b)=>{
      const jumlah = Number(String(b.jumlah).replace(/\./g,'')) || 0
      return b.tipe === "OUT" ? a - jumlah : a + jumlah
    },0)

  this.createChart()
},

createChart(){

  const canvas = this.$refs.chartStock
  if(!canvas) return

  const ctx = canvas.getContext("2d")

  if(this.chart){
    this.chart.destroy()
  }

  let data = this.stock || []
  if(!data.length) return

  if(this.selectedMillChart){
    data = data.filter(i => i.mill === this.selectedMillChart)
  }

  let running = 0
  const grouped = {}

  const sorted = [...data].sort((a,b)=> new Date(a.tanggal) - new Date(b.tanggal))

  sorted.forEach(i=>{
    const jumlah = Number(String(i.jumlah).replace(/\./g,'')) || 0
    const tgl = i.tanggal.slice(0,10)

    if(i.tipe === "IN") running += jumlah
    else if(i.tipe === "OUT") running -= jumlah
    else running += jumlah

    grouped[tgl] = running
  })

  const labels = Object.keys(grouped)
    .sort((a,b)=> new Date(a)-new Date(b))

  const values = labels.map(l => grouped[l])

  this.chart = new Chart(ctx,{
    type:"line",
    data:{
      labels,
      datasets:[{
        label: this.selectedMillChart || "Total Stock",
        data: values,
        borderColor:"#16a34a",
        tension:0.4
      }]
    },
    options:{
    responsive:true,
    maintainAspectRatio:false   // ⬅️ INI KUNCI NYA
  }
  })
},

async submitStock(){

await fetch("http://127.0.0.1:8000/stock-movement",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify(this.form)
})

this.showModal=false
await this.loadData()
this.setQuickFilter(30)

this.form={
pt:"",mill:"",tanggal:"",
produk:"CPO",tipe:"IN",jumlah:"",keterangan:""
}

},

formatNumber(v){
  return Number(v).toLocaleString("id-ID")
}

}

}
</script>

<style scoped>

.container{ padding:30px; max-width:1200px; margin:auto; }

.filter-grid{ display:flex; gap:10px; flex-wrap:wrap; }

.date-range{ height:40px; padding:0 10px; border-radius:8px; border:1px solid #ddd; }

.btn-add{margin:10px 0;background:#16a34a;color:white;padding:8px;border-radius:6px;}

.card{
background:white;
padding:20px;
border-radius:12px;
box-shadow:0 2px 6px rgba(0,0,0,0.05);


margin-bottom:30px;
}

.chart-wrapper {
  height: 350px;
  position: relative;
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

.kpi-bar{
display:flex;
justify-content:center;
gap:40px;
margin-top:20px;
border-top:1px solid #eee;
padding-top:10px;
}

.kpi-box{text-align:center;}

.divider{width:1px;height:40px;background:#eee;}

.table{width:100%;border-collapse:collapse;}

.table th{background:#f3f6fa;padding:10px;}

.table td{padding:10px;border-bottom:1px solid #eee;}

.modal-overlay{
position:fixed;top:0;left:0;width:100%;height:100%;
background:rgba(0,0,0,0.4);
display:flex;justify-content:center;align-items:center;
}

.modal{background:white;padding:20px;border-radius:10px;width:600px;}

.input-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}

.modal-action{margin-top:10px;text-align:right;}

</style>
