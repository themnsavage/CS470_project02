import { wait } from "@testing-library/user-event/dist/utils";
import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const BinaryTree = forwardRef((props, ref) => {
    const nullNode = 'NULL';
    const nodeSize = { x: 60, y: 60 };
    const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -25, y: -50 };

    const [binaryTree, setBinaryTree] = useState([{name:nullNode}]);
    const [animationSpeed, setAnimationSpeed] = useState(1500);
    
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

    useImperativeHandle(ref, () => {
        return {insert: insertNode};
    });

    const sleep =  async () => {
        return new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    const animateNodeColor = async (tree, node, color='green') => {
        node.color = color;
        setBinaryTree([...tree]);
        await sleep();
        node.color = 'white';
        setBinaryTree([...tree]);
    }
    const insertNode = async (value) => {
        var tree = binaryTree;
        var newNode = {name: value, color:'white', children: [{name: nullNode},{name: nullNode}]};
        if(tree[0].name === nullNode){
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
                await animateNodeColor(tree, prevNode.children[0], 'yellow');
            }
            else{
               prevNode.children[1] = newNode;
               await animateNodeColor(tree, prevNode.children[1], 'yellow'); 
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
        renderCustomNodeElement={(rd3tProps) =>
            renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
        }
        />
    );
});

export default BinaryTree