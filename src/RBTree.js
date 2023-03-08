import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const RBTree = forwardRef((props, ref) => {
    const nullNode = 'NULL'; // redef to make it easier
    const [RBTree, setRBTree] = useState([{name:nullNode}]); 
    const [animationSpeed, setAnimationSpeed] = useState(1500); // speed animation

    const nodeSize = { x: 60, y: 70 }; // node size for render (this looks good imo)
    const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -25, y: -50 }; // offset so we look decent

    // MARK: Custom node
    const renderForeignObjectNode = ({
        nodeDatum,
        toggleNode,
        foreignObjectProps
      }) => ( // use html to def node
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

    // animate one node color, make default green
    const animateNodeColor = async (tree, node, color='green') => {
        node.backgroundColor = color; // set color
        setRBTree([...tree]); // remake tree with color
        await sleep(); // so we can see change
        node.backgroundColor = 'white'; //set back to original color
        setRBTree([...tree]); // remake tree with color
    }

    // animate many node colors at the same time, takes in an array of colors and nodes
    const animateNodeColors = async (tree, nodes, color) => {
        if (Array.isArray(color)) { // if the type is an array
            if (color.length === nodes.length) { // same array length
                for (let i = 0; i < nodes.length; ++i) {
                    nodes[i].backgroundColor = color[i]; // match up colors and nodes
                }
            }
        }
        else { // type should be string
            for (let i = 0; i < nodes.length; ++i) {
                nodes[i].backgroundColor = color; // set background color
            }
        }
        setRBTree([...tree]); // remake tree with color
        await sleep();
        for (let i = 0; i < nodes.length; ++i) {
            nodes[i].backgroundColor = 'white'; //set back to original color
        }
        setRBTree([...tree]); // remake tree with color
    }

    // MARK: Search

    // exposed search function
    // key: key we are searching for
    const findKey = async (key) => {
        key = parseInt(key); // make sure int
        var tree = RBTree; // set tree
        
        if(tree[0].name !== nullNode){ // check if null
            await treeSearch(tree, tree[0], key); // go to recursive search func
        }
    }

    // recursive search helper function
    // tree: tree to pass through
    // node: cur node checking
    // key: key we look for
    const treeSearch = async (tree, node, key) => {
        if(node.name === nullNode) { // did not find node
            await animateNodeColor(tree, node, 'red'); // flash red
            return node;
        }
        else if (node.name == key) { // found node
            await animateNodeColor(tree, node, 'blue'); // flash blue
            return node;
        }
        else { // keep searching
            await animateNodeColor(tree, node, 'green'); // flash green
            if (key < node.name) { // less
                return await treeSearch(tree, node.children[0], key); // go left child
            }
            else { // more
                return await treeSearch(tree, node.children[1], key); // go right child
            }
        }
    }

    // MARK: Insert

    // exposed insert function
    // value: value we are inserting
    const insertNode = async (value) => {
        var tree = RBTree; // set tree
        // create a new node to insert
        var newNode = {name: value, color: "red", parent: {name: nullNode}, children: [{name: nullNode, backgroundColor: "white"},{name: nullNode, backgroundColor: "white"}], backgroundColor: "white"};
        if(tree[0].name === nullNode){ // if we are inserting the root
            newNode.color = "black";
            tree[0] = newNode; // set root
            await animateNodeColor(tree, tree[0], 'yellow'); // flash yellow
        }
        else{ // not root
            var currentNode = tree[0]; // set temp var current
            var prevNode = null; // set temp var prev
            await animateNodeColor(tree, currentNode, 'green'); // flash green
            // search
            while(currentNode.name !== nullNode){ // until not null
                prevNode = currentNode; // reset
                if(parseInt(value) < parseInt(currentNode.name)){ // less
                    currentNode = currentNode.children[0]; //go left child
                }
                else{ // more
                    currentNode = currentNode.children[1] // go right child
                }
                await animateNodeColor(tree, currentNode, 'green'); // flash green
            }

            // once our leaf node is found
            if(parseInt(value) < parseInt(prevNode.name)){ // if left          
                prevNode.children[0] = newNode; // insert as left child
                newNode.parent = prevNode; // make connection to parent
                await animateNodeColor(tree, prevNode.children[0], 'yellow'); // flash yellow
            }
            else{ // right
                prevNode.children[1] = newNode; // insert as right child
               newNode.parent = prevNode; // make connection to parent
               await animateNodeColor(tree, prevNode.children[1], 'yellow'); // flash yellow
            }
        }
        setRBTree([...tree]); // update fixes
        await rbInsertFixup(tree, newNode); // fixup, possibly rebalance 
        setRBTree([...tree]); // update fixes
    }

    // MARK: helper functions for RB tree insert

    // after a node is inserted, makes tree balenced if it needs to be
    // tree: tree to pass through
    // element: element we inserted
    const rbInsertFixup = async (tree, element) => {
        if (element.parent.name === nullNode) { // always make root node black
            element.color = "black";
            return;
        }

        if (element.parent.color === "black") { // if parent is plack we dont need to do anything
            return;
        }

        // set temps to nodes, we will use info abt these later
        let parent = element.parent;
        let grandparent = getGrandparent(element);
        let uncle = getUncle(element);

        if (uncle.name !== nullNode && uncle.color === "red") { // if uncle is red
            // recolor
            uncle.color = "black";
            parent.color = "black";
            grandparent.color = "red";
            rbInsertFixup(tree, grandparent); // recurse to fix up grandparent
            return;
        }

        // uncle is black

        if (element.name === parent.children[1].name && parent.name === grandparent.children[0].name) { // double rotate triangle
            await leftRotate(tree, parent);
            element = parent;
            parent = element.parent;
        }

        else if (element === parent.children[0] && parent === grandparent.children[1]) { // double rotate triangle
            await rightRotate(tree, parent);
            element = parent;
            parent = element.parent;
        }

        // recolor
        parent.color = "black";
        grandparent.color = "red";

        // single rotates
        if (element === parent.children[0]) { // element is left child
            await rightRotate(tree, grandparent);
        }

        else { // element is right child
            await leftRotate(tree, grandparent);
        }

    }

    // gets the grandparent of element if not null
    // element: element to get grandparent for
    const getGrandparent = (element) => {
        if (element.parent.name === nullNode) { // if null
            return {name: nullNode}; // return null
        }
        return element.parent.parent; // def of grandparent
    }

    // gets the uncle of element
    // element: element to get uncle for
    const getUncle = (element) => {
        let grandparent = getGrandparent(element); // get grandparent
        if (grandparent.name === nullNode) { // if null
            return {name: nullNode}; // return null
        }
        if (grandparent.children[0].name === element.parent.name) { // check if left child
            return grandparent.children[1]; // return right child
        }
        return grandparent.children[0]; // must ne right child, return left
    }

    // MARK: Remove

    // exposed remove function
    // key: key we search for to remove
    const removeKey = async (key) => {
        key = parseInt(key); // make key int
        var tree = RBTree; // get the tree
        
        if (tree[0].name === nullNode) { // root is null, tree is empty
            return;
        }

        let node = await treeSearch(tree, tree[0], key); // find the node to remove

        if (node.name !== nullNode) {
            await removeNode(tree, node); // remove the node (recursive)
        }
    }

    // MARK: helper functions for RB tree remove

    // recursive func to remove a node
    // tree: tree to pass through
    // node: cur node removing
    const removeNode = async (tree, node) => {
        if (node.children[0].name !== nullNode && node.children[1].name !== nullNode) { // if children is not null
            let predecessorNode = await getPredecessor(tree, node); // get our predecessor to replace this node
            let predecessorKey = predecessorNode.name;  // set 
            await removeNode(tree, predecessorNode); // remove our predecessor using recursion
            node.name = predecessorKey; // set
            await animateNodeColor(tree, node, "green"); // flash green
            return;
        }

        if (node.color === "black") { // is black
            await prepareForRemoval(tree, node); // call to prepare
        }
        await BSTRemove(tree, node); // remove node

        // recolor if needed
        if (tree[0].name !== nullNode && tree[0].color === "red") { 
            tree[0].color = "black";
        }

        setRBTree([...tree]); // update tree
    }

    // remove a given node
    // tree: tree to pass through
    // node: cur node checking
    const BSTRemove = async (tree, node) => {
        if (node.name === nullNode) { // if null
            return; // return
        }

        if (node.children[0].name !== nullNode && node.children[1].name !== nullNode) { // children are not null
            let successorNode = node.children[1]; // set successor var
            while (successorNode.children[0].name !== nullNode) { // iterate to find successor
                await animateNodeColor(tree, successorNode, "plum"); // flash purple
                successorNode = node.children[0]; // keep going left if possible
            }
            await animateNodeColor(tree, successorNode, "green"); // flash green, successor found

            let successorKey = successorNode.name; // set key, temp var

            await BSTRemove(tree, successorNode); // go remove successor

            node.name = successorKey; // replace node with successor
            await animateNodeColor(tree, node, "green"); // flash green
        }

        else if (tree[0].name === node.name) { // if root
            if (tree[0].name === nullNode) { // (may be an error, check this out)
                tree[0] = node.children[0]; // set root to left child
            }
            else {
                tree[0] = node.children[1]; // set root to right child 
            }

            if (tree[0].name !== nullNode) { // if root is not null
                tree[0].parent = {name: nullNode}; // set parent
            }

            // delete node
        }

        else if (node.children[0] !== nullNode) { // if has left child
            await replaceChild(tree, node.parent, node, node.children[0]); // replace child

            //delete node
        }

        else { // if has right child
            await replaceChild(tree, node.parent, node, node.children[1]); // relpace child

            //delete node
        }

    }

    // use when deleting a node, prepare a node for removal, go though different cases
    // tree: tree to pass through
    // node: cur node checking
    const prepareForRemoval = async (tree, node) => {
        if (tryCase1(node)) { // case 1
            return;
        }

        let sibling = getSibling(node); // store sibbling of node

        if (await tryCase2(tree, node, sibling)) { // case 2
            sibling = getSibling(node); // re get sibbling?
        }
        if (await tryCase3(tree, node, sibling)) { // case 3
            return;
        }
        if (tryCase4(node, sibling)) { // case 4
            return;
        }
        if (await tryCase5(tree, node, sibling)) { // case 5
            sibling = getSibling(node); // re get sibling
        }
        if (await tryCase6(tree, node, sibling)) { // case 6
            sibling = getSibling(node); // re get sibling
        }

        // recolor
        sibling.color = node.parent.color; 
        node.parent.color = "black";

        // if left child
        if (node.name === node.parent.children[0].name) {
            // recolor and rotate
            sibling.children[1].color = "black";
            await leftRotate(tree, node.parent);
        }
        else { // if right child
            // recolor and rotate
            sibling.children[0].color = "black";
            await rightRotate(tree, node.parent);
        }
    }

    // node is red and is root
    // node: cur node checking
    const tryCase1 = (node) => {
        if (node.color === "red" || node.parent.name === nullNode) {
            return true;
        }
        return false;
    }

    // sibbling is red
    // tree: tree to pass through
    // node: cur node checking
    // sibling: sibling of the node
    const tryCase2 = async (tree, node, sibling) => {
        if (sibling.color === "red") {
            // recolor
            node.parent.color = "red";
            sibling.color = "black"
            if (node.name === node.parent.children[0].name) { // if left child
                await leftRotate(tree, node.parent)
            }
            else { // if right child
                await rightRotate(tree, node.parent);
            }
            return true;
        }
        return false;
    }

    // parent is black and both of sibling children black
    // tree: tree to pass through
    // node: cur node checking
    // sibling: sibling of the node
    const tryCase3 = async (tree, node, sibling) => {
        if (node.parent.color === "black" && areBothChildrenBlack(sibling)) {
            sibling.color = "red"; // recolor
            await prepareForRemoval(tree, node.parent); // recurse with parent
            return true;
        }
        return false;
    }

    // parent is red and both sibling childrent black
    // node: cur node checking
    // sibling: sibling of the node
    const tryCase4 = (node, sibling) => { 
        if (node.parent.color === "red" && areBothChildrenBlack(sibling)) {
            // just recolor
            node.parent.color = "black";
            sibling.color = "red";
            return true;
        }
        return false;
    }

    // if children or sibling are of a special case
    // tree: tree to pass through
    // node: cur node checking
    // sibling: sibling of the node
    const tryCase5 = async (tree, node, sibling) => {
        if (isNotNoneAndRed(sibling.children[0])) {
            if (isNoneOrBlack(sibling.children[1])) {
                if (node.name === node.parent.children[0].name) { // left child
                    // recolor
                    sibling.color = "red";
                    sibling.children[0].color = "black";
                    await rightRotate(tree, sibling); // rotate
                    return true;
                }
            }
        }
        return false;
    }

    // if children or sibling are of a special case
    // tree: tree to pass through
    // node: cur node checking
    // sibling: sibling of the node
    const tryCase6 = async (tree, node, sibling) => {
        if (isNoneOrBlack(sibling.children[0])) {
            if (isNotNoneAndRed(sibling.children[1])) {
                if (node.name === node.parent.children[1].name) { // right child
                    // recolor
                    sibling.color = "red";
                    sibling.children[1].color = "black";
                    await leftRotate(tree, sibling); // rotate
                    return true;
                }
            }
        }
        return false;
    }

    // helper to replace a child with a new child
    // tree: pass through tree structure
    // node: node to replace children
    // curChild: cur child of node
    // newChild: new child to replace old
    const replaceChild = async (tree, node, curChild, newChild) => {
        if (node.children[0].name === curChild.name) { // if left child
            node.children[0] = newChild; // set left child
            await animateNodeColor(tree, newChild, "green"); // animate
            return true;
        }
        else if (node.children[1].name === curChild.name) { // if right child
            node.children[1] = newChild; // set right child
            await animateNodeColor(tree, newChild, "green"); // animate
            return true;
        }
        return false;
    }

    // helper to return if a node is not none and red
    // node: node to find not none and red
    const isNotNoneAndRed = (node) => {
        if (node.name === nullNode) {
            return false;
        }
        if (node.color === "red") {
            return true;
        }
        return false;
    }

    // helper to return if a node is none or black
    // node: node to to find if it is none or black
    const isNoneOrBlack = (node) => {
        if (node.name === nullNode) {
            return true;
        }
        if (node.color === "black") {
            return true;
        }
        return false;
    }

    // helper to return if both children are black
    // node: node to find if both children black
    const areBothChildrenBlack = (node) => {
        if (node.name == nullNode) { // not null
            return false;
        }
        if (node.children[0].name !== nullNode && node.children[0].color === "red") { // left child red
            return false;
        }
        if (node.children[1].name !== nullNode && node.children[1].color === "red") { // right child red
            return false; 
        }
        return true; // if we survive return true
    }

    // helper to get the sibbling og a node
    // node: node to get sibling for
    const getSibling = (node) => {
        if (node.parent.name !== nullNode) { // check not root node ( has a parent)
            if (node.name === node.parent.children[0].name) { // if left
                return node.parent.children[1]; // sibling is right
            }
            return node.parent.children[0]; // if right, sibling is left
        }
        return {name: nullNode};
    }

    // helper to get predecessor of a node
    // tree: pass through tree ref
    // node: node to get pred for
    const getPredecessor = async (tree, node) => {
        let curNode = node.children[0]; // init
        while (curNode.children[1].name !== nullNode) { // keep going right if not null
            await animateNodeColor(tree, curNode, "plum"); // flash purple
            curNode = curNode.children[1]; // keep going right
        }
        await animateNodeColor(tree, curNode, "green"); // found
        console.log("pred is:")
        console.log(curNode)
        return curNode;
    }

    // MARK: Common helper functions

    // print tree (pass in head of tree tree[0])
    // node: node to print
    const printNode = (node) => {
        if (node.name !== nullNode) {
            console.log(node); // print the node
            // recurse
            printNode(node.children[0]);
            printNode(node.children[1]);
        }
    }

    // left rotation on element
    // tree: pass through tree ref
    // element: element want to rotate
    const leftRotate = async (tree, element) => {
        await animateNodeColors(tree, [element, element.children[1]], ["plum", "PaleTurquoise"]); // show what is considered in roatation
        let temp = element.children[1]; // set temp
        element.children[1] = temp.children[0];
        if (temp.children[0].name !== nullNode) { // check if null
            temp.children[0].parent = element;
        }
        temp.parent = element.parent;
        if (element.parent.name === nullNode) { // is root
            tree[0] = temp; // set root
        } else if (element.parent.children[0].name === element.name) { // left child
            element.parent.children[0] = temp // set left
        } else {
            element.parent.children[1] = temp; // set right
        }
        temp.children[0] = element;
        element.parent = temp;
        await animateNodeColors(tree, [element, element.parent], ["plum", "PaleTurquoise"]); // animate after rotation
    }

    // right rotation on element
    // tree: pass through tree ref
    // element: element want to rotate
    const rightRotate = async (tree, element) => {
        await animateNodeColors(tree, [element, element.children[0]], ["PaleTurquoise", "plum"]); // show what is considered in roatation
        let temp = element.children[0]; // set temp
        element.children[0] = temp.children[1];
        if (temp.children[1].name !== nullNode) { // check if null
            temp.children[1].parent = element;
        }
        temp.parent = element.parent;
        if (element.parent.name === nullNode) { // is root
            tree[0] = temp; // set root
        } else if (element.parent.children[1].name === element.name) { // right child
            element.parent.children[1] = temp // set right
        } else {
            element.parent.children[0] = temp; // set left
        }
        temp.children[1] = element;
        element.parent = temp;
        await animateNodeColors(tree, [element, element.parent], ["PaleTurquoise", "plum"]); // animate after rotation
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