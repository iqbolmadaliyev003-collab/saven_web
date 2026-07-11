<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();

const login = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const helpOpen = ref(false);

async function handleSubmit() {
  loading.value = true;
  try {
    await authStore.login(login.value, password.value);
    router.push("/asosiy");
  } catch (e) {
    toast.error("Login yoki parol noto'g'ri");
  } finally {
    loading.value = false;
  }
}

function copyPhone() {
  navigator.clipboard.writeText("+998 93 242 59 99");
  toast.success("Nusxa olindi");
}
</script>

<template>
  <div class="login-bg flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-md rounded-3xl bg-card p-8 shadow-2xl">
      <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
        S
      </div>
      <h1 class="text-3xl font-bold leading-tight">Saven Biznes<br />paneli</h1>

      <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-1.5">
          <label for="login" class="text-sm font-medium">Login</label>
          <input
            id="login"
            v-model="login"
            placeholder="example@biznes.uz"
            class="h-11 w-full rounded-lg border-0 bg-input px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div class="space-y-1.5">
          <label for="password" class="text-sm font-medium">Parol</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••••"
              class="h-11 w-full rounded-lg border-0 bg-input px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "Yashirish" : "Ko'rsatish" }}
            </button>
          </div>
          <div class="flex justify-end">
            <button
              type="button"
              class="text-xs font-medium text-success"
              @click="toast.info('Parolni tiklash uchun qo\'llab-quvvatlashga murojaat qiling')"
            >
              Parolni unutdingizmi?
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? "Yuklanmoqda..." : "Kirish" }}
        </button>

        <div class="text-center text-xs">
          <span class="text-muted">Muammo bormi? </span>
          <button type="button" class="font-medium text-success" @click="helpOpen = true">Yordam</button>
        </div>
      </form>
    </div>

    <div v-if="helpOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="helpOpen = false">
      <div class="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl">
          ?
        </div>
        <h2 class="text-2xl font-semibold">Qo'llab-quvvatlash</h2>
        <p class="mt-2 text-sm text-muted">
          Agar sizga texnik yordam kerak bo'lsa, qo'llab-quvvatlash jamoamizga murojaat qiling.
        </p>
        <button
          class="mx-auto mt-4 flex items-center gap-2 rounded-full bg-secondary px-4 py-3 shadow-sm"
          @click="copyPhone"
        >
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">☎</span>
          <span class="text-base font-semibold">+998 93 242 59 99</span>
        </button>
        <button class="mt-4 text-xs text-muted" @click="helpOpen = false">Yopish</button>
      </div>
    </div>
  </div>
</template>
