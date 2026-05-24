import React, { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

// We use the browser's global Audio context to handle continuous looping playback
let alarmAudio: HTMLAudioElement | null = null;
let snoozeTimeoutId: any = null;

export const AlarmTester: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  useEffect(() => {
    let receivedListener: any;
    let actionListener: any;

    const setupAlarmEngine = async () => {
      // 1. Define custom action buttons that appear directly on your Android lockscreen banner
      await LocalNotifications.setActions({
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

      // 2. LISTEN FOR THE ALARM TRIGGER: Start looping sound immediately when received
      receivedListener = await LocalNotifications.addListener(
        'localNotificationReceived',
        () => {
          startRingingEngine();
        }
      );

      // 3. LISTEN FOR BUTTON CLICKS: Handle what happens when you press Stop or Snooze
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
    };

    setupAlarmEngine();

    return () => {
      if (receivedListener) receivedListener.remove();
      if (actionListener) actionListener.remove();
    };
  }, []);

  // Starts infinite loop audio playback
  const startRingingEngine = () => {
    if (!alarmAudio) {
      // Uses a standard high-pitched digital alarm sound URL
      alarmAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/999/999-84.wav');
      alarmAudio.loop = true; // ◄ CRITICAL: Tells the hardware to loop forever
    }
    alarmAudio.play().catch((err) => console.log("Audio playback waiting for interaction: ", err));
    setStatusMessage('🚨 ALARM RINGING NOW! 🚨');
  };

  // Stops audio playback completely
  const stopRingingEngine = () => {
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
    }
    if (snoozeTimeoutId) {
      clearTimeout(snoozeTimeoutId);
    }
  };

  // Shuts off the sound right now, but schedules a brand new execution loop 5 minutes later
  const triggerSnoozeLogic = () => {
    stopRingingEngine();
    setStatusMessage('Snoozed for 5 minutes...');
    
    // 5 Minutes = 5 * 60 * 1000 milliseconds
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
            actionTypeId: 'ALARM_ACTIONS', // Links our custom Stop/Snooze buttons
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

    // Prepare fresh channel parameters
    try { await LocalNotifications.deleteChannel({ id: 'alarm-channel' }); } catch (e) {}
    await LocalNotifications.createChannel({
      id: 'alarm-channel',
      name: 'Spiritual Alarms',
      importance: 5,
      sound: 'default',
      vibration: true,
      visibility: 1
    });

    // Schedule test execution for 10 seconds from now
    const fireTime = new Date(Date.now() + 10000);
    await scheduleAlarmInstance(fireTime);
    setStatusMessage('Alarm set! Lock your screen now.');
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', border: '2px solid #ef4444', borderRadius: '12px', margin: '20px', backgroundColor: '#1e293b' }}>
      <h3 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>⏰ Advanced Repeating Alarm</h3>
      <button 
        onClick={handleTestTrigger} 
        style={{ padding: '14px 28px', fontSize: '16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Set 10s Loop Alarm
      </button>
      
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={stopRingingEngine} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px' }}>Force Stop</button>
      </div>

      <p style={{ marginTop: '12px', color: '#94a3b8', fontWeight: 'bold' }}>Status: {statusMessage}</p>
    </div>
  );
};
