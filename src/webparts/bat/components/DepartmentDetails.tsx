import * as React from "react";
import searchIcon from "../assets/SearchIcon.svg";
import "../components/FilterForm.css"
import { SPHttpClient } from "@microsoft/sp-http";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { getFilesAndFoldersFromLibrary } from "./GetFolderContent";
import styles from "./Bat.module.scss"
import "@fortawesome/fontawesome-free/css/all.min.css";
import fileIcon from "../assets/FileIcon.svg";
import home from "../assets/Home.svg"

interface DepartmentDetailProps {
  folderName: string;
  spHttpClient: SPHttpClient;
  siteUrl: string;
  context: WebPartContext;
  toggleHome: () => void;
}
 
const DepartmentDetail: React.FC<DepartmentDetailProps> = ({
  folderName,
  spHttpClient,
  siteUrl,
  context,
  toggleHome,
}) => {
  const [files, setFiles] = React.useState<any[]>([]);
  const [folders, setFolders] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [startDate, setStartDate] = React.useState("");
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("");


  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getFilesAndFoldersFromLibrary(context, folderName);
        if (result) {
          setFiles(result.files || []);
          setFolders(result.folders || []);
        } else {
          setFiles([]);
          setFolders([]);
        }
      } catch (error) {
        console.error("Veriler alınırken hata oluştu:", error);
      }
    };
    fetchData();
  }, [context, folderName]);
 
  // Tarih filtresi için değeri dönüştür
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };
 
  const filteredFiles = files.filter((file) => {
    const fileDate = new Date(file.TimeCreated); // Dosyanın oluşturulma tarihi
    const start = new Date(startDate); // Kullanıcının seçtiği tarih
    const matchesSearch = file.Name.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
 
    // Gün, ay (0 tabanlı) ve yıl karşılaştırması
    const matchesStartDate = startDate
      ? fileDate.getDate() === start.getDate() && // Gün aynı
        fileDate.getMonth() === start.getMonth() && // Ay aynı
        fileDate.getFullYear() === start.getFullYear() // Yıl aynı
      : true;
 
    const matchesLanguage = selectedLanguage
      ? file.ListItemAllFields?.Dil === selectedLanguage
      : true;
 
    return matchesSearch && matchesStartDate && matchesLanguage;
  });
 
  const filteredFolders = folders.filter((folder) => {
    const folderDate = new Date(folder.TimeCreated); // Klasörün oluşturulma tarihi
    const start = new Date(startDate); // Kullanıcının seçtiği tarih
    const matchesSearch = folder.Name.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
 
    // Gün, ay (0 tabanlı) ve yıl karşılaştırması
    const matchesStartDate = startDate
      ? folderDate.getDate() === start.getDate() && // Gün aynı
        folderDate.getMonth() === start.getMonth() && // Ay aynı
        folderDate.getFullYear() === start.getFullYear() // Yıl aynı
      : true;
 
    return matchesSearch && matchesStartDate;
  });
 
  
    return (
    <div>
      <header>
        <h1>{folderName}</h1>
      <button
      style={{position:"absolute", marginLeft:"690px", top: "2px"}}
      className={styles.buttons}
      onClick={toggleHome}>
      <img src={home} style={{ width: "20px" }} alt="" />
      </button>
      </header> 
      <nav>
        <div className="filters">
          {/* Arama Kutusu */}
          <div className="filter-search">    
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Arama değeri
            />
            <img
              className="filter-search-icon"
              src={searchIcon}
              alt="Search Icon"
            />
          </div>
 
          {/* Tarih Filtresi */}
          <div className="date-start">
            <input
              type="date"
              name="date-start"
              id="date-start"
              value={startDate}
              onChange={handleDateChange} // Tarih değişimini yönet
            />
          </div>
 
          {/* Dil Seçimi */}
          <div className="dropdown-language">
            <select
              id="filter-language"
              name="filter-language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="">Tüm Diller</option>
              <option value="Türkçe">Türkçe</option>
              <option value="İngilizce">İngilizce</option>
            </select>
          </div>
        </div>
      </nav>
      <div> 
      </div>
      {/* Tablo */}
      <main>
      <div style={{textAlign:"center"}}>
        <h3>Arama Sonuçları</h3>
      </div>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableTitles}>
              <th>Belge Adı</th>
              <th>Oluşturulma Tarihi</th>
              <th>Oluşturan</th>
              <th>Dil</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* Klasörler */}
            {filteredFolders.map((folder) => (
              <tr key={folder.UniqueId} className={styles.tableItems}>
                <td>{folder.Name}</td>
                <td>Klasör</td>
                <td>
                  {folder.TimeCreated
                    ? new Date(folder.TimeCreated).toLocaleString()
                    : "-"}
                </td>
                <td>
                  {folder.Author ? folder.Author.Title : "-"}</td>
                <td>-</td>
              </tr>
            ))}
 
            {/* Dosyalar */}
            {filteredFiles.map((file) => (
              <tr key={file.UniqueId} className="item-box">
                {console.log("File ServerRelativeUrl:", file.ServerRelativeUrl)}
                <td className="item-buttons">
                  <a
                    href={file.ServerRelativeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.Name}
                  </a>
                </td>
                <td>{new Date(file.TimeCreated).toLocaleString()}</td>
                <td>{file.Author?.Title || "-"}</td>
                <td>{file.ListItemAllFields?.Dil || "-"}</td>
                <td>
                  <a href={file.ServerRelativeUrl} target="_blank">
                    <button style={{ border: "none", backgroundColor: "#fff" }}>
                      <img style={{ width: "30px" }} src={fileIcon} alt="" />
                    </button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};
 
export default DepartmentDetail;