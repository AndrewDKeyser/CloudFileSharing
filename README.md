# CloudFileSharing
Web app for uploading files to a Google Cloud Storage bucket and generating shareable download links. Built with Node.js, Express, and the Google Cloud Storage SDK.

## What It Does
 
- Upload files from the browser directly to a GCS bucket
- Browse all uploaded files in a dropdown
- Generate a time-limited signed URL (1 hour) that anyone can use to download a file, no Google account required

## Environment Variables
 
Create a `.env` file in the project root with the following:
 
```
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```
 
- `GCS_BUCKET_NAME` — the name of your GCS bucket (e.g. `my-app-uploads`)
- `GOOGLE_APPLICATION_CREDENTIALS` — the path to your service account key file downloaded from Google Cloud

## Google Cloud Bucket Setup
 
1. Go to the Google Cloud Console and create or select a project
2. Navigate to Cloud Storage and create a bucket with a globally unique name
3. Leave public access prevention enabled: files are shared via signed URLs, not public links
4. Go to IAM and Admin, then Service Accounts, and create a new service account
5. Grant the service account the following roles on the project:
   - Storage Object Creator (allows uploading files)
   - Storage Object Viewer (allows listing files and generating signed URLs)
6. Under the service account, go to the Keys tab, click Add Key, and download a JSON key file
7. Set the path to that JSON file as GOOGLE_APPLICATION_CREDENTIALS in your .env file

## Running the App
 
```
npm install
npm start
```
 
Then open http://localhost:3000 in your browser.
