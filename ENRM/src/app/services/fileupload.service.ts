import { Injectable } from '@angular/core';

import { FileUploader } from 'ng2-file-upload';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';


import { appConfig } from '../app.config';

// const URL = '/api/';
const nermUrl = `${appConfig.apiUrl}/api/nerms/uploads`;

@Injectable()
export class FileUploadService {
    public uploader: FileUploader = new FileUploader({ url: nermUrl, });
    public hasBaseDropZoneOver: boolean = false;
    public hasAnotherDropZoneOver: boolean = false;

    constructor() {
    }

    public fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    public fileOverAnother(e: any): void {
        this.hasAnotherDropZoneOver = e;
    }
}