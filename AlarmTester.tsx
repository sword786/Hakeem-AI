import React, { useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

export const AlarmTester: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  const scheduleTestAlarm = async () => {
    try {
      setStatusMessage('Checking permissions...');
      
      const permissionContext = await LocalNotifications.requestPermissions();
      if (permissionContext.display !== 'granted') {
        setStatusMessage('Permission Denied by user.');
        return;
      }

      // 1. Delete old channel if it exists (clears Android's cached silent rule)
      try {
        await LocalNotifications.deleteChannel({ id: 'alarm-channel' });
      } catch (e) {
        // Channel didn't exist yet, safe to ignore
      }

      // 2. Re-create Channel with explicit native sound routing
      await LocalNotifications.createChannel({
        id: 'alarm-channel',
        name: 'Spiritual Reminders',
        description: 'Critical context alerts for Hakeem AI',
        importance: 5,       // Max Priority
        sound: 'default',    // ◄ FORCES native audio link at registration
        vibration: true,
        visibility: 1
      });

      const executionTime = new Date(Date.now() + 10000); 
      setStatusMessage('Scheduling alarm...');
      
      // 3. Register the alert with strict execution rules
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Hakeem AI Guidance",
            body: "Time for your scheduled spiritual reflection.",
            id: 786,
            channelId: 'alarm-channel',
            sound: 'default', // ◄ Demands audio file execution
            schedule: { 
              at: executionTime,
              allowWhileIdle: true 
            },
            extra: {
              forceShow: true
            }
          }
        ]
      });

      setStatusMessage('Success! Lock your screen now. Alarm sounds in 10s.');
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
