const ESC = 0x1b;
const GS = 0x1d;

const COMMANDS = {
  INIT: [ESC, 0x40],
  ALIGN_LEFT: [ESC, 0x61, 0],
  ALIGN_CENTER: [ESC, 0x61, 1],
  ALIGN_RIGHT: [ESC, 0x61, 2],
  BOLD_ON: [ESC, 0x45, 1],
  BOLD_OFF: [ESC, 0x45, 0],
  DOUBLE_HEIGHT_WIDTH: [GS, 0x21, 0x11],
  NORMAL_SIZE: [GS, 0x21, 0x00],
  CUT: [GS, 0x56, 0x41, 0x00],
};

const PAD_LENGTH = 32;

export const formatLine = (left: string, right: string) => {
  const spaces = Math.max(1, PAD_LENGTH - left.length - right.length);
  return left + ' '.repeat(spaces) + right;
};

export const formatCenter = (text: string) => {
  if (text.length >= PAD_LENGTH) return text;
  const spaces = Math.floor((PAD_LENGTH - text.length) / 2);
  return ' '.repeat(spaces) + text;
};

export class EscPosPrinter {
  private device: any = null;
  private server: any = null;
  private characteristic: any = null;

  async connect() {
    try {
      if (!(navigator as any).bluetooth) {
        throw new Error('Web Bluetooth API is not supported in this browser. Please use Chrome/Edge on Desktop or Android.');
      }

      this.device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS Printer Service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Alternative POS Printer Service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Another common SPP/printer UUID
        ] 
      });

      this.server = await this.device.gatt.connect();
      
      const services = await this.server.getPrimaryServices();
      // Try to find a writable characteristic
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            this.characteristic = char;
            break;
          }
        }
        if (this.characteristic) break;
      }

      if (!this.characteristic) {
        throw new Error('Could not find a writable print characteristic on this device.');
      }

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  isConnected() {
    return this.device && this.device.gatt.connected && this.characteristic;
  }

  async print(textLines: string[], isKot = false) {
    if (!this.isConnected()) {
      throw new Error('Printer not connected. Please connect first.');
    }

    try {
      const encoder = new TextEncoder();
      let data: number[] = [];

      // Initialize
      data.push(...COMMANDS.INIT);

      // Header
      data.push(...COMMANDS.ALIGN_CENTER);
      data.push(...COMMANDS.DOUBLE_HEIGHT_WIDTH);
      data.push(...COMMANDS.BOLD_ON);
      
      if (isKot) {
        data.push(...Array.from(encoder.encode('KOT\n')));
      } else {
        data.push(...Array.from(encoder.encode('CAFE CONNECT\n')));
      }
      
      data.push(...COMMANDS.NORMAL_SIZE);
      data.push(...COMMANDS.BOLD_OFF);
      data.push(...Array.from(encoder.encode('\n')));

      data.push(...COMMANDS.ALIGN_LEFT);
      
      for (const line of textLines) {
        // Send a bold command manually if a line starts with a marker, just as a trick if we wanted to
        data.push(...Array.from(encoder.encode(line + '\n')));
      }

      data.push(...Array.from(encoder.encode('\n\n\n')));
      data.push(...COMMANDS.CUT);

      // Write in chunks of 512 bytes (common limit for BLE)
      const buffer = new Uint8Array(data);
      const chunkSize = 512;
      for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        // Small delay to prevent buffer overflow in cheap printers
        await new Promise(r => setTimeout(r, 50)); 
      }
      
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }
  
  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.characteristic = null;
    this.server = null;
    this.device = null;
  }
}

export const bluetoothPrinter = new EscPosPrinter();
