<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const profile = reactive({
  businessName: "Fresh Cut barber",
  category: "Sartaroshxona",
  address: "Toshkent, Chilonzor, Qo'yliq ko'ch. 14",
  phone: "+998 90 123 45 67",
  email: "freshcut@biznes.uz",
  bio: "Professional barber xizmatlari. 5 yillik tajriba.",
});

const initials = "AK";
const saving = ref(false);
const showToast = ref(false);

function save() {
  saving.value = true;
  setTimeout(() => {
    saving.value = false;
    showToast.value = true;
    setTimeout(() => (showToast.value = false), 2200);
  }, 700);
}

const targets = { visits: 2253, clients: 1087, revenue: 34000000 };
const stats = reactive({ visits: 0, clients: 0, revenue: 0 });

function animateCount(key, target, duration = 1400) {
  const start = performance.now();
  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    stats[key] = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function fmt(n) {
  return n.toLocaleString("ru-RU");
}

onMounted(() => {
  setTimeout(() => animateCount("visits", targets.visits), 250);
  setTimeout(() => animateCount("clients", targets.clients), 400);
  setTimeout(() => animateCount("revenue", targets.revenue), 550);
});

const navItems = [
  { label: "Asosiy", icon: "home", path: "/" },
  { label: "Statistika", icon: "chart", path: "/statistika" },
  { label: "Buyurtmalar", icon: "box", path: "/buyurtmalar" },
  { label: "Chegirmalar", icon: "tag", path: "/chegirmalar" },
  { label: "Chegirma tarixi", icon: "clock", path: "/chegirma-tarixi" },
  { label: "Kassalar", icon: "wallet", path: "/kassalar" },
  { label: "Bildirishnomalar", icon: "bell", path: "/bildirishnomalar" },
  { label: "Profil", icon: "user", path: "/profil" },
];

const sidebarOpen = ref(false);
const collapsed = ref(false);
const router = useRouter();
const route = useRoute();
const showLogoutModal = ref(false);
const loggingOut = ref(false);

function navigate(item) {
  if (item.path) {
    // avoid navigating to same route
    if (route.path !== item.path) router.push(item.path);
  }
  // close mobile sidebar after navigation
  if (window.innerWidth <= 860) sidebarOpen.value = false;
}

function isActive(item) {
  return route.path === item.path;
}

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

function confirmLogout() {
  loggingOut.value = true;
  // add a small delay for animation, then navigate
  setTimeout(() => {
    // In a real app you might clear auth tokens here
    loggingOut.value = false;
    showLogoutModal.value = false;
    router.push("/login").catch(() => {});
  }, 650);
}

function cancelLogout() {
  showLogoutModal.value = false;
}
</script>

<template>
  <div class="shell">
    <!-- mobile topbar -->
    <div class="mobile-topbar">
      <button class="burger" @click="sidebarOpen = !sidebarOpen">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="brand">
        <span class="brand-dot"></span>
        saven
      </div>
    </div>

    <!-- overlay for mobile -->
    <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false"></div>

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ open: sidebarOpen, collapsed: collapsed }">
      <div class="brand desktop-only">
        <span class="brand-dot"></span>
        saven
      </div>

      <!-- collapse toggle -->
      <button
        @click="toggleCollapse"
        class="collapse-btn"
        :aria-expanded="!collapsed"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="collapse-icon"
        >
          <path v-if="!collapsed" d="M19 12H5" />
          <path v-else d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
        </svg>
      </button>

      <div class="user-chip rise" style="animation-delay: 0.02s">
        <div class="user-avatar">AK</div>
        <span>Fresh Cut Barber</span>
      </div>

      <nav class="nav">
        <a
          v-for="(item, i) in navItems"
          :key="item.label"
          href="#"
          class="nav-item rise"
          :class="{ active: isActive(item) }"
          :style="{ animationDelay: `${0.04 + i * 0.03}s` }"
          @click.prevent="navigate(item)"
        >
          <span class="nav-icon">
            <svg
              v-if="item.icon === 'home'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'chart'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 20V10m6 10V4m6 16v-7"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'box'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'tag'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M20.59 13.41L11 3.83A2 2 0 009.59 3H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.59 9.59a2 2 0 002.82 0l4.59-4.59a2 2 0 000-2.82z"
              />
              <circle cx="7.5" cy="7.5" r="1" />
            </svg>
            <svg
              v-else-if="item.icon === 'clock'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 7v5l3 3"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'wallet'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
              />
              <path stroke-linecap="round" d="M16 12h.01" />
            </svg>
            <svg
              v-else-if="item.icon === 'bell'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path stroke-linecap="round" d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </span>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="main">
      <div class="header rise" style="animation-delay: 0.02s">
        <h1 class="title">Profil</h1>
        <button @click="save" :disabled="saving" class="save-btn">
          <span v-if="!saving">Saqlash</span>
          <span v-else class="saving">
            <svg class="spinner" viewBox="0 0 24 24" fill="none">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                stroke-width="4"
              />
              <path
                class="opacity-80"
                fill="white"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Saqlanmoqda…
          </span>
        </button>
      </div>

      <div class="grid">
        <!-- LEFT: profile card -->
        <div class="card lift rise" style="animation-delay: 0.08s">
          <div class="avatar-row">
            <div class="avatar-wrap">
              <div class="pole-ring"></div>
              <div class="avatar">{{ initials }}</div>
            </div>
            <div>
              <h2 class="biz-name">{{ profile.businessName }}</h2>
              <div class="status">
                <span class="dot"></span>
                Faol
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="fields">
            <div>
              <label class="label">Biznes nomi</label>
              <input v-model="profile.businessName" type="text" class="input" />
            </div>
            <div>
              <label class="label">Kategoriya</label>
              <input v-model="profile.category" type="text" class="input" />
            </div>
            <div>
              <label class="label">Manzil</label>
              <input v-model="profile.address" type="text" class="input" />
            </div>
            <div class="row-2">
              <div>
                <label class="label">Telefon</label>
                <input v-model="profile.phone" type="text" class="input" />
              </div>
              <div>
                <label class="label">Email</label>
                <input v-model="profile.email" type="text" class="input" />
              </div>
            </div>
            <div>
              <label class="label">Tavsif</label>
              <textarea
                v-model="profile.bio"
                rows="3"
                class="input textarea"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- RIGHT: sidebar cards -->
        <div class="side">
          <div class="card lift rise" style="animation-delay: 0.16s">
            <h3 class="card-title">
              Statistika <span class="muted">(jami)</span>
            </h3>
            <div class="stat-row">
              <span class="stat-label">Jami tashrif</span>
              <span class="stat-value">{{ fmt(stats.visits) }}</span>
            </div>
            <div class="divider"></div>
            <div class="stat-row">
              <span class="stat-label">Mijozlar soni</span>
              <span class="stat-value">{{ fmt(stats.clients) }}</span>
            </div>
            <div class="divider"></div>
            <div class="stat-row">
              <span class="stat-label">Jami daromad</span>
              <span class="stat-value green"
                >{{ fmt(stats.revenue) }} so'm</span
              >
            </div>
          </div>

          <div class="card lift rise" style="animation-delay: 0.24s">
            <h3 class="card-title">Yordam</h3>
            <p class="help-text">
              Agar sizga texnik yordam kerak bo'lsa, qo'llab-quvvatlash
              jamoamizga murojaat qiling.
            </p>

            <button class="contact-btn">
              <svg
                class="icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Bog'lanish
            </button>

            <button class="logout-btn" @click.prevent="showLogoutModal = true">
              <svg
                class="icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Chiqish
            </button>
          </div>
        </div>
      </div>

      <!-- toast -->
      <Transition name="toast">
        <div v-if="showToast" class="toast">
          <svg
            class="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#8fd6ac"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          O'zgarishlar saqlandi
        </div>
      </Transition>

      <!-- Logout Modal -->
      <Transition name="modal-fade">
        <div
          v-if="showLogoutModal"
          class="modal-outer"
          @click.self="cancelLogout"
          role="dialog"
          aria-modal="true"
        >
          <div class="modal-card">
            <button
              class="modal-close"
              @click="cancelLogout"
              aria-label="Close"
            >
              ×
            </button>
            <div class="modal-illustration">
              <div class="modal-circle">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  class="modal-power"
                  stroke="white"
                  stroke-width="1.5"
                >
                  <path
                    d="M12 2v6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M5 9a7 7 0 1014 0"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h3 class="modal-title">Siz tizimdan chiqishni xohlaysizmi?</h3>
            <p class="modal-desc">
              Agar davom etsangiz, siz qayta tizimga kirishingiz kerak bo'ladi.
            </p>

            <div class="modal-actions">
              <button
                class="btn btn-ghost"
                @click="cancelLogout"
                :disabled="loggingOut"
              >
                Orqaga
              </button>
              <button
                class="btn btn-danger"
                @click="confirmLogout"
                :disabled="loggingOut"
              >
                <span v-if="!loggingOut">Chiqish</span>
                <span v-else class="loading-dot">...</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap");

* {
  box-sizing: border-box;
}

.shell {
  display: flex;
  min-height: 100vh;
  background: #f3f4f6;
  color: #16181d;
  font-family: "Manrope", system-ui, sans-serif;
}

/* ---------- SIDEBAR ---------- */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #16181d;
  color: #cfd2d8;
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "Fraunces", serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #fff;
  padding: 0 0.25rem;
}
.brand-dot {
  width: 9px;
  height: 9px;
  border-radius: 9999px;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.25);
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #1f2128;
  border-radius: 0.75rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
}
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background: #22c55e;
  color: #0d1a12;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Fraunces", serif;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.6rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #9096a3;
  text-decoration: none;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}
.nav-item:hover {
  background: #1f2128;
  color: #fff;
  transform: translateX(2px);
}
.nav-item.active {
  background: #22c55e;
  color: #0d1a12;
  font-weight: 700;
}
.nav-icon {
  width: 1rem;
  height: 1rem;
  display: flex;
}
.nav-icon svg {
  width: 100%;
  height: 100%;
}

/* collapse button */
.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #cfd2d8;
  cursor: pointer;
  margin: 0.25rem 0;
}
.collapse-icon {
  width: 18px;
  height: 18px;
}

/* collapsed sidebar: show icons only */
.sidebar.collapsed {
  width: 72px;
}
.sidebar.collapsed .brand {
  display: none;
}
.sidebar.collapsed .user-chip span {
  display: none;
}
.sidebar.collapsed .nav-item {
  justify-content: center;
}
.sidebar.collapsed .nav-item .nav-label {
  display: none;
}
.sidebar.collapsed .user-avatar {
  margin-right: 0;
}

.mobile-topbar {
  display: none;
}
.overlay {
  display: none;
}

/* ---------- MAIN ---------- */
.main {
  flex: 1;
  padding: 2rem 2rem 3rem;
  min-width: 0;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
}
.title {
  font-family: "Fraunces", serif;
  font-size: 1.6rem;
  font-weight: 600;
}
.save-btn {
  position: relative;
  overflow: hidden;
  padding: 0.6rem 1.15rem;
  border-radius: 0.7rem;
  background: #22c55e;
  color: #0d1a12;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px -8px rgba(34, 197, 94, 0.55);
}
.save-btn:active {
  transform: scale(0.96);
}
.saving {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.spinner {
  width: 1rem;
  height: 1rem;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.25rem;
  align-items: start;
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border: 1px solid #eceef1;
  border-radius: 1rem;
  padding: 1.6rem;
}
.lift {
  transition:
    transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1),
    box-shadow 0.25s ease;
}
.lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -10px rgba(22, 24, 29, 0.15);
}

.rise {
  opacity: 0;
  transform: translateY(14px);
  animation: riseIn 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}
@keyframes riseIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
}
.avatar-wrap {
  position: relative;
  width: 62px;
  height: 62px;
  flex-shrink: 0;
}
.pole-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: conic-gradient(from 0deg, #22c55e, #86efac, #22c55e);
  animation: spinSlow 6s linear infinite;
}
@keyframes spinSlow {
  to {
    transform: rotate(360deg);
  }
}
.avatar {
  position: absolute;
  inset: 3px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #22c55e;
  color: #0d1a12;
  font-family: "Fraunces", serif;
  font-weight: 700;
  font-size: 1.15rem;
}
.biz-name {
  font-family: "Fraunces", serif;
  font-size: 1.2rem;
  font-weight: 600;
}
.status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #16a34a;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #22c55e;
  animation: pulseRing 2s ease-in-out infinite;
}
@keyframes pulseRing {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
  }
}

.divider {
  height: 1px;
  margin: 1.3rem 0;
  background: #eceef1;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.1rem;
}
@media (max-width: 600px) {
  .row-2 {
    grid-template-columns: 1fr;
  }
}

.label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.35rem;
  color: #8b8f99;
}
.input {
  width: 100%;
  border-radius: 0.65rem;
  border: 1px solid #e7e8eb;
  background: #f7f8fa;
  padding: 0.7rem 0.9rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: inherit;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}
.input:hover {
  background: #f0f1f4;
}
.input:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
  background: #fff;
}
.textarea {
  resize: none;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.card-title {
  font-family: "Fraunces", serif;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.9rem;
}
.muted {
  font-size: 0.8rem;
  font-weight: 400;
  color: #8b8f99;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-label {
  font-size: 0.85rem;
  color: #6b7280;
}
.stat-value {
  font-family: "Fraunces", serif;
  font-weight: 600;
  font-size: 1.05rem;
  font-variant-numeric: tabular-nums;
}
.stat-value.green {
  color: #16a34a;
}

.help-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #6b7280;
  margin-bottom: 1.1rem;
}
.contact-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.65rem;
  padding: 0.7rem;
  background: #22c55e;
  color: #0d1a12;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  margin-bottom: 0.6rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px -8px rgba(34, 197, 94, 0.55);
}
.contact-btn:active {
  transform: scale(0.96);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.65rem;
  padding: 0.6rem;
  background: transparent;
  color: #e11d48;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}
.logout-btn:hover {
  background: #fef1f3;
}
.logout-btn:active {
  transform: scale(0.96);
}

.icon {
  width: 1rem;
  height: 1rem;
}

.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.7rem 1.2rem;
  border-radius: 0.7rem;
  background: #16181d;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 12px 28px -10px rgba(0, 0, 0, 0.4);
  z-index: 50;
}
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

/* Modal styles & animations */
.modal-outer {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(9, 10, 11, 0.45);
  backdrop-filter: blur(4px);
  z-index: 60;
}
.modal-card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 14px;
  padding: 1.6rem;
  box-shadow: 0 20px 50px rgba(22, 24, 29, 0.18);
  position: relative;
  text-align: center;
  transform-origin: center;
}
.modal-close {
  position: absolute;
  right: 12px;
  top: 10px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
}
.modal-illustration {
  display: flex;
  justify-content: center;
  margin-bottom: 0.6rem;
}
.modal-circle {
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  background: linear-gradient(180deg, #ef4444, #dc2626);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(220, 38, 38, 0.25);
  transform: translateY(-6px);
  animation: pulseUp 1.6s ease-in-out infinite;
}
.modal-power {
  width: 34px;
  height: 34px;
}
.modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.modal-desc {
  color: #6b7280;
  margin-bottom: 1rem;
}
.modal-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
}
.btn {
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
.btn-ghost {
  background: #f3f4f6;
  color: #111827;
}
.btn-danger {
  background: linear-gradient(180deg, #ef4444, #dc2626);
  color: #fff;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.18);
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
.loading-dot {
  display: inline-block;
}

@keyframes pulseUp {
  0% {
    transform: translateY(-6px) scale(1);
  }
  50% {
    transform: translateY(0) scale(1.03);
  }
  100% {
    transform: translateY(-6px) scale(1);
  }
}

/* modal transition */
.modal-fade-enter-active {
  animation: modalEnter 0.36s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
.modal-fade-leave-active {
  animation: modalLeave 0.22s ease forwards;
}
.modal-fade-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes modalLeave {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
}

/* Micro-interactions */
.save-btn {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.save-btn:active {
  transform: translateY(1px) scale(0.995);
}
.avatar {
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.avatar-wrap:hover .avatar {
  transform: translateY(-4px) scale(1.02);
}
.nav-item {
  transition:
    transform 0.18s ease,
    background-color 0.18s ease;
}
.nav-item:active {
  transform: translateX(1px) scale(0.997);
}

/* ---------- RESPONSIVE ---------- */
@media (max-width: 860px) {
  .shell {
    flex-direction: column;
  }
  .mobile-topbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #16181d;
    color: #fff;
    padding: 0.9rem 1rem;
    position: sticky;
    top: 0;
    z-index: 40;
  }
  .burger {
    background: none;
    border: none;
    color: #fff;
    width: 1.4rem;
    height: 1.4rem;
    cursor: pointer;
  }
  .burger svg {
    width: 100%;
    height: 100%;
  }
  .desktop-only {
    display: none;
  }
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 45;
    transform: translateX(-100%);
    transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 12px 0 30px -10px rgba(0, 0, 0, 0.35);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 44;
  }
  .main {
    padding: 1.25rem 1rem 2.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001s !important;
    transition-duration: 0.001s !important;
  }
}
</style>
