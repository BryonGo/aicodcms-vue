import { defineStore } from "pinia";

import { UserInfosStates } from "./interface";
import { Session } from "/@/utils/storage";

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfo = defineStore("userInfo", {
  state: (): UserInfosStates => ({
    userInfos: {
      id: 0,
      user_name: "",
      user_nickname: "",
      avatar: "",
      roles: [],
      time: 0,
      authBtnList: [],
    },
    permissions: [],
  }),
  actions: {
    async setUserInfos() {
      if (Session.get("userInfo")) {
        this.userInfos = Session.get("userInfo");
      }
    },
    async setPermissions() {
      this.permissions = Session.get("permissions");
    },
  },
});
