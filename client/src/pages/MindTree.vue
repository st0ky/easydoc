<template>
  <q-page class="q-pa-md row items-stretch">
    <q-card
      class="col-12 q-pa-none"
      style="min-height: 300px"
      flat
      bordered
      :class="$q.dark.isActive ? 'elev-8dp' : 'bg-grey-3'"
      @keyup.insert.stop
      @keyup="onKeyUp"
    >
      <div class="fit" ref="mindtree" />
      <q-menu
        no-parent-event
        ref="nodeMenuRef"
        anchor="top left"
        self="top left"
        :offset="nodeMenu"
      >
        <q-list style="min-width: 100px" v-if="curNode" dir="ltr">
          <q-item clickable>
            <q-item-section>Tags</q-item-section>
            <q-item-section side>
              <q-icon name="keyboard_arrow_right" />
            </q-item-section>
            <q-menu anchor="top right" self="top left">
              <q-list>
                <q-item
                  v-for="tag in tags"
                  :key="tag"
                  dense
                  clickable
                  v-close-popup
                  @click="toggleTag(curNode.data.key, tag)"
                >{{ tag }}</q-item>
              </q-list>
            </q-menu>
          </q-item>
          <q-item
            clickable
            v-close-popup
            dense
            @click="newNote(curNode.data.key)"
          >New Node (Insert \ N)</q-item>
          <q-item clickable v-close-popup dense @click="deleteNote(curNode.data.key)">Delete (Del)</q-item>
          <q-item
            clickable
            v-close-popup
            dense
            v-if="!curNode.isTreeLeaf"
            @click="collapseExpand(curNode)"
          >Collapse / Expand (CTRL + LEFT \ RIGHT)</q-item>
          <q-item
            :to="{
              name: 'noteView',
              params: { tree: this.tree, note: curNode.data.key }
            }"
            v-close-popup
            dense
          >Go To Note (Double Click)</q-item>
        </q-list>
      </q-menu>
    </q-card>
  </q-page>
</template>

<script>
import { mapState } from "vuex";
import { colors } from "quasar";

import go from "gojs";
var $ = go.GraphObject.make;
// This works because we have overridden the /extensionsTS/tsconfig.json file
// in the options to the loader: 'ts-loader', in the webpack.config.js
// import { DrawCommandHandler } from 'gojs/extensionsJSM/DrawCommandHandler.js';
import { DrawCommandHandler } from "components/DrawCommandHandler.js";

export default {
  name: "MindTree",
  props: { tree: { type: Number, required: true } },
  components: {},
  data() {
    return {
      myDiagram: null,
      window: {
        width: 0,
        height: 0
      },
      model: new go.TreeModel([]),
      _modelCopy: {},
      _lastNew: null,
      nodeMenu: [5, 5],
      curNode: null,
      _waiting: false
    };
  },
  computed: {
    ...mapState("notes", ["notes", "trees"]),
    ...mapState("socket", ["tags"]),

    ourTree() {
      return this.trees[this.tree] !== undefined
        ? [this.tree, this.trees[this.tree]]
        : [-1, {}];
    },
    treeTitles() {
      let res = {};
      for (let node of Object.values(this.ourTree[1])) {
        res[node.note] = this.notes[node.note].title;
      }
      return res;
    },
    treeTags() {
      let res = {};
      for (let node of Object.values(this.ourTree[1])) {
        res[node.note] = JSON.stringify(this.notes[node.note].tags);
      }
      return res;
    },
    editing() {
      return (
        this.myDiagram &&
        this.myDiagram.toolManager &&
        this.myDiagram.toolManager.textEditingTool.state.name !== "StateNone"
      );
    }
  },
  methods: {
    onKeyUp(e) {
      console.log("editing", this._waiting);
      if (this.editing || (this._waiting && e.key === "Escape")) {
        e.stopPropagation();
      }
      this._waiting = false;
    },

    toggleTag(noteId, tag) {
      let cur = this.notes[noteId].tags.slice();
      if (cur.indexOf(tag) != -1) {
        cur.splice(cur.indexOf(tag), 1);
      } else {
        cur.push(tag);
      }
      this.$socket.emit("update note", { id: noteId, tags: cur });
    },
    onPaste(e) {
      let parent = this.myDiagram.selection.first();
      if (!parent) return;
      parent = parent.data.key;

      let types = e.clipboardData.types.slice();
      console.log(types);
      if (types.indexOf("notes/tree") != -1) {
        console.log("notes/tree");
        e.preventDefault();
        let subtree = JSON.parse(e.clipboardData.getData("notes/tree"));
        this.$socket.emit("new subtree", {
          treeId: this.tree,
          subtree: subtree,
          parentId: parent
        });
        return;
      }
      if (types.indexOf("text/plain") != -1) {
        e.preventDefault();
        let text = e.clipboardData.getData("text/plain");
        let lines = text.split(text.indexOf("\r\n") !== -1 ? "\r\n" : "\n");

        let sep = null;
        let res = {};
        let stack = [{ children: [] }];

        for (let line of lines) {
          if (!line) continue;
          if (line.startsWith("\t")) {
            if (sep !== null && sep !== "\t") return;
            if (sep === null) sep = "\t";
          }
          if (line.startsWith(" ")) {
            if (sep !== null && !sep.startsWith(" ")) return;
            if (sep === null) sep = /^ +/.exec(line).pop();
          }
          if (sep === null) {
            var key = line;
            var lvl = 1;
          } else {
            var key = new RegExp(`^(${sep})*(.*)`).exec(line).pop();
            var lvl = (line.length - key.length) / sep.length + 1;
          }
          if (stack.length > lvl) {
            stack = stack.slice(0, lvl);
          }
          if (stack.length < lvl) {
            while (stack.length < lvl) {
              let obj = { title: "", children: [] };
              stack[stack.length - 1].children.push(obj);
              stack[stack.length] = obj;
            }
          }
          let obj = { title: key, children: [] };
          stack[lvl - 1].children.push(obj);
          stack[lvl] = obj;
        }
        this.$socket.emit("new subtree", {
          treeId: this.tree,
          subtree: stack[0],
          parentId: parent
        });
      }
      return true;
    },
    onCopy(e) {
      let plain = "";
      let notesTree = { children: [] };
      let notesId = [];
      this.myDiagram.selection.each(sel => {
        let queue = [[0, notesTree, sel.data.key]];
        while (queue.length) {
          let [lvl, parent, note] = queue.pop();
          let obj = { ...this.notes[note], children: [] };
          parent.children.push(obj);
          notesId.push(note);
          plain += "\t".repeat(lvl) + this.notes[note].title + "\r\n";
          for (let child of this.trees[this.tree][note].children) {
            queue.push([lvl + 1, obj, child.note]);
          }
        }
      });
      if (plain) {
        plain = plain.slice(0, plain.length - 2);
      }
      console.log(JSON.stringify(notesTree));
      e.clipboardData.setData("notes/tree", JSON.stringify(notesTree));
      e.clipboardData.setData("text/plain", plain);
      e.preventDefault();
      notesId = Array.from(new Set(notesId));
      return notesId;
    },
    onCut(e) {
      let notesId = this.onCopy(e);
      for (let note of notesId) {
        this.deleteNote(note, false);
      }
    },

    deleteNote(noteId, selectParent = true) {
      let node = this.myDiagram.findNodeForKey(noteId);
      if (node) {
        if (selectParent) {
          let parent = node.findTreeParentNode();
          if (parent) this.myDiagram.select(parent);
        }
        node.isSelected = false;
      }
      this.$socket.emit("delete note", noteId);
    },
    newNote(parent) {
      this.sockets.subscribe("new note ack", noteId => {
        this.$socket.emit("move note", {
          noteId: noteId,
          treeId: this.tree,
          parentId: parent
        });
        this._lastNew = noteId;

        this.sockets.unsubscribe("new note ack");
      });
      this.$socket.emit("new note", { title: "new note" });
    },
    spotConverter(dir, from) {
      if (dir === "right") {
        return from ? go.Spot.Right : go.Spot.Left;
      } else {
        return from ? go.Spot.Left : go.Spot.Right;
      }
    },

    updateNodeDirection(node, dir) {
      this.myDiagram.model.setDataProperty(node.data, "dir", dir);
      // recursively update the direction of the child nodes
      var chl = node.findTreeChildrenNodes(); // gives us an iterator of the child nodes related to this particular node
      while (chl.next()) {
        this.updateNodeDirection(chl.value, dir);
      }
    },

    addNodeAndLink(e, obj) {
      var adorn = obj.part;
      var diagram = adorn.diagram;
      diagram.startTransaction("Add Node");
      var oldnode = adorn.adornedPart;
      var olddata = oldnode.data;
      // copy the brush and direction to the new node data
      var newdata = {
        text: "idea",
        brush: olddata.brush,
        dir: olddata.dir,
        parent: olddata.key
      };
      diagram.model.addNodeData(newdata);
      this.layoutTree(oldnode);
      diagram.commitTransaction("Add Node");

      // if the new node is off-screen, scroll the diagram to show the new node
      var newnode = diagram.findNodeForData(newdata);
      if (newnode !== null) diagram.scrollToRect(newnode.actualBounds);
    },

    layoutTree(node) {
      if (node.data.key == this.tree) {
        // adding to the root?
        this.layoutAll(); // lay out everything
      } else {
        // otherwise lay out only the subtree starting at this parent node
        var parts = node.findTreeParts();
        this.layoutAngle(parts, node.data.dir === "right" ? 0 : 180);
      }
    },

    layoutAngle(parts, angle) {
      var layout = go.GraphObject.make(go.TreeLayout, {
        angle: angle,
        arrangement: go.TreeLayout.ArrangementFixedRoots,
        nodeSpacing: 5,
        layerSpacing: 20,
        setsPortSpot: false, // don't set port spots since we're managing them with our spotConverter function
        setsChildPortSpot: false
      });
      layout.doLayout(parts);
    },

    layoutAll() {
      var root = this.myDiagram.findNodeForKey(this.tree);
      if (root === null) return;
      this.myDiagram.startTransaction("Layout");
      // split the nodes and links into two collections
      var rightward = new go.Set(/*go.Part*/);
      var leftward = new go.Set(/*go.Part*/);
      root.findLinksConnected().each(link => {
        var child = link.toNode;
        if (child.data.dir === "right") {
          rightward.add(root); // the root node is in both collections
          rightward.add(link);
          rightward.addAll(child.findTreeParts());
        } else {
          leftward.add(root); // the root node is in both collections
          leftward.add(link);
          leftward.addAll(child.findTreeParts());
        }
      });
      // do one layout and then the other without moving the shared root node
      this.layoutAngle(rightward, 0);
      this.layoutAngle(leftward, 180);
      this.myDiagram.commitTransaction("Layout");
    },

    collapseExpand(o) {
      if (!o.part.isTreeLeaf && o.part.isTreeExpanded) {
        if (this.myDiagram.commandHandler.canCollapseTree(o.part)) {
          this.myDiagram.commandHandler.collapseTree(o.part); // collapses the tree
        }
      } else if (!o.part.isTreeLeaf && !o.part.isTreeExpanded) {
        if (this.myDiagram.commandHandler.canExpandTree(o.part)) {
          this.myDiagram.commandHandler.expandTree(o.part); // collapses the tree
        }
      }
    },

    detectChanges(to, from) {
      let deleted = [];
      for (let val of Object.values(this._modelCopy)) {
        if (this.trees[this.tree][val.key] === undefined) deleted.push(val);
      }
      let created = [];
      for (let val of Object.values(this.trees[this.tree])) {
        if (this._modelCopy[val.note] === undefined) created.push(val);
      }
      let changed = [];
      for (let val of Object.values(this.trees[this.tree])) {
        if (this._modelCopy[val.note] === undefined) continue;
        if (this._modelCopy[val.note].parent == "null") continue;
        if (this._modelCopy[val.note].parent == val.parent) continue;
        changed.push(val);
      }
      return { changed: changed, created: created, deleted };
    },

    reloadTree() {
      console.log("reload tree");
      if (!this.trees[this.tree]) {
        console.log("no such tree");
        return;
      }
      let model = [];
      this._modelCopy = {};
      for (let [key, node] of Object.entries(this.trees[this.tree])) {
        let obj = {
          key: parseInt(key),
          parent: node.parent,
          text: this.notes[node.note].title,
          tags: this.notes[node.note].tags,
          dir: "left"
        };
        if (typeof obj.parent != "number") {
          obj.parent = String(obj.parent);
        }
        this._modelCopy[obj.key] = obj;
        model.push(obj);
      }
      this.model = new go.TreeModel(model);
      this.myDiagram.model = this.model;
      this.updateColors();
      this.layoutAll();
    },

    updateColors() {
      let dark = this.$q.dark.isActive;
      this.model.setDataProperty(
        this.model.modelData,
        "lineColor",
        dark ? "grey" : "black"
      );
      this.model.setDataProperty(
        this.model.modelData,
        "textColor",
        dark ? "white" : "black"
      );
      this.model.setDataProperty(
        this.model.modelData,
        "primaryColor",
        colors.getBrand("primary")
      );
      this.model.setDataProperty(
        this.model.modelData,
        "onPrimaryColor",
        colors.getBrand("on-primary")
      );
      this.model.setDataProperty(
        this.model.modelData,
        "secondColor",
        colors.getBrand("secondary")
      );
    }
  },
  watch: {
    "$q.dark.isActive": function() {
      this.updateColors();
    },

    ourTree: {
      handler: function([toTreeId, toTree], [fromTreeId, fromTree]) {
        if (toTreeId != fromTreeId) {
          this.reloadTree();
          return;
        }
        let { changed, created, deleted } = this.detectChanges(
          toTree,
          fromTree
        );
        if (
          (changed.length && created.length) ||
          (deleted.length && created.length) ||
          (deleted.length && changed.length)
        ) {
          this.reloadTree();
          return;
        }
        for (let obj of deleted) {
          this.model.removeNodeData(this.model.findNodeDataForKey(obj.note));
          // let parent = this._modelCopy[obj.note].parent
          delete this._modelCopy[obj.note];
          // this.layoutTree(this.myDiagram.findNodeForKey(parent));
        }
        for (let obj of changed) {
          this.model.setParentKeyForNodeData(
            this.model.findNodeDataForKey(obj.note),
            obj.parent
          );
          this._modelCopy[obj.note].parent = obj.parent;
          if (Number.isInteger(this._lastNew) && this._lastNew == obj.note) {
            let tb = this.myDiagram
              .findNodeForKey(this._lastNew)
              .findObject("TITLE");
            this.$nextTick(() => {
              this.myDiagram.select(tb.part);
              this.myDiagram.commandHandler.editTextBlock(tb);
            });
          }

          // this.layoutTree(this.myDiagram.findNodeForKey(obj.parent));
        }
        for (let obj of created) {
          obj = {
            key: obj.note,
            parent: obj.parent,
            text: this.notes[obj.note].title,
            tags: this.notes[obj.note].tags,
            dir: this._modelCopy[obj.parent].dir
          };
          this.model.addNodeData(obj);
          this._modelCopy[obj.key] = obj;
          // this.layoutTree(this.myDiagram.findNodeForKey(obj.key));
        }
        this.layoutAll();
      },
      deep: true
    },
    treeTitles: function(to, from) {
      for (let [k, v] of Object.entries(to)) {
        if (from[k] == v) continue;
        this.model.setDataProperty(
          this.model.findNodeDataForKey(parseInt(k)),
          "text",
          v
        );
        this.layoutTree(this.myDiagram.findNodeForKey(parseInt(k)));
      }
    },
    treeTags: function(to, from) {
      for (let [k, v] of Object.entries(to)) {
        if (from[k] == v) continue;
        this.model.setDataProperty(
          this.model.findNodeDataForKey(parseInt(k)),
          "tags",
          JSON.parse(v)
        );
        this.layoutTree(this.myDiagram.findNodeForKey(parseInt(k)));
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.myDiagram = $(go.Diagram, this.$refs.mindtree, {
        commandHandler: new DrawCommandHandler(this),
        "commandHandler.arrowKeyBehavior": "tree",
        // when the user drags a node, also move/copy/delete the whole subtree starting with that node
        // "commandHandler.copiesTree": true,
        // "commandHandler.copiesParentKey": true,
        // "commandHandler.deletesTree": true,
        "draggingTool.dragsTree": true,
        "draggingTool.isCopyEnabled": false,
        "animationManager.isEnabled": false,
        "textEditingTool.isEnabled": false,
        // "undoManager.isEnabled": true
        hasVerticalScrollbar: false,
        hasHorizontalScrollbar: false
      });
      var tool = this.myDiagram.toolManager.textEditingTool;
      tool.doCancel = () => {
        this._waiting = true;
        go.TextEditingTool.prototype.doCancel.call(tool);
      };

      // when the document is modified, add a "*" to the title and enable the "Save" button
      this.myDiagram.addDiagramListener("Modified", e => {
        console.log("Modified", this.model);
      });

      this.myDiagram.addDiagramListener("TextEdited", e => {
        this._lastNew = null;
        this.$socket.emit("update note", {
          id: e.subject.part.data.key,
          title: e.subject.text
        });
        this.layoutAll();
      });
      this.myDiagram.addDiagramListener("TreeExpanded", () => {
        this.$nextTick(this.layoutAll);
      });
      this.myDiagram.addDiagramListener("TreeCollapsed", () => {
        this.$nextTick(this.layoutAll);
      });

      // a node consists of some text with a line shape underneath
      this.myDiagram.nodeTemplate = $(
        go.Node,
        "Vertical",
        {
          selectionObjectName: "TEXT",
          doubleClick: (e, thisObj) => {
            var inp = this.myDiagram.lastInput;

            this.$router.push({
              name: "noteView",
              params: { tree: this.tree, note: thisObj.part.data.key }
            });
            e.handled = true;
          }
        },
        {
          mouseDragEnter: (e, node, prev) => {
            var diagram = node.diagram;
            if (!diagram.selection.count) return;
            var shape = node.findObject("NODE");
            if (shape) {
              if (shape.dragCount === undefined) shape.dragCount = 0;
              shape.dragCount += 1;
              shape.strokeWidth = "1";
              shape.stroke = this.$q.dark.isActive ? "white" : "black";
              shape.strokeDashArray = [3];
            }
          },
          mouseDragLeave: (e, node, next) => {
            var shape = node.findObject("NODE");
            if (shape) {
              if (shape.dragCount === undefined) shape.dragCount = 1;
              shape.dragCount -= 1;
              if (shape.dragCount == 0) {
                shape.stroke = null;
              }
            }
          },
          mouseDrop: (e, node) => {
            var diagram = node.diagram;
            let curNote = node.data.key;
            diagram.selection.each(sel => {
              if (!(sel instanceof go.Node)) return;
              if (!Number.isInteger(sel.data.key)) return;
              this.$socket.emit("move note", {
                noteId: sel.data.key,
                treeId: this.tree,
                parentId: curNote
              });
            });
          }
        },
        $(
          go.Panel,
          "Auto",
          $(go.Shape, { fill: null, stroke: null, name: "NODE" }),
          $(
            go.Panel,
            "Horizontal",
            {
              isOpposite: true,
              margin: new go.Margin(4, 4, 4, 4),
              name: "TEXT"
            },
            $(
              go.TextBlock,
              {
                font:
                  "14px Roboto, -apple-system, Helvetica Neue, Helvetica, Arial, sans-serif",
                minSize: new go.Size(30, 15),
                editable: true,
                isMultiline: false,
                name: "TITLE"
              },
              new go.Binding("stroke", "textColor").ofModel(),
              new go.Binding("text", "text")
            ),
            $(
              go.TextBlock,
              {
                margin: new go.Margin(4, 4, 4, 4),
                font: "25px Consolas",
                toolTip: $(
                  "ToolTip",
                  $(
                    go.TextBlock,
                    "expand / collapse\ntype CTRL + LEFT / RIGHT",
                    { margin: 4 }
                  )
                ),
                click: (e, o) => {
                  this.collapseExpand(o);
                }
              },
              new go.Binding("stroke", "secondColor").ofModel(),
              new go.Binding("visible", "isTreeLeaf", function(leaf) {
                return !leaf;
              }).ofObject(),
              new go.Binding("text", "isTreeExpanded", function(expand) {
                return expand ? "-" : "+";
              }).ofObject()
            ),
            new go.Binding("isOpposite", "dir", function(dir) {
              return !(dir === "right");
            })
          )
        ),
        $(
          go.Shape,
          "LineH",
          {
            stretch: go.GraphObject.Horizontal,
            strokeWidth: 3,
            height: 3,
            // this line shape is the port -- what links connect with
            portId: "",
            fromSpot: go.Spot.LeftRightSides,
            toSpot: go.Spot.LeftRightSides
          },
          new go.Binding("stroke", "lineColor").ofModel(),
          // make sure links come in from the proper direction and go out appropriately
          new go.Binding("fromSpot", "dir", d => {
            return this.spotConverter(d, true);
          }),
          new go.Binding("toSpot", "dir", d => {
            return this.spotConverter(d, false);
          })
        ),
        $(go.Panel, "Horizontal", new go.Binding("itemArray", "tags"), {
          itemTemplate: $(
            go.Panel,
            "Auto",
            { margin: 2 },
            $(
              go.Shape,
              "RoundedRectangle",
              { strokeWidth: 0 },
              new go.Binding("fill", "primaryColor").ofModel()
            ),
            $(
              go.TextBlock,
              new go.Binding("text", ""),
              {
                margin: 2,
                font: "12px Roboto"
                // stroke: "var(--q-color-on-primary)"
              },
              new go.Binding("stroke", "onPrimaryColor").ofModel()
            )
          ) // end of itemTemplate
        }),

        // remember the locations of each node in the node data
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        // make sure text "grows" in the desired direction
        new go.Binding("locationSpot", "dir", d => {
          return this.spotConverter(d, false);
        })
      );

      // selected nodes show a button for adding children
      this.myDiagram.nodeTemplate.selectionAdornmentTemplate = $(
        go.Adornment,
        "Spot",
        $(
          go.Panel,
          "Auto",
          // this Adornment has a rectangular blue Shape around the selected node
          $(
            go.Shape,
            { fill: null, strokeWidth: 2 },
            new go.Binding("stroke", "secondColor").ofModel()
          ),
          $(go.Placeholder, { margin: new go.Margin(4, 4, 4, 4) })
        )
        // and this Adornment has a Button to the right of the selected node
      );

      // and to perform a limited tree layout starting at that node
      this.myDiagram.nodeTemplate.contextMenu = $(go.HTMLInfo, {
        show: (obj, diagram, tool) => {
          var mousePt = diagram.lastInput.viewPoint;
          this.curNode = obj;
          this.nodeMenu = [-(mousePt.x + 4), -(mousePt.y + 2)];
          this.$nextTick(this._nodeMenu.show);
        },
        hide: () => {
          this._nodeMenu.hide();
        }
      });

      // $("ContextMenuButton",
      //   $(go.TextBlock, "Copy"),
      //   { click: (e, obj) => { e.diagram.commandHandler.copySelection(); } }),
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

      // a link is just a Bezier-curved line of the same color as the node to which it is connected
      this.myDiagram.linkTemplate = $(
        go.Link,
        {
          curve: go.Link.Bezier,
          fromShortLength: -2,
          toShortLength: -2,
          selectable: false
        },
        $(
          go.Shape,
          { strokeWidth: 3 },
          new go.Binding("stroke", "lineColor").ofModel()
        )
      );

      // the Diagram's context menu just displays commands for general functionality
      this.myDiagram.contextMenu = $(
        "ContextMenu"
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

      this.myDiagram.addDiagramListener("SelectionMoved", e => {
        console.log("SelectionMoved");

        var rootX = this.myDiagram.findNodeForKey(this.tree).location.x;
        this.myDiagram.nodes.each(node => {
          if (node.data.parent !== this.tree) return; // Only consider nodes connected to the root
          var nodeX = node.location.x;
          if (rootX < nodeX && node.data.dir !== "right") {
            this.updateNodeDirection(node, "right");
          } else if (rootX > nodeX && node.data.dir !== "left") {
            this.updateNodeDirection(node, "left");
          }
        });
        this.layoutAll();
      });
      this._nodeMenu = this.$refs.nodeMenuRef;
      this.reloadTree();
    });
  },
  created() {
    document.addEventListener("paste", this.onPaste);
    document.addEventListener("copy", this.onCopy);
    document.addEventListener("cut", this.onCut);
  },
  destroyed() {
    document.removeEventListener("paste", this.onPaste);
    document.removeEventListener("copy", this.onCopy);
    document.removeEventListener("cut", this.onCut);
  }
};
</script>
