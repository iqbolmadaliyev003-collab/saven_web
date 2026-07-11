<script setup>
import { ref, onMounted } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import AppCard from "@/components/AppCard.vue";
import { RouterLink } from "vue-router";
import { dashboardApi, notificationsApi } from "@/api";

function fmt(n) {
  return Number(n || 0).toLocaleString("ru-RU");
}

const loading = ref(true);
const stats = ref({ todayVisits: 0, avgCheck: 0, todayIncome: 0, topDiscount: 0 });
const weekdays = ref([]);
const recent = ref([]);
const notifications = ref([]);

const today = new Date().toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });

function initials(name) {
  return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const maxVisits = ref(1);

async function load() {
  loading.value = true;
  try {
    const [dash, notifs] = await Promise.all([dashboardApi.stats(), notificationsApi.list()]);
    stats.value = dash;
    weekdays.value = dash.weekdayVisits || [];
    recent.value = dash.recentClients || [];
    notifications.value = notifs.slice(0, 4);
    maxVisits.value = Math.max(1, ...weekdays.value.map((w) => w.visits));
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4">
      <AppCard class="p-5">
        <h1 class="text-xl font-bold">Asosiy</h1>
        <p class="text-sm text-muted capitalize">Bugun, {{ today }}</p>
      </AppCard>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AppCard class="p-4">
          <p class="text-xs text-muted">Bugungi tashrif</p>
          <p class="mt-1 text-2xl font-bold">{{ stats.todayVisits }}</p>
        </AppCard>
        <AppCard class="p-4">
          <p class="text-xs text-muted">O'rtacha xaridlar cheki</p>
          <p class="mt-1 text-2xl font-bold">{{ fmt(stats.avgCheck) }} so'm</p>
        </AppCard>
        <AppCard class="p-4">
          <p class="text-xs text-muted">Bugungi daromad</p>
          <p class="mt-1 text-2xl font-bold">{{ fmt(stats.todayIncome) }} so'm</p>
        </AppCard>
        <AppCard class="p-4">
          <p class="text-xs text-muted">Eng ko'p qo'llanilgan chegirma</p>
          <p class="mt-1 text-2xl font-bold">{{ stats.topDiscount }}%</p>
        </AppCard>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <AppCard class="p-5 lg:col-span-2">
          <h2 class="mb-4 font-semibold">Haftalik tashriflar</h2>
          <div class="flex h-64 items-end justify-between gap-2">
            <div v-for="w in weekdays" :key="w.day" class="flex flex-1 flex-col items-center gap-1">
              <div
                class="w-full rounded-t-lg bg-primary transition-all"
                :style="{ height: `${(w.visits / maxVisits) * 200}px` }"
                :title="`${w.fullDay}: ${w.visits} tashrif`"
              ></div>
              <span class="text-xs text-muted">{{ w.day }}</span>
            </div>
          </div>
        </AppCard>

        <AppCard class="p-5">
          <h2 class="mb-3 flex items-center gap-2 font-semibold">🔔 Bildirishnomalar</h2>
          <ul class="space-y-3">
            <li v-for="n in notifications" :key="n.id" class="flex items-start justify-between gap-2 text-sm">
              <div>
                <p class="font-medium">{{ n.title }}</p>
                <p class="text-xs text-muted">{{ n.description }}</p>
              </div>
              <span v-if="!n.read" class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-success"></span>
            </li>
            <li v-if="!notifications.length" class="text-sm text-muted">Bildirishnomalar yo'q</li>
          </ul>
          <RouterLink
            to="/bildirishnomalar"
            class="mt-3 flex w-full items-center justify-center rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            Barchasini ko'rish ›
          </RouterLink>
        </AppCard>
      </div>

      <AppCard class="p-5">
        <h2 class="mb-4 font-semibold">Oxirgi mijozlar</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-muted">
                <th class="pb-2 font-normal">Mijoz</th>
                <th class="pb-2 font-normal">Xizmat</th>
                <th class="pb-2 font-normal">Chegirma</th>
                <th class="pb-2 font-normal">Asl narx (so'm)</th>
                <th class="pb-2 font-normal">To'langan (so'm)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in recent" :key="i" class="border-b last:border-none">
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {{ initials(r.name) }}
                    </span>
                    {{ r.name }}
                  </div>
                </td>
                <td>{{ r.service }}</td>
                <td>
                  <span class="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {{ r.discountPercent }}%
                  </span>
                </td>
                <td class="text-muted line-through">{{ fmt(r.originalPrice) }}</td>
                <td class="font-semibold">{{ fmt(r.finalPrice) }}</td>
              </tr>
              <tr v-if="!recent.length">
                <td colspan="5" class="py-4 text-center text-muted">Hozircha ma'lumot yo'q</td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>
    </div>
  </DashboardLayout>
</template>
