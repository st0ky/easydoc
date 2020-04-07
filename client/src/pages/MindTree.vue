<template>
  <!-- <div> -->

  <div style="border: solid 1px black; width:100%; min-height:calc(100vh - 50px)"></div>
  <!-- </div> -->
</template>

<script>

import go from 'gojs';
var $ = go.GraphObject.make;
// This works because we have overridden the /extensionsTS/tsconfig.json file
// in the options to the loader: 'ts-loader', in the webpack.config.js
// import { GuidedDraggingTool } from 'gojs/extensionsTS/GuidedDraggingTool.ts';




export default {
  name: 'MindTree',
  props: [''],
  components: {},
  data () {
    return {
      myDiagram: null,
      window: {
        width: 0,
        height: 0
      }
    }
  },
  computed: {

  },
  methods: {
    spotConverter (dir, from) {
      if (dir === "left") {
        return (from ? go.Spot.Left : go.Spot.Right);
      } else {
        return (from ? go.Spot.Right : go.Spot.Left);
      }
    },

    changeTextSize (obj, factor) {
      var adorn = obj.part;
      adorn.diagram.startTransaction("Change Text Size");
      var node = adorn.adornedPart;
      var tb = node.findObject("TEXT");
      tb.scale *= factor;
      adorn.diagram.commitTransaction("Change Text Size");
    },

    toggleTextWeight (obj) {
      var adorn = obj.part;
      adorn.diagram.startTransaction("Change Text Weight");
      var node = adorn.adornedPart;
      var tb = node.findObject("TEXT");
      // assume "bold" is at the start of the font specifier
      var idx = tb.font.indexOf("bold");
      if (idx < 0) {
        tb.font = "bold " + tb.font;
      } else {
        tb.font = tb.font.substr(idx + 5);
      }
      adorn.diagram.commitTransaction("Change Text Weight");
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
      if (node.data.key === 0) {  // adding to the root?
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
      var root = this.myDiagram.findNodeForKey(0);
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


    load () {
      this.myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
    },
    handleResize () {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    }

  },
  watch: {
    $route (to, from) {
      this.note = this.note
    }
  },
  mounted () {
    this.myDiagram =
      $(go.Diagram, this.$el, {
        // when the user drags a node, also move/copy/delete the whole subtree starting with that node
        "commandHandler.copiesTree": true,
        "commandHandler.copiesParentKey": true,
        "commandHandler.deletesTree": true,
        "draggingTool.dragsTree": true,
        "undoManager.isEnabled": true
      });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    this.myDiagram.addDiagramListener("Modified", (e) => {
      var button = document.getElementById("SaveButton");
      if (button) button.disabled = !this.myDiagram.isModified;
      var idx = document.title.indexOf("*");
      if (this.myDiagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.substr(0, idx);
      }
    });

    // a node consists of some text with a line shape underneath
    this.myDiagram.nodeTemplate =
      $(go.Node, "Vertical",
        { selectionObjectName: "TEXT" },
        $(go.TextBlock,
          {
            name: "TEXT",
            minSize: new go.Size(30, 15),
            editable: true
          },
          // remember not only the text string but the scale and the font in the node data
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("scale", "scale").makeTwoWay(),
          new go.Binding("font", "font").makeTwoWay()),
        $(go.Shape, "LineH",
          {
            stretch: go.GraphObject.Horizontal,
            strokeWidth: 3, height: 3,
            // this line shape is the port -- what links connect with
            portId: "", fromSpot: go.Spot.LeftRightSides, toSpot: go.Spot.LeftRightSides
          },
          new go.Binding("stroke", "brush"),
          // make sure links come in from the proper direction and go out appropriately
          new go.Binding("fromSpot", "dir", (d) => { return this.spotConverter(d, true); }),
          new go.Binding("toSpot", "dir", (d) => { return this.spotConverter(d, false); })),
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
          $(go.Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 3 }),
          $(go.Placeholder, { margin: new go.Margin(4, 4, 0, 4) })
        ),
        // and this Adornment has a Button to the right of the selected node
        $("Button",
          {
            alignment: go.Spot.Right,
            alignmentFocus: go.Spot.Left,
            click: this.addNodeAndLink  // define click behavior for this Button in the Adornment
          },
          $(go.TextBlock, "+",  // the Button content
            { font: "bold 8pt sans-serif" })
        )
      );

    // the context menu allows users to change the font size and weight,
    // and to perform a limited tree layout starting at that node
    this.myDiagram.nodeTemplate.contextMenu =
      $("ContextMenu",
        $("ContextMenuButton",
          $(go.TextBlock, "Bigger"),
          { click: (e, obj) => { this.changeTextSize(obj, 1.1); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "Smaller"),
          { click: (e, obj) => { this.changeTextSize(obj, 1 / 1.1); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "Bold/Normal"),
          { click: (e, obj) => { this.toggleTextWeight(obj); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "Copy"),
          { click: (e, obj) => { e.diagram.commandHandler.copySelection(); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "Delete"),
          { click: (e, obj) => { e.diagram.commandHandler.deleteSelection(); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "Undo"),
          { click: (e, obj) => { e.diagram.commandHandler.undo(); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "Redo"),
          { click: (e, obj) => { e.diagram.commandHandler.redo(); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "Layout"),
          {
            click: (e, obj) => {
              var adorn = obj.part;
              adorn.diagram.startTransaction("Subtree Layout");
              this.layoutTree(adorn.adornedPart);
              adorn.diagram.commitTransaction("Subtree Layout");
            }
          }
        )
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
          { strokeWidth: 3 },
          new go.Binding("stroke", "toNode", (n) => {
            if (n.data.brush) return n.data.brush;
            return "black";
          }).ofObject())
      );

    // the Diagram's context menu just displays commands for general functionality
    this.myDiagram.contextMenu =
      $("ContextMenu",
        $("ContextMenuButton",
          $(go.TextBlock, "Paste"),
          { click: (e, obj) => { e.diagram.commandHandler.pasteSelection(e.diagram.toolManager.contextMenuTool.mouseDownPoint); } },
          new go.Binding("visible", "", (o) => { return o.diagram && o.diagram.commandHandler.canPasteSelection(o.diagram.toolManager.contextMenuTool.mouseDownPoint); }).ofObject()),
        $("ContextMenuButton",
          $(go.TextBlock, "Undo"),
          { click: (e, obj) => { e.diagram.commandHandler.undo(); } },
          new go.Binding("visible", "", (o) => { return o.diagram && o.diagram.commandHandler.canUndo(); }).ofObject()),
        $("ContextMenuButton",
          $(go.TextBlock, "Redo"),
          { click: (e, obj) => { e.diagram.commandHandler.redo(); } },
          new go.Binding("visible", "", (o) => { return o.diagram && o.diagram.commandHandler.canRedo(); }).ofObject()),
        $("ContextMenuButton",
          $(go.TextBlock, "Save"),
          { click: (e, obj) => { save(); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "Load"),
          { click: (e, obj) => { save(); } })
      );

    this.myDiagram.addDiagramListener("SelectionMoved", (e) => {
      var rootX = this.myDiagram.findNodeForKey(0).location.x;
      this.myDiagram.selection.each((node) => {
        if (node.data.parent !== 0) return; // Only consider nodes connected to the root
        var nodeX = node.location.x;
        if (rootX < nodeX && node.data.dir !== "right") {
          this.updateNodeDirection(node, "right");
        } else if (rootX > nodeX && node.data.dir !== "left") {
          this.updateNodeDirection(node, "left");
        }
        this.layoutTree(node);
      });
    });
    this.myDiagram.model = go.Model.fromJson({      "class": "go.TreeModel",
      "nodeDataArray": [
        { "key": 0, "text": "Mind Map", "loc": "0 0" },
        { "key": 1, "parent": 0, "text": "Getting more time", "brush": "skyblue", "dir": "right", "loc": "77 -22" },
        { "key": 11, "parent": 1, "text": "Wake up early", "brush": "skyblue", "dir": "right", "loc": "200 -48" },
        { "key": 12, "parent": 1, "text": "Delegate", "brush": "skyblue", "dir": "right", "loc": "200 -22" },
        { "key": 13, "parent": 1, "text": "Simplify", "brush": "skyblue", "dir": "right", "loc": "200 4" },
        { "key": 2, "parent": 0, "text": "More effective use", "brush": "darkseagreen", "dir": "right", "loc": "77 43" },
        { "key": 21, "parent": 2, "text": "Planning", "brush": "darkseagreen", "dir": "right", "loc": "203 30" },
        { "key": 211, "parent": 21, "text": "Priorities", "brush": "darkseagreen", "dir": "right", "loc": "274 17" },
        { "key": 212, "parent": 21, "text": "Ways to focus", "brush": "darkseagreen", "dir": "right", "loc": "274 43" },
        { "key": 22, "parent": 2, "text": "Goals", "brush": "darkseagreen", "dir": "right", "loc": "203 56" },
        { "key": 3, "parent": 0, "text": "Time wasting", "brush": "palevioletred", "dir": "left", "loc": "-20 -31.75" },
        { "key": 31, "parent": 3, "text": "Too many meetings", "brush": "palevioletred", "dir": "left", "loc": "-117 -64.25" },
        { "key": 32, "parent": 3, "text": "Too much time spent on details", "brush": "palevioletred", "dir": "left", "loc": "-117 -25.25" },
        { "key": 33, "parent": 3, "text": "Message fatigue", "brush": "palevioletred", "dir": "left", "loc": "-117 0.75" },
        { "key": 331, "parent": 31, "text": "Check messages less", "brush": "palevioletred", "dir": "left", "loc": "-251 -77.25" },
        { "key": 332, "parent": 31, "text": "Message filters", "brush": "palevioletred", "dir": "left", "loc": "-251 -51.25" },
        { "key": 4, "parent": 0, "text": "Key issues", "brush": "coral", "dir": "left", "loc": "-20 52.75" },
        { "key": 41, "parent": 4, "text": "Methods", "brush": "coral", "dir": "left", "loc": "-103 26.75" },
        { "key": 42, "parent": 4, "text": "Deadlines", "brush": "coral", "dir": "left", "loc": "-103 52.75" },
        { "key": 43, "parent": 4, "text": "Checkpoints", "brush": "coral", "dir": "left", "loc": "-103 78.75" }
      ]
    })
  },
  created () {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  destroyed () {
    window.removeEventListener('resize', this.handleResize);
  },
}
</script>