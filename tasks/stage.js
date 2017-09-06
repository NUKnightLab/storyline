const prompt = require('prompt'),
      simpleGit = require('simple-git'),
      fse = require('fs-extra'),
      path = require('path'),
      AdmZip = require('adm-zip'),
      writeBanner = require('write-banner'), // note needs override of 'add-banner' dependency to git repo version
      glob = require('glob');

const CDN_ROOT = '../cdn.knightlab.com', // maybe parameterize later
      PROJECT_NAME = 'storyline'; // can we read this from package.json?

function makeCDNPath(version) {
  return path.normalize(path.join(CDN_ROOT,'app/libs',PROJECT_NAME, version));
}

function stageToCDN(version, latest) {
  var banner_version = (version == 'dev') ? new Date().toISOString() : version;

  var to_banner = glob.sync('dist/**/*.+(js|css)');
  for (var i = 0; i < to_banner.length; i++) {
    writeBanner(to_banner[i], {
      banner: 'banner.tmpl',
      version: banner_version,
    })
  }

  if (fse.existsSync(CDN_ROOT)) {
    var dest = makeCDNPath(version);
    var zip = new AdmZip();
    zip.addLocalFolder('dist', PROJECT_NAME);
    zip.writeZip(path.join('dist', PROJECT_NAME+".zip"));
    fse.copySync('dist', dest, onErr);
    console.log('copied to ' + dest);

    if (latest) {
      var latest_dir = makeCDNPath('latest');
      fse.removeSync(latest_dir, onErr);
      fse.copySync(dest, latest_dir, onErr);
      console.log('copied version ' + version + ' to latest');
    }

  } else {
    console.error("CDN directory " + CDN_ROOT + "does not exist; nothing was copied")
  }
}

if (process.argv[2] == 'dev') {
    stageToCDN('dev')
} else {
  // if not 'dev' then ask for a new tag, update package.json, and tag the git repository
  simpleGit().tags(function(_,tagList) {
    if (tagList.latest) {
      console.log("The last tag used was " + tagList.latest);
    } else {
      console.log("No tagged versions yet.")
    }
    prompt.start();

    var properties = [
      {
        name: 'version',
        validator: /^\d+\.\d+\.\d+$/,
        message: "Enter the new version/tag",
        warning: "Tags must be three numbers separated by dots, and not have been used before.",
        conform: function(value) {
          return tagList && tagList.all && tagList.all.indexOf(value) == -1;
        }
      }
    ];

    prompt.get(properties, function (err, result) {
      if (err) { return onErr(err); }

      var package_json = require('./package.json');
      package_json.version = result.version;
      fse.writeJsonSync('./package.json', package_json);
      simpleGit.commit(`Update to ${result.version}`, ['package.json'])
               .addTag(result.version)
               .pushTags('origin', function() {
                 console.log('  Tagged with: ' + result.version);
                 var latest = ("latest" == process.argv[2]); // maybe later use a CLI arg parser
                 stageToCDN(result.version, latest);
               });
    })
  })
}

function onErr(err) {
  console.log(err);
  return 1;
}
