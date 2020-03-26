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
    notes: {
      0: {
        id: 0,
        title: 'hello - 0',
        content: '## 0\nhere is my תוכן. i like לכתוב בעברית...',
        tags: ['hey', 'vuln', 'interesting'],
        links: ['note-id://1']
      },
      1: {
        id: 1,
        title: 'hello - 1',
        content: '## 1\nhere is my תוכן. i like לכתוב בעברית...',
        tags: ['hey', 'interesting'],
        links: ['note-id://0']
      },
      2: {
        id: 2,
        title: 'hello - 2',
        content: '## 2\nhere is my תוכן. i like לכתוב בעברית...',
        tags: ['hey', 'interesting'],
        links: ['note-id://0']
      },
      3: {
        id: 3,
        title: 'hello - 3',
        content: '## 3\nhere is my תוכן. i like לכתוב בעברית...',
        tags: ['hey', 'interesting'],
        links: ['note-id://0']
      },
      4: {
        id: 4,
        title: 'hello - 4',
        content: '## 4\nhere is my תוכן. i like לכתוב בעברית...',
        tags: ['hey', 'interesting'],
        links: ['note-id://0']
      },
      5: {
        id: 5,
        title: 'hello - 5',
        content: '## 5\nhere is my תוכן. i like לכתוב בעברית...',
        tags: ['hey', 'interesting'],
        links: ['note-id://0']
      },
      6: {
        id: 6,
        title: 'hello - 6',
        content: '## 6\nhere is my תוכן. i like לכתוב בעברית...',
        tags: ['hey', 'interesting'],
        links: ['note-id://0']
      },
      7: {
        id: 7,
        title: 'ideas',
        content: '',
        tags: [],
        links: []
      },
      8: {
        id: 8,
        title: 'mechanisms',
        content: '',
        tags: [],
        links: []
      },
      9: {
        id: 9,
        title: '999999',
        content: '',
        tags: [],
        links: []
      },
      10: {
        id: 10,
        title: '100000000000000',
        content: '',
        tags: [],
        links: []
      }
    },
    trees: trees,
    flattenTrees: {}
  }
}
