export default function () {
  var trees = []
  trees.push({
    note: 7,
    children: [
      { note: 0, children: [] },
      {
        note: 1,
        children: [
          { note: 2, children: [] },
          { note: 3, children: [] },
          { note: 4, children: [] }
        ]
      }
    ]
  })
  trees.push({
    note: 8,
    children: [
      {
        note: 0,
        children: [
          {
            note: 4,
            children: [{ note: 5, children: [{ note: 3, children: [] }] }]
          }
        ]
      },
      { note: 1, children: [{ note: 2, children: [] }] }
    ]
  })
  return {
    lastCreatedNote: null,
    notes: {},
    trees: {},
  }
}
