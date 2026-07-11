<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import AppCard from "@/components/AppCard.vue";
import AppModal from "@/components/AppModal.vue";
import { cashiersApi } from "@/api";
import { useToastStore } from "@/stores/toast";

const toast = useToastStore();

const items = ref([]);
const loading = ref(true);
const addOpen = ref(false);
const editItem = ref(null);
const deleteItem = ref(null);
const revealedId = ref(null);

const form = reactive({ name: "", phone: "", login: "", password: "", active: true });

function resetForm() {
  form.name = "";
  form.phone = "";
  form.login = "";
  form.password = "";
  form.active = true;
}

function initials(name) {
  return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const activeCount = computed(() => items.value.filter((c) => c.active).length);

async function load() {
  loading.value = true;
  try {
    items.value = await cashiersApi.list();
  } finally {
    loading.value = false;
  }
}
onMounted(load);

function openEdit(c) {
  editItem.value = c;
  form.name = c.name;
  form.phone = c.phone;
  form.login = c.login;
  form.password = "";
  form.active = c.active;
}

async function submitAdd() {
  try {
    await cashiersApi.create({ ...form });
    toast.success("Kassir qo'shildi");
    addOpen.value = false;
    resetForm();
    await load();
  } catch (e) {
    toast.error(e.response?.data?.login?.[0] || "Xatolik yuz berdi");
  }
}

async function submitEdit() {
  try {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    await cashiersApi.update(editItem.value.id, payload);
    toast.success("Kassir yangilandi");
    editItem.value = null;
    await load();
  } catch (e) {
    toast.error("Xatolik yuz berdi");
  }
}

async function confirmDelete() {
  try {
    await cashiersApi.remove(deleteItem.value.id);
    toast.success("Kassir o'chirildi");
    deleteItem.value = null;
    await load();
  } catch (e) {
    toast.error("Xatolik yuz berdi");
  }
}

async function toggleActive(c) {
  await cashiersApi.toggleActive(c.id);
  await load();
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("uz-UZ");
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4">
      <AppCard class="flex items-center justify-between p-5">
        <div>
          <h1 class="text-xl font-bold">Kassirlar</h1>
          <p class="text-xs text-muted">Jami: {{ items.length }} ta kassir / {{ activeCount }} ta Faol</p>
        </div>
        <button
          class="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          @click="resetForm(); addOpen = true"
        >
          + Qo'shish
        </button>
      </AppCard>

      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <AppCard v-for="c in items" :key="c.id" class="p-4">
          <div class="mb-3 flex items-start justify-between">
            <div class="flex items-center gap-2">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                {{ initials(c.name) }}
              </span>
              <div>
                <p class="font-semibold leading-tight">{{ c.name }}</p>
                <p class="text-xs text-muted">{{ c.phone }}</p>
              </div>
            </div>
            <span class="text-xs font-medium">
              <span class="mr-1 inline-block h-2 w-2 rounded-full" :class="c.active ? 'bg-success' : 'bg-muted'"></span>
              {{ c.active ? "Faol" : "Nofaol" }}
            </span>
          </div>
          <div class="mb-3 grid grid-cols-2 gap-2">
            <div class="rounded-lg bg-secondary p-3">
              <p class="text-lg font-bold">{{ c.scans }}</p>
              <p class="text-xs text-muted">Skaner</p>
            </div>
            <div class="rounded-lg bg-secondary p-3">
              <p class="text-sm font-semibold">{{ fmtDate(c.added_date) }}</p>
              <p class="text-xs text-muted">Qo'shildi</p>
            </div>
          </div>
          <div class="mb-3 rounded-lg bg-secondary p-3 text-sm">
            <p class="text-xs text-muted">Login</p>
            <p class="font-semibold">{{ c.login }}</p>
            <p class="mt-1 text-xs text-muted">Parol</p>
            <div class="flex items-center justify-between">
              <span class="font-semibold">••••••••••</span>
              <label class="flex items-center gap-1 text-xs">
                <input type="checkbox" :checked="c.active" class="h-4 w-4 accent-primary" @change="toggleActive(c)" />
                {{ c.active ? "Faol" : "Nofaol" }}
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-1">
            <button class="rounded p-1.5 hover:bg-secondary" title="Tahrirlash" @click="openEdit(c)">✎</button>
            <button class="rounded p-1.5 text-destructive hover:bg-red-50" title="O'chirish" @click="deleteItem = c">🗑</button>
          </div>
        </AppCard>
        <p v-if="!loading && !items.length" class="col-span-full py-8 text-center text-muted">Hozircha kassir yo'q</p>
      </div>
    </div>

    <AppModal :open="addOpen" title="Kassir qo'shish" @close="addOpen = false">
      <form class="space-y-3" @submit.prevent="submitAdd">
        <div>
          <label class="text-sm font-medium">Ism familiya</label>
          <input v-model="form.name" required class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
        </div>
        <div>
          <label class="text-sm font-medium">Telefon</label>
          <input v-model="form.phone" placeholder="+998 90 123 45 67" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
        </div>
        <div>
          <label class="text-sm font-medium">Login</label>
          <input v-model="form.login" required class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
        </div>
        <div>
          <label class="text-sm font-medium">Parol</label>
          <input v-model="form.password" type="password" required class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
        </div>
        <button type="submit" class="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Saqlash
        </button>
      </form>
    </AppModal>

    <AppModal :open="!!editItem" title="Kassirni tahrirlash" @close="editItem = null">
      <form class="space-y-3" @submit.prevent="submitEdit">
        <div>
          <label class="text-sm font-medium">Ism familiya</label>
          <input v-model="form.name" required class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
        </div>
        <div>
          <label class="text-sm font-medium">Telefon</label>
          <input v-model="form.phone" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
        </div>
        <div>
          <label class="text-sm font-medium">Login</label>
          <input v-model="form.login" required class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
        </div>
        <div>
          <label class="text-sm font-medium">Yangi parol (ixtiyoriy)</label>
          <input v-model="form.password" type="password" placeholder="O'zgartirmaslik uchun bo'sh qoldiring" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
        </div>
        <button type="submit" class="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Yangilash
        </button>
      </form>
    </AppModal>

    <AppModal :open="!!deleteItem" title="O'chirishni tasdiqlang" @close="deleteItem = null">
      <p class="text-sm text-muted">"{{ deleteItem?.name }}" kassirini o'chirmoqchimisiz?</p>
      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded-full border border-border px-4 py-2 text-sm" @click="deleteItem = null">Bekor qilish</button>
        <button class="rounded-full bg-destructive px-4 py-2 text-sm text-white" @click="confirmDelete">O'chirish</button>
      </div>
    </AppModal>
  </DashboardLayout>
</template>
