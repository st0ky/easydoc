function recurse_tree (state, tree) {
  console.log(tree)
  var res = {
    label: state.notes[tree.note].title,
    note: state.notes[tree.note],
    children: []
  }
  if (tree.children.length > 0) {
    for (var child of tree.children) {
      res.children.push(recurse_tree(state, child))
    }
  }
  return res
}

// export function GetTrees (state) {
//   var l = []
//   for (var [name, children] of state.trees) {
//     var ll = []
//     for (var child of children) {
//       ll.push(recurse_tree(state, child))
//     }
//     l.push({ name: name, tree: ll })
//   }
//   console.log(l)
//   return l
// }
