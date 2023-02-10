import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const RBTree = forwardRef((props, ref) => {
    const nullNode = 'NULL';
    const [RBTree, setRBTree] = useState([{name:nullNode}]);
    const [animationSpeed, setAnimationSpeed] = useState(1500);

    const nodeSize = { x: 60, y: 70 }; // node size for render (this looks good imo)
    const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -25, y: -50 }; // offset so we look decent

    // MARK: Custom node
    const renderForeignObjectNode = ({
        nodeDatum,
        toggleNode,
        foreignObjectProps
      }) => (
        <g>
          <foreignObject {...foreignObjectProps}>
            <div style={{ borderStyle: "solid", borderWidth: "4px", borderColor: nodeDatum.color, backgroundColor: nodeDatum.backgroundColor, borderRadius: "25px"}}>
              <h3 style={{ textAlign: "center" }}>{nodeDatum.name}</h3>
            </div>
          </foreignObject>
        </g>
      );

    // functions that app.js can use
    useImperativeHandle(ref, () => {
        return {
            insert: insertNode,
            remove: removeKey,
            find: findKey
        };
    });

    // MARK: Animations

    // Allows for pause in annimations
    const sleep =  async () => {
        return new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    // animate one node color
    const animateNodeColor = async (tree, node, color='green') => {
        node.backgroundColor = color;
        setRBTree([...tree]);
        await sleep();
        node.backgroundColor = 'white';
        setRBTree([...tree]);
    }

    // animate many node colors at the same time
    const animateNodeColors = async (tree, nodes, color) => {
        if (Array.isArray(color)) {
            if (color.length === nodes.length) {
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

    // MARK: Search

    // exposed search function
    const findKey = async (key) => {
        key = parseInt(key);
        var tree = RBTree;
        
        if(tree[0].name !== nullNode){
            await treeSearch(tree, tree[0], key);
        }
    }

    // recursive search helper function
    const treeSearch = async (tree, node, key) => {
        if(node.name === nullNode) {
            await animateNodeColor(tree, node, 'red');
            return node;
        }
        else if (node.name == key) {
            await animateNodeColor(tree, node, 'blue');
            return node;
        }
        else {
            await animateNodeColor(tree, node, 'green');
            if (key < node.name) {
                return await treeSearch(tree, node.children[0], key);
            }
            else {
                return await treeSearch(tree, node.children[1], key);
            }
        }
    }

    // MARK: Insert

    // exposed insert function
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
    }

    // MARK: helper functions for RB tree insert

    // after a node is inserted, makes tree balenced if it needs to be
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

    // MARK: Remove

    // exposed remove function
    const removeKey = async (key) => {
        key = parseInt(key);
        var tree = RBTree;
        
        if (tree[0].name === nullNode) {
            return;
        }

        let node = await treeSearch(tree, tree[0], key);

        if (node.name !== nullNode) {
            await removeNode(tree, node);
        }
    }

    // MARK: helper functions for RB tree remove

    const removeNode = async (tree, node) => {
        if (node.children[0].name !== nullNode && node.children[1].name !== nullNode) {
            let predecessorNode = await getPredecessor(tree, node);
            let predecessorKey = predecessorNode.name;
            await removeNode(tree, predecessorNode);
            node.name = predecessorKey;
            await animateNodeColor(tree, node, "green");
            return;
        }

        if (node.color === "black") {
            await prepareForRemoval(tree, node);
        }
        await BSTRemove(tree, node);

        if (tree[0].name !== nullNode && tree[0].color === "red") {
            tree[0].color = "black";
        }

        setRBTree([...tree]);
    }

    const BSTRemove = async (tree, node) => {
        if (node.name === nullNode) {
            return;
        }

        if (node.children[0].name !== nullNode && node.children[1].name !== nullNode) {
            let successorNode = node.children[1];
            while (successorNode.children[0].name !== nullNode) {
                await animateNodeColor(tree, successorNode, "plum");
                successorNode = node.children[0];
            }
            await animateNodeColor(tree, successorNode, "green");

            let successorKey = successorNode.name;

            await BSTRemove(tree, successorNode);

            node.name = successorKey;
            await animateNodeColor(tree, node, "green");
        }

        else if (tree[0].name === node.name) {
            if (tree[0].name === nullNode) {
                tree[0] = node.children[0];
            }
            else {
                tree[0] = node.children[1];
            }

            if (tree[0].name !== nullNode) {
                tree[0].parent = {name: nullNode};
            }

            // delete node
        }

        else if (node.children[0] !== nullNode) {
            await replaceChild(tree, node.parent, node, node.children[0]);

            //delete node
        }

        else {
            await replaceChild(tree, node.parent, node, node.children[1]);

            //delete node
        }

    }

    const prepareForRemoval = async (tree, node) => {
        if (tryCase1(node)) {
            return;
        }

        let sibling = getSibling(node);

        if (await tryCase2(tree, node, sibling)) {
            sibling = getSibling(node);
        }
        if (await tryCase3(tree, node, sibling)) {
            return;
        }
        if (tryCase4(node, sibling)) {
            return;
        }
        if (await tryCase5(tree, node, sibling)) {
            sibling = getSibling(node);
        }
        if (await tryCase6(tree, node, sibling)) {
            sibling = getSibling(node);
        }

        sibling.color = node.parent.color;
        node.parent.color = "black";

        if (node.name === node.parent.children[0].name) {
            sibling.children[1].color = "black";
            await leftRotate(tree, node.parent);
        }
        else {
            sibling.children[0].color = "black";
            await rightRotate(tree, node.parent);
        }
    }

    const tryCase1 = (node) => {
        if (node.color === "red" || node.parent.name === nullNode) {
            return true;
        }
        return false;
    }

    const tryCase2 = async (tree, node, sibling) => {
        if (sibling.color === "red") {
            node.parent.color = "red";
            sibling.color = "black"
            if (node.name === node.parent.children[0].name) {
                await leftRotate(tree, node.parent)
            }
            else {
                await rightRotate(tree, node.parent);
            }
            return true;
        }
        return false;
    }

    const tryCase3 = async (tree, node, sibling) => {
        if (node.parent.color === "black" && areBothChildrenBlack(sibling)) {
            sibling.color = "red";
            await prepareForRemoval(tree, node.parent);
            return true;
        }
        return false;
    }

    const tryCase4 = (node, sibling) => {
        if (node.parent.color === "red" && areBothChildrenBlack(sibling)) {
            node.parent.color = "black";
            sibling.color = "red";
            return true;
        }
        return false;
    }

    const tryCase5 = async (tree, node, sibling) => {
        if (isNotNoneAndRed(sibling.children[0])) {
            if (isNoneOrBlack(sibling.children[1])) {
                if (node.name === node.parent.children[0].name) {
                    sibling.color = "red";
                    sibling.children[0].color = "black";
                    await rightRotate(tree, sibling);
                    return true;
                }
            }
        }
        return false;
    }

    const tryCase6 = async (tree, node, sibling) => {
        if (isNoneOrBlack(sibling.children[0])) {
            if (isNotNoneAndRed(sibling.children[1])) {
                if (node.name === node.parent.children[1].name) {
                    sibling.color = "red";
                    sibling.children[1].color = "black";
                    await leftRotate(tree, sibling);
                    return true;
                }
            }
        }
        return false;
    }

    const replaceChild = async (tree, node, curChild, newChild) => {
        if (node.children[0].name === curChild.name) {
            node.children[0] = newChild;
            await animateNodeColor(tree, newChild, "green");
            return true;
        }
        else if (node.children[1].name === curChild.name) {
            node.children[1] = newChild;
            await animateNodeColor(tree, newChild, "green");
            return true;
        }
        return false;
    }

    const isNotNoneAndRed = (node) => {
        if (node.name === nullNode) {
            return false;
        }
        if (node.color === "red") {
            return true;
        }
        return false;
    }

    const isNoneOrBlack = (node) => {
        if (node.name === nullNode) {
            return true;
        }
        if (node.color === "black") {
            return true;
        }
        return false;
    }

    const areBothChildrenBlack = (node) => {
        // if (node.children[0].name !== nullNode && node.children[1].name !== nullNode) {
        //     return true;
        // }
        if (node.name == nullNode) {
            return false;
        }
        if (node.children[0].name !== nullNode && node.children[0].color === "red") {
            return false;
        }
        if (node.children[1].name !== nullNode && node.children[1].color === "red") {
            return false;
        }
        return true;
    }

    const getSibling = (node) => {
        if (node.parent.name !== nullNode) {
            if (node.name === node.parent.children[0].name) {
                return node.parent.children[1];
            }
            return node.parent.children[0];
        }
        return {name: nullNode};
    }

    const getPredecessor = async (tree, node) => {
        let curNode = node.children[0];
        while (curNode.children[1].name !== nullNode) {
            await animateNodeColor(tree, curNode, "plum");
            curNode = curNode.children[1];
        }
        await animateNodeColor(tree, curNode, "green");
        console.log("pred is:")
        console.log(curNode)
        return curNode;
    }

    // MARK: Common helper functions

    // print tree (pass in head of tree tree[0])
    const printNode = (node) => {
        if (node.name !== nullNode) {
            console.log(node);
            printNode(node.children[0]);
            printNode(node.children[1]);
        }
    }

    // left rotation on element
    const leftRotate = async (tree, element) => {
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

    // right rotation on element
    const rightRotate = async (tree, element) => {
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