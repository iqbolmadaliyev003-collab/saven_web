<script setup>
import { ref, onMounted, computed } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import AppCard from "@/components/AppCard.vue";
import { historyApi } from "@/api";
import { useToastStore } from "@/stores/toast";

const toast = useToastStore();

function fmt(n) {
  return Number(n || 0).toLocaleString("ru-RU");
}
function fmtDate(d) {
  return new Date(d).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const q = ref("");
const all = ref([]);
const loading = ref(true);
const filterOpen = ref(false);
const page = ref(1);
const pageSize = 10;

const dateFrom = ref("");
const dateTo = ref("");
const selectedCashiers = ref([]);
const serviceFilter = ref("");
const percentFilter = ref(null);

async function load() {
  loading.value = true;
  try {
    all.value = await historyApi.list();
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const cashierOptions = computed(() => [...new Set(all.value.map((r) => r.cashier_name).filter(Boolean))]);
const serviceOptions = computed(() => [...new Set(all.value.map((r) => r.service).filter(Boolean))]);

function toggleCashier(name) {
  const i = selectedCashiers.value.indexOf(name);
  if (i === -1) selectedCashiers.value.push(name);
  else selectedCashiers.value.splice(i, 1);
}

function clearFilters() {
  dateFrom.value = "";
  dateTo.value = "";
  selectedCashiers.value = [];
  serviceFilter.value = "";
  percentFilter.value = null;
}

function applyFilters() {
  page.value = 1;
  filterOpen.value = false;
}

const filtered = computed(() => {
  let rows = all.value;
  if (q.value) {
    const s = q.value.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.client_name.toLowerCase().includes(s) ||
        (r.cashier_name || "").toLowerCase().includes(s) ||
        r.service.toLowerCase().includes(s)
    );
  }
  if (dateFrom.value) rows = rows.filter((r) => new Date(r.created_at) >= new Date(dateFrom.value));
  if (dateTo.value) rows = rows.filter((r) => new Date(r.created_at) <= new Date(dateTo.value));
  if (selectedCashiers.value.length) rows = rows.filter((r) => selectedCashiers.value.includes(r.cashier_name));
  if (serviceFilter.value) rows = rows.filter((r) => r.service === serviceFilter.value);
  if (percentFilter.value) rows = rows.filter((r) => r.discount_percent === percentFilter.value);
  return rows;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));

function nextPage() {
  if (page.value < totalPages.value) page.value++;
}
function prevPage() {
  if (page.value > 1) page.value--;
}

function exportCsv() {
  if (!filtered.value.length) {
    toast.info("Yuklash uchun ma'lumot yo'q");
    return;
  }
  const header = ["Sana", "Mijoz", "Xizmat", "Kassir", "Chegirma", "Asl narx", "To'langan"];
  const rows = filtered.value.map((r) => [
    fmtDate(r.created_at),
    r.client_name,
    r.service,
    r.cashier_name || "",
    `${r.discount_percent}%`,
    r.original_price,
    r.final_price,
  ]);
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chegirma-tarixi.csv";
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Fayl yuklandi");
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4">
      <AppCard class="p-5">
        <h1 class="text-xl font-bold">Chegirmalar tarixi</h1>
      </AppCard>

      <AppCard class="p-5">
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <div class="relative min-w-[200px] flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
            <input
              v-model="q"
              placeholder="Qidirish"
              class="h-10 w-full rounded-full border-0 bg-input pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div class="relative">
            <button
              class="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
              @click="filterOpen = !filterOpen"
            >
              Filtr ▾
            </button>

            <div
              v-if="filterOpen"
              class="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-border bg-card p-4 shadow-xl"
              @click.self="filterOpen = false"
            >
              <div class="mb-3 flex items-center justify-between">
                <p class="text-sm font-semibold">Filtr</p>
                <button type="button" class="text-xs text-muted hover:text-gray-900" @click="clearFilters">Filtrni tozalash</button>
              </div>

              <label class="mb-1 block text-xs text-muted">Sana oralig'i</label>
              <div class="mb-3 flex items-center gap-2">
                <input v-model="dateFrom" type="date" class="h-9 w-full rounded-lg border border-border bg-input px-2 text-xs" />
                <span class="text-muted">—</span>
                <input v-model="dateTo" type="date" class="h-9 w-full rounded-lg border border-border bg-input px-2 text-xs" />
              </div>

              <label class="mb-1 block text-xs text-muted">Kassir</label>
              <div class="mb-3 space-y-1">
                <label v-for="c in cashierOptions" :key="c" class="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    class="h-4 w-4 accent-primary"
                    :checked="selectedCashiers.includes(c)"
                    @change="toggleCashier(c)"
                  />
                  {{ c }}
                </label>
                <p v-if="!cashierOptions.length" class="text-xs text-muted">Kassirlar topilmadi</p>
              </div>

              <label class="mb-1 block text-xs text-muted">Xizmat turi</label>
              <select v-model="serviceFilter" class="mb-3 h-9 w-full rounded-lg border border-border bg-input px-2 text-sm">
                <option value="">Tanlang</option>
                <option v-for="s in serviceOptions" :key="s" :value="s">{{ s }}</option>
              </select>

              <label class="mb-1 block text-xs text-muted">Chegirma foizi</label>
              <div class="mb-4 flex gap-2">
                <button
                  v-for="p in [5, 10, 15]"
                  :key="p"
                  type="button"
                  class="flex-1 rounded-lg border px-2 py-1.5 text-sm"
                  :class="percentFilter === p ? 'border-primary bg-accent text-accent-foreground' : 'border-border'"
                  @click="percentFilter = percentFilter === p ? null : p"
                >
                  {{ p }}%
                </button>
              </div>

              <button
                class="h-10 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                @click="applyFilters"
              >
                Qo'llash
              </button>
            </div>
          </div>

          <button
            class="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            @click="exportCsv"
          >
            ⬇ Yuklash
          </button>

          <span class="text-xs text-muted">{{ filtered.length }} ta natija</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-muted">
                <th class="pb-2 font-normal">Sana</th>
                <th class="pb-2 font-normal">Mijoz</th>
                <th class="pb-2 font-normal">Xizmat</th>
                <th class="pb-2 font-normal">Kassir</th>
                <th class="pb-2 font-normal">Chegirma</th>
                <th class="pb-2 font-normal">Asl narx</th>
                <th class="pb-2 font-normal">To'langan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in paged" :key="r.id" class="border-b last:border-none">
                <td class="py-3 text-muted">{{ fmtDate(r.created_at) }}</td>
                <td class="font-medium">{{ r.client_name }}</td>
                <td>{{ r.service }}</td>
                <td class="text-muted">{{ r.cashier_name || "—" }}</td>
                <td>
                  <span class="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {{ r.discount_percent }}%
                  </span>
                </td>
                <td class="text-muted line-through">{{ fmt(r.original_price) }}</td>
                <td class="font-semibold">{{ fmt(r.final_price) }} so'm</td>
              </tr>
              <tr v-if="!loading && !filtered.length">
                <td colspan="7" class="py-8 text-center text-muted">Natija topilmadi</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filtered.length" class="mt-4 flex items-center justify-between text-sm">
          <span class="text-muted">Natija {{ filtered.length }} dan</span>
          <div class="flex items-center gap-3">
            <button
              class="rounded-full border border-border px-3 py-1.5 disabled:opacity-40"
              :disabled="page === 1"
              @click="prevPage"
            >
              ‹
            </button>
            <button
              class="rounded-full bg-primary px-4 py-1.5 font-medium text-primary-foreground disabled:opacity-60"
              :disabled="page === totalPages"
              @click="nextPage"
            >
              Keyingi ›
            </button>
            <span class="text-muted">Sahifa {{ page }} / {{ totalPages }}</span>
          </div>
        </div>
      </AppCard>
    </div>
  </DashboardLayout>
</template>
