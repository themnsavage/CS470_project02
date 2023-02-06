import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const BTree = forwardRef((props, ref) => {
    const [bTree, setBTree] = useState([{name:'', keys:[], leaf: true, children:[]}]);
    const [degree, setDegree] = useState(2)
    const [debug, setDebug] = useState('none');

    useImperativeHandle(ref, () => {
        return {insert: insertNode};
    });

    const createName = (keys) => {
        let name = '';
        keys.forEach(element => {
            name += `${element}, `;
        });
        return name;
    }

    const createNode = (l= false) => {
        let node = {
            name: '',
            leaf: l,
            keys:[],
            children: []
        }
        return node;
    }

    const updateNames = (root) => {
        if(root?.keys){
            root.name = createName(root.keys);
        }
        if(root?.children){
            root.children.forEach((child) => {
                updateNames(child);
            });
        }

    }

    const insertNonFull = (root, newKey) => {
        let insertIndex = root.keys.length - 1;
        if(root.leaf){ // if leaf
            // find index to add key into
             while(insertIndex >= 0 && root.keys[insertIndex] > newKey){
                insertIndex--;
             }
             root.keys.splice(insertIndex + 1, 0, newKey);
        }
        else{
            // find index to add key into
            while(insertIndex >= 0 && root.keys[insertIndex] > newKey){
                insertIndex--;
            }

            if(root.children[insertIndex + 1].keys.length == (2*degree) - 1){ // is child full
                splitChildren(root, insertIndex + 1, root.children[insertIndex + 1]);
                if(root.keys[insertIndex + 1] < newKey){
                    insertIndex++
                }
            }

            insertNonFull(root.children[insertIndex + 1], newKey); // recursive call to insert newKey to correct child
        }
    }

    const splitChildren = (root, i, oldChild) => {
        var newChild = createNode(oldChild.leaf);

        for(let j = 0; j < degree-1; j++){ // oldChild keys put in newChild
            let oldChildIndex = j+degree;
            newChild.keys.push(oldChild.keys[oldChildIndex]);
            oldChild.keys.splice(oldChildIndex,1);
        }

        if(!oldChild.leaf){ // if not a child leaf
            for(let j = 0; j < degree; j++){ // oldChild children put in newChild 
                let oldChildIndex = j+degree;
                newChild.children.push(oldChild.children[oldChildIndex]);
                oldChild.children.splice(oldChildIndex,1);
            }
        }

        // add new node to root's children
        root.children.splice(i+1,0,newChild);

        //push middle key to root
        root.keys.splice(i,0,oldChild.keys[degree-1]);
        oldChild.keys.splice(degree-1,1);
    }

    const insertNode = (newKey) => {
        newKey = parseInt(newKey);
        var tree = bTree;
        var root = tree[0];
        
        if(root.keys.length == (2*degree) - 1){
            var newRoot = createNode(false);
            newRoot.children[0] = root;
            splitChildren(newRoot, 1, root);
            insertNonFull(newRoot, newKey);
            root = newRoot;
        }
        else{
            insertNonFull(root, newKey);
        }

        updateNames(root);
        tree[0] = root;
        setBTree([...tree]);
    }

    return (
        <div>
            <Tree
            data={bTree}
            orientation={'vertical'}
            height={400}
            width={400}
            zoom={0.5}
            collapsible={false}
            depthFactor={60}
            translate ={{x: 450, y: 10}}
            />
            <p>debug:{debug}</p>
        </div>
    );
});

export default BTree