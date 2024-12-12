import * as React from 'react';
import deleteIcon from "../assets/deleteIcon.svg";
import editIcon from "../assets/editIcon.svg";
import "./AdminComponents.css"

interface DepartmentItemProps {
  name: string;
  icon: string;
  handleDelete: (folderName: string) => void;
  handleUpdate: (folder: string) => void;
}

const FolderItem: React.FC<DepartmentItemProps> = ({ name, icon, handleDelete, handleUpdate }) => {
  return (
    <div className='department-item'>
      <div className='department-logo'>
        <img src={icon} alt="" />
      </div>
      <div className='department-name'>
        <h5>{name}</h5>
      </div>
      <div className='department-buttons' style={{display:"flex"}}>
        <button onClick={()=>{handleDelete(name)}} className='button-delete' >
          <img src={deleteIcon} style={{width:"20px"}} alt="delete-icon" />
        </button>
        <button onClick={()=>{handleUpdate(name)}} className='button-edit'>
          <img src={editIcon} style={{width:"20px"}} alt="edit-icon" />
        </button>
      </div>
    </div>
  );
}

export default FolderItem;
