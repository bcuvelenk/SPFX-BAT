import * as React from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import FolderItem from './Folders';
import blueFolder from "../assets/blueFolderIcon.svg"

interface IDepartmentManagerProps {
  siteUrl: string;
  spHttpClient: SPHttpClient;
}

interface IDepartmentManagerState {
  folders: string[];
  folderName: string;
  oldFolderName: string;
  newFolderName: string;
  error: string | null;
  successMessage: string | null;
}


export default class DepartmentManager extends React.Component<IDepartmentManagerProps, IDepartmentManagerState> {
  constructor(props: IDepartmentManagerProps) {
    super(props);

    this.state = {
      folders: [],
      folderName: '',
      oldFolderName: '',
      newFolderName: '',
      error: null,
      successMessage: null,
    };
  }

  private fetchFolders = async (): Promise<void> => {
    const { spHttpClient, siteUrl } = this.props;
  
    try {
      const endpoint = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('/sites/GorevYonetimi/BAT')/Folders`;
  
      const response: SPHttpClientResponse = await spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
  
      if (response.ok) {
        const data = await response.json();
        const folders = data.value
          .filter((folder: any) => folder.Name !== "Forms") // Forms adlı klasörü hariç tut
          .map((folder: any) => folder.Name);
  
        this.setState({ folders, error: null });
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    } catch (error: any) {
      this.setState({ error: error.message });
      console.error('Klasörler getirilemedi:', error);
    }
  };
  

  private createFolder = async (): Promise<void> => {
    const { siteUrl, spHttpClient } = this.props;
    const { folderName } = this.state;

    if (!folderName) {
      this.setState({ error: 'Lütfen bir klasör adı girin.' });
      return;
    }

    try {
      const folderPath = `/sites/GorevYonetimi/BAT/${folderName}`;
      const endpoint = `${siteUrl}/_api/web/folders`;

      const response: SPHttpClientResponse = await spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'ServerRelativeUrl': folderPath,
        }),
      });

      if (response.ok) {
        this.setState({ folderName: '', successMessage: 'Klasör başarıyla oluşturuldu.', error: null });
        this.fetchFolders();
      } else {
        const errorData = await response.json();
        this.setState({ error: errorData.error.message, successMessage: null });
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      this.setState({ error: 'Klasör oluşturulurken hata oluştu. Lütfen tekrar deneyin.', successMessage: null });
    }
  };

  
  // Rename (update) a folder
  private updateFolder = async (): Promise<void> => {
    const { siteUrl, spHttpClient } = this.props;
    const { oldFolderName, newFolderName } = this.state;

    if (!oldFolderName || !newFolderName) {
      this.setState({ error: 'Lütfen hem eski hem de yeni klasör adlarını girin.' });
      return;
    }

    try {
      const folderPath = `/sites/GorevYonetimi/BAT/${oldFolderName}`;
      const newFolderPath = `/sites/GorevYonetimi/BAT/${newFolderName}`;

      const endpoint = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderPath}')/MoveTo(newUrl='${newFolderPath}')`;

      const response: SPHttpClientResponse = await spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.setState({ oldFolderName: '', newFolderName: '', successMessage: 'Klasör başarıyla yeniden adlandırıldı.', error: null });
        this.fetchFolders();
      } else {
        const errorData = await response.json();
        this.setState({ error: errorData.error.message, successMessage: null });
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
      this.setState({ error: 'Klasör yeniden adlandırılırken hata oluştu. Lütfen tekrar deneyin.', successMessage: null });
    }
  };

private deleteFolder = async (folderName: string): Promise<void> => {
  const { siteUrl, spHttpClient } = this.props;

  try {
    const folderPath = `/sites/GorevYonetimi/BAT/${folderName}`;
    const endpoint = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderPath}')`;

    const response: SPHttpClientResponse = await spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-HTTP-Method': 'DELETE',
        'If-Match': '*',
      },
    });

    if (response.ok) {
      this.setState({ successMessage: `Klasör "${folderName}" başarıyla silindi.`, error: null });
      this.fetchFolders();
    } else {
      const errorData = await response.json();
      this.setState({ error: errorData.error.message, successMessage: null });
    }
  } catch (error) {
    console.error('Error deleting folder:', error);
    this.setState({ error: 'Klasör silinirken hata oluştu. Lütfen tekrar deneyin.', successMessage: null });
  }
};

private handleDeleteFolder = (folderName: string): void => {
  const userConfirmed = confirm(`Klasörü silmek istediğinizden emin misiniz? "${folderName}"?`);
  if (userConfirmed) {
    this.deleteFolder(folderName);
  }
};

private handleUpdateClick = (folder: string): void => {
  const newFolderName = prompt('Lütfen yeni klasör adını girin:', folder);
  
  if (newFolderName && newFolderName !== folder) {
    if (window.confirm('Klasör adını güncellemek istediğinizden emin misiniz?')) {
      this.setState(
        { oldFolderName: folder, newFolderName }, // State'i güncelle
        () => this.updateFolder() // Güncelleme tamamlandıktan sonra updateFolder'ı çalıştır
      );
    }
  }
};

  componentDidMount(): void {
    this.fetchFolders();
  }

  render(): React.ReactElement<IDepartmentManagerProps> {
    const { folders, folderName, error, successMessage } = this.state;


    return (
      <div>
        {/* Add New Folder */}
        <div>
          <h3>Departman Ekle</h3>
           <div className='department-form'>
              <input
              type="text"
              value={folderName}
              onChange={(e) => this.setState({ folderName: e.target.value })}
              placeholder="New folder name"
              />
              <button onClick={this.createFolder}>💾 Kaydet</button>
           </div>
          
        </div>
      
        {/* Success and Error Messages */}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {/* Folder List */}
        <div>
          <h3>Departmanlar</h3>
          <hr />
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px",maxHeight:"400px",overflowY:"auto"}}>
          {folders.length > 0 ? (
            folders.map((folder, index) => (
              
                <FolderItem icon={blueFolder} name={folder} key={index} handleDelete={this.handleDeleteFolder} handleUpdate={this.handleUpdateClick}/>
              
            ))
          ) : (
            <p>Dosya bulunamadı.</p>
          )}
          </div>
        </div>
      </div>
    );
  }
}