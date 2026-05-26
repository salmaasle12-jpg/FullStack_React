/**
 * שירות להצגת התראות למשתמש
 * Notify service for user alerts
 */
class NotifyService {
  // הצגת הודעת הצלחה
  success(txt) {
    alert(`Success: ${txt}`);
  }

  // הצגת הודעת שגיאה
  error(txt) {
    alert(`Error: ${txt}`);
  }

  // הצגת הודעת מידע
  info(txt) {
    alert(`Info: ${txt}`);
  }
}

export const notifyService = new NotifyService();
