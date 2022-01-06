import {
    copyFile as __copyFile,
    exists as __exists,
    mkdir as __mkdir,
    readFile as __readFile,
    rm as __rm,
    writeFile as __writeFile,
} from 'fs';
import { promisify } from 'util';

// Wrapped file system calls
export const readFile = promisify(__readFile);
export const writeFile = promisify(__writeFile);
export const copyFile = promisify(__copyFile);
export const exists = promisify(__exists);

export const mkdir = (path: string): Promise<void> =>
    new Promise((resolve, reject) => {
        __mkdir(
            path,
            {
                recursive: true,
            },
            error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });

export const rmdir = (path: string): Promise<void> =>
    new Promise((resolve, reject) => {
        __rm(
            path,
            {
                recursive: true,
                force: true,
            },
            error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });
