import { getSP } from "./pnpSetup";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export const updateDocumentLanguage = async (context: WebPartContext, itemId: number, text: string): Promise<void> => {
  try {
    const sp = getSP(context);
    await sp.web.lists.getByTitle("BAT").items.getById(itemId).update({
      Dil: text
    });
  } catch (error) {
    console.error("Error updating document language:", error);
  }
};

export const uploadFile = async (context: WebPartContext, folderName: string, file: File): Promise<number> => {
  try {
    const sp = getSP(context);
    const fileBuffer = await file.arrayBuffer();

    // Dosyayı yükleme
    const addResult = await sp.web.getFolderByServerRelativePath(`BAT/${folderName}`).files.addUsingPath(file.name, fileBuffer, { Overwrite: true });

    // Yüklenen dosyanın URL'si üzerinden öğesine erişim
    const serverRelativeUrl = addResult.ServerRelativeUrl || addResult["odata.id"];
    if (!serverRelativeUrl) {
      throw new Error("ServerRelativeUrl not found in upload result.");
    }

    // Dosyanın list öğesine erişim
    const uploadedItem: any = await sp.web.getFileByServerRelativePath(serverRelativeUrl).getItem();

    // ID değerini al
    const itemId = uploadedItem.ID || uploadedItem.Id || uploadedItem.id;
    if (!itemId) {
      throw new Error("ID not found in uploaded file item.");
    }

    return itemId;
  } catch (error) {
    console.error("Error uploading file:", error);
    return -1;
  }
};




export const getFolders = async (context: WebPartContext): Promise<string[]> => {
  try {
    const sp = getSP(context);
    const folders = await sp.web.getFolderByServerRelativePath("BAT").folders.select("Name")();
    return folders.map(folder => folder.Name);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
};
