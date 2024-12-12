import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
 
import * as strings from "BatWebPartStrings";
import Bat from "./components/Bat";
import { IBatProps } from "./components/IBatProps";

 
// PnPjs modüllerini içe aktarıyoruz
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/folders";


 
export interface IBatWebPartProps {
  description: string;
}

 
export default class BatWebPart extends BaseClientSideWebPart<IBatWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";
  private _sp: ReturnType<typeof spfi>;
 
  protected onInit(): Promise<void> {
    this._sp = spfi().using(SPFx(this.context)); // SPFx bağlamını kullan
    return this._getEnvironmentMessage().then((message) => {
      this._environmentMessage = message;
    });
  }

  public render(): void {
    const fetchFolders = async (): Promise<
      Array<{ Name: string; ServerRelativeUrl: string }>
    > => {
      try {
        const folderData = await this._sp.web
          .getFolderByServerRelativePath("/sites/GorevYonetimi/BAT") // BAT kitaplığınızın yolunu belirtin
          .folders();
 
        return folderData.map((folder) => ({
          Name: folder.Name,
          ServerRelativeUrl: folder.ServerRelativeUrl,
        }));
      } catch (error) {
        console.error("Klasörler alınamadı:", error);
        return [];
      }
    };
 
    fetchFolders().then((folders) => {
      const element: React.ReactElement<IBatProps> = React.createElement(
        Bat,
        {
          description: this.properties.description,
          isDarkTheme: this._isDarkTheme,
          environmentMessage: this._environmentMessage,
          hasTeamsContext: !!this.context.sdks.microsoftTeams,
          userDisplayName: this.context.pageContext.user.displayName,
          folders: folders, // Klasör listesi
          siteUrl: this.context.pageContext.web.absoluteUrl, // siteUrl özelliği
          spHttpClient: this.context.spHttpClient, // spHttpClient özelliği
          context: this.context
        }
      );
 
      ReactDom.render(element, this.domElement);
    });
  }
 
  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }
 
    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;
 
    if (semanticColors) {
      this.domElement.style.setProperty(
        "--bodyText",
        semanticColors.bodyText || null
      );
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty(
        "--linkHovered",
        semanticColors.linkHovered || null
      );
    }
  }
 
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
 
  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
 
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
 
  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app
        .getContext()
        .then((context) => {
          let environmentMessage: string = "";
          switch (context.app.host.name) {
            case "Office":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOffice
                : strings.AppOfficeEnvironment;
              break;
            case "Outlook":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOutlook
                : strings.AppOutlookEnvironment;
              break;
            case "Teams":
            case "TeamsModern":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentTeams
                : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }
 
          return environmentMessage;
        });
    }
 
    return Promise.resolve(
      this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment
    );
  }
}