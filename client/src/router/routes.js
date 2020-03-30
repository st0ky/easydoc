const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'tree/:tree/note/:note',
        component: () => import('pages/Note.vue'),
        props (route) {
          const props = { ...route.params }
          props.note = parseInt(props.note)
          props.tree = parseInt(props.tree)
          return props
        },
        children: [
          {
            path: '',
            name: 'noteView',
            component: () => import('components/NoteView/NoteList.vue'),
            props (route) {
              const props = { ...route.params }
              props.note = parseInt(props.note)
              props.tree = parseInt(props.tree)
              return props
            }
          },
          {
            path: 'code/:fileId/range/:rangeStart/:rangeEnd',
            name: 'code',
            component: () => import('components/NoteView/Code.vue'),
            props (route) {
              const props = { ...route.params }
              props.fileId = parseInt(props.fileId)
              props.rangeStart = parseInt(props.rangeStart)
              props.rangeEnd = parseInt(props.rangeEnd)
              return props
            }
          }
        ]
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
