<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import AppCard from "@/components/AppCard.vue";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { businessApi } from "@/api";

const authStore = useAuthStore();
const toast = useToastStore();
const router = useRouter();

const loading = ref(true);
const saving = ref(false);
const logoutConfirmOpen = ref(false);
const form = reactive({ name: "", category: "", address: "", phone: "", email: "", description: "" });

onMounted(async () => {
  loading.value = true;
  try {
    const b = await authStore.fetchProfile();
    Object.assign(form, b);
  } finally {
    loading.value = false;
  }
});

async function save() {
  saving.value = true;
  try {
    const updated = await businessApi.update(form);
    authStore.business = updated;
    toast.success("Profil yangilandi");
  } catch (e) {
    toast.error("Xatolik yuz berdi");
  } finally {
    saving.value = false;
  }
}

function logout() {
  authStore.logout();
  router.push("/login");
  logoutConfirmOpen.value = false;
}

function initials(name) {
  return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function fmt(n) {
  return Number(n || 0).toLocaleString("ru-RU");
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4">
      <AppCard class="flex items-center justify-between p-5">
        <h1 class="text-xl font-bold">Profil</h1>
        <button
          type="submit"
          form="profil-form"
          :disabled="saving"
          class="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {{ saving ? "Saqlanmoqda..." : "Saqlash" }}
        </button>
      </AppCard>

      <div class="grid gap-4 lg:grid-cols-3">
        <AppCard class="p-6 lg:col-span-2">
          <div class="mb-6 flex items-center gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {{ initials(form.name) }}
            </div>
            <div>
              <p class="text-lg font-semibold">{{ form.name || "—" }}</p>
              <p class="flex items-center gap-1.5 text-sm text-success">
                <span class="h-2 w-2 rounded-full bg-success"></span>Faol
              </p>
            </div>
          </div>

          <form id="profil-form" class="grid gap-4 md:grid-cols-2" @submit.prevent="save">
            <div>
              <label class="text-sm font-medium">Biznes nomi</label>
              <input v-model="form.name" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium">Kategoriya</label>
              <input v-model="form.category" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium">Telefon</label>
              <input v-model="form.phone" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium">Email</label>
              <input v-model="form.email" type="email" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
            </div>
            <div class="md:col-span-2">
              <label class="text-sm font-medium">Manzil</label>
              <input v-model="form.address" class="mt-1 h-11 w-full rounded-lg border border-border bg-input px-3 text-sm" />
            </div>
            <div class="md:col-span-2">
              <label class="text-sm font-medium">Tavsif</label>
              <textarea v-model="form.description" rows="3" class="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"></textarea>
            </div>
          </form>
        </AppCard>

        <div class="space-y-4">
          <AppCard class="p-5">
            <h2 class="mb-3 font-semibold">Statistika (jami)</h2>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted">Jami tashrif</span>
                <span class="font-semibold">{{ fmt(authStore.business?.total_visits) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Mijozlar soni</span>
                <span class="font-semibold">{{ fmt(authStore.business?.total_clients) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Tejagan summa</span>
                <span class="font-semibold">{{ fmt(authStore.business?.total_saved) }} so'm</span>
              </div>
            </div>
          </AppCard>

          <AppCard class="p-5">
            <h2 class="mb-1 font-semibold">Yordam</h2>
            <p class="mb-3 text-sm text-muted">
              Agar sizga texnik yordam kerak bo'lsa, qo'llab-quvvatlash jamoamizga murojaat qiling.
            </p>
            <button
              type="button"
              class="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-destructive text-sm font-semibold text-white hover:bg-destructive/90"
              @click="toast.info('+998 93 242 59 99')"
            >
              ☎ Bog'lanish
            </button>
            <button
              type="button"
              class="flex h-11 w-full items-center justify-center gap-1 rounded-full border border-border text-sm font-medium text-destructive hover:bg-red-50"
              @click="logoutConfirmOpen = true"
            >
              ⏻ Chiqish
            </button>
          </AppCard>
        </div>
      </div>
    </div>

    <div
      v-if="logoutConfirmOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="logoutConfirmOpen = false"
    >
      <div class="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-destructive">
          ⏻
        </div>
        <h2 class="text-lg font-semibold">Tizimdan chiqishni xohlaysizmi?</h2>
        <div class="mt-5 flex gap-2">
          <button
            class="h-11 flex-1 rounded-full border border-border text-sm font-medium hover:bg-secondary"
            @click="logoutConfirmOpen = false"
          >
            Orqaga
          </button>
          <button
            class="h-11 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            @click="logout"
          >
            Chiqish
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
