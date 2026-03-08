const DEFAULT_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

type MessageHandler = (message: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = '';
  private token: string = '';
  private reconnectDelay = DEFAULT_RECONNECT_DELAY;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers: MessageHandler[] = [];
  private notificationHandlers: MessageHandler[] = [];
  private shouldReconnect = false;

  connect(token: string) {
    this.token = token;
    const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080')
      .replace(/^http/, 'ws');
    this.url = `${baseUrl}/ws/messages?token=${token}`;
    this.shouldReconnect = true;
    this.doConnect();
  }

  private doConnect() {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectDelay = DEFAULT_RECONNECT_DELAY;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          this.notificationHandlers.forEach((h) => h(data));
        } else {
          this.messageHandlers.forEach((h) => h(data));
        }
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.doConnect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, MAX_RECONNECT_DELAY);
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onNotification(handler: MessageHandler) {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
    };
  }
}

export const wsService = new WebSocketService();
