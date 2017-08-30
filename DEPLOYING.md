To deploy a build of the library:

For library builds:

|   Command   | Description |
| ----------- | ----------- |   
| `npm run stage` | Run dist, and copy it to local CDN repository using a specified version number |
| `npm run stage_latest` | Same as above, but also copies the same build to the `latest` directory in the CDN.
| `npm run stage_dev` | Similar to above, but copies the code to the `dev` directory in the CDN for deployment with a staging site.

**Note:** none of these actually copy the library to the public `cdn.knightlab.com` - that's a separate step independent of any library.

For website builds. Execute these from the `website` directory (that is, `cd website` first)

|   Command   | Description |
| ----------- | ----------- |   
| `./deploy.sh stg` | Build the website and copy it to the staging S3 bucket.
| `./deploy.sh prd` | Build the website and copy it to the production S3 bucket.

These commands will only work if you have the AWS command line libraries installed.
