import { useState } from "react";

const Inputs = ({setInsert}) => {
    const [insertValue, setInsertValue] = useState('')

    const handleClick = () => {
        setInsert(insertValue);
        setInsertValue('')
    }

    return (
        <div>
            <input type ="text" id="insert" placeholder="Enter a value to be added" value= {insertValue} onChange={(e) => setInsertValue(e.target.value)}/>
            <button id="insertClick" onClick={handleClick}> Insert </button>
        </div>
    );
}

export default Inputs