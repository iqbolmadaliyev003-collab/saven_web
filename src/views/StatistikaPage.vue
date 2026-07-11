<script setup>
import { ref, onMounted, watch } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import AppCard from "@/components/AppCard.vue";
import { statistikaApi } from "@/api";

function fmt(n) {
  return Number(n || 0).toLocaleString("ru-RU");
}
function initials(name) {
  return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const ranges = [
  { label: "Hafta", days: 7 },
  { label: "Oy", days: 30 },
  { label: "Yil", days: 365 },
];
const range = ref(ranges[1]);

const totals = ref({ totalVisits: 0, avgCheck: 0, totalIncome: 0, discountsGiven: 0 });
const weekdays = ref([]);
const topServices = ref([]);
const activeClients = ref([]);
const maxVisits = ref(1);

async function load() {
  const data = await statistikaApi.summary(range.value.days);
  totals.value = data;
  topServices.value = data.topServices || [];
  activeClients.value = data.activeClients || [];
}

onMounted(load);
watch(range, load);
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4">
      <AppCard class="flex flex-wrap items-center justify-between gap-3 p-5">
        <h1 class="text-xl font-bold">Statistika</h1>
        <div class="flex gap-1 rounded-full bg-secondary p-1">
          <button
            v-for="r in ranges"
            :key="r.label"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="range.label === r.label ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-gray-900'"
            @click="range = r"
          >
            {{ r.label }}
          </button>
        </div>
      </AppCard>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AppCard class="p-4">
          <p class="text-xs text-muted">Jami tashrif</p>
          <p class="mt-1 text-2xl font-bold">{{ totals.totalVisits }}</p>
        </AppCard>
        <AppCard class="p-4">
          <p class="text-xs text-muted">O'rtacha xaridlar cheki</p>
          <p class="mt-1 text-2xl font-bold">{{ fmt(totals.avgCheck) }} so'm</p>
        </AppCard>
        <AppCard class="p-4">
          <p class="text-xs text-muted">Jami daromad</p>
          <p class="mt-1 text-2xl font-bold">{{ fmt(totals.totalIncome) }} so'm</p>
        </AppCard>
        <AppCard class="p-4">
          <p class="text-xs text-muted">Berilgan chegirma</p>
          <p class="mt-1 text-2xl font-bold">{{ totals.discountsGiven }} ta</p>
        </AppCard>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <AppCard class="p-5 lg:col-span-2">
          <h2 class="mb-4 font-semibold">Haftalik tashriflar</h2>
          <div class="flex h-64 items-end justify-between gap-2">
            <div v-for="w in totals.weekdayVisits" :key="w.day" class="flex flex-1 flex-col items-center gap-1">
              <div
                class="w-full rounded-t-lg bg-primary transition-all"
                :style="{ height: `${(w.visits / Math.max(1, ...(totals.weekdayVisits || [{visits:1}]).map(x=>x.visits))) * 200}px` }"
                :title="`${w.fullDay}: ${w.visits} tashrif`"
              ></div>
              <span class="text-xs text-muted">{{ w.day }}</span>
            </div>
            <p v-if="!totals.weekdayVisits?.length" class="w-full text-center text-sm text-muted">Ma'lumot yo'q</p>
          </div>
        </AppCard>

        <AppCard class="p-5">
          <h2 class="mb-4 font-semibold">Top xizmatlar</h2>
          <ul class="space-y-3">
            <li v-for="s in topServices" :key="s.name">
              <div class="mb-1 flex justify-between text-sm">
                <span>{{ s.name }}</span>
                <span class="text-muted">{{ s.count }} ta ({{ s.percent }}%)</span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div class="h-full rounded-full bg-primary" :style="{ width: `${s.percent}%` }"></div>
              </div>
            </li>
            <li v-if="!topServices.length" class="text-sm text-muted">Ma'lumot yo'q</li>
          </ul>
        </AppCard>
      </div>

      <AppCard class="p-5">
        <h2 class="mb-4 font-semibold">Eng faol mijozlar</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-muted">
                <th class="pb-2 font-normal">Mijoz</th>
                <th class="pb-2 font-normal">Tashrif</th>
                <th class="pb-2 font-normal">Chegirma oldi</th>
                <th class="pb-2 font-normal">Jami daromad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in activeClients" :key="c.name" class="border-b last:border-none">
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {{ initials(c.name) }}
                    </span>
                    {{ c.name }}
                  </div>
                </td>
                <td>{{ c.visits }}</td>
                <td>{{ fmt(c.totalDiscount) }} so'm</td>
                <td class="font-semibold">{{ fmt(c.totalIncome) }} so'm</td>
              </tr>
              <tr v-if="!activeClients.length">
                <td colspan="4" class="py-4 text-center text-muted">Ma'lumot yo'q</td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>
    </div>
  </DashboardLayout>
</template>
