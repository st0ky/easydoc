export default function () {
  return {
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
    }
  }
}
