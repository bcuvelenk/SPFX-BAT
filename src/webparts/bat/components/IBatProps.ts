import { SPHttpClient } from '@microsoft/sp-http';
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBatProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  folders: Array<{
    Name: string;
    ServerRelativeUrl: string;
  }>;
  siteUrl: string; // siteUrl özelliği eklendi
  spHttpClient: SPHttpClient; // SPHttpClient özelliği eklendi
  context: WebPartContext;
}
