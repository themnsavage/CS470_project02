import { useState } from "react";

const Inputs = ({setInsert, setDelete, setFind},) => {
    const [inputValue, setInputValue] = useState('');

    const handleClick = (event) => {
        if(event.target.id == 'insertButton'){
            setInsert(inputValue);
            setInputValue('')
        }        
        if(event.target.id == 'deleteButton'){
            setDelete(inputValue);
            setInputValue('')
        }
        if(event.target.id == 'findButton'){
            setFind(inputValue);
            setInputValue('')
        }
    }

    return (
        <div>
            <input type ="text" placeholder="Enter a input here" value= {inputValue} onChange={(e) => setInputValue(e.target.value)}/>
            <button id='insertButton' onClick={handleClick}> Insert </button>
            <button id='deleteButton' onClick={handleClick}> Delete </button>
            <button id='findButton' onClick={handleClick}> Find </button>
        </div>
    );
}

export default Inputs