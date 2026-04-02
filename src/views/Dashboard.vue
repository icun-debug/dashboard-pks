<template>

<div class="container">

<header class="header">
<div class="title">
<h1>PKS Management Dashboard</h1>
<p>Monitoring Produksi Kelapa Sawit</p>
</div>
</header>

<!-- FILTER CARD -->
<div class="filter-card">

<div class="filter-container">

<input
type="text"
class="date-range"
placeholder="Pilih Tanggal"
ref="dateRange"
/>

<select v-model="selectedCompany" @change="updateMill">

<option value="">All Company</option>

<option
v-for="c in companyData"
:key="c.company_code"
:value="c.company_code">

{{ c.company_name }}

</option>

</select>

<select v-model="selectedMill">

<option value="">All Mill</option>

<option
v-for="m in mills"
:key="m.mill_code"
:value="m.mill_code">

{{ m.mill_name }}

</option>

</select>

<button class="apply-btn" @click="applyFilter">
Apply Filter
</button>

</div>

</div>

<div class="data-status" :class="{ offline: isOffline }">
  <span class="dot"></span>
  {{ isOffline ? "Offline Mode (Dummy Data)" : "Live Data" }}
</div>

<!-- DASHBOARD CONTEXT -->

<div class="dashboard-context">

<div class="context-location">

<span>{{ selectedCompanyName || "All Company" }}</span>
•
<span>{{ selectedMillName || "All Mill" }}</span>

</div>

<div class="context-date">

Periode :
{{ startDate || "-" }}
-
{{ endDate || "-" }}

</div>

</div>

<!-- QUICK FILTER -->
<div class="quick-filter">

<span>Quick :</span>

<button @click="setQuickFilter(7)">7D</button>
<button @click="setQuickFilter(30)">30D</button>
<button @click="setQuickFilter(90)">3M</button>

</div>

<!-- PRODUKSI -->
<div class="kpi-section">

<h2 class="section-title">Produksi</h2>

<div class="kpi-grid">

<div class="card tbs">
<h3>🌴 TBS Terima</h3>
<p>{{ tbsTerima }} ton</p>
</div>

<div class="card tbs">
<h3>🌴 TBS Olah</h3>
<p>{{ tbsToday }} ton</p>
</div>

<div class="card restan">
<h3>📦 Restan</h3>
<p>{{ restanToday }} ton</p>
</div>

</div>

</div>

<!-- HASIL PRODUKSI -->
<div class="kpi-section">

<h2 class="section-title">Hasil Produksi</h2>

<div class="kpi-grid">

<div class="card cpo">
<h3>🛢 CPO Hari Ini</h3>
<p>{{ cpoToday }} ton</p>
</div>

<div class="card kernel">
<h3>🌰 Kernel Hari Ini</h3>
<p>{{ kernelToday }} ton</p>
</div>

<div class="card oer">
<h3>📈 OER</h3>
<p>{{ oerToday }} %</p>
</div>

<div class="card oer">
<h3>📈 KER</h3>
<p>{{ kerToday }} %</p>
</div>

</div>

</div>

<!-- STOCK -->
<div class="kpi-section">

<h2 class="section-title">Stock</h2>

<div class="kpi-grid">

<div class="card stock-cpo">
<h3>🛢 Stock CPO</h3>
<p>{{ stockCpo }} ton</p>
</div>

<div class="card stock-kernel">
<h3>🌰 Stock Kernel</h3>
<p>{{ stockKernel }} ton</p>
</div>

</div>

</div>

<!-- STATUS PRODUKSI -->

<div class="status-bar">
<span class="status-indicator"></span>
<strong>Status Produksi :</strong>
{{ productionStatus }} ({{ productionPercent }}%)
</div>

<!-- CHART -->
<div class="chart-grid">

<div class="chart-container">
<canvas id="chartProduksi"></canvas>
</div>

<div class="chart-container">
<canvas id="chartOER"></canvas>
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

startDate:"",
endDate:"",

companyData:[],
mills:[],

selectedCompany:"",
selectedMill:"",

tanggal:[],
cpo:[],
tbs:[],
kernel:[],
oer:[],

originalData:[],

tbsToday:0,
tbsTerima:0,
cpoToday:0,
kernelToday:0,
oerToday:0,
kerToday:0,
restanToday:0,
stockCpo:0,
stockKernel:0,

productionStatus:"",
productionPercent:0,

chartProduksi:null,
chartOER:null,
isOffline: false

}
},

computed:{
selectedCompanyName(){
const company = this.companyData.find(c => c.company_code === this.selectedCompany)
return company ? company.company_name : ""
},

selectedMillName(){
const mill = this.mills.find(m => m.mill_code === this.selectedMill)
return mill ? mill.mill_name : ""
}
},

mounted(){

// COMPANY
fetch("http://127.0.0.1:8000/company-mill")
.then(res => res.json())
.then(data => this.companyData = data)

// PRODUKSI
fetch("http://127.0.0.1:8000/produksi")
.then(res=>res.json())
.then(data=>{

if(!data || data.length === 0){
this.useDummyData()
return
}

this.originalData = data
this.isOffline = false

// 🔥 DEFAULT 30 HARI + AUTO FILTER
this.setDefaultDate()
this.applyFilter()

})
.catch(()=>{
this.useDummyData()
})

// RESTAN
fetch("http://127.0.0.1:8000/restan")
.then(res=>res.json())
.then(data=>{
if(data?.length){
this.restanToday = data[data.length-1].restan_ton
}
})

// STOCK
fetch("http://127.0.0.1:8000/stockcpo")
.then(res=>res.json())
.then(data=>{
if(data?.length){
const last = data[data.length-1]
this.stockCpo = last.stock_cpo
this.stockKernel = last.stock_kernel
}
})

// DATE PICKER
this.$nextTick(()=>{
if(this.$refs.dateRange){

flatpickr(this.$refs.dateRange,{
mode:"range",
dateFormat:"Y-m-d",
altInput:true,
altFormat:"d M Y",

onChange:(dates)=>{
if(dates.length === 2){
this.startDate = this.formatDate(dates[0])
this.endDate = this.formatDate(dates[1])
}
}

})

}
})

},

methods:{

formatDate(date){
const y = date.getFullYear()
const m = String(date.getMonth()+1).padStart(2,"0")
const d = String(date.getDate()).padStart(2,"0")
return `${y}-${m}-${d}`
},

setDefaultDate(){

  if(!this.originalData.length) return

  const sorted = [...this.originalData].sort(
    (a,b)=> new Date(a.tanggal) - new Date(b.tanggal)
  )

  const lastDataDate = new Date(sorted[sorted.length - 1].tanggal)

  const past = new Date(lastDataDate)
  past.setDate(lastDataDate.getDate() - 30)

  this.startDate = this.formatDate(past)
  this.endDate = this.formatDate(lastDataDate)

},

useDummyData(){

this.isOffline = true

const dummy = [
{ tanggal:"2026-03-01", tbs_masuk:500, cpo:120, kernel:60, oer:24, ker:12 },
{ tanggal:"2026-03-02", tbs_masuk:480, cpo:110, kernel:55, oer:23, ker:11 },
{ tanggal:"2026-03-03", tbs_masuk:520, cpo:130, kernel:65, oer:25, ker:13 }
]

this.originalData = dummy
this.setDefaultDate()
this.applyFilter()

},

updateMill(){
const company = this.companyData.find(c => c.company_code === this.selectedCompany)
this.mills = company ? company.mills : []
this.selectedMill = ""
},

setQuickFilter(days){

  if(!this.originalData.length) return

  const sorted = [...this.originalData].sort(
    (a,b)=> new Date(a.tanggal) - new Date(b.tanggal)
  )

  const lastDate = new Date(sorted[sorted.length - 1].tanggal)
  const past = new Date(lastDate)

  past.setDate(lastDate.getDate() - days)

  this.startDate = this.formatDate(past)
  this.endDate = this.formatDate(lastDate)

  this.applyFilter()

},

updateChartData(data){

const sorted = [...data].sort((a,b)=> new Date(a.tanggal) - new Date(b.tanggal))

// 🔥 LIMIT 30 DATA
const limited = sorted.slice(-30)

this.tanggal = limited.map(i => i.tanggal)
this.cpo = limited.map(i => i.cpo || 0)
this.tbs = limited.map(i => i.tbs_masuk || 0)
this.kernel = limited.map(i => i.kernel || 0)
this.oer = limited.map(i => i.oer || 0)

},

updateKPI(data){

if(!data?.length) return

const sorted = [...data].sort((a,b)=> new Date(a.tanggal) - new Date(b.tanggal))
const last = sorted[sorted.length - 1]

this.tbsTerima = last.tbs_masuk || 0
this.tbsToday = last.tbs_masuk || 0
this.cpoToday = last.cpo || 0
this.kernelToday = last.kernel || 0

this.oerToday = Number(last.oer || 0).toFixed(2)
this.kerToday = Number(last.ker || 0).toFixed(2)

// STATUS
const target = 500
this.productionPercent = ((this.tbsToday / target) * 100).toFixed(0)

if(this.tbsToday >= target){
this.productionStatus = "🟢 Produksi Normal"
}else if(this.tbsToday >= 450){
this.productionStatus = "🟡 Produksi Turun"
}else{
this.productionStatus = "🔴 Produksi Kritis"
}

},

applyFilter(){

  if(!this.startDate || !this.endDate) return
  if(!Array.isArray(this.originalData)) return

  const start = new Date(this.startDate)
  const end = new Date(this.endDate)

  // 🔥 FIX: include full end date
  end.setHours(23,59,59,999)

  const filtered = this.originalData.filter(item => {

    const d = new Date(item.tanggal)

    return (
      d >= start &&
      d <= end &&
      (!this.selectedCompany || item.company_code === this.selectedCompany) &&
      (!this.selectedMill || item.mill_code === this.selectedMill)
    )

  })

  let finalData = []

  if(!filtered.length){
    console.warn("Data kosong, pakai fallback last 30 data")

    const sorted = [...this.originalData].sort(
      (a,b)=> new Date(a.tanggal) - new Date(b.tanggal)
    )

    finalData = sorted.slice(-30)
  }else{
    finalData = filtered
  }

  this.updateChartData(finalData)
  this.updateKPI(finalData)

  if(this.chartProduksi) this.chartProduksi.destroy()
  if(this.chartOER) this.chartOER.destroy()

  this.$nextTick(()=>{
    this.createChart()
    this.createOERChart()
  })

},

createChart(){

const ctx = document.getElementById("chartProduksi")
if(!ctx) return

this.chartProduksi = new Chart(ctx,{
type:"line",
data:{
labels:this.tanggal,
datasets:[
{
label:"Produksi CPO",
data:this.cpo,
borderColor:"#2ecc71",
tension:0.4,
fill:true
},
{
label:"TBS Masuk",
data:this.tbs,
borderColor:"#e74c3c",
tension:0.4,
fill:true
}
]
},
options:{ responsive:true }
})

},

createOERChart(){

const ctx = document.getElementById("chartOER")
if(!ctx) return

this.chartOER = new Chart(ctx,{
type:"line",
data:{
labels:this.tanggal,
datasets:[
{
label:"OER %",
data:this.oer.length ? this.oer : [0],
borderColor:"#3498db",
tension:0.4,
fill:true
}
]
},
options:{ responsive:true }
})

}

}

}

</script>

<style scoped>
.kpi-section{
  margin-bottom:30px;
}

.section-title{
  font-size:18px;
  font-weight:600;
  margin-bottom:15px;
  color:#444;
}

/* 🔥 center & fleksibel */
.kpi-grid{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:20px;
}

/* 🔥 konsisten ukuran */
.card{
  width:220px;
  background:#f5f5f5;
  padding:25px;
  border-radius:12px;
  text-align:center;
  box-shadow:0 5px 15px rgba(0,0,0,0.1);
  transition:0.2s;
}

.card:hover{
  transform:translateY(-3px);
  box-shadow:0 8px 20px rgba(0,0,0,0.15);
}

.status-bar{
  margin-top:20px;
  padding:15px 20px;
  background:white;
  border-radius:10px;
  display:flex;
  align-items:center;
  gap:10px;
  box-shadow:0 4px 10px rgba(0,0,0,0.1);
  font-size:18px;
  font-weight:600;
}

.chart-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:25px;
  margin-top:20px;
}

.chart-container{
  background:white;
  padding:25px;
  border-radius:12px;
  box-shadow:0 5px 15px rgba(0,0,0,0.1);
}

/* warna indikator tetap boleh di sini */
.tbs{ border-top:5px solid #27ae60; }
.cpo{ border-top:5px solid #f39c12; }
.kernel{ border-top:5px solid #8e44ad; }
.oer{ border-top:5px solid #3498db; }
.ker{ border-top:5px solid #9b59b6; }
.restan{ border-top:5px solid #b08968; }
.stock-cpo{ border-top:5px solid #16a34a; }
.stock-kernel{ border-top:5px solid #d97706; }

/* =========================
   KPI CARD
========================= */

.card:hover{
  transform:translateY(-3px);
  box-shadow:0 8px 20px rgba(0,0,0,0.15);
}

.card h3{
  margin:0;
  color:#666;
}

.card p{
  font-size:28px;
  font-weight:bold;
  margin-top:10px;
}

/* =========================
   STATUS BAR
========================= */

.status-bar{
  margin-top:20px;
  padding:15px 20px;

  background:white;
  border-radius:10px;

  display:flex;
  align-items:center;
  gap:10px;

  box-shadow:0 4px 10px rgba(0,0,0,0.1);

  font-size:18px;
  font-weight:600;
}

.status-indicator{
  width:14px;
  height:14px;
  border-radius:50%;
  background:red;
}

/* =========================
   CHART
========================= */

.chart-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:25px;
  margin-top:20px;
}

.chart-container{
  background:white;
  padding:25px;
  border-radius:12px;
  box-shadow:0 5px 15px rgba(0,0,0,0.1);
}

.chart-container canvas{
  width:100% !important;
  height:320px !important;
}

/* =========================
   KPI COLOR INDICATOR
========================= */

.tbs{
  border-top:5px solid #27ae60;
}

.cpo{
  border-top:5px solid #f39c12;
}

.kernel{
  border-top:5px solid #8e44ad;
}

.oer{
  border-top:5px solid #3498db;
}

.ker{
  border-top:5px solid #9b59b6;
}

.restan{
  border-top:5px solid #b08968;
}

.stock-cpo{
  border-top:5px solid #16a34a;
}

.stock-kernel{
  border-top:5px solid #d97706;
}


</style>