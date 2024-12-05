import React, { useEffect, useRef, useState } from 'react';
import './BoardContent.scss';
import Column from '../Column/Column';
import { initData } from '../../actions/initData';
import _ from 'lodash';
import mapOrder from '../../utilities/sorts';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDrag } from '../../utilities/dragDrop';
import { FaPlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { v4 as uuidv4} from 'uuid';




function BoardContent() {
  const [board, setBoard] = useState({});
  const [columns, setColumns] = useState([]);

  const [isShowAddList, setIsShowAddList] = useState(false)
  const inputRef = useRef(null);
  const [valueInput, setValueInput] = useState("");

  useEffect(()=>{
       if(isShowAddList === true && inputRef && inputRef.current){
        inputRef.current.focus();
       }
  }, [isShowAddList])


  useEffect(() => {
    const boardInitData = initData.boards.find(item => item.id === 'board-1');
    if (boardInitData) {
      setBoard(boardInitData);

      //sort columns
      setColumns(mapOrder(boardInitData.columns, boardInitData.columnOrder, 'id'));
    }
  }, []);

  const onColumnDrop = (dropResult) =>{
    // console.log('>>> inside onColumnDrop', dropResult);
    let newColumns = [...columns];
    newColumns = applyDrag(newColumns, dropResult);
    // console.log(">>> inside onColumnDrop new columns: ", newColumns)

    let newBoard = {...board};
    newBoard.columnOrder = newColumns.map(column => column.id);
    newBoard.columns = newColumns;

    setColumns(newColumns);
    setBoard(newBoard);
  }

  const onCardDrop = (dropResult, columnId) => {
    if (dropResult.removedIndex !== null || dropResult.addIndex !== null){
      console.log(">>> inside onCardDrop: ", dropResult, 'with columnId=', columnId);

      let newColumns = [...columns];

      let currentColumn = newColumns.find(column => column.id === columnId);
      // console.log("currentColumn = ", currentColumn)
      currentColumn.cards = applyDrag(currentColumn.cards, dropResult);
      currentColumn.cardOrder = currentColumn.cards.map(card => card.id);

      // console.log(">>> current column:", currentColumn)

      setColumns(newColumns);
    }

  }

  
  if (_.isEmpty(board)) {
    return (
      <div className='not-found'>Board not found</div>
    );
  }

  const handleAddList = () => {
    if(!valueInput){
      if(inputRef && inputRef.current)
        inputRef.current.focus();
      return;
    }
    // console.log(">>> check value input: ", valueInput)
    // update board column 
    const _columns = _.cloneDeep(columns);
    _columns.push({
        id: uuidv4(),
        boardId: board.id,
        title: valueInput,
        cards: []
    });
    console.log(">>> columns:", columns, _columns)

    setColumns(_columns);
    setValueInput("");
    inputRef.current.focus();

  }

  const onUpdateColumn = (newColumn) => {
    // console.log(newColumn)
    const columnIdUpdate = newColumn.id;
    let ncols = [...columns];
    let index = ncols.findIndex(item => item.id === columnIdUpdate) 
    if(newColumn._destroy){
      ncols.splice(index, 1);
    }else{
      ncols[index] = newColumn;
    }
    setColumns(ncols);
  }

  return (
    <>
    <div className="board-columns">
    <Container
          orientation="horizontal"
          onDrop={onColumnDrop}
          getChildPayload={index => columns[ index ]}
          dragHandleSelector=".column-drag-handle"
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: 'column-drop-preview'
          }}
        >
      {columns && columns.length > 0 && columns.map((column, index) => {
        return(
          <Draggable key={column.id}
>
               <Column 
               column={column}
               onCardDrop={onCardDrop}
               onUpdateColumn={onUpdateColumn}
               />
          </Draggable>
        )
        
})}

</Container>


{isShowAddList === false ? 
  <div className='add-new-column' onClick={() => setIsShowAddList(true)}>
<FaPlus className='icon'/> Add another column
</div>
:
<div className='content-add-column'>
  <input
   type="text"
   className='form-control'
   ref={inputRef}
   value={valueInput}
   onChange={(event) => setValueInput(event.target.value)}
  />

  <div className='group-btn'>
    <button className='btn btn-success' 
       onClick={() => handleAddList()}
       >Add list</button>
    <IoClose className='icon' onClick={() => setIsShowAddList(false)}/>
  </div>
</div>

}


   

    </div>
    </>
  );
}

export default BoardContent;
