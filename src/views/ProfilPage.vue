<script setup>
import { reactive, ref, onMounted, computed } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import AppCard from "@/components/AppCard.vue";
import AppModal from "@/components/AppModal.vue";
import { useToastStore } from "@/stores/toast";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { businessApi, dashboardApi } from "@/api";

const toast = useToastStore();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);

// Backend BusinessSerializer maydonlari: name, description, phone_number, email,
// full_address (category, logo, website va h.k. ham bor, lekin bu forma
// asosiylarini tahrirlaydi).
const profile = reactive({
  name: "",
  description: "",
  full_address: "",
  phone_number: "",
  email: "",
});
const categoryName = ref("");
const cashiersCount = ref(0);

const initials = computed(() =>
  (profile.name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
);

const saving = ref(false);

async function load() {
  loading.value = true;
  try {
    const [business, dash] = await Promise.all([businessApi.me(), dashboardApi.stats()]);
    profile.name = business.name || "";
    profile.description = business.description || "";
    profile.full_address = business.full_address || "";
    profile.phone_number = business.phone_number || "";
    profile.email = business.email || "";
    categoryName.value = business.category?.name || "—";
    cashiersCount.value = business.cashiers_count ?? 0;
    stats.customers = dash.total_customers ?? 0;
    stats.todayRevenue = dash.today_revenue ?? 0;
    stats.activePercent = dash.active_discount_percent ?? 0;
  } catch (e) {
    toast.error("Ma'lumotni yuklashda xatolik");
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const stats = reactive({ customers: 0, todayRevenue: 0, activePercent: 0 });

function fmt(n) {
  return Number(n || 0).toLocaleString("ru-RU");
}

async function save() {
  saving.value = true;
  try {
    await businessApi.update({
      name: profile.name,
      description: profile.description,
      full_address: profile.full_address,
      phone_number: profile.phone_number,
      email: profile.email,
    });
    authStore.business = { ...authStore.business, name: profile.name };
    toast.success("O'zgarishlar saqlandi");
  } catch (e) {
    toast.error("Saqlashda xatolik yuz berdi");
  } finally {
    saving.value = false;
  }
}

const showLogoutModal = ref(false);
const loggingOut = ref(false);

function confirmLogout() {
  loggingOut.value = true;
  authStore.logout();
  setTimeout(() => {
    loggingOut.value = false;
    showLogoutModal.value = false;
    router.push("/login").catch(() => { });
  }, 300);
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 page-enter">
      <AppCard class="flex items-center justify-between p-5">
        <h1 class="text-xl font-bold tracking-tight">Profil</h1>
        <button
          class="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-95 disabled:opacity-70"
          :disabled="saving || loading" @click="save">
          <span v-if="!saving">Saqlash</span>
          <span v-else class="inline-flex items-center gap-2">
            <span
              class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"></span>
            Saqlanmoqda…
          </span>
        </button>
      </AppCard>

      <div class="grid gap-4 lg:grid-cols-[2fr_1fr] items-start">
        <!-- LEFT: profile card -->
        <AppCard class="p-6 transition-all duration-200 hover:shadow-lg rise" style="animation-delay: 0.05s">
          <div class="mb-5 flex items-center gap-4">
            <div class="relative h-[62px] w-[62px] shrink-0">
              <div class="absolute inset-0 rounded-full ring-glow"></div>
              <div
                class="absolute inset-[3px] flex items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
                {{ initials }}
              </div>
            </div>
            <div>
              <h2 class="text-lg font-semibold leading-tight">{{ profile.name || "—" }}</h2>
              <p class="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-success">
                <span class="relative inline-flex h-2 w-2 rounded-full bg-success">
                  <span class="absolute inset-0 rounded-full bg-success animate-pulse-dot"></span>
                </span>
                Faol
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-xs font-medium text-muted">Biznes nomi</label>
              <input v-model="profile.name" type="text" :disabled="loading"
                class="h-11 w-full rounded-lg border border-transparent bg-input px-3 text-sm outline-none transition-all duration-150 focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-muted">Kategoriya</label>
              <input :value="categoryName" type="text" disabled
                class="h-11 w-full cursor-not-allowed rounded-lg border border-transparent bg-input px-3 text-sm text-muted outline-none" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-muted">Manzil</label>
              <input v-model="profile.full_address" type="text" :disabled="loading"
                class="h-11 w-full rounded-lg border border-transparent bg-input px-3 text-sm outline-none transition-all duration-150 focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">Telefon</label>
                <input v-model="profile.phone_number" type="text" :disabled="loading"
                  class="h-11 w-full rounded-lg border border-transparent bg-input px-3 text-sm outline-none transition-all duration-150 focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">Email</label>
                <input v-model="profile.email" type="text" :disabled="loading"
                  class="h-11 w-full rounded-lg border border-transparent bg-input px-3 text-sm outline-none transition-all duration-150 focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
              </div>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-muted">Tavsif</label>
              <textarea v-model="profile.description" rows="3" :disabled="loading"
                class="w-full resize-none rounded-lg border border-transparent bg-input px-3 py-2.5 text-sm outline-none transition-all duration-150 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"></textarea>
            </div>
          </div>
        </AppCard>

        <!-- RIGHT: side cards -->
        <div class="space-y-4">
          <AppCard class="p-6 transition-all duration-200 hover:shadow-lg rise" style="animation-delay: 0.12s">
            <h3 class="mb-3 text-sm font-semibold">Statistika</h3>
            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-muted">Mijozlar soni (jami)</span>
              <span class="font-semibold tabular-nums">{{ fmt(stats.customers) }}</span>
            </div>
            <div class="h-px bg-border"></div>
            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-muted">Kassirlar soni</span>
              <span class="font-semibold tabular-nums">{{ fmt(cashiersCount) }}</span>
            </div>
            <div class="h-px bg-border"></div>
            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-muted">Bugungi daromad</span>
              <span class="font-semibold tabular-nums text-success">{{ fmt(stats.todayRevenue) }} so'm</span>
            </div>
            <div class="h-px bg-border"></div>
            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-muted">Joriy chegirma foizi</span>
              <span class="font-semibold tabular-nums">{{ stats.activePercent }}%</span>
            </div>
          </AppCard>

          <AppCard class="p-6 transition-all duration-200 hover:shadow-lg rise" style="animation-delay: 0.19s">
            <h3 class="mb-2 text-sm font-semibold">Yordam</h3>
            <p class="mb-4 text-sm text-muted">
              Agar sizga texnik yordam kerak bo'lsa, qo'llab-quvvatlash jamoamizga murojaat qiling.
            </p>

            <button
              class="mb-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-95">
              📞 Bog'lanish
            </button>

            <button
              class="flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-destructive transition-all duration-150 hover:bg-red-50 active:scale-95"
              @click="showLogoutModal = true">
              ↪ Chiqish
            </button>
          </AppCard>
        </div>
      </div>
    </div>

    <AppModal :open="showLogoutModal" title="Tizimdan chiqish" @close="showLogoutModal = false">
      <div class="flex flex-col items-center gap-3 py-2 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
          🔌
        </div>
        <h3 class="text-base font-semibold">Siz tizimdan chiqishni xohlaysizmi?</h3>
        <p class="text-sm text-muted">Agar davom etsangiz, siz qayta tizimga kirishingiz kerak bo'ladi.</p>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button
          class="rounded-full border border-border px-4 py-2 text-sm transition-colors duration-150 hover:bg-secondary"
          :disabled="loggingOut" @click="showLogoutModal = false">
          Orqaga
        </button>
        <button
          class="rounded-full bg-destructive px-4 py-2 text-sm text-white transition-all duration-150 hover:bg-destructive/90 active:scale-95 disabled:opacity-60"
          :disabled="loggingOut" @click="confirmLogout">
          <span v-if="loggingOut"
            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white align-middle"></span>
          <span v-else>Chiqish</span>
        </button>
      </div>
    </AppModal>
  </DashboardLayout>
</template>

<style scoped>
.page-enter {
  animation: pageFadeIn 0.4s ease-out;
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rise {
  opacity: 0;
  transform: translateY(12px);
  animation: riseIn 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}

@keyframes riseIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ring-glow {
  background: conic-gradient(from 0deg, var(--primary, #22c55e), transparent 65%, var(--primary, #22c55e));
  animation: spinSlow 6s linear infinite;
}

@keyframes spinSlow {
  to {
    transform: rotate(360deg);
  }
}

.animate-pulse-dot {
  animation: dotPulse 1.8s ease-out infinite;
}

@keyframes dotPulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {

  .page-enter,
  .rise,
  .ring-glow,
  .animate-pulse-dot {
    animation: none !important;
  }
}
</style>