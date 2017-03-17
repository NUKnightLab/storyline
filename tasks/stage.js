const prompt = require('prompt'),
      simpleGit = require('simple-git'),
      fse = require('fs-extra'),
      path = require('path');

const CDN_ROOT = '../cdn.knightlab.com', // maybe parameterize later
      PROJECT_NAME = 'storyline'; // can we read this from package.json?

function stageToCDN(version) {
  var dest = path.join(CDN_ROOT,'app/libs',PROJECT_NAME, version);
  fse.copy('dist', dest);
  console.log('copied to ' + dest);
}

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
    simpleGit().addTag(result.version, function() {
      simpleGit().pushTags('origin', function() {
        console.log('  Tagged with: ' + result.version);
        stageToCDN(result.version);
      })
    });
  });

})

function onErr(err) {
  console.log(err);
  return 1;
}
