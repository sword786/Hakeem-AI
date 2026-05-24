import React, { useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

export const AlarmTester: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  const scheduleTestAlarm = async () => {
    try {
      setStatusMessage('Checking permissions...');
      
      // 1. Request permissions from the phone's OS layer
      const permissionContext = await LocalNotifications.requestPermissions();
      if (permissionContext.display !== 'granted') {
        setStatusMessage('Permission Denied by user.');
        return;
      }

      // 2. Set up a notification channel required by modern Android devices
      await LocalNotifications.createChannel({
        id: 'alarm-channel',
        name: 'Spiritual Reminders',
        description: 'Critical context notifications for Hakeem AI',
        importance: 5, // 5 = High importance (pops up on screen + plays sound)
        vibration: true,
        visibility: 1
      });

      // 3. Set the target time exactly 10 seconds into the future
      const executionTime = new Date(Date.now() + 10000); 

      setStatusMessage('Scheduling alarm...');
      
      // 4. Register the alert with the operating system
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Hakeem AI Guidance",
            body: "Time for your scheduled spiritual reflection.",
            id: 786,
            channelId: 'alarm-channel',
            schedule: { 
              at: executionTime,
              allowWhileIdle: true // Forces Android to fire even if phone is sleeping
            }
          }
        ]
      });

      setStatusMessage('Success! Lock your screen now. Alarm triggers in 10s.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Alarm failed to schedule.');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', margin: '20px' }}>
      <h3>Alarm Rig Test</h3>
      <button 
        onClick={scheduleTestAlarm} 
        style={{ padding: '12px 24px', fontSize: '16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        Trigger 10s Test Alarm
      </button>
      <p style={{ marginTop: '10px', color: '#666' }}>Status: {statusMessage}</p>
    </div>
  );
};
