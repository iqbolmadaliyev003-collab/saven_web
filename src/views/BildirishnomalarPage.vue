<script setup>
import { ref, onMounted, computed } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import AppCard from "@/components/AppCard.vue";
import { notificationsApi } from "@/api";
import { useToastStore } from "@/stores/toast";

const toast = useToastStore();
const items = ref([]);
const loading = ref(true);

function fmtDate(d) {
  return new Date(d).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
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
  await notificationsApi.markAllRead();
  items.value.forEach((n) => (n.read = true));
  toast.success("Barchasi o'qilgan deb belgilandi");
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4">
      <AppCard class="flex items-center justify-between p-5">
        <div>
          <h1 class="text-xl font-bold">Bildirishnomalar</h1>
          <p class="text-xs text-muted">{{ unreadCount }} ta o'qilmagan</p>
        </div>
        <button
          class="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
          @click="markAllRead"
        >
          Barchasini o'qilgan deb belgilash
        </button>
      </AppCard>

      <AppCard class="p-2">
        <ul class="divide-y">
          <li
            v-for="n in items"
            :key="n.id"
            class="flex cursor-pointer items-start gap-3 p-4 hover:bg-secondary/60"
            @click="markRead(n)"
          >
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" :class="n.read ? 'bg-transparent' : 'bg-success'"></span>
            <div class="flex-1">
              <p class="font-medium" :class="!n.read && 'text-gray-900'">{{ n.title }}</p>
              <p class="text-sm text-muted">{{ n.description }}</p>
              <p class="mt-1 text-xs text-muted">{{ fmtDate(n.created_at) }}</p>
            </div>
          </li>
          <li v-if="!loading && !items.length" class="py-8 text-center text-muted">Bildirishnomalar yo'q</li>
        </ul>
      </AppCard>
    </div>
  </DashboardLayout>
</template>
