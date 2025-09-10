import { createStore } from "./genericStore"

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureKey: string;
  bio: string;
}

const defaultUserInfo: UserInfo = {
  id: '',
  firstName: '',
  lastName: '',
  profilePictureKey: '',
  bio: '',
};

export const UserInfoStore = createStore({
  storageKey: 'user_info_data',
  defaultValue: defaultUserInfo,
  contextName: 'UserInfo'
});

export const UserInfoProvider = UserInfoStore.Provider;
export const useUserInfoStore = UserInfoStore.useStore;
