import { getSP } from "../components/pnpSetup"
import { WebPartContext } from "@microsoft/sp-webpart-base";
 
export interface IItem {
  Id: number;
  FileLeafRef: string;
  Created: string;
  Author: {
  Title: string;
  };
  Dil: string;
}

 
export const getAllItemsFromLibrary = async (
  context: WebPartContext
): Promise<IItem[]> => {
  try {
    const sp = getSP(context);
    const items: IItem[] = await sp.web.lists
      .getByTitle("BAT")
      .items.select("Id", "FileLeafRef", "Created", "Author/Title", "Dil")
      .expand("Author")();
    return items;
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};