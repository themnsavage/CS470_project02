import './App.css';
import { useEffect, useState, useRef } from "react";
import Inputs from './Inputs';
import BinaryTree from './BinaryTree'
import BTree from './BTree';

function App() {
  /*
    description: main component that brings all the other components together.
  */

  // use state variable
  const [insertInput, setInsert] = useState('');
  const [deleteInput, setDelete] = useState('');
  const [findInput, setFind] = useState('');

  const binaryTreeRef = useRef();
  const bTreeRef = useRef();

  useEffect(() => {
    /*
      description: run specific procedures when insertInput variable state changes
    */
    if(insertInput != ''){
      console.log(`insert input: ${insertInput}`);
      binaryTreeRef.current.insert(insertInput);
      bTreeRef.current.insert(insertInput);
    }
    setInsert('');
  },[insertInput]);

  useEffect(() => {
    /*
      description: run specific procedures when deleteInput variable state changes
    */
    if(deleteInput != ''){
      console.log(`delete input: ${deleteInput}`);
    }
    setDelete('');
  },[deleteInput]);

  useEffect(() => {
    /*
      description: run specific procedures when findInput variable state changes
    */
    if(findInput != ''){
      console.log(`find input: ${findInput}`);
      bTreeRef.current.find(findInput);
    }
    setFind('');
  },[findInput]);



  return (
    <div className="App">
      <div className="content">
        <h1>Data Structures Visuals</h1>
      </div>
      <h1>Inputs:</h1>
      <Inputs setInsert={setInsert} setDelete={setDelete} setFind={setFind}/>
      <h2>Binary Tree:</h2>
      <BinaryTree ref={binaryTreeRef}/>
      <h2>B-Tree:</h2>
      <BTree ref={bTreeRef}/>
    </div>
  );
}

export default App;
