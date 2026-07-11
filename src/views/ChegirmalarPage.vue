<script setup>
import { ref, onMounted, reactive } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import AppCard from "@/components/AppCard.vue";
import AppModal from "@/components/AppModal.vue";
import { discountsApi } from "@/api";
import { useToastStore } from "@/stores/toast";

const toast = useToastStore();
const CATEGORIES = ["Standart", "Premium", "Maxsus taklif", "VIP", "Tug'ilgan kun"];

const items = ref([]);
const loading = ref(true);
const addOpen = ref(false);
const editItem = ref(null);
const deleteItem = ref(null);

const form = reactive({ category: "Standart", description: "", percent: 5, min_purchase: 0, active: true });

function resetForm() {
  form.category = "Standart";
  form.description = "";
  form.percent = 5;
  form.min_purchase = 0;
  form.active = true;
}

async function load() {
  loading.value = true;
  try {
    items.value = await discountsApi.list();
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function toggle(d) {
  await discountsApi.toggleActive(d.id);
  await load();
}

function openEdit(d) {
  editItem.value = d;
  form.category = d.category;
  form.description = d.description;
  form.percent = d.percent;
  form.min_purchase = d.min_purchase;
  form.active = d.active;
}

async function submitAdd() {
  try {
    await discountsApi.create({ ...form });
    toast.success("Chegirma qo'shildi");
    addOpen.value = false;
    resetForm();
    await load();
  } catch (e) {
    toast.error("Xatolik yuz berdi");
  }
}

async function submitEdit() {
  try {
    await discountsApi.update(editItem.value.id, { ...form });
    toast.success("Chegirma yangilandi");
    editItem.value = null;
    await load();
  } catch (e) {
    toast.error("Xatolik yuz berdi");
  }
}

async function confirmDelete() {
  try {
    await discountsApi.remove(deleteItem.value.id);
    toast.success("Chegirma o'chirildi");
    deleteItem.value = null;
    await load();
  } catch (e) {
    toast.error("Xatolik yuz berdi");
  }
}

function fmt(n) {
  return Number(n || 0).toLocaleString("ru-RU");
}

const ICONS = {
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
};
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4">
      <AppCard class="reveal flex items-center justify-between p-5" style="--d: 0ms">
        <h1 class="text-xl font-bold">Chegirmalar</h1>
        <button
          class="group flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-95"
          @click="resetForm(); addOpen = true">
          <svg viewBox="0 0 24 24" class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" fill="none"
            stroke="currentColor" stroke-width="2.2" stroke-linecap="round" v-html="ICONS.plus"></svg>
          Qo'shish
        </button>
      </AppCard>

      <!-- Skeleton yuklanish holati -->
      <div v-if="loading" class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <AppCard v-for="n in 3" :key="n" class="skeleton-card p-4">
          <div class="flex items-start justify-between">
            <div class="space-y-2">
              <div class="skeleton h-4 w-24 rounded"></div>
              <div class="skeleton h-3 w-32 rounded"></div>
            </div>
            <div class="skeleton h-7 w-12 rounded"></div>
          </div>
          <div class="skeleton mt-4 h-3 w-28 rounded"></div>
          <div class="mt-4 flex items-center justify-between">
            <div class="skeleton h-6 w-16 rounded-full"></div>
            <div class="flex gap-1">
              <div class="skeleton h-8 w-8 rounded-lg"></div>
              <div class="skeleton h-8 w-8 rounded-lg"></div>
            </div>
          </div>
        </AppCard>
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <AppCard v-for="(d, i) in items" :key="d.id"
          class="reveal p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          :style="{ '--d': `${i * 70}ms` }">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold">{{ d.category }}</p>
              <p class="text-xs text-muted">{{ d.description }}</p>
            </div>
            <p class="percent-pop text-2xl font-bold text-success">{{ d.percent }}%</p>
          </div>
          <p class="mt-3 text-xs text-muted">
            <template v-if="d.min_purchase > 0">Minimal xarid: {{ fmt(d.min_purchase) }} so'm<br /></template>
            {{ d.usage_count }} marta ishlatilgan
          </p>
          <div class="mt-3 flex items-center justify-between">
            <button type="button" role="switch" :aria-checked="d.active" class="flex items-center gap-2 text-sm"
              @click="toggle(d)">
              <span
                class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300"
                :class="d.active ? 'bg-primary' : 'bg-gray-300'">
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]"
                  :class="d.active ? 'translate-x-4' : 'translate-x-0.5'"></span>
              </span>
              <span :class="d.active ? 'text-gray-900' : 'text-muted'">{{ d.active ? "Faol" : "Nofaol" }}</span>
            </button>
            <div class="flex gap-1">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                title="Tahrirlash" @click="openEdit(d)">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round" v-html="ICONS.edit"></svg>
              </button>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-destructive transition-all duration-200 hover:-translate-y-0.5 hover:border-destructive hover:bg-red-50"
                title="O'chirish" @click="deleteItem = d">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round" v-html="ICONS.trash"></svg>
              </button>
            </div>
          </div>
        </AppCard>
        <p v-if="!items.length" class="col-span-full py-8 text-center text-muted">Hozircha chegirma yo'q</p>
      </div>
    </div>

    <AppModal :open="addOpen" title="Chegirma qo'shish" @close="addOpen = false">
      <form class="space-y-3" @submit.prevent="submitAdd">
        <div class="field-in" style="--d: 0ms">
          <label class="text-sm font-medium">Kategoriya</label>
          <select v-model="form.category"
            class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm transition-shadow focus:ring-2 focus:ring-primary/40">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="field-in" style="--d: 60ms">
          <label class="text-sm font-medium">Tavsif</label>
          <input v-model="form.description"
            class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm transition-shadow focus:ring-2 focus:ring-primary/40" />
        </div>
        <div class="field-in grid grid-cols-2 gap-3" style="--d: 120ms">
          <div>
            <label class="text-sm font-medium">Foiz (%)</label>
            <input v-model.number="form.percent" type="number" min="0" max="100"
              class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm transition-shadow focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label class="text-sm font-medium">Minimal xarid</label>
            <input v-model.number="form.min_purchase" type="number" min="0"
              class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm transition-shadow focus:ring-2 focus:ring-primary/40" />
          </div>
        </div>
        <label class="field-in flex items-center gap-2 text-sm" style="--d: 180ms">
          <input v-model="form.active" type="checkbox" class="h-4 w-4 accent-primary" /> Faol
        </label>
        <button type="submit"
          class="field-in h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          style="--d: 220ms">
          Saqlash
        </button>
      </form>
    </AppModal>

    <AppModal :open="!!editItem" title="Chegirmani tahrirlash" @close="editItem = null">
      <form class="space-y-3" @submit.prevent="submitEdit">
        <div class="field-in" style="--d: 0ms">
          <label class="text-sm font-medium">Kategoriya</label>
          <select v-model="form.category"
            class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm transition-shadow focus:ring-2 focus:ring-primary/40">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="field-in" style="--d: 60ms">
          <label class="text-sm font-medium">Tavsif</label>
          <input v-model="form.description"
            class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm transition-shadow focus:ring-2 focus:ring-primary/40" />
        </div>
        <div class="field-in grid grid-cols-2 gap-3" style="--d: 120ms">
          <div>
            <label class="text-sm font-medium">Foiz (%)</label>
            <input v-model.number="form.percent" type="number" min="0" max="100"
              class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm transition-shadow focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label class="text-sm font-medium">Minimal xarid</label>
            <input v-model.number="form.min_purchase" type="number" min="0"
              class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm transition-shadow focus:ring-2 focus:ring-primary/40" />
          </div>
        </div>
        <label class="field-in flex items-center gap-2 text-sm" style="--d: 180ms">
          <input v-model="form.active" type="checkbox" class="h-4 w-4 accent-primary" /> Faol
        </label>
        <button type="submit"
          class="field-in h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          style="--d: 220ms">
          Yangilash
        </button>
      </form>
    </AppModal>

    <AppModal :open="!!deleteItem" title="O'chirishni tasdiqlang" @close="deleteItem = null">
      <p class="field-in text-sm text-muted" style="--d: 0ms">
        "{{ deleteItem?.category }}" chegirmasini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
      </p>
      <div class="field-in mt-4 flex justify-end gap-2" style="--d: 60ms">
        <button class="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
          @click="deleteItem = null">Bekor qilish</button>
        <button class="rounded-full bg-destructive px-4 py-2 text-sm text-white transition-transform active:scale-95"
          @click="confirmDelete">O'chirish</button>
      </div>
    </AppModal>
  </DashboardLayout>
</template>

<style scoped>
.reveal {
  animation: reveal-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
}

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.percent-pop {
  animation: percent-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}

@keyframes percent-pop {
  from {
    opacity: 0;
    transform: scale(0.7);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.field-in {
  animation: field-in 0.35s ease both;
  animation-delay: var(--d, 0ms);
}

@keyframes field-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Skeleton shimmer */
.skeleton {
  position: relative;
  overflow: hidden;
  background: #e5e7eb;
}

.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-card {
  animation: reveal-up 0.4s ease both;
}

@media (prefers-reduced-motion: reduce) {

  .reveal,
  .percent-pop,
  .field-in,
  .skeleton::after,
  .skeleton-card {
    animation: none !important;
  }
}
</style>