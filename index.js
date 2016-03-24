var glob = require('glob'),
		_ = require('lodash'),
		fs = require('fs'),
		async = require('async');

var program = require('commander');

var config = require('./config');
var filePath = config.json_file_path ||'test/*.json';

console.log('Reading path... ' + filePath);
function init(commandName){
		
	glob(filePath, null, function(er, files) {
		var bufferedTranslations = [];
		console.log('Found ' + files.length + ' files');
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


			var findConflicts = function() {
				var translations = _.cloneDeep(bufferedTranslations);
				var result = _.filter(translations, function(translation) {
					var conflicts =  _.some(bufferedTranslations, function(item){
						return item.file !== translation.file && translation.chiaveUi === item.chiaveUi && translation.chiave === item.chiave;
					});

					return conflicts;
				});

				result = _.sortBy(result, 'chiave');

				return _.groupBy(result, 'chiaveUi');
			};

			var uiConflicts = function() {
				var translations = _.cloneDeep(bufferedTranslations);
				var result = _.filter(translations, function(translation) {
					var conflicts =  _.some(bufferedTranslations, function(item){
						return item.file !== translation.file && translation.chiaveUi === item.chiaveUi && translation.chiave !== item.chiave;
					});

					return conflicts;
				});

				return _.groupBy(result, 'chiaveUi');
			};

			var keyConflicts = function() {
				var translations = _.cloneDeep(bufferedTranslations);
				var result = _.filter(translations, function(translation) {
					var conflicts =  _.some(bufferedTranslations, function(item){
						return item.file !== translation.file && translation.chiaveUi !== item.chiaveUi && translation.chiave === item.chiave;
					});

					return conflicts;
				});

				return _.groupBy(result, 'chiave');
			};

			if(commandName === 'same'){
				var result = findConflicts();
				console.log('Conflicts', result );	
			}else if(commandName === 'ui'){
				var result = uiConflicts();
				console.log('Same UI key', result);
			}else if(commandName === 'key'){
				var result = keyConflicts();
				console.log('Same key', result);
			}else{
				console.log('Command not found');
			}
			
		});

	});		
};


program
  .version('0.0.1')
  .option('-s, --same', 'Same keys', function(){init('same');})
  .option('-u, --ui', 'Same chiaveUi, different chiave', function(){init('ui');})
  .option('-k, --key', 'Same chiave, different chiaveUi', function(){init('key');})
  .parse(process.argv);