import * as React from "react";
import {  Dropdown, IDropdownOption } from "@fluentui/react";
import { Folder } from "./Bat";
import { getCurrentUser, getUserRole } from "./userHelpers";
import "./AdminComponents.css"

interface IAdminPanelProps {
  siteUrl: string;
  spHttpClient: any;
  folders: Folder[];
  selectedDepartment: string;
  onDepartmentChange: (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => void;
  onFileUpload: (file: File, folder: Folder) => void;
}

const AdminPanel: React.FunctionComponent<IAdminPanelProps> = ({
  siteUrl,
  folders,
  selectedDepartment,
  onDepartmentChange,
  onFileUpload,
  spHttpClient,
}) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("");
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const siteUrl = "https://renksistem.sharepoint.com/sites/GorevYonetimi"; // Site URL'nizi burada belirtin
  
        const userName = await getCurrentUser(siteUrl); // Kullanıcı adını al
        console.log("Kullanıcı Adı:", userName);
  
        const role = await getUserRole(siteUrl, userName); // Kullanıcı rolünü al
        console.log("Kullanıcı Rolü:", role);
  
        setIsAdmin(role === "Admin"); // Admin rolü kontrolü
      } catch (error) {
        console.error("Kullanıcı rolü alınırken hata oluştu", error);
      }
    };
  
    fetchUserRole();
  }, []);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      alert("Lütfen bir dosya seçin.");
      return;
    }

    if (!selectedDepartment) {
      alert("Lütfen bir departman seçin.");
      return;
    }

    if (!selectedLanguage) {
      alert("Lütfen bir dil seçin.");
      return;
    }
 
    setUploading(true);

    const folder = folders.find((f) => f.Name === selectedDepartment);

    if (!folder) {
      alert("Seçilen departmana uygun bir klasör bulunamadı.");
      setUploading(false);
      return;
    }

    try {
      // Dosyayı yükleme
      await onFileUpload(selectedFile, folder);
 
      // Dil bilgisi güncelleme
      await updateDocumentLanguage(
        selectedFile.name,
        folder.ServerRelativeUrl,
        selectedLanguage
      );
 
      alert("Dosya başarıyla yüklendi ve dil bilgisi güncellendi!");
      setSelectedFile(null);
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      alert("Dosya yükleme işlemi sırasında bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const updateDocumentLanguage = async (
    fileName: string,
    folderPath: string,
    language: string
  ) => {
    try {
      const itemUrl = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderPath}')/Files('${fileName}')/ListItemAllFields`;
 
      // Ensure Accept header is set to application/json;odata=verbose
      const response = await spHttpClient.post(itemUrl, {
        headers: {
          Accept: "application/json;odata=verbose", // Correct Accept header
          "Content-Type": "application/json;odata=verbose", // Correct Content-Type header
          "X-RequestDigest":
            (document.getElementById("__REQUESTDIGEST") as HTMLInputElement)
              ?.value || "", // CSRF token
        },
        body: JSON.stringify({
          Dil: { results: [language] }, // The language update payload
        }),
      });
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
 
      alert("Dil bilgisi başarıyla güncellendi.");
    } catch (error) {
      console.error("Dil güncelleme hatası:", error);
      alert("Dil bilgisi güncellenirken bir hata oluştu.");
    }
  };
 
  const handleLanguageChange = (
    event: React.FormEvent<HTMLDivElement>, // You can keep this parameter if you need it
    option?: IDropdownOption
  ): void => {
    if (option) {
      setSelectedLanguage(option.key.toString()); // Update the selected language
    }
  };

  if (!isAdmin) {
    // Kullanıcı admin değilse hiçbir şey gösterme
    return null;
  }

  return (
    <div className="form">
        <form action="submit" style={{width:"50%"}}>
      <h2>Admin Panel</h2>
      <div className="dropdown">
        <Dropdown
          label="Departman Seç"
          style={{border:0,backgroundColor:"f5f5f5"}}
          options={folders.map(
            (folder) =>
              ({ key: folder.Name, text: folder.Name } as IDropdownOption)
          )}
          selectedKey={selectedDepartment}
          onChange={onDepartmentChange}
        />
      </div>
      <div className="dropdown">
        <Dropdown
          label="Dil Seçimi"
          options={[
            { key: "Türkçe", text: "Türkçe" },
            { key: "İngilizce", text: "İngilizce" },
          ]}
          selectedKey={selectedLanguage}
          onChange={handleLanguageChange}
        />
      </div>
      <div>
        {/*<input type="file" onChange={handleFileChange} />*/}
        <label htmlFor="upload-doc" className='label'>Dosya Seç:</label> <br/>
        <div className='attachment'>
          <input
            type="file"
            name="upload-doc"
            id="upload-doc"
            onChange={handleFileChange}
          />
          <p>{selectedFile?.name ? selectedFile?.name : "Bir dosyayı sürükleyiniz yada tıklayınız."}</p>
        </div>
        <br/>

        <div className='button-save'>
          <button type="button" onClick={handleUploadClick}
          disabled={uploading || !selectedFile || !selectedDepartment}>{uploading ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
       {/* <PrimaryButton
          text={uploading ? "Yükleniyor..." : "Yükle"}
          onClick={handleUploadClick}
          disabled={uploading || !selectedFile || !selectedDepartment}
        />*/}
      </div>
    </form>
    </div>
  );
};

export default AdminPanel;
