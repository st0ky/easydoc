const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'tree/:tree/note/:note',
        name: 'noteView',
        component: () => import('components/NoteView.vue'),
        props (route) {
          const props = { ...route.params }
          props.note = parseInt(props.note)
          props.tree = parseInt(props.tree)
          return props
        }
      }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
