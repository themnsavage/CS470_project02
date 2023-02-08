import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const BTree = forwardRef((props, ref) => {
    const nodeSize = { x: 90, y: 100 };
    const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -44, y: -40 };

    const [bTree, setBTree] = useState([{name:'', keys:[], leaf: true, children:[]}]);
    const [degree, setDegree] = useState(2)
    const [debug, setDebug] = useState('none');
    const [animationSpeed, setAnimationSpeed] = useState(1500);

    useImperativeHandle(ref, () => {
        return {insert: insertNode};
    })

    const renderForeignObjectNode = ({
        nodeDatum,
        toggleNode,
        foreignObjectProps
      }) => (
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
        return new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    const animateNodeColor = async (tree, node, color='green') => {
        node.color = color;
        setBTree([...tree]);
        await sleep();
        node.color = 'white';
        setBTree([...tree]);
    }

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
            color: 'white',
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

    const insertNonFull = async (tree, root, newKey) => {
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
        await animateNodeColor(tree, oldChild, 'purple');

        var newChild = createNode(oldChild.leaf);

        for(let j = 0; j < degree-1; j++){ // oldChild keys put in newChild
            let oldChildIndex = j+degree;
            newChild.keys.push(oldChild.keys[oldChildIndex]);
            oldChild.keys.splice(oldChildIndex,1);
        }

        if(!oldChild.leaf){ // if not a child leaf
            for(let j = 0; j < oldChild.children.length; j++){ // oldChild children put in newChild 
                let oldChildIndex = j+(degree-1);
                newChild.children.push(oldChild.children[oldChildIndex]);
                oldChild.children.splice(oldChildIndex,1);
            }
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
        
        await animateNodeColor(tree, oldChild, 'green');
        oldChild.name = createName(oldChild.keys);
        await animateNodeColor(tree, root, 'green');
        root.name = createName(root.keys);
        await animateNodeColor(tree, newChild, 'green');
        newChild.name = createName(newChild.keys);
    }

    const insertNode = async (newKey) => {
        newKey = parseInt(newKey);
        var tree = bTree;
        var root = tree[0];
        
        if(root.keys.length == (2*degree) - 1){
            var newRoot = createNode(false);
            newRoot.children.push(root);
            tree[0] = newRoot
            await splitChildren(tree, newRoot, 0, newRoot.children[0]);
            console.log(`root #'s children: ${newRoot.children.length}`);
            console.log(`root keys: ${newRoot.keys}`);
            console(`root[1] keys: ${root.children[1].keys}`);
            console(`root[0] keys: ${root.children[0].keys}`);
            await insertNonFull(tree, newRoot, newKey);
        }
        else{
            await insertNonFull(tree, tree[0], newKey);
        }

        updateNames(tree[0]);
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
            depthFactor={100}
            translate ={{x: 450, y: 10}}
            renderCustomNodeElement={(rd3tProps) =>
                renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
            }
            />
            <p>debug:{debug}</p>
        </div>
    );
});

export default BTree