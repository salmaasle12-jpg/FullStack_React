/**
 * Notify service for user alerts
 */
class NotifyService {
  // Show success message
  success(txt) {
    alert(`Success: ${txt}`);
  }

  // Show error message
  error(txt) {
    alert(`Error: ${txt}`);
  }

  // Show info message
  info(txt) {
    alert(`Info: ${txt}`);
  }
}

export const notifyService = new NotifyService();
