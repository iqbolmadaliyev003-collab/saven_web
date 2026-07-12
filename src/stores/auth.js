import { defineStore } from "pinia";
import { authApi, businessApi } from "@/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    business: null,
  }),
  getters: {
    isAuthenticated: () => authApi.isAuthenticated(),
    initials: (state) =>
      state.business?.name ? state.business.name.charAt(0).toUpperCase() : "S",
  },
  actions: {
    async login(email, password) {
      // 1) login qilib token olamiz
      await authApi.login(email, password);
      // 2) shu foydalanuvchining biznes profilini yuklaymiz (my-business/)
      return await this.fetchProfile();
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
