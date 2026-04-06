import { createRouter, createWebHistory } from "vue-router"

import Dashboard from "../views/Dashboard.vue"
import Produksi from "../views/Produksi.vue"
import ProduksiMain from "../views/ProduksiMain.vue"
import SupplyEstate from "../views/SupplyEstate.vue"
import MassBalance from "../views/MassBalanceMain.vue"
import MassBalanceMain from "../views/MassBalanceMain.vue"
import BookClaim from "../views/BookClaim.vue"
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
  name: "Produksi",
  component: Produksi, // ini jadi layout
  children: [
    {
      path: "",
      name: "ProduksiMain",
      component: () => import("../views/ProduksiMain.vue")
    },
    {
      path: "supply-estate",
      name: "SupplyEstate",
      component: () => import("../views/SupplyEstate.vue")
    }
  ]
},
{
path: "/mass-balance",
name: "MassBalance",
component: MassBalance,
children: [
    {
        path: "",
        name: "MassBalanceMain",
        component: () => import("../views/MassBalanceMain.vue")
    },
    {
        path: "book-claim",
        name: "BookClaim",
        component: () => import("../views/BookClaim.vue")
    }
]
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