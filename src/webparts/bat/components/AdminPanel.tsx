import * as React from "react";
import { PrimaryButton, Dropdown, IDropdownOption } from "@fluentui/react";
import { Folder } from "./Bat";
 
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
 
    setUploading(true);
 
    const folder = folders.find((f) => f.Name === selectedDepartment);
 
    if (!folder) {
      alert("Seçilen departmana uygun bir klasör bulunamadı.");
      setUploading(false);
      return;
    }
 
    try {
      await onFileUpload(selectedFile, folder);
      alert("Dosya başarıyla yüklendi!");
      setSelectedFile(null);
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      alert("Dosya yükleme işlemi sırasında bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };
 
  const handleLanguageChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (option) {
      setSelectedLanguage(option.key.toString());
    }
  };
 
  return (
    <div>
      <h2>Admin Panel</h2>
      <div>
        <Dropdown
          label="Departman Seç"
          options={folders.map(
            (folder) =>
              ({ key: folder.Name, text: folder.Name } as IDropdownOption)
          )}
          selectedKey={selectedDepartment}
          onChange={onDepartmentChange}
        />
      </div>
      <div>
        <Dropdown
          label="Dil Seçimi"
          options={[
            { key: "tr", text: "Türkçe" },
            { key: "en", text: "İngilizce" },
          ]}
          selectedKey={selectedLanguage}
          onChange={handleLanguageChange}
        />
      </div>
      <div>
        <input type="file" onChange={handleFileChange} />
        <PrimaryButton
          text={uploading ? "Yükleniyor..." : "Yükle"}
          onClick={handleUploadClick}
          disabled={uploading || !selectedFile || !selectedDepartment}
        />
      </div>
    </div>
  );
};
 
export default AdminPanel;