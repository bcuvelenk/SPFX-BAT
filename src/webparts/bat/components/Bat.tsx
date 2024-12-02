import * as React from "react";
import styles from "./Bat.module.scss";
import { IBatProps } from "./IBatProps";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { PrimaryButton, TextField } from "@fluentui/react";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { IDropdownOption } from "@fluentui/react";
import AdminPanel from "./AdminPanel"; // AdminPanel bileşenini içe aktar
import DepartmentManager from "./DepartmentManager"; // DepartmentManager bileşenini içe aktar


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
  isAdminPanelVisible: boolean;
  isDepartmentManagerVisible: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  folders: Folder[];
  selectedDepartment: string;
  isSearching: boolean;
}

export default class Bat extends React.Component<IBatProps, IBatState> {
  constructor(props: IBatProps) {
    super(props);
    this.state = {
      isAdminPanelVisible: false,
      isDepartmentManagerVisible: false,
      searchQuery: "",
      searchResults: [],
      folders: [],
      selectedDepartment: "", // Başlangıçta seçilen departman
      isSearching: false,
    };
  }

  private toggleAdminPanel = (): void => {
    this.setState((prevState) => ({
      isAdminPanelVisible: !prevState.isAdminPanelVisible,
      isDepartmentManagerVisible: false,
    }));
  };

  private toggleDepartmentManager = (): void => {
    this.setState((prevState) => ({
      isDepartmentManagerVisible: !prevState.isDepartmentManagerVisible,
      isAdminPanelVisible: false, // Doküman Manager açıldığında Admin Panel kapanır
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

  private handleFolderClick = (folder: Folder): void => {
    console.log(`Klasör tıklandı: ${folder.Name}`);
  };

  private handleDepartmentChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (option) {
      this.setState({ selectedDepartment: option.key.toString() });
    }
  };

  private handleFileUpload = async (
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
  };

  componentDidMount(): void {
    this.fetchFolders();
  }

  public render(): React.ReactElement<IBatProps> {
    const {
      isAdminPanelVisible,
      isDepartmentManagerVisible,
      searchQuery,
      searchResults,
      isSearching,
      folders,
      selectedDepartment,
    } = this.state;

    return (
      <div className={styles.bat}>
        {/* Header Section */}
        <header className={styles.header}>
          <h1>Samsun Training Document Center</h1>
          <div className={styles.headerRight}>
            <TextField
              value={searchQuery}
              onChange={this.handleSearchChange}
              placeholder="Search documents..."
              className={styles.searchInput}
            />
            <PrimaryButton
              text="Ara"
              onClick={this.handleSearch}
              className={styles.searchButton}
              disabled={isSearching}
            />
            <button
              className={styles.adminButton}
              onClick={this.toggleAdminPanel}
            >
              {isAdminPanelVisible ? "Ana Sayfa" : "Admin Panel"}
            </button>
            <button
              className={styles.managerButton}
              onClick={this.toggleDepartmentManager}
            >
              {isDepartmentManagerVisible ? "Ana Sayfa" : "Döküman Panel"}
            </button>
          </div>
        </header>
    
        {/* Content Section */}
        {!isAdminPanelVisible && !isDepartmentManagerVisible ? (
          <div>
            <div className={styles.folderList}>
              <h2>Available Folders</h2>
              {folders.length > 0 ? (
                folders.map((folder) => (
                  <div
                    key={folder.Name}
                    className={styles.folderItem}
                    onClick={() => this.handleFolderClick(folder)}
                  >
                    {folder.Name}
                  </div>
                ))
              ) : (
                <p>No folders found.</p>
              )}
            </div>
            <div className={styles.searchResults}>
              <h3>Arama Sonuçları</h3>
              {isSearching ? (
                <p>Aranıyor...</p>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((result, index) => (
                    <li key={index}>
                      <a
                        href={result.Path}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {result.Title} ({result.FileType})
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Sonuç bulunamadı.</p>
              )}
            </div>
          </div>
        ) : isAdminPanelVisible ? (
          <AdminPanel
            siteUrl={this.props.siteUrl}
            spHttpClient={this.props.spHttpClient}
            folders={folders}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={this.handleDepartmentChange}
            onFileUpload={this.handleFileUpload}
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