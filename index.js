#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { buildGraph } = require('./graphBuilder');

const args = require('yargs')
  .option('graphviz', {
    alias: 'g',
    type: 'string',
    demandOption: true,
    describe: 'Путь к программе для визуализации графов (Graphviz)',
  })
  .option('repo', {
    alias: 'r',
    type: 'string',
    demandOption: true,
    describe: 'Путь к анализируемому репозиторию',
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    demandOption: true,
    describe: 'Путь к файлу-результату',
  })
  .option('date', {
    alias: 'd',
    type: 'string',
    demandOption: true,
    describe: 'Дата коммитов для фильтрации (в формате YYYY-MM-DD)',
  })
  .help()
  .argv;

// Проверяем, существует ли репозиторий
if (!fs.existsSync(args.repo) || !fs.existsSync(path.join(args.repo, '.git'))) {
  console.error('Указанный путь не является git-репозиторием.');
  process.exit(1);
}

// Получаем информацию о коммитах
try {
  const commits = execSync(
    `git log --since="${args.date}" --pretty=format:"%H"`,
    { cwd: args.repo }
  )
    .toString()
    .split('\n')
    .filter((commit) => commit);

  if (commits.length === 0) {
    console.log('Нет коммитов, соответствующих указанной дате.');
    process.exit(0);
  }

  // Строим граф зависимостей
  const graph = buildGraph(commits, args.repo);

  // Сохраняем граф в файл
  fs.writeFileSync(args.output, graph, 'utf-8');
  console.log(`Граф зависимостей сохранен в файл: ${args.output}`);
} catch (error) {
  console.error('Ошибка при работе с git:', error.message);
  process.exit(1);
}
