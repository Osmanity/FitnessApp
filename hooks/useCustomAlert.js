import { useState } from 'react';

export const useCustomAlert = () => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const showAlert = (title, message, buttons = [], type = 'default') => {
    const config = {
      title,
      message,
      buttons: buttons.length > 0 ? buttons : [{ text: 'OK', style: 'default', onPress: () => {} }],
      type
    };
    
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
    setAlertConfig({});
  };

  // Convenience methods for different alert types
  const showSuccess = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'success');
  };

  const showError = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'error');
  };

  const showWarning = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'warning');
  };

  const showInfo = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'info');
  };

  const showCelebration = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'celebration');
  };

  const showRest = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'rest');
  };

  const showWorkout = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'workout');
  };

  return {
    alertVisible,
    alertConfig,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCelebration,
    showRest,
    showWorkout,
  };
}; 