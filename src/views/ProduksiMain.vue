<template>

<div class="produksi-page">

<h1>Produksi PKS</h1>

<!-- FILTER CARD -->
<div class="filter-card">
<div class="filter-container">

<input
type="text"
class="date-range"
placeholder="Pilih Tanggal"
ref="dateRange"
/>

<select class="filter-input" v-model="selectedCompany" @change="updateMill">
<option value="">All Company</option>
<option v-for="c in companyData" :key="c.company_code" :value="c.company_code">
{{ c.company_name }}
</option>
</select>

<select class="filter-input" v-model="selectedMill">
<option value="">All Mill</option>
<option v-for="m in mills" :key="m.mill_code" :value="m.mill_code">
{{ m.mill_name }}
</option>
</select>

<button class="apply-btn" @click="applyFilter">🔍 Apply Filter</button>

</div>
</div>

<!-- KPI ROW ATAS -->
<div class="kpi-grid top">

  <!-- TBS Masuk -->
  <div class="kpi-card red">
    <div class="kpi-header">
      <p>TBS Masuk</p>
      <span :class="['trend', kpiTrend.tbs >= 0 ? 'up' : 'down']">
        {{ kpiTrend.tbs >= 0 ? '▲' : '▼' }} {{ Math.abs(kpiTrend.tbs) }}%
      </span>
    </div>
    <h2>{{ kpi.tbs }}</h2>
  </div>

  <!-- TBS Olah -->
  <div class="kpi-card green">
    <div class="kpi-header">
      <p>TBS Olah</p>
      <span class="trend up">▲</span>
    </div>
    <h2>{{ kpi.olah }}</h2>
  </div>

  <!-- Restan -->
  <div :class="['kpi-card yellow', getRestanStatus(kpi.restan)]">
    <div class="kpi-header">
      <p>Restan</p>
      <span :class="['trend', getRestanStatus(kpi.restan)]">
        {{ getRestanIcon(kpi.restan) }}
      </span>
    </div>
    <h2>{{ kpi.restan }}</h2>
  </div>

  <!-- CPO -->
  <div class="kpi-card green">
    <div class="kpi-header">
      <p>CPO Produksi</p>
      <span :class="['trend', kpiTrend.cpo >= 0 ? 'up' : 'down']">
        {{ kpiTrend.cpo >= 0 ? '▲' : '▼' }} {{ Math.abs(kpiTrend.cpo) }}%
      </span>
    </div>
    <h2>{{ kpi.cpo }}</h2>
  </div>

  <!-- ✅ NEW: KERNEL -->
  <div class="kpi-card orange">
    <div class="kpi-header">
      <p>Kernel Produksi</p>
      <span :class="['trend', kpiTrend.kernel >= 0 ? 'up' : 'down']">
        {{ kpiTrend.kernel >= 0 ? '▲' : '▼' }} {{ Math.abs(kpiTrend.kernel) }}%
      </span>
    </div>
    <h2>{{ kpi.kernel }}</h2>
  </div>

</div>

<!-- KPI ROW BAWAH -->
<div class="kpi-grid bottom">

  <!-- OER -->
  <div class="kpi-card wide blue">
    <div class="kpi-header">
      <p>OER (%)</p>
      <span :class="['trend', kpiTrend.oer >= 0 ? 'up' : 'down']">
        {{ kpiTrend.oer >= 0 ? '▲' : '▼' }} {{ Math.abs(kpiTrend.oer) }}%
      </span>
    </div>
    <h2>{{ kpi.oer }}</h2>
  </div>

  <!-- ✅ NEW: KER -->
  <div class="kpi-card wide purple">
    <div class="kpi-header">
      <p>KER (%)</p>
      <span :class="['trend', kpiTrend.ker >= 0 ? 'up' : 'down']">
        {{ kpiTrend.ker >= 0 ? '▲' : '▼' }} {{ Math.abs(kpiTrend.ker) }}%
      </span>
    </div>
    <h2>{{ kpi.ker }}</h2>
  </div>

</div>

<!-- CHART -->
<div class="card">

<div class="chart-header">
  <h3>Produksi TBS Masuk vs CPO Produksi</h3>
  <span class="chart-info">Menampilkan 7 hari terakhir</span>
</div>

<div class="chart-wrapper">
<canvas ref="chartProduksi"></canvas>
</div>

</div>

<!-- TABLE -->
<div class="card">

<div class="table-header">
<button class="btn-export" @click="exportExcel">Export Excel</button>
</div>

<table class="produksi-table">
<thead>
<tr>
<th>Tanggal</th>
<th>Mill</th>
<th>TBS Masuk</th>
<th>CPO Produksi</th>
<th>Kernel</th>
</tr>
</thead>

<tbody>
<tr v-for="item in produksi" :key="item.tanggal">
<td>{{ item.tanggal }}</td>
<td>{{ item.mill_name || item.mill_code }}</td>
<td>{{ item.tbs_masuk }}</td>
<td>{{ item.cpo }}</td>
<td>{{ item.kernel }}</td>
</tr>
</tbody>

</table>

</div>

</div>
</template>

<script>

import Chart from "chart.js/auto"
import flatpickr from "flatpickr"
import "flatpickr/dist/flatpickr.css"
import * as XLSX from "xlsx"

export default {

data(){
return{

produksi:[],
allData:[],

companyData:[],
mills:[],

selectedCompany:"",
selectedMill:"",

startDate:"",
endDate:"",

chart:null,

kpi:{ tbs:0, cpo:0, oer:0, olah:0, restan:0, kernel:0, ker:0 },
kpiTrend:{ tbs:0, cpo:0, oer:0, kernel:0, ker:0 }

}
},

mounted(){

fetch("http://127.0.0.1:8000/company-mill")
.then(res=>res.json())
.then(data=> this.companyData = data)

fetch("http://127.0.0.1:8000/produksi")
.then(res=>res.json())
.then(data=>{
  this.allData = data
  this.setQuickFilter(7)
})

this.$nextTick(()=>{
if(this.$refs.dateRange){

flatpickr(this.$refs.dateRange,{
mode:"range",
dateFormat:"Y-m-d",
altInput:true,
altFormat:"d M Y",
allowInput:true,

onChange:(selectedDates)=>{
if(selectedDates.length === 2){

const formatDate = d =>
`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`

this.startDate = formatDate(selectedDates[0])
this.endDate = formatDate(selectedDates[1])

this.applyFilter()
}
}
})
}
})

},

methods:{

getRestanStatus(value){
  if(value > 500) return 'danger'
  if(value > 100) return 'warning'
  return 'normal'
},

getRestanIcon(value){
  if(value > 500) return '🔴'
  if(value > 100) return '🟡'
  return '🟢'
},

setQuickFilter(days){

if(!this.allData.length) return

const sorted = [...this.allData].sort(
(a,b)=> new Date(a.tanggal) - new Date(b.tanggal)
)

const lastDate = new Date(sorted[sorted.length - 1].tanggal)
const past = new Date(lastDate)

past.setDate(lastDate.getDate() - days)

this.startDate = past.toISOString().split('T')[0]
this.endDate = lastDate.toISOString().split('T')[0]

this.applyFilter()
},

updateMill(){

  const company = this.companyData.find(
    c => c.company_code === this.selectedCompany
  )

  this.mills = company ? company.mills : []
  this.selectedMill = ""

},

applyFilter(){

if(!this.startDate || !this.endDate) return

const start = new Date(this.startDate)
const end = new Date(this.endDate)
end.setHours(23,59,59,999)

let filtered = this.allData.filter(item=>{
  const d = new Date(item.tanggal)
  return (
    d >= start &&
    d <= end &&
    (!this.selectedCompany || item.company_code === this.selectedCompany) &&
    (!this.selectedMill || item.mill_code === this.selectedMill)
  )
})

if(filtered.length === 0){
  this.produksi = []
  if(this.chart) this.chart.destroy()
  return
}

filtered.sort((a,b)=> new Date(a.tanggal) - new Date(b.tanggal))

const flowData = this.calculateFlow(filtered)

// 🔥 TARUH DI SINI
console.log("FILTERED:", filtered)
console.log("FLOW DATA:", flowData)

this.produksi = flowData
// 🔥 TAMBAH DI SINI
localStorage.setItem("produksi_data", JSON.stringify(this.produksi))
console.log("SAVED PRODUKSI:", this.produksi)

// 🔥 PROTECT KPI
try{
  this.calculateKPI(flowData)
}catch(e){
  console.error("KPI ERROR:", e)
}

// 🔥 CHART TETAP JALAN
if(this.chart) this.chart.destroy()

this.$nextTick(()=> this.createChart())

},

calculateFlow(data){

  return data.map(item => {

    // 🔥 AMANKAN SEMUA NILAI
    const tbsMasuk = Number(item.tbs_masuk) || 0
    const cpo = Number(item.cpo) || 0
    const oer = Number(item.oer) || 0

    let tbs_olah = 0

    // 🔥 HITUNG HANYA KALAU VALID
    if(oer > 0 && cpo > 0){
      tbs_olah = cpo / (oer / 100)
    }

    const restan = tbsMasuk - tbs_olah

    return {
      ...item,
      tbs_olah: Math.round(tbs_olah),
      restan: Math.round(restan)
    }

  })

},

calculateKPI(data){

  const tbs = data.reduce((s,i)=> s + (i.tbs_masuk || 0),0)
  const cpo = data.reduce((s,i)=> s + (i.cpo || 0),0)
  const olah = data.reduce((s,i)=> s + (i.tbs_olah || 0),0)
  const restan = data.reduce((s,i)=> s + (i.restan || 0),0)
  const kernel = data.reduce((s, i)=> s + (i.kernel || 0),0) 

  const avgOer = data.length
    ? data.reduce((s,i)=> s + (i.oer || 0),0) / data.length
    : 0

  const ker = olah > 0 ? (kernel / olah) * 100 : 0

  this.kpi = {
    tbs: Math.round(tbs),
    olah: Math.round(olah),
    restan: Math.round(restan),
    cpo: Math.round(cpo),
    kernel: Math.round(kernel),
    oer: avgOer.toFixed(2),
    ker: ker.toFixed(2)
  }

},

createChart(){

const ctx = this.$refs.chartProduksi.getContext("2d")

this.chart = new Chart(ctx,{

type:"line",

data:{
labels:this.produksi.map(i => i.tanggal),
datasets:[
{
label:"TBS Masuk",
data:this.produksi.map(i => i.tbs_masuk),
borderColor:"#e74c3c",
tension:0.4
},
{
label:"TBS Olah",
data:this.produksi.map(i => i.tbs_olah),
borderColor:"#3498db",
tension:0.4
},
{
label:"Restan",
data:this.produksi.map(i => i.restan),
borderColor:"#f39c12",
borderDash:[5,5], // 🔥 garis putus-putus
tension:0.4
},
{
label:"CPO Produksi",
data:this.produksi.map(i => i.cpo),
borderColor:"#2ecc71",
tension:0.4
}
]
},

options:{
responsive:true,
maintainAspectRatio:false,
interaction:{ mode:"index", intersect:false },
elements:{ point:{ radius:0 } }
},

elements:{ 
    point:{ radius:0 } 
  }

})
},

exportExcel(){
const data = this.produksi.map(i=>({
Tanggal:i.tanggal,
Mill:i.mill_name || i.mill_code,
"TBS Masuk":i.tbs_masuk,
"CPO Produksi":i.cpo,
Kernel:i.kernel
}))

const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, "Produksi")
XLSX.writeFile(wb, `produksi_${this.startDate}_${this.endDate}.xlsx`)
}

}

}
</script>

<style scoped>


.produksi-page{
  padding:0px 0 30px 0;
}

/* TITLE */
.page-title{
  margin-bottom:40px;
  font-weight:700;
  font-size:34px !important;
  letter-spacing:0.3px;
}

/* FILTER */
.filter-card{
  background:white;
  padding:28px;
  border-radius:16px;
  box-shadow:0 4px 12px rgba(0,0,0,0.06);
  margin-bottom:10px;
}

.filter-container{
  display:flex;
  gap:15px;
  flex-wrap:nowrap;
  align-items: center;
  }

.filter-container input,
.filter-container select,
.filter-container button {
  height: 40px;
}

.apply-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* KPI BASE */
.kpi-grid{
  display:grid;
  gap:20px;
  margin:30px 0;
}

/* ROW ATAS (5 CARD) */
.kpi-grid.top{
  grid-template-columns: repeat(5,1fr);
  margin-bottom:15px;
}

/* ROW BAWAH (2 CARD FULL WIDTH) */
.kpi-grid.bottom{
  grid-template-columns: repeat(2,1fr);
}

.kpi-card.wide{
  padding:25px;
}

.kpi-card.wide h2{
  font-size:26px;
}

.kpi-card{
  background:white;
  padding:20px;
  border-radius:12px;
  box-shadow:0 2px 6px rgba(0,0,0,0.05);
  position:relative;
}

.kpi-card::before{
  content:"";
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:4px;
}

.kpi-card.danger::before{ background:#e74c3c; }
.kpi-card.warning::before{ background:#f1c40f; }
.kpi-card.normal::before{ background:#2ecc71; }

.kpi-card.red::before{ background:#e74c3c; }
.kpi-card.green::before{ background:#2ecc71; }
.kpi-card.yellow::before{ background:#f1c40f; }
.kpi-card.orange::before{ background:#f39c12; }
.kpi-card.blue::before{ background:#3498db; }
.kpi-card.purple::before{ background:#8e44ad; }

.kpi-header{
  display:flex;
  justify-content:space-between;
}

.trend.up{ color:#27ae60; }
.trend.down{ color:#e74c3c; }

.negative {
  border-top: 4px solid red;
}

.positive {
  border-top: 4px solid green;
}

/* CHART */
.chart-wrapper{ height:380px; }

.chart-header{
  display:flex;
  justify-content:space-between;
  margin-bottom:10px;
}

/* CARD */
.card{
  background:white;
  padding:24px;
  border-radius:12px;
  margin:30px 0;
}

/* TABLE */
.produksi-table{
  width:100%;
  border-collapse:collapse;
}

.produksi-table th,
.produksi-table td{
  padding:10px;
  text-align:center;
}

</style>