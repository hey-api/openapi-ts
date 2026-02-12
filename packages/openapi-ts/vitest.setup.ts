import 'zone.js'; // Angular needs zones

import { fileURLToPath } from 'node:url';

import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { beforeAll } from 'vitest';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

beforeAll(() => {
  process.chdir(fileURLToPath(new URL('.', import.meta.url)));
});
