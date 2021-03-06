/*
 * Copyright 2019 Balena Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const m = require('mochainon');
const shelljs = require('shelljs');
const utils = require('../utils');
const TEST_DIRECTORY = utils.getTestTemporalPathFromFilename(__filename);
const presets = require('../../../lib/presets');

shelljs.rm('-rf', TEST_DIRECTORY);
shelljs.mkdir('-p', TEST_DIRECTORY);
shelljs.cd(TEST_DIRECTORY);

utils.createVersionistConfiguration(
	[
		"'use strict';",
		'module.exports = {',
		"  subjectParser: 'angular',",
		'  updateVersion: "update-version-file",',
		"  addEntryToChangelog: 'prepend',",
		'  template: [',
		"    '## {{version}}',",
		"    '',",
		"    '{{#each commits}}',",
		"    '{{#with footer}}',",
		"    '- {{capitalize Changelog-Entry}}',",
		"    '{{/with}}',",
		"    '{{/each}}'",
		"  ].join('\\n')",
		'};',
		'',
	].join('\n'),
);

shelljs.exec('git init');

utils.createCommit('feat: implement x', {
	'Changelog-Entry': 'Implement x',
	'Change-Type': 'patch',
});

utils.createCommit('fix: fix y', {
	'Changelog-Entry': 'Fix y',
	'Change-Type': 'patch',
});

utils.createCommit('fix: fix z', {
	'Changelog-Entry': 'Fix z',
	'Change-Type': 'minor',
});

utils.callVersionist();

m.chai
	.expect(shelljs.cat('CHANGELOG.md').stdout)
	.to.deep.equal(
		[
			`${presets.INITIAL_CHANGELOG}## 0.1.0`,
			'',
			'- Fix z',
			'- Fix y',
			'- Implement x',
			'',
		].join('\n'),
	);

m.chai.expect(shelljs.cat('VERSION').stdout).to.equal('0.1.0');
