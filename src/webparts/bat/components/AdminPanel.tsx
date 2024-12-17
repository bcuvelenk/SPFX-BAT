import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { updateDocumentLanguage, getFolders, uploadFile } from './sharepointApi';
import styles from './AdminPanel.module.scss'

export interface IAdminPanelProps {
  context: WebPartContext;
}

export interface IFormState {
  selectedLanguage: string;
  selectedFolder: string;
  folders: string[];
  selectedFile: File | null;
}

class AdminPanel extends React.Component<IAdminPanelProps, IFormState> {
  constructor(props: IAdminPanelProps) {
    super(props);
    this.state = {
      selectedLanguage: '',
      selectedFolder: '',
      folders: [],
      selectedFile: null,
    };
    this.handleFileChange = this.handleFileChange.bind(this); // Metodu bağlama
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

  handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      this.setState({ selectedFile: event.target.files[0] }); // Seçilen dosyayı state'e ekle
    }
  }

  private handleButtonClick = async (): Promise<void> => {
    const { selectedFolder, selectedLanguage, selectedFile } = this.state;
    if (selectedFile) {
      try {
        const itemId = await uploadFile(this.props.context, selectedFolder, selectedFile);
        if (itemId !== -1) {
          await updateDocumentLanguage(this.props.context, itemId, selectedLanguage);
          console.log('Dosya yüklendi ve belge dil bilgisi güncellendi.');
          alert("Dosya ve belge dili başarılı bir şekilde yüklendi.");
        } else {
          alert("Dosya yüklenemedi.");
        }
      } catch (error) {
        console.error('Dosya yüklenirken veya belge dili güncellenirken hata oluştu:', error);
        alert("Belge dil bilgisi güncellenirken veya dosya yüklenirken bir hata oluştu");
      }
    } else {
      alert("Lütfen bir dosya seçin ve yükleyin");
    }
  }

  public render(): React.ReactElement<IAdminPanelProps> {
    const { selectedFile } = this.state;
    return (
      <div className="form">
        <form action="submit" style={{ width: "50%" }}>
          <h2>Admin Panel</h2>
          {/* Departman Seçimi */}
          <div className="dropdown">
            <label htmlFor="folderSelect">Departman Seç:</label>
            </div>
              <select
                id="folderSelect"
                value={this.state.selectedFolder}
                onChange={this.handleFolderChange}
                className={styles['dropdown-Department']}
               /* style={{width:"100%", height:"35px", position:"relative", display:"inline-block", marginBottom:"25px",marginTop:"5px", cursor:"pointer"}}*/
              >
                <option value=""></option>
                {this.state.folders.map((folder, index) => (
                  <option key={index} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>
          
  
          {/* Dil Seçimi */}
          <div className="dropdown">
            <label htmlFor="languageSelect">Dil Seç:</label>
            </div>
              <select
                id="languageSelect"
                value={this.state.selectedLanguage}
                onChange={this.handleLanguageChange}
                className={styles['dropdown-Department']}
                /*style={{width:"100%", height:"35px", position:"relative", display:"inline-block", marginBottom:"25px",marginTop:"5px", cursor:"pointer"}}*/
              >
                <option value=""></option>
                <option value="Türkçe">Türkçe</option>
                <option value="İngilizce">İngilizce</option>
              </select>
            
         
  
          {/* Dosya Yükleme */}
          <div className="form-group">
            <label htmlFor="upload-doc">Dosya Seç:</label>
            <div className="attachment">
              <input
                type="file"
                name="upload-doc"
                id="upload-doc"
                onChange={this.handleFileChange}
              />
              <p>
                {selectedFile?.name
                  ? selectedFile.name
                  : "Bir dosyayı sürükleyiniz yada tıklayınız."}
              </p>
            </div>
          </div>
          <br></br>
          {/* Gönder Butonu */}
          <div className="button-save">
            <button type="button" onClick={this.handleButtonClick} style={{backgroundColor:"#023061", borderRadius:"5px", borderWidth:"0", color:"#fff", fontSize:".8rem", fontWeight:"500px", padding:"10px"}}>
              Kaydet
            </button>
        </div>
        </form>
      </div>

    );
  }
}

export default AdminPanel;
