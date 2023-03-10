import './App.css';
import { useEffect, useState, useRef } from "react";
import Inputs from './Inputs';
import BTree from './BTree';
import VanEmdeTree from './VanEmde';
import RBTree from './RBTree';

function App() {
  /*
    description: main component that brings all the other components together.
  */

  // use state variable
  const [insertInput, setInsert] = useState('');
  const [deleteInput, setDelete] = useState('');
  const [findInput, setFind] = useState('');

  const inputRef = useRef();

  const vanEmdeTreeRef = useRef();
  const bTreeRef = useRef();
  const rbTreeRef = useRef();


  useEffect(() => {
    /*
      description: run specific procedures when insertInput variable state changes
    */
    async function handleInsert(){
      inputRef.current.disable(true);
      if(insertInput != ''){
        console.log(`insert input: ${insertInput}`);
        await bTreeRef.current.insert(insertInput);
        await rbTreeRef.current.insert(insertInput);
        await vanEmdeTreeRef.current.insert(insertInput);
      }
      setInsert('');
      inputRef.current.disable(false);
    }

    handleInsert();
  },[insertInput]);

  useEffect(() => {
    /*
      description: run specific procedures when deleteInput variable state changes
    */
    async function handleDelete(){
      inputRef.current.disable(true);
      if(deleteInput != ''){
        console.log(`delete input: ${deleteInput}`);
        await bTreeRef.current.delete(deleteInput);
        await rbTreeRef.current.remove(deleteInput);
        await vanEmdeTreeRef.current.delete(deleteInput);
      }
      setDelete('');
      inputRef.current.disable(false);
    }

    handleDelete();
  },[deleteInput]);

  useEffect(() => {
    /*
      description: run specific procedures when findInput variable state changes
    */
    async function handleInsert(){
      inputRef.current.disable(true);
      if(findInput != ''){
        console.log(`find input: ${findInput}`);

        await bTreeRef.current.find(findInput);
        await rbTreeRef.current.find(findInput);
        await vanEmdeTreeRef.current.find(findInput);

      }
      setFind('');
      inputRef.current.disable(false);
    }
    
    handleInsert();
  },[findInput]);



  return (
    <div className="App">
      <div className="content">
        <h1>Data Structures Visuals</h1>
      </div>
      <h1>Inputs:</h1>
      <Inputs setInsert={setInsert} setDelete={setDelete} setFind={setFind} ref={inputRef}/>
      <h2>B-Tree:</h2>
      <BTree ref={bTreeRef}/>
      <h2>RB-Tree:</h2>
      <RBTree ref={rbTreeRef}/>
      <h2>van Emde Boas Tree:</h2>
      <p>range is 0-15 :: no duplicate entries
      </p>
      <VanEmdeTree ref={vanEmdeTreeRef}/>
    </div>
  );
}

export default App;
