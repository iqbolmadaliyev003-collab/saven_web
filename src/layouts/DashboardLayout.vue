<script setup>
import { RouterLink, useRoute } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const authStore = useAuthStore();

const navGroups = [
  {
    label: null,
    items: [
      { to: "/asosiy", label: "Asosiy", icon: "home" },
      { to: "/statistika", label: "Statistika", icon: "chart" },
    ],
  },
  {
    label: "Boshqaruv",
    items: [
      { to: "/chegirmalar", label: "Chegirmalar", icon: "tag" },
      { to: "/chegirma-tarixi", label: "Chegirma tarixi", icon: "history" },
      { to: "/kassirlar", label: "Kassirlar", icon: "users" },
    ],
  },
  {
    label: "Sozlamalar",
    items: [
      { to: "/bildirishnomalar", label: "Bildirishnomalar", icon: "bell" },
      { to: "/profil", label: "Profil", icon: "card" },
    ],
  },
];

const businessName = computed(() => authStore.business?.name || "Biznes");
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar text-white/90 md:flex">
      <div class="flex items-center gap-2 px-5 py-5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          S
        </div>
        <span class="text-lg font-semibold">saven</span>
      </div>

      <RouterLink
        to="/profil"
        class="mx-3 mb-2 flex items-center justify-between rounded-xl bg-sidebar-accent px-3 py-2.5 transition hover:bg-white/10"
      >
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {{ authStore.initials }}
          </div>
          <span class="text-sm font-medium">{{ businessName }}</span>
        </div>
        <span class="text-white/40">&rsaquo;</span>
      </RouterLink>

      <nav class="mt-2 flex-1 space-y-4 px-3 pb-4 overflow-y-auto">
        <div v-for="(group, idx) in navGroups" :key="idx">
          <p v-if="group.label" class="mb-1.5 px-3 text-xs text-white/40">{{ group.label }}</p>
          <ul class="space-y-0.5">
            <li v-for="item in group.items" :key="item.to">
              <RouterLink
                :to="item.to"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition"
                :class="route.path === item.to ? 'bg-sidebar-accent text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'"
              >
                <span class="h-4 w-4">•</span>
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <button
        @click="authStore.logout(); $router.push('/login')"
        class="mx-3 mb-4 rounded-lg px-3 py-2 text-left text-sm text-white/60 hover:bg-white/5 hover:text-white"
      >
        Chiqish
      </button>
    </aside>

    <!-- Mobile top bar -->
    <div class="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-white md:hidden">
      <span class="text-lg font-semibold">saven</span>
      <RouterLink to="/profil" class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
        {{ authStore.initials }}
      </RouterLink>
    </div>
    <nav class="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t bg-white py-2 md:hidden">
      <RouterLink
        v-for="item in navGroups.flatMap((g) => g.items)"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center px-2 py-1 text-[10px]"
        :class="route.path === item.to ? 'text-primary font-semibold' : 'text-muted'"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <main class="flex-1 pb-20 pt-16 md:ml-64 md:pb-0 md:pt-0">
      <div class="mx-auto max-w-7xl p-4 md:p-6">
        <slot />
      </div>
    </main>
  </div>
</template>
