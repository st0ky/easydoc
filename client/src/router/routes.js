const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Index.vue") },
      {
        path: "mindtree/:tree",
        name: "mindtree",
        component: () => import("pages/MindTree.vue"),
        props(route) {
          const props = { ...route.params };
          props.tree = parseInt(props.tree);
          return props;
        }
      },
      {
        path: "code",
        component: () => import("pages/Code.vue"),
        children: [
          {
            path: ":fileId/range/:line/:endLine?",
            name: "code",
            component: () => import("components/NoteView/Code.vue"),
            props(route) {
              const props = { ...route.params, ...route.query };
              props.fileId = parseInt(props.fileId);
              props.line = parseInt(props.line);
              props.endLine =
                props.endLine === undefined || parseInt(props.endLine) === NaN
                  ? -1
                  : parseInt(props.endLine);
              props.startCol =
                props.startCol === undefined || parseInt(props.startCol) === NaN
                  ? -1
                  : parseInt(props.startCol);
              props.endCol =
                props.endCol === undefined || parseInt(props.endCol) === NaN
                  ? -1
                  : parseInt(props.endCol);
              props.height =
                props.height === undefined ? "1000px" : props.height;
              return props;
            }
          }
        ]
      },
      {
        path: "tree/:tree/note/:note",
        component: () => import("pages/Note.vue"),
        props(route) {
          return {
            note: parseInt(route.params.note),
            tree: parseInt(route.params.tree)
          };
        },
        children: [
          {
            path: "",
            name: "noteView",
            component: () => import("components/NoteView/NoteList.vue"),
            props(route) {
              const props = { ...route.params };
              props.note = parseInt(props.note);
              props.tree = parseInt(props.tree);
              return props;
            }
          },
          {
            path: "code/:fileId/range/:line/:endLine?/:startCol?/:endCol?",
            name: "noteCode",
            component: () => import("components/NoteView/Code.vue"),
            props(route) {
              const props = { ...route.params };
              props.fileId = parseInt(props.fileId);
              props.line = parseInt(props.line);
              props.endLine =
                props.endLine === undefined || parseInt(props.endLine) === NaN
                  ? -1
                  : parseInt(props.endLine);
              props.startCol =
                props.startCol === undefined || parseInt(props.startCol) === NaN
                  ? -1
                  : parseInt(props.startCol);
              props.endCol =
                props.endCol === undefined || parseInt(props.endCol) === NaN
                  ? -1
                  : parseInt(props.endCol);
              return props;
            }
          }
        ]
      }
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("pages/Error404.vue")
  });
}

export default routes;
