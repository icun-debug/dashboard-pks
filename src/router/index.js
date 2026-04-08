import { createRouter, createWebHistory } from "vue-router"

import Dashboard from "../views/Dashboard.vue"
import Produksi from "../views/Produksi.vue"
import ProduksiMain from "../views/ProduksiMain.vue"
import SupplyEstate from "../views/SupplyEstate.vue"
import MassBalance from "../views/MassBalance.vue"
import MassBalanceMain from "../views/MassBalanceMain.vue"
import BookClaim from "../views/BookClaim.vue"
import StockCPO from "../views/StockCPO.vue"
import Shipment from "../views/Shipment.vue"
import Manual from "../views/Manual.vue"
import Timbangan from "../views/Timbangan.vue"

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
          component: MassBalanceMain
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
    path: "/shipment",
    name: "Shipment",
    component: Shipment,
    children: [
      {
        path: "manual",
        name: "Manual",
        component: () => import("../views/Manual.vue")
      },
      {
        path: "timbangan",
        name: "Timbangan",
        component: () => import("../views/Timbangan.vue")
      }
    ]
  }
]

const router = createRouter({
history: createWebHistory(),
routes
})

export default router