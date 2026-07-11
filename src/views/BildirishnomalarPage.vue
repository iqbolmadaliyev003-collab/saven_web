<script setup>
import { ref, onMounted, computed } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import AppCard from "@/components/AppCard.vue";
import { notificationsApi } from "@/api";
import { useToastStore } from "@/stores/toast";

const toast = useToastStore();
const items = ref([]);
const loading = ref(true);
const markingAll = ref(false);

function fmtDate(d) {
  const date = new Date(d);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);

  if (diffMin < 1) return "hozirgina";
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  if (diffHour < 24) return `${diffHour} soat oldin`;

  const months = [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr",
  ];
  return `${date.getDate()}-${months[date.getMonth()]} ${date.getFullYear()}`;
}

const unreadCount = computed(() => items.value.filter((n) => !n.read).length);

async function load() {
  loading.value = true;
  try {
    items.value = await notificationsApi.list();
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function markRead(n) {
  if (n.read) return;
  await notificationsApi.markRead(n.id);
  n.read = true;
}

async function markAllRead() {
  if (!unreadCount.value || markingAll.value) return;
  markingAll.value = true;
  try {
    await notificationsApi.markAllRead();
    items.value.forEach((n) => (n.read = true));
    toast.success("Barchasi o'qilgan deb belgilandi");
  } finally {
    markingAll.value = false;
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 page-enter">
      <AppCard class="flex items-center justify-between p-5">
        <div>
          <h1 class="text-xl font-bold tracking-tight">Bildirishnomalar</h1>
          <p class="text-xs text-muted">
            <Transition name="count" mode="out-in">
              <span :key="unreadCount">{{ unreadCount }} ta o'qilmagan</span>
            </Transition>
          </p>
        </div>
        <button
          class="rounded-full border border-border px-4 py-2 text-sm font-medium transition-all duration-150 hover:bg-secondary active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!unreadCount || markingAll" @click="markAllRead">
          <span v-if="markingAll"
            class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400/40 border-t-gray-600 align-middle"></span>
          <span v-else>Hammasini o'qilgan qilib belgilash</span>
        </button>
      </AppCard>

      <AppCard class="p-2">
        <!-- Loading skeleton -->
        <ul v-if="loading" class="divide-y">
          <li v-for="i in 4" :key="'sk' + i" class="flex items-start gap-3 p-4">
            <div class="mt-0.5 h-9 w-9 shrink-0 animate-pulse rounded-full bg-secondary"
              :style="{ animationDelay: i * 70 + 'ms' }"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3.5 w-1/3 animate-pulse rounded bg-secondary" :style="{ animationDelay: i * 70 + 'ms' }">
              </div>
              <div class="h-3 w-1/2 animate-pulse rounded bg-secondary" :style="{ animationDelay: i * 70 + 'ms' }">
              </div>
            </div>
          </li>
        </ul>

        <TransitionGroup v-else tag="ul" name="item" class="relative divide-y">
          <li v-for="(n, i) in items" :key="n.id"
            class="group relative flex cursor-pointer items-start gap-3 p-4 transition-colors duration-150 hover:bg-secondary/60"
            :style="{ transitionDelay: (i * 25) + 'ms' }" @click="markRead(n)">
            <span
              class="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-base transition-transform duration-150 group-hover:scale-105">
              🔔
              <span v-if="!n.read"
                class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-white animate-pop"></span>
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-medium" :class="!n.read ? 'text-gray-900' : 'text-muted'">{{ n.title }}</p>
              <p class="truncate text-sm text-muted">{{ n.description }}</p>
            </div>
            <p class="shrink-0 whitespace-nowrap pl-2 text-xs text-muted">{{ fmtDate(n.created_at) }}</p>
          </li>

          <li v-if="!items.length" key="empty" class="fade-in-up flex flex-col items-center gap-2 py-14 text-center">
            <span class="text-3xl">🔔</span>
            <span class="text-muted">Bildirishnomalar yo'q</span>
          </li>
        </TransitionGroup>
      </AppCard>
    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Page entrance */
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

/* Unread count swap */
.count-enter-active,
.count-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.count-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.count-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* List item enter/move */
.item-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.item-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.item-move {
  transition: transform 0.25s ease;
}

/* Unread dot pop */
.animate-pop {
  animation: pop 0.25s ease-out;
}

@keyframes pop {
  0% {
    transform: scale(0);
  }

  70% {
    transform: scale(1.25);
  }

  100% {
    transform: scale(1);
  }
}

/* Empty state */
.fade-in-up {
  animation: fadeInUp 0.35s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {

  .page-enter,
  .fade-in-up,
  .animate-pop,
  .item-enter-active,
  .item-move,
  .count-enter-active,
  .count-leave-active {
    animation: none !important;
    transition: none !important;
  }
}
</style>