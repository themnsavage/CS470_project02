import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const VanEmdeTree = forwardRef((props, ref) => {
    const nullNode = 'NULL';
    const nodeSize = { x: 120, y: 200 };
    const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -60, y: -50 };

    const [vanEmdeTree, setVanEmdeTree] = useState([{name:'', u:2, min:0, max:-1,count:0, children:[]}]);
    const [animationSpeed, setAnimationSpeed] = useState(1500);

    
    useImperativeHandle(ref, () => {
        return {insert: insertKey};
    });

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
        setVanEmdeTree([...tree]);
        await sleep();
        node.color = 'white';
        setVanEmdeTree([...tree]);
    }
    
    const high = async (v, k) => {
        var tree = v;
        var x = Math.ceil(Math.sqrt(tree[0].u));
        console.log(k + ' going to index ' + Math.floor(k / x) + ' because tree[0].u = ' + tree[0].u);
        return Math.floor(k / x);
    }

    const low = async (v, k) => {
        var tree = v;
        var x = Math.ceil(Math.sqrt(tree[0].u));
        return (k % x);
    }

    const index = async (v, k, kk) => {
        var tree = v;
        return ((k * Math.floor(Math.sqrt(tree[0].u))) + kk);
    }


    const updateNames = (root) => {
        /*
            description: updates the name of cur node
            root(object): root node
        */
        root.name = 'u: ' + `${root.u}` + ', min: ' + `${root.min}` + ', max: ' + `${root.max}`;

    }

    const insertRecursive = async (v, newKey) => {
        /*
            description: inserting lower than the root
            newKey(int): the new key to insert to VanEmdeTree
        */
        // var w = vanEmdeTree;
        // await animateNodeColor(w, w[0], 'green');
        
        newKey = parseInt(newKey);
        var tree = vanEmdeTree;
        var root = v;
        await animateNodeColor(tree, root, 'green');

        //if tree is empty
        if (root.min > root.max) {
            // tree.max = newKey;
            // tree.min = tree.max;
            var newNode = {name: newKey, color:'white', u:2, min:newKey, max:newKey, count: 1, children: []};
            root = newNode;
            root.name = 'u: ' + `${root.u}` + ', min: ' + `${root.min}` + ', max: ' + `${root.max}`;
            v.name = root.name;
            await animateNodeColor(tree, v, 'yellow');
        } 
        else {
            //resize tree
            v.count++;
            if (v.count > v.u) {
                v.u = Math.pow(v.u,2);
            }
 
            //if key is new tree.min, instead of newKey insert old min in subtrees
            //set newKey as new tree.min
            if (newKey < v.min) {
                var temp = v.min;
                v.min = newKey;
                newKey = temp;
                updateNames(v);
                await animateNodeColor(tree, v, 'green');
            }

            //since tree.max is also stored in subtrees, no need to swap
            if (newKey > v.max) {
                v.max = newKey;
                updateNames(v);
                await animateNodeColor(tree, v, 'green');
            }

            //if at lowest vEB, i.e. the leaf tree
            if (v.u === 2) {
                v.max = newKey;
                updateNames(v);
                await animateNodeColor(tree, v, 'green');
            } else {
                var i = await high(tree, newKey);
                var j = await low(tree, newKey);

                var n = Math.sqrt(v.u);

                var curNode = v;
                var prevNode = null;
                await animateNodeColor(tree, curNode, 'green');

            


                if(typeof v.children[i] === 'undefined') {

                    if (v.children.length-1 < i) {
                        for(var k = v.children.length; k < i+1; k++) {
                            v.children[k] = ({name: '', u:n, min:0, max:-1, count:0, children: []});
                            curNode = v.children[k];
                            curNode.name = 'u: ' + `${curNode.u}` + ', min: ' + `${curNode.min}` + ', max: ' + `${curNode.max}`;
                            await animateNodeColor(tree, curNode, 'purple');
                        }
                    }

                }

                curNode = v.children[i];
                await animateNodeColor(tree, curNode, 'orange');

                // await animateNodeColor(tree[0].children[i], tree[0].children[i][0], 'orange');
                await insertRecursive(v.children, j);
            }
            
        }
    }

    const insertKey = async (newKey) => {
        /*
            description: insert new key
            newKey(string): the new key to insert to VanEmdeTree
        */
        newKey = parseInt(newKey);
        var tree = vanEmdeTree;
        var root = tree[0];

        //if tree is empty
        if (root.min > root.max) {
            // tree.max = newKey;
            // tree.min = tree.max;
            var newNode = {name: newKey, color:'white', u:2, min:newKey, max:newKey, count: 1, children: []};
            tree[0] = newNode;
            updateNames(tree[0]);
            await animateNodeColor(tree, tree[0], 'yellow');
        } 
        else {
            //resize tree
            tree[0].count++;
            if (tree[0].count > tree[0].u) {
                tree[0].u = Math.pow(tree[0].u,2);
            }
 
            //if key is new tree.min, instead of newKey insert old min in subtrees
            //set newKey as new tree.min
            if (newKey < tree[0].min) {
                var temp = tree[0].min;
                tree[0].min = newKey;
                newKey = temp;
                updateNames(tree[0]);
                await animateNodeColor(tree, tree[0], 'green');
            }

            //since tree.max is also stored in subtrees, no need to swap
            if (newKey > tree[0].max) {
                tree[0].max = newKey;
                updateNames(tree[0]);
                await animateNodeColor(tree, tree[0], 'green');
            }

            //if at lowest vEB, i.e. the leaf tree
            if (tree[0].u === 2) {
                tree[0].max = newKey;
                updateNames(tree[0]);
                await animateNodeColor(tree, tree[0], 'green');
            } else {
                var i = await high(tree, newKey);
                var j = await low(tree, newKey);

                var n = Math.sqrt(tree[0].u);

                var curNode = tree[0];
                var prevNode = null;
                await animateNodeColor(tree, curNode, 'green');

            


                if(typeof tree[0].children[i] === 'undefined') {

                    if (tree[0].children.length-1 < i) {
                        for(var k = tree[0].children.length; k < i+1; k++) {
                            tree[0].children[k] = ({name: '', u:n, min:0, max:-1, count:0, children: []});
                            curNode = tree[0].children[k];
                            curNode.name = 'u: ' + `${curNode.u}` + ', min: ' + `${curNode.min}` + ', max: ' + `${curNode.max}`;
                            await animateNodeColor(tree, curNode, 'purple');
                        }
                    }

                }

                curNode = tree[0].children[i];
                await animateNodeColor(tree, curNode, 'orange');

                // await animateNodeColor(tree[0].children[i], tree[0].children[i][0], 'orange');
                await insertRecursive(curNode, j);
            }
            
        }

        setVanEmdeTree([...tree]);
    }

    return (
        <Tree
        data={vanEmdeTree}
        orientation={'vertical'}
        height={400}
        width={400}
        zoom={0.5}
        collapsible={false}
        depthFactor={120}
        translate ={{x: 450, y: 10}}
        renderCustomNodeElement={(rd3tProps) =>
            renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
        }
        />
    );
});

export default VanEmdeTree