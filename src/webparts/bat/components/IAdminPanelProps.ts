import { SPHttpClient } from "@microsoft/sp-http";

export interface IAdminPanelProps {
  /**
   * SPHttpClient nesnesi, SharePoint ile API üzerinden iletişim kurmak için kullanılır.
   */
  spHttpClient: SPHttpClient;

  /**
   * SharePoint site URL'si.
   */
  siteUrl: string;

  /**
   * Paneli kapatma işlemini gerçekleştiren fonksiyon.
   */
  onClose: () => void;
}
