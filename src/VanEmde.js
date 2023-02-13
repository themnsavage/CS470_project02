import { useState, forwardRef, useImperativeHandle } from "react";
import Tree from 'react-d3-tree';

const VanEmdeTree = forwardRef((props, ref) => {
    const nullNode = 'NULL';
    const nodeSize = { x: 130, y: 200 };
    const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -65, y: -50 };

    const [vanEmdeTree, setVanEmdeTree] = useState([{name:'', u:16, faux:2, min:0, max:-1,count:0, summary:[],children:[]}]);
    const [animationSpeed, setAnimationSpeed] = useState(1500);

    
    useImperativeHandle(ref, () => {
        return {insert: insertKey, delete: removeKey, find: findKey};
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

    //get cluster
    const high = async (v, k) => {
        var tree = v;
        var x = Math.ceil(Math.sqrt(tree[0].u));
        if (x === 0) {
            return 0;
        }
        console.log(k + ' going to index ' + Math.floor(k / x) + ' because tree[0].u = ' + tree[0].u);
        return Math.floor(k / x);
    }

    //get spot in cluster
    const low = async (v, k) => {
        var tree = v;
        var x = Math.ceil(Math.sqrt(tree[0].u));
        console.log('j = k % x = ' + (k%x));
        return (k % x);
    }

    //all R functions are so a different root can be passed in
    const highR = async (v, k) => {
        var tree = v;
        var x = Math.ceil(Math.sqrt(tree.u));
        if (x === 0) {
            return 0;
        }
        console.log(k + ' going to index ' + Math.floor(k / x) + ' because tree[0].u = ' + tree.u);
        return Math.floor(k / x);
    }

    const lowR = async (v, k) => {
        var tree = v;
        var x = Math.ceil(Math.sqrt(tree.u));
        return (k % x);
    }

    //get val in cluster
    const index = async (v, k, kk) => {
        var tree = v;
        console.log('tree[0].u = ' + tree[0].u);
        return ((k * Math.floor(Math.sqrt(tree[0].u))) + kk);
    }

    const indexR = async (v, k, kk) => {
        var tree = v;
        console.log('tree[0].u = ' + tree.u);
        return ((k * Math.floor(Math.sqrt(tree.u))) + kk);
    }

    const initializeTree = async (tree) => {
        
        var sum = {name:4, u:4, faux:2, min:'16', max:'-1',count:0, summary:[], children:[]};
        tree[0].summary = sum;
        // console.log('summary name is ' + tree[0].summary.name);
        sum = {name:2, u:2, faux:2, min:'16', max:'-1',count:0};
        tree[0].summary.summary = sum;

        for(var j = 0; j < 2; j++) {
            // console.log('child ' + i + 'getting child ' + j);
            newNode = {name:j, u:2, faux:2, min:'16', max:'-1',count:0, children:[]};
            newNode.name = 'u: ' + `${newNode.u}` + ', min: ' + '/' + ', max: ' + '/';
            tree[0].summary.children.push(newNode);
            // console.log('this min is ' + tree[0].children[i].children[j].min);
        }
        
        for (var i = 0; i < 4; i++) {
            var newNode = {name:j, u:4, faux:2, min:'16', max:'-1',count:0, summary:[], children:[]};
            newNode.summary = {name:2, u:2, faux:2, min:'16', max:'-1',count:0};
            newNode.name = 'u: ' + `${newNode.u}` + ', min: ' + '/' + ', max: ' + '/';
            tree[0].children.push(newNode);
            

            for(var j = 0; j < 2; j++) {
                // console.log('child ' + i + 'getting child ' + j);
                newNode = {name:j, u:2, faux:2, min:'16', max:'-1',count:0, children:[]};
                newNode.name = 'u: ' + `${newNode.u}` + ', min: ' + '/' + ', max: ' + '/';
                tree[0].children[i].children.push(newNode);
                // console.log('this min is ' + tree[0].children[i].children[j].min);
            }
        }
    }

    //function to improve runtime by taking out name updates
    const insertSummary = async (root, newKey) => {
        newKey = parseInt(newKey);

        var tree = vanEmdeTree;

        // console.log('root min is ' + root.min);
        // if tree is empty
        if (root.min > root.max) {
            root.min = newKey;
            root.max = newKey;
            root.name = 'u: ' + `${root.u}` + ', min: ' + `${root.min}` + ', max: ' + `${root.max}`;
        } else {
            //if key is new tree.min, instead of newKey insert old min in subtrees
            //set newKey as new tree.min
            if (newKey < root.min) {
                var temp = root.min;
                root.min = newKey;
                newKey = temp;
                root.name = 'u: ' + `${root.u}` + ', min: ' + `${root.min}` + ', max: ' + `${root.max}`;
                // await animateNodeColor(tree, root, 'green');
            }

            // since tree.max is also stored in subtrees, no need to swap
            if (newKey > root.max) {
                root.max = newKey;
                root.name = 'u: ' + `${root.u}` + ', min: ' + `${root.min}` + ', max: ' + `${root.max}`;
                // await animateNodeColor(tree, root, 'green');
            }

            if (root.u == 2) {
                root.max = newKey;
                root.name = 'u: ' + `${root.u}` + ', min: ' + `${root.min}` + ', max: ' + `${root.max}`;
                // await animateNodeColor(tree, root, 'green');
            } else {
                var i = await highR(root, newKey);
                var j = await lowR(root, newKey);

                // console.log('inserting ' + i + ' i into the summary');

                await insertSummary(root.children[i], j);

                if (root.children[i].max === root.children[i].min) {
                    // console.log('inserting ' + ' i into the summary');
                    await insertSummary(root.summary, i);
                    // root.summary.name = 'summary u : ' + `${root.summary.u}` + ', summary min : ' + `${root.summary.min}` + ', summary max : ' + `${root.summary.max}`;
                }
            }
        }
    }

    //another function so different roots can be passed in
    const insertRecursive = async (root, newKey) => {
        /*
            description: insert new key
            newKey(string): the new key to insert to VanEmdeTree
        */
        newKey = parseInt(newKey);

        var tree = vanEmdeTree;

        // if tree is empty
        if (root.min > root.max) {
            root.min = newKey;
            root.max = newKey;
            root.name = 'u: ' + `${root.u}` + ', min: ' + `${root.min}` + ', max: ' + `${root.max}`;
            // updateNames(root);
            await animateNodeColor(tree, root, 'green');
            await animateNodeColor(tree, root, 'yellow');
        } else {
            //if key is new tree.min, instead of newKey insert old min in subtrees
            //set newKey as new tree.min
            if (newKey < root.min) {
                var temp = root.min;
                root.min = newKey;
                newKey = temp;
                root.name = 'u: ' + `${root.u}` + ', min: ' + `${root.min}` + ', max: ' + `${root.max}`;
                await animateNodeColor(tree, root, 'green');
            }

            // since tree.max is also stored in subtrees, no need to swap
            if (newKey > root.max) {
                root.max = newKey;
                root.name = 'u: ' + `${root.u}` + ', min: ' + `${root.min}` + ', max: ' + `${root.max}`;
                await animateNodeColor(tree, root, 'green');
            }

            if (root.u == 2) {
                root.max = newKey;
                root.name = 'u: ' + `${root.u}` + ', min: ' + `${root.min}` + ', max: ' + `${root.max}`;
                await animateNodeColor(tree, root, 'green');
            } else {
                var i = await highR(root, newKey);
                var j = await lowR(root, newKey);

                // console.log('inserting ' + i + ' i into the summary');

                await insertRecursive(root.children[i], j);

                if (root.children[i].max === root.children[i].min) {
                    // console.log('inserting ' + ' i into the summary');
                    await insertSummary(root.summary, i);
                    // root.summary.name = 'summary u : ' + `${root.summary.u}` + ', summary min : ' + `${root.summary.min}` + ', summary max : ' + `${root.summary.max}`;
                }
            }
        }

        setVanEmdeTree([...tree]);
    }
    
    
    
    
    
    const insertKey = async (newKey) => {
        /*
            description: insert new key
            newKey(string): the new key to insert to VanEmdeTree
        */


            newKey = parseInt(newKey);

        var tree = vanEmdeTree;

        if (newKey >= 16 || newKey < 0) {
            console.log("index out of vanEmde bounds");
            return;
        }

        if (tree[0].count === 0) {
            var newNode = {name:'null', u:16, faux:2, min:newKey, max:newKey,count:0, children:[]};
            newNode.name = 'u: ' + `${newNode.u}` + ', min: ' + `${newNode.min}` + ', max: ' + `${newNode.max}`;
            tree[0] = newNode;
            tree[0].count = 1;
            initializeTree(tree);
            await animateNodeColor(tree, tree[0], 'green');
            await animateNodeColor(tree, tree[0], 'yellow');
        } else {
            newKey = parseInt(newKey);

            // if tree is empty
            if (tree[0].min > tree[0].max) {
                // tree.max = newKey;
                // tree.min = tree.max;
                var newNode = {name:'null', u:16, faux:2, min:newKey, max:newKey, count: 1, children: []};
                newNode.name = 'u: ' + `${newNode.u}` + ', min: ' + `${newNode.min}` + ', max: ' + `${newNode.max}`;
                tree[0] = newNode;
                // updateNames(tree[0]);
                await animateNodeColor(tree, tree[0], 'green');
                await animateNodeColor(tree, tree[0], 'yellow');
            } else {
                //if key is new tree.min, instead of newKey insert old min in subtrees
                //set newKey as new tree.min
                if (newKey < tree[0].min) {
                    var temp = tree[0].min;
                    tree[0].min = newKey;
                    newKey = temp;
                    tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
                    await animateNodeColor(tree, tree[0], 'green');
                }

                // since tree.max is also stored in subtrees, no need to swap
                if (newKey > tree[0].max) {
                    tree[0].max = newKey;
                    tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
                    await animateNodeColor(tree, tree[0], 'green');
                }

                if (tree[0].u == 2) {
                    tree[0].max = newKey;
                    tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
                    await animateNodeColor(tree, tree[0], 'green');
                } else {
                    var i = await high(tree, newKey);
                    var j = await low(tree, newKey);

                    var curNode = tree[0].children[i];

                    // console.log(' is ' + i);

                    await insertRecursive(curNode, j);

                    //if insertion created a new subtree, add it to the summary
                    if (tree[0].children[i].max === tree[0].children[i].min) {
                        // console.log('inserting ' + i + '  into the summary');
                        await insertSummary(tree[0].summary, i);
                    }

                    tree[0].summary.name = 'summary u : ' + `${tree[0].summary.u}` + ', summary min : ' + `${tree[0].summary.min}` + ', summary max : ' + `${tree[0].summary.max}`;
                    console.log(tree[0].summary.name);
                }
            }
        }


        

        setVanEmdeTree([...tree]);
    }

    //took out animations to improve runtime
    const removeSummary = async (v, key) => {
        
        if(v.min > v.max) {
            return;
        }
        
        console.log('deleting ' + key);
        //if only one element in the tree
        var tree = vanEmdeTree;
        if (v.min === v.max) {
            v.min = 16;
            v.max = -1;
            v.name = 'u: ' + `${v.u}` + ', min: ' + '/' + ', max: ' + '/';

        } else {
            //if leaf
            if (v.u === 2) {
                if (key === 1) {
                    if (v.min === 1) {
                        v.min = 16;
                        v.max = -1;
                        v.name = 'u: ' + `${v.u}` + ', min: ' + '/' + ', max: ' + '/';
                    } else if (v.min === 0) {
                        v.max = 0;
                        v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
                        
                    }

                } else {
                    if (v.max === 0) {
                        v.min = 16;
                        v.max = -1;
                        v.name = 'u: ' + `${v.u}` + ', min: ' + '/' + ', max: ' + '/';
                        

                    } else if (v.max === 1) {
                        v.min = 1;
                        v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
                    }
                }
            } else {
                //if k is T.min, assign new value to it and return since min is not
                if (key === v.min) {
                    var i = v.summary.min;    //index of first subtree
                    console.log('var i = ' + i);
                    v.min = await indexR(v, i, v.children[i].min);
                    v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
                } else {

                    var i = await highR(v, key);
                    var j = await lowR(v, key);

                    var curNode = v.children[i];
                    
                    await removeRecursive(curNode, j);
                    

                    if (v.children[i].min > v.children[i].max) {
                        await removeSummary(v.summary, i);
                    }

                    if (key === v.max) {

                        if (v.summary.min > v.summary.max) {
                            v.max = v.min;
                        } else {
                            i = v.summary.min;
                            v.max = indexR(v, i, v.children[i].max);
                        }
                    }
                    v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
                }

            }
            
            
        }


        setVanEmdeTree([...tree]);
    }

    //another function so different roots can be passed in
    const removeRecursive = async (v, key) => {

        var tree = vanEmdeTree;
        
        if(v.min > v.max) {
            return;
        }
        
        console.log('deleting ' + key);
        //if only one element in the tree
        // var tree = vanEmdeTree;
        if (v.min === v.max) {
            v.min = 16;
            v.max = -1;
            // tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
            v.name = 'u: ' + `${v.u}` + ', min: ' + '/' + ', max: ' + '/';
            await animateNodeColor(tree, v, 'red');

        } else {
            //if leaf
            if (v.u === 2) {
                if (key === 1) {
                    if (v.min === 1) {
                        v.min = 16;
                        v.max = -1;
                        v.name = 'u: ' + `${v.u}` + ', min: ' + '/' + ', max: ' + '/';
                    } else if (v.min === 0) {
                        v.max = 0;
                        v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
                        
                    }
                    await animateNodeColor(tree, v, 'red');

                } else {
                    if (v.max === 0) {
                        v.min = 16;
                        v.max = -1;
                        v.name = 'u: ' + `${v.u}` + ', min: ' + '/' + ', max: ' + '/';
                        

                    } else if (v.max === 1) {
                        v.min = 1;
                        v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
                    }
                    await animateNodeColor(tree, v, 'red');
                }
            } else {
                //if k is T.min, assign new value to it and return since min is not
                if (key === v.min) {
                    var i = v.summary.min;    //index of first subtree
                    console.log('var i = ' + i);
                    v.min = await indexR(v, i, v.children[i].min);
                    v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
                    await animateNodeColor(tree, v, 'red');
                } else {
                    var i = await highR(v, key);
                    var j = await lowR(v, key);

                    var curNode = v.children[i];

                    await removeRecursive(curNode, j);

                    if (v.children[i].min > v.children[i].max) {
                        await removeSummary(v.summary, i);
                    }

                    if (key === v.max) {
                        if (v.summary.min > v.summary.max) {
                            v.max = v.min;
                            v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
                        } else {
                            i = v.summary.min;
                            v.max = indexR(v, i, v.children[i].max);
                            v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
                        }
                        
                        await animateNodeColor(tree, v, 'red');
                    }
                }

            }
            
            
            
        }
        


        setVanEmdeTree([...tree]);
    }
    
    
    const removeKey = async (key) => {

        key = parseInt(key);
        
        var tree = vanEmdeTree;
        
        if(tree[0].min > tree[0].max) {
            return;
        }
        
        console.log('deleting ' + key);
        //if only one element in the tree
        
        if (tree[0].min === tree[0].max) {
            tree[0].min = 16;
            tree[0].max = -1;
            // tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
            tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + '/' + ', max: ' + '/';
            await animateNodeColor(tree, tree[0], 'red');

        } else {
            //if leaf
            if (tree[0].u === 2) {
                if (key === 1) {
                    if (tree[0].min === 1) {
                        tree[0].min = 16;
                        tree[0].max = -1;
                        tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + '/' + ', max: ' + '/';
                    } else if (tree[0].min === 0) {
                        tree[0].max = 0;
                        tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
                        
                    }
                    await animateNodeColor(tree, tree[0], 'red');

                } else {
                    if (tree[0].max === 0) {
                        tree[0].min = 16;
                        tree[0].max = -1;
                        tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + '/' + ', max: ' + '/';
                        

                    } else if (tree[0].max === 1) {
                        tree[0].min = 1;
                        tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
                    }
                    await animateNodeColor(tree, tree[0], 'red');
                }
            } else {
                //if k is T.min, assign new value to it and return since min is not
                if (key === tree[0].min) {
                    var i = tree[0].summary.min;    //index of first subtree
                    console.log('var i = ' + i);
                    var test = await index(tree, i, tree[0].children[i].min);
                    // console.log('new min = ' + test);
                    tree[0].min = await index(tree, i, tree[0].children[i].min);
                    tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
                    await animateNodeColor(tree, tree[0], 'red');
                }

                var i = await high(tree, key);
                var j = await low(tree, key);

                var curNode = tree[0].children[i];

                console.log('var i = ' + i);
                await removeRecursive(curNode, j);

                if (tree[0].children[i].min > tree[0].children[i].max) {
                    await removeSummary(tree[0].summary,i);
                }

                if (key === tree[0].max) {
                    if (tree[0].summary.min > tree[0].summary.max) {
                        tree[0].max = tree[0].min;
                        tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
                    } else {
                        i = tree[0].summary.min;
                        tree[0].max = index(tree, i, tree[0].children[i].max);
                        tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
                    }
                    
                    await animateNodeColor(tree, tree[0], 'red');
                }
                

            }
            
            
        }

        setVanEmdeTree([...tree]);
    }

    const findRecursive = async (v, key) => {
        key = parseInt(key);
        
        var tree = vanEmdeTree;

        if (key >= 16 || key < 0) {
            console.log("index out of vanEmde bounds");
            return;
        }

        if (key === v.min) {
            // console.log('in the if');
            await animateNodeColor(tree, v, 'green');
            v.name = 'found';
            await animateNodeColor(tree, v, 'yellow');
            v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
        } else if (key === v.max) {
            // console.log('in the if');
            await animateNodeColor(tree, v, 'green');
            v.name = 'found';
            await animateNodeColor(tree, v, 'yellow');
            v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
        } else if (key < v.min || key > v.max) {
            await animateNodeColor(tree, v, 'green');
            v.name = 'not in tree';
            await animateNodeColor(tree, v, 'red');
            v.name = 'u: ' + `${v.u}` + ', min: ' + `${v.min}` + ', max: ' + `${v.max}`;
        } else {
            var i = await highR(v, key);
            var j = await lowR(v, key);

            var curNode = v.children[i];

            // console.log(' is ' + i);
            await animateNodeColor(tree, v, 'green');

            await findRecursive(curNode, j);


        }

    }
    
    
    const findKey = async (key) => {
        key = parseInt(key);
        
        var tree = vanEmdeTree;

        if (key >= 16 || key < 0) {
            console.log("index out of vanEmde bounds");
            return;
        }

        if (key === tree[0].min) {
            // console.log('in the if');
            await animateNodeColor(tree, tree[0], 'green');
            tree[0].name = 'found';
            await animateNodeColor(tree, tree[0], 'yellow');
            tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
        } else if (key === tree[0].max) {
            // console.log('in the if');
            await animateNodeColor(tree, tree[0], 'green');
            tree[0].name = 'found';
            await animateNodeColor(tree, tree[0], 'yellow');
            tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
        } else if (key < tree[0].min || key > tree[0].max) {
            await animateNodeColor(tree, tree[0], 'green');
            tree[0].name = 'not in tree';
            await animateNodeColor(tree, tree[0], 'red');
            tree[0].name = 'u: ' + `${tree[0].u}` + ', min: ' + `${tree[0].min}` + ', max: ' + `${tree[0].max}`;
        } else {
            var i = await high(tree, key);
            var j = await low(tree, key);

            var curNode = tree[0].children[i];

            // console.log(' is ' + i);
            await animateNodeColor(tree, tree[0], 'green');
            await findRecursive(curNode, j);
        }

        setVanEmdeTree([...tree]);
    }

    return (
        <Tree
        data={vanEmdeTree}
        orientation={'vertical'}
        height={400}
        width={800}
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

export default VanEmdeTree