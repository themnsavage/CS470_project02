import './App.css';
import { useEffect, useState, useRef } from "react";
import Inputs from './Inputs';
import BinaryTree from './BinaryTree'
import BTree from './BTree';

function App() {
  const [insertInput, setInsert] = useState('');
  const [deleteInput, setDelete] = useState('');
  const [findInput, setFind] = useState('');

  const binaryTreeRef = useRef();
  const bTreeRef = useRef();

  useEffect(() => {
    if(insertInput != ''){
      console.log(`insert input: ${insertInput}`);
      binaryTreeRef.current.insert(insertInput);
      bTreeRef.current.insert(insertInput);
    }
    setInsert('');
  },[insertInput]);

  useEffect(() => {
    if(deleteInput != ''){
      console.log(`delete input: ${deleteInput}`);
    }
    setDelete('');
  },[deleteInput]);

  useEffect(() => {
    if(findInput != ''){
      console.log(`find input: ${findInput}`);
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
