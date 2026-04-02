<template>

<div class="layout">

  <!-- SIDEBAR -->
  <aside class="sidebar">

    <div class="logo-area">
      <img src="/sawit.png" class="logo">
      <h2>PKS System</h2>
    </div>

    <nav>
      <router-link to="/">📊 Dashboard</router-link>
      <a>🚚 Supply Estate</a>
      <router-link to="/produksi">🏭 Produksi</router-link>
      <router-link to="/mass-balance">📊 Mass Balance</router-link>
      <router-link to="/stockcpo">🛢 Stock CPO</router-link>
      <router-link to="/pengiriman">📦Pengiriman</router-link>
      <a>📑 Report</a>
      <a>🌱 Book & Claim</a>
    </nav>

  </aside>

  <!-- CONTENT -->
  <main class="content">
  <div class="page-wrapper">
    <router-view />
  </div>
</main>

</div>

</template>


<script>
export default {
  name: "App"
}
</script>


<style>

.loading,
.error,
.empty {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error {
  color: red;
}

button {
  margin-top: 10px;
}

/* =========================
   LAYOUT
========================= */

.layout{
  display:flex;
  min-height:100vh;
  width:100%;
}


/* =========================
   SIDEBAR
========================= */

.sidebar{
  width:230px;
  background:#1f2d3d;
  color:white;
  min-height:100vh;
  padding:20px;
  flex-shrink:0;
}

.logo-area{
  text-align:center;
  margin-bottom:40px;
}

.logo{
  width:70px;
}

.logo-area h2{
  font-size:18px;
  margin-top:10px;
}

.sidebar nav{
  display:flex;
  flex-direction:column;
  gap:15px;
}

.sidebar nav a{
  display:flex;
  align-items:center;
  gap:10px;
  color:white;
  text-decoration:none;

  padding:10px 14px;
  border-radius:6px;

  transition:all 0.2s ease;
  font-size:15px;
}

.sidebar nav a:hover{
  background:#2c3e50;
}

.sidebar nav .router-link-active{
  background:#34495e;
  border-left:4px solid #2ecc71;
  color:white;
  text-decoration:none;
}


/* =========================
   CONTENT AREA
========================= */

.content{
  flex:1;
  width:100%;
  padding:30px 0; /* 🔥 FIX */
  background:#f4f6f9;
}


/* =========================
   DASHBOARD CONTAINER
========================= */

.container{
  max-width:1400px;
  margin:auto;
  width:100%;
  font-family:'Segoe UI', sans-serif;
}

.data-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  font-weight: 500;
  color: #2ecc71;
}

.data-status.offline {
  color: #e67e22;
}

.data-status .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2ecc71;
}

.data-status.offline .dot {
  background: #e67e22;
}

/* =========================
   HEADER
========================= */

.header{
  display:flex;
  justify-content:center;
  align-items:center;
  margin-bottom:30px;
}

.title{
  text-align:center;
}

.header h1{
  font-size:36px;
  margin:0;
}

.header p{
  margin:0;
  color:#777;
}


/* =========================
   FILTER
========================= */

.filter-card{
  background:white;
  padding:20px;
  border-radius:12px;
  box-shadow:0 5px 15px rgba(0,0,0,0.08);
  margin-bottom:20px;
}

.filter-container{
  display:grid;
  grid-template-columns:2fr 1fr 1fr auto;
  gap:12px;
  align-items:center;
}

.date-range{
  width:100%;
  height:38px;
  padding:0 12px;
  border-radius:6px;
  border:1px solid #ccc;
}

.filter-container input,
.filter-container select{
  width:100%;
  height:38px;
  padding:0 12px;
  border-radius:6px;
  border:1px solid #ccc;
  box-sizing:border-box;
}

.apply-btn{
  height:38px;
  padding:0 20px;
  border-radius:8px;
  background:#1f2a3a;
  color:white;
  border:none;
  font-weight:600;
  cursor:pointer;
  white-space:nowrap;
}


/* =========================
   QUICK FILTER
========================= */

.quick-filter{
  display:flex;
  align-items:center;
  gap:10px;
  margin-top:8px;
  margin-bottom:20px;
}

.quick-filter span{
  font-size:14px;
  color:#666;
}

.quick-filter button{
  background:#e5e7eb;
  border:none;
  padding:6px 12px;
  border-radius:6px;
  cursor:pointer;
  font-size:13px;
}

.quick-filter button:hover{
  background:#d1d5db;
}


/* =========================
   KPI SECTION
========================= */

.section-title{
  font-size:18px;
  font-weight:600;
  margin-bottom:15px;
  color:#444;
}


/* =========================
   STATUS COLOR
========================= */

.status-normal{
  background:#16a34a;
}

.status-warning{
  background:#f59e0b;
}

.status-danger{
  background:#ef4444;
}

.page-wrapper{
  max-width:1300px;
  margin:0 auto;
  padding:0 20px;
}
</style>