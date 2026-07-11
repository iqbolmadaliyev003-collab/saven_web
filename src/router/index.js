import { createRouter, createWebHistory } from "vue-router";
import { authApi } from "@/api";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginPage.vue"),
    meta: { public: true },
  },
  {
    path: "/",
    redirect: "/asosiy",
  },
  {
    path: "/asosiy",
    name: "asosiy",
    component: () => import("@/views/AsosiyPage.vue"),
  },
  {
    path: "/statistika",
    name: "statistika",
    component: () => import("@/views/StatistikaPage.vue"),
  },
  {
    path: "/chegirmalar",
    name: "chegirmalar",
    component: () => import("@/views/ChegirmalarPage.vue"),
  },
  {
    path: "/chegirma-tarixi",
    name: "chegirma-tarixi",
    component: () => import("@/views/ChegirmaTarixiPage.vue"),
  },
  {
    path: "/kassirlar",
    name: "kassirlar",
    component: () => import("@/views/KassirlarPage.vue"),
  },
  {
    path: "/bildirishnomalar",
    name: "bildirishnomalar",
    component: () => import("@/views/BildirishnomalarPage.vue"),
  },
  {
    path: "/profil",
    name: "profil",
    component: () => import("@/views/ProfilPage.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundPage.vue"),
    meta: { public: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authed = authApi.isAuthenticated();
  if (!to.meta.public && !authed) {
    return { name: "login" };
  }
  if (to.name === "login" && authed) {
    return { name: "asosiy" };
  }
  return true;
});

export default router;
