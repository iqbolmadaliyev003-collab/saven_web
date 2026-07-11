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
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4">
      <AppCard class="flex items-center justify-between p-5">
        <h1 class="text-xl font-bold">Chegirmalar</h1>
        <button
          class="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          @click="resetForm(); addOpen = true"
        >
          + Qo'shish
        </button>
      </AppCard>

      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <AppCard v-for="d in items" :key="d.id" class="p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold">{{ d.category }}</p>
              <p class="text-xs text-muted">{{ d.description }}</p>
            </div>
            <p class="text-2xl font-bold text-success">{{ d.percent }}%</p>
          </div>
          <p class="mt-3 text-xs text-muted">
            <template v-if="d.min_purchase > 0">Minimal xarid: {{ fmt(d.min_purchase) }} so'm<br /></template>
            {{ d.usage_count }} marta ishlatilgan
          </p>
          <div class="mt-3 flex items-center justify-between">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" :checked="d.active" class="h-4 w-4 accent-primary" @change="toggle(d)" />
              {{ d.active ? "Faol" : "Nofaol" }}
            </label>
            <div class="flex gap-1">
              <button class="rounded p-1.5 hover:bg-secondary" title="Tahrirlash" @click="openEdit(d)">✎</button>
              <button class="rounded p-1.5 text-destructive hover:bg-red-50" title="O'chirish" @click="deleteItem = d">🗑</button>
            </div>
          </div>
        </AppCard>
        <p v-if="!loading && !items.length" class="col-span-full text-center text-muted py-8">Hozircha chegirma yo'q</p>
      </div>
    </div>

    <AppModal :open="addOpen" title="Chegirma qo'shish" @close="addOpen = false">
      <form class="space-y-3" @submit.prevent="submitAdd">
        <div>
          <label class="text-sm font-medium">Kategoriya</label>
          <select v-model="form.category" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium">Tavsif</label>
          <input v-model="form.description" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium">Foiz (%)</label>
            <input v-model.number="form.percent" type="number" min="0" max="100" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
          </div>
          <div>
            <label class="text-sm font-medium">Minimal xarid</label>
            <input v-model.number="form.min_purchase" type="number" min="0" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.active" type="checkbox" class="h-4 w-4 accent-primary" /> Faol
        </label>
        <button type="submit" class="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Saqlash
        </button>
      </form>
    </AppModal>

    <AppModal :open="!!editItem" title="Chegirmani tahrirlash" @close="editItem = null">
      <form class="space-y-3" @submit.prevent="submitEdit">
        <div>
          <label class="text-sm font-medium">Kategoriya</label>
          <select v-model="form.category" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium">Tavsif</label>
          <input v-model="form.description" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium">Foiz (%)</label>
            <input v-model.number="form.percent" type="number" min="0" max="100" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
          </div>
          <div>
            <label class="text-sm font-medium">Minimal xarid</label>
            <input v-model.number="form.min_purchase" type="number" min="0" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.active" type="checkbox" class="h-4 w-4 accent-primary" /> Faol
        </label>
        <button type="submit" class="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Yangilash
        </button>
      </form>
    </AppModal>

    <AppModal :open="!!deleteItem" title="O'chirishni tasdiqlang" @close="deleteItem = null">
      <p class="text-sm text-muted">
        "{{ deleteItem?.category }}" chegirmasini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded-full border border-border px-4 py-2 text-sm" @click="deleteItem = null">Bekor qilish</button>
        <button class="rounded-full bg-destructive px-4 py-2 text-sm text-white" @click="confirmDelete">O'chirish</button>
      </div>
    </AppModal>
  </DashboardLayout>
</template>
