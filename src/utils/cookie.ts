/**
 * Cek apakah cookie dengan nama tertentu ada
 * @param name Nama cookie yang dicari
 * @returns boolean true jika cookie ada, false jika tidak
 */
export const hasCookie = (name: string): boolean => {
  if (typeof document === 'undefined') {
    return false; // Jika berjalan di server, tidak ada cookie
  }
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return true;
    }
  }
  return false;
};

/**
 * Cek apakah user memiliki cookie autentikasi
 * @returns boolean true jika ada cookie auth, false jika tidak
 */
export const hasAuthCookie = (): boolean => {
  // Gunakan cookie penanda is_logged_in yang bisa diakses JavaScript
  return hasCookie('is_logged_in');
};

const cookieUtils = {
  hasCookie,
  hasAuthCookie
};

export default cookieUtils; 