import React, { useEffect, useRef, useState } from 'react'
import './Column.scss'
import Card from '../Card/Card'
import  mapOrder  from '../../utilities/sorts'
import { Container, Draggable } from 'react-smooth-dnd';
import { FaPlus } from "react-icons/fa6";
import Dropdown from 'react-bootstrap/Dropdown';
import ConfirmModal from '../Common/ConfirmModal';
import Form from 'react-bootstrap/Form';
import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from '../../utilities/constant'
import { IoClose } from "react-icons/io5";
import { v4 as uuidv4} from 'uuid';




const Column = (props) => {

  const { column: columnData, onCardDrop, onUpdateColumn } = props;
  const cards = mapOrder(columnData.cards, columnData.cardOrder, 'id');

  const [isShowModalDelete, setIsShowModalDelete] = useState(false);
  const [titleColumn, setTitleColumn] = useState("")

  const [isFirstClick, setIsFirstClick] = useState(true)
  const inputRef = useRef(null);

  const [isShowAddNewCard, setIsShowAddNewCard] = useState(false);
  const [valueTextArea, setValueTextArea] = useState("")
  const textAreaRef = useRef(null)

  useEffect(()=> {
      if(isShowAddNewCard === true && textAreaRef && textAreaRef.current) {
        textAreaRef.current.focus();
      }
  }, [isShowAddNewCard])

  useEffect(()=> {
     if(columnData && columnData.title) {
      setTitleColumn(columnData.title)
     }
  }, [columnData.title])
  const toggleModal = () => {
    setIsShowModalDelete(!isShowModalDelete);
  }

  const onModalAction = (type) => {
    // console.log(type);
    if(type === MODAL_ACTION_CLOSE){
          //  do nothing
    }
    if(type === MODAL_ACTION_CONFIRM){
          //  remove a column
          const newColumn = {
            ...columnData,
            _destroy: true

          }
          onUpdateColumn(newColumn)
    }

    toggleModal();
  }

  const selectAllText = (event) => {
    setIsFirstClick(false);

    if(isFirstClick) {
      event.target.select();
    } else{
      inputRef.current.setSelectionRange(titleColumn.length, titleColumn.length)
    }
      // event.target.focus();
  }

  const handleClickOutside =() => {
    // do somthing
    setIsFirstClick(true);
    const newColumn = {
      ...columnData,
      title: titleColumn,
      _destroy: false

    }
    onUpdateColumn(newColumn)
  }

  const handleAddNewCard =() => {
    //validate
    if(!valueTextArea){
      textAreaRef.current.focus();
      return;
    }

    const newCard = {
      id: uuidv4(),
      boardId: columnData.boardId,
      columnId: columnData.id,
      title: valueTextArea,
      image: null
    }

    // console.log("newcard:", newCard)
    let newColumn = {...columnData};
    newColumn.cards = [...newColumn.cards, newCard]
    newColumn.cardOrder = newColumn.cards.map(card => card.id);

        // console.log("newcard:", newColumn);
        onUpdateColumn(newColumn);
        setValueTextArea("");
        setIsShowAddNewCard(false);

  }
  return (
    <>
      <div className='column'>
      <header className='column-drag-handle'>
        <div className='column-title'>
        {/* {columnData?.title} */}

        <Form.Control
            size={"l"}
            type="text"
            value={titleColumn}
            className='customize-input-column'
            onClick={selectAllText}
            onChange={(event) => setTitleColumn(event.target.value)}
            spellCheck= "false"
            onBlur={handleClickOutside}
            onMouseDown={(e) => e.preventDefault()}
            ref={inputRef}
        />
        </div>
        <div className='column-dropdown'>
             <Dropdown>
                <Dropdown.Toggle variant="" id="dropdown-basic" size="sm">
                </Dropdown.Toggle>
          
                <Dropdown.Menu>
                  <Dropdown.Item href="#" onClick={()=> setIsShowAddNewCard(true)} >Add card...</Dropdown.Item>
                  <Dropdown.Item onClick={toggleModal}>Remove this column... </Dropdown.Item>
                  {/* <Dropdown.Item href="#">Something else</Dropdown.Item> */}
                </Dropdown.Menu>
             </Dropdown>
        </div>        
      </header>

        <div className='card-list'>
        <Container
                    // onDragStart={e => console.log("drag started", e)}
                    // onDragEnd={e => console.log("drag end", e)}
                     // onDragEnter={() => {
                    //   console.log("drag enter:", columnData.id);
                    // }}
                    // onDragLeave={() => {
                    //   console.log("drag leave:", columnData.id);
                    // }}
                    // onDropReady={p => console.log('Drop ready: ', p)}
                    groupName="col"
                    onDrop={(dropResult) => onCardDrop(dropResult, columnData.id)}
                    getChildPayload={index => cards[index]}
                    dragClass="card-ghost"
                    dropClass="card-ghost-drop"
                   
                    dropPlaceholder={{                      
                      animationDuration: 150,
                      showOnTop: true,
                      className: 'card-drop-preview' 
                    }}
                    dropPlaceholderAnimationDuration={200}
                  >
          {cards && cards.length >0 && cards.map((card, index) =>{
               return(
                <Draggable key={card.id}>
                   <Card  card={card}/>
                 </Draggable>  
               )

          })}
          
          </Container>

      {isShowAddNewCard === true &&
        <div className='add-new-card'>
              <textarea
               rows="2"
               className='form-control'
               placeholder='Enter a title for this card...'
               ref={textAreaRef}
               value={valueTextArea}
               onChange={(event) => setValueTextArea(event.target.value)}
               
              >
              </textarea>
            
              <div className='group-btn'>
                <button 
                  className='btn btn-primary' 
                  onClick={() => handleAddNewCard()}
                   >Add card</button>
                <IoClose className='icon'
                    onClick={()=> setIsShowAddNewCard(false)}
                          />
              </div>
        </div>
}
        </div>
        {isShowAddNewCard === false &&

        <footer>
          <div className='footer-action' 
          onClick={()=> setIsShowAddNewCard(true)}
          >
            <FaPlus className='icon' /> add another card
          </div>
        </footer>
        }
      </div>
      <ConfirmModal 
      show={isShowModalDelete}
      title={"Remove a column"}
      content={`Are you sure to remove this column: <b>${columnData.title}</b> `}
      onAction={onModalAction}
      />
    </>
  )
}

export default Column
