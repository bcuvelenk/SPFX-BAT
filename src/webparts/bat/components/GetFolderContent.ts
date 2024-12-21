import { WebPartContext } from "@microsoft/sp-webpart-base";
import { getFilesAndFolders } from "../components/pnpSetup";
 
// Fonksiyonu çağırarak dosya ve klasörleri almak
export const getFilesAndFoldersFromLibrary = async (
  context: WebPartContext,
  folderName: string
) => {
  try {
    const libraryName = "BAT"; // Belge kitaplığının adı
    // const folderPath = "SMD"; // Hedef klasörün yolu
 
    // Dosya ve klasörleri getir
    const { files, folders } = await getFilesAndFolders(
      context,
      libraryName,
      folderName
    );
    return { files, folders };
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};