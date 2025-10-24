export const routes = {
  "(guest)": {
    login: {
      index: "/login",
    },
    signup: {
      index: "/signup",
    },
  },
  "(protected)": {
    "api-gateway": {
      cluster: {
        index: "/api-gateway/cluster",
        add: {
          index: "/api-gateway/cluster/add",
        },
        edit: {
          index: "/api-gateway/cluster/",
        },
      },
      route: {
        index: "/api-gateway/route",
        add: {
          index: "/api-gateway/route/add",
        },
        edit: {
          index: "/api-gateway/route/",
        },
      },
    },
    dashboard: {
      index: "/dashboard",
    },
  },
};
