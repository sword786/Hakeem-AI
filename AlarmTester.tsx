import React, { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

export const AlarmTester: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  useEffect(() => {
    let receivedListener: any;

    const setupAutomaticSpeechListener = async () => {
      // 💥 TRIGGER IMMEDIATELY ON ARRIVAL (No clicking required!)
      receivedListener = await LocalNotifications.addListener(
        'localNotificationReceived',
        (notification) => {
          const textToSpeak = notification.body;
          
          if (textToSpeak) {
            // Wake up the phone's native speech synthesizer engine
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;  // Slightly slower for crisp clear delivery
            utterance.pitch = 1.0; 

            // Stop any previous speech sounds and read out loud instantly
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
          }
        }
      );
    };

    setupAutomaticSpeechListener();

    // Clean up our internal engine hooks when closing
    return () => {
      if (receivedListener) {
        receivedListener.remove();
      }
    };
  }, []);

  const scheduleTestAlarm = async () => {
    try {
      setStatusMessage('Checking permissions...');
      
      const permissionContext = await LocalNotifications.requestPermissions();
      if (permissionContext.display !== 'granted') {
        setStatusMessage('Permission Denied by user.');
        return;
      }

      try {
        await LocalNotifications.deleteChannel({ id: 'alarm-channel' });
      } catch (e) {}

      await LocalNotifications.createChannel({
        id: 'alarm-channel',
        name: 'Spiritual Reminders',
        description: 'Critical context alerts for Hakeem AI',
        importance: 5, // Maximum priority to cut through OS background blocks
        sound: 'default',
        vibration: true,
        visibility: 1
      });

      const executionTime = new Date(Date.now() + 10000); 
      setStatusMessage('Scheduling alarm...');
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Hakeem AI Guidance",
            body: "Attention. Time for your scheduled spiritual reflection.", // ◄ The app reads this out loud automatically
            id: 786,
            channelId: 'alarm-channel',
            sound: 'default',
            schedule: { 
              at: executionTime,
              allowWhileIdle: true // Tells Android not to freeze this task during sleep
            },
            extra: {
              forceShow: true
            }
          }
        ]
      });

      setStatusMessage('Success! Lock your screen now. Phone will speak in 10s.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Alarm failed to schedule.');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', margin: '20px', backgroundColor: '#1e293b', color: '#fff' }}>
      <h3>Hands-Free Alarm Test</h3>
      <button 
        onClick={scheduleTestAlarm} 
        style={{ padding: '12px 24px', fontSize: '16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Trigger 10s Auto-Speak Alarm
      </button>
      <p style={{ marginTop: '10px', color: '#94a3b8' }}>Status: {statusMessage}</p>
    </div>
  );
};
