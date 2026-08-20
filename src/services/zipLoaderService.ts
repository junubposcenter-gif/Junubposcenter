import React from "react";

export interface DetectedZipApp {
  id: string;
  name: string;
  path: string;
  isExtracted: boolean;
  type: "folder" | "zip";
  status: "mounted" | "detected" | "ready";
}

export class ZipLoaderService {
  private static instance: ZipLoaderService;
  private detectedApps: DetectedZipApp[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.scanZipDirectory();
  }

  public static getInstance(): ZipLoaderService {
    if (!ZipLoaderService.instance) {
      ZipLoaderService.instance = new ZipLoaderService();
    }
    return ZipLoaderService.instance;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public async scanZipDirectory(): Promise<DetectedZipApp[]> {
    try {
      const res = await fetch("/api/zip_files");
      if (res.ok) {
        const data = await res.json();
        if (data.apps && Array.isArray(data.apps)) {
          this.detectedApps = data.apps.map((app: any) => ({
            ...app,
            status: "mounted"
          }));
          this.notify();
          return this.detectedApps;
        }
      }
    } catch (err) {
      console.warn("ZipLoaderService: Defaulting to fallback zip directory scan:", err);
    }

    // Default fallback scan if endpoint unready
    this.detectedApps = [
      {
        id: "jubaprint",
        name: "JubaPrint Manager",
        path: "zip_files/jubaprint_extracted",
        isExtracted: true,
        type: "folder",
        status: "mounted"
      }
    ];
    this.notify();
    return this.detectedApps;
  }

  public getDetectedApps(): DetectedZipApp[] {
    return this.detectedApps;
  }

  public isAppDetected(productId: string): boolean {
    if (!productId) return false;
    const cleanId = productId.toLowerCase();
    return this.detectedApps.some(
      (app) => app.id === cleanId || cleanId.includes(app.id) || app.id.includes(cleanId)
    );
  }
}

export const zipLoaderService = ZipLoaderService.getInstance();
