import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const RBTree = forwardRef((props, ref) => {
    const nullNode = 'NULL';
    const [RBTree, setRBTree] = useState([{name:nullNode}]);
    const [animationSpeed, setAnimationSpeed] = useState(1500);

    const nodeSize = { x: 60, y: 60 };
    const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -25, y: -50 };

    // MARK: Custom node
    const renderForeignObjectNode = ({
        nodeDatum,
        toggleNode,
        foreignObjectProps
      }) => (
        <g>
          {/* <circle r={15}> fill={"red"}</circle> */}
          {/* `foreignObject` requires width & height to be explicitly set. */}
          <foreignObject {...foreignObjectProps}>
            <div style={{ borderStyle: "solid", borderWidth: "4px", borderColor: nodeDatum.color, backgroundColor: nodeDatum.backgroundColor, borderRadius: "25px"}}>
              <h3 style={{ textAlign: "center" }}>{nodeDatum.name}</h3>
            </div>
          </foreignObject>
        </g>
      );

    useImperativeHandle(ref, () => {
        return {insert: insertNode};
    });

    // MARK: Animations

    const sleep =  async () => {
        return new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    const animateNodeColor = async (tree, node, color='green') => {
        node.backgroundColor = color;
        setRBTree([...tree]);
        await sleep();
        node.backgroundColor = 'white';
        setRBTree([...tree]);
    }

    const animateNodeColors = async (tree, nodes, color) => {
        if (Array.isArray(color)) {
            if (color.length == nodes.length) {
                for (let i = 0; i < nodes.length; ++i) {
                    nodes[i].backgroundColor = color[i];
                }
            }
        }
        else {
            for (let i = 0; i < nodes.length; ++i) {
                nodes[i].backgroundColor = color;
            }
        }
        setRBTree([...tree]);
        await sleep();
        for (let i = 0; i < nodes.length; ++i) {
            nodes[i].backgroundColor = 'white';
        }
        setRBTree([...tree]);
    }

    const insertNode = async (value) => {
        var tree = RBTree;
        var newNode = {name: value, color: "red", parent: {name: nullNode}, children: [{name: nullNode, backgroundColor: "white"},{name: nullNode, backgroundColor: "white"}], backgroundColor: "white"};
        if(tree[0].name === nullNode){
            newNode.color = "black";
            tree[0] = newNode;
            await animateNodeColor(tree, tree[0], 'yellow');
        }
        else{
            var currentNode = tree[0];
            var prevNode = null;
            await animateNodeColor(tree, currentNode, 'green');
            while(currentNode.name !== nullNode){
                prevNode = currentNode;
                if(parseInt(value) < parseInt(currentNode.name)){
                    currentNode = currentNode.children[0];
                }
                else{
                    currentNode = currentNode.children[1]
                }
                await animateNodeColor(tree, currentNode, 'green');
            }

            if(parseInt(value) < parseInt(prevNode.name)){                
                prevNode.children[0] = newNode;
                newNode.parent = prevNode;
                await animateNodeColor(tree, prevNode.children[0], 'yellow');
            }
            else{
                prevNode.children[1] = newNode; 
               newNode.parent = prevNode;
               await animateNodeColor(tree, prevNode.children[1], 'yellow');
            }
        }
        setRBTree([...tree]);
        await rbInsertFixup(tree, newNode);
        setRBTree([...tree]);
        //printNode(tree[0]);
    }

    // print tree (pass in head of tree tree[0])
    const printNode = (node) => {
        if (node.name !== nullNode) {
            console.log(node);
            printNode(node.children[0]);
            printNode(node.children[1]);
        }
    }

    // MARK: helper functions for RB tree insert
    const rbInsertFixup = async (tree, element) => {
        if (element.parent.name === nullNode) {
            element.color = "black";
            return;
        }

        if (element.parent.color === "black") {
            return;
        }

        let parent = element.parent;
        let grandparent = getGrandparent(element);
        let uncle = getUncle(element);

        if (uncle.name !== nullNode && uncle.color === "red") {
            uncle.color = "black";
            parent.color = "black";
            grandparent.color = "red";
            rbInsertFixup(tree, grandparent);
            return;
        }

        if (element.name === parent.children[1].name && parent.name === grandparent.children[0].name) {
            await leftRotate(tree, parent);
            element = parent;
            parent = element.parent;
        }

        else if (element === parent.children[0] && parent === grandparent.children[1]) {
            await rightRotate(tree, parent);
            element = parent;
            parent = element.parent;
        }

        parent.color = "black";
        grandparent.color = "red";

        if (element === parent.children[0]) {
            await rightRotate(tree, grandparent);
        }

        else {
            await leftRotate(tree, grandparent);
        }

    }

    const leftRotate = async (tree, element) => {
        //await animateNodeColor(tree, element);
        await animateNodeColors(tree, [element, element.children[1]], ["plum", "PaleTurquoise"]);
        let temp = element.children[1];
        element.children[1] = temp.children[0];
        if (temp.children[0].name !== nullNode) {
            temp.children[0].parent = element;
        }
        temp.parent = element.parent;
        if (element.parent.name === nullNode) {
            tree[0] = temp;
        } else if (element.parent.children[0].name === element.name) {
            element.parent.children[0] = temp
        } else {
            element.parent.children[1] = temp;
        }
        temp.children[0] = element;
        element.parent = temp;
        await animateNodeColors(tree, [element, element.parent], ["plum", "PaleTurquoise"]);
    }

    const rightRotate = async (tree, element) => {
        //await animateNodeColor(tree, element);
        await animateNodeColors(tree, [element, element.children[0]], ["PaleTurquoise", "plum"]);
        let temp = element.children[0];
        element.children[0] = temp.children[1];
        if (temp.children[1].name !== nullNode) {
            temp.children[1].parent = element;
        }
        temp.parent = element.parent;
        if (element.parent.name === nullNode) {
            tree[0] = temp;
        } else if (element.parent.children[1].name === element.name) {
            element.parent.children[1] = temp
        } else {
            element.parent.children[0] = temp;
        }
        temp.children[1] = element;
        element.parent = temp;
        await animateNodeColors(tree, [element, element.parent], ["PaleTurquoise", "plum"]);
    } 

    const getGrandparent = (element) => {
        if (element.parent.name === nullNode) {
            return {name: nullNode};
        }
        return element.parent.parent;
    }

    const getUncle = (element) => {
        let grandparent = getGrandparent(element);
        if (grandparent.name === nullNode) {
            return {name: nullNode};
        }
        if (grandparent.children[0].name === element.parent.name) {
            return grandparent.children[1];
        }
        return grandparent.children[0];
    }

    return (
        <Tree
        data={RBTree}
        orientation={'vertical'}
        height={400}
        width={400}
        zoom={0.5}
        collapsible={false}
        depthFactor={60}
        translate ={{x: 450, y: 10}}
        renderCustomNodeElement={(rd3tProps) =>
            renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
          }
        />
    );
});

export default RBTree