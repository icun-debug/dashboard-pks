import { createRouter, createWebHistory } from "vue-router"

import Dashboard from "../views/Dashboard.vue"
import Produksi from "../views/Produksi.vue"
import MassBalance from "../views/MassBalance.vue"
import StockCPO from "../views/StockCPO.vue"
import Pengiriman from "../views/Pengiriman.vue"

const routes = [
{
path: "/",
name: "Dashboard",
component: Dashboard
},
{
path: "/produksi",
name: "/Produksi",
component: Produksi
},
{
path: "/mass-balance",
name: "MassBalance",
component: MassBalance
},
{
path: "/stockcpo",
name: "StockCPO",
component: StockCPO
},
{
path: "/pengiriman",
name: "Pengiriman",
component: Pengiriman
}
]

const router = createRouter({
history: createWebHistory(),
routes
})

export default router