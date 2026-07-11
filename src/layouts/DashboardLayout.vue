<script setup>
import { RouterLink, useRoute } from "vue-router";
import { computed, ref } from "vue";
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

// --- yig'iladigan (collapsible) sidebar holati ---
const collapsed = ref(false);
function toggleSidebar() {
  collapsed.value = !collapsed.value;
}

// har bir nav elementiga ketma-ket kirish animatsiyasi uchun global index
const flatItems = navGroups.flatMap((g) => g.items);
function itemDelay(item) {
  const idx = flatItems.findIndex((i) => i.to === item.to);
  return `${idx * 60}ms`;
}

// --- SVG ikonalar (lucide uslubida, stroke asosida) ---
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  tag: '<path d="M12.6 2.6a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r=".6" fill="currentColor" stroke="none"/>',
  history: '<path d="M3 12a9 9 0 1 0 2.6-6.3L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  bell: '<path d="M10.3 21a2 2 0 0 0 3.4 0"/><path d="M3.3 15.3A1 1 0 0 0 4 17h16a1 1 0 0 0 .7-1.7C19.4 14 18 12.5 18 8a6 6 0 0 0-12 0c0 4.5-1.4 6-2.7 7.3"/>',
  card: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="10" r="2"/><path d="M7 21v-1a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
};
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <aside
      class="fixed inset-y-0 left-0 z-30 hidden flex-col bg-sidebar text-white/90 transition-[width] duration-300 ease-in-out md:flex"
      :class="collapsed ? 'w-[76px]' : 'w-64'">
      <!-- Logo + toggle -->
      <div class="flex items-center gap-2 px-4 py-5" :class="collapsed ? 'justify-center px-0' : 'justify-between'">
        <div class="flex items-center gap-2 overflow-hidden">
          <div
            class="sidebar-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            <img src="../images/Vector.svg" alt="S" class="h-4 w-4" />
          </div>
          <Transition name="label-fade">
            <span v-if="!collapsed" class="whitespace-nowrap text-lg font-semibold">saven</span>
          </Transition>
        </div>

        <Transition name="label-fade">
          <button v-if="!collapsed" type="button" @click="toggleSidebar"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Sidebarni yig'ish">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" v-html="ICONS.panel"></svg>
          </button>
        </Transition>
      </div>

      <!-- Yig'ilgan holatdagi toggle (icon markazda) -->
      <button v-if="collapsed" type="button" @click="toggleSidebar"
        class="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Sidebarni yoyish">
        <svg viewBox="0 0 24 24" class="h-4 w-4 rotate-180" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round" v-html="ICONS.panel"></svg>
      </button>

      <!-- Profil / biznes kartasi -->
      <RouterLink to="/profil"
        class="sidebar-pop mx-3 mb-2 flex items-center rounded-xl bg-sidebar-accent px-3 py-2.5 transition hover:bg-white/10"
        :class="collapsed ? 'justify-center' : 'justify-between'" style="animation-delay: 80ms">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {{ authStore.initials }}
          </div>
          <Transition name="label-fade">
            <span v-if="!collapsed" class="whitespace-nowrap text-sm font-medium">{{ businessName }}</span>
          </Transition>
        </div>
        <Transition name="label-fade">
          <svg v-if="!collapsed" viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-white/40" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            v-html="ICONS.chevron"></svg>
        </Transition>
      </RouterLink>

      <!-- Navigatsiya -->
      <nav class="mt-2 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        <div v-for="(group, idx) in navGroups" :key="idx">
          <Transition name="label-fade">
            <p v-if="group.label && !collapsed" class="mb-1.5 px-3 text-xs text-white/40">{{ group.label }}</p>
          </Transition>
          <ul class="space-y-0.5">
            <li v-for="item in group.items" :key="item.to" class="nav-item"
              :style="{ animationDelay: itemDelay(item) }">
              <RouterLink :to="item.to" :title="collapsed ? item.label : undefined"
                class="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200"
                :class="[
                  collapsed ? 'justify-center px-0' : '',
                  route.path === item.to
                    ? 'bg-sidebar-accent text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/5 hover:text-white hover:translate-x-0.5',
                ]">
                <svg viewBox="0 0 24 24"
                  class="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" fill="none"
                  stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                  v-html="ICONS[item.icon]"></svg>
                <Transition name="label-fade">
                  <span v-if="!collapsed" class="whitespace-nowrap">{{ item.label }}</span>
                </Transition>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Chiqish -->
      <button @click="authStore.logout(); $router.push('/login')" :title="collapsed ? 'Chiqish' : undefined"
        class="mx-3 mb-4 flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        :class="collapsed ? 'justify-center px-0' : ''">
        <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round" v-html="ICONS.logout"></svg>
        <Transition name="label-fade">
          <span v-if="!collapsed" class="whitespace-nowrap">Chiqish</span>
        </Transition>
      </button>
    </aside>

    <!-- Mobile top bar -->
    <div class="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-white md:hidden">
      <span class="text-lg font-semibold">saven</span>
      <RouterLink to="/profil"
        class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
        {{ authStore.initials }}
      </RouterLink>
    </div>
    <nav class="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t bg-white py-2 md:hidden">
      <RouterLink v-for="item in flatItems" :key="item.to" :to="item.to"
        class="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors"
        :class="route.path === item.to ? 'text-primary font-semibold' : 'text-muted'">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round" v-html="ICONS[item.icon]"></svg>
        {{ item.label }}
      </RouterLink>
    </nav>

    <main class="flex-1 pb-20 pt-16 transition-[margin] duration-300 ease-in-out md:pb-0 md:pt-0"
      :class="collapsed ? 'md:ml-[76px]' : 'md:ml-64'">
      <div class="mx-auto max-w-7xl p-4 md:p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Logotip va profil kartasi kirishda birozgina "sakraydi" */
.sidebar-pop {
  animation: pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(-4px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Nav elementlari birin-ketin, chapdan sirg'alib kiradi */
.nav-item {
  animation: nav-in 0.4s ease both;
}

@keyframes nav-in {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Yig'ilganda matnlar yumshoq yo'qoladi, yoyilganda paydo bo'ladi */
.label-fade-enter-active {
  transition: opacity 0.2s ease 0.12s, transform 0.2s ease 0.12s;
}

.label-fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}

@media (prefers-reduced-motion: reduce) {

  .sidebar-pop,
  .nav-item {
    animation: none !important;
  }

  .label-fade-enter-active,
  .label-fade-leave-active {
    transition: none !important;
  }
}
</style>