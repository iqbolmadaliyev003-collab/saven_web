import { defineStore } from "pinia";
import { authApi, businessApi } from "@/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    business: null,
  }),
  getters: {
    isAuthenticated: () => authApi.isAuthenticated(),
    initials: (state) => (state.business?.name ? state.business.name.charAt(0).toUpperCase() : "S"),
  },
  actions: {
    async login(login, password) {
      // Backend ishlamayotgan paytda vaqtincha asl tekshiruvlarni o'chirmay, kommentariya sifatida qoldiramiz:
      // const business = await authApi.login(login, password);
      // this.business = business;
      // return business;
      const business = { name: login || "Demo Business" };
      this.business = business;
      return business;
    },
    async fetchProfile() {
      this.business = await businessApi.me();
      return this.business;
    },
    logout() {
      authApi.logout();
      this.business = null;
    },
  },
});
