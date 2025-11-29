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
    configure: {
      "ca-certificate": {
        index: "/configure/ca-certificate",
      },
      "ssl-certificate": {
        index: "/configure/ssl-certificate",
      },
    },
    dashboard: {
      index: "/dashboard",
    },
    "dll-manager": {
      index: "/dll-manager",
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
    "user-management": {
      "api-user": {
        index: "/user-management/api-user",
        add: {
          index: "/user-management/api-user/add",
        },
        edit: {
          index: "/user-management/api-user/edit",
        },
      },
      "app-user": {
        index: "/user-management/app-user",
      },
    },
  },
};
