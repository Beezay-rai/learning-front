import { createSlice } from "@reduxjs/toolkit";

export interface UserDetail {
  user: {
    access_token: string;
    refresh_token: string;
  };
  oidc_user: {
    access_token: string;
    profile: {
      name: string;
      email: string;
    };
  };
}

const userState: UserDetail = {
  user: {
    access_token: "",
    refresh_token: "",
  },
  oidc_user: {
    access_token: "",
    profile: {
      name: "",
      email: ""
    },
  },
};

export const userSlice = createSlice({
  name: "User Detail",
  initialState: userState,
  reducers: {
    setUserDetail: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = {
        access_token: "",
        refresh_token: "",
      };
    },
    updateToken: (state, action) => {
      state.user.access_token = action.payload.access_token;
      state.user.refresh_token = action.payload.refresh_token;
    },
    setOIDCUser: (state, action) => {
      state.oidc_user = action.payload;
    },
  },
});

export const { logout } = userSlice.actions;

export const { setUserDetail, updateToken, setOIDCUser } = userSlice.actions;

export default userSlice.reducer;
