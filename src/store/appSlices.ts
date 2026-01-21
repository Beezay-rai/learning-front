import { createSlice } from "@reduxjs/toolkit";
import { User } from "oidc-client-ts";

export interface UserDetail {
  oidc_user: User | null;
  isAuthenticated: boolean;
}

const userState: UserDetail = {
  oidc_user: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: "User Detail",
  initialState: userState,
  reducers: {
    setOIDCUser: (state, action) => {
      state.oidc_user = action.payload;
    },
    logout(state) {
      state.oidc_user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setOIDCUser, logout } = userSlice.actions;

export default userSlice.reducer;
