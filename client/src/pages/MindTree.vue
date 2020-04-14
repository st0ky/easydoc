<template>
  <q-page class="q-pa-md row items-stretch">

    <q-card
      ref="mindtree"
      class="col-12"
      flat
      bordered
      :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-3'"
    ></q-card>
  </q-page>
</template>

<script>

import { mapState } from 'vuex'

import go from 'gojs';
var $ = go.GraphObject.make;
// This works because we have overridden the /extensionsTS/tsconfig.json file
// in the options to the loader: 'ts-loader', in the webpack.config.js
// import { DrawCommandHandler } from 'gojs/extensionsJSM/DrawCommandHandler.js';
import { DrawCommandHandler } from 'components/DrawCommandHandler.js';


export default {
  name: 'MindTree',
  props: { tree: { type: Number, required: true } },
  components: {},
  data () {
    return {
      myDiagram: null,
      window: {
        width: 0,
        height: 0
      },
      model: new go.TreeModel([]),
      _modelCopy: {}
    }
  },
  computed: {
    ...mapState('notes', [
      'notes',
      'trees'
    ]),

    ourTree () { return this.trees[this.tree] !== undefined ? [this.tree, this.trees[this.tree]] : [-1, {}] },
    treeTitles () {
      let res = {}
      for (let node of Object.values(this.ourTree[1])) {
        res[node.note] = this.notes[node.note].title
      }
      return res
    }

  },
  methods: {
    deleteNote (noteId) {
      this.$socket.emit('delete note', noteId)
    },
    newNote (parent) {
      this.sockets.subscribe("new note ack", (noteId) => {
        this.$socket.emit("move note", { noteId: noteId, treeId: this.tree, parentId: parent })
        this.sockets.unsubscribe("new note ack")

      })
      this.$socket.emit("new note", { title: "new note" })
    },
    spotConverter (dir, from) {
      if (dir === "left") {
        return (from ? go.Spot.Left : go.Spot.Right);
      } else {
        return (from ? go.Spot.Right : go.Spot.Left);
      }
    },

    updateNodeDirection (node, dir) {
      this.myDiagram.model.setDataProperty(node.data, "dir", dir);
      // recursively update the direction of the child nodes
      var chl = node.findTreeChildrenNodes(); // gives us an iterator of the child nodes related to this particular node
      while (chl.next()) {
        this.updateNodeDirection(chl.value, dir);
      }
    },

    addNodeAndLink (e, obj) {
      var adorn = obj.part;
      var diagram = adorn.diagram;
      diagram.startTransaction("Add Node");
      var oldnode = adorn.adornedPart;
      var olddata = oldnode.data;
      // copy the brush and direction to the new node data
      var newdata = { text: "idea", brush: olddata.brush, dir: olddata.dir, parent: olddata.key };
      diagram.model.addNodeData(newdata);
      this.layoutTree(oldnode);
      diagram.commitTransaction("Add Node");

      // if the new node is off-screen, scroll the diagram to show the new node
      var newnode = diagram.findNodeForData(newdata);
      if (newnode !== null) diagram.scrollToRect(newnode.actualBounds);
    },

    layoutTree (node) {
      if (node.data.key == this.tree) {  // adding to the root?
        this.layoutAll();  // lay out everything
      } else {  // otherwise lay out only the subtree starting at this parent node
        var parts = node.findTreeParts();
        this.layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
      }
    },

    layoutAngle (parts, angle) {
      var layout = go.GraphObject.make(go.TreeLayout,
        {
          angle: angle,
          arrangement: go.TreeLayout.ArrangementFixedRoots,
          nodeSpacing: 5,
          layerSpacing: 20,
          setsPortSpot: false, // don't set port spots since we're managing them with our spotConverter function
          setsChildPortSpot: false
        });
      layout.doLayout(parts);
    },

    layoutAll () {
      var root = this.myDiagram.findNodeForKey(this.tree);
      if (root === null) return;
      this.myDiagram.startTransaction("Layout");
      // split the nodes and links into two collections
      var rightward = new go.Set(/*go.Part*/);
      var leftward = new go.Set(/*go.Part*/);
      root.findLinksConnected().each((link) => {
        var child = link.toNode;
        if (child.data.dir === "left") {
          leftward.add(root);  // the root node is in both collections
          leftward.add(link);
          leftward.addAll(child.findTreeParts());
        } else {
          rightward.add(root);  // the root node is in both collections
          rightward.add(link);
          rightward.addAll(child.findTreeParts());
        }
      });
      // do one layout and then the other without moving the shared root node
      this.layoutAngle(rightward, 0);
      this.layoutAngle(leftward, 180);
      this.myDiagram.commitTransaction("Layout");
    },

    detectChanges (to, from) {
      let deleted = []
      for (let val of Object.values(this._modelCopy)) {
        if (this.trees[this.tree][val.key] === undefined) deleted.push(val)
      }
      let created = []
      for (let val of Object.values(this.trees[this.tree])) {
        if (this._modelCopy[val.note] === undefined) created.push(val)
      }
      let changed = []
      for (let val of Object.values(this.trees[this.tree])) {
        if (this._modelCopy[val.note] === undefined) continue
        if (this._modelCopy[val.note].parent == 'null') continue
        if (this._modelCopy[val.note].parent == val.parent) continue
        changed.push(val)
      }
      return { changed: changed, created: created, deleted }
    },

    reloadTree () {
      console.log('reload tree')
      if (!this.trees[this.tree]) {
        console.log("no such tree")
        return
      }
      let model = []
      this._modelCopy = {}
      for (let [key, node] of Object.entries(this.trees[this.tree])) {
        let obj = { key: parseInt(key), parent: node.parent, text: this.notes[node.note].title }
        if (typeof (obj.parent) != 'number') {
          obj.parent = String(obj.parent)
        }
        this._modelCopy[obj.key] = obj
        model.push(obj)
      }
      this.model = new go.TreeModel(model)
      this.myDiagram.model = this.model
      this.layoutAll()
    },

  },
  watch: {
    ourTree: {
      handler: function ([toTreeId, toTree], [fromTreeId, fromTree]) {
        if (toTreeId != fromTreeId) {
          this.reloadTree()
          return
        }
        let { changed, created, deleted } = this.detectChanges(toTree, fromTree)
        if ((changed.length && created.length) ||
          (deleted.length && created.length) ||
          (deleted.length && changed.length)) {
          this.reloadTree()
          return
        }
        for (let obj of deleted) {
          this.model.removeNodeData(this.model.findNodeDataForKey(obj.note))
          // let parent = this._modelCopy[obj.note].parent
          delete this._modelCopy[obj.note]
          // this.layoutTree(this.myDiagram.findNodeForKey(parent));
        }
        for (let obj of changed) {
          this.model.setParentKeyForNodeData(this.model.findNodeDataForKey(obj.note), obj.parent)
          this._modelCopy[obj.note].parent = obj.parent
          // this.layoutTree(this.myDiagram.findNodeForKey(obj.parent));
        }
        for (let obj of created) {
          obj = { key: obj.note, parent: obj.parent, text: this.notes[obj.note].title }
          this.model.addNodeData(obj)
          this._modelCopy[obj.key] = obj
          // this.layoutTree(this.myDiagram.findNodeForKey(obj.key));
        }
        this.layoutAll()
      },
      deep: true
    },
    treeTitles: function (to, from) {
      for (let [k, v] of Object.entries(to)) {
        if (from[k] == v) continue
        this.model.setDataProperty(this.model.findNodeDataForKey(parseInt(k)), "text", v)
        this.layoutTree(this.myDiagram.findNodeForKey(parseInt(k)));
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.myDiagram =
        $(go.Diagram, this.$refs.mindtree.$el, {
          commandHandler: new DrawCommandHandler(this),
          "commandHandler.arrowKeyBehavior": "tree",
          // when the user drags a node, also move/copy/delete the whole subtree starting with that node
          // "commandHandler.copiesTree": true,
          // "commandHandler.copiesParentKey": true,
          "commandHandler.deletesTree": true,
          "draggingTool.dragsTree": true,
          // "undoManager.isEnabled": true
        });


      // when the document is modified, add a "*" to the title and enable the "Save" button
      this.myDiagram.addDiagramListener("Modified", (e) => {
        console.log("Modified", this.model)
      });

      // a node consists of some text with a line shape underneath
      this.myDiagram.nodeTemplate =
        $(go.Node, "Vertical",
          { selectionObjectName: "TEXT" },
          $(go.Panel, "Horizontal",
            $(go.TextBlock,
              {
                name: "TEXT",
                minSize: new go.Size(30, 15),
                editable: true,
                isMultiline: false
              },
              new go.Binding("text", "text").makeTwoWay((val, srcData, model) => {
                this.$socket.emit('update note', { id: srcData.key, title: val })
              }),
            ),
            $(go.TextBlock,
              {
                margin: new go.Margin(4, 4, 4, 4),
                font: "bold 8pt sans-serif",
                toolTip: $("ToolTip",
                  $(go.TextBlock, "expand / collapse\ntype CTRL + LEFT / RIGHT", { margin: 4 }
                  )),
                click: (e, thisObj) => {
                  if (!thisObj.part.isTreeLeaf && thisObj.part.isTreeExpanded) {
                    if (this.myDiagram.commandHandler.canCollapseTree(thisObj.part)) {
                      this.myDiagram.commandHandler.collapseTree(thisObj.part);  // collapses the tree
                    }
                  } else if (!thisObj.part.isTreeLeaf && !thisObj.part.isTreeExpanded) {
                    if (this.myDiagram.commandHandler.canExpandTree(thisObj.part)) {
                      this.myDiagram.commandHandler.expandTree(thisObj.part);  // collapses the tree
                    }
                  }
                }
              },

              new go.Binding("visible", "isTreeLeaf", function (leaf) { return !leaf }).ofObject(),
              new go.Binding("text", "isTreeExpanded", function (expand) { return expand ? "-" : "+" }).ofObject()),

          ),
          $(go.Shape, "LineH",
            {
              stretch: go.GraphObject.Horizontal,
              strokeWidth: 3, height: 3,
              // this line shape is the port -- what links connect with
              portId: "", fromSpot: go.Spot.LeftRightSides, toSpot: go.Spot.LeftRightSides
            },
            // make sure links come in from the proper direction and go out appropriately
            new go.Binding("fromSpot", "dir", (d) => { return this.spotConverter(d, true); }),
            new go.Binding("toSpot", "dir", (d) => { return this.spotConverter(d, false); })
          ),

          // remember the locations of each node in the node data
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
          // make sure text "grows" in the desired direction
          new go.Binding("locationSpot", "dir", (d) => { return this.spotConverter(d, false); })
        );

      // selected nodes show a button for adding children
      this.myDiagram.nodeTemplate.selectionAdornmentTemplate =
        $(go.Adornment, "Spot",
          $(go.Panel, "Auto",
            // this Adornment has a rectangular blue Shape around the selected node
            $(go.Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 2 }),
            $(go.Placeholder, { margin: new go.Margin(4, 4, 0, 4) })

          ),
          // and this Adornment has a Button to the right of the selected node

        );

      // and to perform a limited tree layout starting at that node
      this.myDiagram.nodeTemplate.contextMenu =
        $("ContextMenu",

          // $("ContextMenuButton",
          //   $(go.TextBlock, "Copy"),
          //   { click: (e, obj) => { e.diagram.commandHandler.copySelection(); } }),
          $("ContextMenuButton",
            $(go.TextBlock, "Delete"),
            { click: (e, obj) => { e.diagram.commandHandler.deleteSelection(); } }),
          // $("ContextMenuButton",
          //   $(go.TextBlock, "Undo"),
          //   { click: (e, obj) => { e.diagram.commandHandler.undo(); } }),
          // $("ContextMenuButton",
          //   $(go.TextBlock, "Redo"),
          //   { click: (e, obj) => { e.diagram.commandHandler.redo(); } }),
          // $("ContextMenuButton",
          //   $(go.TextBlock, "Layout"),
          //   {
          //     click: (e, obj) => {
          //       var adorn = obj.part;
          //       adorn.diagram.startTransaction("Subtree Layout");
          //       this.layoutTree(adorn.adornedPart);
          //       adorn.diagram.commitTransaction("Subtree Layout");
          //     }
          //   }
          // )
        );

      // a link is just a Bezier-curved line of the same color as the node to which it is connected
      this.myDiagram.linkTemplate =
        $(go.Link,
          {
            curve: go.Link.Bezier,
            fromShortLength: -2,
            toShortLength: -2,
            selectable: false
          },
          $(go.Shape,
            { strokeWidth: 3 }
          )
        );

      // the Diagram's context menu just displays commands for general functionality
      this.myDiagram.contextMenu =
        $("ContextMenu",
          // $("ContextMenuButton",
          //   $(go.TextBlock, "Paste"),
          //   { click: (e, obj) => { e.diagram.commandHandler.pasteSelection(e.diagram.toolManager.contextMenuTool.mouseDownPoint); } },
          //   new go.Binding("visible", "", (o) => { return o.diagram && o.diagram.commandHandler.canPasteSelection(o.diagram.toolManager.contextMenuTool.mouseDownPoint); }).ofObject()),
          // $("ContextMenuButton",
          //   $(go.TextBlock, "Undo"),
          //   { click: (e, obj) => { e.diagram.commandHandler.undo(); } },
          //   new go.Binding("visible", "", (o) => { return o.diagram && o.diagram.commandHandler.canUndo(); }).ofObject()),
          // $("ContextMenuButton",
          //   $(go.TextBlock, "Redo"),
          //   { click: (e, obj) => { e.diagram.commandHandler.redo(); } },
          //   new go.Binding("visible", "", (o) => { return o.diagram && o.diagram.commandHandler.canRedo(); }).ofObject()),

        );

      this.myDiagram.addDiagramListener("SelectionMoved", (e) => {
        console.log("SelectionMoved")

        var rootX = this.myDiagram.findNodeForKey(this.tree).location.x;
        this.myDiagram.nodes.each((node) => {
          if (node.data.parent !== this.tree) return; // Only consider nodes connected to the root
          var nodeX = node.location.x;
          if (rootX < nodeX && node.data.dir !== "right") {
            this.updateNodeDirection(node, "right");
          } else if (rootX > nodeX && node.data.dir !== "left") {
            this.updateNodeDirection(node, "left");
          }
          console.log("layout on SelectionMoved")
        });
        this.layoutAll()

      });
      this.reloadTree()
    })
  }
}
</script>