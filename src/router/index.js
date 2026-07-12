import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

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

// Auth guard: token bo'lmasa, faqat "public" sahifalarga (login, 404) kirishga
// ruxsat beriladi, aks holda /login'ga qaytariladi. Login qilingan bo'lsa, /login'ga
// qayta kirishga urinilsa /asosiy'ga yo'naltiriladi.
router.beforeEach((to) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.path === "/") {
    return { path: "/asosiy" };
  }

  if (!to.meta.public && !isAuthenticated) {
    return { path: "/login" };
  }

  if (to.path === "/login" && isAuthenticated) {
    return { path: "/asosiy" };
  }

  return true;
});

export default router;
