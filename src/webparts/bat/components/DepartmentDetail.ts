import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
 
export interface Document {
  title: string;
  createdBy: string;
  created: string;
  language: string;
  filePath: string;
}
 
export const getDocumentsFromFolder = async (
  spHttpClient: SPHttpClient,
  siteUrl: string,
  libraryName: string,
  folderName: string
): Promise<Document[]> => {
  try {
    const endpoint = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('/sites/GorevYonetimi/BAT/${folderName}')/Files`;
 
    const response: SPHttpClientResponse = await spHttpClient.get(
      endpoint,
      SPHttpClient.configurations.v1
    );
 
    if (response.ok) {
      const data = await response.json();
      const folders = data.value.map((folder: any) => folder.Name);
      console.log(folders);
      return folders;
    } else {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error("Failed to fetch folders:", error);
    throw error;
  }
};