export const routes = {
  "(guest)": {
    callback: {
      index: "/callback",
    },
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
        edit: "/api-gateway/cluster/Edit/:id",
        detail: "/api-gateway/cluster/Detail/:id",
        "[id]": {
          index: "/api-gateway/cluster/[id]",
        },
      },
      route: {
        index: "/api-gateway/route",
        add: {
          index: "/api-gateway/route/add",
        },
        edit: "/api-gateway/route/Edit/:id",
        detail: "/api-gateway/route/Detail/:id",
        "[id]": {
          index: "/api-gateway/route/[id]",
        },
      },
    },
    dashboard: {
      index: "/dashboard",
    },
    proxy: {
      "rest-builder": {
        index: "/proxy/rest-builder",
        add: {
          index: "/proxy/rest-builder/add",
        },
      },
      "soap-builder": {
        index: "/proxy/soap-builder",
      },
    },
    sockets: {
      signalR: {
        index: "/sockets/signalR",
      },
      "web-socket": {
        index: "/sockets/web-socket",
      },
    },
  },
};
