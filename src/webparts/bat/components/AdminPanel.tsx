import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { updateDocumentLanguage, getFolders, uploadFile } from './sharepointApi';

export interface IFormProps {
  context: WebPartContext;
}

export interface IFormState {
  selectedLanguage: string;
  selectedFolder: string;
  folders: string[];
  selectedFile: File | null;
}

class Form extends React.Component<IFormProps, IFormState> {
  constructor(props: IFormProps) {
    super(props);
    this.state = {
      selectedLanguage: '',
      selectedFolder: '',
      folders: [],
      selectedFile: null
    };
  }

  async componentDidMount() {
    const folders = await getFolders(this.props.context);
    this.setState({ folders });
  }

  private handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ selectedLanguage: event.target.value });
  }

  private handleFolderChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ selectedFolder: event.target.value });
  }

  private handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files.length > 0) {
      this.setState({ selectedFile: event.target.files[0] });
    }
  }

  private handleButtonClick = async (): Promise<void> => {
    const { selectedFolder, selectedLanguage, selectedFile } = this.state;
    if (selectedFile) {
      try {
        const itemId = await uploadFile(this.props.context, selectedFolder, selectedFile);
        if (itemId !== -1) {
          await updateDocumentLanguage(this.props.context, itemId, selectedLanguage);
          console.log('File uploaded and language updated');
          alert("success");
        } else {
          alert("Failed to upload file");
        }
      } catch (error) {
        console.error('Error uploading file or updating document language:', error);
        alert("Dil güncellenirken veya dosya yüklenirken bir hata oluştu");
      }
    } else {
      alert("Lütfen bir dosya seçin ve yükleyin");
    }
  }

  public render(): React.ReactElement<IFormProps> {
    return (
      <div>
        <select value={this.state.selectedFolder} onChange={this.handleFolderChange}>
          <option value="">Select Folder</option>
          {this.state.folders.map((folder, index) => (
            <option key={index} value={folder}>{folder}</option>
          ))}
        </select>
        <select value={this.state.selectedLanguage} onChange={this.handleLanguageChange}>
          <option value="">Select Language</option>
          <option value="Türkçe">Türkçe</option>
          <option value="English">English</option>
        </select>
        <input type="file" onChange={this.handleFileChange} />
        <button type="button" onClick={this.handleButtonClick}>Gönder</button>
      </div>
    );
  }
}

export default Form;
