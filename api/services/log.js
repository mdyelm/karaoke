var fs = require('fs');
var path = require('path');
module.exports.save = function (options, data_err, cb) {
    // Add timestamp
    options.createdAt = new Date();
    // First check the assets directory exists
    fs.exists(path.join(sails.config.appPath, 'assets'), function (status) {
        if (!status) {
            fs.mkdir(path.join(sails.config.appPath, 'assets'), function (err) {
                if (err)
                    return cb(err);
                fs.appendFile(path.join(sails.config.appPath, 'assets/log.txt'), 'msg:' + data_err.error + ' ' + JSON.stringify(options) + "\n\n", cb);
            });
            return;
        }

        // Otherwise just write to the assets/log.txt file
        fs.appendFile(path.join(sails.config.appPath, 'assets/log.txt'), 'msg:' + data_err.error + ' ' + JSON.stringify(options) + "\n\n", cb);
    });
};
