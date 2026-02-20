import { EvalReport, AuditEntry } from '../types';

export class AuditService {
  private static STORAGE_KEY = 'eai_audit_logs';

  static async signReport(report: EvalReport): Promise<string> {
    const { signature, ...dataToSign } = report;
    const jsonString = JSON.stringify(dataToSign);
    
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  static async createEntry(report: EvalReport): Promise<AuditEntry> {
    const signature = await this.signReport(report);
    
    const entry: AuditEntry = {
      ...report,
      signature,
      rubric_version: "15.9", 
      mode: "nl_off"
    };

    const logs = this.getLogs();
    logs.unshift(entry); 
    
    if (logs.length > 50) logs.pop();
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    return entry;
  }

  static getLogs(): AuditEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  static downloadLog(entry: AuditEntry) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entry, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${entry.id}_audit.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}