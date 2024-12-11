const { execSync } = require('child_process');
const path = require('path');

/**
 * Строит граф зависимостей в формате Graphviz.
 * @param {string[]} commits Список коммитов.
 * @param {string} repoPath Путь к репозиторию.
 * @returns {string} Граф в формате DOT.
 */
function buildGraph(commits, repoPath) {
  const nodes = new Set();
  const edges = [];

  for (const commit of commits) {
    const diffTree = execSync(`git diff-tree --no-commit-id --name-only -r ${commit}`, {
      cwd: repoPath,
    })
      .toString()
      .split('\n')
      .filter((file) => file);

    // Добавляем узлы (файлы и папки)
    diffTree.forEach((file) => {
      const folder = path.dirname(file);
      nodes.add(`"${file}"`);
      nodes.add(`"${folder}"`);
      edges.push(`"${folder}" -> "${file}"`);
    });
  }

  // Формируем граф в формате DOT
  const graph = `
    digraph G {
      rankdir=LR;
      node [shape=box];
      ${Array.from(nodes).join('\n')}
      ${edges.join('\n')}
    }
  `;

  return graph;
}

module.exports = { buildGraph };
