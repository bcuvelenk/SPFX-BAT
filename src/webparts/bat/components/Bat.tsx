import * as React from "react";
import styles from "./Bat.module.scss";
import { IBatProps } from "./IBatProps";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import AdminPanel from "./AdminPanel"; // AdminPanel bileşenini içe aktar
import DepartmentManager from "./DepartmentManager"; // DepartmentManager bileşenini içe aktar
import logo from "../assets/logo.png";
import searchIcon from "../assets/SearchIcon.svg";
import icon from "../assets/blueFolderIcon.svg"
import spinner from "../assets/spinner.svg"
import fileIcon from "../assets/FileIcon.svg"
import home from "../assets/Home.svg"


interface SearchResult {
  Title: string;
  Path: string;
  FileType: string;
}

export interface Folder {
  Name: string;
  ServerRelativeUrl: string;
}


interface IBatState {
  isAdmin: boolean;
  isAdminPanelVisible: boolean;
  isDepartmentManagerVisible: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  folders: Folder[];
  selectedDepartment: string;
  isSearching: boolean;
  userRole: string; // Kullanıcı rolünü tutacak state
}

export default class Bat extends React.Component<IBatProps, IBatState> {
  constructor(props: IBatProps) {
    super(props);
    this.state = {
      isAdmin: false,
      isAdminPanelVisible: false,
      isDepartmentManagerVisible: false,
      searchQuery: "",
      searchResults: [],
      folders: [],
      selectedDepartment: "", // Başlangıçta seçilen departman
      isSearching: false,
      userRole: '', // Başlangıçta kullanıcı rolü boş
    };
  }

  private getUserRole = async (): Promise<string> => {
    return 'Admin'; 
  };

  // Kullanıcı rolünü alacak fonksiyon
  private fetchUserRole = async (): Promise<void> => {
    try {
      const role = await this.getUserRole(); // getUserRole fonksiyonunu çağırıyoruz
      if (role === "Admin") {
        this.setState({ isAdmin: true }); // Eğer admin ise, state güncelleniyor
      }
      this.setState({ userRole: role }); // Kullanıcı rolünü state'e kaydediyoruz
    } catch (error) {
      console.error("Rol alınırken hata oluştu:", error);
    }
  };

  private toggleAdminPanel = (): void => {
    this.setState((prevState) => {
      const newState = {
        isAdminPanelVisible: !prevState.isAdminPanelVisible,
        isDepartmentManagerVisible: false,
      };
      console.log("Admin Panel Toggled:", newState.isAdminPanelVisible); // Kontrol etmek için
      return newState;
    });
  };

  private toggleDepartmentManager = (): void => {
    this.setState((prevState) => ({
      isDepartmentManagerVisible: !prevState.isDepartmentManagerVisible,
      isAdminPanelVisible: false, // Doküman Manager açıldığında Admin Panel kapanır
    }));
  };

  private toggleHome = (): void => {
    this.setState((prevState) => ({
      isDepartmentManagerVisible: false,
      isAdminPanelVisible: false, 
      
    }));
  };

  private handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.setState({ searchQuery: event.target.value });
  };

  private handleSearch = async (): Promise<void> => {
    const { searchQuery } = this.state;
    const { siteUrl, spHttpClient } = this.props;
    

    if (!searchQuery) {
      alert("Lütfen bir arama terimi girin.");
      return;
    }

    this.setState({ isSearching: true });

    try {
      const endpoint = `${siteUrl}/_api/search/query?querytext='${searchQuery}* path:"${siteUrl}/BAT"'&selectproperties='Title,Path,FileType'`;

      const response: SPHttpClientResponse = await spHttpClient.get(
        endpoint,
        SPHttpClient.configurations.v1
      );

      if (response.ok) {
        const data = await response.json();
        const results: SearchResult[] =
          data.PrimaryQueryResult.RelevantResults.Table.Rows.map((row: any) => {
            const result: SearchResult = row.Cells.reduce(
              (acc: any, cell: any) => ({
                ...acc,
                [cell.Key]: cell.Value,
              }),
              { Title: "", Path: "", FileType: "" }
            );
            return result;
          });

        this.setState({ searchResults: results, isSearching: false });
      } else {
        alert("Arama sırasında bir hata oluştu.");
        this.setState({ isSearching: false });
      }
    } catch (error) {
      alert("Arama işlemi başarısız oldu.");
      console.error(error);
      this.setState({ isSearching: false });
    }
  };

  private fetchFolders = async (): Promise<void> => {
    const { siteUrl, spHttpClient } = this.props;

    try {
      const endpoint = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('BAT')/Folders`;
      const response: SPHttpClientResponse = await spHttpClient.get(endpoint, SPHttpClient.configurations.v1);

      if (response.ok) {
        const data = await response.json();
        const folders: Folder[] = data.value.map((folder: any) => ({
          Name: folder.Name,
          ServerRelativeUrl: folder.ServerRelativeUrl,
        }));

        this.setState({ folders });
      } else {
        alert("Klasörler yüklenirken bir hata oluştu.");
      }
    } catch (error) {
      alert("Klasör bilgileri alınamadı.");
      console.error(error);
    }
  };



  /*private handleDepartmentChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (option) {
      this.setState({ selectedDepartment: option.key.toString() });
    }
  };

  private handleUploadClick = async (
    file: File,
    folder: Folder
  ): Promise<void> => {
    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Construct endpoint
      const endpoint = `${
        this.props.siteUrl
      }/_api/web/GetFolderByServerRelativeUrl('${
        folder.ServerRelativeUrl
      }')/Files/Add(url='${encodeURIComponent(file.name)}',overwrite=true)`;

      // Perform file upload
      const response: SPHttpClientResponse = await this.props.spHttpClient.post(
        endpoint,
        SPHttpClient.configurations.v1,
        {
          body: arrayBuffer,
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/octet-stream",
          },
        }
      );

      if (response.ok) {
        alert("File uploaded successfully.");
      } else {
        const errorText = await response.text();
        alert(`Error uploading file: ${errorText}`);
      }
    } catch (error) {
      alert("File upload failed.");
      console.error("File upload error:", error);
    }
  };*/

  componentDidMount(): void {
    this.fetchFolders();
    this.fetchUserRole();
  }

  public render(): React.ReactElement<IBatProps> {
    console.log("Current User Role:", this.state.userRole); // Rolü burada kontrol edin
    const {
      isAdminPanelVisible= this.state,
      isDepartmentManagerVisible,
      searchQuery,
      searchResults,
      isSearching,
      folders,
      //selectedDepartment,
    } = this.state;
    
    return (
      <div className={styles.box}>
        {/* Header Section */}
        <nav className={styles.nav}>
        <img className={styles.navlogo} src={logo} alt="BAT Logosu" />
        {
          !(isAdminPanelVisible || isDepartmentManagerVisible) ? <div className={styles.navsearch}>
          <input
            value={searchQuery}
            onChange={this.handleSearchChange}
            placeholder="Search..."
            className={styles.searchInput}
          />{/*<button
            onClick={this.handleSearch}
            className={styles.searchButton}
            disabled={isSearching}
            >
            Ara
          </button>*/}
          <img onClick={this.handleSearch} className={styles.navsearchicon} src={searchIcon} alt="Search Icon" />
          </div>:""
        }
            {/* Hide Admin Panel button if user is not admin */}
           <div style={{display:"flex"}}>
           {this.state.userRole === "Admin" && !isAdminPanelVisible ? (
            <button
                onClick={this.toggleAdminPanel}
                className={styles.buttons}
                >
                Admin Paneli
              </button>
          ):""}
            {
              !isDepartmentManagerVisible ? <button
              className={styles.buttons}
              onClick={this.toggleDepartmentManager}
            >
               Döküman Panel
            </button>:""
            }
            {
              isAdminPanelVisible || isDepartmentManagerVisible ? <button onClick={this.toggleHome}>
              <img src={home} style={{width:"20px"}} alt="" />
            </button>:"" 
            }
           </div>
       
        </nav>

        

         {/* Admin Paneli */}
         {isAdminPanelVisible && AdminPanel}
        {/* Content Section */}
        {!isAdminPanelVisible && !isDepartmentManagerVisible ? (
  <div>

    <div>
     
      {
        !searchQuery ? <div className={styles.cardArea}>
        {folders.length > 0 ? (
          folders.map((folder,index) => (
            <div key={index} className={styles.cardBox}>
                 <a href={`https://renksistem.sharepoint.com/sites/GorevYonetimi/BAT/${folder.Name}`} target="_blank">
                 <div className={styles.cardicon}>
                       <img style={{ width: "50%" }} src={icon} alt="folder-icon" />
                   </div>
                   <div className={styles.cardcontent}>
                      <p>{folder.Name}</p>
                   </div>
                 </a>
            </div>
          ))
        ) : (
          <p>No folders found.</p>
        )}
  
      </div>: ""
      }
    </div>
    {
      searchQuery ? <div className={styles.searchResults}>
      <div style={{textAlign:"center"}}>
        <h3>Arama Sonuçları</h3>
      </div>
      {isSearching ? (
        <div style={{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",height:"300px"}}>
           <img src={spinner} alt="" />
        </div>
      ) : searchResults.length > 0 ? (
        <div style={{maxHeight: "500px",overflowY: "auto"}}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableTitles}>
              <th>Dosya</th>
              <th>Oluşturan</th>
              <th>Tarih</th>
              <th>Dosya Tipi</th>
              <th>Dil</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((result, index) => (
              <tr key={index} className={styles.tableItems}>
                <td>{result.Title}</td>
                <td>Pelda & Buket</td>
                <td>01.01.2002</td>
                <td>{result.FileType}</td>
                <td>Türkçe</td>
                <td>
                  <a href={result.Path} target="_blank">
                    <button>
                      <img style={{width:"35px"}} src={fileIcon} alt="" />
                    </button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : (
        ""
      )}
    </div>:""
    }
  </div>
        ) : isAdminPanelVisible ? (
          <AdminPanel
          context={this.props.context}
          />
        ) : isDepartmentManagerVisible ? (
          <DepartmentManager
            siteUrl={this.props.siteUrl}
            spHttpClient={this.props.spHttpClient}
          />
        ) : null}
      </div>
    );
  }
}