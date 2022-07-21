import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState();
  const [selectItem, setSelectItem] = useState([]);
  const [selectedFile, setSelectedFile] = useState();

  useEffect(() => {
    updateEntry();
  }, []);

  const updateEntry = () => {
    const url = '/fileInfoList';
    axios.get(url).then((response) => {
      // console.log(response.data);
      const tData = response.data || [];
      setSelectItem(tData);
      if (tData.length > 0) {
        setSelectedFile(tData[0].id);
      }
    });
  };

  const handleSelectChange = (pEvt) => {
    setSelectedFile(pEvt.target.value);
  }

  const handleChange = (pEvt) => {
    setFile(pEvt.target.files[0]);
  }

  const handleSubmit = (pEvt) => {
    pEvt.preventDefault();
    const url = '/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    axios.post(url, formData, config).then((response) => {
      console.log(response.data);
      updateEntry();
    });
  } 

  const onBtnClickDelete = () => {
    const url = '/delete/' + selectedFile;
    axios.delete(url).then((response) => {
      updateEntry();
    });
  };

  const onBtnClickDownload = () => {
    window.open('/download/' + selectedFile);
  };

  return (
    <div className="App">
        <form onSubmit={handleSubmit}>
          <h1>Storage File Upload Test</h1>
          <input type="file" onChange={handleChange}/>
          <button type="submit">Upload</button>
        </form>
        <div>
          <select value={selectedFile} onChange={handleSelectChange} style={{width: "15rem"}}>
            {selectItem.map((pItem, pIdx)=><option key={pIdx} value={pItem.id}>{pItem.name}</option>)}
          </select>
          <button onClick={onBtnClickDelete} style={{width: "6rem", marginLeft: "0.2rem"}}>Delete</button>
          <button onClick={onBtnClickDownload} style={{width: "6rem", marginLeft: "0.2rem"}}>Download</button>
        </div>
    </div>
  );
}

export default App;
