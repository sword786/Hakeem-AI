import React, { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

// Global references for audio playback
let alarmAudio: HTMLAudioElement | null = null;
let snoozeTimeoutId: any = null;

export const AlarmTester: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  useEffect(() => {
    let receivedListener: any;
    let actionListener: any;

    const setupAlarmEngine = async () => {
      try {
        // ✅ FIXED: Changed 'setActions' to 'registerActionTypes'
        await LocalNotifications.registerActionTypes({
          types: [
            {
              id: 'ALARM_ACTIONS',
              actions: [
                { id: 'stop', title: '🔴 Stop Alarm', foreground: true },
                { id: 'snooze', title: '⏰ Snooze (5 Mins)', foreground: true }
              ]
            }
          ]
        });

        // Listen for the alarm trigger arrival
        receivedListener = await LocalNotifications.addListener(
          'localNotificationReceived',
          () => {
            startRingingEngine();
          }
        );

        // Listen for user clicking 'Stop' or 'Snooze'
        actionListener = await LocalNotifications.addListener(
          'localNotificationActionPerformed',
          (action) => {
            if (action.actionId === 'stop') {
              stopRingingEngine();
              setStatusMessage('Alarm stopped manually.');
            } else if (action.actionId === 'snooze') {
              triggerSnoozeLogic();
            }
          }
        );
      } catch (error) {
        console.error("Error initializing alarm engine:", error);
      }
    };

    setupAlarmEngine();

    return () => {
      if (receivedListener) receivedListener.remove();
      if (actionListener) actionListener.remove();
    };
  }, []);

  const startRingingEngine = () => {
    if (!alarmAudio) {
      // High-pitched digital looping alarm audio file
      alarmAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/999/999-84.wav');
      alarmAudio.loop = true; 
    }
    alarmAudio.play().catch((err) => console.log("Audio play blocked until interaction: ", err));
    setStatusMessage('🚨 ALARM RINGING NOW! 🚨');
  };

  const stopRingingEngine = () => {
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
    }
    if (snoozeTimeoutId) {
      clearTimeout(snoozeTimeoutId);
    }
  };

  const triggerSnoozeLogic = () => {
    stopRingingEngine();
    setStatusMessage('Snoozed for 5 minutes...');
    
    const snoozeDelay = 5 * 60 * 1000; 
    snoozeTimeoutId = setTimeout(() => {
      scheduleAlarmInstance(new Date(Date.now()));
    }, snoozeDelay);
  };

  const scheduleAlarmInstance = async (targetTime: Date) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Hakeem AI Critical Alert",
            body: "Wake up! Time for your scheduled spiritual commitment.",
            id: 99,
            channelId: 'alarm-channel',
            actionTypeId: 'ALARM_ACTIONS', 
            schedule: { 
              at: targetTime,
              allowWhileIdle: true 
            }
          }
        ]
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleTestTrigger = async () => {
    setStatusMessage('Checking permissions...');
    const permissionContext = await LocalNotifications.requestPermissions();
    if (permissionContext.display !== 'granted') {
      setStatusMessage('Permission Denied.');
      return;
    }

    try { await LocalNotifications.deleteChannel({ id: 'alarm-channel' }); } catch (e) {}
    await LocalNotifications.createChannel({
      id: 'alarm-channel',
      name: 'Spiritual Alarms',
      importance: 5,
      sound: 'default',
      vibration: true,
      visibility: 1
    });

    const fireTime = new Date(Date.now() + 10000);
    await scheduleAlarmInstance(fireTime);
    setStatusMessage('Alarm set! Lock your screen now.');
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', border: '2px solid #ef4444', borderRadius: '12px', margin: '20px', backgroundColor: '#1e293b', color: '#fff' }}>
      <h3 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>⏰ Advanced Repeating Alarm</h3>
      <button 
        onClick={handleTestTrigger} 
        style={{ padding: '14px 28px', fontSize: '16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Set 10s Loop Alarm
      </button>
      
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={stopRingingEngine} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Force Stop</button>
      </div>

      <p style={{ marginTop: '12px', color: '#94a3b8', fontWeight: 'bold' }}>Status: {statusMessage}</p>
    </div>
  );
};
