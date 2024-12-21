import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/search"; // Arama fonksiyonlarını ekleyin
import { WebPartContext } from "@microsoft/sp-webpart-base";

// SPFI bağlamını oluşturmak için kullanılan getSP fonksiyonu
export const getSP = (context: WebPartContext) => {
  return spfi().using(SPFx(context));
};

// Belirtilen klasör ve dosyaları almak için bir yardımcı fonksiyon
export const getFilesAndFolders = async (context: WebPartContext, libraryName: string, folderPath: string) => {
  try {
    const sp = getSP(context);

    // Belirtilen klasörün dosya ve alt klasörlerini alın
    const folder = sp.web.getFolderByServerRelativePath(`${libraryName}/${folderPath}`);

    // Dosya bilgilerini genişletmek için select ve expand kullanın
    const files = await folder.files.select("Id", "Name", "TimeCreated", "Author/Title", "ListItemAllFields/Dil").expand("Author", "ListItemAllFields")();
    const folders = await folder.folders.select("Name", "TimeCreated", "Author/Title").expand("Author")();

    return { files, folders };
  } catch (error) {
    console.error("Hata:", error);
    throw error;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};


// Arama sorgusu yapmak için bir yardımcı fonksiyon
export const searchDocuments = async (context: WebPartContext, query: string) => { 
  try {
    const sp = getSP(context);

    // PnP JS ile arama sorgusu
    const results = await sp.search({
      Querytext: `${query}* AND path:"${context.pageContext.web.absoluteUrl}/BAT"`,
      SelectProperties: ["Title", "Path", "FileType", "Author", "Created", "Dil"], // Dil alanını da seçin
    });    

    console.log("Search results (raw):", results.PrimarySearchResults);
    
    return results.PrimarySearchResults.map((item: any) => ({
      Title: item.Title,
      Path: item.Path,
      FileType: item.FileType,
      Author: item.Author || "-",
      Created: item.Created ? formatDate(item.Created) : "-",
      Dil: item.Dil || "-", // Dil alanında undefined veya null ise yerine "Bilinmiyor" kullanın
    }));
  } catch (error) {
    console.error("Arama işlemi sırasında hata oluştu:", error);
    throw error;
  }
};

