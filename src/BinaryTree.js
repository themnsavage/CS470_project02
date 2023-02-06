import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const BinaryTree = forwardRef((props, ref) => {
    const nullNode = 'NULL';
    const [binaryTree, setBinaryTree] = useState([{name:nullNode}]);

    useImperativeHandle(ref, () => {
        return {insert: insertNode};
    });

    const insertNode = (value) => {
        var tree = binaryTree;
        var newNode = {name: value, children: [{name: nullNode},{name: nullNode}]};
        if(tree[0].name === nullNode){
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
            }
            else{
               prevNode.children[1] = newNode; 
            }
        }
        setBinaryTree([...tree]);
    }

    return (
        <Tree
        data={binaryTree}
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

export default BinaryTree