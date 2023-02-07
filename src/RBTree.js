import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const Color = {
    red : 0,
    black : 1
}

const RBTree = forwardRef((props, ref) => {
    const nullNode = 'NULL';
    const [RBTree, setRBTree] = useState([{name:nullNode}]);

    useImperativeHandle(ref, () => {
        return {insert: insertNode};
    });

    const insertNode = (value) => {
        var tree = RBTree;
        var newNode = {name: value, color: Color.red, parent: {name: nullNode}, children: [{name: nullNode},{name: nullNode}]};
        if(tree[0].name === nullNode){
            newNode.color = Color.black;
            tree[0] = newNode;
        }
        else{
            var currentNode = tree[0];
            var prevNode = null;
            while(currentNode.name !== nullNode){
                prevNode = currentNode;
                if(parseInt(value) < parseInt(currentNode.name)){
                    currentNode = currentNode.children[0];
                }
                else{
                    currentNode = currentNode.children[1]
                }
            }

            if(parseInt(value) < parseInt(prevNode.name)){                
                prevNode.children[0] = newNode;
                newNode.parent = prevNode;
            }
            else{
                prevNode.children[1] = newNode; 
               newNode.parent = prevNode;
            }
        }
        printNode(tree[0]);
        setRBTree([...tree]);
        rbInsertFixup(tree, newNode);
        setRBTree([...tree]);
        printNode(tree[0]);
    }

    const printNode = (node) => {
        if (node.name !== nullNode) {
            console.log(node);
            printNode(node.children[0]);
            printNode(node.children[1]);
        }
    }

    const rbInsertFixup = (tree, element) => {
        if (element.parent.name === nullNode) {
            element.color = Color.black;
            return;
        }

        if (element.parent.color === Color.black) {
            return;
        }

        let parent = element.parent;
        let grandparent = getGrandparent(element);
        let uncle = getUncle(element);

        if (uncle.name !== nullNode && uncle.color === Color.red) {
            uncle.color = Color.black;
            parent.color = Color.black;
            grandparent.color = Color.red;
            rbInsertFixup(tree, grandparent);
            return;
        }
        console.log(parent.children[1])
        console.log(grandparent)

        if (element.name === parent.children[1].name && parent.name === grandparent.children[0].name) {
            leftRotate(tree, parent);
            element = parent;
            parent = element.parent;
        }

        else if (element === parent.children[0] && parent === grandparent.children[1]) {
            rightRotate(tree, parent);
            element = parent;
            parent = element.parent;
        }

        parent.color = Color.black;
        grandparent.color = Color.red;

        if (element === parent.children[0]) {
            rightRotate(tree, grandparent);
        }

        else {
            leftRotate(tree, grandparent);
        }

    }

    const leftRotate = (tree, element) => {
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
    }

    const rightRotate = (tree, element) => {
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
        />
    );
});

export default RBTree