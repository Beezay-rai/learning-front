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
        index: "/api-gateway/cluster/",
        add: {
          index: "/api-gateway/cluster/add",
        },
        edit: {
          index: "/api-gateway/cluster/edit/",
        },
      },
      route: {
        index: "/api-gateway/route/",
        add: {
          index: "/api-gateway/route/add",
        },
        edit: {
          index: "/api-gateway/route/edit/",
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
        edit: {
          index: "/proxy/rest-builder/edit/",
        },
      },
      "soap-builder": {
        index: "/proxy/soap-builder",
      },
    },
    sockets: {
      signalR: {
        index: "/sockets/signalr",
      },
      "web-socket": {
        index: "/sockets/web-socket",
      },
    },
  },
};
