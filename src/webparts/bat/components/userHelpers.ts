export const getCurrentUser = async (siteUrl: string): Promise<string> => {
    try {
      const response = await fetch(
        `${siteUrl}/_api/web/currentUser`,
        {
          method: "GET",
          headers: {
            Accept: "application/json;odata=nometadata",
          },
        }
      );
  
      const data = await response.json();
      return data.Title; // Kullanıcının adı ve soyadı
    } catch (error) {
      console.error("Hata: Kullanıcı bilgisi alınamadı", error);
      throw error;
    }
  };
  
  export const getUserRole = async (siteUrl: string, userEmail: string): Promise<string | null> => {
    try {
      const encodedUserEmail = encodeURIComponent(userEmail); // E-posta adresini URL'ye uygun hale getirin
      const response = await fetch(
        `${siteUrl}/_api/web/lists/getbytitle('Yetki Listesi')/items?$filter=Personel/EMail eq '${encodedUserEmail}'&$select=Yetki,Personel/EMail&$expand=Personel`,
        {
          method: "GET",
          headers: {
            Accept: "application/json;odata=verbose",
          },
        }
      );
      const data = await response.json();
      if (data.d.results.length > 0) {
        return data.d.results[0].Yetki; // Kullanıcının rolünü döndür
      }
      return null; // Kullanıcı rolü bulunamadı
    } catch (error) {
      console.error("Hata: Kullanıcı rolü alınamadı", error);
      throw error;
    }
  };
  
  
  