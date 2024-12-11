const { buildGraph } = require('../graphBuilder');
const assert = require('assert');

describe('Graph Builder', () => {
  it('should build a valid DOT graph', () => {
    const commits = ['commit1', 'commit2'];
    const repoPath = '/path/to/repo';

    const execSyncMock = (command) => {
      if (command.includes('git diff-tree')) {
        return Buffer.from('file1.js\nfolder/file2.js');
      }
      return Buffer.from('');
    };

    const originalExecSync = require('child_process').execSync;
    require('child_process').execSync = execSyncMock;

    const graph = buildGraph(commits, repoPath);

    assert(graph.includes('digraph G'));
    assert(graph.includes('"file1.js"'));
    assert(graph.includes('"folder" -> "folder/file2.js"'));

    require('child_process').execSync = originalExecSync; // Восстанавливаем оригинальную функцию
  });
});
