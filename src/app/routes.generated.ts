export const routes = {
  "(guest)": {
    "callback": {
      "index": "/callback"
    },
    "login": {
      "index": "/login"
    },
    "signup": {
      "index": "/signup"
    }
  },
  "(protected)": {
    "api-gateway": {
      "cluster": {
        "index": "/api-gateway/cluster/",
        "add": {
          "index": "/api-gateway/cluster/add"
        },
        "edit": {
          "index": "/api-gateway/cluster/edit/"
        }
      },
      "route": {
        "index": "/api-gateway/route/",
        "add": {
          "index": "/api-gateway/route/add"
        },
        "edit": {
          "index": "/api-gateway/route/edit/"
        }
      }
    },
    "configure": {
      "ca-certificate": {
        "index": "/configure/ca-certificate"
      },
      "ssl-certificate": {
        "index": "/configure/ssl-certificate"
      }
    },
    "dashboard": {
      "index": "/dashboard"
    },
    "dll-manager": {
      "index": "/dll-manager"
    },
    "playground": {
      "index": "/playground",
      "api-tester": {
        "index": "/playground/api-tester"
      },
      "code-editor": {
        "index": "/playground/code-editor"
      },
      "json-formatter": {
        "index": "/playground/json-formatter"
      }
    },
    "product-management": {
      "api-product": {
        "index": "/product-management/api-product/",
        "add": {
          "index": "/product-management/api-product/add"
        },
        "edit": {
          "index": "/product-management/api-product/edit/"
        }
      }
    },
    "proxy": {
      "rest-builder": {
        "index": "/proxy/rest-builder",
        "add": {
          "index": "/proxy/rest-builder/add"
        },
        "edit": {
          "index": "/proxy/rest-builder/edit/"
        }
      },
      "soap-builder": {
        "index": "/proxy/soap-builder"
      }
    },
    "sockets": {
      "signalR": {
        "index": "/sockets/signalr"
      },
      "web-socket": {
        "index": "/sockets/web-socket"
      }
    },
    "user-management": {
      "api-user": {
        "index": "/user-management/api-user",
        "add": {
          "index": "/user-management/api-user/add"
        },
        "edit": {
          "index": "/user-management/api-user/edit/"
        },
        "configure": {
          "index": "/user-management/api-user/configure"
        }
      },
      "role": {
        "index": "/user-management/role",
        "add": {
          "index": "/user-management/role/add"
        },
        "edit": {
          "index": "/user-management/role/edit/"
        }
      },
      "user": {
        "index": "/user-management/user",
        "add": {
          "index": "/user-management/user/add"
        },
        "edit": {
          "index": "/user-management/user/edit/"
        }
      }
    },
    "util": {
      "index": "/util"
    }
  }
};
