var glob = require('glob'),
		_ = require('lodash'),
		fs = require('fs'),
		async = require('async');

var config = require('./config');
var filePath = config.json_file_path ||'test/*.json'
glob(filePath, null, function(er, files) {
	var bufferedTranslations = [];

	console.log('Found ' + files.length + '  files');
	async.eachSeries(files, function(file, callback) {

		fs.readFile(file, 'utf8', function(err, data) {
			if (err) {
				throw err;
			}
			try {

				var items = JSON.parse(data.toString().trim());
				console.log('Items in file ' + file  + ': ' + items.length);
				// async.eachSeries(items, function(item) {
				_.forEach(items, function(item) {
					item.file = file;
					bufferedTranslations.push(item);
				});
				  callback(null, !err);

			}catch (err) {
				console.log('File ' + file);
			}

		});
	}, function(err) {
		 if (err) {
			console.log('err', err);
			throw err;
		 }
		console.log('Total Nr. of items: ',bufferedTranslations.length);

		// var findBySameProperty = function(property) {

		// 	var result = _.map(bufferedTranslations, function(bufferedTranslation) {
		// 		var predicate = {};
		// 		predicate[property] = bufferedTranslation[property];
		// 		var result =  _.filter(bufferedTranslations, predicate).length;
		// 		return {bufferedTranslation: bufferedTranslation, count: result};
		// 	});
		// 	return result;
		// };

		// console.log('Same chiaveUi', findBySameProperty('chiaveUi'));
		// console.log('Same chiave', findBySameProperty('chiave'));

		// var findConflicts = function() {
		// 	var result = _.map(bufferedTranslations, function(bufferedTranslation) {
		// 		var conflicts =  _.filter(bufferedTranslations, function(item) {
		// 			return (item['chiave'] === bufferedTranslation['chiave'] && item['chiaveUi'] !== bufferedTranslation['chiaveUi']) ||
		// 			(item['chiaveUi'] === bufferedTranslation['chiaveUi'] && item['chiave'] !== bufferedTranslation['chiave']);
		// 		});
		// 		return conflicts;
		// 	});
		// 	return result;
		// };

		// console.log('Conflicts', findConflicts());

		var findConflicts = function() {
			var result = _.map(bufferedTranslations, function(bufferedTranslation) {
				var conflicts =  _.filter(bufferedTranslations, function(item) {
					return item['chiaveUi'] === bufferedTranslation['chiaveUi'] && item['chiave'] !== bufferedTranslation['chiave'];
				});
				return conflicts;
			});
			return _.groupBy(_.flatten(_.filter(result, function(item) {
				return item.length !== 0;
			})), 'chiaveUi');
		};

		console.log('Conflicts', findConflicts());
	});

});
