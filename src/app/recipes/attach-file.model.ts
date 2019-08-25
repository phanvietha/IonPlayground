import { Capacitor } from '@capacitor/core';

export class AttachFile {
  name: string;
  type: string;
  size: number;
  path: string;
  file;

  constructor(file) {
    this.name = file.name;
    this.type = file.type;
    this.size = file.size;
    // Convert from file protocol to localhose protocol
    this.path = file.fullPath ? Capacitor.convertFileSrc(file.fullPath) : file.path;
    this.file = file;
  }
}
