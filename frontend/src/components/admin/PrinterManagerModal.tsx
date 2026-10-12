import React, { useState } from 'react';
import { 
  Bluetooth, 
  Printer, 
  X, 
  RefreshCw, 
  HelpCircle, 
  Info, 
  Zap, 
  Check, 
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { bluetoothPrinter } from '../../utils/printer';

interface PrinterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPrinterConnected: boolean;
  connectedDeviceName: string | null;
  onConnectionChange: (connected: boolean, deviceName: string | null) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const PrinterManagerModal: React.FC<PrinterManagerModalProps> = ({
  isOpen,
  onClose,
  isPrinterConnected,
  connectedDeviceName,
  onConnectionChange,
  onShowToast,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrintingTest, setIsPrintingTest] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const devName = await bluetoothPrinter.connect();
      onConnectionChange(true, devName);
      onShowToast(`Connected to ${devName}!`, 'success');
    } catch (err: any) {
      if (err.name === 'NotFoundError' || err.message?.includes('User cancelled')) {
        onShowToast('Pairing cancelled by user.', 'info');
      } else {
        onShowToast(err.message || 'Failed to connect printer.', 'error');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    bluetoothPrinter.disconnect();
    onConnectionChange(false, null);
    onShowToast('Printer disconnected.', 'info');
  };

  const handleTestPrint = async () => {
    setIsPrintingTest(true);
    try {
      await bluetoothPrinter.printTest();
      onShowToast('Test receipt sent to printer!', 'success');
    } catch (err: any) {
      onShowToast('Test print failed: ' + err.message, 'error');
    } finally {
      setIsPrintingTest(false);
    }
  };

  const handleBrowserTestPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Thermal Printer Manager</h3>
              <p className="text-xs text-gray-500">ESC/POS Bluetooth & System Print Control</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200/70 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Connection Status Card */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isPrinterConnected 
              ? 'bg-emerald-50/70 border-emerald-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3.5 h-3.5 rounded-full ${
                  isPrinterConnected 
                    ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-200' 
                    : 'bg-gray-400'
                }`} />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</span>
                  <h4 className="text-base font-bold text-gray-800">
                    {isPrinterConnected ? 'Printer Online & Ready' : 'No Bluetooth Printer Connected'}
                  </h4>
                </div>
              </div>

              {isPrinterConnected && (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Paired
                </span>
              )}
            </div>

            {isPrinterConnected ? (
              <div className="mt-4 pt-4 border-t border-emerald-200/70 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Device Name:</span>
                  <span className="font-semibold text-gray-900">{connectedDeviceName || 'Thermal POS Printer'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Protocol:</span>
                  <span className="font-mono text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">ESC/POS (BLE)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleTestPrint}
                    disabled={isPrintingTest}
                    className="flex items-center justify-center space-x-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    {isPrintingTest ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>{isPrintingTest ? 'Printing...' : 'Print Test Slip'}</span>
                  </button>

                  <button
                    onClick={handleDisconnect}
                    className="flex items-center justify-center space-x-2 px-3 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold transition"
                  >
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Connect your 58mm / 80mm Bluetooth thermal printer to print order receipts & KOT tickets directly from the browser.
                </p>

                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bluetooth className="w-4 h-4" />
                  )}
                  <span>{isConnecting ? 'Searching for Devices...' : 'Search & Connect Bluetooth Printer'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Browser Pairing Helper Card */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>How Chrome Bluetooth Pairing Works</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              When you click <strong>Connect</strong>, your browser opens its native <em>&quot;wants to pair&quot;</em> device selector:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-amber-800/90">
              <li>Look for your printer&apos;s name (e.g. <strong>POS-58</strong>, <strong>MPT-II</strong>, <strong>RPP02N</strong>, <strong>XP-58</strong>).</li>
              <li>Avoid selecting laptops or phones (like <em>DP-LAP</em> or personal names).</li>
              <li>Items showing as <em>&quot;Unknown or Unsupported Device&quot;</em> are nearby Bluetooth signals that haven&apos;t shared their name yet.</li>
            </ul>
          </div>

          {/* Alternative: USB / System Print */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-sm text-gray-800">Using USB or Windows-Paired Printer?</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md">No BLE Needed</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              If your thermal printer is connected with a USB cable or already paired in Windows Settings, you can use standard <strong>Browser Print</strong> without Web Bluetooth!
            </p>
            <button
              onClick={handleBrowserTestPrint}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Test System Print Preview</span>
              <span>&rarr;</span>
            </button>
          </div>

          {/* Troubleshooting Accordion */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-xs text-gray-700">Troubleshooting & Tips</span>
              </div>
              {showTroubleshooting ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showTroubleshooting && (
              <div className="p-4 bg-gray-50/70 border-t border-gray-200 text-xs text-gray-600 space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span><strong>Turn on Bluetooth:</strong> Ensure Bluetooth is enabled on your Windows/Android computer.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span><strong>Power cycle printer:</strong> Turn off your thermal printer, wait 5 seconds, and turn it back on so it starts advertising.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span><strong>Browser Support:</strong> Web Bluetooth requires Google Chrome, Microsoft Edge, or Opera. Firefox and Safari do not support it.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <span><strong>Bluetooth Classic vs BLE:</strong> Older Bluetooth 2.0 thermal printers use SPP (Serial Port). If your printer does not appear in Chrome, pair it in Windows Settings and use the <em>Browser Print</em> option instead.</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl text-sm transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
