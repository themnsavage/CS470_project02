import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const BTree = forwardRef((props, ref) => {
    // global variables
    const nodeSize = { x: 90, y: 100 };
    const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -44, y: -40 };
    // use state variables
    const [bTree, setBTree] = useState([{name:'', keys:[], leaf: true, children:[]}]);
    const [degree, setDegree] = useState(2);
    const [debug, setDebug] = useState('none');
    const [animationSpeed, setAnimationSpeed] = useState(100);

    useImperativeHandle(ref, () => {
        /*
            description: allow parent component to set variables
        */
        return {
            insert: insertKey,
            find: findKey,
            delete: deleteKey,
        };
    })

    const renderForeignObjectNode = ({
        nodeDatum,
        toggleNode,
        foreignObjectProps
      }) => (
        /*
            description: customize the rendering of nodes
        */
        <g>
          {/* <circle r={15}> fill={"red"}</circle> */}
          {/* `foreignObject` requires width & height to be explicitly set. */}
          <foreignObject {...foreignObjectProps}>
            <div style={{ borderStyle: "solid", borderWidth: "4px", borderColor: 'black', backgroundColor: nodeDatum.color, borderRadius: "25px"}}>
              <h3 style={{ textAlign: "center" }}>{nodeDatum.name}</h3>
            </div>
          </foreignObject>
        </g>
      );

    const sleep =  async () => {
        /*
            description: sleep function in milliseconds
        */
        return new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    const animateNodeColor = async (tree, node, color='green') => {
        /*
            description: animates changing the given node color 
            and setting it back to default color.
            tree(object): whole tree use for animation purposes
            node(object): the given node to do animation to
            color(string): the color to change the given node to
        */
        node.color = color;
        setBTree([...tree]);
        await sleep();
        node.color = 'white';
        setBTree([...tree]);
    }

    const createName = (keys) => {
        /*
            description: creates a name with given list of keys
            keys(list): the keys to create name with
        */
        let name = '';
        keys.forEach(element => {
            name += `${element}, `;
        });
        return name;
    }

    const createNode = (l= false) => {
        /*
            description: constructor for BTree node
            l(bool): is new node a leaf node
        */
        let node = {
            name: '',
            color: 'white',
            leaf: l,
            keys: [],
            children: [],
        }
        return node;
    }

    const updateNames = (root) => {
        /*
            description: updates all the names from root to all its children
            root(object): root node
        */
        if(root?.keys){
            root.name = createName(root.keys);
        }
        if(root?.children){
            root.children.forEach((child) => {
                updateNames(child);
            });
        }

    }

    const insertNonFull = async (tree, root, newKey) => {
        /*
            description: case when inserting a node to non-full node
            tree(object): whole BTree for animation purposes
            root(object): the current node
            newKey(int): the new key being inserted to BTree
        */
        updateNames(tree[0]);
        await animateNodeColor(tree, root, 'green');
        
        let insertIndex = root.keys.length - 1;
        if(root.leaf){ // if leaf
            // find index to add key into
             while(insertIndex >= 0 && root.keys[insertIndex] > newKey){
                insertIndex--;
             }
             root.keys.splice(insertIndex + 1, 0, newKey);
             animateNodeColor(tree, root, 'yellow');
             updateNames(root);
        }
        else{
            // find index to add key into
            while(insertIndex >= 0 && root.keys[insertIndex] > newKey){
                insertIndex--;
            }

            if(root.children[insertIndex + 1].keys.length == (2*degree) - 1){ // is child full
                await splitChildren(tree, root, insertIndex + 1, root.children[insertIndex + 1]);
                if(root.keys[insertIndex + 1] < newKey){
                    insertIndex++
                }
            }

            await insertNonFull(tree, root.children[insertIndex + 1], newKey); // recursive call to insert newKey to correct child
        }
    }

    const splitChildren = async (tree, root, i, oldChild) => {
        /*
            description: the case when a node needs to be split into two
            tree(object): whole BTree for animation purposes
            root(object): parent node of node needing to be split
            i(int): index
            oldChild(object): node to split into two
        */
        await animateNodeColor(tree, oldChild, 'purple');
        oldChild.name = '';
        
        var newChild = createNode(oldChild.leaf);

        for(let j = 0; j < degree-1; j++){ // oldChild keys put in newChild
            let oldChildIndex = j+degree;
            newChild.keys.splice(j,0,oldChild.keys[oldChildIndex]);
            oldChild.keys.splice(oldChildIndex,1);
        }

        if(!oldChild.leaf){ // if not a child leaf
            let middle = oldChild.children.length/2;
            let removeCount = oldChild.children.length - middle;
            oldChild.children.forEach((child, index) => {
                if(index >= middle){
                    newChild.children.push({...child});
                }
            });
            oldChild.children.splice(middle, removeCount);
        }
        
        // add new node to root's children
        root.children.splice(i+1,0,newChild);

        //push middle key to root
        root.keys.splice(i,0,oldChild.keys[degree-1]);
        oldChild.keys.splice(degree-1,1);
        
        animateNodeColor(tree, oldChild, 'purple');
        animateNodeColor(tree, root, 'purple');
        animateNodeColor(tree, newChild, 'purple');

        await sleep();
        
        animateNodeColor(tree, oldChild, 'green');
        oldChild.name = createName(oldChild.keys);
        animateNodeColor(tree, root, 'green');
        root.name = createName(root.keys);
        animateNodeColor(tree, newChild, 'green');
        newChild.name = createName(newChild.keys);
    }

    const insertKey = async (newKey) => {
        /*
            description: insert new key
            newKey(string): the new key to insert to BTree
        */
        newKey = parseInt(newKey);
        var tree = bTree;
        var root = tree[0];
        
        if(root.keys.length == (2*degree) - 1){
            var newRoot = createNode(false);
            newRoot.children.push(root);
            tree[0] = newRoot
            await splitChildren(tree, newRoot, 0, newRoot.children[0]);
            await insertNonFull(tree, newRoot, newKey);
            tree[0] = newRoot;
        }
        else{
            await insertNonFull(tree, tree[0], newKey);
        }

        updateNames(tree[0]);
        setBTree([...tree]);
    }

    const btreeSearch = async (tree, node, key) => {
        /*
            description: parse through BTree to search for given key
            tree(object): whole BTree for animation purposes
            node(object): current node
            key(int): key that is being search for
        */
        await animateNodeColor(tree, node, 'green');
        let index = 0;
        while(index < node.keys.length && key > node.keys[index]){
            index++;
        }
        if(node.keys[index] == key){
            await animateNodeColor(tree, node, 'blue');
            return;
        }

        if(node.leaf){
            await animateNodeColor(tree, node, 'red');
        }    

        btreeSearch(tree, node.children[index], key);
    }

    const findKey = async (key) => {
        /*
            description: convert key into int and checks BTree is not
            empty before calling btreeSearch func
            key(string): key to search for
        */
        key = parseInt(key);
        var tree = bTree;
        
        if(tree[0].name != ''){
            await btreeSearch(tree, tree[0], key);
        }
    }

    const findPredecessor = (root, keyIndex) => {
        let node = root.children[keyIndex];
        while (!node.leaf) node = node.children.at(-1);
        return node.keys.at(-1);
    }

    const findSuccessor = (root, keyIndex) => {
        let node = root.children[keyIndex + 1]
        while (!node.leaf) node = node.children[0];
        return node.keys[0];
    }

    /**
     * Moves the last key of the child located at keyIndex - 1 into root,
     * and inserts the replaced root value into the first position of the child at keyIndex
     */
    const borrowFromPrevious = (root, keyIndex) => {

        const child = root.children[keyIndex];
        const sibling = root.children[keyIndex - 1];

        console.log("Borrowing from:", sibling);

        // Insert key into child
        child.keys.splice(0, 0, root.keys[keyIndex - 1]); 

        // Remove key from sibling and move to parent
        root.keys[keyIndex - 1] = sibling.keys.pop();

        // If child is internal node, we must also move child from sibling to child
        if (!child.leaf) {
            child.children.splice(0, 0, sibling.children.pop());
        }

    }

    /**
     * Moves the first key of the child located at keyIndex + 1 into root,
     * and inserts the replaced root value into the last position of the child at keyIndex
     */
    const borrowFromNext = (root, keyIndex) => {

        const child = root.children[keyIndex];
        const sibling = root.children[keyIndex + 1];

        console.log("Borrowing from:", sibling);

        // Insert key into child
        child.keys.push(root.keys[keyIndex]); 

        // Remove key from sibling and move to parent
        root.keys[keyIndex] = sibling.keys.shift();

        // If child is internal node, we must also move child from sibling to child
        if (!child.leaf) {
            child.children.push(sibling.children.shift());
        }

    }

    /**
     * Merges the child in root located at keyIndex with its next sibling
     */
    const merge = (root, keyIndex) => {

        const child = root.children[keyIndex];
        const sibling = root.children[keyIndex + 1];

        // Push key at keyIndex down into child
        const key = root.keys[keyIndex];
        child.keys.push(key);
        root.keys.splice(keyIndex, 1);
        root.name = createName(root.keys); // Update root name

        // Must also splice root children array
        root.children.splice(keyIndex + 1, 1);

        // Append siblings' keys to end of child's keys
        // If child is internal node, we also have to append children (of sibling)
        child.keys.push(...sibling.keys);
        if (!child.leaf) child.children.push(...sibling.children);
        
        // Update child name
        child.name = createName(child.keys);

    }

    const fill = (root, childIndex) => {

        console.log("Filling:", root);

        // If child is not first child and previous sibling has at least t keys,
        // borrow a key from previous sibling
        if (childIndex !== 0 && (root.children[childIndex - 1].keys.length >= degree)) {
            borrowFromPrevious(root, childIndex);
        }

        // If child is not last child and next sibling has at least t keys,
        // borrow a key from next sibling
        else if (childIndex !== root.keys.length && (root.children[childIndex + 1].keys.length >= degree)) {
            borrowFromNext(root, childIndex);
        }

        // Otherwise, merge child with its sibling
        // If last child, merge with previous sibling.
        // Otherwise, merge with next.
        else {
            if (childIndex !== (root.keys.length)) merge(root, childIndex);
            else merge(root, childIndex - 1);
        }

    }

    const deleteNodeKey = async (tree, root, key) => {

        const keyIndex = root.keys.indexOf(key);
        // If key index is not -1, root contains key

        if (keyIndex !== -1) {

            // Case 1 - node contains key and node is leaf
            // We delete the key from the node
            if (root.leaf) {
                root.keys.splice(keyIndex, 1);
                root.name = createName(root.keys); // Update root name
            }

            // Case 2 - node contains key and is internal node
            // We first examine the child that precedes the key, and the child that succeeds the key.
            // If one has at least t keys, we replace the key being deleted with the successor/predecessor,
            // and recursively delete the successor/predecessor
            // If both have less than t keys, than we merge them into a single node by pushing down
            // the key we wish to delete. We then recursively delete the key.
            else {

                const leftChild = root.children[keyIndex];
                const rightChild = root.children[keyIndex + 1];

                // Examine left child
                if (leftChild.keys.length >= degree) {
                    const predecessor = findPredecessor(root, keyIndex);
                    root.keys[keyIndex] = predecessor;
                    deleteNodeKey(tree, leftChild, predecessor);
                    // Update root name
                    root.name = createName(root.keys);
                }

                // Examine right child
                else if (rightChild.keys.length >= degree) {
                    const successor = findSuccessor(root, keyIndex);
                    root.keys[keyIndex] = successor;
                    deleteNodeKey(tree, rightChild, successor);
                    // Update root name
                    root.name = createName(root.keys);
                }
                
                // Merge
                else {
                    merge(root, keyIndex);
                    deleteNodeKey(tree, root.children[keyIndex], key)
                }
            
            }
        
        }

        else {

            // Case 3 - node is not leaf and does NOT contain key
            // (If node is leaf and doesn't contain key, the key is not in the tree.)
            // Determine which subtree should contain key
            if (!root.leaf) {

                var childIndex = 0;
                while (childIndex < root.keys.length && root.keys[childIndex] < key) {
                    childIndex += 1;
                }

                const isLastChild = (childIndex === root.keys.length);

                // If child has less than t keys, fill child
                if (root.children[childIndex].keys.length < degree) {
                    fill(root, childIndex);
                }

                if (isLastChild && (childIndex > root.keys.length)) {
                    deleteNodeKey(tree, root.children[childIndex - 1], key);
                }
                else {
                    deleteNodeKey(tree, root.children[childIndex], key);
                }

            }

        }

    }

    const deleteKey = async (deleteInput) => {

        const key = parseInt(deleteInput);
        const tree = bTree;

        await deleteNodeKey(tree, tree[0], key);

        // If root has a single child (i.e. previously had two children and merged),
        // then we update the root of the root to be the current root's child.
        if (tree[0].keys.length === 0) {
            tree[0] = tree[0].children[0];
        }

        updateNames(tree[0]);
        setBTree([...tree]);
    }

    return (
        <Tree
        data={bTree}
        orientation={'vertical'}
        height={400}
        width={400}
        zoom={0.5}
        collapsible={false}
        depthFactor={100}
        translate ={{x: 450, y: 10}}
        renderCustomNodeElement={(rd3tProps) =>
            renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
        }
        />
    );
});

export default BTree